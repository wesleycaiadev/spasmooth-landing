"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function ProfessionalSelector({
    professionals = [],
    selectedId,
    onSelect,
    isLoading = false,
}) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border-2 border-transparent overflow-hidden animate-pulse">
                        <div className="aspect-square bg-slate-100" />
                        <div className="p-2 bg-white">
                            <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto mb-1" />
                            <div className="h-3 bg-slate-50 rounded w-4/5 mx-auto" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (professionals.length === 0) {
        return (
            <div className="text-center py-10 text-slate-400 text-sm">
                Nenhuma profissional disponível nesta unidade no momento.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {professionals.map((pro) => (
                <button
                    key={pro.id}
                    type="button"
                    onClick={() => onSelect(pro)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all text-left ${
                        selectedId === pro.id
                            ? "border-cyan-500 shadow-lg ring-2 ring-cyan-500/20"
                            : "border-transparent hover:border-cyan-200"
                    }`}
                >
                    <div className="aspect-square relative flex items-center justify-center bg-slate-100">
                        {pro.photo_url ? (
                            <Image
                                src={pro.photo_url}
                                alt={pro.name}
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="object-cover object-top"
                            />
                        ) : (
                            <span className="text-slate-300 text-xs">Sem foto</span>
                        )}
                        {selectedId === pro.id && (
                            <div className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center">
                                <CheckCircle className="text-white w-10 h-10 drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                    <div className="p-2 text-center bg-white">
                        <p className="font-bold text-sm text-[#4a4a4a]">{pro.name}</p>
                        <p className="text-[10px] text-[#999] truncate">
                            {pro.specialties?.join(", ")}
                        </p>
                        {(pro.location_start_date || pro.location_end_date) && (
                            <p className="text-[9px] text-cyan-600 font-medium mt-1 bg-cyan-50 rounded-full inline-block px-2 py-0.5 border border-cyan-100/50">
                                {pro.location_start_date
                                    ? new Date(pro.location_start_date + "T12:00:00")
                                          .toLocaleDateString("pt-BR")
                                          .slice(0, 5)
                                    : "..."}{" "}
                                -{" "}
                                {pro.location_end_date
                                    ? new Date(pro.location_end_date + "T12:00:00")
                                          .toLocaleDateString("pt-BR")
                                          .slice(0, 5)
                                    : "..."}
                            </p>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
