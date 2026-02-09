"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Tempo total de exibição antes de iniciar a saída
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500); // 2.5 segundos de "leitura"

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence
            mode="wait"
            onExitComplete={() => {
                // Avisa a página principal SOMENTE depois que a animação de saída terminar
                if (onComplete) onComplete();
            }}
        >
            {isVisible && (
                <motion.div
                    key="preloader-container"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cyan-50"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="flex flex-col items-center">
                        {/* Logo SVG Animado */}
                        <motion.div
                            className="relative mb-6"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                                delay: 0.2
                            }}
                        >
                            <svg width="100" height="80" viewBox="0 0 100 80" fill="none" stroke="#06b6d4" strokeWidth="3">
                                <path d="M50 10 C30 30, 10 50, 10 80 H90 C90 50, 70 30, 50 10" />
                                <path d="M50 10 C40 40, 30 60, 30 80" strokeWidth="2" />
                                <path d="M50 10 C60 40, 70 60, 70 80" strokeWidth="2" />
                            </svg>
                        </motion.div>

                        {/* Texto de Boas-vindas */}
                        <div className="text-center overflow-hidden">
                            <motion.h2
                                className="text-2xl font-light text-slate-600 tracking-wider mb-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                            >
                                Seja bem vindo ao
                            </motion.h2>
                            <motion.h1
                                className="text-4xl font-bold text-cyan-600 tracking-tight"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
                            >
                                SpaSmooTh
                            </motion.h1>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
