"use client";
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

export default function Home() {
  const [showBubble, setShowBubble] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // O Preloader cuida do tempo de exibição. 
  // O estado isLoading só muda quando o Preloader avisa que a animação de saída acabou.
  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Show bubble after preloader is done + brief delay
    if (!isLoading) {
      const initialDelay = setTimeout(() => setShowBubble(true), 1000);
      const hideTimer = setTimeout(() => setShowBubble(false), 8000);
      return () => {
        clearTimeout(initialDelay);
        clearTimeout(hideTimer);
      };
    }
  }, [isLoading]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // ========== HERO ANIMATIONS ==========
      gsap.to('.hero h1, .hero p, .hero .cta-buttons', {
        duration: 0.8,
        y: 0,
        opacity: 1,
        delay: 0.2,
        ease: 'power2.out'
      });

      // ========== SERVICES CARDS ANIMATIONS ==========
      gsap.utils.toArray('.glass-card').forEach((card, index) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.1 * (index % 3), // Stagger based on column roughly
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );

        // Hover animation logic is better handled via CSS hover or JS events if critical, 
        // but for React, CSS hover is smoother. The legacy code used JS events. 
        // I'll leave it to CSS (which is in global CSS/Tailwind) for simplicity and performance.
      });

      // ========== TESTIMONIALS ANIMATIONS ==========
      gsap.utils.toArray('.testimonial-card').forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // ========== FAQ ANIMATIONS ==========
      gsap.utils.toArray('.faq-item').forEach((item, index) => {
        gsap.fromTo(item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.1 * index,
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // ========== WHATSAPP FLOAT ANIMATION ==========
      const whatsappBtn = document.querySelector('.whatsapp-float');
      if (whatsappBtn) {
        gsap.to(whatsappBtn, {
          duration: 1.5,
          boxShadow: '0 0 30px rgba(37, 211, 102, 0.6)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    } // End if typeof window
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <Header />
      <Hero />
      <PAS />
      <Services />
      <AmbienceSection />
      <BookingSection />
      <Testimonials />
      <FAQ />
      <Footer />

      {/* WhatsApp Float with Mini Bot Bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        {/* Chat Bubble */}
        <div className={`
          bg-white px-4 py-2 rounded-xl rounded-br-none shadow-lg border border-slate-100 mb-2 
          transform transition-all duration-500 origin-bottom-right
          ${showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none absolute bottom-16 right-0'}
        `}>
          <p className="text-sm font-medium text-slate-600">Olá! Precisa de ajuda ou quer tirar dúvidas? 👋</p>
        </div>

        <a href="https://wa.me/557991189140" target="_blank"
          className="whatsapp-float bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-xl shadow-green-200 transition-transform hover:scale-110 flex items-center justify-center w-14 h-14">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>
    </main>
  );
}
