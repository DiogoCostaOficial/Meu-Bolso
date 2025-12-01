import React, { createContext, useState, useContext } from 'react';
import { EDU_CONTENT, analyzeFinances } from '../utils/eduContent';

const EduContext = createContext();

export const EduProvider = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [financialData, setFinancialData] = useState({ receitas: 0, despesas: 0 });
    const [mascotState, setMascotState] = useState('coin'); // 'coin', 'bill', 'gold'

    const showLesson = (topic) => {
        setCurrentTopic(topic);
        setIsVisible(true);
    };

    const hideMascot = () => {
        setIsVisible(false);
        setCurrentTopic(null);
    };

    const updateFinancialData = (receitas, despesas) => {
        setFinancialData({ receitas, despesas });

        // Lógica para definir o estado do mascote FIN
        const totalReceitas = Number(receitas) || 0;
        const totalDespesas = Number(despesas) || 0;
        const saldo = totalReceitas - totalDespesas;
        const percentualGasto = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;

        if (saldo <= 0 || percentualGasto > 90) {
            setMascotState('coin'); // Pouco dinheiro ou apertado
        } else if (percentualGasto > 50) {
            setMascotState('bill'); // Sob controle
        } else {
            setMascotState('gold'); // Sobrando dinheiro (gastou 50% ou menos)
        }
    };

    const getLessonContent = () => {
        if (!currentTopic) return null;

        // Se for uma análise geral (ex: dashboard), combina conteúdo estático com análise dinâmica
        if (currentTopic === 'dashboard') {
            const baseContent = EDU_CONTENT['dashboard'];
            const analysis = analyzeFinances(financialData.receitas, financialData.despesas);

            return {
                ...baseContent,
                analysis
            };
        }

        return EDU_CONTENT[currentTopic];
    };

    return (
        <EduContext.Provider value={{
            isVisible,
            showLesson,
            hideMascot,
            updateFinancialData,
            getLessonContent,
            mascotState // Expondo o estado do mascote
        }}>
            {children}
        </EduContext.Provider>
    );
};

export const useEdu = () => {
    const context = useContext(EduContext);
    if (!context) {
        throw new Error('useEdu deve ser usado dentro de um EduProvider');
    }
    return context;
};
