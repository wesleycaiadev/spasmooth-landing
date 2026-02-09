import { Instagram, MessageCircle, MapPin, Phone, Lock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-800 text-slate-300 py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <h3 className="text-2xl font-light text-white mb-6">Spa<span className="font-bold">SmooTh</span></h3>
                        <p className="text-slate-400 mb-6 max-w-xs">Agende seu momento de desconexão e bem-estar.</p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/spa_smooth/" target="_blank" className="bg-slate-700 hover:bg-pink-600 text-white p-2 rounded-lg transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://wa.me/557991189140" target="_blank" className="bg-slate-700 hover:bg-green-500 text-white p-2 rounded-lg transition-colors">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Localização</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-cyan-400 mt-1 shrink-0 w-5 h-5" />
                                <a href="https://maps.app.goo.gl/F8keaZv4bWuJSz3u8" target="_blank" className="hover:text-cyan-400 transition-colors">
                                    <span className="font-semibold">Aracaju - SE</span><br />
                                    <span className="text-sm">Clique para ver no mapa</span>
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-cyan-400 shrink-0 w-5 h-5" />
                                <a href="https://wa.me/557991189140" target="_blank" className="hover:text-cyan-400 transition-colors">(79) 9118-9140</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Horário de Atendimento</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Seg - Sex</span>
                                <span className="text-cyan-400">08h - 20h</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700 pb-2">
                                <span>Sábado</span>
                                <span className="text-cyan-400">09h - 16h</span>
                            </li>
                            <li className="flex justify-between text-slate-500">
                                <span>Domingo</span>
                                <span>Fechado</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500 relative flex justify-center items-center">
                    <p>&copy; 2026 SpaSmooth Massoterapia. Todos os direitos reservados.</p>
                    <a href="/admin/dashboard" className="absolute right-0 text-slate-700 hover:text-cyan-500 transition-colors p-1" title="Acesso Administrativo">
                        <Lock className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
