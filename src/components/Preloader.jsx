"use client";

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.css';

const SESSION_KEY = 'spa_intro_lotus_video_v2';
const MAX_WAIT_MS = 5200;

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
            exitTimer.current = window.setTimeout(finish, reducedMotion ? 700 : MAX_WAIT_MS);
        });

        return () => {
            window.cancelAnimationFrame(frame);
            if (exitTimer.current) window.clearTimeout(exitTimer.current);
        };
    }, [finish]);

    if (phase === 'hidden') return null;

    return (
        <div className={`${styles.overlay} ${phase === 'leaving' ? styles.leaving : ''}`} aria-hidden="true">
            <div className={styles.stage}>
                <video
                    className={styles.video}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    poster="/assets/spasmooth-lotus-v2.webp"
                    onLoadedMetadata={(event) => {
                        event.currentTarget.playbackRate = 2;
                        event.currentTarget.play().catch(finish);
                    }}
                    onError={(event) => {
                        event.currentTarget.style.display = 'none';
                    }}
                    onEnded={finish}
                >
                    <source src="/assets/spasmooth-preloader-v2.mp4" type="video/mp4" />
                </video>
                <div className={styles.fallback}>
                    <Image src="/assets/spasmooth-lotus-v2.webp" alt="" width={720} height={489} priority />
                    <p>Spa<strong>SmooTh</strong></p>
                    <span>Massoterapia</span>
                </div>
            </div>
        </div>
    );
}
