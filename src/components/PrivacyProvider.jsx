"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
const Context = createContext({ maps: false });
const KEY = 'spa_privacy_v1';
export const usePrivacy = () => useContext(Context);
export default function PrivacyProvider({ children }) {
    const [choice, setChoice] = useState(null);
    const [open, setOpen] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [maps, setMaps] = useState(false);
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (saved?.version === 1 && saved.expires > Date.now() && typeof saved.analytics === 'boolean' && typeof saved.maps === 'boolean') {
                setChoice(saved); setAnalytics(saved.analytics); setMaps(saved.maps); return;
            }
        } catch { /* Storage may be unavailable. Optional tracking remains off. */ }
        setOpen(true);
    }, []);
    function save(next) {
        const saved = { ...next, version: 1, expires: Date.now() + 180 * 86400000 };
        const revoked = choice?.analytics && !next.analytics;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* Choice still applies to this page. */ }
        if (revoked) {
            if (process.env.NEXT_PUBLIC_GA_ID) window[`ga-disable-${process.env.NEXT_PUBLIC_GA_ID}`] = true;
            document.cookie.split(';').forEach(value => {
                const name = value.split('=')[0].trim();
                if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
                    document.cookie = `${name}=; Max-Age=0; path=/`;
                    const labels = location.hostname.split('.');
                    for (let i=0; i<labels.length-1; i++) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${labels.slice(i).join('.')}`;
                }
            });
        }
        setChoice(saved); setAnalytics(next.analytics); setMaps(next.maps); setOpen(false);
        if (revoked) window.location.reload();
    }
    return <Context.Provider value={{ maps: choice?.maps === true }}>
        {children}
        {choice?.analytics === true && process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <button className="fixed bottom-2 left-2 z-[70] bg-white border rounded px-3 py-2 text-xs text-slate-700 shadow" onClick={() => setOpen(true)}>Privacidade e cookies</button>
        {open && <section role="dialog" aria-modal="false" aria-labelledby="privacy-title" className="fixed bottom-0 inset-x-0 z-[100] bg-white border-t shadow-2xl p-5 text-slate-800">
            <div className="max-w-4xl mx-auto space-y-3">
                <h2 id="privacy-title" className="font-bold text-lg">Sua privacidade</h2>
                <p className="text-sm">Usamos recursos necessários para suas preferências e segurança. Estatísticas de navegação e mapas do Google só serão carregados com sua autorização. Você pode mudar sua escolha a qualquer momento. <a href="/privacidade" className="underline">Ler aviso de privacidade</a>.</p>
                <div className="flex gap-5 flex-wrap text-sm">
                    <label><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Estatísticas de navegação</label>
                    <label><input type="checkbox" checked={maps} onChange={e => setMaps(e.target.checked)} /> Mapas do Google</label>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button className="border border-slate-600 rounded px-4 py-2" onClick={() => save({ analytics: false, maps: false })}>Rejeitar opcionais</button>
                    <button className="border border-slate-600 rounded px-4 py-2" onClick={() => save({ analytics, maps })}>Salvar escolhas</button>
                    <button className="border border-slate-600 rounded px-4 py-2" onClick={() => save({ analytics: true, maps: true })}>Aceitar opcionais</button>
                </div>
            </div>
        </section>}
    </Context.Provider>;
}
