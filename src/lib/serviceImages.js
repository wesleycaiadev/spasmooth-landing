const serviceImages = {
    'day-spa-standard': '/images/treatments/day-spa-standard.webp',
    'drenagem-linfatica': '/images/treatments/drenagem-linfatica.webp',
    'massagem-desportiva': '/images/treatments/massagem-desportiva.webp',
    'spa-dos-pes': '/images/treatments/spa-dos-pes.webp',
    'relaxante-bambu': '/images/treatments/relaxante-bambu.webp',
    'relaxante-pedras': '/images/treatments/pedras-quentes.webp',
    'relaxante-ventosa': '/images/treatments/relaxante-ventosa.webp',
    'bambu-ventosa-pedras-quentes': '/images/treatments/bambu-ventosa-pedras-quentes.webp',
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
