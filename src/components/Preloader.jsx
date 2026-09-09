"use client";

import { useEffect, useState } from 'react';
import styles from './Preloader.module.css';

const SESSION_KEY = 'spa_intro_draw_fill_v1';
const DRAW_AND_FILL_MS = 1800;
const MAX_WAIT_MS = 2800;

export default function Preloader() {
    const [phase, setPhase] = useState('hidden');

    useEffect(() => {
        let active = true;
        let closing = false;
        const timers = [];
        const later = (callback, delay) => {
            const timer = window.setTimeout(callback, delay);
            timers.push(timer);
        };

        const frame = window.requestAnimationFrame(() => {
            try {
                if (sessionStorage.getItem(SESSION_KEY)) return;
                sessionStorage.setItem(SESSION_KEY, 'seen');
            } catch { /* The intro still works when session storage is unavailable. */ }

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            setPhase('drawing');

            const close = () => {
                if (!active || closing) return;
                closing = true;
                setPhase('leaving');
                later(() => { if (active) setPhase('hidden'); }, reducedMotion ? 150 : 450);
            };

            // Wait only for the first viewport, with a deadline even if an image fails.
            const hero = document.querySelector('[data-spa-hero-image]');
            const imageReady = hero?.decode ? hero.decode().catch(() => {}) : Promise.resolve();
            const fontsReady = document.fonts?.ready || Promise.resolve();
            const drawingFinished = new Promise(resolve => later(resolve, reducedMotion ? 180 : DRAW_AND_FILL_MS));
            Promise.allSettled([drawingFinished, imageReady, fontsReady]).then(close);
            later(close, reducedMotion ? 350 : MAX_WAIT_MS);
        });

        return () => {
            active = false;
            window.cancelAnimationFrame(frame);
            timers.forEach(window.clearTimeout);
        };
    }, []);

    if (phase === 'hidden') return null;

    return (
        <div className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`} aria-hidden="true">
            <div className={styles.signature}>
                <svg className={styles.symbol} width="76" height="88" viewBox="0 0 40 46" fill="none">
                    <path className={styles.fill} d="M20 3C12.2 11.2 5.5 21.3 5.5 36.5h29C34.5 21.3 27.8 11.2 20 3Z" />
                    <path className={styles.outline} pathLength="1" d="M20 3C12.2 11.2 5.5 21.3 5.5 36.5h29C34.5 21.3 27.8 11.2 20 3Z" />
                    <path className={styles.ribs} pathLength="1" d="M20 3v33.5M20 3C15.5 14.2 13.5 25.4 13.5 36.5M20 3c4.5 11.2 6.5 22.4 6.5 33.5" />
                </svg>
                <p className={styles.wordmark}>Spa<strong>SmooTh</strong></p>
                <p className={styles.tagline}>Corpo · Mente · Equilíbrio</p>
                <span className={styles.line} />
            </div>
        </div>
    );
}
