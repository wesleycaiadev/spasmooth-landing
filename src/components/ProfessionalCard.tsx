'use client';

import Image from 'next/image';
import { Camera } from 'lucide-react';

/**
 * ProfessionalCard — Card de profissional para a seção pública.
 * Mobile: card horizontal com snap-center, 80% da viewport.
 * Desktop: grid card normal.
 */
export default function ProfessionalCard({ pro, onClick, index = 0 }) {
    const galleryCount = pro.gallery.filter(u => !u.includes('ui-avatars.com')).length;
    const isPlaceholder = pro.avatar.includes('ui-avatars.com');

    return (
        <div
            className="
                group cursor-pointer bg-white overflow-hidden
                transition-all duration-300 active:scale-[0.97]
                min-w-[80%] snap-center md:min-w-0
                rounded-2xl md:rounded-3xl
                shadow-md hover:shadow-xl
                border border-slate-100 hover:border-rose-200
                hover:-translate-y-1
                opacity-0 animate-slideUp
            "
            style={{ animationFillMode: 'forwards', animationDelay: `${index * 100}ms` }}
            onClick={onClick}
        >
            <div className="relative h-56 md:h-80 w-full overflow-hidden">
                {isPlaceholder ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{
                            backgroundImage: `url("${pro.avatar}")`,
                            backgroundColor: '#e2e8f0',
                        }}
                    />
                ) : (
                    <Image
                        src={pro.avatar}
                        alt={`Foto de ${pro.name}`}
                        fill
                        sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        quality={80}
                    />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                {/* Badge de fotos */}
                {galleryCount > 1 && (
                    <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-md">
                        <Camera size={11} />
                        {galleryCount}
                    </div>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 text-white">
                    <h3 className="text-lg md:text-xl font-serif font-bold mb-0.5">{pro.name}</h3>
                    <p className="text-rose-300 font-medium text-xs tracking-wider uppercase mb-2">{pro.role}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {pro.specialties.slice(0, 2).map((spec, i) => (
                            <span
                                key={i}
                                className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/15"
                            >
                                {spec}
                            </span>
                        ))}
                        {pro.specialties.length > 2 && (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/15">
                                +{pro.specialties.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
