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

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Preloader />

      <Header />
      <Hero />
      <Services />
      <ProfessionalsSection />
      <LocationSection />
      <Testimonials />
      <FAQ />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
