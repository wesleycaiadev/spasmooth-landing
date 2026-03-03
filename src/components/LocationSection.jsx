"use client";

import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

export default function LocationSection() {
    const { location, isLoadingLocation } = useLocation();

    const locationDetails = {
        Aracaju: {
            address: "Aracaju - SE",
            mapsLink: "https://maps.app.goo.gl/F8keaZv4bWuJSz3u8",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125218.42851978255!2d-37.16436662994436!3d-10.93187216447883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x71ab3a34a81b37b%3A0x633454b5dfd41097!2sAracaju%2C%20SE!5e0!3m2!1spt-BR!2sbr!4v1714081033288!5m2!1spt-BR!2sbr",
            iframeTitle: "Mapa do SpaSmooth em Aracaju"
        },
        Maceió: {
            address: "Avenida Alvaro Otacílio, 3567, Maceió, CEP 57035-180, Brasil, Edifício cote D’azur : Jatiuca Sala 706",
            mapsLink: "https://maps.google.com/?q=Avenida+Alvaro+Otacilio,3567,Maceio",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.243501602353!2d-35.705886424072834!3d-9.660166690429415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70145a3beba20f1%3A0xcdaae293b68903ab!2sAv.%20%C3%81lvaro%20Otac%C3%ADlio%2C%203567%20-%20Ponta%20Verde%2C%20Macei%C3%B3%20-%20AL%2C%2057035-180!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
            iframeTitle: "Mapa do SpaSmooth em Maceió"
        },
        Recife: {
            address: "Recife - PE (Em Breve)",
            mapsLink: "https://maps.google.com/?q=Recife,PE",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126442.27402379368!2d-34.96205938166549!3d-8.04215843477124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab196f88c446e5%3A0x3c9ef52922447fd4!2sRecife%2C%20PE!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
            iframeTitle: "Mapa do SpaSmooth em Recife"
        }
    };

    const activeDetails = locationDetails[location] || locationDetails['Aracaju'];

    return (
        <section id="localizacao" className="py-20 bg-slate-50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 animate-on-scroll">
                    <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-cyan-200 mb-6">
                        <MapPin className="w-4 h-4" />
                        <span>Como Chegar</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6">
                        Nossa <span className="text-cyan-700 italic">Localização</span>
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Venha nos visitar em {isLoadingLocation ? '...' : location} e desfrute de momentos inesquecíveis de relaxamento.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-on-scroll">
                    {/* Informações */}
                    <div className="p-10 lg:p-14">
                        <h3 className="text-2xl font-semibold text-slate-800 mb-8">Spa<span className="font-light">SmooTh</span></h3>

                        <div className="space-y-8 text-slate-600">
                            <div className="flex items-start gap-4">
                                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600 shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-1">Endereço</h4>
                                    <p className="text-sm">{activeDetails.address}</p>
                                    <a href={activeDetails.mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium mt-2 transition-colors">
                                        <Navigation className="w-4 h-4" />
                                        <span>Abrir no Google Maps</span>
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600 shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="w-full">
                                    <h4 className="font-semibold text-slate-800 mb-2">Horário de Funcionamento</h4>
                                    <ul className="space-y-2 text-sm max-w-xs">
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Segunda a Sexta</span>
                                            <span className="font-medium text-slate-800">08:00 - 20:00</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span>Sábado</span>
                                            <span className="font-medium text-slate-800">09:00 - 16:00</span>
                                        </li>
                                        <li className="flex justify-between pt-1">
                                            <span>Domingo</span>
                                            <span className="font-medium text-slate-400">Fechado</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600 shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-1">Contato</h4>
                                    <a href="https://wa.me/557991189140" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition-colors">
                                        (79) 9118-9140
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mapa Dinâmico */}
                    <div className="h-96 lg:h-full min-h-[400px] w-full bg-slate-200 relative group">
                        <iframe
                            key={location}
                            src={activeDetails.iframeSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={activeDetails.iframeTitle}
                            className="absolute inset-0 transition-opacity duration-300 opacity-90 group-hover:opacity-100"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
}
