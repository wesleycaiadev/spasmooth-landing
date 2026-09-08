import { getIndexableServices } from '@/services/publicServices';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Serviços - SpaSmooTh',
  description: 'Conheça nossos serviços de massagem, estética e day spa. Oferecemos as melhores experiências para o seu relaxamento e cuidado pessoal.',
  alternates: {
    canonical: 'https://spasmooth.com.br/servicos',
  }
};

export default async function ServicosIndexPage() {
  const services = await getIndexableServices();

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
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
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
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-slate-700 font-medium">Serviços</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-light text-slate-800 mb-6">
              Nossos Serviços
            </h1>
            <p className="text-lg text-slate-600">
              Cuidamos de cada detalhe para proporcionar momentos inesquecíveis de bem-estar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link href={`/servicos/${service.slug}`} key={service.id} className="block group">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 h-full flex flex-col">
                  <h2 className="text-xl font-medium text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
                    {service.name}
                  </h2>
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-500 border-t border-slate-50">
                    <span>Saber mais</span>
                    <span className="text-cyan-600">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
            {services.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhum serviço indexável disponível no momento.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
