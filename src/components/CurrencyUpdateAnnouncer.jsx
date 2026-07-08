import React, { useEffect } from 'react';
import { useEdu } from '../contexts/EduContext';
import { SYSTEM_UPDATES } from '../utils/eduContent';

const CurrencyUpdateAnnouncer = () => {
    const { showLesson } = useEdu();

    useEffect(() => {
        // Delay para não conflitar com a montagem inicial da tela
        const timer = setTimeout(() => {
            // Percorre o histórico de atualizações (das mais recentes para as mais antigas)
            for (const update of SYSTEM_UPDATES) {
                const storageKey = `fin_seen_update_${update.id}`;
                const hasSeen = localStorage.getItem(storageKey);

                if (!hasSeen) {
                    // Exibe a lição correspondente a esta atualização
                    showLesson(update.topicKey);
                    // Salva que o usuário já viu esta atualização específica
                    localStorage.setItem(storageKey, 'true');
                    // Para o loop para não exibir múltiplos popups ao mesmo tempo
                    break;
                }
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [showLesson]);

    return null; // Componente silencioso
};

export default CurrencyUpdateAnnouncer;
