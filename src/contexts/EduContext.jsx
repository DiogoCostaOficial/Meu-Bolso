import React, { createContext, useState, useContext } from 'react';
import { EDU_CONTENT, analyzeFinances } from '../utils/eduContent';

const EduContext = createContext();

export const EduProvider = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [financialData, setFinancialData] = useState({ receitas: 0, despesas: 0 });

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
            getLessonContent
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
