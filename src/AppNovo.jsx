// src/AppNovo.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginNovo from './components/auth/LoginNovo';
import CadastroNovo from './components/auth/CadastroNovo';
import AlterarSenhaObrigatorio from './components/auth/AlterarSenhaObrigatorio';
import ValidarOTP from './components/auth/ValidarOTP';
import EsqueciSenha from './components/auth/EsqueciSenha';
import RedefinirSenha from './components/auth/RedefinirSenha';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Receitas from './pages/Receitas';
import Despesas from './pages/Despesas';
import DRE from './pages/DRE';
import Relatorios from './pages/Relatorios';
import Orcamento from './pages/Orcamento';
import PainelAdmin from './pages/admin/PainelAdmin';
import Backup from './pages/Backup';
import SystemRestore from './pages/SystemRestore';
import Configuracoes from './pages/Configuracoes';

function AppNovo() {
  return (
    <Routes>
      {/* Landing Page - Rota Pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Rotas de Autenticação - Públicas */}
      <Route path="/login" element={<LoginNovo />} />
      <Route path="/cadastro" element={<CadastroNovo />} />
      <Route path="/validar-otp" element={<ValidarOTP />} />
      <Route path="/alterar-senha-obrigatorio" element={<AlterarSenhaObrigatorio />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />

      {/* Rotas Protegidas - Requerem Login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receitas"
        element={
          <ProtectedRoute>
            <Receitas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/despesas"
        element={
          <ProtectedRoute>
            <Despesas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dre"
        element={
          <ProtectedRoute>
            <DRE />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orcamento"
        element={
          <ProtectedRoute>
            <Orcamento />
          </ProtectedRoute>
        }
      />
      <Route
        path="/backup"
        element={
          <ProtectedRoute>
            <Backup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-restore"
        element={
          <ProtectedRoute>
            <SystemRestore />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        }
      />

      {/* Rota Admin - Protegida e Restrita */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <PainelAdmin />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 - Redireciona para Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppNovo;
