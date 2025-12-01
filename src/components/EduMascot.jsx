import React from 'react';
import { useEdu } from '../contexts/EduContext';
import { X, Lightbulb, BookOpen, Heart } from 'lucide-react';

const EduMascot = () => {
    const { isVisible, hideMascot, getLessonContent } = useEdu();
    const content = getLessonContent();

    if (!isVisible || !content) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* BALÃO DE FALA */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4 max-w-md border-2 border-blue-100 relative">
                <button
                    onClick={hideMascot}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{content.title}</h3>
                </div>

                <div className="space-y-4 text-gray-700">
                    {/* 1) Explicação Simples */}
                    <p className="leading-relaxed">
                        {content.explanation}
                    </p>

                    {/* 2) Exemplo / Analogia */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-start">
                        <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm italic text-blue-800">
                            "{content.analogy}"
                        </p>
                    </div>

                    {/* 3) Avaliação (se houver) */}
                    {content.analysis && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <p className="font-semibold text-purple-900 mb-1">Como você está:</p>
                            <p className="text-sm text-purple-800 mb-2">{content.analysis.status}</p>
                            <p className="text-xs italic text-purple-700">"{content.analysis.analogy}"</p>
                        </div>
                    )}

                    {/* 4) Dica Positiva */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Heart className="w-4 h-4 text-red-500" />
                        <p className="text-sm font-medium text-gray-600">
                            Dica: {content.analysis ? content.analysis.tip : content.tips[0]}
                        </p>
                    </div>
                </div>

                {/* Seta do balão */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-blue-100 transform rotate-45"></div>
            </div>

            {/* MASCOTE (Ícone por enquanto) */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={hideMascot}>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                    <span className="text-4xl">🤖</span>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
        </div>
    );
};

export default EduMascot;
