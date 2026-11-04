const serviceImages = {
    'combo-desacelera': '/images/treatments/combo-desacelera.webp',
    'combo-leveza': '/images/treatments/combo-leveza.webp',
    'combo-recupera': '/images/treatments/combo-recupera.webp',
    'combo-contorno-cuidado': '/images/treatments/combo-contorno-cuidado.webp',
    'mensal-modeladora-10-sessoes': '/images/treatments/mensal-modeladora.webp',
    'mensal-sueca-4-sessoes': '/images/treatments/mensal-sueca.webp',
    'bronze-gelado-lgbt': '/images/treatments/bronze-gelado-lgbt.webp',
    'bronze-gelado-masculino': '/images/treatments/bronze-gelado-masculino.webp',
    'bronze-gelado-marquinha': '/images/treatments/bronze-gelado-marquinha.webp',
    'bronze-gelado-corpo-todo': '/images/treatments/bronze-gelado-corpo-todo.webp',
    'realce-bronze-jato-superior': '/images/treatments/realce-bronze-jato-superior.webp',
    'banho-de-lua-clareador': '/images/treatments/banho-de-lua-clareador.webp',
    'descoloracao-de-pelos': '/images/treatments/descoloracao-de-pelos.webp',
    'clareamento-de-areas': '/images/treatments/clareamento-de-areas.webp',
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
    mensal: 'Combo mensal',
    combo: 'Combo de massagem',
    bronzeamento: 'Lay Bronze · Bronzeamento',
    day_spa: 'Day Spa',
    estetica: 'Estética',
    depilacao: 'Cuidados avulsos',
    tantrica: 'Terapia sensorial',
};
