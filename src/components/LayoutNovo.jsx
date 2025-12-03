import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from "./theme-provider";
import { EduProvider } from '../contexts/EduContext';
import EduMascot from './EduMascot';
import VideoPopup from './VideoPopup';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  Database,
  RefreshCw,
  PieChart,
  FileBarChart
} from 'lucide-react';

const LayoutNovo = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/orcamento', icon: Wallet, label: 'Orçamento' },
    { path: '/receitas', icon: TrendingUp, label: 'Receitas' },
    { path: '/despesas', icon: TrendingDown, label: 'Despesas' },
    { path: '/cartoes', icon: CreditCard, label: 'Cartões' },
    { path: '/relatorios', icon: PieChart, label: 'Relatórios' },
    { path: '/dre', icon: FileBarChart, label: 'DRE' },
    { path: '/backup', icon: Database, label: 'Backup' },
    { path: '/restauracao', icon: RefreshCw, label: 'Restauração' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  if (user?.tipo === 'admin') {
    menuItems.push({ path: '/admin', icon: LayoutDashboard, label: 'Painel Admin' });
  }

  return (
    <EduProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <VideoPopup />

        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-600">Meu Bolso</h1>
            <p className="text-xs text-gray-500 mt-1">Controle Financeiro</p>
          </div>

          <div className="p-4 border-b border-gray-100 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">Tema {theme === "dark" ? "Claro" : "Escuro"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-blue-600">Meu Bolso</h1>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-10 bg-gray-800/50" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside className={`md:hidden fixed top-[60px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transform transition-transform duration-200 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 mt-[60px] md:mt-0 overflow-x-hidden">
          {children}
        </main>

        {/* MASCOTE GLOBAL */}
        <EduMascot />
      </div>
    </EduProvider>
  );
};

export default LayoutNovo;
