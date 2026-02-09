"use client";
import React from "react";
import Image from "next/image";

export default function AmbienceSection() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Nosso Espaço
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Um refúgio de tranquilidade projetado para o seu relaxamento profundo.
            Conheça nosso ambiente preparado especialmente para você.
          </p>
        </div>

        {/* Container da Imagem */}
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
          {/* Overlay suave para dar profundidade e contraste se necessário */}
          <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0 z-10" />
          
          {/* A imagem deve ser salva em public/images/ambiente.jpg */}
          <Image
            src="/images/ambiente.jpg"
            alt="Ambiente relaxante do Spa com iluminação verde"
            fill
            className="object-cover transform transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority
          />
          
          {/* Elemento decorativo flutuante (opcional) */}
          <div className="absolute bottom-8 left-8 z-20 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/50 shadow-lg">
            <p className="text-cyan-800 font-semibold text-sm tracking-widest uppercase">
              Atmosfera Relaxante
            </p>
            <p className="text-slate-700 font-medium">
              Cromoterapia & Conforto
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
