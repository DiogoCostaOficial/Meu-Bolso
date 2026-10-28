import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Minus, Lightbulb, GraduationCap, Send, RotateCcw, Maximize2, Minimize2, Film } from 'lucide-react';
import { useEdu } from '../contexts/EduContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { askFinAboutSystem } from '../utils/finChatbot';
import { evaluatePurchaseQuiz } from '../utils/finBooksKnowledge';
import { translateFinParagraph } from '../utils/finI18n';
import FinVideoPlayer from './FinVideoPlayer';
import api from '../services/api';

const MASCOT_IMAGES = {
    wallet: '/assets/fin_wallet_boy.png',
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

// Escalas inclusivas de fonte (0: Compacta, 1: Padrão Confortável, 2: Grande, 3: Extra Grande)
const FONT_SCALE_CONFIG = [
    {
        label: 'Compacto',
        title: 'text-base',
        subtitle: 'text-xs',
        body: 'text-sm',
        secondary: 'text-xs',
        chip: 'text-[11px]',
        input: 'text-xs',
        widthClass: 'sm:w-[440px]'
    },
    {
        label: 'Normal+',
        title: 'text-lg',
        subtitle: 'text-[13px]',
        body: 'text-[15px]',
        secondary: 'text-sm',
        chip: 'text-xs',
        input: 'text-sm',
        widthClass: 'sm:w-[490px]'
    },
    {
        label: 'Grande',
        title: 'text-xl',
        subtitle: 'text-sm',
        body: 'text-[17px]',
        secondary: 'text-base',
        chip: 'text-[13px]',
        input: 'text-base',
        widthClass: 'sm:w-[550px]'
    },
    {
        label: 'Extra Grande',
        title: 'text-2xl',
        subtitle: 'text-base',
        body: 'text-[19px]',
        secondary: 'text-[17px]',
        chip: 'text-sm',
        input: 'text-base',
        widthClass: 'sm:w-[620px]'
    }
];

const CATEGORIAS_PADRAO_QUIZ = [
    'Lazer',
    'Despesas Fixas',
    'Educação',
    'Investimentos',
    'Reserva de Emergência'
];

const EduMascot = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isVisible, hideMascot, toggleMascot, isDocked, dockMascot, getLessonContent, mascotState, primeiroNome, vocativo, tratamento } = useEdu();
    const { formatCurrency } = useCurrency();
    const { language, t } = useLanguage();
    const [userQuestion, setUserQuestion] = useState('');
    const [chatbotResponse, setChatbotResponse] = useState(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [videoTopicId, setVideoTopicId] = useState(null);

    // Acessibilidade: Escala de fonte (0 a 3, padrão 1 = maior e mais legível) e Expansão da Janela
    const [fontScale, setFontScale] = useState(() => {
        try {
            const saved = parseInt(localStorage.getItem('fin_font_scale'), 10);
            if (!isNaN(saved) && saved >= 0 && saved <= 3) return saved;
        } catch {}
        return 1;
    });

    const [isExpanded, setIsExpanded] = useState(() => {
        try {
            return localStorage.getItem('fin_window_expanded') === 'true';
        } catch {
            return false;
        }
    });

    const handleDecreaseFont = (e) => {
        e?.stopPropagation();
        setFontScale((prev) => {
            const next = Math.max(0, prev - 1);
            try { localStorage.setItem('fin_font_scale', String(next)); } catch {}
            return next;
        });
    };

    const handleIncreaseFont = (e) => {
        e?.stopPropagation();
        setFontScale((prev) => {
            const next = Math.min(3, prev + 1);
            try { localStorage.setItem('fin_font_scale', String(next)); } catch {}
            return next;
        });
    };

    const handleToggleExpand = (e) => {
        e?.stopPropagation();
        setIsExpanded((prev) => {
            const next = !prev;
            try { localStorage.setItem('fin_window_expanded', String(next)); } catch {}
            return next;
        });
    };

    const currentFont = FONT_SCALE_CONFIG[fontScale] || FONT_SCALE_CONFIG[1];

    // Estado do Quiz Infantil "Posso Gastar?"
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [userDataQuiz, setUserDataQuiz] = useState(null);
    const [loadingQuizData, setLoadingQuizData] = useState(false);
    const [quizCategories, setQuizCategories] = useState(CATEGORIAS_PADRAO_QUIZ);
    const [quizItem, setQuizItem] = useState('');
    const [quizValor, setQuizValor] = useState('');
    const [quizCategoria, setQuizCategoria] = useState('Lazer');
    const [quizTipoEscolha, setQuizTipoEscolha] = useState('desejo');
    const [quizResult, setQuizResult] = useState(null);
    const [quizFormError, setQuizFormError] = useState('');
    const contentScrollRef = useRef(null);

    // Posição customizada (quando o usuário arrasta o mascote)
    const [position, setPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const mascotRef = useRef(null);
    const dragDataRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0, moved: false });
    const activeCleanupRef = useRef(null);

    // Limpeza de listeners caso o componente desmonte durante interação
    useEffect(() => {
        return () => {
            if (activeCleanupRef.current) {
                activeCleanupRef.current();
            }
        };
    }, []);

    // Carregar dados reais de orçamento e despesas do cliente ao abrir o Quiz
    const openQuiz = async () => {
        setChatbotResponse(null);
        setQuizResult(null);
        setQuizFormError('');
        setIsVideoOpen(false);
        setIsQuizOpen(true);
        setLoadingQuizData(true);

        try {
            const response = await api.get('/user/dados');
            const dados = response.data?.dados || {};
            setUserDataQuiz(dados);

            const mesAtual = new Date().toISOString().slice(0, 7);
            const orcamentos = Array.isArray(dados.orcamentos) ? dados.orcamentos : [];
            const orcamentoMes = orcamentos.find((o) => o.mes === mesAtual) || orcamentos[orcamentos.length - 1];

            let nomesCategorias = [];
            if (orcamentoMes && Array.isArray(orcamentoMes.categorias) && orcamentoMes.categorias.length > 0) {
                nomesCategorias = orcamentoMes.categorias.map((c) => c.nome).filter(Boolean);
            } else if (Array.isArray(dados.categorias) && dados.categorias.length > 0) {
                nomesCategorias = dados.categorias.map((c) => c.nome).filter(Boolean);
            }

            const listaFinal = nomesCategorias.length > 0
                ? Array.from(new Set(nomesCategorias))
                : CATEGORIAS_PADRAO_QUIZ;

            setQuizCategories(listaFinal);
            if (!listaFinal.includes(quizCategoria)) {
                setQuizCategoria(listaFinal[0]);
            }
        } catch (err) {
            console.error('Erro ao carregar dados para o Quiz do FIN:', err);
        } finally {
            setLoadingQuizData(false);
        }
    };

    const handleRunQuiz = (e) => {
        e.preventDefault();
        setQuizFormError('');

        const itemTrimmed = String(quizItem || '').trim();
        const valorNum = parseFloat(String(quizValor).replace(',', '.'));

        if (!itemTrimmed && (!valorNum || valorNum <= 0)) {
            setQuizFormError('⚠️ Falta preencher o campo 1 (onde você quer gastar) e o campo 2 (quantas moedas custa)!');
            return;
        }
        if (!itemTrimmed) {
            setQuizFormError('⚠️ Falta preencher o campo 1: me conta onde ou com o quê você quer gastar!');
            return;
        }
        if (!valorNum || valorNum <= 0) {
            setQuizFormError('⚠️ Falta preencher o campo 2: informe um valor maior que zero (ex: 30)!');
            return;
        }

        try {
            const rawResult = evaluatePurchaseQuiz(
                userDataQuiz,
                {
                    valor: valorNum,
                    item: itemTrimmed,
                    categoria: quizCategoria,
                    tipoEscolha: quizTipoEscolha
                },
                formatCurrency,
                tratamento
            );
            const resultado = language === 'pt-BR' ? rawResult : {
                ...rawResult,
                badge: translateFinParagraph(rawResult.badge, language, t),
                headline: translateFinParagraph(rawResult.headline, language, t),
                missingItems: Array.isArray(rawResult.missingItems)
                    ? rawResult.missingItems.map((m) => translateFinParagraph(m, language, t))
                    : [],
                numbersSummary: Array.isArray(rawResult.numbersSummary)
                    ? rawResult.numbersSummary.map((line) => translateFinParagraph(line, language, t))
                    : [],
                kidExplanation: translateFinParagraph(rawResult.kidExplanation, language, t)
            };
            setQuizResult(resultado);
            setTimeout(() => {
                contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }, 30);
        } catch (err) {
            console.error('Erro ao calcular Quiz do FIN:', err);
            setQuizFormError(translateFinParagraph('⚠️ Ocorreu um problema ao consultar seu Orçamento. Tente novamente!', language, t));
        }
    };

    // Determinar qual imagem usar
    const mascotImage = MASCOT_IMAGES[mascotState] || MASCOT_IMAGES.coin;

    // Gerenciamento de arrasto via Pointer Events (compatível com mouse e touch)
    const handlePointerDown = (e) => {
        if (e.button && e.button !== 0) return; // Apenas botão principal

        const el = mascotRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();

        dragDataRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialPosX: rect.left,
            initialPosY: rect.top,
            moved: false
        };

        const handlePointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - dragDataRef.current.startX;
            const deltaY = moveEvent.clientY - dragDataRef.current.startY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                dragDataRef.current.moved = true;
                setIsDragging(true);
            }

            if (dragDataRef.current.moved) {
                const width = rect.width || 96;
                const height = rect.height || 96;

                let nextX = dragDataRef.current.initialPosX + deltaX;
                let nextY = dragDataRef.current.initialPosY + deltaY;

                // Limitar dentro da tela visível (com margem de 12px)
                nextX = Math.max(12, Math.min(window.innerWidth - width - 12, nextX));
                nextY = Math.max(12, Math.min(window.innerHeight - height - 12, nextY));

                setPosition({ x: nextX, y: nextY });
            }
        };

        const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            activeCleanupRef.current = null;

            if (dragDataRef.current.moved) {
                setTimeout(() => setIsDragging(false), 50);
            } else {
                setIsDragging(false);
            }
        };

        const activeCleanup = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
        activeCleanupRef.current = activeCleanup;

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    // Se estiver minimizado para a barra lateral, não renderiza flutuante
    if (isDocked) return null;

    const rawContent = getLessonContent();
    const content = !rawContent || language === 'pt-BR' ? rawContent : {
        ...rawContent,
        title: translateFinParagraph(rawContent.title, language, t),
        explanation: translateFinParagraph(rawContent.explanation, language, t),
        analogy: rawContent.analogy ? translateFinParagraph(rawContent.analogy, language, t) : null,
        tips: Array.isArray(rawContent.tips) ? rawContent.tips.map((tip) => translateFinParagraph(tip, language, t)) : [],
        analysis: rawContent.analysis ? {
            ...rawContent.analysis,
            status: translateFinParagraph(rawContent.analysis.status, language, t),
            analogy: translateFinParagraph(rawContent.analysis.analogy, language, t),
            explanation: rawContent.analysis.explanation ? translateFinParagraph(rawContent.analysis.explanation, language, t) : null,
            tip: rawContent.analysis.tip ? translateFinParagraph(rawContent.analysis.tip, language, t) : null
        } : null,
        cta: rawContent.cta ? {
            ...rawContent.cta,
            label: translateFinParagraph(rawContent.cta.label, language, t)
        } : null
    };

    const handleMascotClick = (e) => {
        e.stopPropagation();
        if (dragDataRef.current.moved || isDragging) return;
        toggleMascot();
    };

    const resetPosition = (e) => {
        e?.stopPropagation();
        setPosition(null);
    };

    const handleAskQuestion = (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;

        setIsQuizOpen(false);
        setIsVideoOpen(false);
        setQuizResult(null);
        const response = askFinAboutSystem(userQuestion, { primeiroNome, vocativo, language, t });
        setChatbotResponse({
            question: userQuestion,
            answer: response
        });
        setUserQuestion('');
    };

    const openVideoManual = (topicOverride = null) => {
        setIsQuizOpen(false);
        setQuizResult(null);
        setChatbotResponse(null);
        setVideoTopicId(topicOverride || location.pathname || 'orcamento');
        setIsVideoOpen(true);
    };

    const clearChat = () => {
        setChatbotResponse(null);
        setIsQuizOpen(false);
        setIsVideoOpen(false);
        setQuizResult(null);
    };

    // Calcular alinhamento inteligente do balão de fala baseado na posição do mascote
    const isCustom = position !== null;
    const isTopHalf = isCustom && position.y < window.innerHeight / 2;
    const isLeftHalf = isCustom && position.x < window.innerWidth / 2;

    const balloonPositionClass = isCustom
        ? `${isTopHalf ? 'top-full mt-3' : 'bottom-full mb-3'} ${isLeftHalf ? 'left-0' : 'right-0'}`
        : 'bottom-full mb-3 right-0';

    const balloonMaxHeight = isCustom
        ? isTopHalf
            ? `calc(100dvh - ${Math.min(position.y + 115, window.innerHeight - 80)}px)`
            : `calc(${Math.max(position.y - 15, 220)}px)`
        : 'calc(100dvh - 140px)';

    const statusColors = {
        verde: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        amarelo: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        vermelho: 'bg-red-500/15 border-red-500/40 text-red-400'
    };

    return (
        <>
            {/* Backdrop suave: levemente esbranquiçado e levemente borrado para focar a atenção no FINAN */}
            {isVisible && content && (
                <div
                    className="fixed inset-0 z-40 bg-white/20 dark:bg-white/10 backdrop-blur-[3px] transition-all duration-300 animate-in fade-in"
                    onClick={() => {
                        clearChat();
                        hideMascot();
                    }}
                    title="Clique fora para fechar a ajuda do FIN"
                    aria-label="Fechar ajuda do FIN"
                />
            )}

            <div
                ref={mascotRef}
            style={
                position
                    ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
                    : undefined
            }
            className={`fixed z-50 select-none flex flex-col ${
                !position ? 'bottom-5 right-5 items-end' : isLeftHalf ? 'items-start' : 'items-end'
            }`}
        >
            {/* Balão de Fala / Diálogo do FIN */}
            {isVisible && content && (
                <div
                    style={{ maxHeight: isExpanded ? '88dvh' : balloonMaxHeight }}
                    className={`${
                        isExpanded
                            ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-24px)] sm:w-[680px] md:w-[760px]'
                            : `absolute z-50 w-[calc(100vw-32px)] ${currentFont.widthClass} max-w-[calc(100vw-24px)] ${balloonPositionClass}`
                    } flex flex-col bg-custom-card text-custom-main rounded-2xl p-4 sm:p-6 shadow-2xl border border-custom-color transition-all animate-in fade-in zoom-in-95 duration-200`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Cabeçalho do Balão com Controles Inclusivos de Acessibilidade */}
                    <div className="flex items-start sm:items-center justify-between gap-2 pb-3 border-b border-custom-color/40 flex-shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-amber-500/10 dark:bg-amber-900/30 rounded-xl text-amber-500 flex-shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className={`${currentFont.title} font-bold leading-tight`}>
                                    {isVideoOpen
                                        ? '🎬 Vídeos Curtos do Manual (IA)'
                                        : isQuizOpen
                                        ? '🍬 Quiz: Posso Gastar?'
                                        : content.title}
                                </h3>
                                <p className={`${currentFont.subtitle} text-amber-500 font-semibold mt-0.5`}>
                                    {isVideoOpen
                                        ? 'O FIN explica o Manual de Uso em vídeo passo a passo!'
                                        : isQuizOpen
                                        ? 'O FIN calcula o impacto no seu pote na hora!'
                                        : 'FIN • Seu Conselheiro Financeiro'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                            {/* Controles de Acessibilidade: A- / A+ / Expandir Janela */}
                            <div className="flex items-center bg-custom-primary/30 border border-custom-color rounded-lg p-0.5 mr-1">
                                <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={handleDecreaseFont}
                                    disabled={fontScale === 0}
                                    className="px-2 py-1 text-xs font-extrabold text-custom-main hover:text-amber-500 hover:bg-amber-500/10 disabled:opacity-35 disabled:pointer-events-none rounded transition cursor-pointer"
                                    title="Diminuir tamanho da letra (A-)"
                                    aria-label="Diminuir tamanho da letra"
                                >
                                    A-
                                </button>
                                <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={handleIncreaseFont}
                                    disabled={fontScale === 3}
                                    className="px-2 py-1 text-xs font-extrabold text-custom-main hover:text-amber-500 hover:bg-amber-500/10 disabled:opacity-35 disabled:pointer-events-none rounded transition cursor-pointer border-l border-custom-color/50"
                                    title="Aumentar tamanho da letra (A+)"
                                    aria-label="Aumentar tamanho da letra"
                                >
                                    A+
                                </button>
                                <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={handleToggleExpand}
                                    className={`p-1.5 rounded transition cursor-pointer border-l border-custom-color/50 ${
                                        isExpanded
                                            ? 'text-amber-500 bg-amber-500/15'
                                            : 'text-custom-main hover:text-amber-500 hover:bg-amber-500/10'
                                    }`}
                                    title={isExpanded ? 'Reduzir janela de ajuda para o canto' : 'Expandir janela de ajuda no centro da tela'}
                                    aria-label={isExpanded ? 'Reduzir janela de ajuda' : 'Expandir janela de ajuda'}
                                >
                                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            {position && !isExpanded && (
                                <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={resetPosition}
                                    className="p-1.5 hover:text-custom-gold hover:bg-black/10 rounded transition cursor-pointer"
                                    title="Voltar mascote para o canto inferior direito"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => {
                                    clearChat();
                                    hideMascot();
                                }}
                                className="p-1.5 hover:text-custom-gold hover:bg-black/10 rounded transition cursor-pointer"
                                title="Minimizar para o mascote"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => {
                                    clearChat();
                                    dockMascot();
                                }}
                                className="p-1.5 hover:text-red-400 hover:bg-black/10 rounded transition cursor-pointer"
                                title="Minimizar para o menu lateral (abaixo de Configurações)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo da Mensagem / Quiz / Chatbot */}
                    <div ref={contentScrollRef} className={`mt-3.5 flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5 ${currentFont.body}`}>
                        {isVideoOpen ? (
                            <FinVideoPlayer
                                initialTopicId={videoTopicId || location.pathname}
                                currentFont={currentFont}
                                onClose={clearChat}
                                onNavigateToRoute={(targetRoute) => {
                                    navigate(targetRoute);
                                    hideMascot();
                                }}
                            />
                        ) : isQuizOpen ? (
                            quizResult ? (
                                <div className="space-y-3.5">
                                    <div className={`p-4 rounded-xl border ${statusColors[quizResult.status] || statusColors.amarelo}`}>
                                        <p className={`${currentFont.subtitle} font-extrabold uppercase tracking-wide mb-1`}>
                                            {quizResult.badge}
                                        </p>
                                        <p className={`font-bold ${currentFont.body} text-custom-main leading-snug`}>
                                            {quizResult.headline}
                                        </p>
                                    </div>

                                    {Array.isArray(quizResult.missingItems) && quizResult.missingItems.length > 0 && (
                                        <div className={`bg-red-500/10 p-3.5 rounded-xl border border-red-500/35 space-y-1.5 ${currentFont.secondary}`}>
                                            <p className="font-extrabold text-red-400 mb-1">
                                                📋 O que falta preencher para o cálculo completo:
                                            </p>
                                            {quizResult.missingItems.map((missing, idx) => (
                                                <p key={idx} className="leading-relaxed flex items-start gap-2">
                                                    <span className="text-red-400 font-bold flex-shrink-0">•</span>
                                                    <span>{missing}</span>
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`bg-custom-primary/30 p-3.5 rounded-xl border border-custom-color space-y-1.5 ${currentFont.secondary}`}>
                                        <p className="font-bold text-amber-500 mb-1">🍬 Contando as Balinhas do seu Pote:</p>
                                        {quizResult.numbersSummary.map((line, i) => (
                                            <p key={i} className="opacity-95 leading-relaxed">{line}</p>
                                        ))}
                                    </div>

                                    <div className={`bg-amber-500/10 p-4 rounded-xl border border-amber-500/25 ${currentFont.secondary} leading-relaxed whitespace-pre-line`}>
                                        {quizResult.kidExplanation}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuizResult(null);
                                                setQuizFormError('');
                                                setQuizItem('');
                                                setQuizValor('');
                                            }}
                                            className={`flex-1 py-2.5 px-3 bg-custom-gold text-black rounded-lg hover:opacity-90 transition font-bold ${currentFont.chip} cursor-pointer shadow-sm`}
                                        >
                                            🔄 Testar Outra Compra
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigate('/orcamento');
                                                hideMascot();
                                            }}
                                            className={`flex-1 py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 rounded-lg transition font-bold ${currentFont.chip} cursor-pointer`}
                                        >
                                            {Array.isArray(quizResult.missingItems) && quizResult.missingItems.length > 0
                                                ? '🏷️ Preencher Orçamento'
                                                : '🏷️ Ir ao Orçamento'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearChat}
                                            className={`w-full py-1.5 ${currentFont.chip} opacity-75 hover:opacity-100 transition cursor-pointer text-center`}
                                        >
                                            Voltar para a Dica da Tela
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleRunQuiz} noValidate className="space-y-3.5">
                                    <p className={`${currentFont.secondary} opacity-90 leading-relaxed`}>
                                        Psst! Eu vi você pegando a carteira aí fora da tela! 👀 Me conta aqui, <strong>{vocativo}</strong>, o que você quer comprar que eu olho o seu <strong>Orçamento</strong> pra ver se sobram moedinhas no cofre! 👇
                                    </p>

                                    {quizFormError && (
                                        <div className={`p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 font-bold ${currentFont.secondary}`}>
                                            {quizFormError}
                                        </div>
                                    )}

                                    <div>
                                        <label className={`block ${currentFont.secondary} font-bold mb-1.5 text-amber-500`}>
                                            1. Onde ou com o quê você quer gastar, {vocativo}?
                                        </label>
                                        <input
                                            type="text"
                                            value={quizItem}
                                            onChange={(e) => {
                                                setQuizItem(e.target.value);
                                                if (quizFormError) setQuizFormError('');
                                            }}
                                            placeholder="Ex: Balinha, Pizza de sábado, Tênis novo..."
                                            className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-custom-color rounded-lg ${currentFont.input} text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={`block ${currentFont.secondary} font-bold mb-1.5 text-amber-500`}>
                                                2. Quantas moedas custa?
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={quizValor}
                                                onChange={(e) => {
                                                    setQuizValor(e.target.value);
                                                    if (quizFormError) setQuizFormError('');
                                                }}
                                                placeholder="Ex: 50.00"
                                                className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-custom-color rounded-lg ${currentFont.input} text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block ${currentFont.secondary} font-bold mb-1.5 text-amber-500`}>
                                                3. Qual Pote de Balas?
                                            </label>
                                            <select
                                                value={quizCategoria}
                                                onChange={(e) => setQuizCategoria(e.target.value)}
                                                disabled={loadingQuizData}
                                                className={`w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-custom-color rounded-lg ${currentFont.input} text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                                            >
                                                {quizCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block ${currentFont.secondary} font-bold mb-1.5 text-amber-500`}>
                                            4. Promessa de dedinho (sem mentir pro FIN!): Isso é...
                                        </label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setQuizTipoEscolha('necessidade')}
                                                className={`py-2.5 px-3 rounded-xl border ${currentFont.secondary} font-bold transition cursor-pointer ${
                                                    quizTipoEscolha === 'necessidade'
                                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                        : 'bg-custom-primary/20 border-custom-color opacity-75 hover:opacity-100'
                                                }`}
                                            >
                                                🍞 Almoço (Preciso!)
                                                <span className={`block ${currentFont.chip} font-normal opacity-85 mt-0.5`}>É necessidade real</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setQuizTipoEscolha('desejo')}
                                                className={`py-2.5 px-3 rounded-xl border ${currentFont.secondary} font-bold transition cursor-pointer ${
                                                    quizTipoEscolha === 'desejo'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                        : 'bg-custom-primary/20 border-custom-color opacity-75 hover:opacity-100'
                                                }`}
                                            >
                                                🍭 Balinha (Vontade!)
                                                <span className={`block ${currentFont.chip} font-normal opacity-85 mt-0.5`}>É um desejo meu</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="submit"
                                            className={`flex-1 py-2.5 px-3.5 bg-custom-gold text-black rounded-xl hover:opacity-95 transition font-extrabold ${currentFont.secondary} cursor-pointer shadow-md`}
                                        >
                                            🍬 Ver se Sobra Balinha no Pote!
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearChat}
                                            className={`py-2.5 px-3.5 bg-custom-primary/30 hover:bg-custom-primary/50 border border-custom-color rounded-xl ${currentFont.secondary} font-semibold transition cursor-pointer`}
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : chatbotResponse ? (
                            <div className="space-y-3.5">
                                <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                                    <p className={`${currentFont.subtitle} font-bold text-amber-500 mb-1`}>Você perguntou:</p>
                                    <p className={`italic ${currentFont.secondary} opacity-95`}>"{chatbotResponse.question}"</p>
                                </div>
                                <div className={`bg-custom-primary/20 p-4 rounded-xl border border-custom-color leading-relaxed ${currentFont.body} whitespace-pre-line`}>
                                    {chatbotResponse.answer}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openVideoManual(location.pathname)}
                                        className={`flex-1 py-2.5 px-3 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition font-extrabold ${currentFont.chip} cursor-pointer shadow-sm flex items-center justify-center gap-1.5`}
                                    >
                                        <Film className="w-4 h-4" />
                                        <span>🎬 Ver Vídeo Explicativo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openQuiz}
                                        className={`flex-1 py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 rounded-lg transition font-bold ${currentFont.chip} cursor-pointer`}
                                    >
                                        🎮 Quiz: Posso Gastar?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearChat}
                                        className={`w-full py-2 px-3 bg-custom-primary/30 hover:bg-custom-primary/50 border border-custom-color rounded-lg transition font-semibold ${currentFont.chip} cursor-pointer`}
                                    >
                                        Voltar à Dica da Tela
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                <p className={`${currentFont.body} opacity-95 leading-relaxed`}>
                                    {content.explanation}
                                </p>

                                {content.analogy && (
                                    <div className="bg-amber-500/10 dark:bg-amber-900/15 p-3.5 rounded-xl border border-amber-500/25">
                                        <p className={`${currentFont.secondary} italic opacity-95 leading-relaxed`}>
                                            "{content.analogy}"
                                        </p>
                                    </div>
                                )}

                                {content.analysis && (
                                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                                        <p className={`font-bold text-emerald-500 ${currentFont.secondary} mb-1`}>
                                            {content.analysis.status}
                                        </p>
                                        <p className={`${currentFont.secondary} opacity-95 mb-2 leading-relaxed`}>
                                            {content.analysis.analogy}
                                        </p>
                                        {content.analysis.explanation && (
                                            <p className={`${currentFont.secondary} text-emerald-500 font-bold italic border-t border-emerald-500/20 pt-2 mt-2`}>
                                                "{content.analysis.explanation}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {content.tips && content.tips.length > 0 ? (
                                    <div className="space-y-2.5 bg-custom-primary/20 p-3.5 rounded-xl border border-custom-color">
                                        {content.tips.map((tipItem, idx) => (
                                            <div key={idx} className={`flex items-start gap-2.5 ${currentFont.secondary} opacity-95 leading-relaxed`}>
                                                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                                                <p>{tipItem}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : content.analysis?.tip ? (
                                    <div className={`flex items-start gap-2.5 ${currentFont.secondary} opacity-95 leading-relaxed bg-custom-primary/20 p-3.5 rounded-xl border border-custom-color`}>
                                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                                        <p>{content.analysis.tip}</p>
                                    </div>
                                ) : null}

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openVideoManual(location.pathname)}
                                        className={`flex-1 py-2.5 px-3.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 rounded-xl transition font-extrabold ${currentFont.secondary} cursor-pointer flex items-center justify-center gap-1.5`}
                                    >
                                        <Film className="w-4 h-4" />
                                        <span>🎬 Ver Vídeo Explicativo</span>
                                    </button>
                                    {content.cta && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigate(content.cta.path);
                                                hideMascot();
                                            }}
                                            className={`flex-1 py-2.5 px-3.5 bg-custom-gold text-black rounded-xl hover:opacity-95 transition font-bold ${currentFont.secondary} cursor-pointer shadow-md flex items-center justify-center gap-1.5`}
                                        >
                                            {content.cta.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Atalhos Rápidos do FIN (Quiz + Vídeos do Manual + Sabedoria) */}
                    <div className="mt-3 pt-2.5 border-t border-custom-color/40 flex flex-wrap gap-1.5 flex-shrink-0">
                        <button
                            type="button"
                            onClick={openQuiz}
                            className={`px-3.5 py-1.5 ${currentFont.chip} font-bold rounded-full bg-custom-gold text-black hover:opacity-90 transition cursor-pointer shadow-sm`}
                            title="Brinque no Quiz antes de gastar: diga quanto e onde quer gastar e veja se cabe na sua meta!"
                        >
                            🎮 Quiz: Posso Gastar?
                        </button>
                        <button
                            type="button"
                            onClick={() => openVideoManual(location.pathname)}
                            className={`px-3.5 py-1.5 ${currentFont.chip} font-bold rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/40 transition cursor-pointer shadow-sm flex items-center gap-1`}
                            title="Assista a um vídeo curto do FIN explicando como usar esta tela e todos os capítulos do Manual!"
                        >
                            <Film className="w-3.5 h-3.5" />
                            <span>🎬 Vídeos do Manual</span>
                        </button>
                        {[
                            { label: "🏷️ Dar nome ao dinheiro", query: "O que é dar nome ao dinheiro?" },
                            { label: "🤔 Necessidade vs Desejo", query: "Qual a diferença entre necessidade e desejo?" },
                            { label: "⛄ Bola de neve", query: "Como funciona a bola de neve dos juros?" }
                        ].map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                onClick={() => {
                                    setIsQuizOpen(false);
                                    setIsVideoOpen(false);
                                    setQuizResult(null);
                                    const response = askFinAboutSystem(chip.query, { primeiroNome, vocativo, language, t });
                                    setChatbotResponse({
                                        question: translateFinParagraph(chip.query, language, t),
                                        answer: response
                                    });
                                }}
                                className={`px-3 py-1.5 ${currentFont.chip} font-semibold rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition cursor-pointer`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Caixa de Pergunta ao FIN */}
                    <form onSubmit={handleAskQuestion} className="mt-2.5 flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            placeholder="Pergunte algo ao FIN (ex: Para que serve Renda Real?)..."
                            className={`flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-custom-color rounded-lg ${currentFont.input} text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                        />
                        <button
                            type="submit"
                            className="px-3.5 py-2.5 bg-custom-gold text-black rounded-lg hover:opacity-95 transition font-bold cursor-pointer"
                            title="Enviar pergunta"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Botão Flutuante Móvel do Mascote FIN */}
            <div
                onPointerDown={handlePointerDown}
                onClick={handleMascotClick}
                onDoubleClick={resetPosition}
                className="relative cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform flex flex-col items-center group touch-none"
                title="FIN Assistente: Clique para abrir/minimizar ou arraste para reposicionar na tela"
            >
                {/* Círculo do Mascote com Imagem (Tamanho Original 96px) */}
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-2xl border-4 border-amber-400 group-hover:border-amber-500 overflow-hidden flex items-center justify-center relative z-10 transition-colors">
                    <img
                        src={mascotImage}
                        alt="FIN Assistente"
                        className="w-full h-full object-cover select-none pointer-events-none"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>

                {/* Badge 'FIN' Dourada */}
                <div className="absolute -bottom-1 right-0 z-20 bg-custom-gold text-black text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-800 tracking-wider select-none pointer-events-none">
                    FIN
                </div>

                {/* Botão de Fechar/Minimizar para o menu lateral (visível ao passar o mouse) */}
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        dockMascot();
                    }}
                    className="absolute -top-1 -left-1 z-30 w-7 h-7 rounded-full bg-slate-900 text-gray-200 hover:text-white hover:bg-red-500 border-2 border-white dark:border-slate-700 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Minimizar para o menu lateral (abaixo de Configurações)"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
        </>
    );
};

export default EduMascot;
