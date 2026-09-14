export type LayoutSection = {
    id: string;
    label: string;
    visible: boolean;
};

export const DEFAULT_LAYOUT: LayoutSection[] = [
    { id: 'hero', label: 'Banner Principal', visible: true },
    { id: 'services', label: 'Serviços', visible: true },
    { id: 'professionals', label: 'Profissionais', visible: true },
    { id: 'location', label: 'Localização', visible: true },
    { id: 'testimonials', label: 'Depoimentos', visible: true },
    { id: 'faq', label: 'Dúvidas Frequentes', visible: true }
];
