import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Lightbulb, GraduationCap, Send, RotateCcw } from 'lucide-react';
import { useEdu } from '../contexts/EduContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { askFinAboutSystem } from '../utils/finChatbot';
import { evaluatePurchaseQuiz } from '../utils/finBooksKnowledge';
import api from '../services/api';

const MASCOT_IMAGES = {
    wallet: '/assets/fin_wallet_boy.png',
    coin: '/assets/fin_coin_boy.png',
    bill: '/assets/fin_bill_boy.png',
    gold: '/assets/fin_gold_boy.png'
};

const CATEGORIAS_PADRAO_QUIZ = [
    'Lazer',
    'Despesas Fixas',
    'Educação',
    'Investimentos',
    'Reserva de Emergência'
];

const EduMascot = () => {
    const navigate = useNavigate();
    const { isVisible, hideMascot, toggleMascot, isDocked, dockMascot, getLessonContent, mascotState } = useEdu();
    const { formatCurrency } = useCurrency();
    const [userQuestion, setUserQuestion] = useState('');
    const [chatbotResponse, setChatbotResponse] = useState(null);

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
        const valorNum = parseFloat(String(quizValor).replace(',', '.'));
        if (!valorNum || valorNum <= 0) return;

        const resultado = evaluatePurchaseQuiz(
            userDataQuiz,
            {
                valor: valorNum,
                item: quizItem || 'essa compra',
                categoria: quizCategoria,
                tipoEscolha: quizTipoEscolha
            },
            formatCurrency
        );
        setQuizResult(resultado);
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

    const content = getLessonContent();

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
        setQuizResult(null);
        const response = askFinAboutSystem(userQuestion);
        setChatbotResponse({
            question: userQuestion,
            answer: response
        });
        setUserQuestion('');
    };

    const clearChat = () => {
        setChatbotResponse(null);
        setIsQuizOpen(false);
        setQuizResult(null);
    };

    // Calcular alinhamento inteligente do balão de fala baseado na posição do mascote
    const isCustom = position !== null;
    const isTopHalf = isCustom && position.y < window.innerHeight / 2;
    const isLeftHalf = isCustom && position.x < window.innerWidth / 2;

    const balloonPositionClass = isCustom
        ? `${isTopHalf ? 'top-full mt-3' : 'bottom-full mb-3'} ${isLeftHalf ? 'left-0' : 'right-0'}`
        : 'bottom-full mb-3 right-0';

    const statusColors = {
        verde: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        amarelo: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        vermelho: 'bg-red-500/15 border-red-500/40 text-red-400'
    };

    return (
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
                    className={`absolute z-50 w-[calc(100vw-32px)] max-w-md bg-custom-card text-custom-main rounded-2xl p-5 shadow-2xl border border-custom-color transition-all animate-in fade-in zoom-in-95 duration-200 ${balloonPositionClass}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Cabeçalho do Balão */}
                    <div className="flex items-center justify-between pb-3 border-b border-custom-color/40">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-amber-500/10 dark:bg-amber-900/30 rounded-lg text-amber-500">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold leading-tight">
                                    {isQuizOpen ? '🍬 Quiz de Melhores Amigos: Posso Gastar?' : content.title}
                                </h3>
                                <p className="text-xs text-amber-500 font-semibold">
                                    {isQuizOpen ? 'O FIN conta as balinhas do seu pote na hora!' : 'FIN • Seu Melhor Amigo aqui na Tela'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-gray-400">
                            {position && (
                                <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={resetPosition}
                                    className="p-1 hover:text-custom-gold hover:bg-black/10 rounded transition cursor-pointer"
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
                                className="p-1 hover:text-custom-gold hover:bg-black/10 rounded transition cursor-pointer"
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
                                className="p-1 hover:text-red-400 hover:bg-black/10 rounded transition cursor-pointer"
                                title="Minimizar para o menu lateral (abaixo de Configurações)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo da Mensagem / Quiz / Chatbot */}
                    <div className="mt-3.5 max-h-[58vh] overflow-y-auto pr-1 space-y-3.5 text-sm">
                        {isQuizOpen ? (
                            quizResult ? (
                                <div className="space-y-3">
                                    <div className={`p-3.5 rounded-xl border ${statusColors[quizResult.status] || statusColors.amarelo}`}>
                                        <p className="text-xs font-extrabold uppercase tracking-wide mb-1">
                                            {quizResult.badge}
                                        </p>
                                        <p className="font-bold text-sm text-custom-main leading-snug">
                                            {quizResult.headline}
                                        </p>
                                    </div>

                                    <div className="bg-custom-primary/30 p-3 rounded-xl border border-custom-color space-y-1.5 text-xs">
                                        <p className="font-bold text-amber-500 mb-1">🍬 Contando as Balinhas do seu Pote:</p>
                                        {quizResult.numbersSummary.map((line, i) => (
                                            <p key={i} className="opacity-95 leading-relaxed">{line}</p>
                                        ))}
                                    </div>

                                    <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/25 text-xs leading-relaxed whitespace-pre-line">
                                        {quizResult.kidExplanation}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuizResult(null);
                                                setQuizItem('');
                                                setQuizValor('');
                                            }}
                                            className="flex-1 py-2 px-2.5 bg-custom-gold text-black rounded-lg hover:opacity-90 transition font-bold text-xs cursor-pointer shadow-sm"
                                        >
                                            🔄 Testar Outra Compra
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigate('/orcamento');
                                                hideMascot();
                                            }}
                                            className="flex-1 py-2 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 rounded-lg transition font-bold text-xs cursor-pointer"
                                        >
                                            🏷️ Ir ao Orçamento
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearChat}
                                            className="w-full py-1.5 text-xs opacity-75 hover:opacity-100 transition cursor-pointer text-center"
                                        >
                                            Voltar para a Dica da Tela
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleRunQuiz} className="space-y-3">
                                    <p className="text-xs opacity-90 leading-relaxed">
                                        Psst! Eu vi você pegando a carteira aí fora da tela! 👀 Conta pro seu melhor amigo o que você quer comprar que eu corro lá no seu pote do <strong>Orçamento</strong> pra ver se sobra balinha! 👇
                                    </p>

                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-amber-500">
                                            1. Onde ou com o quê você quer gastar, amigo?
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={quizItem}
                                            onChange={(e) => setQuizItem(e.target.value)}
                                            placeholder="Ex: Balinha, Pizza de sábado, Tênis novo..."
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg text-xs text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-amber-500">
                                                2. Quantas moedas custa?
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                required
                                                value={quizValor}
                                                onChange={(e) => setQuizValor(e.target.value)}
                                                placeholder="Ex: 50.00"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg text-xs text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold mb-1 text-amber-500">
                                                3. Qual Pote de Balas?
                                            </label>
                                            <select
                                                value={quizCategoria}
                                                onChange={(e) => setQuizCategoria(e.target.value)}
                                                disabled={loadingQuizData}
                                                className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg text-xs text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                                        <label className="block text-xs font-bold mb-1.5 text-amber-500">
                                            4. Promessa de dedinho (sem mentir pro FIN!): Isso é...
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setQuizTipoEscolha('necessidade')}
                                                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                                    quizTipoEscolha === 'necessidade'
                                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                        : 'bg-custom-primary/20 border-custom-color opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                🍞 Almoço (Preciso!)
                                                <span className="block text-[10px] font-normal opacity-80">É necessidade real</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setQuizTipoEscolha('desejo')}
                                                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                                    quizTipoEscolha === 'desejo'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                        : 'bg-custom-primary/20 border-custom-color opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                🍭 Balinha (Vontade!)
                                                <span className="block text-[10px] font-normal opacity-80">É um desejo meu</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 px-3 bg-custom-gold text-black rounded-xl hover:opacity-95 transition font-extrabold text-xs cursor-pointer shadow-md"
                                        >
                                            🍬 Ver se Sobra Balinha no Pote!
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearChat}
                                            className="py-2.5 px-3 bg-custom-primary/30 hover:bg-custom-primary/50 border border-custom-color rounded-xl text-xs font-semibold transition cursor-pointer"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : chatbotResponse ? (
                            <div className="space-y-3">
                                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                    <p className="text-xs font-bold text-amber-500 mb-1">Você perguntou:</p>
                                    <p className="italic text-xs opacity-90">"{chatbotResponse.question}"</p>
                                </div>
                                <div className="bg-custom-primary/20 p-3.5 rounded-xl border border-custom-color leading-relaxed text-sm whitespace-pre-line">
                                    {chatbotResponse.answer}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={openQuiz}
                                        className="flex-1 py-2 px-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 rounded-lg transition font-bold text-xs cursor-pointer"
                                    >
                                        🎮 Quiz: Posso Gastar?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearChat}
                                        className="flex-1 py-2 px-2 bg-custom-gold text-black rounded-lg hover:opacity-90 transition font-bold text-xs cursor-pointer shadow-sm"
                                    >
                                        Voltar à Dica da Tela
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="opacity-90 leading-relaxed">
                                    {content.explanation}
                                </p>

                                {content.analogy && (
                                    <div className="bg-amber-500/10 dark:bg-amber-900/15 p-3 rounded-xl border border-amber-500/25">
                                        <p className="text-xs italic opacity-95">
                                            "{content.analogy}"
                                        </p>
                                    </div>
                                )}

                                {content.analysis && (
                                    <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
                                        <p className="font-bold text-emerald-500 text-xs mb-1">
                                            {content.analysis.status}
                                        </p>
                                        <p className="text-xs opacity-90 mb-2 leading-relaxed">
                                            {content.analysis.analogy}
                                        </p>
                                        {content.analysis.explanation && (
                                            <p className="text-xs text-emerald-500 font-bold italic border-t border-emerald-500/20 pt-1.5 mt-1.5">
                                                "{content.analysis.explanation}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {content.tips && content.tips.length > 0 ? (
                                    <div className="space-y-2 bg-custom-primary/20 p-3 rounded-xl border border-custom-color">
                                        {content.tips.map((tipItem, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs opacity-90">
                                                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                                <p>{tipItem}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : content.analysis?.tip ? (
                                    <div className="flex items-start gap-2 text-xs opacity-90 bg-custom-primary/20 p-3 rounded-xl border border-custom-color">
                                        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <p>{content.analysis.tip}</p>
                                    </div>
                                ) : null}

                                {content.cta && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate(content.cta.path);
                                            hideMascot();
                                        }}
                                        className="w-full py-2.5 px-3 bg-custom-gold text-black rounded-xl hover:opacity-95 transition font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                                    >
                                        {content.cta.label}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Atalhos Rápidos do FIN (Quiz + Sabedoria sem citar livros) */}
                    <div className="mt-3 pt-2.5 border-t border-custom-color/40 flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={openQuiz}
                            className="px-3 py-1 text-[11px] font-bold rounded-full bg-custom-gold text-black hover:opacity-90 transition cursor-pointer shadow-sm"
                            title="Brinque no Quiz antes de gastar: diga quanto e onde quer gastar e veja se cabe na sua meta!"
                        >
                            🎮 Quiz: Posso Gastar?
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
                                    setQuizResult(null);
                                    const response = askFinAboutSystem(chip.query);
                                    setChatbotResponse({
                                        question: chip.query,
                                        answer: response
                                    });
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition cursor-pointer"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Caixa de Pergunta ao FIN */}
                    <form onSubmit={handleAskQuestion} className="mt-2.5 flex gap-2">
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            placeholder="Pergunte algo ao FIN..."
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-custom-color rounded-lg text-xs text-custom-main focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <button
                            type="submit"
                            className="px-3 py-2 bg-custom-gold text-black rounded-lg hover:opacity-95 transition font-bold cursor-pointer"
                            title="Enviar pergunta"
                        >
                            <Send className="w-3.5 h-3.5" />
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
    );
};

export default EduMascot;
