"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.css';

const INTRO_DURATION_MS = 3000;

export default function Preloader() {
    const [phase, setPhase] = useState('checking');
    const stage = useRef(null);

    useEffect(() => {
        let active = true;
        let started = false;
        const timers = [];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const later = (callback, delay) => timers.push(window.setTimeout(callback, delay));
        const start = () => {
            if (!active || started) return;
            started = true;
            setPhase('playing');
            later(() => {
                if (!active) return;
                setPhase('leaving');
                later(() => { if (active) setPhase('hidden'); }, reducedMotion ? 180 : 450);
            }, reducedMotion ? 650 : INTRO_DURATION_MS);
        };

        // Run on every home mount, including reloads. Start after the logo is decoded,
        // with a deadline so a failed image request cannot block the page.
        const images = Array.from(stage.current?.querySelectorAll('img') ?? []);
        Promise.allSettled(images.map(image => image.decode())).then(start);
        later(start, 1200);

        return () => {
            active = false;
            timers.forEach(window.clearTimeout);
        };
    }, []);

    if (phase === 'hidden') return null;

    return (
        <div data-spa-preloader={phase} className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`} aria-hidden="true">
            <div ref={stage} className={`${styles.stage} ${phase !== 'checking' ? styles.playing : ''}`}>
                <div className={styles.mark}>
                    <Image className={styles.outline} src="/assets/spasmooth-lotus-outline-v3.png" alt="" fill sizes="(max-width: 474px) 76vw, 360px" preload unoptimized />
                    <div className={styles.fillReveal}>
                        <Image className={styles.filledLogo} src="/assets/spasmooth-lotus-transparent-v3.webp" alt="" fill sizes="(max-width: 474px) 76vw, 360px" preload unoptimized />
                    </div>
                    <span className={styles.lightSweep} />
                </div>
                <div className={styles.identity}>
                    <p className={styles.wordmark}>Spa<strong>SmooTh</strong></p>
                    <p className={styles.tagline}>Massoterapia · Day Spa · Bronzeamento</p>
                    <span className={styles.accentLine} />
                </div>
            </div>
        </div>
    );
}
