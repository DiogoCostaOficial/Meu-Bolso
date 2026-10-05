import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider';
import { useLayoutVariant } from '../contexts/LayoutVariantContext';
import { userService, authService } from '../services/api';
import { User, Lock, Save, Check, AlertCircle, Camera, Upload, Layers, Trash2, Plus, XCircle, Settings, Shield, Edit2, Target, DollarSign, Percent, X } from 'lucide-react';
import { removeDuplicates } from '../utils/arrayUtils';

const Configuracoes = () => {
    const { user, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { layoutVariant, setLayoutVariant } = useLayoutVariant();
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
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">Tema / Layout</label>
                                            <select
                                                value={layoutVariant}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setLayoutVariant(val);
                                                    if (val === 'modern-fluid') {
                                                        setTheme('light');
                                                    } else {
                                                        setTheme('dark');
                                                    }
                                                }}
                                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="modern-fluid">Tema do Sistema (Padrão Claro)</option>
                                                <option value="geo-brutalist">Geo Brutalist (Linhas Retas)</option>
                                                <option value="lux-gold">✨ Golden Luxury (Ouro/Preto)</option>
                                                <option value="neon-glass">🌌 Neon Glassmorphism (Vidro)</option>
                                                <option value="scifi-hud">🛰️ Sci-Fi HUD Command (Hologram)</option>
                                                <option value="cosmic-aurora">🛸 Cosmic Aurora (Espacial)</option>
                                            </select>
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

const categoriasDefault = [
    { nome: 'Despesas Fixas', cor: '#ef4444', tipoMeta: 'percentual', valorMeta: 30, subcategorias: ['Moradia', 'Mercado', 'Saúde', 'Carro', 'Transporte', 'Bichos', 'Diversos Fixos'] },
    { nome: 'Lazer', cor: '#3b82f6', tipoMeta: 'percentual', valorMeta: 10, subcategorias: ['Junkie Food', 'Assinaturas', 'Rolês e Passeios', 'Datas especiais', 'Presentes', 'Diversos Lazer'] },
    { nome: 'Educação', cor: '#10b981', tipoMeta: 'percentual', valorMeta: 15, subcategorias: ['Cursos', 'Livros', 'Workshops', 'Material Escolar', 'Faculdade', 'Idiomas', 'Pós-graduação', 'Diversos Educação'] },
    { nome: 'Investimentos', cor: '#8b5cf6', tipoMeta: 'percentual', valorMeta: 35, subcategorias: ['Investimentos BR', 'Investimentos US', 'Cripto', 'Diversos Investimentos'] },
    { nome: 'Reserva', cor: '#f59e0b', tipoMeta: 'percentual', valorMeta: 10, subcategorias: ['Fundo de Emergência', 'Fundo de Oportunidade', 'Diversos Reserva'] },
    { nome: 'Viagens', cor: '#0ea5e9', tipoMeta: 'valor', valorMeta: null, subcategorias: ['Passagens e Deslocamento', 'Hospedagem', 'Alimentação em Viagem', 'Passeios e Ingressos', 'Documentação e Seguros', 'Compras e Lembranças', 'Câmbio e Taxas', 'Imprevistos e Emergências'] }
];

const GerenciarCategorias = ({ setLoading, setMessage }) => {
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: '#6366f1', tipoMeta: 'valor', valorMeta: '', subcategorias: [] });
    const [novaSubcategoria, setNovaSubcategoria] = useState('');
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState(null);
    const [dadosEdicao, setDadosEdicao] = useState({ nome: '', cor: '#6366f1', tipoMeta: 'valor', valorMeta: '' });

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            setLoadingLocal(true);
            const response = await userService.obterDados();
            let listaCategorias = [];
            if (response.success && response.data && Array.isArray(response.data.categorias) && response.data.categorias.length > 0) {
                listaCategorias = removeDuplicates(response.data.categorias, 'nome').map(c => {
                    const defaultCat = categoriasDefault.find(dc => dc.nome === c.nome);
                    return {
                        ...c,
                        tipoMeta: c.tipoMeta || (defaultCat ? defaultCat.tipoMeta : 'valor'),
                        valorMeta: c.valorMeta !== undefined && c.valorMeta !== null ? c.valorMeta : (defaultCat ? defaultCat.valorMeta : null),
                        subcategorias: (c.subcategorias && c.subcategorias.length > 0)
                            ? c.subcategorias
                            : (defaultCat ? defaultCat.subcategorias : [])
                    };
                });
                const temViagens = listaCategorias.some(c => (c.nome || '').toLowerCase() === 'viagens');
                if (!temViagens) {
                    const catViagens = categoriasDefault.find(c => c.nome === 'Viagens');
                    if (catViagens) listaCategorias.push(catViagens);
                }
            } else {
                listaCategorias = categoriasDefault;
            }
            setCategorias(listaCategorias);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            setCategorias(categoriasDefault);
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
        if (!novaCategoria.nome.trim()) return;
        const catParaAdicionar = {
            ...novaCategoria,
            nome: novaCategoria.nome.trim(),
            valorMeta: novaCategoria.valorMeta !== '' ? parseFloat(novaCategoria.valorMeta) : null,
            subcategorias: []
        };
        const novasCategorias = [...categorias, catParaAdicionar];
        salvarCategorias(novasCategorias);
        setNovaCategoria({ nome: '', cor: '#6366f1', tipoMeta: 'valor', valorMeta: '', subcategorias: [] });
    };

    const iniciarEdicao = (idx) => {
        const cat = categorias[idx];
        setCategoriaEditando(idx);
        setDadosEdicao({
            nome: cat.nome,
            cor: cat.cor || '#6366f1',
            tipoMeta: cat.tipoMeta || 'valor',
            valorMeta: cat.valorMeta !== undefined && cat.valorMeta !== null ? String(cat.valorMeta) : ''
        });
    };

    const salvarEdicaoCategoria = () => {
        if (categoriaEditando === null) return;
        const novasCategorias = [...categorias];
        novasCategorias[categoriaEditando] = {
            ...novasCategorias[categoriaEditando],
            nome: dadosEdicao.nome.trim() || novasCategorias[categoriaEditando].nome,
            cor: dadosEdicao.cor,
            tipoMeta: dadosEdicao.tipoMeta,
            valorMeta: dadosEdicao.valorMeta !== '' ? parseFloat(dadosEdicao.valorMeta) : null
        };
        salvarCategorias(novasCategorias);
        setCategoriaEditando(null);
    };

    const adicionarSubcategoriaEmExistente = (idx) => {
        if (!novaSubcategoria.trim()) return;
        const novasCategorias = [...categorias];
        const sub = novaSubcategoria.trim();
        
        const subList = novasCategorias[idx].subcategorias || [];
        if (subList.includes(sub)) {
            setMessage({ type: 'error', text: 'Esta subcategoria já existe.' });
            return;
        }

        novasCategorias[idx].subcategorias = [...subList, sub];
        salvarCategorias(novasCategorias);
        setNovaSubcategoria('');
        setCategoriaSelecionada('');
    };

    const removerSubcategoria = (catIdx, subIdx) => {
        if (!window.confirm('Excluir subcategoria?')) return;
        const novasCategorias = [...categorias];
        const subList = novasCategorias[catIdx].subcategorias || [];
        novasCategorias[catIdx].subcategorias = subList.filter((_, i) => i !== subIdx);
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categorias e Metas Padrão</h2>
                    <p className="text-gray-500 dark:text-slate-400">Configure suas categorias e defina metas mensais por valor (R$) ou percentual (%)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {categorias.map((cat, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.cor }}></div>
                                    <h3 className="font-bold text-gray-800 dark:text-white text-base">{cat.nome}</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => iniciarEdicao(idx)}
                                        title="Editar categoria e meta"
                                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => removerCategoria(idx)}
                                        title="Excluir categoria"
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Badge da Meta Padrão */}
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                                    <Target size={13} className="text-indigo-500 flex-shrink-0" />
                                    {cat.valorMeta !== null && cat.valorMeta !== undefined && cat.valorMeta !== '' ? (
                                        <span>
                                            Meta Padrão: <strong className="text-indigo-600 dark:text-indigo-400">
                                                {cat.tipoMeta === 'percentual'
                                                    ? `${cat.valorMeta}%`
                                                    : `R$ ${Number(cat.valorMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            </strong>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 dark:text-slate-500 italic">Sem meta padrão definida</span>
                                    )}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {(cat.subcategorias || []).map((sub, sIdx) => (
                                    <span key={sIdx} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                        {sub}
                                        <button onClick={() => removerSubcategoria(idx, sIdx)} className="text-gray-400 hover:text-red-500"><XCircle size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Card de Nova Categoria */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <Plus size={18} className="text-indigo-600" />
                        Nova Categoria
                    </h3>
                    <input
                        type="text"
                        placeholder="Nome da categoria"
                        value={novaCategoria.nome}
                        onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-3">
                        <input type="color" value={novaCategoria.cor} onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })} className="h-10 w-16 rounded cursor-pointer border border-gray-200 dark:border-slate-700" />
                        <span className="text-xs text-gray-500 dark:text-slate-400">Cor identificadora</span>
                    </div>

                    {/* Meta Padrão Opcional */}
                    <div className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Meta Padrão (opcional)</span>
                            <div className="flex bg-gray-200 dark:bg-slate-700 p-0.5 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setNovaCategoria({ ...novaCategoria, tipoMeta: 'valor' })}
                                    className={`px-2.5 py-0.5 text-xs font-bold rounded ${novaCategoria.tipoMeta === 'valor' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                                >
                                    R$
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNovaCategoria({ ...novaCategoria, tipoMeta: 'percentual' })}
                                    className={`px-2.5 py-0.5 text-xs font-bold rounded ${novaCategoria.tipoMeta === 'percentual' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}
                                >
                                    %
                                </button>
                            </div>
                        </div>
                        <input
                            type="number"
                            step={novaCategoria.tipoMeta === 'valor' ? '0.01' : '0.1'}
                            min="0"
                            placeholder={novaCategoria.tipoMeta === 'valor' ? 'Valor da meta (R$)' : 'Percentual da meta (%)'}
                            value={novaCategoria.valorMeta}
                            onChange={(e) => setNovaCategoria({ ...novaCategoria, valorMeta: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button onClick={adicionarCategoria} className="bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 dark:shadow-none">Criar Categoria</button>
                </div>
            </div>

            {/* Modal de Edição de Categoria */}
            {categoriaEditando !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-6 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Editar Categoria e Meta</h3>
                            </div>
                            <button onClick={() => setCategoriaEditando(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={dadosEdicao.nome}
                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Cor Identificadora</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={dadosEdicao.cor}
                                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, cor: e.target.value })}
                                        className="h-10 w-16 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-700"
                                    />
                                    <span className="text-sm font-mono text-gray-600 dark:text-slate-400">{dadosEdicao.cor}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Tipo da Meta</label>
                                    <div className="flex bg-gray-200 dark:bg-slate-700 p-0.5 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setDadosEdicao({ ...dadosEdicao, tipoMeta: 'valor' })}
                                            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition ${dadosEdicao.tipoMeta === 'valor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
                                        >
                                            <DollarSign size={13} /> Valor (R$)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDadosEdicao({ ...dadosEdicao, tipoMeta: 'percentual' })}
                                            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition ${dadosEdicao.tipoMeta === 'percentual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
                                        >
                                            <Percent size={13} /> Percentual (%)
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">
                                        {dadosEdicao.tipoMeta === 'valor' ? 'Valor da Meta Mensal (R$):' : 'Percentual da Meta (% da Renda):'}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                                            {dadosEdicao.tipoMeta === 'valor' ? 'R$' : '%'}
                                        </span>
                                        <input
                                            type="number"
                                            step={dadosEdicao.tipoMeta === 'valor' ? '0.01' : '0.1'}
                                            min="0"
                                            max={dadosEdicao.tipoMeta === 'percentual' ? '100' : undefined}
                                            placeholder={dadosEdicao.tipoMeta === 'valor' ? 'Ex: 1500.00' : 'Ex: 25.0'}
                                            value={dadosEdicao.valorMeta}
                                            onChange={(e) => setDadosEdicao({ ...dadosEdicao, valorMeta: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Deixe em branco caso esta categoria não possua meta fixa.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setCategoriaEditando(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={salvarEdicaoCategoria}
                                className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 dark:shadow-none"
                            >
                                <Save size={16} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-4">Adicionar Subcategoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white"
                        value={categoriaSelecionada}
                        onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    >
                        <option value="">Selecione a categoria...</option>
                        {categorias.map((cat, i) => <option key={i} value={i}>{cat.nome}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Nome da subcategoria"
                        className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-white"
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
