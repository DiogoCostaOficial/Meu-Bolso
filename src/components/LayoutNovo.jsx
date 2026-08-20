import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from "./theme-provider";
import { EduProvider } from '../contexts/EduContext';
import EduMascot from './EduMascot';
import VideoPopup from './VideoPopup';
import CurrencyUpdateAnnouncer from './CurrencyUpdateAnnouncer';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  Database,
  RefreshCw,
  PieChart,
  FileBarChart,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

const LayoutNovo = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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

  if (user?.tipo === 'admin' || user?.email === 'diogo.grunge@gmail.com') {
    menuItems.unshift({ path: '/admin', icon: LayoutDashboard, label: 'Painel Admin' });
  }

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    const activeStyles = 'bg-custom-gold text-black shadow-custom border border-custom-gold font-semibold';

    return (
      <Link
        to={item.path}
        onClick={onClick}
        title={isSidebarCollapsed ? item.label : undefined}
        className={`flex items-center rounded-custom transition-custom ${
          isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
        } ${isActive
          ? activeStyles
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <EduProvider>
      <div className="min-h-screen bg-custom-primary text-custom-main flex transition-custom">
        <VideoPopup />
        <CurrencyUpdateAnnouncer />

        {/* Sidebar Desktop */}
        <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-custom-card border-r border-custom-color fixed h-full z-10 transition-all duration-300 ease-in-out`}>
          <div className={`p-6 border-b border-custom-color flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed ? (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-custom-gold tracking-tight">Meu Bolso</h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Gestão Financeira Inteligente</p>
                </div>
                <button 
                  onClick={() => setIsSidebarCollapsed(true)} 
                  className="text-gray-400 hover:text-custom-gold cursor-pointer transition-colors p-1"
                  title="Minimizar Menu"
                >
                  <ChevronLeft size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSidebarCollapsed(false)} 
                className="text-gray-400 hover:text-custom-gold cursor-pointer transition-colors p-1"
                title="Expandir Menu"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>

          <div className={`p-4 border-b border-custom-color bg-custom-gold/5 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-custom bg-custom-gold text-black flex items-center justify-center font-bold shadow-custom flex-shrink-0">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-custom-main truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-custom-color space-y-2">
            <button
              onClick={() => {
                if (theme === "light" && layoutVariant !== "lux-gold" && layoutVariant !== "neon-glass" && layoutVariant !== "scifi-hud" && layoutVariant !== "cosmic-aurora") {
                  setTheme("dark");
                  setLayoutVariant("modern-fluid");
                } else if (theme === "dark" && layoutVariant === "modern-fluid") {
                  setLayoutVariant("lux-gold");
                } else if (layoutVariant === "lux-gold") {
                  setLayoutVariant("neon-glass");
                } else if (layoutVariant === "neon-glass") {
                  setLayoutVariant("scifi-hud");
                } else if (layoutVariant === "scifi-hud") {
                  setLayoutVariant("cosmic-aurora");
                } else {
                  setLayoutVariant("modern-fluid");
                  setTheme("light");
                }
              }}
              title={
                isSidebarCollapsed
                  ? `Tema: ${
                      layoutVariant === "lux-gold"
                        ? "Golden Luxury"
                        : layoutVariant === "neon-glass"
                        ? "Neon Glass"
                        : layoutVariant === "scifi-hud"
                        ? "Sci-Fi HUD"
                        : layoutVariant === "cosmic-aurora"
                        ? "Cosmic Aurora"
                        : theme === "dark"
                        ? "Escuro"
                        : "Claro"
                    }`
                  : undefined
              }
              className={`flex items-center w-full text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-custom transition-custom ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left'
              }`}
            >
              {layoutVariant === "lux-gold" || layoutVariant === "neon-glass" || layoutVariant === "scifi-hud" || layoutVariant === "cosmic-aurora" ? (
                <Sun className="w-5 h-5 text-custom-gold" />
              ) : theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              {!isSidebarCollapsed && (
                <span className="font-medium text-[13px] truncate">
                  {layoutVariant === "lux-gold"
                    ? "Golden Luxury"
                    : layoutVariant === "neon-glass"
                    ? "Neon Glass"
                    : layoutVariant === "scifi-hud"
                    ? "Sci-Fi HUD"
                    : layoutVariant === "cosmic-aurora"
                    ? "Cosmic Aurora"
                    : theme === "dark"
                    ? "Tema Escuro"
                    : "Tema Claro"}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? "Sair" : undefined}
              className={`flex items-center w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-custom transition-custom ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left'
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div
          className="md:hidden fixed top-0 left-0 right-0 bg-custom-card border-b border-custom-color z-30 transition-custom"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-custom transition-custom"
                aria-label="Abrir menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold text-custom-gold">Meu Bolso</h1>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-custom transition-custom"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-custom-card border-r border-custom-color z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Header do sidebar mobile */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-custom-color">
            <h1 className="text-xl font-bold text-custom-gold">Meu Bolso</h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-custom transition-custom"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Perfil do usuário */}
          <div className="px-5 py-4 bg-custom-gold/5 border-b border-custom-color">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-custom bg-custom-gold text-black flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-custom">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-custom-main truncate">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Links de navegação */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} onClick={closeMobileMenu} />
            ))}
          </nav>

          {/* Rodapé do menu mobile */}
          <div className="p-4 border-t border-custom-color space-y-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-custom transition-custom"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">Tema {theme === "dark" ? "Claro" : "Escuro"}</span>
            </button>
            <button
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-custom transition-custom"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} overflow-x-hidden transition-all duration-300 ease-in-out`}
          style={{
            paddingTop: 'calc(60px + env(safe-area-inset-top))',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>



        {/* MASCOTE GLOBAL */}
        <EduMascot />
      </div>
    </EduProvider>
  );
};

export default LayoutNovo;
