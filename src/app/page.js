import BookingSection from '@/components/BookingSection';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PAS from '@/components/PAS';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import AmbienceSection from '@/components/AmbienceSection';
import Preloader from '@/components/Preloader';
import GSAPController from '@/components/GSAPController';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <GSAPController />
      <Preloader />

      <Header />
      <Hero />
      <PAS />
      <Services />
      <AmbienceSection />
      <BookingSection />
      <Testimonials />
      <FAQ />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
