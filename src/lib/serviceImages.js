const serviceImages = {
    'day-spa-standard': '/images/treatments/day-spa-standard.webp',
    'drenagem-linfatica': '/images/treatments/drenagem-linfatica.webp',
    'massagem-desportiva': '/images/treatments/massagem-desportiva.webp',
    'spa-dos-pes': '/images/treatments/spa-dos-pes.webp',
    'relaxante-bambu': '/images/treatments/relaxante-bambu.webp',
    'relaxante-pedras': '/images/treatments/pedras-quentes.webp',
    'relaxante-ventosa': '/images/treatments/relaxante-ventosa.webp',
    'bambu-ventosa-pedras-quentes': '/images/treatments/bambu-ventosa-pedras-quentes.webp',
    'depilacao-abdomen': '/images/treatments/depilacao-abdomen.webp',
    'depilacao-bracos': '/images/treatments/depilacao-bracos.webp',
    'depilacao-corpo-todo': '/images/treatments/depilacao-corpo-todo.webp',
    'depilacao-costas': '/images/treatments/depilacao-costas.webp',
    'depilacao-intima': '/images/treatments/depilacao-intima.webp',
    'depilacao-meia-perna': '/images/treatments/depilacao-meia-perna.webp',
    'depilacao-perna-completa': '/images/treatments/depilacao-perna-completa.webp',
    'massagem-nuru': '/images/treatments/massagem-nuru.webp',
    'sessao-tantrica': '/images/treatments/sessao-tantrica.webp',
    'tailandesa': '/images/treatments/massagem-tailandesa.webp',
    'vivencia': '/images/treatments/vivencia-sensorial.webp',
};

export function getServiceImage(slug) {
    return serviceImages[slug] || null;
}

export const categoryLabels = {
    combo: 'Combo de massagem',
    day_spa: 'Day Spa',
    estetica: 'Estética',
    depilacao: 'Cuidados avulsos',
    tantrica: 'Terapia sensorial',
};
