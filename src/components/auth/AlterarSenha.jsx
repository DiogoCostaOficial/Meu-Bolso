// src/components/auth/AlterarSenha.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { validarSenha } from '../utils/validations';
import Toast from '../layout/Toast';

const AlterarSenha = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [toast, setToast] = useState(null);
  const [formulario, setFormulario] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: ''
  });
  const [erros, setErros] = useState({});
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = () => {
    try {
      const session = localStorage.getItem('SESSION');
      if (!session) {
        setToast({ mensagem: 'Sessão expirada. Faça login novamente.', tipo: 'aviso' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const sessionData = JSON.parse(session);
      setUsuario(sessionData);
    } catch (error) {
      setToast({ mensagem: 'Erro ao carregar dados do usuário.', tipo: 'erro' });
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

    if (!formulario.senhaAtual.trim()) {
      novosErros.senhaAtual = 'Senha atual é obrigatória';
    }

    if (!formulario.novaSenha.trim()) {
      novosErros.novaSenha = 'Nova senha é obrigatória';
    } else if (!validarSenha(formulario.novaSenha)) {
      novosErros.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
    } else if (formulario.novaSenha === formulario.senhaAtual) {
      novosErros.novaSenha = 'Nova senha deve ser diferente da atual';
    }

    if (!formulario.confirmarNovaSenha.trim()) {
      novosErros.confirmarNovaSenha = 'Confirmação de senha é obrigatória';
    } else if (formulario.confirmarNovaSenha !== formulario.novaSenha) {
      novosErros.confirmarNovaSenha = 'As senhas não coincidem';
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
        // Busca o usuário no localStorage
        const usuarios = JSON.parse(localStorage.getItem('USUARIOS') || '[]');
        const usuarioEncontrado = usuarios.find(u => u.id === usuario.id);

        if (!usuarioEncontrado) {
          throw new Error('Usuário não encontrado');
        }

        // Verifica se a senha atual está correta
        if (usuarioEncontrado.senha !== formulario.senhaAtual) {
          setToast({ mensagem: 'Senha atual incorreta', tipo: 'erro' });
          setCarregando(false);
          return;
        }

        // Atualiza a senha
        const indiceUsuario = usuarios.findIndex(u => u.id === usuario.id);
        usuarios[indiceUsuario] = {
          ...usuarios[indiceUsuario],
          senha: formulario.novaSenha,
          dataUltimaAlteracao: new Date().toISOString()
        };

        localStorage.setItem('USUARIOS', JSON.stringify(usuarios));

        // Atualiza a sessão com a nova senha (opcional, para consistência)
        const novaSessao = { ...usuario, senha: formulario.novaSenha };
        localStorage.setItem('SESSION', JSON.stringify(novaSessao));

        setToast({
          mensagem: 'Senha alterada com sucesso!',
          tipo: 'sucesso'
        });

        // Redireciona para dashboard após 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        setToast({ mensagem: 'Erro ao alterar senha. Tente novamente.', tipo: 'erro' });
      } finally {
        setCarregando(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6 transition-colors duration-300">
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Alterar Senha</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Olá, {usuario?.nome}!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senha Atual */}
          <div>
            <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="senhaAtual"
                name="senhaAtual"
                value={formulario.senhaAtual}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${erros.senhaAtual ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.senhaAtual && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.senhaAtual}
              </p>
            )}
          </div>

          {/* Nova Senha */}
          <div>
            <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="novaSenha"
                name="novaSenha"
                value={formulario.novaSenha}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${erros.novaSenha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.novaSenha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.novaSenha}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mínimo de 6 caracteres e diferente da atual
            </p>
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <label htmlFor="confirmarNovaSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="confirmarNovaSenha"
                name="confirmarNovaSenha"
                value={formulario.confirmarNovaSenha}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${erros.confirmarNovaSenha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="••••••••"
              />
            </div>
            {erros.confirmarNovaSenha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.confirmarNovaSenha}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Alterar Senha
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenha;
