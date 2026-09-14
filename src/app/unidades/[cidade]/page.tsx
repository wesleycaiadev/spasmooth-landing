import { notFound } from 'next/navigation';
import { getUnitBySlug, getIndexableUnits } from '@/data/units';
import type { Metadata } from 'next';
import LocationSection from '@/components/LocationSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

type Props = {
  params: Promise<{ cidade: string }>;
};

export async function generateStaticParams() {
  const units = getIndexableUnits();
  return units.map((u) => ({
    cidade: u.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params;
  const unit = getUnitBySlug(cidade);
  
  if (!unit || !unit.active || !unit.seo_indexable) {
    return {
      title: 'Unidade não encontrada',
    };
  }

  return {
    title: `${unit.name} - Conheça nossa unidade em ${unit.city}`,
    description: `Conheça o ${unit.name} em ${unit.city}, ${unit.state}. Endereço: ${unit.streetAddress}. Agende seu horário e aproveite nossos serviços de spa e estética.`,
    alternates: {
      canonical: `https://spasmooth.com.br/unidades/${unit.slug}`,
    },
    openGraph: {
      title: `${unit.name} - Conheça nossa unidade`,
      description: `Agende seu momento de relaxamento no ${unit.name}.`,
      url: `https://spasmooth.com.br/unidades/${unit.slug}`,
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

export default async function UnitPage({ params }: Props) {
  const { cidade } = await params;
  const unit = getUnitBySlug(cidade);

  if (!unit || !unit.active || !unit.seo_indexable) {
    notFound();
  }

  // Schema.org for Local Business (DaySpa)
  const daySpaSchema = {
    "@context": "https://schema.org",
    "@type": "DaySpa",
    "name": unit.name,
    "image": "https://spasmooth.com.br/images/ambiente.webp",
    "@id": `https://spasmooth.com.br/unidades/${unit.slug}`,
    "url": `https://spasmooth.com.br/unidades/${unit.slug}`,
    "telephone": unit.telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": unit.streetAddress,
      "addressLocality": unit.city,
      "addressRegion": unit.state,
      "postalCode": unit.postalCode,
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": unit.latitude,
      "longitude": unit.longitude
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "20:00"
    }
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
        "name": "Unidades",
        "item": "https://spasmooth.com.br/unidades"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": unit.name,
        "item": `https://spasmooth.com.br/unidades/${unit.slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(daySpaSchema) }}
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
                <Link href="/unidades" className="hover:text-cyan-600 transition-colors">Unidades</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-slate-700 font-medium">{unit.city}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-light text-slate-800 mb-6">
              {unit.name}
            </h1>
            <p className="text-lg text-slate-600">
              Nossa unidade em {unit.city} foi projetada para oferecer o máximo de conforto 
              e relaxamento. Um refúgio urbano onde cada detalhe foi pensado para 
              sua experiência de bem-estar.
            </p>
            <div className="mt-8">
              <Link 
                href={`/?agendar=1&unidade=${unit.slug}`}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-full transition-colors shadow-lg hover:shadow-xl"
              >
                Agendar nesta Unidade
              </Link>
            </div>
          </div>
          
          {/* We reuse the LocationSection component but maybe override the city? The original component probably already fetches the location or displays the map. */}
          <LocationSection />
        </div>
      </div>
      <Footer />
    </main>
  );
}
