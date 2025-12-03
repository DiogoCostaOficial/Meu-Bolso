// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se há usuário logado ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario'); // Mudança: usar 'usuario' em vez de 'user'

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setLoading(false);
  }, []);

  // Função de login
  // Login com Google
  const loginGoogle = async (googleData) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login com Google');
      }

      // Salva token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      setUser(data.user);

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Erro no login Google:', error);
      return {
        success: false,
        message: error.message || 'Erro ao conectar com Google'
      };
    }
  };

  // Função de login
  const login = async (email, senha, username = null) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

      // Preparar dados do login
      const loginData = username
        ? { username, senha } // Login especial do admin
        : { email, senha };  // Login normal

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      // Salva token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user)); // Mudança: usar 'usuario' em vez de 'user'
      setUser(data.user);

      return {
        success: true,
        user: data.user,
        primeiroAcesso: data.user.primeiroAcesso
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login'
      };
    }
  };

  // Função de cadastro
  const register = async (nome, email, senha) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      return { success: true, email: data.email };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar conta'
      };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // Mudança: usar 'usuario' em vez de 'user'
    setUser(null);
    return { success: true };
  };

  // Função para alterar senha
  const changePassword = async (senhaAtual, novaSenha) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

      const response = await fetch(`${API_URL}/auth/alterar-senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao alterar senha');
      }

      // Atualiza dados do usuário
      const updatedUser = { ...user, primeiroAcesso: false };
      localStorage.setItem('usuario', JSON.stringify(updatedUser)); // Mudança: usar 'usuario' em vez de 'user'
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: error.message || 'Erro ao alterar senha'
      };
    }
  };

  // Verifica se usuário é admin
  const isAdmin = () => {
    return user?.tipo === 'admin';
  };

  // Função para obter usuário atual (para systemRestore)
  const getCurrentUser = async () => {
    return user;
  };

  const validateOTP = async (email, codigo) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${API_URL}/auth/validar-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao validar OTP');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resendOTP = async (email) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${API_URL}/auth/reenviar-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao reenviar OTP');
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${API_URL}/auth/solicitar-recuperacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao solicitar recuperação');
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const resetPassword = async (email, codigo, novaSenha) => {
    try {
      const API_URL = import.meta.env.PROD
        ? '/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const response = await fetch(`${API_URL}/auth/redefinir-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, novaSenha })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao redefinir senha');
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
    localStorage.setItem('usuario', JSON.stringify({ ...currentUser, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAdmin,
    validateOTP,
    resendOTP,
    getCurrentUser,
    updateUser,
    requestPasswordReset,
    resetPassword,
    loginGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};

export default AuthContext;
