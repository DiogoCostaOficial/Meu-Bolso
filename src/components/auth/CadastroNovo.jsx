import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Plane,
  Heart,
  Users,
  Globe,
  Phone,
  MessageSquare
} from 'lucide-react';
import { ModeToggle } from '../mode-toggle';
import LanguageSelector from '../LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLayoutVariant } from '../../contexts/LayoutVariantContext';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

const PRESENTATION_SLIDES = [
  {
    id: 'casal',
    tag: 'Vida em Casal',
    title: 'Conquistas a Dois',
    description:
      'Com o Meu Bolso, vocês dão nome a cada real, deixam o estresse das contas para trás e tiram os grandes sonhos do papel em perfeita sintonia.',
    image: '/assets/login_slide_casal.jpg',
    icon: Heart
  },
  {
    id: 'solteiro',
    tag: 'Vida de Solteiro',
    title: 'Liberdade & Paz',
    description:
      'Saiba exatamente para onde vai o seu dinheiro, elimine os sustos na fatura e veja seu patrimônio crescer mês a mês com total autonomia.',
    image: '/assets/login_slide_solteiro.jpg',
    icon: User
  },
  {
    id: 'familia',
    tag: 'Vida em Família',
    title: 'Futuro Seguro',
    description:
      'Organize o orçamento da casa de forma simples, conte com as dicas do amigo FIN e construa a tranquilidade que sua família merece.',
    image: '/assets/login_slide_familia.jpg',
    icon: Users
  },
  {
    id: 'viagem',
    tag: 'Campo Exclusivo de Viagens',
    title: 'Viagem dos Sonhos',
    description:
      'Planeje destinos, passagens, hospedagem e orçamento no nosso módulo exclusivo de Viagens para viver momentos inesquecíveis sem voltar com dívidas.',
    image: '/assets/login_slide_viagem.jpg',
    icon: Plane
  }
];

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
  { nome: 'Outro', ddi: '+1', flag: '🌐' },
];

const CadastroNovo = () => {
  const navigate = useNavigate();
  const { register, loginGoogle, loginOutlookOTP } = useAuth();
  const { layoutVariant } = useLayoutVariant();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    pais: 'Brasil',
    ddi: '+55',
    whatsapp: '',
    senha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [mostrarInputOutlook, setMostrarInputOutlook] = useState(false);
  const [emailOutlook, setEmailOutlook] = useState('');
  const [loadingOutlook, setLoadingOutlook] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PRESENTATION_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const handlePaisChange = (e) => {
    const selectedPais = e.target.value;
    const item = LISTA_PAISES.find((p) => p.nome === selectedPais);
    setFormData((prev) => ({
      ...prev,
      pais: selectedPais,
      ddi: item ? item.ddi : prev.ddi
    }));

    if (errors.pais) {
      setErrors((prev) => ({ ...prev, pais: '' }));
    }
  };

  const handleWhatsappChange = (e) => {
    const rawVal = e.target.value;
    let formatted = rawVal;

    // Se for Brasil (+55), aplica máscara (XX) XXXXX-XXXX
    if (formData.ddi === '+55') {
      const numbers = rawVal.replace(/\D/g, '').slice(0, 11);
      if (numbers.length <= 2) {
        formatted = numbers.length > 0 ? `(${numbers}` : '';
      } else if (numbers.length <= 7) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      whatsapp: formatted
    }));

    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: '' }));
    }
  };

  const handleOutlookQuickAccess = async (targetEmail) => {
    const emailFinal = String(targetEmail ?? emailOutlook ?? formData.email ?? '').trim();
    if (!emailFinal || !/\S+@\S+\.\S+/.test(emailFinal)) {
      setEmailOutlook(formData.email || '');
      setMostrarInputOutlook(true);
      return;
    }

    setLoadingOutlook(true);
    try {
      const result = await loginOutlookOTP(emailFinal, formData.nome);
      if (result.success) {
        toast.success('Código de 6 dígitos enviado para seu Outlook!');
        navigate('/validar-otp', {
          state: { email: result.email, otpSimulado: result.otpSimulado, provider: 'outlook' }
        });
      } else {
        toast.error(result.message || 'Erro ao enviar código para o Outlook');
      }
    } catch (err) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoadingOutlook(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
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

    if (!formData.pais?.trim()) {
      newErrors.pais = 'País é obrigatório';
    }

    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Telefone de WhatsApp é obrigatório';
    } else if (whatsappLimpo.length < 8) {
      newErrors.whatsapp = 'Informe um WhatsApp com DDD válido';
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
      const whatsappCompleto = `${formData.ddi} ${formData.whatsapp}`.trim();
      const result = await register(formData.nome, formData.email, formData.senha, {
        pais: formData.pais,
        whatsapp: whatsappCompleto
      });

      if (result.success) {
        toast.success('Cadastro realizado com sucesso! Verifique seu e-mail.');
        navigate('/validar-otp', { state: { email: formData.email, otpSimulado: result.otpSimulado } });
      } else {
        setApiError(result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      setApiError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = PRESENTATION_SLIDES[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <div className={`min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-custom-primary transition-colors duration-300 layout-${layoutVariant}`}>
      {/* LADO ESQUERDO: Área de Cadastro Clean & Minimalista */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between px-8 sm:px-14 xl:px-20 py-10 bg-custom-card text-custom-main relative z-10">
        {/* Topo: Logo + Seletor de Idioma + Alternador de Tema */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-custom-gold flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-custom-main">
              Meu <span className="text-custom-gold">Bolso</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector variant="default" align="right" showQuickFeatured={true} />
            <Link
              to="/login"
              className="text-xs font-medium text-custom-main opacity-60 hover:opacity-100 hover:text-custom-gold transition"
            >
              Já tenho conta
            </Link>
            <ModeToggle />
          </div>
        </div>

        {/* Centro: Formulário Clean */}
        <div className="my-auto py-6 max-w-md w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-custom-gold mb-2">
            Criar conta gratuita
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-custom-main mb-2.5">
            Comece no Meu Bolso
          </h1>
          <p className="text-sm text-custom-main opacity-70 mb-6 leading-relaxed">
            Dê nome ao seu dinheiro, organize seus objetivos e conquiste seus sonhos com tranquilidade.
          </p>

          {apiError && (
            <div className="mb-5 p-3.5 bg-red-950/20 border border-red-500 rounded-xl flex items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2.5 flex-shrink-0" />
              <p className="text-xs text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
              >
                Nome Completo*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3 bg-custom-primary/60 border ${
                    errors.nome ? 'border-red-400' : 'border-custom-color'
                  } rounded-xl text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="Informe seu nome completo"
                  disabled={loading}
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
              >
                E-mail*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3 bg-custom-primary/60 border ${
                    errors.email ? 'border-red-400' : 'border-custom-color'
                  } rounded-xl text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                  placeholder="Informe seu melhor e-mail"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* País e WhatsApp Obrigatórios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* País */}
              <div>
                <label
                  htmlFor="pais"
                  className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
                >
                  {t('País de Residência')}*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-custom-gold" />
                  </div>
                  <select
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handlePaisChange}
                    className={`block w-full pl-10 pr-8 py-3 bg-custom-primary/60 border ${
                      errors.pais ? 'border-red-400' : 'border-custom-color'
                    } rounded-xl text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition appearance-none cursor-pointer`}
                    disabled={loading}
                  >
                    {LISTA_PAISES.map((p) => (
                      <option key={p.nome} value={p.nome} className="bg-custom-card text-custom-main">
                        {p.flag} {p.nome} ({p.ddi})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-custom-main opacity-50">
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>
                {errors.pais && (
                  <p className="mt-1 text-xs text-red-500">{errors.pais}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
                >
                  {t('WhatsApp com DDD')}*
                </label>
                <div className="relative flex rounded-xl border border-custom-color focus-within:ring-2 focus-within:ring-custom-gold transition overflow-hidden">
                  <span className="inline-flex items-center px-3 bg-custom-primary/80 text-custom-gold text-xs font-bold border-r border-custom-color select-none">
                    {formData.ddi}
                  </span>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleWhatsappChange}
                    className={`block w-full px-3 py-3 bg-custom-primary/60 text-sm text-custom-main outline-none ${
                      errors.whatsapp ? 'border-red-400' : ''
                    }`}
                    placeholder={formData.ddi === '+55' ? '(11) 99999-9999' : '99999-9999'}
                    disabled={loading}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="senha"
                  className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
                >
                  Senha*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 bg-custom-primary/60 border ${
                      errors.senha ? 'border-red-400' : 'border-custom-color'
                    } rounded-xl text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                    placeholder="Mín. 6 dígitos"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-custom-gold cursor-pointer"
                    tabIndex="-1"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="mt-1 text-xs text-red-500">{errors.senha}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="block text-[11px] font-bold uppercase tracking-wider text-custom-main opacity-70 mb-1.5"
                >
                  Confirmar Senha*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 bg-custom-primary/60 border ${
                      errors.confirmarSenha ? 'border-red-400' : 'border-custom-color'
                    } rounded-xl text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none transition`}
                    placeholder="Repita a senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-custom-gold cursor-pointer"
                    tabIndex="-1"
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[210px] bg-custom-gold text-black py-3.5 px-8 rounded-full text-xs uppercase tracking-widest font-extrabold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-custom-gold focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer shadow-custom"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta Gratuita'
                )}
              </button>
            </div>

            <div className="pt-5 mt-5 border-t border-custom-color space-y-3">
              <p className="text-xs text-custom-main opacity-60">
                Ou crie sua conta rapidamente com:
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const result = await loginGoogle({
                        token: credentialResponse.credential
                      });

                      if (result.success) {
                        toast.success(`Bem-vindo, ${result.user.nome}!`);
                        navigate('/dashboard');
                      } else {
                        toast.error(result.message);
                      }
                    } catch (error) {
                      console.error('Erro no login Google:', error);
                      toast.error('Erro ao conectar com Google');
                    }
                  }}
                  onError={() => {
                    toast.error('Erro ao conectar com Google');
                  }}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />

                <button
                  type="button"
                  disabled={loadingOutlook}
                  onClick={() => {
                    if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
                      handleOutlookQuickAccess(formData.email);
                    } else {
                      setEmailOutlook(formData.email || '');
                      setMostrarInputOutlook((prev) => !prev);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-2 rounded-full bg-[#131314] hover:bg-[#1f1f22] text-white text-xs font-medium border border-[#3c4043] transition cursor-pointer h-[40px]"
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white p-0.5">
                    <svg viewBox="0 0 23 23" className="w-3 h-3">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                  </span>
                  {loadingOutlook ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span>Continuar com Outlook</span>
                  )}
                </button>
              </div>

              {mostrarInputOutlook && (
                <div className="w-full mt-3 p-4 rounded-xl bg-custom-primary/60 border border-custom-color space-y-3 transition-all">
                  <p className="text-xs text-custom-main opacity-80">
                    Digite seu e-mail <strong>Outlook / Hotmail</strong> para criar e acessar sua conta com código de 6 dígitos:
                  </p>
                  <input
                    type="email"
                    value={emailOutlook}
                    onChange={(e) => setEmailOutlook(e.target.value)}
                    placeholder="seu.nome@outlook.com"
                    className="block w-full px-3.5 py-2.5 bg-custom-card border border-custom-color rounded-lg text-sm text-custom-main focus:ring-2 focus:ring-custom-gold outline-none"
                    disabled={loadingOutlook}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {['@outlook.com', '@hotmail.com', '@live.com'].map((dominio) => (
                      <button
                        key={dominio}
                        type="button"
                        onClick={() => {
                          const base = emailOutlook.split('@')[0] || '';
                          setEmailOutlook(`${base}${dominio}`);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-custom-card border border-custom-color text-custom-main opacity-80 hover:opacity-100 hover:border-custom-gold transition cursor-pointer"
                      >
                        {dominio}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={loadingOutlook || !emailOutlook}
                    onClick={() => handleOutlookQuickAccess(emailOutlook)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingOutlook ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando código OTP...
                      </>
                    ) : (
                      'Receber Código OTP no Outlook'
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Rodapé Minimalista */}
        <div className="pt-4 border-t border-custom-color/60">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-custom-main opacity-80">
            <div>
              {t('Já tem uma conta?')}{' '}
              <Link to="/login" className="font-bold text-custom-gold hover:underline">
                {t('Faça login')}
              </Link>
            </div>
            <Link to="/" className="hover:text-custom-gold transition">
              {t('← Página inicial')}
            </Link>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: Apresentação Dinâmica Clean (Estilo AXA Hub) */}
      <div className="lg:col-span-7 xl:col-span-7 relative min-h-[460px] lg:min-h-screen overflow-hidden bg-black flex flex-col justify-end p-8 sm:p-14 xl:p-20 select-none">
        {/* Imagens em Transição Suave (Crossfade) */}
        {PRESENTATION_SLIDES.map((slide, index) => {
          const isCurrent = index === activeSlide;
          return (
            <img
              key={slide.id}
              src={slide.image}
              alt={t(slide.title)}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
                isCurrent ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          );
        })}

        {/* Filtro Elegante de Contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-amber-950/15 mix-blend-multiply pointer-events-none" />

        {/* Conteúdo Editorial que se atualiza a cada slide */}
        <div className="relative z-10 max-w-2xl">
          {/* Tag Superior */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold tracking-wider uppercase mb-5">
            <SlideIcon className="w-3.5 h-3.5 text-custom-gold" />
            <span>{t(currentSlide.tag)}</span>
          </div>

          {/* Título de Impacto com Barra Diagonal */}
          <div className="flex items-center gap-4 mb-4">
            <span
              className="inline-block w-3 sm:w-4 h-12 sm:h-16 bg-custom-gold -skew-x-[22deg] shrink-0 shadow-lg"
              aria-hidden="true"
            />
            <h2
              key={currentSlide.title}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-none transition-all duration-500"
            >
              {t(currentSlide.title)}
            </h2>
          </div>

          {/* Texto curto, limpo e inspirador */}
          <p
            key={currentSlide.description}
            className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl mb-10 font-normal"
          >
            {t(currentSlide.description)}
          </p>

          {/* Seletores e Barras de Progresso da Apresentação */}
          <div className="grid grid-cols-4 gap-3 max-w-lg">
            {PRESENTATION_SLIDES.map((slide, idx) => {
              const active = idx === activeSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className="text-left group cursor-pointer focus:outline-none"
                >
                  <div className="h-1 w-full rounded-full bg-white/25 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        active ? 'w-full bg-custom-gold' : 'w-0 bg-white/60 group-hover:w-1/3'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold tracking-wide block truncate transition-colors ${
                      active ? 'text-custom-gold' : 'text-white/55 group-hover:text-white/85'
                    }`}
                  >
                    {t(slide.tag)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroNovo;

