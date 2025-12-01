import React from 'react';
import { X, Lightbulb, GraduationCap } from 'lucide-react';
import { useEdu } from '../contexts/EduContext';

const MASCOT_IMAGES = {
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

const EduMascot = () => {
    const { isVisible, hideMascot, getLessonContent, mascotState } = useEdu();
    const content = getLessonContent();

    if (!isVisible || !content) return null;

    // Determinar qual imagem usar
    const mascotImage = MASCOT_IMAGES[mascotState] || MASCOT_IMAGES.coin;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end max-w-md animate-slide-up">
            {/* Balão de Fala */}
            <div className="bg-white rounded-2xl rounded-br-none p-6 shadow-2xl border-2 border-blue-100 mb-4 relative w-full">
                <button
                    onClick={hideMascot}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
                        <p className="text-sm text-blue-600 font-medium">Dica do FIN</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                        {content.explanation}
                    </p>

                    {content.analogy && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-800 italic">
                                "{content.analogy}"
                            </p>
                        </div>
                    )}

                    {content.analysis && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="font-medium text-green-800 mb-1">
                                {content.analysis.status}
                            </p>
                            <p className="text-sm text-green-700">
                                {content.analysis.analogy}
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p>{content.tips ? content.tips[0] : content.analysis?.tip}</p>
                    </div>
                </div>
            </div>

            {/* Mascote */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={hideMascot}>
                <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
                    {/* Usando img tag para as imagens geradas */}
                    <img
                        src={mascotImage}
                        alt={`Mascote FIN - Modo ${mascotState}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'; // Fallback
                        }}
                    />
                </div>
                <div className="absolute -bottom-2 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    FIN
                </div>
            </div>
        </div>
    );
};

export default EduMascot;
