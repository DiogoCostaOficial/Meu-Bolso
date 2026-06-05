import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider';
import { userService, authService } from '../services/api';
import { User, Lock, Save, Check, AlertCircle, Camera, Upload, Layers, Trash2, Plus, XCircle, Settings, Shield } from 'lucide-react';

const Configuracoes = () => {
    const { user, updateUser } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('perfil');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        nome: user?.nome || '',
        avatar: user?.avatar || '',
        email: user?.email || ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    });

    const tabs = [
        { id: 'perfil', label: 'Meu Perfil', icon: User },
        { id: 'categorias', label: 'Categorias', icon: Layers },
        { id: 'seguranca', label: 'Segurança', icon: Shield }
    ];

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

        setLoading(true);

        try {
            const response = await authService.alterarSenha(passwordData.senhaAtual, passwordData.novaSenha);

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
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-gray-600 dark:text-slate-400 mt-2">Gerencie sua conta e personalize sua experiência</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar de Navegação */}
                <div className="w-full lg:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setMessage({ type: '', text: '' });
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-transparent'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-semibold">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Conteúdo das Abas */}
                <div className="flex-1">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            } transition-all animate-fade-in`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'perfil' && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Meu Perfil</h2>
                            <form onSubmit={handleProfileSubmit}>
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center">
                                                {profileData.avatar ? (
                                                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={64} className="text-indigo-300 dark:text-slate-600" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-all">
                                                <Camera size={18} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    value={profileData.nome}
                                                    onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">E-mail</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">URL do Avatar</label>
                                            <input
                                                type="text"
                                                value={profileData.avatar}
                                                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                                                placeholder="https://exemplo.com/foto.jpg"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                                        >
                                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
                                            Salvar Perfil
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'categorias' && (
                        <GerenciarCategorias setLoading={setLoading} setMessage={setMessage} />
                    )}

                    {activeTab === 'seguranca' && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Segurança da Conta</h2>
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">Senha Atual</label>
                                    <input
                                        type="password"
                                        value={passwordData.senhaAtual}
                                        onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={passwordData.novaSenha}
                                        onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmarSenha}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                                >
                                    <Lock size={20} />
                                    Atualizar Senha
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GerenciarCategorias = ({ setLoading, setMessage }) => {
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: '#6366f1', subcategorias: [] });
    const [novaSubcategoria, setNovaSubcategoria] = useState('');
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            setLoadingLocal(true);
            const response = await userService.obterDados();
            if (response.success && response.data && response.data.categorias) {
                setCategorias(response.data.categorias);
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        } finally {
            setLoadingLocal(false);
        }
    };

    const salvarCategorias = async (novasCategorias) => {
        try {
            setLoading(true);
            const responseGet = await userService.obterDados();
            const dadosAtuais = responseGet.data || {};
            const dadosAtualizados = { ...dadosAtuais, categorias: novasCategorias };

            const responseSave = await userService.salvarDados({ dados: dadosAtualizados });
            if (responseSave.success) {
                setCategorias(novasCategorias);
                setMessage({ type: 'success', text: 'Categorias atualizadas com sucesso!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar categorias.' });
        } finally {
            setLoading(false);
        }
    };

    const adicionarCategoria = () => {
        if (!novaCategoria.nome) return;
        const novasCategorias = [...categorias, { ...novaCategoria, subcategorias: [] }];
        salvarCategorias(novasCategorias);
        setNovaCategoria({ nome: '', cor: '#6366f1', subcategorias: [] });
    };

    const adicionarSubcategoriaEmExistente = (idx) => {
        if (!novaSubcategoria) return;
        const novasCategorias = [...categorias];
        const sub = novaSubcategoria.trim();
        
        if (novasCategorias[idx].subcategorias.includes(sub)) {
            setMessage({ type: 'error', text: 'Esta subcategoria já existe.' });
            return;
        }

        novasCategorias[idx].subcategorias = [...novasCategorias[idx].subcategorias, sub];
        salvarCategorias(novasCategorias);
        setNovaSubcategoria('');
        setCategoriaSelecionada('');
    };

    const removerSubcategoria = (catIdx, subIdx) => {
        if (!window.confirm('Excluir subcategoria?')) return;
        const novasCategorias = [...categorias];
        novasCategorias[catIdx].subcategorias = novasCategorias[catIdx].subcategorias.filter((_, i) => i !== subIdx);
        salvarCategorias(novasCategorias);
    };

    const removerCategoria = (idx) => {
        if (!window.confirm('Excluir categoria e todas as suas subcategorias?')) return;
        const novasCategorias = categorias.filter((_, i) => i !== idx);
        salvarCategorias(novasCategorias);
    };

    if (loadingLocal) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categorias e Subcategorias</h2>
                    <p className="text-gray-500 dark:text-slate-400">Organize seus lançamentos por categorias personalizadas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {categorias.map((cat, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.cor }}></div>
                                <h3 className="font-bold text-gray-800 dark:text-white">{cat.nome}</h3>
                            </div>
                            <button onClick={() => removerCategoria(idx)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {cat.subcategorias.map((sub, sIdx) => (
                                <span key={sIdx} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                    {sub}
                                    <button onClick={() => removerSubcategoria(idx, sIdx)} className="text-gray-400 hover:text-red-500"><XCircle size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-700 dark:text-slate-300">Nova Categoria</h3>
                    <input
                        type="text"
                        placeholder="Nome da categoria"
                        value={novaCategoria.nome}
                        onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-700 dark:text-white"
                    />
                    <div className="flex items-center gap-3">
                        <input type="color" value={novaCategoria.cor} onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })} className="h-10 w-20 cursor-pointer" />
                        <span className="text-xs text-gray-500">Cor identificadora</span>
                    </div>
                    <button onClick={adicionarCategoria} className="bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all">Criar Categoria</button>
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-4">Adicionar Subcategoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
                        value={categoriaSelecionada}
                        onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    >
                        <option value="">Selecione a categoria...</option>
                        {categorias.map((cat, i) => <option key={i} value={i}>{cat.nome}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Nome da subcategoria"
                        className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
                        value={novaSubcategoria}
                        onChange={(e) => setNovaSubcategoria(e.target.value)}
                    />
                    <button
                        onClick={() => adicionarSubcategoriaEmExistente(categoriaSelecionada)}
                        disabled={categoriaSelecionada === '' || !novaSubcategoria}
                        className="bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;
