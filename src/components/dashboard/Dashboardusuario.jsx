// src/components/dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  User,
  Mail,
  Phone,
  Settings,
  LogOut,
  TrendingUp,
  Activity,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [toastAtivo, setToastAtivo] = useState(null);

  // Dados simulados para os gráficos
  const dadosAcessosSemana = [
    { semana: 'Sem 1', acessos: 5 },
    { semana: 'Sem 2', acessos: 8 },
    { semana: 'Sem 3', acessos: 12 },
    { semana: 'Sem 4', acessos: 7 },
    { semana: 'Sem 5', acessos: 15 }
  ];

  const dadosEvolucao = [
    { mes: 'Jan', acessos: 5 },
    { mes: 'Fev', acessos: 10 },
    { mes: 'Mar', acessos: 15 },
    { mes: 'Abr', acessos: 20 },
    { mes: 'Mai', acessos: 18 }
  ];

  const dadosAcoes = [
    { tipo: 'Login', valor: 45 },
    { tipo: 'Alterar Senha', valor: 25 },
    { tipo: 'Logout', valor: 30 }
  ];

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = () => {
    try {
      const session = localStorage.getItem('SESSION');
      if (!session) {
        mostrarToast('Sessão expirada. Faça login novamente.', 'aviso');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const sessionData = JSON.parse(session);
      setUsuario(sessionData);
      setCarregando(false);
    } catch (error) {
      mostrarToast('Erro ao carregar dados do usuário.', 'erro');
      setCarregando(false);
    }
  };

  const mostrarToast = (mensagem, tipo) => {
    setToastAtivo({ mensagem, tipo });
    setTimeout(() => setToastAtivo(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('SESSION');
    mostrarToast('Logout realizado com sucesso!', 'sucesso');
    setTimeout(() => navigate('/login'), 1500);
  };

  const handleAlterarSenha = () => {
    navigate('/alterar-senha');
  };

  const handleIrParaFinanceiro = () => {
    navigate('/relatorios');
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toast Manual */}
      {toastAtivo && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-l-4 ${toastAtivo.tipo === 'sucesso'
                ? 'bg-green-50 border-green-500 text-green-800'
                : toastAtivo.tipo === 'erro'
                  ? 'bg-red-50 border-red-500 text-red-800'
                  : toastAtivo.tipo === 'aviso'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-blue-50 border-blue-500 text-blue-800'
              } transition-all duration-300 ease-in-out max-w-md`}
          >
            <p className="flex-1 text-sm font-medium">{toastAtivo.mensagem}</p>
            <button
              onClick={() => setToastAtivo(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {usuario.nome}!</h1>
                <p className="text-gray-600 dark:text-gray-400">Bem-vindo ao seu dashboard</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* BOTÃO: Ir para Financeiro */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                <LayoutDashboard className="w-4 h-4" />
                Voltar para Dashboard
              </button>


              {/* BOTÃO: Alterar Senha */}
              <button
                onClick={handleAlterarSenha}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                Alterar Senha
              </button>

              {/* BOTÃO: Sair */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Informações do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Nome</h3>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{usuario.nome}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">E-mail</h3>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{usuario.email}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Telefone</h3>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{usuario.telefone}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Barras - Acessos por Semana */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acessos por Semana</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAcessosSemana}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="acessos" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuição de Ações</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosAcoes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosAcoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Linha - Evolução */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolução de Acessos</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="acessos" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
