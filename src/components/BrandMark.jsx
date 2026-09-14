import Image from 'next/image';
import Link from 'next/link';

export default function BrandMark({ href = '/', compact = false, inverted = false }) {
    const textColor = inverted ? 'text-white' : 'text-[var(--spa-ink)]';
    const subColor = inverted ? 'text-white/70' : 'text-[var(--spa-blue)]';

    return (
        <Link href={href} className="group inline-flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spa-blue)] focus-visible:ring-offset-2" aria-label="SpaSmooTh — ir para o início">
            <span className={`grid shrink-0 place-items-center overflow-hidden ${inverted ? 'rounded-lg bg-white p-1' : ''}`}>
                <Image src="/assets/spasmooth-lotus-v2.webp" alt="" width={720} height={489} priority className={`${compact ? 'h-8 w-12' : 'h-10 w-[3.7rem]'} object-contain`} />
            </span>
            <span className="leading-none">
                <span className={`block font-semibold tracking-[-0.045em] ${compact ? 'text-xl' : 'text-2xl'} ${textColor}`}>Spa<span className="font-extrabold">SmooTh</span></span>
                {!compact && <span className={`mt-1 block text-[8px] font-extrabold uppercase tracking-[0.13em] ${subColor}`}>Spa, massoterapia &amp; bronzeamento</span>}
            </span>
        </Link>
    );
}
