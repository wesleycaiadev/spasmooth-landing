'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewAdminAnamnesis } from '@/services/admin/anamnesis';

export default function ReviewButton({ id }: { id: string }) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(false);

    async function review() {
        setPending(true);
        setError(false);
        try {
            if (await reviewAdminAnamnesis(id)) {
                router.refresh();
                return;
            }
        } catch {
            // Display the same response for a failed request or transition.
        }
        setError(true);
        setPending(false);
    }

    return (
        <div className="space-y-2">
            <button type="button" onClick={review} disabled={pending} className="spa-button-primary disabled:opacity-60">
                {pending ? 'Registrando…' : 'Registrar revisão'}
            </button>
            {error && <p role="alert" className="text-sm text-red-800">Não foi possível registrar a revisão. Atualize a página e tente novamente.</p>}
        </div>
    );
}
