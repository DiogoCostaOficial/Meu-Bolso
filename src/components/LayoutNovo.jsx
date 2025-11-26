// src/components/LayoutNovo.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, CreditCard, FileText, Save, Menu, X, BarChart3, Target, LogOut, Shield, User, RotateCcw, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ModeToggle } from './mode-toggle';

const LayoutNovo = ({ children, abaAtiva, setAbaAtiva }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const usuario = user;
  const [menuAberto, setMenuAberto] = React.useState(false);

  // Determinar aba ativa baseada na rota se a prop não for passada
  const activeTab = abaAtiva || location.pathname.substring(1) || 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (itemId) => {
    if (setAbaAtiva) {
      setAbaAtiva(itemId);
    }
    setMenuAberto(false);

    if (itemId === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${itemId}`);
    }
  };

  const menuItems = [
    { id: 'dashboard', nome: 'Dashboard', icone: LayoutDashboard },
    { id: 'orcamento', nome: 'Orçamento', icone: Target },
    { id: 'receitas', nome: 'Receitas', icone: DollarSign },
    { id: 'despesas', nome: 'Despesas', icone: CreditCard },
    { id: 'cartoes', nome: 'Cartões', icone: CreditCard },
    { id: 'relatorios', nome: 'Relatórios', icone: BarChart3 },
    { id: 'dre', nome: 'DRE', icone: FileText },
    { id: 'backup', nome: 'Backup', icone: Save },
    { id: 'system-restore', nome: 'Restauração', icone: RotateCcw },
    { id: 'configuracoes', nome: 'Configurações', icone: Settings }
  ];

  if (usuario?.tipo === 'admin') {
    menuItems.unshift({
      id: 'admin',
      nome: 'Painel Admin',
      icone: Shield
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* HEADER MOBILE */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meu Bolso</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
          >
            {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* SIDEBAR - DESKTOP */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen shadow-lg transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Meu Bolso
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Controle Financeiro</p>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                {usuario?.avatar ? (
                  <img src={usuario.avatar} alt={usuario.nome} className="w-full h-full object-cover" />
                ) : (
                  usuario?.nome?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {usuario?.nome}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {usuario?.email}
                </p>
              </div>
            </div>
            {usuario?.tipo === 'admin' && (
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full w-fit">
                <Shield className="w-3 h-3" />
                Administrador
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icone;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.nome}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</span>
              <ModeToggle />
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
              <p className="font-semibold">Sistema Financeiro</p>
              <p className="mt-1">Versão 2.0 com Autenticação</p>
            </div>
          </div>
        </aside>

        {/* SIDEBAR - MOBILE */}
        {menuAberto && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setMenuAberto(false)}
          >
            <aside
              className="w-64 bg-white dark:bg-gray-800 h-full shadow-2xl transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Meu Bolso
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Controle Financeiro</p>
                </div>
                <button
                  onClick={() => setMenuAberto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                    {usuario?.avatar ? (
                      <img src={usuario.avatar} alt={usuario.nome} className="w-full h-full object-cover" />
                    ) : (
                      usuario?.nome?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {usuario?.nome}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {usuario?.email}
                    </p>
                  </div>
                </div>
                {usuario?.tipo === 'admin' && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full w-fit">
                    <Shield className="w-3 h-3" />
                    Administrador
                  </div>
                )}
              </div>

              <nav className="p-4 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icone;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg dark:shadow-none'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.nome}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</span>
                  <ModeToggle />
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutNovo;
