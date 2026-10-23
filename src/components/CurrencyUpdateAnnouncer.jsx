import React, { useEffect } from 'react';
import { useEdu } from '../contexts/EduContext';
import { useAuth } from '../contexts/AuthContext';
import { SYSTEM_UPDATES } from '../utils/eduContent';

const CurrencyUpdateAnnouncer = () => {
    const { showLesson, undockMascot } = useEdu();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return; // Só verifica se o usuário estiver de fato logado

        // Seta um namespace para cada usuário (usando email ou id único)
        const userSuffix = user.email ? `_${user.email.toLowerCase()}` : `_${user.id || 'guest'}`;

        // Delay para não conflitar com a montagem inicial da tela
        const timer = setTimeout(() => {
            // 1. Prioridade Máxima no Primeiro Login: Dica "Dar Nome ao Dinheiro"
            const firstLoginKey = `fin_first_login_nome_dinheiro${userSuffix}`;
            if (!localStorage.getItem(firstLoginKey)) {
                undockMascot();
                showLesson('primeiro_acesso_nome_dinheiro');
                localStorage.setItem(firstLoginKey, 'true');
                localStorage.setItem(`fin_seen_update_2026_10_19_nome_ao_dinheiro${userSuffix}`, 'true');
                return;
            }

            // 2. Percorre o histórico de atualizações (das mais recentes para as mais antigas)
            for (const update of SYSTEM_UPDATES) {
                const storageKey = `fin_seen_update_${update.id}${userSuffix}`;
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
        }, 1200);

        return () => clearTimeout(timer);
    }, [showLesson, undockMascot, user]);

    return null; // Componente silencioso
};

export default CurrencyUpdateAnnouncer;
