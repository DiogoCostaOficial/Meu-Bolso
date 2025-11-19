import React from 'react';
import { LayoutDashboard, DollarSign, CreditCard, FileText, Save, Menu, X, BarChart3, Target, Bitcoin, BitcoinIcon } from 'lucide-react';

const Layout = ({ children, abaAtiva, setAbaAtiva }) => {
  const [menuAberto, setMenuAberto] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', nome: 'Dashboard', icone: LayoutDashboard },
    { id: 'orcamento', nome: 'Orçamento', icone: Target },
    { id: 'receitas', nome: 'Receitas', icone: DollarSign },
    { id: 'despesas', nome: 'Despesas', icone: CreditCard },     
    { id: 'relatorios', nome: 'Relatórios', icone: BarChart3 },
    { id: 'dre', nome: 'DRE', icone: FileText },
    { id: 'backup', nome: 'Backup', icone: Save }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER MOBILE */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Controle Financeiro</h1>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* SIDEBAR - DESKTOP */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Finanças Fácil</h1>
            <p className="text-sm text-gray-600">Controle Financeiro</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icone;
              return (
                <button
                  key={item.id}
                  onClick={() => setAbaAtiva(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    abaAtiva === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.nome}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              <p className="font-semibold">Sistema Financeiro</p>
              <p className="text-xs mt-1">Versão 1.0</p>
            </div>
          </div>
        </aside>

        {/* SIDEBAR - MOBILE */}
        {menuAberto && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMenuAberto(false)}>
            <aside className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Controle</h1>
                  <p className="text-sm text-gray-600">Financeiro</p>
                </div>
                <button
                  onClick={() => setMenuAberto(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icone;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAbaAtiva(item.id);
                        setMenuAberto(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        abaAtiva === item.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.nome}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
