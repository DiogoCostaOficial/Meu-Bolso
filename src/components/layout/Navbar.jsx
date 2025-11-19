// src/components/layout/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há usuário logado
    const session = localStorage.getItem('SESSION');
    if (session) {
      const sessionData = JSON.parse(session);
      setUsuarioLogado(sessionData);
    }

    // Verifica preferência de tema
    const temaPreferido = localStorage.getItem('TEMA');
    if (temaPreferido === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('TEMA', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('TEMA', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('SESSION');
    setUsuarioLogado(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sistema de Usuários
            </h1>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {/* Botão Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Informações do Usuário */}
            {usuarioLogado && (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {usuarioLogado.nome}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
