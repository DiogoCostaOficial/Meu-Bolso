import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
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

    const dockMascot = useCallback(() => {
        setIsDocked(true);
        setIsVisible(false);
        try {
            localStorage.setItem('fin_mascot_docked', 'true');
        } catch {}
    }, []);

    const undockMascot = useCallback((topic) => {
        setIsDocked(false);
        setIsVisible(true);
        if (topic) setCurrentTopic(topic);
        try {
            localStorage.setItem('fin_mascot_docked', 'false');
        } catch {}
    }, []);

    const showLesson = useCallback((topic) => {
        if (topic) setCurrentTopic(topic);
        setIsDocked(false);
        setIsVisible(true);
        setTransitionMessage(null); // Limpa mensagem de transição ao abrir lição normal
    }, []);

    const hideMascot = useCallback(() => {
        setIsVisible(false);
        setTransitionMessage(null);
    }, []);

    const toggleMascot = useCallback((topic) => {
        setIsDocked((prevDocked) => {
            if (prevDocked) {
                try {
                    localStorage.setItem('fin_mascot_docked', 'false');
                } catch {}
                setIsVisible(true);
                if (topic) setCurrentTopic(topic);
                return false;
            }
            return false;
        });

        setIsVisible((prev) => {
            if (!prev && topic) {
                setCurrentTopic(topic);
            }
            return !prev;
        });
        setTransitionMessage(null);
    }, []);

    const updateFinancialData = useCallback((receitas, despesas) => {
        const totalReceitas = Number(receitas) || 0;
        const totalDespesas = Number(despesas) || 0;

        // Evita re-render se os valores forem idênticos aos anteriores
        setFinancialData(prev => {
            if (prev.receitas === totalReceitas && prev.despesas === totalDespesas) {
                return prev;
            }
            return { receitas: totalReceitas, despesas: totalDespesas };
        });

        // Lógica para definir o estado do mascote FIN
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

        // Atualização funcional do estado do mascote
        setMascotState(prevMascot => {
            if (prevMascot === newState) return prevMascot;

            const hierarchy = { wallet: 0, coin: 1, bill: 2, gold: 3 };
            const oldRank = hierarchy[prevMascot] !== undefined ? hierarchy[prevMascot] : 1;
            const newRank = hierarchy[newState];

            if (newRank > oldRank) {
                setTransitionMessage(TRANSITION_MESSAGES.upgrade);
                setIsVisible(true);
            } else if (newRank < oldRank) {
                setTransitionMessage(TRANSITION_MESSAGES.downgrade);
                setIsVisible(true);
            }

            return newState;
        });
    }, []);

    const getLessonContent = useCallback(() => {
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
            else if (path.includes('viagem') || path.includes('viagens')) topic = 'viagens';
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
    }, [currentTopic, transitionMessage, financialData]);

    const contextValue = useMemo(() => ({
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
    }), [
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
    ]);

    return (
        <EduContext.Provider value={contextValue}>
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
