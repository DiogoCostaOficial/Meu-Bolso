// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LayoutNovo from './LayoutNovo';

import { EduProvider } from '../contexts/EduContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Hook para obter a localização atual

  // Derivar variáveis para compatibilidade
  const autenticado = !!user;
  const usuario = user;
  const carregando = loading;

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Carregando...</p>
      </div>
    );
  }

  if (!autenticado) {
    // Se não estiver autenticado (ex: ao clicar em Sair), redireciona para a tela inicial
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Lógica para proteger a rota /admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute && usuario?.tipo !== 'admin') {
    // Se tentar acessar /admin e não for admin, redireciona para o dashboard
    return <Navigate to="/dashboard" replace />;
  }

  const content = children ? children : <Outlet />;
  return (
    <EduProvider>
      <LayoutNovo>{content}</LayoutNovo>
    </EduProvider>
  );
};

export default ProtectedRoute;
