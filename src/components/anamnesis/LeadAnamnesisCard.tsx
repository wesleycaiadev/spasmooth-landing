'use client';

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { anamnesisStatuses } from '@/lib/anamnesis/report';
import { getAdminAnamnesisSummary } from '@/services/admin/anamnesis';

type Summary = Awaited<ReturnType<typeof getAdminAnamnesisSummary>>;

export default function LeadAnamnesisCard({ id }: { id: string }) {
    const [summary, setSummary] = useState<Summary>();

    useEffect(() => {
        let active = true;
        getAdminAnamnesisSummary(id).then(result => {
            if (active) setSummary(result);
        }).catch(() => {
            if (active) setSummary({ kind: 'unavailable' });
        });
        return () => { active = false; };
    }, [id]);

    const href = `/admin/bookings/anamnese/${id}`;
    const status = summary?.kind === 'available' ? anamnesisStatuses[summary.status]
        : summary?.kind === 'restricted' ? 'Acesso das profissionais autorizadas'
            : summary?.kind === 'missing' ? 'Sem ficha vinculada a este lead'
                : summary?.kind === 'unavailable' ? 'Ficha indisponível no momento' : 'Consultando ficha…';

    return (
        <section aria-label="Anamnese" className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
            <h3 className="flex items-center gap-2 font-bold text-cyan-950"><FileText size={17} aria-hidden="true" /> Anamnese</h3>
            <p aria-live="polite" className="mt-1.5 text-sm text-slate-700">{status}</p>
            {summary?.kind === 'available' && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <a href={href} className="inline-flex min-h-10 items-center rounded-lg bg-cyan-900 px-3 text-sm font-semibold text-white hover:bg-cyan-800">
                        Abrir ficha
                    </a>
                    {summary.hasSubmission && (
                        <a href={`${href}/pdf`} download className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-950 hover:bg-cyan-100">
                            <Download size={16} aria-hidden="true" /> Baixar PDF
                        </a>
                    )}
                </div>
            )}
        </section>
    );
}
