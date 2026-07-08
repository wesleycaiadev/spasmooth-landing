/**
 * Tipos de domínio — Single Source of Truth.
 *
 * Espelham o schema do banco (sql/001_booking_tables.sql e Professional table).
 * Antes estavam redefinidos 3x em services/ com shapes diferentes.
 *
 * Regra: qualquer dado que vem do Supabase deve ser tipado com estes tipos.
 */

import type { Unit, BookingStatus, ServiceCategory, LeadKanbanStatus } from '@/lib/constants';

// ─── Professional ─────────────────────────────────────────

export type Professional = {
    id: string;
    name: string;
    specialties: string[];
    photo_url: string | null;
    gallery_urls: string[];
    location: Unit;
    location_start_date: string | null;
    location_end_date: string | null;
    active: boolean;
    created_at: string;
    bio?: string;
    role?: string;
};

export type ProfessionalInput = Omit<Professional, 'id' | 'active' | 'created_at'>;

// ─── Service ──────────────────────────────────────────────

export type Service = {
    id: string;
    name: string;
    category: ServiceCategory;
    price: number;
    duration_minutes: number;
    description: string;
    active: boolean;
    created_at: string;
};

export type ServiceInput = Omit<Service, 'id' | 'active' | 'created_at'>;

// ─── Booking ──────────────────────────────────────────────

export type Booking = {
    id: string;
    created_at: string;
    unit: Unit;
    professional_id: string;
    service_id: string;
    client_name: string;
    client_phone: string;
    starts_at: string;
    ends_at: string;
    status: BookingStatus;
    notes: string;
};

/** Booking com joins de professionals e services (para listagens admin). */
export type BookingWithRelations = Booking & {
    professionals: Pick<Professional, 'name' | 'location'> | null;
    services: Pick<Service, 'name' | 'duration_minutes' | 'price'> | null;
};

// ─── Lead ─────────────────────────────────────────────────

export type Lead = {
    id: string;
    nome: string;
    whatsapp: string;
    email: string | null;
    service_name: string | null;
    professional_id: string | null;
    appointment_date: string | null;
    appointment_time: string | null;
    mensagem_interesse: string | null;
    status_kanban: LeadKanbanStatus;
    admin_notes: string | null;
    created_at: string;
    professionals?: Pick<Professional, 'name'> | null;
};

export type LeadInput = Omit<Lead, 'id' | 'created_at' | 'professionals'>;

// ─── Professional Schedule ────────────────────────────────

export type ProfessionalSchedule = {
    id: string;
    professional_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_day_off: boolean;
};

export type ScheduleInput = Omit<ProfessionalSchedule, 'id'>;

// ─── Dashboard ────────────────────────────────────────────

export type DashboardLeadMetric = {
    created_at: string;
    appointment_date: string | null;
    status_kanban: LeadKanbanStatus;
};

// ─── Normalização de Professional (lib/professionals.ts) ──

export type NormalizedProfessional = Professional & {
    avatar: string;
    gallery: string[];
    bio: string;
    role: string;
    specialties: string[];
};
