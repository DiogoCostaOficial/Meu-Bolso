import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../components/theme-provider';
import { useLayoutVariant } from '../contexts/LayoutVariantContext';
import { userService, authService } from '../services/api';
import {
  User,
  Lock,
  Save,
  Check,
  AlertCircle,
  AlertTriangle,
  Camera,
  Layers,
  Trash2,
  Plus,
  XCircle,
  Settings,
  Shield,
  Edit2,
  Target,
  DollarSign,
  Percent,
  X,
  Phone,
  Globe,
  Mail,
  Palette,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { removeDuplicates } from '../utils/arrayUtils';


const LISTA_PAISES = [
  { nome: 'Brasil', ddi: '+55', flag: '🇧🇷' },
  { nome: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { nome: 'Estados Unidos', ddi: '+1', flag: '🇺🇸' },
  { nome: 'Espanha', ddi: '+34', flag: '🇪🇸' },
  { nome: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { nome: 'Uruguai', ddi: '+598', flag: '🇺🇾' },
  { nome: 'Paraguai', ddi: '+595', flag: '🇵🇾' },
  { nome: 'Chile', ddi: '+56', flag: '🇨🇱' },
  { nome: 'Colômbia', ddi: '+57', flag: '🇨🇴' },
  { nome: 'México', ddi: '+52', flag: '🇲🇽' },
  { nome: 'Peru', ddi: '+51', flag: '🇵🇪' },
  { nome: 'Itália', ddi: '+39', flag: '🇮🇹' },
  { nome: 'França', ddi: '+33', flag: '🇫🇷' },
  { nome: 'Alemanha', ddi: '+49', flag: '🇩🇪' },
  { nome: 'Reino Unido', ddi: '+44', flag: '🇬🇧' },
  { nome: 'Canadá', ddi: '+1', flag: '🇨🇦' },
  { nome: 'Angola', ddi: '+244', flag: '🇦🇴' },
  { nome: 'Moçambique', ddi: '+258', flag: '🇲🇿' },
  { nome: 'Japão', ddi: '+81', flag: '🇯🇵' },
  { nome: 'Austrália', ddi: '+61', flag: '🇦🇺' },
  { nome: 'Outro', ddi: '+1', flag: '🌐' }
];

function extrairPaisEDdi(telCompleto) {
  if (!telCompleto) {
    return { pais: 'Brasil', ddi: '+55', numero: '' };
  }
  const limpo = String(telCompleto).trim();
  const paisEncontrado = LISTA_PAISES.find(p => limpo.startsWith(p.ddi));
  if (paisEncontrado) {
    const resto = limpo.slice(paisEncontrado.ddi.length).trim();
    return { pais: paisEncontrado.nome, ddi: paisEncontrado.ddi, numero: resto };
  }
  return { pais: 'Brasil', ddi: '+55', numero: limpo };
}

const categoriasDefault = [
  { nome: 'Despesas Fixas', cor: '#ef4444', tipoMeta: 'percentual', valorMeta: 30, subcategorias: ['Moradia', 'Mercado', 'Saúde', 'Carro', 'Transporte', 'Bichos', 'Diversos Fixos'] },
  { nome: 'Lazer', cor: '#3b82f6', tipoMeta: 'percentual', valorMeta: 10, subcategorias: ['Junkie Food', 'Assinaturas', 'Rolês e Passeios', 'Datas especiais', 'Presentes', 'Diversos Lazer'] },
  { nome: 'Educação', cor: '#10b981', tipoMeta: 'percentual', valorMeta: 15, subcategorias: ['Cursos', 'Livros', 'Workshops', 'Material Escolar', 'Faculdade', 'Idiomas', 'Pós-graduação', 'Diversos Educação'] },
  { nome: 'Investimentos', cor: '#f59e0b', tipoMeta: 'percentual', valorMeta: 35, subcategorias: ['Investimentos BR', 'Investimentos US', 'Cripto', 'Diversos Investimentos'] },
  { nome: 'Reserva', cor: '#eab308', tipoMeta: 'percentual', valorMeta: 10, subcategorias: ['Fundo de Emergência', 'Fundo de Oportunidade', 'Diversos Reserva'] },
  { nome: 'Viagens', cor: '#0ea5e9', tipoMeta: 'valor', valorMeta: null, subcategorias: ['Passagens e Deslocamento', 'Hospedagem', 'Alimentação em Viagem', 'Passeios e Ingressos', 'Documentação e Seguros', 'Compras e Lembranças', 'Câmbio e Taxas', 'Imprevistos e Emergências'] }
];

const Configuracoes = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { layoutVariant, setLayoutVariant } = useLayoutVariant();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'categorias' | 'seguranca'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Exclusão de conta
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Profile State
    const [paisSelecionado, setPaisSelecionado] = useState('Brasil');
  const [ddiSelecionado, setDdiSelecionado] = useState('+55');
  const [telefoneSemDdi, setTelefoneSemDdi] = useState('');

  const [profileData, setProfileData] = useState({
    nome: user?.nome || '',
    avatar: user?.avatar || '',
    email: user?.email || '',
    telefone: user?.telefone || user?.whatsapp || ''
  });

  useEffect(() => {
    if (user) {
      const tel = user.telefone || user.whatsapp || '';
      const { pais, ddi, numero } = extrairPaisEDdi(tel);
      setPaisSelecionado(pais);
      setDdiSelecionado(ddi);
      setTelefoneSemDdi(numero);

      setProfileData({
        nome: user.nome || '',
        avatar: user.avatar || '',
        email: user.email || '',
        telefone: tel
      });
    }
  }, [user]);

  const handlePaisChange = (e) => {
    const nomePais = e.target.value;
    const paisObj = LISTA_PAISES.find(p => p.nome === nomePais);
    const novoDdi = paisObj ? paisObj.ddi : '+55';

    setPaisSelecionado(nomePais);
    setDdiSelecionado(novoDdi);

    let numAtual = telefoneSemDdi;
    if (novoDdi !== '+55') {
      numAtual = numAtual.replace(/[\(\)\s-]/g, '');
      setTelefoneSemDdi(numAtual);
    }
    const telCompleto = numAtual ? `${novoDdi} ${numAtual}`.trim() : '';
    setProfileData(prev => ({ ...prev, telefone: telCompleto }));
  };

  const handleTelefoneChange = (e) => {
    const rawVal = e.target.value;
    let formatted = rawVal;

    if (ddiSelecionado === '+55') {
      const numbers = rawVal.replace(/\D/g, '').slice(0, 11);
      if (numbers.length <= 2) {
        formatted = numbers.length > 0 ? `(${numbers}` : '';
      } else if (numbers.length <= 7) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
    }

    setTelefoneSemDdi(formatted);
    const telCompleto = formatted ? `${ddiSelecionado} ${formatted}`.trim() : '';
    setProfileData(prev => ({ ...prev, telefone: telCompleto }));
  };

  // Password State
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil & Contato', icon: User },
    { id: 'categorias', label: 'Categorias & Metas', icon: Layers },
    { id: 'seguranca', label: 'Segurança da Conta', icon: Shield }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let avatarUrl = '';

      // 1. Tenta upload pelo backend
      try {
        const response = await userService.uploadAvatar(file);
        if (response && (response.success || response.sucesso)) {
          avatarUrl = response.data?.avatarUrl || response.dados?.avatarUrl || '';
        }
      } catch (errApi) {
        console.warn('Upload via backend não retornou URL pública, aplicando leitura direta segura...', errApi);
      }

      // 2. Se backend não retornou URL ou deu erro (ex: storage local/supabase sem bucket), usa FileReader Data URL
      if (!avatarUrl) {
        avatarUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      setProfileData((prev) => ({ ...prev, avatar: avatarUrl }));

      // 3. Salva imediatamente no perfil do usuário no banco para atualizar avatar em toda a aplicação
      const telFinal = telefoneSemDdi ? `${ddiSelecionado} ${telefoneSemDdi}`.trim() : (profileData.telefone || '');
      const responsePerfil = await userService.atualizarPerfil({
        nome: profileData.nome,
        avatar: avatarUrl,
        email: profileData.email,
        telefone: telFinal,
        whatsapp: telFinal
      });

      if (responsePerfil && (responsePerfil.success || responsePerfil.sucesso)) {
        updateUser(responsePerfil.data || responsePerfil.dados);
        setMessage({ type: 'success', text: 'Foto de perfil atualizada com sucesso!' });
      } else {
        setMessage({ type: 'success', text: 'Foto carregada! Clique em "Salvar Alterações" para confirmar.' });
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar foto: ' + (error.message || 'formato incompatível') });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const telFinal = telefoneSemDdi ? `${ddiSelecionado} ${telefoneSemDdi}`.trim() : (profileData.telefone || '');
      const response = await userService.atualizarPerfil({
        nome: profileData.nome,
        avatar: profileData.avatar,
        email: profileData.email,
        telefone: telFinal,
        whatsapp: telFinal
      });

      if (response.success) {
        updateUser(response.data || response.dados);
        setMessage({ type: 'success', text: 'Perfil, e-mail e telefone atualizados com sucesso!' });
      } else {
        setMessage({ type: 'error', text: response.message || response.mensagem || 'Erro ao atualizar perfil' });
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
    <div className="space-y-6">
      {/* CABEÇALHO HORIZONTAL OTIMIZADO: Título à esquerda, Abas Horizontais à direita */}
      <div className="bg-custom-card border border-custom-color rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-custom transition-colors">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-custom-main flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-custom-gold" />
            Configurações
          </h1>
          <p className="text-xs text-custom-main opacity-70 mt-1">
            Personalize seu perfil, contatos de e-mail/WhatsApp, categorias e segurança da conta.
          </p>
        </div>

        {/* NAVEGAÇÃO HORIZONTAL DE ABAS (Elimina a coluna lateral desperdiçada) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-custom-primary/60 rounded-xl border border-custom-color self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage({ type: '', text: '' });
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-custom-gold text-black shadow-sm'
                    : 'text-custom-main opacity-70 hover:opacity-100 hover:bg-custom-card'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK MENSAGENS */}
      {message.text && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ABA 1: MEU PERFIL & CONTATO (Layout Agrupado, Compacto e Alinhado) */}
      {activeTab === 'perfil' && (
        <div className="bg-custom-card border border-custom-color rounded-2xl p-6 shadow-custom transition-colors">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Bloco Superior: Avatar + Resumo do Usuário */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-custom-color">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-custom-primary border-2 border-custom-gold/40 shadow-md overflow-hidden flex items-center justify-center">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9 text-amber-400" />
                  )}
                </div>
                <label
                  title="Trocar foto de perfil"
                  className="absolute bottom-0 right-0 p-2 bg-custom-gold text-black font-bold rounded-full cursor-pointer shadow-md hover:bg-yellow-400 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-lg font-bold text-custom-main">{profileData.nome || user?.nome || 'Usuário'}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold uppercase">
                    {user?.plano || 'Plano Pessoal'}
                  </span>
                </div>
                <p className="text-xs text-custom-main opacity-70">
                  {profileData.email || user?.email} • {profileData.telefone || 'Telefone não cadastrado'}
                </p>
              </div>

              {/* Botão de Salvar no Topo para Acesso Imediato */}
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer flex-shrink-0"
              >
                {loading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-black"></div> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </button>
            </div>

            {/* Grid dos Campos de Contato e Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileData.nome}
                    onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-4 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* E-mail (Editável) */}
              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  E-mail de Contato
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-4 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold transition-colors"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </div>

              {/* Bloco de País e Telefone com DDI idêntico à tela de Cadastro */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seletor de País */}
                <div>
                  <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    País do Telefone
                  </label>
                  <div className="relative">
                    <select
                      value={paisSelecionado}
                      onChange={handlePaisChange}
                      className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-4 py-2.5 text-xs text-custom-main focus:outline-none focus:border-custom-gold transition-colors cursor-pointer appearance-none"
                    >
                      {LISTA_PAISES.map((p) => (
                        <option key={p.nome} value={p.nome} className="bg-custom-card text-custom-main">
                          {p.flag} {p.nome} ({p.ddi})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-custom-main opacity-50">
                      <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp com DDD e Código do País acoplado */}
                <div>
                  <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                    Telefone / WhatsApp
                  </label>
                  <div className="relative flex rounded-xl border border-custom-color focus-within:border-custom-gold transition overflow-hidden bg-custom-primary/50">
                    <span className="inline-flex items-center px-3.5 bg-custom-card text-custom-gold text-xs font-bold border-r border-custom-color select-none">
                      {ddiSelecionado}
                    </span>
                    <input
                      type="text"
                      value={telefoneSemDdi}
                      onChange={handleTelefoneChange}
                      placeholder={ddiSelecionado === '+55' ? '(11) 99999-9999' : '99999-9999'}
                      className="block w-full px-3 py-2.5 text-xs text-custom-main bg-transparent focus:outline-none placeholder-custom-main/40"
                    />
                  </div>
                </div>
              </div>

              {/* URL da Foto */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5">
                  URL da Foto (opcional — você também pode clicar no ícone de câmera na foto acima para enviar direto do seu aparelho)
                </label>
                <input
                  type="text"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-4 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold transition-colors"
                />
              </div>

              {/* Tema da Aplicação */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Tema Visual da Aplicação
                </label>
                <select
                  value={theme}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTheme(val);
                    setLayoutVariant('lux-gold');
                  }}
                  className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-4 py-2.5 text-xs text-custom-main focus:outline-none focus:border-custom-gold transition-colors cursor-pointer"
                >
                  <option value="light">☀️ Tema Claro</option>
                  <option value="dark">🌙 Tema Escuro</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ABA 2: CATEGORIAS & METAS (Com Layout Agrupado, Ações no Topo e Alta Densidade) */}
      {activeTab === 'categorias' && (
        <GerenciarCategorias setLoading={setLoading} setMessage={setMessage} />
      )}

      {/* ABA 3: SEGURANÇA DA CONTA */}
      {activeTab === 'seguranca' && (
        <div className="space-y-6">
          <div className="bg-custom-card border border-custom-color rounded-2xl p-6 shadow-custom transition-colors">
            <h2 className="text-lg font-bold text-custom-main mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Segurança & Troca de Senha
            </h2>
            <p className="text-xs text-custom-main opacity-70 mb-6">
              Mantenha sua conta protegida alterando periodicamente a sua senha de acesso.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwordData.senhaAtual}
                    onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-3.5 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.novaSenha}
                    onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-3.5 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1.5">
                    Confirmar Nova
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmarSenha}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                    className="w-full bg-custom-primary/50 border border-custom-color rounded-xl px-3.5 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Atualizar Senha
              </button>
            </form>
          </div>

          {/* ZONA DE PERIGO: EXCLUSÃO PERMANENTE DE CONTA */}
          <div className="bg-custom-card border-2 border-red-500/40 rounded-2xl p-6 shadow-custom transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-red-400">
                    Zona de Perigo — Excluir Meu Cadastro
                  </h2>
                </div>
                <p className="text-xs text-custom-main opacity-80 leading-relaxed">
                  Ao excluir sua conta, todos os seus dados pessoais e registros financeiros (receitas, despesas, cartões, metas, categorias e viagens) serão apagados <strong>permanentemente</strong> do sistema. Esta ação é irreversível.
                </p>
                {user?.tipo === 'admin' && (
                  <p className="text-xs text-amber-400 font-semibold pt-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    Sua conta possui perfil de Administrador e está protegida contra autoexclusão.
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  disabled={user?.tipo === 'admin' || loading}
                  onClick={() => {
                    setDeleteConfirmationText('');
                    setDeleteError('');
                    setShowDeleteAccountModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Meu Cadastro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-custom-card border-2 border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-custom-main">
            <div className="flex items-center justify-between pb-3 border-b border-custom-color">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-base font-bold">Excluir Conta Permanentemente</h3>
              </div>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="text-custom-main opacity-65 hover:opacity-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-custom-main opacity-85 leading-relaxed">
              <p>
                Tem certeza de que deseja encerrar e apagar sua conta (<strong className="text-amber-400">{user?.email}</strong>)?
              </p>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-1">
                <p className="font-bold">O que será apagado imediatamente:</p>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  <li>Seu perfil, foto e credenciais de acesso</li>
                  <li>Todas as receitas, despesas e histórico mensal</li>
                  <li>Cartões de crédito, faturas, orçamentos e viagens</li>
                </ul>
              </div>

              <div className="pt-1">
                <label className="block text-xs font-bold text-custom-main uppercase tracking-wider mb-1.5">
                  Para confirmar, digite <span className="text-red-400 select-all">EXCLUIR</span> abaixo:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => {
                    setDeleteConfirmationText(e.target.value);
                    if (deleteError) setDeleteError('');
                  }}
                  placeholder="Digite EXCLUIR"
                  autoFocus
                  disabled={deletingAccount}
                  className="w-full bg-custom-primary border border-red-500/40 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none uppercase font-bold tracking-wider"
                />
              </div>

              {deleteError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-custom-color">
              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 rounded-xl border border-custom-color text-xs font-semibold text-custom-main opacity-80 hover:opacity-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingAccount || deleteConfirmationText.trim().toUpperCase() !== 'EXCLUIR'}
                onClick={async () => {
                  if (deleteConfirmationText.trim().toUpperCase() !== 'EXCLUIR') {
                    setDeleteError('Por favor, digite EXCLUIR para confirmar.');
                    return;
                  }
                  setDeletingAccount(true);
                  setDeleteError('');
                  try {
                    const response = await userService.excluirConta('EXCLUIR');
                    if (response && (response.success || response.sucesso)) {
                      setShowDeleteAccountModal(false);
                      logout();
                      navigate('/login', { replace: true });
                    } else {
                      setDeleteError(response?.message || response?.mensagem || 'Erro ao excluir conta.');
                    }
                  } catch (err) {
                    setDeleteError(err.message || 'Erro ao excluir sua conta. Tente novamente.');
                  } finally {
                    setDeletingAccount(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {deletingAccount ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirmar Exclusão Definitiva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * COMPONENTE OTIMIZADO DE CATEGORIAS E METAS PADRÃO
 * Ações no topo (sem precisar rolar para baixo), grid compacto de 3 colunas e subcategorias inline.
 */
const GerenciarCategorias = ({ setLoading, setMessage }) => {
  const [categorias, setCategorias] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showNovaCategoriaModal, setShowNovaCategoriaModal] = useState(false);
  const [showNovaSubcategoriaModal, setShowNovaSubcategoriaModal] = useState(false);

  // Estados dos Modais
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', cor: '#eab308', tipoMeta: 'percentual', valorMeta: '', subcategorias: [] });
  const [novaSubcategoria, setNovaSubcategoria] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({ nome: '', cor: '#eab308', tipoMeta: 'percentual', valorMeta: '' });

  // Input rápido inline por card
  const [subcategoriaInline, setSubcategoriaInline] = useState({});

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setLoadingLocal(true);
      const response = await userService.obterDados();
      let listaCategorias = [];
      if (response.success && response.data && Array.isArray(response.data.categorias) && response.data.categorias.length > 0) {
        listaCategorias = removeDuplicates(response.data.categorias, 'nome').map((c) => {
          const defaultCat = categoriasDefault.find((dc) => dc.nome === c.nome);
          return {
            ...c,
            tipoMeta: c.tipoMeta || (defaultCat ? defaultCat.tipoMeta : 'percentual'),
            valorMeta: c.valorMeta !== undefined && c.valorMeta !== null ? c.valorMeta : (defaultCat ? defaultCat.valorMeta : null),
            subcategorias: c.subcategorias && c.subcategorias.length > 0 ? c.subcategorias : defaultCat ? defaultCat.subcategorias : []
          };
        });
        const temViagens = listaCategorias.some((c) => (c.nome || '').toLowerCase() === 'viagens');
        if (!temViagens) {
          const catViagens = categoriasDefault.find((c) => c.nome === 'Viagens');
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
    setNovaCategoria({ nome: '', cor: '#eab308', tipoMeta: 'percentual', valorMeta: '', subcategorias: [] });
    setShowNovaCategoriaModal(false);
  };

  const iniciarEdicao = (idx) => {
    const cat = categorias[idx];
    setCategoriaEditando(idx);
    setDadosEdicao({
      nome: cat.nome,
      cor: cat.cor || '#eab308',
      tipoMeta: cat.tipoMeta || 'percentual',
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

  const adicionarSubcategoriaInline = (catIdx) => {
    const sub = (subcategoriaInline[catIdx] || '').trim();
    if (!sub) return;

    const novasCategorias = [...categorias];
    const subList = novasCategorias[catIdx].subcategorias || [];

    if (subList.includes(sub)) {
      setMessage({ type: 'error', text: 'Esta subcategoria já existe.' });
      return;
    }

    novasCategorias[catIdx].subcategorias = [...subList, sub];
    salvarCategorias(novasCategorias);
    setSubcategoriaInline((prev) => ({ ...prev, [catIdx]: '' }));
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

  if (loadingLocal) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* BARRA DE AÇÕES NO TOPO (Sem rolagem para baixo) */}
      <div className="bg-custom-card border border-custom-color rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-custom transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-custom-main">Categorias & Metas Padrão</h2>
            <p className="text-xs text-custom-main opacity-70">
              {categorias.length} categorias cadastradas • Metas mensais configuráveis
            </p>
          </div>
        </div>

        {/* Botões de Ação no Topo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNovaCategoriaModal(true)}
            className="px-4 py-2 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* GRADE COMPACTA E ALINHADA DE CATEGORIAS (3 Colunas em telas médias, 4 em telas largas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {categorias.map((cat, idx) => (
          <div
            key={idx}
            className="bg-custom-card border border-custom-color rounded-2xl p-4 hover:border-custom-gold/50 transition-all flex flex-col justify-between h-[360px] shadow-custom"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-custom-color/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs ring-2 ring-gray-800"
                    style={{ backgroundColor: cat.cor || '#eab308' }}
                  ></div>
                  <h3 className="font-bold text-custom-main text-sm truncate" title={cat.nome}>{cat.nome}</h3>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => iniciarEdicao(idx)}
                    title="Editar categoria e meta"
                    className="p-1.5 text-custom-main opacity-65 hover:text-amber-400 hover:bg-custom-primary/60 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removerCategoria(idx)}
                    title="Excluir categoria"
                    className="p-1.5 text-custom-main opacity-65 hover:text-red-400 hover:bg-custom-primary/60 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badge da Meta Padrão & Contador */}
              <div className="flex items-center justify-between mb-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold bg-custom-primary/60 border border-custom-color text-custom-main">
                  <Target className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  {cat.valorMeta !== null && cat.valorMeta !== undefined && cat.valorMeta !== '' ? (
                    <span>
                      Meta:{' '}
                      <strong className="text-amber-400">
                        {cat.tipoMeta === 'percentual'
                          ? `${cat.valorMeta}%`
                          : `R$ ${Number(cat.valorMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </strong>
                    </span>
                  ) : (
                    <span className="text-custom-main opacity-50 italic">Sem meta configurada</span>
                  )}
                </span>
                <span className="text-[11px] text-custom-main opacity-65 font-medium">
                  {(cat.subcategorias || []).length} {(cat.subcategorias || []).length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Subcategorias alinhadas em Grade de 2 Colunas com altura uniforme */}
              <div className="h-44 overflow-y-auto pr-1.5 custom-scrollbar mb-2">
                {(cat.subcategorias || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 border border-dashed border-custom-color/80 rounded-xl text-custom-main opacity-50 text-xs">
                    <span>Nenhuma subcategoria</span>
                    <span className="text-[10px] text-custom-main opacity-40 mt-1">Adicione uma abaixo</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 content-start">
                    {(cat.subcategorias || []).map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-custom-primary/40 border border-custom-color hover:border-custom-gold/40 text-xs text-custom-main transition-all min-h-[34px]"
                      >
                        <span className="truncate pr-1 text-[11px] font-medium" title={sub}>
                          {sub}
                        </span>
                        <button
                          type="button"
                          onClick={() => removerSubcategoria(idx, sIdx)}
                          title="Remover"
                          className="text-custom-main opacity-50 hover:text-red-400 transition-colors flex-shrink-0 p-0.5 rounded opacity-60 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ação Inline: Adicionar Subcategoria DIRETO no Card (Perfeitamente alinhada no rodapé) */}
            <div className="pt-3 border-t border-custom-color/60 mt-auto">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="+ Nova subcategoria..."
                  value={subcategoriaInline[idx] || ''}
                  onChange={(e) => setSubcategoriaInline({ ...subcategoriaInline, [idx]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarSubcategoriaInline(idx);
                    }
                  }}
                  className="flex-1 bg-custom-primary/60 border border-custom-color focus:border-custom-gold rounded-lg px-2.5 py-1.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => adicionarSubcategoriaInline(idx)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                  title="Adicionar subcategoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: NOVA CATEGORIA */}
      {showNovaCategoriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-custom-card border border-custom-color rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-custom-main">
            <div className="flex items-center justify-between pb-3 border-b border-custom-color">
              <h3 className="font-bold text-custom-main text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Nova Categoria
              </h3>
              <button
                onClick={() => setShowNovaCategoriaModal(false)}
                className="text-custom-main opacity-65 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Transporte, Saúde, Moradia..."
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="w-full bg-custom-primary border border-custom-color rounded-xl px-3.5 py-2 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1">
                  Cor Identificadora
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={novaCategoria.cor}
                    onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                    className="h-9 w-14 rounded-lg cursor-pointer border border-custom-color bg-transparent"
                  />
                  <span className="text-xs font-mono text-custom-main opacity-65">{novaCategoria.cor}</span>
                </div>
              </div>

              <div className="bg-custom-primary/50 p-3.5 rounded-xl border border-custom-color space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider">
                    Meta Mensal Padrão
                  </span>
                  <div className="flex bg-custom-primary/80 p-0.5 rounded-lg text-xs border border-custom-color">
                    <button
                      type="button"
                      onClick={() => setNovaCategoria({ ...novaCategoria, tipoMeta: 'percentual' })}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition ${
                        novaCategoria.tipoMeta === 'percentual' ? 'bg-amber-400 text-black' : 'text-custom-main opacity-65'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovaCategoria({ ...novaCategoria, tipoMeta: 'valor' })}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition ${
                        novaCategoria.tipoMeta === 'valor' ? 'bg-amber-400 text-black' : 'text-custom-main opacity-65'
                      }`}
                    >
                      R$
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step={novaCategoria.tipoMeta === 'valor' ? '0.01' : '0.1'}
                  min="0"
                  placeholder={novaCategoria.tipoMeta === 'valor' ? 'Ex: 1500.00' : 'Ex: 15.0 (%)'}
                  value={novaCategoria.valorMeta}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, valorMeta: e.target.value })}
                  className="w-full bg-custom-primary border border-custom-color rounded-xl px-3 py-1.5 text-xs text-custom-main placeholder-custom-main/40 focus:outline-none focus:border-custom-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-custom-color">
              <button
                type="button"
                onClick={() => setShowNovaCategoriaModal(false)}
                className="px-4 py-2 text-xs text-custom-main opacity-65 hover:text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={adicionarCategoria}
                disabled={!novaCategoria.nome.trim()}
                className="px-5 py-2 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 disabled:opacity-50 transition"
              >
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CATEGORIA E META */}
      {categoriaEditando !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-custom-card border border-custom-color rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-custom-main">
            <div className="flex items-center justify-between pb-3 border-b border-custom-color">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-custom-main">Editar Categoria & Meta</h3>
              </div>
              <button
                onClick={() => setCategoriaEditando(null)}
                className="text-custom-main opacity-65 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={dadosEdicao.nome}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                  className="w-full bg-custom-primary border border-custom-color rounded-xl px-3.5 py-2 text-xs text-custom-main focus:outline-none focus:border-custom-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider mb-1">
                  Cor
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={dadosEdicao.cor}
                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, cor: e.target.value })}
                    className="h-9 w-14 rounded-lg cursor-pointer border border-custom-color bg-transparent"
                  />
                  <span className="text-xs font-mono text-custom-main opacity-65">{dadosEdicao.cor}</span>
                </div>
              </div>

              <div className="bg-custom-primary/50 p-3.5 rounded-xl border border-custom-color space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-custom-main opacity-80 uppercase tracking-wider">
                    Tipo da Meta
                  </label>
                  <div className="flex bg-custom-primary/80 p-0.5 rounded-lg text-xs border border-custom-color">
                    <button
                      type="button"
                      onClick={() => setDadosEdicao({ ...dadosEdicao, tipoMeta: 'percentual' })}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold transition ${
                        dadosEdicao.tipoMeta === 'percentual' ? 'bg-amber-400 text-black' : 'text-custom-main opacity-65'
                      }`}
                    >
                      <Percent className="w-3 h-3" /> %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDadosEdicao({ ...dadosEdicao, tipoMeta: 'valor' })}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold transition ${
                        dadosEdicao.tipoMeta === 'valor' ? 'bg-amber-400 text-black' : 'text-custom-main opacity-65'
                      }`}
                    >
                      <DollarSign className="w-3 h-3" /> R$
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step={dadosEdicao.tipoMeta === 'valor' ? '0.01' : '0.1'}
                    min="0"
                    max={dadosEdicao.tipoMeta === 'percentual' ? '100' : undefined}
                    placeholder={dadosEdicao.tipoMeta === 'valor' ? 'Ex: 1500.00' : 'Ex: 25.0'}
                    value={dadosEdicao.valorMeta}
                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, valorMeta: e.target.value })}
                    className="w-full bg-custom-primary border border-custom-color rounded-xl px-3 py-1.5 text-xs text-custom-main focus:outline-none focus:border-custom-gold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-custom-color">
              <button
                type="button"
                onClick={() => setCategoriaEditando(null)}
                className="px-4 py-2 text-xs text-custom-main opacity-65 hover:text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicaoCategoria}
                className="px-5 py-2 rounded-xl bg-custom-gold text-black font-bold text-xs hover:bg-yellow-400 transition"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
