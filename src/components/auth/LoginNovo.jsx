// src/components/auth/LoginNovo.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const LoginNovo = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    username: ''
  });
  const [modoAdmin, setModoAdmin] = useState(false);

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

    if (!modoAdmin) {
      if (!formData.email) {
        newErrors.email = 'E-mail é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
      }
    } else {
      if (!formData.username) {
        newErrors.username = 'Usuário é obrigatório';
      }
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
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
      let result;

      if (modoAdmin) {
        // Login especial do admin
        result = await login(null, formData.senha, formData.username);
      } else {
        // Login normal
        result = await login(formData.email, formData.senha);
      }

      if (result.success) {
        if (result.primeiroAcesso || result.loginEspecial) {
          navigate('/alterar-senha-obrigatorio');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (result.message && /não verificada|OTP/i.test(result.message)) {
          navigate('/validar-otp', { state: { email: formData.email } });
        } else {
          setApiError(result.message || 'Erro ao fazer login');
        }
      }
    } catch (error) {
      setApiError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600">
              {modoAdmin ? 'Login Administrativo' : 'Entre com suas credenciais para acessar'}
            </p>
          </div>

          {/* Alternador de modo */}
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setModoAdmin(!modoAdmin)}
              className={`text-sm font-medium transition-colors ${modoAdmin
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-blue-600 hover:text-blue-700'
                }`}
            >
              {modoAdmin ? '↩️ Voltar para login normal' : '🔑 Login Administrativo'}
            </button>
          </div>

          {/* Erro da API */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username (apenas modo admin) */}
            {modoAdmin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário Administrativo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    placeholder="admin"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Use 'admin' para acesso especial</p>
              </div>
            )}

            {/* E-mail (apenas modo normal) */}
            {!modoAdmin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.senha ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/esqueci-senha"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="font-medium text-blue-600 hover:text-blue-700 transition"
              >
                Cadastre-se
              </Link>
            </p>

            <Link
              to="/"
              className="block text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Voltar para página inicial
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Termos de Uso
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginNovo;
