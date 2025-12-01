// src/hooks/useDebouncedSave.js
import { useRef, useCallback, useState } from 'react';

/**
 * Hook personalizado para implementar salvamento com debounce
 * @param {Function} saveFunction - Função que será chamada para salvar os dados
 * @param {number} delay - Tempo de espera em milissegundos (padrão: 1000ms)
 * @returns {Object} - Objeto contendo a função de salvamento e estados
 */
export const useDebouncedSave = (saveFunction, delay = 1000) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
    const [lastSaved, setLastSaved] = useState(null);
    const timeoutRef = useRef(null);
    const statusTimeoutRef = useRef(null);

    /**
     * Limpa o timeout anterior e agenda um novo salvamento
     */
    const debouncedSave = useCallback(
        async (data) => {
            // Limpa o timeout anterior se existir
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Limpa o timeout de status se existir
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }

            // Indica que está aguardando para salvar
            setIsSaving(true);
            setSaveStatus(null);

            // Agenda o salvamento
            timeoutRef.current = setTimeout(async () => {
                try {
                    await saveFunction(data);
                    setIsSaving(false);
                    setSaveStatus('success');
                    setLastSaved(new Date());

                    // Remove a mensagem de sucesso após 3 segundos
                    statusTimeoutRef.current = setTimeout(() => {
                        setSaveStatus(null);
                    }, 3000);
                } catch (error) {
                    setIsSaving(false);
                    setSaveStatus('error');
                    console.error('Erro ao salvar:', error);

                    // Remove a mensagem de erro após 5 segundos
                    statusTimeoutRef.current = setTimeout(() => {
                        setSaveStatus(null);
                    }, 5000);
                }
            }, delay);
        },
        [saveFunction, delay]
    );

    /**
     * Salva imediatamente sem debounce
     */
    const saveImmediately = useCallback(
        async (data) => {
            // Limpa qualquer salvamento pendente
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setIsSaving(true);
            setSaveStatus(null);

            try {
                await saveFunction(data);
                setIsSaving(false);
                setSaveStatus('success');
                setLastSaved(new Date());

                statusTimeoutRef.current = setTimeout(() => {
                    setSaveStatus(null);
                }, 3000);
            } catch (error) {
                setIsSaving(false);
                setSaveStatus('error');
                console.error('Erro ao salvar:', error);

                statusTimeoutRef.current = setTimeout(() => {
                    setSaveStatus(null);
                }, 5000);
            }
        },
        [saveFunction]
    );

    /**
     * Cancela qualquer salvamento pendente
     */
    const cancelSave = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            setIsSaving(false);
        }
    }, []);

    return {
        debouncedSave,
        saveImmediately,
        cancelSave,
        isSaving,
        saveStatus,
        lastSaved,
    };
};

export default useDebouncedSave;
