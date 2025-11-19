import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.verificarToken();
        
        if (response && response.sucesso) {
          const usuarioLocal = authService.getUsuario();
          setUsuario(usuarioLocal);
          setAutenticado(true);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    } finally {
      setCarregando(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await authService.login(email, senha);
      
      if (response.sucesso) {
        setUsuario(response.dados.usuario);
        setAutenticado(true);
        return { sucesso: true, dados: response.dados };
      }
      
      return { sucesso: false, mensagem: response.mensagem };
    } catch (error) {
      return { sucesso: false, mensagem: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    setAutenticado(false);
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    try {
      const response = await authService.alterarSenha(senhaAtual, novaSenha);
      
      if (response.sucesso) {
        // Atualizar usuário local para remover flag de primeiro acesso
        const usuarioAtualizado = { ...usuario, primeiroAcesso: false };
        setUsuario(usuarioAtualizado);
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      }
      
      return response;
    } catch (error) {
      return { sucesso: false, mensagem: error.message };
    }
  };

  const value = {
    usuario,
    autenticado,
    carregando,
    login,
    logout,
    alterarSenha,
    verificarAutenticacao
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;
