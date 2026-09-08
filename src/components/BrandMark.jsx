import Link from 'next/link';

export default function BrandMark({ href = '/', compact = false, inverted = false }) {
    const textColor = inverted ? 'text-white' : 'text-[var(--spa-ink)]';
    const subColor = inverted ? 'text-white/70' : 'text-[var(--spa-blue)]';

    return (
        <Link href={href} className="group inline-flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spa-blue)] focus-visible:ring-offset-2" aria-label="SpaSmooTh — ir para o início">
            <svg aria-hidden="true" className="h-9 w-8 shrink-0" viewBox="0 0 40 46" fill="none">
                <path d="M20 3C12.2 11.2 5.5 21.3 5.5 36.5h29C34.5 21.3 27.8 11.2 20 3Z" stroke="currentColor" strokeWidth="2.2" className={inverted ? 'text-[#7ce1ef]' : 'text-[#00a7d8]'} />
                <path d="M20 3v33.5M20 3C15.5 14.2 13.5 25.4 13.5 36.5M20 3c4.5 11.2 6.5 22.4 6.5 33.5" stroke="currentColor" strokeWidth="1.4" className={inverted ? 'text-[#7ce1ef]' : 'text-[#00a7d8]'} />
            </svg>
            <span className="leading-none">
                <span className={`block font-semibold tracking-[-0.045em] ${compact ? 'text-xl' : 'text-2xl'} ${textColor}`}>Spa<span className="font-extrabold">SmooTh</span></span>
                {!compact && <span className={`mt-1 block text-[8px] font-extrabold uppercase tracking-[0.13em] ${subColor}`}>Spa, massoterapia &amp; bronzeamento</span>}
            </span>
        </Link>
    );
}
