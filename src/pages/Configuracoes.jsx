import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, authService } from '../services/api';
import { User, Lock, Save, Check, AlertCircle, Camera, Upload } from 'lucide-react';

const Configuracoes = () => {
    const { user, updateUser, changePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        nome: '',
        avatar: '',
        email: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.obterPerfil();
            if (response.success) {
                setProfileData({
                    nome: response.data.nome || '',
                    avatar: response.data.avatar || '',
                    email: response.data.email || ''
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const response = await userService.uploadAvatar(file);
            if (response.success) {
                setProfileData(prev => ({ ...prev, avatar: response.data.avatarUrl }));
                setMessage({ type: 'success', text: 'Imagem enviada com sucesso!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao enviar imagem' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const response = await userService.atualizarPerfil({
                nome: profileData.nome,
                avatar: profileData.avatar
            });

            if (response.success) {
                updateUser(response.data);
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.novaSenha !== passwordData.confirmarSenha) {
            setMessage({ type: 'error', text: 'As senhas não conferem' });
            return;
        }

        if (passwordData.novaSenha.length < 6) {
            setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword(passwordData.senhaAtual, passwordData.novaSenha);

            if (response.success) {
                setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
                setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Erro ao alterar senha' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perfil */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="text-indigo-600" size={24} />
                        <h2 className="text-lg font-semibold text-gray-800">Perfil do Usuário</h2>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-2 overflow-hidden border-2 border-indigo-200 relative group">
                                {profileData.avatar ? (
                                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {profileData.nome?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all cursor-pointer"
                                    onClick={() => document.getElementById('avatar-upload').click()}
                                >
                                    <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">Pré-visualização</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={profileData.nome}
                                onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Perfil</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Camera className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={profileData.avatar}
                                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                                    className="w-full pl-10 pr-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="https://exemplo.com/foto.jpg"
                                />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('avatar-upload').click()}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer"
                                    title="Fazer upload do computador"
                                >
                                    <Upload size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Cole o link ou faça upload de uma imagem</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Save size={20} />
                            Salvar Alterações
                        </button>
                    </form>
                </div>

                {/* Segurança */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="text-indigo-600" size={24} />
                        <h2 className="text-lg font-semibold text-gray-800">Segurança</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                            <input
                                type="password"
                                value={passwordData.senhaAtual}
                                onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                value={passwordData.novaSenha}
                                onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={passwordData.confirmarSenha}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 border border-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                            <Lock size={20} />
                            Alterar Senha
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;
