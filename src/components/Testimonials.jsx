import { Instagram } from 'lucide-react';

export default function Testimonials() {
    return <section id="depoimentos" className="bg-[var(--spa-cream)] py-14 md:py-18">
        <div className="spa-shell border-y border-[var(--spa-line)] py-10 text-center">
            <p className="spa-eyebrow">Depoimentos</p>
            <h2 className="spa-display mx-auto mt-3 max-w-xl text-3xl text-[var(--spa-ink)] md:text-4xl">Acompanhe as experiências compartilhadas pelo SpaSmooTh.</h2>
            <a href="https://www.instagram.com/spa_smooth/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[var(--spa-blue)] hover:text-[var(--spa-ink)]"><Instagram size={17} aria-hidden="true" /> Ver no Instagram</a>
        </div>
    </section>;
}
