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
        <section id="faq" className="py-20 bg-[#f8fafc]">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12 max-w-2xl mx-auto px-4">
                    <span className="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Dúvidas Frequentes</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Ficou alguma questão?</h2>
                    <div className="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white faq-item">
                            <button
                                className="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700 cursor-pointer"
                                onClick={() => toggleFaq(index)}
                            >
                                {faq.question}
                                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`${openIndex === index ? 'block' : 'hidden'} p-6 bg-slate-50 text-slate-600 border-t border-slate-100`}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
