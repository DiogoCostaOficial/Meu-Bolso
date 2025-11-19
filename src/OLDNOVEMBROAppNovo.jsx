import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutNovo from './components/LayoutNovo';

// Homepage
import Homepage from './pages/Homepage';

// Páginas de Autenticação
import LoginNovo from './components/auth/LoginNovo';
import CadastroNovo from './components/auth/CadastroNovo';
import AlterarSenhaObrigatorio from './components/auth/AlterarSenhaObrigatorio';

// Páginas do Sistema
import Dashboard from './pages/Dashboard';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import DRE from './pages/DRE';
import Backup from './components/Backup';
import Relatorios from './pages/Relatorios';
import Orcamento from './pages/Orcamento';

// Páginas Admin
import PainelAdmin from './pages/admin/PainelAdmin';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard');

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'admin':
        return <PainelAdmin />;
      case 'dashboard':
        return <Dashboard />;
      case 'receitas':
        return <Receitas />;
      case 'despesas':
        return <Despesas />;
      case 'dre':
        return <DRE />;
      case 'backup':
        return <Backup />;
      case 'relatorios':
        return <Relatorios />;
      case 'orcamento':
        return <Orcamento />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Homepage />} />
          
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginNovo />} />
          <Route path="/cadastro" element={<CadastroNovo />} />
          
          {/* Rota de Alteração de Senha Obrigatória - permite primeiro acesso */}
          <Route 
            path="/alterar-senha-obrigatorio" 
            element={
              <ProtectedRoute allowFirstAccess={true}>
                <AlterarSenhaObrigatorio />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LayoutNovo abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva}>
                  {renderizarConteudo()}
                </LayoutNovo>
              </ProtectedRoute>
            }
          />
          
          {/* 404 - Redireciona para homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
