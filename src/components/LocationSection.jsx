"use client";
import { usePrivacy } from "@/components/PrivacyProvider";

import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useLocation } from '@/components/LocationProvider';

export default function LocationSection() {
    const { maps } = usePrivacy();
    const { location, isLoadingLocation } = useLocation();

    const locationDetails = {
        Aracaju: {
            address: "Av. Pref. Heráclito Rollemberg, Alziro zarur 155, bairro Farolândia, Aracaju - SE, CEP 49030-060",
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
            address: "Rua Ribeiro de Brito 950, Ed. Golden Shopping Home Service, Boa Viagem - Recife, PE - AP 2303",
            mapsLink: "https://maps.google.com/?q=Rua+Ribeiro+de+Brito+950+Boa+Viagem+Recife",
            iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.799753066601!2d-34.90807082409543!3d-8.12185679190695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab1fa08da1284b%3A0xc3124ce8bdcf43ba!2sR.%20Ribeiro%20de%20Brito%2C%20950%20-%20Boa%20Viagem%2C%20Recife%20-%20PE%2C%2051021-310!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
            iframeTitle: "Mapa do SpaSmooth em Recife"
        }
    };

    const activeDetails = locationDetails[location] || locationDetails['Aracaju'];

    return (
        <section id="localizacao" className="relative overflow-hidden bg-[var(--spa-mist)] py-16 md:py-24">
            <div className="spa-shell relative z-10">
                <div className="mb-9 max-w-2xl md:mb-12">
                    <p className="spa-eyebrow mb-3 flex items-center gap-2"><MapPin size={15} aria-hidden="true" /> Como chegar</p>
                    <h2 className="spa-display text-4xl text-[var(--spa-ink)] md:text-5xl">Nossa localização.</h2>
                    <p className="mt-4 text-base text-slate-600">Encontre a unidade selecionada em {isLoadingLocation ? '...' : location} e escolha a melhor forma de chegar.</p>
                </div>

                <div className="grid items-stretch overflow-hidden rounded-[2rem] border border-[var(--spa-line)] bg-white shadow-xl shadow-[rgb(6_59_100_/_0.08)] lg:grid-cols-2">
                    {/* Informações */}
                    <div className="p-7 md:p-10 lg:p-12">
                        <h3 className="spa-display mb-8 text-3xl text-[var(--spa-ink)]">SpaSmooTh {location}</h3>

                        <div className="space-y-8 text-slate-600">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 rounded-full bg-[var(--spa-sky)] p-3 text-[var(--spa-blue)]">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-1">Endereço</h4>
                                    <p className="text-sm">{activeDetails.address}</p>
                                    <a href={activeDetails.mapsLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-extrabold text-[var(--spa-blue)] transition-colors hover:text-[var(--spa-ink)]">
                                        <Navigation className="w-4 h-4" />
                                        <span>Abrir no Google Maps</span>
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="shrink-0 rounded-full bg-[var(--spa-sky)] p-3 text-[var(--spa-blue)]">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="w-full">
                                    <h4 className="mb-2 font-semibold text-slate-800">Horários disponíveis</h4>
                                    <p className="max-w-xs text-sm">Consulte as opções atualizadas ao iniciar o agendamento.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="shrink-0 rounded-full bg-[var(--spa-sky)] p-3 text-[var(--spa-blue)]">
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
                        {maps ? <iframe
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
                        ></iframe> : <div className="h-full min-h-64 flex items-center justify-center p-6 text-center bg-slate-100"><p>Para mostrar o mapa, autorize “Mapas do Google” em Privacidade e cookies. Você também pode usar o link de endereço.</p></div>}
                    </div>
                </div>
            </div>
        </section>
    );
}
