'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewAdminAnamnesis } from '@/services/admin/anamnesis';

export default function ReviewButton({ id }: { id: string }) {
    const router = useRouter();
    const [state, setState] = useState<'idle' | 'pending' | 'saved' | 'error'>('idle');

    async function review() {
        if (state === 'pending' || state === 'saved') return;
        setState('pending');
        const saved = await reviewAdminAnamnesis(id).catch(() => false);
        setState(saved ? 'saved' : 'error');
        if (saved) router.refresh();
    }

    if (state === 'saved') return <p role="status" className="text-sm font-semibold text-emerald-800">Revisão registrada.</p>;

    return (
        <div className="space-y-2">
            <button type="button" onClick={review} disabled={state === 'pending'} className="spa-button-primary disabled:opacity-60">
                {state === 'pending' ? 'Registrando…' : 'Registrar revisão'}
            </button>
            {state === 'error' && <p role="alert" className="text-sm text-red-800">Não foi possível registrar a revisão. Atualize a página e tente novamente.</p>}
        </div>
    );
}
