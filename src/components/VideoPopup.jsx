import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const VideoPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const shouldHide = localStorage.getItem('hideIntroVideo');
        if (!shouldHide) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('hideIntroVideo', 'true');
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-4 max-w-4xl w-full mx-4 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute -top-4 -right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-4">
                    <video
                        src="/assets/intro.mp4"
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    >
                        Seu navegador não suporta a reprodução de vídeos.
                    </video>
                </div>

                <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">Não mostrar este vídeo novamente</span>
                    </label>

                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                    >
                        Continuar para o Sistema
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPopup;
