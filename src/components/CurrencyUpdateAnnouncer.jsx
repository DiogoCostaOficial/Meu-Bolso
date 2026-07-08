import React, { useEffect } from 'react';
import { useEdu } from '../contexts/EduContext';

const CurrencyUpdateAnnouncer = () => {
    const { showLesson } = useEdu();

    useEffect(() => {
        const hasSeenUpdate = localStorage.getItem('fin_has_seen_currency_update');
        
        if (!hasSeenUpdate) {
            // Give a small delay so it doesn't conflict with initial render/loading too abruptly
            const timer = setTimeout(() => {
                showLesson('conversao_moedas');
                localStorage.setItem('fin_has_seen_currency_update', 'true');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [showLesson]);

    return null; // Componente silencioso, sem renderização visual própria
};

export default CurrencyUpdateAnnouncer;
