// src/components/auth/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { validarEmail } from '../utils/validations';
import Toast from '../layout/Toast';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState(null);
  const [formulario, setFormulario] = useState({
    email: '',
    senha: ''
  });
  const [erros, setErros] = useState({});
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });

    // Limpa erro do campo ao digitar
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formulario.email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!validarEmail(formulario.email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!formulario.senha.trim()) {
      novosErros.senha = 'Senha é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setToast({ mensagem: 'Por favor, corrija os erros no formulário', tipo: 'erro' });
      return;
    }

    setCarregando(true);
    try {
      const result = await login(formulario.email, formulario.senha);
      if (!result.success) {
        setToast({ mensagem: result.message || 'E-mail ou senha inválidos', tipo: 'erro' });
        return;
      }
      setToast({ mensagem: `Bem-vindo de volta, ${result.user.nome}!`, tipo: 'sucesso' });
      navigate('/dashboard');
    } catch (error) {
      setToast({ mensagem: 'Erro ao fazer login. Tente novamente.', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6 transition-colors duration-300">
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Faça login na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formulario.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  erros.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="joao@exemplo.com"
              />
            </div>
            {erros.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="senha"
                name="senha"
                value={formulario.senha}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  erros.senha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.senha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.senha}
              </p>
            )}
          </div>

          {/* Botão Login */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Fazer Login
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-2 text-center">
          <button
            onClick={() => navigate('/cadastro')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
          >
            Criar uma conta
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Esqueceu a senha? <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Recuperar</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
