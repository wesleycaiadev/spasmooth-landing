import type { Unit, BookingStatus, ServiceCategory, LeadKanbanStatus } from '@/lib/constants';

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

export type Service = {
    id: string;
    name: string;
    category: ServiceCategory;
    price: number;
    duration_minutes: number;
    description: string;
    active: boolean;
    created_at: string;
    discount_percent?: number | null;
    discount_active?: boolean | null;
};

export type ServiceInput = Omit<Service, 'id' | 'active' | 'created_at'>;

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

export type BookingWithRelations = Booking & {
    professionals: Pick<Professional, 'name' | 'location'> | null;
    services: Pick<Service, 'name' | 'duration_minutes' | 'price'> | null;
};

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

export type ActionResult = {
    success: boolean;
    error?: string;
};
