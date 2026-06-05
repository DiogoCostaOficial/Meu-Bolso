// src/components/auth/ValidarOTP.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Mail, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ValidarOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { validateOTP, resendOTP } = useAuth();

  const email = location.state?.email || '';

  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos em segundos

  // Countdown timer
  useEffect(() => {
    if (tempoRestante > 0) {
      const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tempoRestante]);

  // Redireciona se não tiver email
  useEffect(() => {
    if (!email) {
      navigate('/cadastro');
    }
  }, [email, navigate]);

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Apenas números
    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value;
    setCodigo(novoCodigo);

    // Auto-foco no próximo campo
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    setError('');
  };

  const handleKeyDown = (index, e) => {
    // Backspace no campo vazio volta para o anterior
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const novoCodigo = pastedData.split('');
    while (novoCodigo.length < 6) novoCodigo.push('');

    setCodigo(novoCodigo);
    document.getElementById('otp-5')?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const codigoCompleto = codigo.join('');

    if (codigoCompleto.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await validateOTP(email, codigoCompleto);

      if (result.success) {
        setSuccess('Conta ativada com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Código inválido');
        setCodigo(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      setError('Erro ao validar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resendOTP(email);

      if (result.success) {
        setSuccess('Novo código enviado para seu e-mail!');
        setTempoRestante(600); // Reinicia o timer
        setCodigo(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        setError(result.message || 'Erro ao reenviar código');
      }
    } catch (error) {
      setError('Erro ao reenviar código. Tente novamente.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Verificação de Conta
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              {email}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Código expira em: {formatarTempo(tempoRestante)}
            </span>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
            </div>
          )}

          {/* Formulário OTP */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos OTP */}
            <div className="flex justify-center gap-3">
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Botão Validar */}
            <button
              type="submit"
              disabled={loading || codigo.join('').length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar Código'
              )}
            </button>
          </form>

          {/* Reenviar código */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Não recebeu o código?
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading || tempoRestante > 540} // Permite reenviar após 1 minuto
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm disabled:text-gray-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition"
            >
              {resendLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </span>
              ) : (
                'Reenviar código'
              )}
            </button>
          </div>

          {/* Voltar */}
          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition"
            >
              ← Voltar para o login
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-500">
          Precisa de ajuda?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
};

export default ValidarOTP;
