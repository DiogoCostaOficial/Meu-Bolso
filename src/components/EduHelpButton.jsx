import React from 'react';
import { useEdu } from '../contexts/EduContext';

const MASCOT_IMAGES = {
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

const EduHelpButton = ({ topic, className = "" }) => {
    const { showLesson, mascotState } = useEdu();
    const mascotImage = MASCOT_IMAGES[mascotState] || MASCOT_IMAGES.coin;

    return (
        <button
            onClick={() => showLesson(topic)}
            className={`relative group transition-transform hover:scale-105 active:scale-95 flex flex-col items-center ${className}`}
            title="Clique para ver a Dica do FIN"
        >
            <div className="w-20 h-20 bg-white rounded-full shadow-xl border-4 border-blue-100 overflow-hidden flex items-center justify-center relative z-10">
                <img
                    src={mascotImage}
                    alt="Ajuda FIN"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md -mt-3 z-20 border-2 border-white">
                AJUDA
            </div>
        </button>
    );
};

export default EduHelpButton;
