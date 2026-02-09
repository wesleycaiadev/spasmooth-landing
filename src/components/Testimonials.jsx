import { Star } from 'lucide-react';

export default function Testimonials() {
    return (
        <section id="depoimentos" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 max-w-2xl mx-auto px-4">
                    <span className="text-cyan-600 font-semibold tracking-wider uppercase text-sm mb-2 block">O que dizem</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-4">Histórias de Renovação</h2>
                    <div className="w-24 h-1 bg-cyan-200 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="testimonial-card bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex text-yellow-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-slate-600 italic mb-6">&quot;Ambiente acolhedor e experiência incrível. Saí renovada!&quot;</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">M</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Mariana Costa</h4>
                                <p className="text-xs text-slate-400">Cliente Verificado</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex text-yellow-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-slate-600 italic mb-6">&quot;Atendimento impecável e muito profissional. Recomendo!&quot;</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">R</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Roberto Alves</h4>
                                <p className="text-xs text-slate-400">Cliente Verificado</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex text-yellow-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-slate-600 italic mb-6">&quot;Do agendamento ao pós-sessão, tudo muito organizado.&quot;</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">F</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Fernanda Lima</h4>
                                <p className="text-xs text-slate-400">Cliente Verificado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
