/**
 * Constantes de negócio — Single Source of Truth.
 *
 * Centraliza valores que antes estavam duplicados em:
 *  - lib/validations/booking.ts
 *  - services/booking.ts
 *  - lib/validations/service.ts
 */

// ─── Unidades ─────────────────────────────────────────────

export const UNITS = ['Aracaju', 'Maceió', 'Recife'] as const;
export type Unit = (typeof UNITS)[number];

// ─── Status de Agendamento ────────────────────────────────

export const BOOKING_STATUSES = [
    'pendente',
    'confirmado',
    'cancelado',
    'concluido',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// ─── Status do Kanban de Leads ────────────────────────────

export const LEAD_KANBAN_STATUSES = [
    'novo',
    'agendado',
    'concluido',
    'cancelado',
] as const;
export type LeadKanbanStatus = (typeof LEAD_KANBAN_STATUSES)[number];

// ─── Categorias de Serviço ────────────────────────────────

export const SERVICE_CATEGORIES = [
    'combo',
    'day_spa',
    'estetica',
    'tantrica',
    'depilacao',
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// ─── Horários de Funcionamento ────────────────────────────

/**
 * Horário de funcionamento por dia da semana (0 = domingo).
 * `null` = dia fechado.
 */
export const BUSINESS_HOURS: Record<
    number,
    { start: number; end: number } | null
> = {
    0: null,                      // Domingo — fechado
    1: { start: 8, end: 20 },    // Segunda
    2: { start: 8, end: 20 },    // Terça
    3: { start: 8, end: 20 },    // Quarta
    4: { start: 8, end: 20 },    // Quinta
    5: { start: 8, end: 20 },    // Sexta
    6: { start: 9, end: 16 },    // Sábado
};

/** Antecedência mínima em minutos para agendamento no mesmo dia. */
export const MINIMUM_ADVANCE_MINUTES = 30;

/** Janela máxima de agendamento em dias a partir de hoje. */
export const MAX_BOOKING_DAYS_AHEAD = 60;

/** Tolerância de atraso para agendamentos (5 min) para evitar falsos positivos de horário passado. */
export const BOOKING_PAST_TOLERANCE_MS = 5 * 60 * 1000;

// ─── Mapeamentos de Status ────────────────────────────────

/** Mapeamento de status booking → status kanban de leads. */
export const BOOKING_TO_LEAD_STATUS: Record<BookingStatus, LeadKanbanStatus> = {
    pendente: 'novo',
    confirmado: 'agendado',
    concluido: 'concluido',
    cancelado: 'cancelado',
};

/** Mapeamento de status kanban → status booking. */
export const LEAD_TO_BOOKING_STATUS: Record<LeadKanbanStatus, BookingStatus> = {
    novo: 'pendente',
    agendado: 'confirmado',
    concluido: 'concluido',
    cancelado: 'cancelado',
};
