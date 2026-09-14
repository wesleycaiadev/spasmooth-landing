"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.css';

const SESSION_KEY = 'spa_intro_lotus_css_v3';
const INTRO_DURATION_MS = 3000;

export default function Preloader() {
    const [phase, setPhase] = useState('checking');
    const exiting = useRef(false);
    const exitTimer = useRef(null);

    const finish = useCallback(() => {
        if (exiting.current) return;
        exiting.current = true;
        if (exitTimer.current) window.clearTimeout(exitTimer.current);
        setPhase('leaving');
        exitTimer.current = window.setTimeout(() => setPhase('hidden'), 500);
    }, []);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            try {
                if (sessionStorage.getItem(SESSION_KEY)) {
                    setPhase('hidden');
                    return;
                }
                sessionStorage.setItem(SESSION_KEY, 'seen');
            } catch { /* The intro still works when session storage is unavailable. */ }
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            setPhase('playing');
            exitTimer.current = window.setTimeout(finish, reducedMotion ? 650 : INTRO_DURATION_MS);
        });

        return () => {
            window.cancelAnimationFrame(frame);
            if (exitTimer.current) window.clearTimeout(exitTimer.current);
        };
    }, [finish]);

    if (phase === 'hidden') return null;

    return (
        <div className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`} aria-hidden="true">
            <div className={`${styles.stage} ${phase !== 'checking' ? styles.playing : ''}`}>
                <div className={styles.mark}>
                    <Image className={styles.outline} src="/assets/spasmooth-lotus-outline-v3.png" alt="" fill sizes="(max-width: 640px) 68vw, 360px" priority />
                    <div className={styles.fillReveal}>
                        <Image className={styles.filledLogo} src="/assets/spasmooth-lotus-transparent-v3.webp" alt="" fill sizes="(max-width: 640px) 68vw, 360px" priority />
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
