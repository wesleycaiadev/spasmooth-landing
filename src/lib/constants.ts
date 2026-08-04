export const UNITS = ['Aracaju', 'Maceió', 'Recife'] as const;
export type Unit = (typeof UNITS)[number];

export const BOOKING_STATUSES = [
    'pendente',
    'confirmado',
    'cancelado',
    'concluido',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const LEAD_KANBAN_STATUSES = [
    'novo',
    'agendado',
    'concluido',
    'cancelado',
] as const;
export type LeadKanbanStatus = (typeof LEAD_KANBAN_STATUSES)[number];

export const SERVICE_CATEGORIES = [
    'combo',
    'day_spa',
    'estetica',
    'tantrica',
    'depilacao',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const BUSINESS_HOURS: Record<
    number,
    { start: number; end: number } | null
> = {
    0: null,
    1: { start: 8, end: 20 },
    2: { start: 8, end: 20 },
    3: { start: 8, end: 20 },
    4: { start: 8, end: 20 },
    5: { start: 8, end: 20 },
    6: { start: 9, end: 16 },
};

export const MINIMUM_ADVANCE_MINUTES = 30;
export const MAX_BOOKING_DAYS_AHEAD = 60;
export const BOOKING_PAST_TOLERANCE_MS = 5 * 60 * 1000;

export const BOOKING_TO_LEAD_STATUS: Record<BookingStatus, LeadKanbanStatus> = {
    pendente: 'novo',
    confirmado: 'agendado',
    concluido: 'concluido',
    cancelado: 'cancelado',
};

export const LEAD_TO_BOOKING_STATUS: Record<LeadKanbanStatus, BookingStatus> = {
    novo: 'pendente',
    agendado: 'confirmado',
    concluido: 'concluido',
    cancelado: 'cancelado',
};
