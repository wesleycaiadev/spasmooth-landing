import { notFound } from 'next/navigation';
import { getServiceBySlug } from '@/services/publicServices';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Clock } from 'lucide-react';

type Props = {
  params: { slug: string };
};

// Next.js App Router route segment config
export const revalidate = 3600; // ISR cache for 1 hour
export const dynamicParams = true; // Allows new slugs to be fetched on demand

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  
  if (!service || !service.active || !service.seo_indexable) {
    return {
      title: 'Serviço não encontrado',
    };
  }

  return {
    title: service.seo_title || `${service.name} - SpaSmooTh`,
    description: service.seo_description || service.description || `Agende sua sessão de ${service.name} no SpaSmooTh e aproveite nossa experiência única de bem-estar.`,
    alternates: {
      canonical: `https://spasmooth.com.br/servicos/${service.slug}`,
    },
    openGraph: {
      title: service.seo_title || `${service.name} - SpaSmooTh`,
      description: service.seo_description || service.description || `Agende sua sessão de ${service.name} no SpaSmooTh.`,
      url: `https://spasmooth.com.br/servicos/${service.slug}`,
      siteName: 'SpaSmooTh',
      locale: 'pt_BR',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function ServicePage({ params }: Props) {
  const service = await getServiceBySlug(params.slug);

  if (!service || !service.active || !service.seo_indexable) {
    notFound();
  }

  // Schema.org for Service & Offer
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description || `Sessão de ${service.name} no SpaSmooTh.`,
    "provider": {
      "@type": "Organization",
      "name": "SpaSmooTh",
      "url": "https://spasmooth.com.br"
    },
    ...(service.price > 0 && {
      "offers": {
        "@type": "Offer",
        "price": service.price.toString(),
        "priceCurrency": "BRL"
      }
    })
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": "https://spasmooth.com.br/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Serviços",
        "item": "https://spasmooth.com.br/servicos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": service.name,
        "item": `https://spasmooth.com.br/servicos/${service.slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Breadcrumb UI */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-cyan-600 transition-colors">Início</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/servicos" className="hover:text-cyan-600 transition-colors">Serviços</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-slate-700 font-medium line-clamp-1">{service.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header / Hero of the service */}
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 px-8 py-12 text-white relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
               <div className="relative z-10">
                 <div className="uppercase tracking-wider text-cyan-100 text-sm font-semibold mb-3">
                   {service.category === 'massage' ? 'Massagem' : service.category === 'waxing' ? 'Depilação' : service.category === 'combo' ? 'Combo Especial' : service.category === 'estetica' ? 'Estética' : 'Spa'}
                 </div>
                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6">
                   {service.name} em Aracaju
                 </h1>
                 <div className="flex flex-wrap items-center gap-6 text-cyan-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{service.duration_minutes} minutos</span>
                    </div>
                    {service.price > 0 && (
                      <div className="text-xl font-medium">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                 </div>
               </div>
            </div>

            <div className="p-8 sm:p-12">
              {/* Main Content Area */}
              <div className="prose prose-slate max-w-none prose-lg">
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {service.seo_content?.intro || service.description || `Sinta a diferença com nossa sessão especializada de ${service.name} em Aracaju.`}
                </p>
                
                {service.seo_content?.how_it_works && (
                  <>
                    <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">Como funciona</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {service.seo_content.how_it_works}
                    </p>
                  </>
                )}

                {service.seo_content?.experience && (
                  <>
                    <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">Como é a experiência</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {service.seo_content.experience}
                    </p>
                  </>
                )}

                <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">Onde é realizado</h2>
                <p className="text-slate-600 leading-relaxed">
                  O procedimento é realizado em nossa unidade de <strong>Aracaju</strong>, um espaço projetado especificamente para o seu conforto e desconexão. Garantimos um ambiente preparado, limpo e climatizado para proporcionar a melhor experiência possível desde o momento de sua chegada.
                </p>

                {service.seo_content?.before_visit && (
                  <>
                    <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">O que saber antes do atendimento</h2>
                    <p className="text-slate-600 leading-relaxed">
                      {service.seo_content.before_visit}
                    </p>
                  </>
                )}

                {service.seo_content?.faq && service.seo_content.faq.length > 0 && (
                  <>
                    <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                      {service.seo_content.faq.map((item: any, i: number) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h4 className="font-medium text-slate-800 mb-2 m-0">{item.question}</h4>
                          <p className="text-slate-600 text-sm m-0">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Fallback FAQ if no custom FAQ provided */}
                {(!service.seo_content?.faq || service.seo_content.faq.length === 0) && (
                  <>
                    <h2 className="text-2xl font-medium text-slate-800 mt-10 mb-4">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="font-medium text-slate-800 mb-2 m-0">Como agendar minha sessão em Aracaju?</h4>
                        <p className="text-slate-600 text-sm m-0">Você pode utilizar nosso sistema online seguro clicando no botão de agendamento abaixo.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <Link 
                  href={`/?agendar=1&servico=${service.slug}`}
                  className="inline-flex items-center justify-center px-10 py-4 text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-cyan-600/30"
                >
                  Agendar agora
                </Link>
                <p className="text-sm text-slate-500 mt-4">
                  Agendamento rápido e seguro. Confirmação imediata.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </main>
  );
}
