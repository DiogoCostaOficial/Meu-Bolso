// src/components/layout/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Database,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('SESSION');
    if (session) {
      setUsuario(JSON.parse(session));
    }
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/receitas', icon: TrendingUp, label: 'Receitas' },
    { path: '/despesas', icon: TrendingDown, label: 'Despesas' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/dre', icon: FileText, label: 'DRE' },
    { path: '/backup', icon: Database, label: 'Backup' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && (
          <h2 className="text-xl font-bold">Financeiro</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Info */}
      {usuario && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate('/dashboard-usuario')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{usuario.nome}</p>
                <p className="text-xs text-gray-400 truncate">{usuario.email}</p>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
