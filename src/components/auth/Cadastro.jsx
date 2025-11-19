// src/components/auth/Cadastro.jsx

import React, { useState } from 'react';
import { Mail, User, Phone, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validarEmail, validarTelefone, formatarTelefone } from '../utils/validations';

const Cadastro = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [toastAtivo, setToastAtivo] = useState(null);
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [erros, setErros] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const valorFormatado = formatarTelefone(value);
      setFormulario({ ...formulario, [name]: valorFormatado });
    } else {
      setFormulario({ ...formulario, [name]: value });
    }

    // Limpa erro do campo ao digitar
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formulario.nome.trim()) {
      novosErros.nome = 'Nome completo é obrigatório';
    } else if (formulario.nome.trim().split(' ').length < 2) {
      novosErros.nome = 'Digite nome e sobrenome';
    }

    if (!formulario.email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!validarEmail(formulario.email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!formulario.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formulario.telefone)) {
      novosErros.telefone = 'Telefone deve ter pelo menos 9 dígitos';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const mostrarToast = (mensagem, tipo) => {
    setToastAtivo({ mensagem, tipo });
  };

  const fecharToast = () => {
    setToastAtivo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarToast('Por favor, corrija os erros no formulário', 'erro');
      return;
    }

    setCarregando(true);

    // Simula delay de requisição
    setTimeout(() => {
      try {
        // Verifica se o e-mail já está cadastrado
        const usuarios = JSON.parse(localStorage.getItem('USUARIOS') || '[]');
        const emailExiste = usuarios.find(u => u.email === formulario.email);

        if (emailExiste) {
          mostrarToast('Este e-mail já está cadastrado', 'erro');
          setCarregando(false);
          return;
        }

        // Cria novo usuário
        const novoUsuario = {
          id: Date.now().toString(),
          ...formulario,
          status: 'pendente',
          dataCadastro: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('USUARIOS', JSON.stringify(usuarios));

        mostrarToast(
          'Cadastro realizado! Um link de ativação foi enviado para o seu e-mail.', 
          'sucesso'
        );

        // Redireciona para ativação após 2 segundos
        setTimeout(() => {
          navigate(`/ativar-conta/${novoUsuario.id}`);
        }, 2000);

      } catch (error) {
        mostrarToast('Erro ao cadastrar. Tente novamente.', 'erro');
      } finally {
        setCarregando(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6 transition-colors duration-300">
      {/* Toast Manual */}
      {toastAtivo && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-l-4 ${
              toastAtivo.tipo === 'sucesso'
                ? 'bg-green-50 border-green-500 text-green-800'
                : toastAtivo.tipo === 'erro'
                ? 'bg-red-50 border-red-500 text-red-800'
                : toastAtivo.tipo === 'aviso'
                ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                : 'bg-blue-50 border-blue-500 text-blue-800'
            } transition-all duration-300 ease-in-out max-w-md`}
          >
            {toastAtivo.tipo === 'sucesso' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{toastAtivo.mensagem}</p>
            <button
              onClick={fecharToast}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Criar Conta</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Preencha seus dados para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formulario.nome}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  erros.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="João Silva"
              />
            </div>
            {erros.nome && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.nome}
              </p>
            )}
          </div>

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
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
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

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formulario.telefone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  erros.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300`}
                placeholder="(11) 98765-4321"
                maxLength="15"
              />
            </div>
            {erros.telefone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {erros.telefone}
              </p>
            )}
          </div>

          {/* Botão Cadastrar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Cadastrar
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
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

export default Cadastro;
