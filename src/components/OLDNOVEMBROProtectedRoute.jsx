import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, allowFirstAccess = false }) => {
  const { autenticado, carregando, usuario } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se precisa alterar senha (exceto se já estiver na página de alterar senha)
  if (usuario?.primeiroAcesso && !allowFirstAccess && location.pathname !== '/alterar-senha-obrigatorio') {
    return <Navigate to="/alterar-senha-obrigatorio" replace />;
  }

  // Verificar se é rota apenas para admin
  if (adminOnly && usuario?.tipo !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
