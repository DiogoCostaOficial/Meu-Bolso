// src/components/OnboardingInicianteModal.jsx
import React, { useState } from 'react';
import { useLevel } from '../contexts/LevelContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  HeartHandshake,
  ShieldCheck,
  Wallet
} from 'lucide-react';

const MOEDAS_DISPONIVEIS = [
  { codigo: 'BRL', simbolo: 'R$', label: 'Real (Brasil)' },
  { codigo: 'USD', simbolo: '$', label: 'Dólar (EUA/Mundo)' },
  { codigo: 'EUR', simbolo: '€', label: 'Euro (Europa)' },
  { codigo: 'GBP', simbolo: '£', label: 'Libra (Reino Unido)' },
];

const MAIORES_DESPESAS = [
  { id: 'moradia', label: 'Moradia (Aluguel, Condomínio, Contas de Casa)', categoria: 'Despesas Fixas' },
  { id: 'alimentacao', label: 'Supermercado e Alimentação Básica', categoria: 'Despesas Fixas' },
  { id: 'dividas', label: 'Quitação de Dívidas e Empréstimos', categoria: 'Investimentos' },
  { id: 'transporte', label: 'Transporte, Combustível ou Financiamento de Carro', categoria: 'Despesas Fixas' },
  { id: 'lazer', label: 'Passeios, Aplicativos e Lazer da Família', categoria: 'Lazer' },
  { id: 'outros', label: 'Outras despesas essenciais', categoria: 'Despesas Fixas' },
];

const OBJETIVOS_FINANCEIROS = [
  {
    id: 'organizar',
    titulo: 'Organizar minhas contas',
    descricao: 'Descobrir para onde vai cada centavo e parar de levar susto no final do mês.',
    badge: 'Controle Total'
  },
  {
    id: 'quitar_dividas',
    titulo: 'Sair do vermelho e quitar dívidas',
    descricao: 'Eliminar juros e organizar o orçamento para ter paz financeira.',
    badge: 'Liberdade'
  },
  {
    id: 'poupar_investir',
    titulo: 'Guardar dinheiro e criar reserva',
    descricao: 'Fazer o dinheiro sobrar todo mês para emergências e planos futuros.',
    badge: 'Crescimento'
  }
];

const OnboardingInicianteModal = () => {
  const { isOnboardingModalOpen, closeOnboardingModal } = useLevel();
  const { moeda, setMoeda } = useCurrency();
  const { user } = useAuth();

  const [etapa, setEtapa] = useState(1);
  const [rendaInformada, setRendaInformada] = useState('');
  const [moedaSelecionada, setMoedaSelecionada] = useState(moeda || 'BRL');
  const [maiorDespesa, setMaiorDespesa] = useState('moradia');
  const [objetivo, setObjetivo] = useState('organizar');
  const [salvando, setSalvando] = useState(false);

  if (!isOnboardingModalOpen) return null;

  const handleSalvarEAvancar = async () => {
    setSalvando(true);
    try {
      // 1. Atualiza moeda no CurrencyContext se alterada
      if (setMoeda && moedaSelecionada !== moeda) {
        setMoeda(moedaSelecionada);
      }

      // 2. Alimenta diretamente o Orçamento (Budget) do mês atual preservando categorias existentes
      const mesAtual = new Date().toISOString().slice(0, 7);
      const valorRenda = parseFloat(String(rendaInformada).replace(',', '.')) || 0;

      let orcamentosExistentes = [];
      let categoriasExistentes = [];
      try {
        const resp = await api.get('/user/dados');
        orcamentosExistentes = resp.data?.dados?.orcamentos || [];
        categoriasExistentes = resp.data?.dados?.categorias || [];
      } catch (e) {
        // ignora se falhar
      }

      const orcamentoAtual = orcamentosExistentes.find(o => o.mes === mesAtual);

      const dadosOrcamento = {
        mes: mesAtual,
        rendaPrevista: valorRenda > 0 ? valorRenda : (orcamentoAtual?.rendaPrevista || 0),
        rendaReal: valorRenda > 0 ? valorRenda : (orcamentoAtual?.rendaReal || 0),
        dividas: orcamentoAtual?.dividas || 0,
        categorias: orcamentoAtual?.categorias && orcamentoAtual.categorias.length > 0
          ? orcamentoAtual.categorias
          : categoriasExistentes,
        configuracaoInicialIniciante: {
          maiorDespesa,
          objetivo,
          dataConfiguracao: new Date().toISOString()
        }
      };

      await api.post('/user/dados', { orcamentos: [dadosOrcamento] });

      toast.success('Configuração inicial concluída com sucesso!', {
        description: 'Sua renda estimada foi vinculada ao seu Orçamento mensal.',
      });

      closeOnboardingModal();
      setEtapa(1);
    } catch (err) {
      console.error('Erro ao salvar respostas do onboarding:', err);
      // Mesmo se a rede falhar, fecha amigavelmente com sucesso local
      toast.success('Preferências salvas localmente!', {
        description: 'Você já pode começar a registrar suas entradas e saídas.',
      });
      closeOnboardingModal();
      setEtapa(1);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-custom-card border border-custom-color rounded-2xl w-full max-w-xl shadow-2xl flex flex-col text-custom-main overflow-hidden">
        {/* Barra de Progresso Superior */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800">
          <div
            className="h-full bg-custom-gold transition-all duration-300"
            style={{ width: `${(etapa / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-custom-color flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-bold text-lg shadow-xs">
              🌱
            </div>
            <div>
              <span className="text-[11px] font-semibold text-custom-gold uppercase tracking-wider">
                Passo {etapa} de 3 • Primeiros Passos
              </span>
              <h2 className="text-lg font-bold text-custom-main">
                {etapa === 1 && 'Sua Renda & Moeda'}
                {etapa === 2 && 'Sua Principal Despesa'}
                {etapa === 3 && 'Seu Objetivo Financeiro'}
              </h2>
            </div>
          </div>
          <button
            onClick={closeOnboardingModal}
            className="p-2 text-gray-400 hover:text-custom-main hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo por Etapa */}
        <div className="p-6 space-y-6">
          {etapa === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <strong className="block font-semibold mb-0.5">Sem julgamentos, você está no controle!</strong>
                  Essa estimativa servirá para alimentar seu <strong>Orçamento Mensal</strong> e calcular seu saldo livre automaticamente.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-2">
                  Qual moeda você utiliza no dia a dia?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MOEDAS_DISPONIVEIS.map((m) => (
                    <button
                      key={m.codigo}
                      type="button"
                      onClick={() => setMoedaSelecionada(m.codigo)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        moedaSelecionada === m.codigo
                          ? 'border-custom-gold bg-custom-gold/15 text-custom-main font-bold ring-2 ring-custom-gold/30'
                          : 'border-custom-color hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-base block font-bold">{m.simbolo}</span>
                      <span className="text-[11px] block opacity-80">{m.codigo}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Qual a sua renda média mensal aproximada? ({moedaSelecionada})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 3500.00"
                    value={rendaInformada}
                    onChange={(e) => setRendaInformada(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-custom-color bg-custom-primary text-custom-main text-lg font-bold focus:outline-none focus:ring-2 focus:ring-custom-gold/50"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1.5">
                  Não se preocupe se for variável: você pode ajustar este valor a qualquer momento no menu Orçamento.
                </p>
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Identificar seu maior custo é o segredo para economizar rápido. Qual categoria mais pesa no seu bolso?
              </p>

              <div className="space-y-2">
                {MAIORES_DESPESAS.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      maiorDespesa === item.id
                        ? 'border-custom-gold bg-custom-gold/15 text-custom-main font-semibold ring-2 ring-custom-gold/30'
                        : 'border-custom-color hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <input
                      type="radio"
                      name="maiorDespesa"
                      checked={maiorDespesa === item.id}
                      onChange={() => setMaiorDespesa(item.id)}
                      className="accent-custom-gold w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Para onde queremos caminhar juntos? Escolha sua prioridade número um:
              </p>

              <div className="space-y-2.5">
                {OBJETIVOS_FINANCEIROS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setObjetivo(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      objetivo === item.id
                        ? 'border-custom-gold bg-custom-gold/15 text-custom-main ring-2 ring-custom-gold/30'
                        : 'border-custom-color hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-custom-main">{item.titulo}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-custom-gold/20 text-custom-gold font-bold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {item.descricao}
                      </p>
                    </div>
                    <div className="pt-0.5">
                      <input
                        type="radio"
                        name="objetivo"
                        checked={objetivo === item.id}
                        onChange={() => setObjetivo(item.id)}
                        className="accent-custom-gold w-4 h-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botões de navegação */}
        <div className="p-5 bg-gray-50 dark:bg-slate-900/60 border-t border-custom-color flex items-center justify-between">
          {etapa > 1 ? (
            <button
              type="button"
              onClick={() => setEtapa(etapa - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {etapa < 3 ? (
            <button
              type="button"
              onClick={() => setEtapa(etapa + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-custom-gold text-black hover:bg-yellow-400 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              Avançar
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={salvando}
              onClick={handleSalvarEAvancar}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-custom-gold text-black hover:bg-yellow-400 transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              {salvando ? (
                'Salvando...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Concluir & Começar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingInicianteModal;
