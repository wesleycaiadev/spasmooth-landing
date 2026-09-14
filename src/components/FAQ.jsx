"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "Qual a forma de pagamento?",
            answer: "Aceitamos PIX e dinheiro. Outras formas podem ser combinadas no atendimento via WhatsApp."
        },
        {
            question: "Preciso levar algo?",
            answer: "Não se preocupe: o espaço é preparado para sua experiência. Se houver alguma orientação específica, enviamos na confirmação."
        },
        {
            question: "Como funciona a confirmação?",
            answer: "Você envia a solicitação pelo formulário e a equipe confirma pelo WhatsApp conforme disponibilidade."
        }
    ];

    return (
        <section id="faq" className="bg-white py-16 md:py-24">
            <div className="spa-shell max-w-3xl">
                <div className="mb-10 max-w-2xl">
                    <span className="spa-eyebrow mb-3 block">Dúvidas frequentes</span>
                    <h2 className="spa-display text-4xl text-[var(--spa-ink)] md:text-5xl">Tudo claro para o seu momento.</h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="overflow-hidden rounded-2xl border border-[var(--spa-line)] bg-[var(--spa-cream)]">
                            <button
                                className="flex min-h-16 w-full items-center justify-between gap-4 p-5 text-left text-sm font-extrabold text-[var(--spa-ink)] transition-colors hover:bg-[var(--spa-sky)]"
                                onClick={() => toggleFaq(index)}
                            >
                                {faq.question}
                                <ChevronDown className={`shrink-0 text-[var(--spa-blue)] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`${openIndex === index ? 'block' : 'hidden'} border-t border-[var(--spa-line)] p-5 text-sm leading-relaxed text-slate-600`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
