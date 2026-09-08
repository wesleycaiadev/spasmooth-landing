import { getIndexableUnits } from '@/data/units';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nossas Unidades - SpaSmooTh',
  description: 'Conheça as unidades do SpaSmooTh e encontre a mais próxima de você para agendar sua experiência de relaxamento e bem-estar.',
  alternates: {
    canonical: 'https://spasmooth.com.br/unidades',
  }
};

export default function UnidadesIndexPage() {
  const units = getIndexableUnits();

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
        "name": "Unidades",
        "item": "https://spasmooth.com.br/unidades"
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
                <span className="text-slate-700 font-medium">Unidades</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-light text-slate-800 mb-6">
              Nossas Unidades
            </h1>
            <p className="text-lg text-slate-600">
              Escolha a unidade mais próxima e agende o seu momento de relaxamento.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {units.map((unit) => (
              <Link href={`/unidades/${unit.slug}`} key={unit.id} className="block group">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 h-full flex flex-col">
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                    {/* Placeholder image for unit card, using local image */}
                    <img 
                      src="/images/ambiente.webp" 
                      alt={unit.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-medium text-slate-800 mb-2">{unit.name}</h2>
                    <p className="text-slate-500 mb-4 flex-1">{unit.streetAddress}, {unit.city} - {unit.state}</p>
                    <span className="text-cyan-600 font-medium group-hover:text-cyan-700 transition-colors">
                      Ver detalhes da unidade &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {units.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                Nenhuma unidade indexável encontrada no momento.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
