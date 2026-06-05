// src/components/auth/AtivarConta.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { validarSenha } from '../utils/validations';
import Toast from '../layout/Toast';

const AtivarConta = () => {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState(null);
  const [formulario, setFormulario] = useState({
    senha: '',
    confirmarSenha: ''
  });
  const [erros, setErros] = useState({});
  const [usuario, setUsuario] = useState(null);

  // Carrega o usuário quando a página é aberta
  useEffect(() => {
    carregarUsuario();
  }, [id]);

  const carregarUsuario = () => {
    try {
      const usuarios = JSON.parse(localStorage.getItem('USUARIOS') || '[]');
      const usuarioEncontrado = usuarios.find(u => u.id === id && u.status === 'pendente');

      if (!usuarioEncontrado) {
        setToast({
          mensagem: 'Conta não encontrada ou já ativada. Faça login.',
          tipo: 'erro'
        });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      setUsuario(usuarioEncontrado);
      setCarregando(false);
    } catch (error) {
      setToast({ mensagem: 'Erro ao carregar dados. Tente novamente.', tipo: 'erro' });
      setCarregando(false);
    }
  };

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

    if (!formulario.senha.trim()) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (!validarSenha(formulario.senha)) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formulario.confirmarSenha.trim()) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formulario.confirmarSenha !== formulario.senha) {
      novosErros.confirmarSenha = 'As senhas não coincidem';
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

    // Simula delay de requisição
    setTimeout(() => {
      try {
        // Atualiza o usuário no localStorage
        const usuarios = JSON.parse(localStorage.getItem('USUARIOS') || '[]');
        const indiceUsuario = usuarios.findIndex(u => u.id === id);

        if (indiceUsuario !== -1) {
          usuarios[indiceUsuario] = {
            ...usuarios[indiceUsuario],
            senha: formulario.senha, // Salva a senha (em produção, seria hash)
            status: 'ativo',
            dataAtivacao: new Date().toISOString()
          };

          localStorage.setItem('USUARIOS', JSON.stringify(usuarios));

          setToast({
            mensagem: 'Conta ativada com sucesso! Redirecionando para login...',
            tipo: 'sucesso'
          });

          // Redireciona para login após 2 segundos
          setTimeout(() => {
            navigate('/login');
          }, 2000);

        } else {
          throw new Error('Usuário não encontrado');
        }

      } catch (error) {
        setToast({ mensagem: 'Erro ao ativar conta. Tente novamente.', tipo: 'erro' });
      } finally {
        setCarregando(false);
      }
    }, 1000);
  };

  // Se ainda está carregando
  if (carregando) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não encontrou o usuário
  if (!usuario) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conta não encontrada</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-slate-800 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ativar Conta</h2>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Olá, <span className="font-medium">{usuario.nome}</span>!
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            Defina sua senha para ativar a conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                className={`w-full pl-10 pr-4 py-3 border ${erros.senha ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.senha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.senha}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
              Mínimo de 6 caracteres
            </p>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formulario.confirmarSenha}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${erros.confirmarSenha ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.confirmarSenha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.confirmarSenha}
              </p>
            )}
          </div>

          {/* Botão Ativar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ativando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Ativar Conta
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-gray-600 dark:text-slate-400">
            Já ativou sua conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AtivarConta;
