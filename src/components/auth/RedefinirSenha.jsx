import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Key, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const RedefinirSenha = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useAuth();

    // Pega o email do estado da navegação (se vier da tela anterior)
    const [email, setEmail] = useState(location.state?.email || '');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!location.state?.email) {
            // Se não tiver email no state, talvez redirecionar para esqueci-senha?
            // Mas vamos deixar o usuário digitar o email caso tenha chegado aqui direto
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !codigo || !novaSenha || !confirmarSenha) {
            setMessage({ type: 'error', text: 'Todos os campos são obrigatórios.' });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setMessage({ type: 'error', text: 'As senhas não conferem.' });
            return;
        }

        if (novaSenha.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await resetPassword(email, codigo, novaSenha);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Senha redefinida com sucesso! Redirecionando para o login...'
                });
                setTimeout(() => {
                    navigate('/login');
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Key className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Redefinir Senha
                        </h1>
                        <p className="text-gray-600">
                            Digite o código enviado ao seu e-mail e sua nova senha.
                        </p>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="seu@email.com"
                                disabled={loading || !!location.state?.email} // Desabilita se veio da tela anterior
                            />
                        </div>

                        <div>
                            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                                Código OTP
                            </label>
                            <input
                                type="text"
                                id="codigo"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition tracking-widest text-center font-mono text-lg"
                                placeholder="000000"
                                maxLength={6}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="novaSenha"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    className="block w-full pl-10 pr-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="confirmarSenha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    className="block w-full pl-10 pr-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Redefinindo...
                                </>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/esqueci-senha"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedefinirSenha;
