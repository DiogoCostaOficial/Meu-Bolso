import React from 'react';
import { useEdu } from '../contexts/EduContext';

const MASCOT_IMAGES = {
    wallet: '/assets/fin_wallet_boy.png',
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

const EduHelpButton = ({ topic, className = "", variant = "header" }) => {
    const { showLesson, mascotState } = useEdu();
    const mascotImage = MASCOT_IMAGES[mascotState] || MASCOT_IMAGES.coin;

    if (variant === 'header') {
        return (
            <button
                type="button"
                onClick={() => showLesson(topic)}
                className={`h-11 flex items-center gap-2 px-3.5 bg-blue-600/15 hover:bg-blue-600/25 active:scale-95 text-blue-600 dark:text-blue-300 rounded-full border border-blue-400/30 hover:border-blue-400/50 transition-all shadow-sm group select-none cursor-pointer flex-shrink-0 ${className}`}
                title="Clique para ver a Dica do FIN"
            >
                <div className="w-7 h-7 bg-white rounded-full overflow-hidden border border-blue-200 flex-shrink-0 shadow-xs flex items-center justify-center">
                    <img
                        src={mascotImage}
                        alt="Ajuda FIN"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
                <span className="text-xs font-bold whitespace-nowrap">Ajuda FIN</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => showLesson(topic)}
            className={`relative group transition-transform hover:scale-105 active:scale-95 flex flex-col items-center select-none cursor-pointer ${className}`}
            title="Clique para ver a Dica do FIN"
        >
            <div className="w-16 h-16 bg-white rounded-full shadow-lg border-2 border-blue-200 overflow-hidden flex items-center justify-center relative z-10">
                <img
                    src={mascotImage}
                    alt="Ajuda FIN"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
            <div className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md -mt-2 z-20 border border-white">
                AJUDA
            </div>
        </button>
    );
};

export default EduHelpButton;
