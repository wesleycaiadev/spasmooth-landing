import { Zap, Wind, CheckCircle, ArrowRight } from 'lucide-react';

export default function PAS() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 p-8 rounded-3xl hover:bg-red-50 transition-colors duration-300 group">
                        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-red-400 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-3">Tensão acumulada?</h3>
                        <p className="text-slate-500 leading-relaxed">Dores, rigidez e cansaço mental podem reduzir seu rendimento e seu bem-estar.</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl hover:bg-orange-50 transition-colors duration-300 group">
                        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                            <Wind className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-3">Mente sobrecarregada?</h3>
                        <p className="text-slate-500 leading-relaxed">Estresse e ansiedade podem te deixar exausto mesmo depois de dormir.</p>
                    </div>

                    <div className="bg-[#e2f6fc] p-8 rounded-3xl border border-cyan-100 group relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-cyan-500 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-cyan-800 mb-3">Um refúgio pra você</h3>
                            <p className="text-cyan-700 leading-relaxed mb-4">Sessões com foco em relaxamento, sensibilidade e experiência completa.</p>
                            <a href="#servicos" className="font-bold text-cyan-600 hover:text-cyan-800 underline decoration-2 underline-offset-4 flex items-center gap-1">
                                Ver tratamentos <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
