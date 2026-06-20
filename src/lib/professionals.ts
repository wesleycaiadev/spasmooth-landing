/**
 * Utilitários de normalização de dados de profissionais.
 * 
 * Centraliza toda a lógica de:
 *  - Normalização de URLs com caracteres problemáticos (ex: "day (1)")
 *  - Filtragem de URLs inválidas (ui-avatars, /assets/pros/)
 *  - Merge com dados de fallback (lib/data.js)
 *  - Construção de avatar + gallery finais
 *
 * Motivo: essa lógica estava duplicada 3x (admin page, ProfessionalsSection, booking).
 */

import { PROFESSIONALS as FALLBACK_PROS } from '@/lib/data';

// ─── Tipos ────────────────────────────────────────────────

export type RawProfessional = {
    id: string;
    name: string;
    specialties?: string[];
    photo_url?: string | null;
    gallery_urls?: string[];
    location?: string;
    location_start_date?: string | null;
    location_end_date?: string | null;
    active?: boolean;
    created_at?: string;
    bio?: string;
    role?: string;
};

export type NormalizedProfessional = RawProfessional & {
    avatar: string;
    gallery: string[];
    bio: string;
    role: string;
    specialties: string[];
};

type FallbackEntry = {
    name: string;
    avatar?: string;
    gallery?: string[];
    bio?: string;
    role?: string;
    specialties?: string[];
};

// ─── Helpers ──────────────────────────────────────────────

/** Corrige URLs com parênteses no nome (ex: "day (1).jpeg" → "day-1.jpeg") */
export function normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (typeof url === 'string' && url.includes('day (')) {
        return url.replace(/\s*\((\d+)\)/g, '-$1');
    }
    return url;
}

/** Verifica se a URL é um placeholder genérico que deve ser ignorado */
function isPlaceholderUrl(url: string | null | undefined): boolean {
    if (!url) return true;
    return url.includes('ui-avatars.com') || url.includes('/assets/pros/');
}

/** Gera URL de avatar placeholder via ui-avatars.com */
export function buildAvatarPlaceholder(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=475569&size=400&bold=true`;
}

/** Encontra dados de fallback pelo nome do profissional */
function findFallback(name: string): FallbackEntry | undefined {
    return (FALLBACK_PROS as FallbackEntry[]).find(
        (old) => old.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
}

// ─── Normalização Principal ───────────────────────────────

/**
 * Normaliza os dados de um profissional vindo do banco.
 * 
 * Resolve: URLs com caracteres especiais, merge com fallback,
 * filtragem de placeholders, e constrói `avatar` + `gallery` finais.
 */
export function normalizeProfessional(pro: RawProfessional): NormalizedProfessional {
    const fallback = findFallback(pro.name);

    // 1. Normalizar gallery_urls do banco, remover placeholders
    const dbGallery = (pro.gallery_urls || [])
        .map(normalizeUrl)
        .filter((url): url is string => !!url && !isPlaceholderUrl(url));

    // 2. Resolver photo_url principal
    let photoUrl = dbGallery[0]
        || fallback?.avatar
        || normalizeUrl(pro.photo_url)
        || null;

    if (photoUrl && isPlaceholderUrl(photoUrl)) {
        photoUrl = null;
    }

    if (!photoUrl && fallback?.avatar) {
        photoUrl = fallback.avatar;
    }

    // 3. Construir gallery final
    let finalGallery: string[] = [];

    if (dbGallery.length > 0) {
        finalGallery = [...dbGallery];
    } else if (fallback?.gallery && fallback.gallery.length > 0) {
        finalGallery = [...fallback.gallery];
    }

    // Garantir que o avatar está na gallery
    if (photoUrl && !finalGallery.includes(photoUrl)) {
        finalGallery.unshift(photoUrl);
    }

    // 4. Placeholder final se nenhuma foto encontrada
    const avatar = photoUrl || buildAvatarPlaceholder(pro.name);

    if (finalGallery.length === 0) {
        finalGallery = [avatar];
    }

    return {
        ...pro,
        specialties: pro.specialties || fallback?.specialties || [],
        avatar,
        gallery: finalGallery,
        bio: pro.bio || fallback?.bio || 'Especialista dedicada a proporcionar a melhor experiência de bem-estar.',
        role: pro.role || fallback?.role || 'Terapeuta',
    };
}

/**
 * Normaliza um array de profissionais para uso no admin.
 * Retorna apenas gallery_urls limpo (sem fallback de gallery do data.js — 
 * o admin precisa saber o que está realmente no banco).
 */
export function normalizeProfessionalForAdmin(pro: RawProfessional) {
    const fallback = findFallback(pro.name);

    const dbGallery = (pro.gallery_urls || [])
        .map(normalizeUrl)
        .filter((url): url is string => !!url && !isPlaceholderUrl(url));

    let photoUrl = dbGallery[0]
        || fallback?.avatar
        || normalizeUrl(pro.photo_url)
        || null;

    if (photoUrl && isPlaceholderUrl(photoUrl)) {
        photoUrl = null;
    }

    if (!photoUrl && fallback?.avatar) {
        photoUrl = fallback.avatar;
    }

    return {
        ...pro,
        photo_url: photoUrl,
        gallery_urls: dbGallery.length > 0 ? dbGallery : (fallback?.gallery || []),
    };
}
