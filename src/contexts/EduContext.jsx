import React, { createContext, useState, useContext, useEffect } from 'react';
import { EDU_CONTENT, analyzeFinances, TRANSITION_MESSAGES } from '../utils/eduContent';

const EduContext = createContext();

export const EduProvider = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [financialData, setFinancialData] = useState({ receitas: 0, despesas: 0 });
    const [mascotState, setMascotState] = useState('coin'); // 'wallet', 'coin', 'bill', 'gold'
    const [transitionMessage, setTransitionMessage] = useState(null);
    const [isDocked, setIsDocked] = useState(() => {
        try {
            return localStorage.getItem('fin_mascot_docked') === 'true';
        } catch {
            return false;
        }
    });

    const dockMascot = () => {
        setIsDocked(true);
        setIsVisible(false);
        try {
            localStorage.setItem('fin_mascot_docked', 'true');
        } catch {}
    };

    const undockMascot = (topic) => {
        setIsDocked(false);
        setIsVisible(true);
        if (topic) setCurrentTopic(topic);
        try {
            localStorage.setItem('fin_mascot_docked', 'false');
        } catch {}
    };

    const showLesson = (topic) => {
        if (topic) setCurrentTopic(topic);
        setIsDocked(false);
        setIsVisible(true);
        setTransitionMessage(null); // Limpa mensagem de transição ao abrir lição normal
    };

    const hideMascot = () => {
        setIsVisible(false);
        setTransitionMessage(null);
    };

    const toggleMascot = (topic) => {
        if (isDocked) {
            undockMascot(topic);
            return;
        }
        setIsVisible((prev) => {
            if (!prev && topic) {
                setCurrentTopic(topic);
            }
            return !prev;
        });
        setTransitionMessage(null);
    };

    const updateFinancialData = (receitas, despesas) => {
        setFinancialData({ receitas, despesas });

        // Lógica para definir o estado do mascote FIN
        const totalReceitas = Number(receitas) || 0;
        const totalDespesas = Number(despesas) || 0;
        const saldo = totalReceitas - totalDespesas;

        // Calcular percentual de economia (quanto sobrou)
        let percentualEconomia = 0;
        if (totalReceitas > 0) {
            percentualEconomia = ((totalReceitas - totalDespesas) / totalReceitas) * 100;
        }

        let newState = 'coin';

        if (saldo < 0) {
            newState = 'wallet'; // Negativo é Carteira (Triste)
        } else if (percentualEconomia <= 10) {
            newState = 'coin'; // Até 10% de economia é Moeda
        } else if (percentualEconomia <= 75) {
            newState = 'bill'; // De 11% a 75% é Dinheiro
        } else {
            newState = 'gold'; // Acima de 75% é Ouro
        }

        // Verificar transição
        if (newState !== mascotState) {
            // Definir hierarquia: wallet < coin < bill < gold
            const hierarchy = { wallet: 0, coin: 1, bill: 2, gold: 3 };
            const oldRank = hierarchy[mascotState] !== undefined ? hierarchy[mascotState] : 1;
            const newRank = hierarchy[newState];

            if (newRank > oldRank) {
                // Upgrade
                setTransitionMessage(TRANSITION_MESSAGES.upgrade);
                setIsVisible(true); // Mostrar mascote automaticamente para dar parabéns
            } else if (newRank < oldRank) {
                // Downgrade
                setTransitionMessage(TRANSITION_MESSAGES.downgrade);
                setIsVisible(true); // Mostrar mascote automaticamente para alertar
            }

            setMascotState(newState);
        }
    };

    const getLessonContent = () => {
        // Prioridade para mensagem de transição
        if (transitionMessage) {
            return {
                title: transitionMessage.title,
                explanation: transitionMessage.message,
                analogy: null,
                tips: ["Continue acompanhando suas finanças!"]
            };
        }

        // Determinar tópico atual: prioridade para o selecionado, senão detecta pela URL atual
        let topic = currentTopic;
        if (!topic && typeof window !== 'undefined') {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('despesa')) topic = 'despesas';
            else if (path.includes('receita')) topic = 'receitas';
            else if (path.includes('carto')) topic = 'cartoes';
            else if (path.includes('orcamento')) topic = 'orcamento';
            else if (path.includes('dre')) topic = 'dre';
            else if (path.includes('relatorio')) topic = 'relatorios';
            else topic = 'dashboard';
        }

        if (!topic) topic = 'dashboard';

        // Se for uma análise geral (ex: dashboard), combina conteúdo estático com análise dinâmica
        if (topic === 'dashboard') {
            const baseContent = EDU_CONTENT['dashboard'] || {};
            const analysis = analyzeFinances(financialData.receitas, financialData.despesas);

            return {
                ...baseContent,
                analysis
            };
        }

        return EDU_CONTENT[topic] || EDU_CONTENT['dashboard'];
    };

    return (
        <EduContext.Provider value={{
            isVisible,
            showLesson,
            hideMascot,
            toggleMascot,
            isDocked,
            dockMascot,
            undockMascot,
            updateFinancialData,
            getLessonContent,
            mascotState
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
