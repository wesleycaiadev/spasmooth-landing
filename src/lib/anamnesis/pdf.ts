import 'server-only';

import { PDFDocument, PageSizes, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import sharp from 'sharp';
import { bodyKinds, bodyMarkColors, bodyMarkOrder, detailedFigures, legacyFigures } from './body-regions';
import { anamnesisStatuses, formatAnamnesisDate, getAnamnesisDetails, type AnamnesisReport } from './report';

type Details = NonNullable<ReturnType<typeof getAnamnesisDetails>>;

export const anamnesisPdfPrivateHeaders = {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export async function anamnesisPdfResponse(report: AnamnesisReport, details: Details, disposition: 'inline' | 'attachment') {
    const file = await createAnamnesisPdf(report, details);
    return new Response(new Uint8Array(file).buffer, {
        headers: {
            ...anamnesisPdfPrivateHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename="ficha-anamnese-spasmooth.pdf"`,
            'X-Content-Type-Options': 'nosniff',
        },
    });
}

function wrapText(text: string, font: PDFFont, size: number, width: number, charset: Set<number>) {
    const formatted = Array.from(text.normalize('NFC').replace(/\s+/g, ' ').trim(), character =>
        charset.has(character.codePointAt(0)!) ? character : '?',
    ).join('');
    const lines: string[] = [];
    let line = '';
    for (const word of formatted.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= width) {
            line = next;
            continue;
        }
        if (line) lines.push(line);
        line = '';
        for (const character of word) {
            if (font.widthOfTextAtSize(line + character, size) > width) {
                lines.push(line);
                line = '';
            }
            line += character;
        }
    }
    if (line) lines.push(line);
    return lines;
}

async function renderBodyMap(details: Details) {
    const figures = details.clinical ? detailedFigures : legacyFigures;
    const drawings = figures.map(({ regions }, index) => {
        const paths = regions.map(({ id, shape, mirror }) => {
            const marks = bodyMarkOrder.filter(kind => details.areas.some(area => area.region === id && area.kind === kind));
            const fill = marks[0] ? bodyMarkColors[marks[0]] : '#e2edf0';
            const stroke = marks[1] ? bodyMarkColors[marks[1]] : '#617e8a';
            const transform = mirror ? 'translate(130 0) scale(-1 1)' : '';
            const base = `<path d="${shape}" transform="${transform}" fill="${fill}" stroke="${stroke}" stroke-width="${marks[1] ? 3 : 1.1}"/>`;
            const overlay = marks[2]
                ? `<path d="${shape}" transform="${transform}" fill="none" stroke="${bodyMarkColors[marks[2]]}" stroke-width="2" stroke-dasharray="2 3"/>` : '';
            return base + overlay;
        }).join('');
        return `<g transform="translate(${index * 165 + 14} -10)">${paths}</g>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1104" height="606" viewBox="0 0 368 202">${drawings}</svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function createAnamnesisPdf(report: AnamnesisReport, details: Details) {
    const doc = await PDFDocument.create();
    doc.setTitle('Ficha de anamnese - SpaSmooth');
    doc.setAuthor('SpaSmooth');
    doc.setLanguage('pt-BR');
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const charset = new Set(regular.getCharacterSet());
    const ink = rgb(0.10, 0.18, 0.24);
    const teal = rgb(0.04, 0.32, 0.37);
    const muted = rgb(0.29, 0.37, 0.43);
    const border = rgb(0.80, 0.87, 0.89);
    const [width, height] = PageSizes.A4;
    const margin = 46;
    const contentWidth = width - margin * 2;
    let page = doc.addPage(PageSizes.A4);
    let y: number;

    function pageHeading(first: boolean) {
        page.drawRectangle({ x: 0, y: height - 9, width, height: 9, color: teal });
        page.drawText('SpaSmooth', { x: margin, y: height - 42, size: 12, font: bold, color: teal });
        page.drawText('Ficha de anamnese', { x: margin, y: height - 69, size: first ? 23 : 16, font: bold, color: ink });
        y = height - 95;
    }

    function reserve(space: number) {
        if (y - space >= 52) return;
        page = doc.addPage(PageSizes.A4);
        pageHeading(false);
    }

    function heading(title: string, firstBlock = 25) {
        reserve(28 + firstBlock);
        page.drawText(title, { x: margin, y, font: bold, size: 13, color: teal });
        y -= 10;
        page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, color: border, thickness: 0.6 });
        y -= 17;
    }

    function paragraph(text: string, font = regular, size = 10.5, color = ink, gap = 4) {
        const lines = wrapText(text, font, size, contentWidth, charset);
        const leading = size + 3;
        reserve(lines.length * leading + gap);
        for (const line of lines) {
            page.drawText(line, { x: margin, y, font, size, color });
            y -= leading;
        }
        y -= gap;
    }

    pageHeading(true);
    heading('Agendamento e revisão');
    paragraph(`Cliente · ${report.client_name}`);
    paragraph(`Serviço · ${report.service_name ?? 'Indisponível'}`);
    paragraph(`Profissional · ${report.professional_name ?? 'Indisponível'}`);
    paragraph(`Data e unidade · ${formatAnamnesisDate(report.starts_at)} · ${report.unit}`);
    paragraph(`Estado da ficha · ${anamnesisStatuses[report.status]}`, bold);
    if (report.submitted_at) paragraph(`Preenchimento · ${formatAnamnesisDate(report.submitted_at)}`);
    if (report.reviewed_at) paragraph(`Revisão · ${formatAnamnesisDate(report.reviewed_at)} · ${report.reviewed_by}`);
    y -= 8;

    if (details.alerts.length) {
        heading('Pontos para avaliação profissional');
        for (const alert of details.alerts) paragraph(`• ${alert}`);
        y -= 8;
    }
    if (details.goals.length) {
        heading('Objetivos');
        for (const goal of details.goals) paragraph(`• ${goal}`);
        y -= 8;
    }
    if (details.regions.length) {
        heading('Mapa corporal', 195);
        const image = await doc.embedPng(await renderBodyMap(details));
        const map = image.scaleToFit(300, 145);
        const x = (width - map.width) / 2;
        page.drawText('Frente', { x: x + map.width * 0.215 - bold.widthOfTextAtSize('Frente', 10) / 2, y, size: 10, font: bold, color: ink });
        page.drawText('Costas', { x: x + map.width * 0.663 - bold.widthOfTextAtSize('Costas', 10) / 2, y, size: 10, font: bold, color: ink });
        y -= map.height + 5;
        page.drawImage(image, { x, y, ...map });
        y -= 10;
        let legendX = margin;
        for (const kind of bodyMarkOrder) {
            const hex = bodyMarkColors[kind];
            const swatch = rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
            page.drawRectangle({ x: legendX, y: y - 1, width: 7, height: 7, color: swatch });
            page.drawText(bodyKinds[kind], { x: legendX + 12, y, font: regular, size: 9, color: ink });
            legendX += bold.widthOfTextAtSize(bodyKinds[kind], 9) + 24;
        }
        y -= 19;
        for (const kind of bodyMarkOrder) {
            const row = details.regions.filter(region => region.kind === kind);
            if (!row.length) continue;
            for (const { label } of row) paragraph(`• ${label}`);
        }
        y -= 8;
    }
    if (details.answers.length) {
        heading('Respostas');
        for (const { label, value } of details.answers) {
            reserve(44);
            paragraph(label, bold, 10.5, ink, 1);
            paragraph(value);
        }
        y -= 8;
    }
    if (details.clinical) {
        paragraph('A avaliação de edema e cacifo, quando pertinente, é presencial e cabe à profissional habilitada.', regular, 9, muted);
    }
    paragraph(`Consentimento registrado no preenchimento · Aviso ${details.privacyVersion} · Questionário ${report.questionnaire_version}`, regular, 9, muted);

    const pages = doc.getPages();
    pages.forEach((current, index) => {
        current.drawLine({ start: { x: margin, y: 40 }, end: { x: width - margin, y: 40 }, color: border, thickness: 0.6 });
        current.drawText('Confidencial · Dados de saúde', { x: margin, y: 24, color: muted, size: 8.5, font: bold });
        const number = `${index + 1} / ${pages.length}`;
        current.drawText(number, { x: width - margin - regular.widthOfTextAtSize(number, 8.5), y: 24, color: muted, size: 8.5, font: regular });
    });
    return doc.save();
}
