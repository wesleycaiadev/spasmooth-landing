"use client";
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function GSAPController() {
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
                        delay: 0.1 * (index % 3),
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
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
        }
    }, []);

    return null; // Componente lógico, não renderiza nada visualmente por si só.
}
