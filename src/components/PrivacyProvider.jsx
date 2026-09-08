"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { BarChart3, Cookie, Map, Settings2, ShieldCheck, X } from 'lucide-react';
import BrandMark from './BrandMark';

const Context = createContext({ maps: false });
const KEY = 'spa_privacy_v1';
export const usePrivacy = () => useContext(Context);

export default function PrivacyProvider({ children }) {
    const [choice, setChoice] = useState(null);
    const [open, setOpen] = useState(false);
    const [view, setView] = useState('notice');
    const [analytics, setAnalytics] = useState(false);
    const [maps, setMaps] = useState(false);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (saved?.version === 1 && saved.expires > Date.now() && typeof saved.analytics === 'boolean' && typeof saved.maps === 'boolean') {
                setChoice(saved); setAnalytics(saved.analytics); setMaps(saved.maps); return;
            }
        } catch { /* Optional storage may be unavailable. */ }
        setOpen(true);
    }, []);

    useEffect(() => {
        const handleOpen = () => openPreferences();
        window.addEventListener('spa:open-privacy', handleOpen);
        return () => window.removeEventListener('spa:open-privacy', handleOpen);
    }, []);

    function openPreferences() { setView('preferences'); setOpen(true); }
    function save(next) {
        const saved = { ...next, version: 1, expires: Date.now() + 180 * 86400000 };
        const revoked = choice?.analytics && !next.analytics;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* Choice applies during this session. */ }
        if (revoked) {
            if (process.env.NEXT_PUBLIC_GA_ID) window[`ga-disable-${process.env.NEXT_PUBLIC_GA_ID}`] = true;
            document.cookie.split(';').forEach((value) => {
                const name = value.split('=')[0].trim();
                if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') document.cookie = `${name}=; Max-Age=0; path=/`;
            });
        }
        setChoice(saved); setAnalytics(next.analytics); setMaps(next.maps); setOpen(false); setView('notice');
        if (revoked) window.location.reload();
    }

    return <Context.Provider value={{ maps: choice?.maps === true }}>
        {children}
        {choice?.analytics === true && process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <button type="button" className="fixed bottom-3 left-3 z-[70] rounded-full border border-[var(--spa-line)] bg-white px-3 py-2 text-xs font-extrabold text-[var(--spa-ink)] shadow-lg transition hover:bg-[var(--spa-sky)]" onClick={openPreferences}><Cookie size={14} className="mr-1 inline" aria-hidden="true" /> Privacidade e cookies</button>
        {open && <div className="fixed inset-0 z-[100] flex items-end bg-[rgb(6_59_100_/_0.35)] p-3 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation">
            <section role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
                <div className="border-b border-[var(--spa-line)] px-6 py-5"><div className="flex items-start justify-between gap-3"><div><BrandMark compact /><div className="mt-4 flex gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--spa-sky)] text-[var(--spa-blue)]"><Cookie size={20} aria-hidden="true" /></div><div><p className="spa-eyebrow">Sua escolha</p><h2 id="privacy-title" className="spa-display mt-1 text-2xl text-[var(--spa-ink)]">{view === 'preferences' ? 'Preferências de cookies' : 'Seu bem-estar também é digital.'}</h2></div></div></div><button type="button" aria-label="Fechar preferências" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"><X size={20} aria-hidden="true" /></button></div></div>
                {view === 'notice' ? <div className="p-6"><p className="max-w-xl text-sm leading-relaxed text-slate-600">Usamos recursos essenciais para o funcionamento do site. Estatísticas de navegação e mapas do Google só são carregados se você autorizar. Você pode revisar essa decisão quando quiser.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Feature icon={<ShieldCheck />} title="Essenciais" text="Sempre ativos" /><Feature icon={<BarChart3 />} title="Estatísticas" text="Opcional" /><Feature icon={<Map />} title="Mapas" text="Opcional" /></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={openPreferences} className="spa-button-secondary text-xs"><Settings2 size={15} aria-hidden="true" /> Personalizar</button><button type="button" onClick={() => save({ analytics: false, maps: false })} className="spa-button-secondary text-xs">Somente essenciais</button><button type="button" onClick={() => save({ analytics: true, maps: true })} className="spa-button-primary text-xs">Aceitar todos</button></div></div> : <div className="p-6"><p className="text-sm leading-relaxed text-slate-600">Escolha quais recursos opcionais deseja permitir. Os essenciais não podem ser desativados.</p><div className="mt-5 space-y-3"><Preference icon={<ShieldCheck />} title="Essenciais" description="Preferências, segurança e funcionamento do site." checked disabled /><Preference icon={<BarChart3 />} title="Estatísticas de navegação" description="Ajuda a entender o uso do site sem alterar seu atendimento." checked={analytics} onChange={setAnalytics} /><Preference icon={<Map />} title="Mapas do Google" description="Permite carregar os mapas integrados das unidades." checked={maps} onChange={setMaps} /></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => save({ analytics: false, maps: false })} className="spa-button-secondary text-xs">Somente essenciais</button><button type="button" onClick={() => save({ analytics, maps })} className="spa-button-primary text-xs">Salvar preferências</button></div></div>}
            </section>
        </div>}
    </Context.Provider>;
}

function Feature({ icon, title, text }) { return <div className="rounded-2xl border border-[var(--spa-line)] bg-[var(--spa-mist)] p-3"><div className="mb-2 text-[var(--spa-blue)]">{icon}</div><p className="text-xs font-extrabold text-[var(--spa-ink)]">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>; }
function Preference({ icon, title, description, checked, onChange, disabled = false }) { return <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--spa-line)] p-4"><span className="text-[var(--spa-blue)]">{icon}</span><span className="flex-1"><span className="block text-sm font-extrabold text-[var(--spa-ink)]">{title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span></span><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} className="h-5 w-5 accent-[var(--spa-blue)]" /></label>; }
