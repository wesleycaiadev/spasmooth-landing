export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'SpaSmooth | Spa e Massoterapia em Aracaju, Maceió e Recife',
  description: 'Spa e massoterapia profissional em Aracaju, Maceió e Recife. Massagem relaxante, terapêutica, day spa e bronzeamento em ambiente de alto padrão. Agende sua sessão.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SpaSmooth | Spa e Massoterapia em Aracaju, Maceió e Recife',
    description: 'Referência em massoterapia e bem-estar em Aracaju, Maceió e Recife. Agende sua sessão e renove suas energias.',
    url: 'https://spasmooth.com.br',
  },
};

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import ProfessionalsSection from '@/components/ProfessionalsSection';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';
import Preloader from '@/components/Preloader';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import FloatingSubleaseButton from '@/components/FloatingSubleaseButton';
import { getLayoutConfig } from '@/services/admin/layout';

// Mapeamento de componentes por ID configurado no admin
const SECTION_COMPONENTS = {
  hero: <Hero key="hero" />,
  services: <Services key="services" />,
  professionals: <ProfessionalsSection key="professionals" />,
  location: <LocationSection key="location" />,
  testimonials: <Testimonials key="testimonials" />,
  faq: <FAQ key="faq" />
};

export default async function Home() {
  const layoutRes = await getLayoutConfig();
  const sections = layoutRes.success ? layoutRes.data : [];

  return (
    <main className="min-h-screen bg-white">
      <Preloader />

      <Header />
      
      {/* Renderiza as seções dinamicamente baseadas na ordem e visibilidade */}
      {sections.filter(sec => sec.visible).map(sec => SECTION_COMPONENTS[sec.id])}

      <Footer />
      <WhatsAppFloat />
      <FloatingSubleaseButton />
    </main>
  );
}
