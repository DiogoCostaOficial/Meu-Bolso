import React, { useState } from 'react';
import { X, Lightbulb, GraduationCap, Send, MessageCircle } from 'lucide-react';
import { useEdu } from '../contexts/EduContext';
import { askFinAboutSystem } from '../utils/finChatbot';

const MASCOT_IMAGES = {
    wallet: '/assets/fin_wallet_boy.png',
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

const EduMascot = () => {
    const { isVisible, hideMascot, getLessonContent, mascotState } = useEdu();
    const content = getLessonContent();
    const [userQuestion, setUserQuestion] = useState('');
    const [chatbotResponse, setChatbotResponse] = useState(null);

    if (!isVisible || !content) return null;

    // Determinar qual imagem usar
    const mascotImage = MASCOT_IMAGES[mascotState] || MASCOT_IMAGES.coin;

    const handleAskQuestion = (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;

        const response = askFinAboutSystem(userQuestion);
        setChatbotResponse({
            question: userQuestion,
            answer: response
        });
        setUserQuestion('');
    };

    const clearChat = () => {
        setChatbotResponse(null);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end max-w-md animate-slide-up">
            {/* Balão de Fala */}
        <div className="bg-custom-card rounded-2xl rounded-br-none p-6 shadow-custom border border-custom-color mb-4 relative w-full transition-custom">
            <button
                onClick={() => {
                    clearChat();
                    hideMascot();
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-custom-gold transition"
            >
                <X className="w-5 h-5" />
            </button>

            {chatbotResponse ? (
                // Exibição da Resposta do Chatbot
                <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-custom-gold" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-custom-main">Resposta do FIN</h3>
                            <p className="text-xs text-custom-gold font-medium">Você perguntou: "{chatbotResponse.question}"</p>
                        </div>
                    </div>

                    <div className="bg-custom-primary/30 dark:bg-amber-900/10 p-4 rounded-xl border border-custom-color">
                        <p className="text-custom-main leading-relaxed whitespace-pre-line text-sm">
                            {chatbotResponse.answer}
                        </p>
                    </div>

                    <button
                        onClick={clearChat}
                        className="w-full py-2 bg-custom-gold text-black rounded-lg hover:opacity-90 transition font-bold text-xs"
                    >
                        Fazer outra pergunta ou ver dica original
                    </button>
                </div>
            ) : (
                // Exibição da Dica Original do Mascote
                <div className="space-y-4">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-custom-primary/50 dark:bg-amber-900/20 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-custom-gold" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-custom-main">{content.title}</h3>
                            <p className="text-sm text-custom-gold font-medium">Dica do FIN</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-custom-main opacity-85 leading-relaxed">
                            {content.explanation}
                        </p>

                        {content.analogy && (
                            <div className="bg-custom-primary/30 dark:bg-amber-900/10 p-4 rounded-xl border border-custom-color">
                                <p className="text-sm text-custom-main italic opacity-95">
                                    "{content.analogy}"
                                </p>
                            </div>
                        )}

                        {content.analysis && (
                            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                                <p className="font-medium text-green-500 mb-1">
                                    {content.analysis.status}
                                </p>
                                <p className="text-sm text-custom-main opacity-90 mb-2">
                                    {content.analysis.analogy}
                                </p>
                                {content.analysis.explanation && (
                                    <p className="text-sm text-green-500 font-bold italic border-t border-green-500/20 pt-2 mt-2">
                                        "{content.analysis.explanation}"
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-start gap-2 text-sm text-custom-main opacity-80 bg-custom-primary/30 p-3 rounded-lg border border-custom-color">
                            <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p>{content.tips ? content.tips[0] : content.analysis?.tip}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Caixa de Texto para Perguntar ao FIN */}
            <form onSubmit={handleAskQuestion} className="mt-4 pt-4 border-t border-custom-color flex gap-2">
                <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Pergunte algo ao FIN sobre o sistema..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg text-sm text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                    type="submit"
                    className="p-2 bg-custom-gold text-black rounded-lg hover:opacity-95 transition"
                    title="Enviar pergunta"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>

        {/* Mascote */}
        <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => {
            clearChat();
            hideMascot();
        }}>
            <div className="w-24 h-24 bg-custom-card rounded-full shadow-custom border-4 border-custom-color overflow-hidden flex items-center justify-center transition-custom">
                {/* Usando img tag para as imagens geradas */}
                <img
                    src={mascotImage}
                    alt={`Mascote FIN - Modo ${mascotState}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none'; // Oculta a imagem se falhar
                    }}
                />
            </div>
            <div className="absolute -bottom-2 right-0 bg-custom-gold text-black text-xs font-bold px-3 py-1 rounded-full shadow-custom">
                FIN
            </div>
        </div>
        </div>
    );
};

export default EduMascot;
