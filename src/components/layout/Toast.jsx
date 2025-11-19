// src/components/layout/Toast.jsx

import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const Toast = ({ mensagem, tipo = 'sucesso', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const estilos = {
    sucesso: 'bg-green-50 border-green-500 text-green-800',
    erro: 'bg-red-50 border-red-500 text-red-800',
    aviso: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const Icone = tipo === 'sucesso' ? CheckCircle : AlertTriangle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-l-4 ${estilos[tipo]} transition-all duration-300 ease-in-out max-w-md`}
      >
        <Icone className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{mensagem}</p>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
