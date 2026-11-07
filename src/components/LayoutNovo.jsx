import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from "./theme-provider";
import { useEdu } from '../contexts/EduContext';
import { useLevel } from '../contexts/LevelContext';
import EduMascot from './EduMascot';
import VideoPopup from './VideoPopup';
import PageTutorialVideo from './PageTutorialVideo';
import CurrencyUpdateAnnouncer from './CurrencyUpdateAnnouncer';
import LanguageSelector from './LanguageSelector';
import { GlobalFieldHelpEnhancer } from './FieldHelpTooltip';
import { useLanguage } from '../contexts/LanguageContext';
import NivelExperienciaModal from './NivelExperienciaModal';
import OnboardingInicianteModal from './OnboardingInicianteModal';
import WelcomeGuideModal from './WelcomeGuideModal';
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
  Plane,
  Sparkles,
  Compass
} from 'lucide-react';

const LayoutNovo = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isDocked, undockMascot } = useEdu();
  const { t } = useLanguage();
  const {
    currentLevel,
    levelInfo,
    isPathAllowed,
    getPathLabelOverride,
    openLevelModal,
    openOnboardingModal
  } = useLevel();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Exibir Restauração/Restore APENAS em modo de Homologação (Local/Dev)
  const isHomologacao = import.meta.env.DEV || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  const rawMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/orcamento', icon: Wallet, label: 'Orçamento' },
    { path: '/receitas', icon: TrendingUp, label: 'Receitas' },
    { path: '/despesas', icon: TrendingDown, label: 'Despesas' },
    { path: '/cartoes', icon: CreditCard, label: 'Formas de Pagamento' },
    { path: '/viagens', icon: Plane, label: 'Viagens' },
    { path: '/relatorios', icon: PieChart, label: 'Relatórios' },
    { path: '/dre', icon: FileBarChart, label: 'DRE' },
    { path: '/backup', icon: Database, label: 'Backup' },
    ...(isHomologacao ? [{ path: '/restauracao', icon: RefreshCw, label: 'Restauração' }] : []),
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  if (user?.tipo === 'admin') {
    rawMenuItems.unshift({ path: '/admin', icon: LayoutDashboard, label: 'Painel Admin' });
  }

  // Filtragem dinâmica de acordo com o Nível de Experiência selecionado
  const menuItems = rawMenuItems
    .filter(item => isPathAllowed(item.path))
    .map(item => ({
      ...item,
      label: getPathLabelOverride(item.path, item.label)
    }));

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    const activeStyles = 'bg-custom-gold text-black shadow-custom border border-custom-gold font-semibold';

    return (
      <Link
        to={item.path}
        onClick={onClick}
        title={isSidebarCollapsed ? t(item.label) : undefined}
        className={`flex items-center rounded-custom transition-custom ${
          isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
        } ${isActive
          ? activeStyles
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
          }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isSidebarCollapsed && <span className="font-medium">{t(item.label)}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-custom-primary text-custom-main flex transition-custom">
        <VideoPopup />
        <CurrencyUpdateAnnouncer />
        <GlobalFieldHelpEnhancer />
        <NivelExperienciaModal />
        <OnboardingInicianteModal />
        <WelcomeGuideModal />

        {/* Sidebar Desktop */}
        <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-custom-card border-r border-custom-color fixed h-full z-10 transition-all duration-300 ease-in-out`}>
          <div className={`p-6 border-b border-custom-color flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed ? (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-custom-gold tracking-tight">Meu Bolso</h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('Gestão Financeira Inteligente')}</p>
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

          {/* User Card + Nível de Experiência */}
          <div className={`p-4 border-b border-custom-color bg-custom-gold/5 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
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

            {/* Seletor de Nível no Sidebar Desktop */}
            {!isSidebarCollapsed ? (
              <div className="mt-3 pt-2.5 border-t border-custom-color/40 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={openLevelModal}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${levelInfo.colorBg} ${levelInfo.colorText} ${levelInfo.colorBorder} hover:scale-[1.02] shadow-2xs`}
                  title="Clique para alternar o modo de uso (Iniciante, Fácil, Intermediário, Avançado)"
                >
                  <span>{levelInfo.badge}</span>
                  <span className="text-[10px] font-bold opacity-75 underline decoration-dotted">Trocar</span>
                </button>

                {currentLevel === 'iniciante' && (
                  <button
                    type="button"
                    onClick={openOnboardingModal}
                    className="text-[11px] text-custom-gold hover:underline font-semibold cursor-pointer"
                    title="Configuração rápida para iniciantes"
                  >
                    Questionário
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openLevelModal}
                className={`mt-2 p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${levelInfo.colorBg} ${levelInfo.colorText} ${levelInfo.colorBorder}`}
                title={`Nível: ${levelInfo.name} - Clique para alternar`}
              >
                {currentLevel === 'iniciante' && '🌱'}
                {currentLevel === 'facil' && '🟢'}
                {currentLevel === 'intermediario' && '🟡'}
                {currentLevel === 'avancado' && '👑'}
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}

            {/* Item fixo de Ajuda FIN logo abaixo dos itens */}
            <button
              type="button"
              onClick={() => undockMascot()}
              title={isSidebarCollapsed ? t("Ajuda FIN") : undefined}
              className={`flex items-center w-full rounded-custom transition-custom ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left'
              } text-gray-600 dark:text-slate-400 hover:bg-custom-gold/15 hover:text-custom-gold dark:hover:text-custom-gold cursor-pointer group`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-custom-gold/50 flex items-center justify-center bg-white shadow-xs">
                <img src="/assets/fin_coin_boy.png" alt="FIN" className="w-full h-full object-cover" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="font-medium text-sm text-custom-main group-hover:text-custom-gold transition-colors">
                    {t('Ajuda FIN')}
                  </span>
                  {isDocked && (
                    <span className="text-[10px] bg-custom-gold/20 text-custom-gold font-bold px-1.5 py-0.5 rounded-full border border-custom-gold/30 animate-pulse">
                      {t('Ativar')}
                    </span>
                  )}
                </div>
              )}
            </button>
          </nav>

          <div className="p-4 border-t border-custom-color space-y-2">
            <div className={isSidebarCollapsed ? 'flex justify-center' : 'w-full'}>
              <LanguageSelector
                variant={isSidebarCollapsed ? 'compact' : 'sidebar'}
                align="left"
                showQuickFeatured={false}
                className={isSidebarCollapsed ? '' : 'w-full'}
              />
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? t("Tema Claro") : t("Tema Escuro")}
              className={`flex items-center w-full text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-custom transition-custom ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left'
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-custom-gold" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              {!isSidebarCollapsed && (
                <span className="font-medium text-[13px] truncate">
                  {theme === "dark" ? t("Tema Escuro") : t("Tema Claro")}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? t("Sair") : undefined}
              className={`flex items-center w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-custom transition-custom ${
                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-left'
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && <span className="font-medium">{t("Sair")}</span>}
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openLevelModal}
                className={`px-2 py-1 rounded-lg text-xs font-bold border ${levelInfo.colorBg} ${levelInfo.colorText} ${levelInfo.colorBorder}`}
                title="Modo de Uso"
              >
                {levelInfo.badge}
              </button>
              <LanguageSelector variant="compact" align="right" showQuickFeatured={false} />
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-custom transition-custom"
                aria-label="Alternar tema"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
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

          {/* Perfil do usuário Mobile */}
          <div className="px-5 py-4 bg-custom-gold/5 border-b border-custom-color">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-custom bg-custom-gold text-black flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-custom">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-custom-main truncate">
                  {user?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-custom-color/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  openLevelModal();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${levelInfo.colorBg} ${levelInfo.colorText} ${levelInfo.colorBorder}`}
              >
                <span>{levelInfo.badge}</span>
                <span className="text-[10px] font-bold opacity-80 underline">Trocar</span>
              </button>

              {currentLevel === 'iniciante' && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    openOnboardingModal();
                  }}
                  className="text-xs text-custom-gold font-semibold hover:underline"
                >
                  🚀 Questionário
                </button>
              )}
            </div>
          </div>

          {/* Links de navegação */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} onClick={closeMobileMenu} />
            ))}

            {/* Item de Ajuda FIN no mobile */}
            <button
              type="button"
              onClick={() => {
                undockMascot();
                closeMobileMenu();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-custom text-gray-600 dark:text-slate-400 hover:bg-custom-gold/15 hover:text-custom-gold dark:hover:text-custom-gold cursor-pointer group transition-custom"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-custom-gold/50 flex items-center justify-center bg-white shadow-xs">
                <img src="/assets/fin_coin_boy.png" alt="FIN" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="font-medium text-sm text-custom-main group-hover:text-custom-gold transition-colors">
                  {t("Ajuda FIN")}
                </span>
                {isDocked && (
                  <span className="text-[10px] bg-custom-gold/20 text-custom-gold font-bold px-1.5 py-0.5 rounded-full border border-custom-gold/30 animate-pulse">
                    {t("Ativar")}
                  </span>
                )}
              </div>
            </button>
          </nav>

          {/* Rodapé do menu mobile */}
          <div className="p-4 border-t border-custom-color space-y-2">
            <LanguageSelector variant="sidebar" align="left" showQuickFeatured={false} className="w-full" />
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-custom transition-custom"
            >
              {theme === "dark" ? <Moon className="w-5 h-5 text-custom-gold" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">{theme === "dark" ? t("Tema Escuro") : t("Tema Claro")}</span>
            </button>
            <button
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-custom transition-custom"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t("Sair")}</span>
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
            {/* Barra superior global com Guia Inicial, Vídeo-Aula, Seletor de Nível e Idioma */}
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-welcome-guide'))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs bg-custom-card text-custom-main border-custom-gold/40 hover:border-custom-gold hover:bg-custom-gold/10"
                title="Abrir o Guia Inicial de Boas-Vindas e Ordem de Configuração"
              >
                <Sparkles className="w-3.5 h-3.5 text-custom-gold shrink-0" />
                <span>{t('Guia Inicial')}</span>
              </button>
              <PageTutorialVideo />
              <button
                type="button"
                onClick={openLevelModal}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${levelInfo.colorBg} ${levelInfo.colorText} ${levelInfo.colorBorder} hover:scale-[1.02]`}
                title="Clique para alternar o nível de experiência do sistema"
              >
                <span>{levelInfo.badge}</span>
                <span className="text-[10px] font-bold opacity-75 uppercase">Trocar</span>
              </button>
              <div className="hidden md:block">
                <LanguageSelector variant="default" align="right" showQuickFeatured={true} />
              </div>
            </div>
            {children}
          </div>
        </main>

        {/* MASCOTE GLOBAL */}
        <EduMascot />
      </div>
  );
};

export default LayoutNovo;
