import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Trophy,
  Sprout,
  Rocket,
  RotateCcw
} from 'lucide-react';

const STORAGE_LEARNED_PREFIX = 'financas_flashcards_learned_v1_';

const FLASHCARDS_DECK = [
  // ==================== TRILHA 1: DIA A DIA, CARTÃO E SAÍDA DAS DÍVIDAS ====================
  {
    id: 'cartao-divida-futura',
    category: 'dia-a-dia',
    badge: 'CARTÃO DE CRÉDITO • CARTA 1',
    emoji: '💳',
    question: 'Passar uma compra no Cartão de Crédito significa que a conta já está paga?',
    answer:
      'NÃO! Passar no cartão é fazer uma DÍVIDA FUTURA. O dinheiro ainda não saiu da sua conta hoje, mas vai descontar do seu próximo salário quando a fatura chegar!',
    tip: 'Pense sempre: "Eu terei dinheiro no mês que vem para pagar essa fatura?"'
  },
  {
    id: 'minimo-cartao',
    category: 'dia-a-dia',
    badge: 'PERIGO DOS JUROS • CARTA 2',
    emoji: '⛄',
    question: 'O que acontece se eu pagar só o "valor mínimo" da fatura do cartão?',
    answer:
      'Vira uma bola de neve! Os juros do cartão são os mais caros do Brasil. O pedaço da fatura que você deixou de pagar cresce muito rápido no mês seguinte.',
    tip: 'Regra de ouro: Sempre pague o valor total da fatura!'
  },
  {
    id: 'parcelinhas-pequenas',
    category: 'dia-a-dia',
    badge: 'ARMADILHA DAS PARCELAS • CARTA 3',
    emoji: '🛒',
    question: 'Por que fazer várias parcelinhas pequenas de R$ 30 no cartão é perigoso?',
    answer:
      'Porque 10 comprinhas parceladas de R$ 30 viram R$ 300 todo mês na fatura! Sozinhas parecem baratas, mas juntas comem grande parte do seu salário.',
    tip: 'Compre coisas pequenas sempre à vista (PIX, Débito ou Dinheiro).'
  },
  {
    id: 'necessidade-vs-desejo',
    category: 'dia-a-dia',
    badge: 'ESCOLHAS INTELIGENTES • CARTA 4',
    emoji: '🤔',
    question: 'Qual é a diferença entre "Necessidade" e "Desejo" na hora de gastar?',
    answer:
      'NECESSIDADE é o que você precisa para viver (mercado, moradia, luz, saúde). DESEJO é uma vontade do momento (lanche caro, roupa extra, passeio).',
    tip: 'Sempre garanta todas as suas Necessidades antes de gastar com Desejos!'
  },
  {
    id: 'avista-vs-cartao',
    category: 'dia-a-dia',
    badge: 'CONSCIÊNCIA NO BOLSO • CARTA 5',
    emoji: '💵',
    question: 'O que é melhor para não se endividar: pagar à vista (PIX/Dinheiro) ou no cartão?',
    answer:
      'Pagar À VISTA! Quando o dinheiro sai na hora, você sente o valor real da compra, não cria dívida futura e seu próximo salário chega limpinho para você.',
    tip: 'Quem paga à vista também consegue pedir desconto em muitas lojas!'
  },
  {
    id: 'renda-real-disponivel',
    category: 'dia-a-dia',
    badge: 'SEU ORÇAMENTO • CARTA 6',
    emoji: '🎯',
    question: 'O que significa a "Renda Real Disponível" na tela de Orçamento?',
    answer:
      'É o dinheiro que realmente sobra livre para você passar o mês depois de tirar as suas dívidas e acordos do valor do seu salário.',
    tip: 'Nunca planeje seus gastos olhando só para o salário bruto!'
  },
  {
    id: 'como-sair-dividas',
    category: 'dia-a-dia',
    badge: 'SAINDO DO VERMELHO • CARTA 7',
    emoji: '🛟',
    question: 'Qual é o passo a passo mais simples para quem quer sair das dívidas?',
    answer:
      '1º Pare de fazer novas compras no cartão; 2º Anote tudo o que gasta; 3º Pague primeiro as dívidas que têm juros mais altos (como cartão e cheque especial).',
    tip: 'Um passo de cada vez! O controle começa quando você enxerga para onde vai o dinheiro.'
  },
  {
    id: 'reserva-emergencia',
    category: 'dia-a-dia',
    badge: 'PROTEÇÃO DA FAMÍLIA • CARTA 8',
    emoji: '🐷',
    question: 'Para que serve a "Reserva de Emergência"?',
    answer:
      'É um cofrinho de segurança! Serve para imprevistos (remédio, conserto em casa ou perda de renda) para você nunca precisar fazer empréstimo no banco.',
    tip: 'Comece guardando nem que sejam R$ 20 ou R$ 50 todo mês assim que receber!'
  },

  // ==================== TRILHA 2: PRIMEIROS INVESTIMENTOS (SELIC, CDB, POUPANÇA) ====================
  {
    id: 'o-que-e-selic',
    category: 'investimentos',
    badge: 'CONCEITO BÁSICO • CARTA 9',
    emoji: '📈',
    question: 'O que é a famosa "Taxa Selic" que sempre falam no jornal?',
    answer:
      'A Selic é a taxa básica de juros do Brasil! Quando a Selic está alta, o dinheiro que você deixa guardado investido rende mais todo mês (e os empréstimos ficam mais caros).',
    tip: 'Selic alta = ótimo para quem guarda dinheiro e péssimo para quem faz dívida!'
  },
  {
    id: 'poupanca-ou-cdb',
    category: 'investimentos',
    badge: 'ONDE GUARDAR • CARTA 10',
    emoji: '🏆',
    question: 'O que rende mais mantendo seu dinheiro seguro: Poupança ou CDB (100% do CDI)?',
    answer:
      'O CDB rende mais! Ele tem a mesma proteção de segurança da Poupança (garantia do FGC), mas faz o seu dinheiro crescer mais rápido e rende todo dia útil.',
    tip: 'Na Poupança, se você tirar o dinheiro antes de completar 30 dias, você perde todo o rendimento do mês!'
  },
  {
    id: 'liquidez-diaria',
    category: 'investimentos',
    badge: 'DINHEIRO LIVRE • CARTA 11',
    emoji: '⚡',
    question: 'O que significa um investimento com "Liquidez Diária"?',
    answer:
      'Significa que seu dinheiro não fica preso! Se acontecer uma emergência hoje ou amanhã, você pode resgatar o dinheiro para sua conta na mesma hora.',
    tip: 'Para sua Reserva de Emergência, escolha sempre CDB com Liquidez Diária ou Tesouro Selic!'
  },
  {
    id: 'o-que-e-inflacao',
    category: 'investimentos',
    badge: 'PODER DE COMPRA • CARTA 12',
    emoji: '🎈',
    question: 'O que é a "Inflação" e por que ela diminui o valor do nosso dinheiro?',
    answer:
      'Inflação é o aumento dos preços no supermercado ao longo do tempo. Se você guarda dinheiro parado em casa sem render juros, no ano que vem ele compra menos coisas!',
    tip: 'Por isso deixamos a reserva rendendo no banco em vez de parada na conta corrente.'
  },
  {
    id: 'preciso-ser-rico',
    category: 'investimentos',
    badge: 'PRIMEIRO PASSO • CARTA 13',
    emoji: '🌱',
    question: 'Eu preciso ganhar muito dinheiro ou ser rico para começar a investir?',
    answer:
      'De jeito nenhum! Hoje qualquer banco digital permite guardar a partir de R$ 1,00 ou R$ 10,00 em um cofrinho que rende 100% do CDI. O segredo é a constância, não o valor!',
    tip: 'Guardar R$ 30 todo mês vale muito mais do que esperar "sobrar muito" e nunca guardar nada.'
  },
  {
    id: 'investir-ou-pagar-divida',
    category: 'investimentos',
    badge: 'REGRA DE OURO • CARTA 14',
    emoji: '⚖️',
    question: 'Se eu tenho dívida no cartão, devo investir primeiro ou quitar a dívida primeiro?',
    answer:
      'Quitar a dívida primeiro! Enquanto um investimento seguro rende cerca de 1% ao mês, a dívida do cartão cobra mais de 12% ao mês de juros contra você.',
    tip: 'Limpe as dívidas caras primeiro; depois seu dinheiro guardado vai crescer em paz!'
  }
];

const FinFlashcardsModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos'); // 'todos' | 'dia-a-dia' | 'investimentos'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIds, setLearnedIds] = useState([]);

  const storageKey = `${STORAGE_LEARNED_PREFIX}${user?.id || user?.email || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setLearnedIds(parsed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    const handleOpenFlashcards = (event) => {
      const cat = event?.detail?.category || 'todos';
      setSelectedCategory(cat);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsOpen(true);
    };

    window.addEventListener('open-fin-flashcards', handleOpenFlashcards);
    return () => window.removeEventListener('open-fin-flashcards', handleOpenFlashcards);
  }, []);

  const filteredCards = FLASHCARDS_DECK.filter((card) =>
    selectedCategory === 'todos' ? true : card.category === selectedCategory
  );

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 120);
  }, [filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 120);
  }, [filteredCards.length]);

  const toggleLearned = (cardId, e) => {
    e?.stopPropagation();
    setLearnedIds((prev) => {
      const exists = prev.includes(cardId);
      const next = exists ? prev.filter((id) => id !== cardId) : [...prev, cardId];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetProgress = () => {
    setLearnedIds([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Atalhos de teclado (Espaço = virar carta, Setas = navegar, Esc = fechar)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextCard, handlePrevCard]);

  if (!isOpen || !activeCard) return null;

  const isCurrentLearned = learnedIds.includes(activeCard.id);
  const totalDeckCount = FLASHCARDS_DECK.length;
  const learnedCount = learnedIds.length;
  const progressPercent = Math.round((learnedCount / totalDeckCount) * 100);

  return (
    <div
      className="fixed inset-0 z-[135] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOPO DO JOGO DE CARDS */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/fin_coin_boy.png"
              alt="FIN"
              className="w-11 h-11 rounded-full border-2 border-amber-400 bg-white object-cover shrink-0"
            />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                JOGO DE PERGUNTAS E RESPOSTAS DO FIN
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white">
                🃏 Cards de Finanças Pessoais (Clique para Virar!)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer shrink-0"
            title="Fechar jogo de cards (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BARRA DE TRILHAS + PROGRESSO DE CARTAS APRENDIDAS */}
        <div className="px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filtros de Nível/Trilha */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategory('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'todos'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Todas ({FLASHCARDS_DECK.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('dia-a-dia')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'dia-a-dia'
                  ? 'bg-emerald-400 text-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Dia a Dia e Dívidas (8)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('investimentos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'investimentos'
                  ? 'bg-sky-400 text-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>Selic, Poupança e CDB (6)</span>
            </button>
          </div>

          {/* Contador de Progresso */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {learnedCount} de {totalDeckCount} aprendidas ({progressPercent}%)
              </span>
            </div>
            {learnedCount > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Reiniciar progresso das cartas"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ÁREA CENTRAL: O CARD QUE VIRA AO CLICAR */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="w-full max-w-2xl cursor-pointer select-none group"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full min-h-[300px] sm:min-h-[330px] transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* ==================== FRENTE DA CARTA (PERGUNTA) ==================== */}
              <div
                className="absolute inset-0 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-2 border-amber-400/70 shadow-2xl flex flex-col justify-between"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-amber-400 text-black text-xs sm:text-sm font-black uppercase tracking-wider">
                    PERGUNTA • Carta {currentIndex + 1} de {filteredCards.length}
                  </span>
                  {isCurrentLearned && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-extrabold">
                      <CheckCircle2 className="w-4 h-4" /> Já aprendi!
                    </span>
                  )}
                </div>

                <div className="my-auto py-4 text-center space-y-4">
                  <div className="text-4xl sm:text-5xl">{activeCard.emoji}</div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
                    {activeCard.question}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-700/80 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 group-hover:bg-amber-300 text-black font-extrabold text-sm sm:text-base shadow-md transition-all">
                    <RotateCw className="w-5 h-5" />
                    <span>👆 Clique aqui para virar o Card e ver a Resposta!</span>
                  </span>
                </div>
              </div>

              {/* ==================== VERSO DA CARTA (RESPOSTA SIMPLES) ==================== */}
              <div
                className="absolute inset-0 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-400 shadow-2xl flex flex-col justify-between"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-400 text-black text-xs sm:text-sm font-black uppercase tracking-wider">
                    💡 RESPOSTA DO PROFESSOR FIN
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300 font-bold">
                    Clique no card para voltar à pergunta
                  </span>
                </div>

                <div className="my-auto py-3 space-y-4">
                  <p className="text-lg sm:text-2xl font-extrabold text-white leading-relaxed">
                    {activeCard.answer}
                  </p>

                  {activeCard.tip && (
                    <div className="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/50 text-amber-200 text-sm sm:text-lg font-semibold leading-relaxed">
                      ✨ <strong>Dica de Ouro:</strong> {activeCard.tip}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={(e) => toggleLearned(activeCard.id, e)}
                    className={`px-5 py-2.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-2 transition cursor-pointer shadow-md ${
                      isCurrentLearned
                        ? 'bg-emerald-400 text-black'
                        : 'bg-slate-800 hover:bg-emerald-400 hover:text-black text-white border border-emerald-400/50'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isCurrentLearned ? 'Lição Aprendida! ✅' : 'Marcar como Aprendi! ✅'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCard();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm sm:text-base flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <span>Próxima Carta</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ DE NAVEGAÇÃO ENTRE OS CARDS */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevCard}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Carta Anterior</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped((prev) => !prev)}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm sm:text-base flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <RotateCw className="w-5 h-5" />
            <span>{isFlipped ? 'Ver Pergunta' : 'Virar Carta'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextCard}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Próxima Carta</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinFlashcardsModal;
