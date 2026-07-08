import React, { useEffect } from 'react';
import { useEdu } from '../contexts/EduContext';

const CurrencyUpdateAnnouncer = () => {
    const { showLesson } = useEdu();

    useEffect(() => {
        const hasSeenJulyUpdates = localStorage.getItem('fin_has_seen_july_8_updates');
        const hasSeenCurrencyUpdate = localStorage.getItem('fin_has_seen_currency_update');
        
        // Give a small delay so it doesn't conflict with initial render/loading too abruptly
        const timer = setTimeout(() => {
            if (!hasSeenJulyUpdates) {
                showLesson('atualizacoes_sistema');
                localStorage.setItem('fin_has_seen_july_8_updates', 'true');
            } else if (!hasSeenCurrencyUpdate) {
                showLesson('conversao_moedas');
                localStorage.setItem('fin_has_seen_currency_update', 'true');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [showLesson]);

    return null; // Componente silencioso, sem renderização visual própria
};

export default CurrencyUpdateAnnouncer;
