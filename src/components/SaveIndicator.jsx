// src/components/SaveIndicator.jsx
import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * Componente para exibir o status de salvamento
 * @param {boolean} isSaving - Indica se está salvando
 * @param {string} saveStatus - Status do salvamento ('success', 'error', null)
 * @param {Date} lastSaved - Data/hora do último salvamento
 */
const SaveIndicator = ({ isSaving, saveStatus, lastSaved }) => {
    const formatLastSaved = (date) => {
        if (!date) return '';

        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // diferença em segundos

        if (diff < 5) return 'agora mesmo';
        if (diff < 60) return `há ${diff} segundos`;
        if (diff < 3600) return `há ${Math.floor(diff / 60)} minutos`;

        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    if (isSaving) {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="font-medium">Salvando...</span>
            </div>
        );
    }

    if (saveStatus === 'success') {
        return (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
                <CheckCircle className="w-5 h-5" />
                <div>
                    <span className="font-medium block">Salvo com sucesso!</span>
                    {lastSaved && (
                        <span className="text-xs opacity-90">{formatLastSaved(lastSaved)}</span>
                    )}
                </div>
            </div>
        );
    }

    if (saveStatus === 'error') {
        return (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in z-50">
                <AlertCircle className="w-5 h-5" />
                <div>
                    <span className="font-medium block">Erro ao salvar</span>
                    <span className="text-xs opacity-90">Tente novamente</span>
                </div>
            </div>
        );
    }

    // Mostrar último salvamento se existir
    if (lastSaved) {
        return (
            <div className="fixed bottom-4 right-4 bg-gray-700 text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm opacity-75 hover:opacity-100 transition-opacity z-50">
                <CheckCircle className="w-4 h-4" />
                <span>Salvo {formatLastSaved(lastSaved)}</span>
            </div>
        );
    }

    return null;
};

export default SaveIndicator;
