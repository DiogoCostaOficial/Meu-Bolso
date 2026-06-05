import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const EsqueciSenha = () => {
    const navigate = useNavigate();
    const { requestPasswordReset } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setMessage({ type: 'error', text: 'Por favor, informe seu e-mail.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await requestPasswordReset(email);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.'
                });
                // Redirecionar após 2 segundos para a tela de redefinição
                setTimeout(() => {
                    navigate('/redefinir-senha', { state: { email } });
                }, 2000);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao conectar com o servidor.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950 px-4 transition-colors duration-300">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800 transition-colors">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Esqueceu a senha?
                        </h1>
                        <p className="text-gray-600 dark:text-slate-400">
                            Digite seu e-mail para receber um código de recuperação.
                        </p>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start ${message.type === 'success' 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30' 
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${message.type === 'success' 
                                ? 'text-green-800 dark:text-green-300' 
                                : 'text-red-800 dark:text-red-300'
                                }`}>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Código'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-300 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EsqueciSenha;
