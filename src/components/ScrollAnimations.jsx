"use client";
import { useEffect } from 'react';

export default function ScrollAnimations() {
    useEffect(() => {
        // ======== NATIVE INTERSECTION OBSERVER BUBBLE/FADE ========
        // Substitui GSAP ScrollTrigger p/ zero TBT (Total Blocking Time)
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-slideUp');
                        entry.target.classList.remove('opacity-0', 'translate-y-8');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        // Seleciona targets que antes eram manipulados pelo GSAP
        const targets = document.querySelectorAll('.glass-card, .testimonial-card, .faq-item');
        targets.forEach((el) => {
            // Estilo inicial p/ o observer atuar
            el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return null;
}
