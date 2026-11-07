import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Video,
  Settings,
  Target,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  FileSpreadsheet,
  Layers,
  PieChart,
  BarChart3,
  Mail,
  Send,
  MessageSquarePlus
} from 'lucide-react';

const STORAGE_PREFIX = 'financas_welcome_guide_seen_v1_';
const CONTACT_EMAIL = 'financasfacil10@gmail.com';

const WelcomeGuideModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // Estado do formulário de sugestão para financasfacil10@gmail.com
  const [sugestaoTexto, setSugestaoTexto] = useState('');
  const [enviandoSugestao, setEnviandoSugestao] = useState(false);
  const [sugestaoEnviada, setSugestaoEnviada] = useState(false);

  const storageKey = `${STORAGE_PREFIX}${user?.id || user?.email || 'default'}`;

  // Abre automaticamente no primeiro acesso após login
  useEffect(() => {
    if (!user) return;
    try {
      const alreadySeen = localStorage.getItem(storageKey);
      if (!alreadySeen) {
        const timer = setTimeout(() => {
          setCurrentSlide(0);
          setDontShowAgain(true);
          setIsOpen(true);
        }, 450);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, [user, storageKey]);

  // Permite reabrir a apresentação a qualquer momento via botão "Guia Inicial"
  useEffect(() => {
    const handleOpenGuide = (event) => {
      const startSlide = event?.detail?.slide ?? 0;
      setCurrentSlide(startSlide);
      setSugestaoEnviada(false);
      setIsOpen(true);
    };

    window.addEventListener('open-welcome-guide', handleOpenGuide);
    return () => window.removeEventListener('open-welcome-guide', handleOpenGuide);
  }, []);

  const persistPreferenceAndClose = useCallback(() => {
    try {
      if (dontShowAgain) {
        localStorage.setItem(storageKey, 'true');
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // ignore storage errors
    }
    setIsOpen(false);
  }, [dontShowAgain, storageKey]);

  const handleGoToRoute = (path) => {
    persistPreferenceAndClose();
    navigate(path);
  };

  const handleEnviarSugestao = async (e) => {
    e.preventDefault();
    const textoLimpo = sugestaoTexto.trim();
    if (!textoLimpo) {
      toast.error('Escreva sua sugestão antes de enviar.');
      return;
    }

    setEnviandoSugestao(true);
    try {
      const resp = await api.post('/user/sugestao', {
        assunto: `Sugestão de ${user?.nome || 'Usuário'}`,
        mensagem: textoLimpo,
        nome: user?.nome,
        email: user?.email
      });

      if (resp.data?.sucesso) {
        toast.success(`Sugestão enviada com sucesso para ${CONTACT_EMAIL}!`);
        setSugestaoTexto('');
        setSugestaoEnviada(true);
      } else {
        // Fallback abrindo o cliente de e-mail já preenchido para financasfacil10@gmail.com
        const subject = encodeURIComponent(`Sugestão Meu Bolso - ${user?.nome || 'Usuário'}`);
        const body = encodeURIComponent(textoLimpo);
        window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
        toast.success(`Abrindo seu aplicativo de e-mail para enviar para ${CONTACT_EMAIL}`);
        setSugestaoEnviada(true);
      }
    } catch {
      const subject = encodeURIComponent(`Sugestão Meu Bolso - ${user?.nome || 'Usuário'}`);
      const body = encodeURIComponent(textoLimpo);
      window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
      toast.success(`Abrindo seu aplicativo de e-mail para enviar para ${CONTACT_EMAIL}`);
      setSugestaoEnviada(true);
    } finally {
      setEnviandoSugestao(false);
    }
  };

  const totalSlides = 8;

  // Navegação por teclado (Setas e ESC)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      // Não interceptar setas enquanto o usuário digita no campo de sugestão
      if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') persistPreferenceAndClose();
        return;
      }
      if (e.key === 'Escape') {
        persistPreferenceAndClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, persistPreferenceAndClose]);

  if (!isOpen) return null;

  const firstName = (user?.nome || 'Usuário').split(' ')[0];

  const slidesMeta = [
    {
      step: 'BEM-VINDO(A) AO MEU BOLSO',
      title: `Olá, ${firstName}! Veja como é fácil começar 👋`
    },
    {
      step: 'PASSO 1 DE 7 • IMPORTAR DO EXCEL',
      title: '1. Já tem Planilha no Excel? Importe tudo primeiro!'
    },
    {
      step: 'PASSO 2 DE 7 • ORÇAMENTO',
      title: '2. Cadastre seu Orçamento do Mês'
    },
    {
      step: 'PASSO 3 DE 7 • CARTÕES DE CRÉDITO',
      title: '3. Cadastre seus Cartões e Bandeiras'
    },
    {
      step: 'PASSO 4 DE 7 • CATEGORIAS E SUBCATEGORIAS',
      title: '4. Configure suas Categorias e Subcategorias'
    },
    {
      step: 'PASSO 5 DE 7 • LANÇAR DESPESAS',
      title: '5. Lance suas Despesas e Escolha o Cartão'
    },
    {
      step: 'PASSO 6 DE 7 • RELATÓRIOS E RESULTADOS',
      title: '6. Acompanhe seu Orçamento e Custo de Vida'
    },
    {
      step: 'PASSO 7 DE 7 • CONTATO E SUGESTÕES',
      title: '7. Tem alguma Sugestão? Fale Conosco!'
    }
  ];

  const activeMeta = slidesMeta[currentSlide];

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={persistPreferenceAndClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO LIMPO E COM LETRAS GRANDES */}
        <div className="px-6 py-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              {activeMeta.step}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              {activeMeta.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={persistPreferenceAndClose}
            className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Fechar guia (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTEÚDO CENTRAL — LIMPO, DIRETO E COM FONTE GRANDE */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col justify-between gap-6 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* ==================== SLIDE 1: BOAS-VINDAS (VÍDEO-AULA + FIN) ==================== */}
          {currentSlide === 0 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Não se preocupe se for sua primeira vez! O sistema tem <strong>dois botões de ajuda</strong> sempre visíveis para te guiar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Card 1: Vídeo-Aula */}
                <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-amber-400/60 flex flex-col justify-between gap-4 shadow-lg">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-base shadow-md">
                      <Video className="w-5 h-5" />
                      <span>Vídeo-Aula ▾</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Botão no topo da tela
                    </h3>
                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                      Clique nele em qualquer página para assistir vídeos curtos explicando a tela (com opção de acelerar em <strong>1.25x</strong> ou <strong>1.5x</strong>).
                    </p>
                  </div>
                </div>

                {/* Card 2: Mascote FIN */}
                <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-emerald-400/60 flex flex-col justify-between gap-4 shadow-lg">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-400 text-black font-extrabold text-base shadow-md">
                      <img
                        src="/assets/fin_coin_boy.png"
                        alt="FIN"
                        className="w-6 h-6 rounded-full bg-white object-cover"
                      />
                      <span>Ajuda FIN</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Botão no menu lateral
                    </h3>
                    <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                      Clique em <strong>Ajuda FIN</strong> no menu à esquerda para abrir nosso assistente com dicas simples sobre o seu dinheiro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 2: PASSO 1 - IMPORTAÇÃO DO EXCEL ==================== */}
          {currentSlide === 1 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Se você já anotava suas contas em uma planilha do <strong>Excel</strong>, comece por aqui para não precisar digitar tudo do zero:
              </p>

              <div className="p-6 rounded-2xl bg-emerald-950/50 border-2 border-emerald-400/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-400 text-black">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Botão &ldquo;Importar Planilha&rdquo; no Dashboard
                  </h3>
                </div>

                <p className="text-base sm:text-xl text-slate-100 leading-relaxed">
                  Na tela inicial (<strong>Dashboard</strong>), clique no botão verde <strong>Importar Planilha</strong> no topo da página.
                </p>

                <p className="text-base sm:text-xl text-emerald-300 font-bold leading-relaxed">
                  👉 Você envia seu arquivo Excel e o sistema importa suas Receitas e Despesas automaticamente!
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/dashboard?importar=1')}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Abrir Importador de Planilha Excel</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 3: PASSO 2 - ORÇAMENTO ==================== */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Vá no menu <strong className="text-emerald-400">Orçamento</strong> e informe quanto você ganha no mês:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-emerald-950/50 border-2 border-emerald-400/70 space-y-2">
                  <span className="text-sm font-extrabold uppercase text-emerald-300 tracking-wider">
                    1º CAMPO PRINCIPAL
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    💰 Renda Prevista
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Digite o valor do seu salário ou renda do mês para o sistema saber quanto você tem disponível.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-400/60 space-y-2">
                  <span className="text-sm font-extrabold uppercase text-rose-300 tracking-wider">
                    2º SE VOCÊ TIVER PARCELAS/ACORDOS
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    📋 Aba Dívidas
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Cadastre suas dívidas do mês para o sistema descontar da renda e mostrar seu <strong>dinheiro livre real</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/orcamento')}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Target className="w-5 h-5" />
                  <span>Ir para a tela de Orçamento</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 4: PASSO 3 - FORMAS DE PAGAMENTO (CARTÕES) ==================== */}
          {currentSlide === 3 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Vá no menu <strong className="text-sky-400">Formas de Pagamento</strong> e cadastre os seus <strong>Cartões de Crédito</strong> (Nubank, Itaú, Visa, Mastercard...):
              </p>

              <div className="p-6 rounded-2xl bg-sky-950/40 border-2 border-sky-400/70 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-sky-400 text-black">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Por que cadastrar seus cartões aqui primeiro?
                  </h3>
                </div>

                <p className="text-base sm:text-xl text-slate-100 leading-relaxed">
                  Porque quando você for lançar uma <strong>Despesa</strong>, o seu cartão já vai aparecer na lista para você selecionar!
                </p>

                <p className="text-base sm:text-xl text-amber-300 font-bold leading-relaxed">
                  👉 Assim, o valor da compra vai direto para a fatura daquele cartão na sua guia anual (de Janeiro a Dezembro).
                </p>

                <div className="p-4 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 text-base sm:text-lg font-bold">
                  ⚠️ Lembre-se sempre: Passar no Cartão de Crédito é fazer uma <u>DÍVIDA FUTURA</u>! O dinheiro não sai hoje, mas vai descontar do seu próximo salário.
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/cartoes')}
                  className="px-6 py-3.5 rounded-2xl bg-sky-400 hover:bg-sky-300 text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Ir para Formas de Pagamento</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 5: PASSO 4 - CATEGORIAS E SUBCATEGORIAS ==================== */}
          {currentSlide === 4 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                No menu <strong className="text-amber-400">Configurações</strong>, clique na aba <strong>Categorias &amp; Metas</strong> para deixar o sistema com o seu jeito:
              </p>

              <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-amber-400/60 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-400 text-black">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Crie Categorias e Subcategorias
                  </h3>
                </div>

                <p className="text-base sm:text-xl text-slate-200 leading-relaxed">
                  O sistema já vem com categorias prontas (como <strong>Despesas Fixas</strong>, <strong>Lazer</strong> e <strong>Educação</strong>), mas você pode criar novas <strong>Subcategorias</strong> para detalhar seus gastos.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-base sm:text-lg text-amber-300 font-semibold">
                  Exemplo: Dentro de <strong>Despesas Fixas</strong>, você pode ter <em>Mercado</em>, <em>Aluguel</em>, <em>Luz</em> e <em>Farmácia</em>.
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/configuracoes?tab=categorias')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configurar Categorias e Subcategorias</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 6: PASSO 5 - LANÇAR DESPESAS NO DIA A DIA ==================== */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Com tudo configurado, basta usar as telas de <strong className="text-emerald-400">Receitas</strong> e <strong className="text-rose-400">Despesas</strong> no dia a dia:
              </p>

              <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-rose-400/60 space-y-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                  <TrendingDown className="w-7 h-7 text-rose-400" />
                  <span>Ao lançar uma Despesa, é só escolher:</span>
                </h3>

                <ul className="space-y-3 text-base sm:text-xl text-slate-200 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      A <strong>Categoria e Subcategoria</strong> (ex: <em>Despesas Fixas → Mercado</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-400 text-black font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      A <strong>Forma de Pagamento</strong>: escolha seu <strong>Cartão</strong> (sabendo que é uma <strong>dívida futura</strong> na fatura) ou <strong>Dinheiro / PIX</strong> (pago na hora, sem gerar dívida para o próximo mês).
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/despesas')}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>Ir para a tela de Despesas</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 7: PASSO 6 - RELATÓRIOS (ORÇAMENTO E CUSTO DE VIDA) ==================== */}
          {currentSlide === 6 && (
            <div className="space-y-6">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Acesse o menu <strong className="text-amber-400">Relatórios</strong> para enxergar com clareza para onde vai o seu dinheiro:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Gráfico 1: Acompanhamento de Orçamento */}
                <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-amber-400/60 space-y-3 shadow-lg">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-extrabold text-sm">
                    <BarChart3 className="w-5 h-5" />
                    <span>Gráfico 1</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Acompanhamento de Orçamento
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Compara lado a lado o <strong>quanto você planejou gastar</strong> com o <strong>quanto realmente gastou</strong> em cada categoria do mês.
                  </p>
                </div>

                {/* Gráfico 2: Análise de Custo de Vida */}
                <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-sky-400/60 space-y-3 shadow-lg">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-400 text-black font-extrabold text-sm">
                    <PieChart className="w-5 h-5" />
                    <span>Gráfico 2</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Análise de Custo de Vida
                  </h3>
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                    Mostra quanto custa manter seu padrão de vida atual e quais despesas mais pesam no seu bolso todo mês.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToRoute('/relatorios')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-base sm:text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  <PieChart className="w-5 h-5" />
                  <span>Ir para a tela de Relatórios</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================== SLIDE 8: PASSO 7 - CONTATO E SUGESTÕES ==================== */}
          {currentSlide === 7 && (
            <div className="space-y-5">
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-medium">
                Sua opinião ajuda a evoluir o <strong>Meu Bolso</strong>! Envie sugestões, ideias ou dúvidas diretamente para nosso e-mail oficial:
              </p>

              <div className="p-6 rounded-2xl bg-slate-800/90 border-2 border-amber-400/60 space-y-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-400 text-black">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 block">
                        CANAL DIRETO DE SUGESTÕES
                      </span>
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Sugestão para o Meu Bolso')}`}
                        className="text-lg sm:text-2xl font-extrabold text-white hover:text-amber-300 underline transition-colors"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEnviarSugestao} className="space-y-4">
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
                      <MessageSquarePlus className="w-5 h-5 text-amber-400" />
                      <span>Escreva sua sugestão ou melhoria abaixo:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={sugestaoTexto}
                      onChange={(e) => setSugestaoTexto(e.target.value)}
                      placeholder="Ex: Gostaria de sugerir uma melhoria na tela de..."
                      className="w-full rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-amber-400 focus:outline-none p-4 text-base sm:text-lg text-white placeholder-slate-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {sugestaoEnviada ? (
                      <span className="text-base font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Obrigado! Sua mensagem foi encaminhada para {CONTACT_EMAIL}.
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base text-slate-400">
                        Você também pode enviar sugestões a qualquer momento em <strong>Configurações</strong>.
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={enviandoSugestao}
                      className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-base flex items-center gap-2 transition-all cursor-pointer shadow-md ml-auto"
                    >
                      <Send className="w-5 h-5" />
                      <span>{enviandoSugestao ? 'Enviando...' : 'Enviar Sugestão'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* BOLINHAS DE NAVEGAÇÃO GRANDES E VISÍVEIS */}
          <div className="flex items-center justify-center gap-2.5 pt-2">
            {slidesMeta.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide
                    ? 'w-10 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-3 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir para Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* RODAPÉ COM LETRAS LEGÍVEIS E BOTÕES GRANDES */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-sm sm:text-base text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 text-amber-400 focus:ring-amber-400 cursor-pointer accent-amber-400"
            />
            <span>Não mostrar automaticamente no próximo login (posso abrir em &ldquo;Guia Inicial&rdquo;)</span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}

            {currentSlide < totalSlides - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-base flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Próximo ({currentSlide + 1}/{totalSlides})</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={persistPreferenceAndClose}
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-base flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Concluir e Começar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuideModal;
