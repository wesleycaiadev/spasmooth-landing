'use client';

import Image from 'next/image';
import { Camera } from 'lucide-react';

/**
 * ProfessionalCard — Card de profissional para a seção pública.
 *
 * Props:
 *  - pro: NormalizedProfessional (com avatar, gallery, role, specialties)
 *  - onClick: () => void
 *  - index: number (para stagger de animação)
 */
export default function ProfessionalCard({ pro, onClick, index = 0 }) {
    const galleryCount = pro.gallery.filter(u => !u.includes('ui-avatars.com')).length;
    const isPlaceholder = pro.avatar.includes('ui-avatars.com');

    return (
        <div
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-rose-200 transition-all duration-500 transform hover:-translate-y-2 opacity-0 animate-slideUp"
            style={{ animationFillMode: 'forwards', animationDelay: `${index * 120}ms` }}
            onClick={onClick}
        >
            <div className="relative h-96 w-full overflow-hidden">
                {isPlaceholder ? (
                    /* Placeholder sem Next/Image (URL externa dinâmica) */
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        quality={80}
                    />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                {/* Badge de fotos */}
                {galleryCount > 1 && (
                    <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                        <Camera size={12} />
                        {galleryCount}
                    </div>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-serif font-bold mb-1">{pro.name}</h3>
                    <p className="text-rose-300 font-medium text-sm tracking-wider uppercase mb-3">{pro.role}</p>
                    <div className="flex flex-wrap gap-2">
                        {pro.specialties.slice(0, 2).map((spec, i) => (
                            <span
                                key={i}
                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20"
                            >
                                {spec}
                            </span>
                        ))}
                        {pro.specialties.length > 2 && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                                +{pro.specialties.length - 2}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
