// src/components/auth/CadastroNovo.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useLayoutVariant } from '../../contexts/LayoutVariantContext';
import { toast } from 'sonner';

const CadastroNovo = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { layoutVariant } = useLayoutVariant();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const result = await register(formData.nome, formData.email, formData.senha);

      if (result.success) {
        toast.success('Cadastro realizado com sucesso! Verifique seu e-mail.');
        navigate('/validar-otp', { state: { email: formData.email } });
      } else {
        setApiError(result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      setApiError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-custom-primary px-4 py-12 transition-colors duration-300 layout-${layoutVariant}`}>
      <div className="max-w-md w-full">
        <div className="bg-custom-card rounded-2xl shadow-custom p-8 border border-custom-color transition-colors">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-custom-gold/15 rounded-full mb-4">
              <User className="w-8 h-8 text-custom-gold" />
            </div>
            <h1 className="text-3xl font-bold text-custom-main mb-2">
              Crie sua conta
            </h1>
            <p className="text-custom-main opacity-80">
              Comece a organizar suas finanças hoje
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-500 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-custom-main opacity-80 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-custom-card border ${errors.nome ? 'border-red-300' : 'border-custom-color'
                    } rounded-lg text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="João Silva"
                  disabled={loading}
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-500">{errors.nome}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-custom-main opacity-80 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-custom-card border ${errors.email ? 'border-red-300' : 'border-custom-color'
                    } rounded-lg text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-custom-main opacity-80 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-custom-card border ${errors.senha ? 'border-red-300' : 'border-custom-color'
                    } rounded-lg text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-500">{errors.senha}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-custom-main opacity-80 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-custom-card border ${errors.confirmarSenha ? 'border-red-300' : 'border-custom-color'
                    } rounded-lg text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmarSenha}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-custom-gold text-black py-3 px-4 rounded-lg font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-custom-gold focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-custom"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta gratuita'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-custom-main opacity-80">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-bold text-custom-gold hover:opacity-85 transition"
              >
                Faça login
              </Link>
            </p>

            <Link
              to="/"
              className="block text-sm text-custom-main opacity-60 hover:opacity-100 transition"
            >
              ← Voltar para página inicial
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-custom-main opacity-60">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="#" className="text-custom-gold hover:opacity-85">
            Termos de Uso
          </a>
        </p>
      </div>
    </div>
  );
};

export default CadastroNovo;
