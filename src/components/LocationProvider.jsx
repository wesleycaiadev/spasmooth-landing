"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export function LocationProvider({ children }) {
    const [location, setLocation] = useState('Aracaju'); // Default fallback
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const hasPermissionError = false;

    useEffect(() => {
        try {
            const saved = localStorage.getItem('spa_user_location');
            if (['Aracaju', 'Maceió', 'Recife'].includes(saved)) setLocation(saved);
        } catch { /* Manual selection works without persistent storage. */ }
        setIsLoadingLocation(false);
    }, []);

    // Permite o usuário ou a interface forçar uma mudança de cidade
    const changeLocation = (newLocation) => {
        if (newLocation === 'Aracaju' || newLocation === 'Maceió' || newLocation === 'Recife') {
            setLocation(newLocation);
            try { localStorage.setItem('spa_user_location', newLocation); } catch { /* Optional persistence. */ }
        }
    };

    return (
        <LocationContext.Provider value={{ location, changeLocation, isLoadingLocation, hasPermissionError }}>
            {children}
        </LocationContext.Provider>
    );
}
