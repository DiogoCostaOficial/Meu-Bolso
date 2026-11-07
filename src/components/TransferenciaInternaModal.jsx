import React, { useState } from 'react';
import { ArrowLeftRight, ShieldCheck, Wallet, PiggyBank, Plus, Trash2, X, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrency } from '../contexts/CurrencyContext';

const CONTAS_PADRAO = [
  'Conta Corrente (Capital de Giro)',
  'Reserva de Emergência (Blindada)',
  'Caixinha / CDB Liquidez Diária',
  'Carteira / Dinheiro Vivo'
];

const TransferenciaInternaModal = ({
  isOpen,
  onClose,
  transferencias = [],
  onSaveTransferencias,
  lancamentosDuplicadosDetectados = [],
  onLimparDuplicados
}) => {
  const { formatCurrency } = useCurrency();
  const [modoRapido, setModoRapido] = useState('guardar'); // 'guardar' | 'resgatar' | 'custom'
  const [form, setForm] = useState({
    descricao: 'Guardar para Reserva / Capital de Giro',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    origem: 'Conta Corrente (Capital de Giro)',
    destino: 'Reserva de Emergência (Blindada)',
    observacao: ''
  });
  const [salvando, setSalvando] = useState(false);

  if (!isOpen) return null;

  const selecionarModo = (modo) => {
    setModoRapido(modo);
    if (modo === 'guardar') {
      setForm(prev => ({
        ...prev,
        origem: 'Conta Corrente (Capital de Giro)',
        destino: 'Reserva de Emergência (Blindada)',
        descricao: prev.descricao === 'Resgate para Conta Corrente' ? 'Aporte para Reserva / Caixinha' : prev.descricao
      }));
    } else if (modo === 'resgatar') {
      setForm(prev => ({
        ...prev,
        origem: 'Reserva de Emergência (Blindada)',
        destino: 'Conta Corrente (Capital de Giro)',
        descricao: 'Resgate para Conta Corrente'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valorNum = parseFloat(form.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('Informe um valor válido maior que zero.');
      return;
    }
    if (form.origem === form.destino) {
      toast.error('A conta de origem e a conta de destino devem ser diferentes.');
      return;
    }

    const novaTransf = {
      id: `transf-${Date.now()}`,
      descricao: form.descricao.trim() || 'Transferência entre Contas',
      valor: valorNum,
      data: form.data || new Date().toISOString().split('T')[0],
      origem: form.origem,
      destino: form.destino,
      observacao: form.observacao || ''
    };

    try {
      setSalvando(true);
      const novaLista = [novaTransf, ...(Array.isArray(transferencias) ? transferencias : [])];
      await onSaveTransferencias(novaLista);
      toast.success('Transferência interna registrada sem inflar Receitas ou Despesas!');
      setForm(prev => ({ ...prev, valor: '', observacao: '' }));
    } catch (err) {
      toast.error('Erro ao salvar transferência interna.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id) => {
    if (!window.confirm('Deseja remover este registro de transferência interna?')) return;
    try {
      setSalvando(true);
      const novaLista = (transferencias || []).filter(t => t.id !== id);
      await onSaveTransferencias(novaLista);
      toast.success('Transferência removida.');
    } catch (err) {
      toast.error('Erro ao remover transferência.');
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (dStr) => {
    if (!dStr) return '';
    const partes = String(dStr).split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dStr;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-slate-800 p-6 space-y-5 my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-custom-gold/15 text-custom-gold border border-custom-gold/30">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-custom-main">
                Transferência Interna entre Contas & Reserva
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Movimente seu dinheiro entre Conta Corrente e Reserva <strong>sem gerar falsas Receitas ou Despesas</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicação para Leigos */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 dark:text-slate-300 space-y-1 leading-relaxed">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              Regra de Ouro da Consultoria Financeira:
            </p>
            <p>
              Quando você guarda parte do salário na Caixinha/Reserva ou traz de volta para a Conta Corrente para pagar contas do dia 05, <strong>isso não é um ganho novo nem um gasto perdido</strong> — é apenas o seu próprio dinheiro mudando de bolso.
            </p>
          </div>
        </div>

        {/* Alerta de Higienização Automática caso haja lançamentos duplicados */}
        {lancamentosDuplicadosDetectados.length > 0 && onLimparDuplicados && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Diagnóstico Contábil: {lancamentosDuplicadosDetectados.length} Lançamento(s) de Caixa/Reserva nas Receitas
                </span>
              </div>
              <button
                type="button"
                onClick={onLimparDuplicados}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Converter & Limpar Duplicidades Agora
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-300">
              Identificamos lançamentos como <em>"Reserva Mês Anterior"</em> ou <em>"Retirada Reserva"</em> cadastrados como Receita. Clicando acima, o sistema remove a duplicidade do faturamento para que seus relatórios mostrem apenas o seu salário real.
            </p>
          </div>
        )}

        {/* Botões Rápidos de Direção */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => selecionarModo('guardar')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              modoRapido === 'guardar'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <PiggyBank className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold">Guardar na Reserva</div>
              <div className="text-[10px] opacity-75">Conta ➔ Reserva / Caixinha</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => selecionarModo('resgatar')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              modoRapido === 'resgatar'
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Wallet className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold">Trazer para o Giro</div>
              <div className="text-[10px] opacity-75">Reserva ➔ Conta Corrente</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => selecionarModo('custom')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              modoRapido === 'custom'
                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold'
                : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold">Personalizado</div>
              <div className="text-[10px] opacity-75">Escolher qualquer pote</div>
            </div>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
                De (Onde sai o dinheiro)
              </label>
              <select
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                {CONTAS_PADRAO.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
                Para (Onde entra o dinheiro)
              </label>
              <select
                value={form.destino}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                {CONTAS_PADRAO.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
                Valor Movimentado (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 500.00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
                Data da Movimentação *
              </label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1">
              Identificação / Motivo
            </label>
            <input
              type="text"
              placeholder="Ex: Sobra do adiantamento dia 20 guardada para contas do dia 05"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 bg-custom-gold text-black font-bold rounded-xl hover:opacity-90 transition text-sm flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {salvando ? 'Registrando...' : 'Registrar Transferência Neutra'}
            </button>
          </div>
        </form>

        {/* Histórico Recente de Transferências Internas */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Histórico de Transferências Internas ({transferencias.length})
          </h4>
          {transferencias.length > 0 ? (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {transferencias.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-custom-main flex items-center gap-1.5">
                      <span>{t.descricao}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold">
                        Neutra (Não altera Receita/Despesa)
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-slate-400">
                      {formatarData(t.data)} • <strong>{t.origem}</strong> ➔ <strong>{t.destino}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-custom-gold">
                      {formatCurrency(parseFloat(t.valor) || 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemover(t.id)}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Excluir transferência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-slate-500 py-3 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
              Nenhuma transferência interna registrada ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferenciaInternaModal;
