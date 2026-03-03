"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

// Coordenadas centrais aproximadas
const LOCATIONS = {
    Aracaju: { lat: -10.9095, lon: -37.0748 },
    Maceió: { lat: -9.6658, lon: -35.7350 }
};

// Fórmula de Haversine para calcular distância em KM
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function LocationProvider({ children }) {
    const [location, setLocation] = useState('Aracaju'); // Default fallback
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [hasPermissionError, setHasPermissionError] = useState(false);

    useEffect(() => {
        // 1. Verificar se já existe uma escolha salva (isso sobrescreve o GPS para quem troca manualmente)
        const savedLocation = localStorage.getItem('spa_user_location');
        if (savedLocation && (savedLocation === 'Aracaju' || savedLocation === 'Maceió')) {
            setLocation(savedLocation);
            setIsLoadingLocation(false);
            return;
        }

        // 2. Tentar geolocalização automática
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    const distAracaju = calculateDistance(userLat, userLon, LOCATIONS.Aracaju.lat, LOCATIONS.Aracaju.lon);
                    const distMaceio = calculateDistance(userLat, userLon, LOCATIONS.Maceió.lat, LOCATIONS.Maceió.lon);

                    const nearest = distAracaju <= distMaceio ? 'Aracaju' : 'Maceió';
                    setLocation(nearest);
                    localStorage.setItem('spa_user_location', nearest);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.warn('Geolocalização negada ou falhou:', error.message);
                    setHasPermissionError(true);
                    // Fallback silencioso para Aracaju caso o usuário negue
                    setLocation('Aracaju');
                    localStorage.setItem('spa_user_location', 'Aracaju');
                    setIsLoadingLocation(false);
                },
                { timeout: 10000 }
            );
        } else {
            setIsLoadingLocation(false);
        }
    }, []);

    // Permite o usuário ou a interface forçar uma mudança de cidade
    const changeLocation = (newLocation) => {
        if (newLocation === 'Aracaju' || newLocation === 'Maceió') {
            setLocation(newLocation);
            localStorage.setItem('spa_user_location', newLocation);
        }
    };

    return (
        <LocationContext.Provider value={{ location, changeLocation, isLoadingLocation, hasPermissionError }}>
            {children}
        </LocationContext.Provider>
    );
}
