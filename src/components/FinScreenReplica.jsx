import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plane,
  PieChart as PieChartIcon,
  Settings,
  RotateCcw,
  RefreshCw,
  Copy,
  Save,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Layers,
  FileSpreadsheet,
  Sliders,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  AlertCircle,
  Search,
  Trash2,
  Edit2,
  FileText,
  MousePointer
} from 'lucide-react';

/**
 * RÉPLICA FIEL 1:1 IDÊNTICA ÀS TELAS REAIS DO SISTEMA MEU BOLSO
 * Reproduz exatamente o mesmo cartão branco, rótulos, placeholders,
 * grade de 2 colunas, ícones, caixas de seleção e botões que o usuário vê no sistema real.
 */
const FinScreenReplica = ({
  videoId,
  sceneIndex,
  currentScene,
  typedCharsCount
}) => {
  const cursorX = currentScene?.cursorPos?.x ?? 50;
  const cursorY = currentScene?.cursorPos?.y ?? 50;
  const activeFieldId = currentScene?.activeFieldId || '';
  const viewMode = currentScene?.viewMode || 'form'; // 'form' | 'list'

  const getTypedOrFinal = (targetStepIndex, fullValue, emptyFallback = '') => {
    if (sceneIndex > targetStepIndex) return fullValue;
    if (sceneIndex === targetStepIndex) {
      return String(fullValue).slice(0, Math.max(1, typedCharsCount));
    }
    return emptyFallback;
  };

  const isFieldHighlighted = (fieldKey) => activeFieldId === fieldKey;

  const fieldRingClass = (fieldKey) =>
    isFieldHighlighted(fieldKey)
      ? 'ring-3 ring-amber-400 border-amber-500 bg-amber-50/70 shadow-md transition-all duration-300'
      : 'border-gray-300 bg-white';

  // ============================================================================
  // 1A. DESPESAS - PARTE 1: CÓPIA EXATA DO PRINT "Adicionar Nova Despesa" (11 CAMPOS)
  // ============================================================================
  const renderDespesasFormExactCopy = () => {
    const descVal =
      sceneIndex === 1
        ? getTypedOrFinal(1, 'Supermercado da Semana', '')
        : sceneIndex > 1
        ? 'Supermercado da Semana'
        : '';

    const valorVal =
      sceneIndex === 1
        ? getTypedOrFinal(1, '420.00', '')
        : sceneIndex > 1
        ? '420.00'
        : '';

    const dataDespesaVal = '28/10/2026';
    const dataVencVal = sceneIndex >= 2 ? '05/11/2026' : 'dd/mm/aaaa';
    const dataCompraVal = sceneIndex >= 3 ? '28/10/2026' : 'dd/mm/aaaa';
    const categoriaVal = 'Despesas Fixas';
    const subcategoriaVal = sceneIndex >= 4 ? 'Mercado' : 'Moradia';
    const statusVal = sceneIndex >= 4 ? 'Pago' : 'Pendente';
    const cartaoVal =
      sceneIndex >= 5 ? 'Nubank Platinum' : 'Nenhum (Não vinculado)';
    const obsVal =
      sceneIndex === 5
        ? getTypedOrFinal(5, 'Compra mensal da família no supermercado', '')
        : sceneIndex > 5
        ? 'Compra mensal da família no supermercado'
        : '';
    const isParceladoChecked = sceneIndex === 6;

    return (
      <div className="space-y-3 text-gray-800">
        {/* Cabeçalho da Página Despesas */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Despesas</h2>
            <p className="text-[11px] text-gray-500">
              Gerencie seus gastos e mantenha sua saúde financeira em dia.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium flex items-center gap-1">
              <Download className="w-3 h-3 text-emerald-600" /> Exportar
            </span>
            <span
              className={`px-3.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-medium flex items-center gap-1 shadow-xs ${
                isFieldHighlighted('btn_nova_despesa')
                  ? 'ring-4 ring-amber-400 scale-105'
                  : ''
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Nova Despesa
            </span>
          </div>
        </div>

        {/* CARTÃO BRANCO IDÊNTICO AO SEGUNDO PRINT ENVIADO PELO USUÁRIO */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-md border border-gray-200 space-y-3">
          {/* Título Adicionar Nova Despesa + Seta ^ */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span>Adicionar Nova Despesa</span>
            </h3>
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </div>

          {/* Grade Exata de 2 Colunas (Idêntica ao Print 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
            {/* Linha 1 - Col 1: Descrição */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-700 min-h-[30px] flex items-center ${fieldRingClass(
                  'descricao'
                )}`}
              >
                {descVal ? (
                  <span className="font-medium text-gray-900">{descVal}</span>
                ) : (
                  <span className="text-gray-400">
                    Ex: Aluguel, Conta de Luz, Supermercado
                  </span>
                )}
              </div>
            </div>

            {/* Linha 1 - Col 2: Valor */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Valor
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-700 min-h-[30px] flex items-center gap-1.5 ${fieldRingClass(
                  'valor'
                )}`}
              >
                <span className="text-gray-500">R$</span>
                {valorVal ? (
                  <span className="font-medium text-gray-900">{valorVal}</span>
                ) : (
                  <span className="text-gray-400">0.00</span>
                )}
              </div>
            </div>

            {/* Linha 2 - Col 1: Data da Despesa */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Data da Despesa
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-700 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'data_despesa'
                )}`}
              >
                <span>{dataDespesaVal}</span>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* Linha 2 - Col 2: Data de Vencimento (opcional) */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Data de Vencimento (opcional)
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-700 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'data_despesa'
                )}`}
              >
                <span className={sceneIndex >= 2 ? 'text-gray-800' : 'text-gray-500'}>
                  {dataVencVal}
                </span>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* Linha 3 - Col 1: Data da Compra (opcional) */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Data da Compra (opcional)
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-700 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'data_compra_cat'
                )}`}
              >
                <span className={sceneIndex >= 3 ? 'text-gray-800' : 'text-gray-500'}>
                  {dataCompraVal}
                </span>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* Linha 3 - Col 2: Categoria */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-800 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'data_compra_cat'
                )}`}
              >
                <span>{categoriaVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>

            {/* Linha 4 - Col 1: Subcategoria */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Subcategoria
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-800 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'subcat_status'
                )}`}
              >
                <span>{subcategoriaVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>

            {/* Linha 4 - Col 2: Status de Pagamento */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Status de Pagamento
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-800 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'subcat_status'
                )}`}
              >
                <span>{statusVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>

            {/* Linha 5 - Col 1: Cartão (opcional) */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>Cartão (opcional)</span>
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border text-gray-800 min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'cartao_obs'
                )}`}
              >
                <span>{cartaoVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Linha 6 (Largura Total): Observações (opcional) */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <div
              className={`w-full py-2 px-2.5 rounded-lg border text-gray-700 min-h-[42px] text-[11px] ${fieldRingClass(
                'cartao_obs'
              )}`}
            >
              {obsVal ? (
                <span className="text-gray-800">{obsVal}</span>
              ) : (
                <span className="text-gray-400">
                  Adicione detalhes ou notas importantes sobre a despesa...
                </span>
              )}
            </div>
          </div>

          {/* Linha 7: Parcelar despesa + Número de Parcelas */}
          <div
            className={`p-1.5 rounded-lg transition-all ${
              isFieldHighlighted('parcelado')
                ? 'ring-3 ring-amber-400 bg-amber-50'
                : ''
            }`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={isParceladoChecked}
                  readOnly
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span>Parcelar despesa</span>
              </label>

              {isParceladoChecked && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-[10px] text-blue-900 font-semibold">
                  <span>Número de Parcelas: <strong>3x</strong></span>
                  <span>•</span>
                  <span>Valor de cada parcela: <strong>R$ 140,00</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Linha 8: Somar ao Orçamento e Relatórios */}
          <div
            className={`p-1 rounded-lg transition-all ${
              isFieldHighlighted('somar_salvar')
                ? 'ring-2 ring-amber-400 bg-amber-50'
                : ''
            }`}
          >
            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
              <input
                type="checkbox"
                checked
                readOnly
                className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600"
              />
              <span>Somar ao Orçamento e Relatórios</span>
            </label>
          </div>

          {/* Linha 9: Botões Cancelar e Adicionar Despesa à Direita (Idêntico ao Print 2) */}
          <div className="flex justify-end items-center gap-2.5 pt-1">
            <span className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-xs bg-white">
              Cancelar
            </span>
            <span
              className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm transition-all ${
                isFieldHighlighted('somar_salvar')
                  ? 'bg-green-600 ring-4 ring-amber-400 scale-105'
                  : 'bg-green-600'
              }`}
            >
              Adicionar Despesa
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 1B. DESPESAS - PARTE 2: FILTROS, 3 CARTÕES DE RESUMO, LISTA E EDIÇÃO EM MASSA
  // ============================================================================
  const renderDespesasListExactCopy = () => {
    return (
      <div className="space-y-3 text-gray-800 text-[11px]">
        {/* Card Filtros Exato de Despesas.jsx */}
        <div
          className={`bg-white p-3.5 rounded-2xl shadow-sm border transition-all ${
            isFieldHighlighted('filtros_despesas')
              ? 'ring-3 ring-amber-400 border-amber-500'
              : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-500" /> Filtros
            </h4>
            <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
              Limpar Filtros
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-1.5 rounded border border-gray-300 bg-white">
              <span className="text-gray-500 block text-[9px]">🏷️ Categoria</span>
              <span className="font-semibold text-gray-800">Todas as categorias</span>
            </div>
            <div className="p-1.5 rounded border border-gray-300 bg-white">
              <span className="text-gray-500 block text-[9px]">📚 Subcategoria</span>
              <span className="font-semibold text-gray-800">Todas as subcategorias</span>
            </div>
            <div className="p-1.5 rounded border border-gray-300 bg-white">
              <span className="text-gray-500 block text-[9px]">📅 Mês / Ano</span>
              <span className="font-semibold text-gray-800">Outubro / 2026</span>
            </div>
            <div className="p-1.5 rounded border border-gray-300 bg-white">
              <span className="text-gray-500 block text-[9px]">🔍 Descrição / Status</span>
              <span className="font-semibold text-gray-800">Todos os Status</span>
            </div>
          </div>
        </div>

        {/* 3 Cartões de Resumo Exatos de Despesas.jsx */}
        <div
          className={`grid grid-cols-3 gap-2.5 p-1 rounded-xl ${
            isFieldHighlighted('cards_despesas') ? 'ring-3 ring-amber-400 bg-amber-50/40' : ''
          }`}
        >
          <div className="bg-red-50 rounded-xl p-2.5 border border-red-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-600 font-medium">Total de Despesas</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm font-bold text-red-600 mt-0.5">R$ 1.620,00</p>
            <p className="text-[9px] text-gray-500">2 despesa(s)</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-600 font-medium">Categorias</span>
              <Tag className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-blue-600 mt-0.5">2</p>
            <p className="text-[9px] text-gray-500">categorias ativas</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-600 font-medium">Subcategorias</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-bold text-amber-600 mt-0.5">2</p>
            <p className="text-[9px] text-gray-500">subcategorias ativas</p>
          </div>
        </div>

        {/* Barra de Edição em Massa quando selecionada */}
        {isFieldHighlighted('bulk_despesas') && (
          <div className="p-2.5 bg-orange-50 border-2 border-amber-400 rounded-xl flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-orange-900 text-[10px] flex items-center gap-1">
              <Edit2 className="w-3.5 h-3.5 text-orange-600" /> Editar Despesas Selecionadas (2)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 bg-green-600 text-white rounded font-bold text-[10px]">
                ✓ Marcar Selecionados como Pago
              </span>
              <span className="px-2.5 py-1 bg-red-600 text-white rounded font-bold text-[10px]">
                🗑️ Excluir Selecionados
              </span>
            </div>
          </div>
        )}

        {/* Tabela Lista de Despesas Exata */}
        <div
          className={`bg-white p-3 rounded-2xl shadow-sm border ${
            isFieldHighlighted('tabela_despesas') || isFieldHighlighted('bulk_despesas')
              ? 'ring-3 ring-amber-400 border-amber-500'
              : 'border-gray-200'
          }`}
        >
          <h4 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-500" /> Lista de Despesas
          </h4>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                <th className="py-1.5 px-2">
                  <input
                    type="checkbox"
                    checked={isFieldHighlighted('bulk_despesas')}
                    readOnly
                  />
                </th>
                <th className="py-1.5 px-2">Data</th>
                <th className="py-1.5 px-2">Descrição</th>
                <th className="py-1.5 px-2">Categoria</th>
                <th className="py-1.5 px-2">Subcategoria</th>
                <th className="py-1.5 px-2 text-right">Valor</th>
                <th className="py-1.5 px-2 text-center">Status</th>
                <th className="py-1.5 px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1.5 px-2">
                  <input
                    type="checkbox"
                    checked={isFieldHighlighted('bulk_despesas')}
                    readOnly
                  />
                </td>
                <td className="py-1.5 px-2">28/10/2026</td>
                <td className="py-1.5 px-2 font-semibold text-gray-900">Supermercado da Semana</td>
                <td className="py-1.5 px-2">Despesas Fixas</td>
                <td className="py-1.5 px-2">Mercado</td>
                <td className="py-1.5 px-2 text-right font-bold text-red-600">R$ 420,00</td>
                <td className="py-1.5 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-bold text-[9px]">
                    Pago
                  </span>
                </td>
                <td className="py-1.5 px-2 text-center text-gray-500">✏️ 🗑️</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2">
                  <input
                    type="checkbox"
                    checked={isFieldHighlighted('bulk_despesas')}
                    readOnly
                  />
                </td>
                <td className="py-1.5 px-2">10/10/2026</td>
                <td className="py-1.5 px-2 font-semibold text-gray-900">Aluguel Mensal</td>
                <td className="py-1.5 px-2">Despesas Fixas</td>
                <td className="py-1.5 px-2">Moradia</td>
                <td className="py-1.5 px-2 text-right font-bold text-red-600">R$ 1.200,00</td>
                <td className="py-1.5 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px]">
                    Pendente
                  </span>
                </td>
                <td className="py-1.5 px-2 text-center text-gray-500">✏️ 🗑️</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 2A. RECEITAS - PARTE 1: CÓPIA EXATA DO FORMULÁRIO "Nova Receita" (Receitas.jsx)
  // ============================================================================
  const renderReceitasFormExactCopy = () => {
    const descVal =
      sceneIndex === 0
        ? getTypedOrFinal(0, 'Salário Mensal Empresa', '')
        : sceneIndex > 0
        ? 'Salário Mensal Empresa'
        : '';
    const qtdTitulos = sceneIndex >= 1 ? '1' : '1';
    const valorVal =
      sceneIndex === 2
        ? getTypedOrFinal(2, '8000.00', '')
        : sceneIndex > 2
        ? '8000.00'
        : '';
    const dataVal = '05/10/2026';
    const catVal = sceneIndex >= 3 ? 'Receita Principal' : 'Selecione uma categoria';
    const subcatVal = sceneIndex >= 3 ? 'Salário Principal' : 'Selecione uma subcategoria (opcional)';
    const obsVal =
      sceneIndex === 4
        ? getTypedOrFinal(4, 'Pagamento mensal depositado em conta corrente', '')
        : sceneIndex > 4
        ? 'Pagamento mensal depositado em conta corrente'
        : '';

    return (
      <div className="space-y-3 text-gray-800">
        {/* Cabeçalho Exato de Receitas.jsx */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Receitas</h2>
            <p className="text-[11px] text-gray-500">
              Gerencie suas entradas e acompanhe sua evolução financeira.
            </p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full bg-green-600 text-white text-[11px] font-medium flex items-center gap-1 shadow-xs ${
              isFieldHighlighted('rec_desc') ? 'ring-3 ring-amber-400' : ''
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Nova Receita
          </span>
        </div>

        {/* Cartão Branco Fiel ao Receitas.jsx */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-md border border-gray-200 space-y-3 text-[11px]">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>Nova Receita</span>
          </h3>

          {/* Grade de 2 Colunas Exata de Receitas.jsx */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Linha 1 - Col 1: Descrição * */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <FileText className="inline w-3.5 h-3.5 mr-1" /> Descrição *
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center ${fieldRingClass(
                  'rec_desc'
                )}`}
              >
                {descVal ? (
                  <span className="font-medium text-gray-900">{descVal}</span>
                ) : (
                  <span className="text-gray-400">Ex: Salário, Venda, Freelance...</span>
                )}
              </div>
            </div>

            {/* Linha 1 - Col 2: Quantidade de Títulos * */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Calendar className="inline w-3.5 h-3.5 mr-1" /> Quantidade de Títulos *
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'rec_qtd'
                )}`}
              >
                <span className="font-semibold text-gray-900">{qtdTitulos}</span>
                <span className="text-[9px] text-gray-400">Ex: 6 (para 6 meses)</span>
              </div>
              <p className="text-[9px] text-gray-500 mt-0.5">
                Serão criados {qtdTitulos} título(s) com datas mensais consecutivas
              </p>
            </div>

            {/* Linha 2 - Col 1: Valor * */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <DollarSign className="inline w-3.5 h-3.5 mr-1" /> Valor *
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center ${fieldRingClass(
                  'rec_valor_data'
                )}`}
              >
                {valorVal ? (
                  <span className="font-semibold text-gray-900">{valorVal}</span>
                ) : (
                  <span className="text-gray-400">0.00</span>
                )}
              </div>
            </div>

            {/* Linha 2 - Col 2: Data * */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Calendar className="inline w-3.5 h-3.5 mr-1" /> Data *
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'rec_valor_data'
                )}`}
              >
                <span className="text-gray-800">{dataVal}</span>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* Linha 3 - Col 1: Categoria * */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Tag className="inline w-3.5 h-3.5 mr-1" /> Categoria *
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'rec_cat_sub'
                )}`}
              >
                <span className="text-gray-800">{catVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>

            {/* Linha 3 - Col 2: Subcategoria */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <Tag className="inline w-3.5 h-3.5 mr-1" /> Subcategoria
              </label>
              <div
                className={`w-full py-1.5 px-2.5 rounded-lg border min-h-[30px] flex items-center justify-between ${fieldRingClass(
                  'rec_cat_sub'
                )}`}
              >
                <span className="text-gray-800">{subcatVal}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Observações (Opcional) */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Observações (Opcional)
            </label>
            <div
              className={`w-full py-2 px-2.5 rounded-lg border min-h-[38px] ${fieldRingClass(
                'rec_obs'
              )}`}
            >
              {obsVal ? (
                <span className="text-gray-800">{obsVal}</span>
              ) : (
                <span className="text-gray-400">
                  Adicione detalhes adicionais sobre a receita...
                </span>
              )}
            </div>
          </div>

          {/* Checkboxes Empilhados Exatos de Receitas.jsx */}
          <div
            className={`space-y-1.5 p-1.5 rounded-lg ${
              isFieldHighlighted('rec_checks_salvar')
                ? 'ring-2 ring-amber-400 bg-amber-50'
                : ''
            }`}
          >
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={sceneIndex >= 5}
                readOnly
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <span>Receita recorrente (mensal)</span>
            </label>
            <label className="flex items-center gap-2 text-gray-700 font-bold">
              <input
                type="checkbox"
                checked
                readOnly
                className="w-4 h-4 rounded border-gray-300 text-green-600 accent-green-600"
              />
              <span>Somar ao Orçamento e Relatórios</span>
            </label>
          </div>

          {/* Botões Cancelar e Adicionar Receita (50% / 50% igual ao Receitas.jsx) */}
          <div className="flex gap-3 pt-1">
            <span className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-center font-medium">
              Cancelar
            </span>
            <span
              className={`flex-1 py-2 bg-green-600 text-white rounded-lg text-center font-semibold ${
                isFieldHighlighted('rec_checks_salvar')
                  ? 'ring-4 ring-amber-400 scale-[1.02]'
                  : ''
              }`}
            >
              Adicionar Receita
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 2B. RECEITAS - PARTE 2: FILTROS, 3 CARTÕES DE RESUMO E TABELA DE RECEITAS
  // ============================================================================
  const renderReceitasListExactCopy = () => {
    return (
      <div className="space-y-3 text-gray-800 text-[11px]">
        <div
          className={`bg-white p-3.5 rounded-2xl shadow-sm border ${
            isFieldHighlighted('rec_filtros')
              ? 'ring-3 ring-amber-400 border-amber-500'
              : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-500" /> Filtros de Receitas
            </h4>
            <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-[10px]">
              Limpar Filtros
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-1.5 rounded border border-gray-300">Categoria: Todas</div>
            <div className="p-1.5 rounded border border-gray-300">Subcategoria: Todas</div>
            <div className="p-1.5 rounded border border-gray-300">Mês: Outubro</div>
            <div className="p-1.5 rounded border border-gray-300">Ano: 2026</div>
          </div>
        </div>

        {/* 3 Cartões de Resumo Exatos de Receitas.jsx */}
        <div
          className={`grid grid-cols-3 gap-2.5 ${
            isFieldHighlighted('rec_resumo_tabela') ? 'ring-3 ring-amber-400 rounded-xl p-1' : ''
          }`}
        >
          <div className="bg-green-50 rounded-xl p-2.5 border border-green-200">
            <span className="text-[10px] text-gray-600 block">Total</span>
            <span className="text-sm font-bold text-green-600">R$ 8.000,00</span>
            <span className="block text-[9px] text-gray-500">1 receita(s)</span>
          </div>
          <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-200">
            <span className="text-[10px] text-gray-600 block">Categorias</span>
            <span className="text-sm font-bold text-blue-600">1</span>
            <span className="block text-[9px] text-gray-500">ativas</span>
          </div>
          <div className="bg-indigo-50 rounded-xl p-2.5 border border-indigo-200">
            <span className="text-[10px] text-gray-600 block">Subcategorias</span>
            <span className="text-sm font-bold text-indigo-600">1</span>
            <span className="block text-[9px] text-gray-500">ativas</span>
          </div>
        </div>

        {/* Tabela de Receitas */}
        <div className="bg-white p-3 rounded-2xl border border-gray-200">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                <th className="py-1.5 px-2">Data</th>
                <th className="py-1.5 px-2">Descrição</th>
                <th className="py-1.5 px-2">Categoria</th>
                <th className="py-1.5 px-2">Subcategoria</th>
                <th className="py-1.5 px-2 text-right">Valor</th>
                <th className="py-1.5 px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-1.5 px-2">05/10/2026</td>
                <td className="py-1.5 px-2 font-semibold text-gray-900">Salário Mensal Empresa</td>
                <td className="py-1.5 px-2">Receita Principal</td>
                <td className="py-1.5 px-2">Salário Principal</td>
                <td className="py-1.5 px-2 text-right font-bold text-green-600">R$ 8.000,00</td>
                <td className="py-1.5 px-2 text-center">✏️ 🗑️</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 3. ORÇAMENTO: CÓPIA EXATA DE `src/pages/Orcamento.jsx`
  // ============================================================================
  const renderOrcamentoExactCopy = () => {
    const rendaVal =
      sceneIndex === 1
        ? getTypedOrFinal(1, '8000.00', '')
        : sceneIndex > 1
        ? '8000.00'
        : '8000.00';

    const categoriasReais = [
      {
        nome: 'Despesas Fixas',
        cor: '#3B82F6',
        pct: '50',
        planejado: 'R$ 4.000,00',
        gasto: 'R$ 1.200,00',
        disponivel: 'R$ 2.800,00'
      },
      {
        nome: 'Lazer',
        cor: '#10B981',
        pct: '20',
        planejado: 'R$ 1.600,00',
        gasto: 'R$ 250,00',
        disponivel: 'R$ 1.350,00'
      },
      {
        nome: 'Educação',
        cor: '#F59E0B',
        pct: '20',
        planejado: 'R$ 1.600,00',
        gasto: 'R$ 400,00',
        disponivel: 'R$ 1.200,00'
      },
      {
        nome: 'Investimentos',
        cor: '#EF4444',
        pct: '0',
        planejado: 'R$ 0,00',
        gasto: 'R$ 0,00',
        disponivel: 'R$ 0,00'
      },
      {
        nome: 'Reserva de Emergência',
        cor: '#EC4899',
        pct: '10',
        planejado: 'R$ 800,00',
        gasto: 'R$ 800,00',
        disponivel: 'R$ 0,00'
      }
    ];

    return (
      <div className="space-y-3 text-gray-800 text-[11px]">
        {/* Cabeçalho Exato de Orcamento.jsx */}
        <div
          className={`p-2 rounded-xl transition-all ${
            isFieldHighlighted('orc_topo') ? 'ring-3 ring-amber-400 bg-amber-50' : ''
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Programação do Orçamento</h2>
              <p className="text-[11px] text-gray-600">
                Configure seu orçamento mensal de acordo com suas metas
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-3 py-1 border border-gray-300 rounded-full bg-white text-gray-800 font-semibold text-[10px]">
                outubro de 2026 📅
              </span>
              <span className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-[10px] flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Resetar
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold text-[10px] flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Copiar Mês Anterior
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-[10px] flex items-center gap-1">
                <Copy className="w-3 h-3" /> Replicar Meses
              </span>
              <span
                className={`px-3.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow ${
                  isFieldHighlighted('btn_salvar') ? 'ring-4 ring-amber-400 scale-105' : ''
                }`}
              >
                <Save className="w-3 h-3" /> Salvar Orçamento
              </span>
            </div>
          </div>
        </div>

        {/* Grade Superior: Configuração de Renda + Distribuição do Orçamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Configuração de Renda */}
          <div
            className={`bg-white p-3.5 rounded-2xl shadow-sm border ${
              isFieldHighlighted('renda_prevista') || isFieldHighlighted('dividas_renda_real')
                ? 'ring-3 ring-amber-400 border-amber-500'
                : 'border-gray-200'
            }`}
          >
            <h3 className="font-bold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-500" /> Configuração de Renda
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                  Renda Prevista
                </label>
                <div
                  className={`flex items-center px-2.5 py-1 rounded-lg border ${fieldRingClass(
                    'renda_prevista'
                  )}`}
                >
                  <span className="text-gray-500 mr-1.5">R$</span>
                  <span className="font-bold text-gray-900">{rendaVal}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                  Dívidas (a serem abatidas da renda)
                </label>
                <div
                  className={`flex items-center px-2.5 py-1 rounded-lg border ${fieldRingClass(
                    'dividas_renda_real'
                  )}`}
                >
                  <span className="text-gray-500 mr-1.5">R$</span>
                  <span className="font-bold text-gray-900">0,00</span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-xs">
                  Renda Real Disponível:
                </span>
                <span className="text-sm font-extrabold text-amber-600">R$ 8.000,00</span>
              </div>
            </div>
          </div>

          {/* Card Distribuição do Orçamento */}
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <h3 className="font-bold text-gray-800 text-xs mb-1 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-amber-500" /> Distribuição do Orçamento
            </h3>
            <div className="flex items-center justify-center gap-4 my-auto py-1">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  background:
                    'conic-gradient(#3B82F6 0% 50%, #10B981 50% 70%, #F59E0B 70% 90%, #EC4899 90% 100%)'
                }}
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center font-extrabold text-[10px] text-gray-800">
                  100%
                </div>
              </div>
              <div className="space-y-1 text-[10px]">
                {categoriasReais.map((c) => (
                  <div key={c.nome} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.cor }}
                    />
                    <span className="text-gray-700">{c.nome}:</span>
                    <strong className="text-gray-900">{c.pct}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Tabela Metas por Categoria Exato de Orcamento.jsx */}
        <div
          className={`bg-white p-3.5 rounded-2xl shadow-sm border ${
            isFieldHighlighted('meta_cat') || isFieldHighlighted('reserva')
              ? 'ring-3 ring-amber-400 border-amber-500'
              : 'border-gray-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-gray-800 text-xs">Metas por Categoria</h3>
              <p className="text-[10px] text-gray-500">
                Escolha definir cada meta em valor monetário (R$) ou percentual (%) da renda
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 text-[10px]">
              <span>
                Renda Real: <strong>R$ 8.000,00</strong>
              </span>
              <span>
                Já Configurado (100%): <strong className="text-emerald-600">R$ 8.000,00</strong>
              </span>
              <span>
                Falta: <strong className="text-emerald-600">R$ 0,00</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="py-1.5 px-2">Categoria</th>
                  <th className="py-1.5 px-2 text-center">Modo</th>
                  <th className="py-1.5 px-2 text-center">Meta do Mês</th>
                  <th className="py-1.5 px-2 text-right">Planejado</th>
                  <th className="py-1.5 px-2 text-right">Gasto Atual</th>
                  <th className="py-1.5 px-2 text-right">Disponível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoriasReais.map((cat) => (
                  <tr key={cat.nome} className="hover:bg-gray-50">
                    <td className="py-1.5 px-2 font-medium text-gray-800 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.cor }}
                      />
                      <span>{cat.nome}</span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className="inline-flex rounded border border-gray-300 bg-gray-100 p-0.5 text-[9px]">
                        <span className="px-1.5 text-gray-500">R$</span>
                        <span className="px-1.5 rounded bg-amber-400 text-black font-bold">%</span>
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded border border-gray-300 bg-white font-bold text-gray-900">
                        {cat.pct} %
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-gray-800">
                      {cat.planejado}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-600">{cat.gasto}</td>
                    <td className="py-1.5 px-2 text-right font-bold text-emerald-600">
                      {cat.disponivel}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-900">
                  <td className="py-1.5 px-2">TOTAL</td>
                  <td />
                  <td className="py-1.5 px-2 text-center text-emerald-600">100.0%</td>
                  <td className="py-1.5 px-2 text-right">R$ 8.000,00</td>
                  <td className="py-1.5 px-2 text-right">R$ 2.650,00</td>
                  <td className="py-1.5 px-2 text-right text-emerald-600">R$ 5.350,00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 4. DEMAIS TELAS COM ESTILO CLARO FIEL AO SISTEMA REAL
  // ============================================================================
  const renderDashboardExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">Dashboard</h2>
          <p className="text-[11px] text-gray-500">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold text-[10px] flex items-center gap-1 ${
              isFieldHighlighted('btn_importar') ? 'ring-4 ring-amber-400 scale-105' : ''
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Importar Planilha
          </span>
          <span
            className={`px-3 py-1 rounded-full bg-white border border-gray-300 text-gray-800 font-semibold text-[10px] ${
              isFieldHighlighted('filtro_mes') ? 'ring-3 ring-amber-400' : ''
            }`}
          >
            📅 Outubro / 2026
          </span>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${
          isFieldHighlighted('cards_resumo') ? 'ring-3 ring-amber-400 rounded-xl p-1' : ''
        }`}
      >
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 block">Receitas</span>
          <span className="text-sm font-bold text-green-600">R$ 8.000,00</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 block">Despesas</span>
          <span className="text-sm font-bold text-red-600">R$ 4.350,00</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 block">Saldo Final</span>
          <span className="text-sm font-bold text-green-600">R$ 3.650,00</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-500 block">Percentual Sobra</span>
          <span className="text-sm font-bold text-blue-600">45.6%</span>
        </div>
      </div>

      <div
        className={`bg-white p-3.5 rounded-2xl border ${
          isFieldHighlighted('mapa_calor')
            ? 'ring-3 ring-amber-400 border-amber-500'
            : 'border-gray-200'
        }`}
      >
        <h4 className="font-bold text-gray-800 text-xs mb-2">
          Acompanhamento de Metas por Categoria no Mês
        </h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="font-medium text-gray-700">
                Despesas Fixas (R$ 1.200,00 de R$ 2.400,00)
              </span>
              <span className="font-bold text-green-600">50% consumido</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-green-500 w-[50%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="font-medium text-gray-700">Lazer (R$ 680,00 de R$ 800,00)</span>
              <span className="font-bold text-amber-600">85% consumido</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-amber-500 w-[85%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCartoesExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">Controle de Cartões</h2>
          <p className="text-[11px] text-gray-500">
            Gerencie as faturas mensais de janeiro a dezembro de cada cartão
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white border border-gray-300 font-semibold text-[10px]">
            📅 2026
          </span>
          <span className="px-3 py-1 rounded-full bg-green-600 text-white font-semibold text-[10px] flex items-center gap-1">
            <Plus className="w-3 h-3" /> Novo Cartão
          </span>
          <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[10px] flex items-center gap-1">
            <Save className="w-3 h-3" /> Salvar Alterações
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto p-3">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
              <th className="py-2 px-2">CARTÕES</th>
              <th className="py-2 px-2 text-center">SETEMBRO</th>
              <th className="py-2 px-2 text-center">OUTUBRO</th>
              <th className="py-2 px-2 text-center">NOVEMBRO</th>
              <th className="py-2 px-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-2 px-2 font-bold text-gray-900">Nubank Platinum</td>
              <td className="py-2 px-2 text-right">R$ 650,00</td>
              <td className="py-2 px-2 text-right">
                <div className="px-2 py-1 rounded border border-blue-200 bg-blue-50/40 font-bold text-blue-900">
                  R$ 950,00
                </div>
                <span className="text-[9px] text-blue-600 underline block mt-0.5">
                  3 compras (Ver detalhes da fatura)
                </span>
              </td>
              <td className="py-2 px-2 text-right text-blue-800 font-semibold">R$ 300,00</td>
              <td className="py-2 px-2 text-right font-extrabold text-gray-900">R$ 1.900,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderViagensExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-900">Planejamento de Viagens</h2>
          <p className="text-[11px] text-gray-500">
            Simulador de passagens, carro, hospedagem, alimentação, câmbio e roteiro
          </p>
        </div>
        <span className="px-3.5 py-1 rounded-full bg-amber-400 text-black font-bold text-[10px]">
          + Nova Viagem
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          'Visão Geral',
          'Transporte & Aéreo',
          'Hospedagem',
          'Alimentação & Gorjetas',
          'Câmbio & Moeda',
          'Roteiro & Itens'
        ].map((aba, idx) => (
          <span
            key={aba}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
              idx === 0
                ? 'bg-amber-400 text-black'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {aba}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-gray-200">
        <div>
          <span className="text-[10px] text-gray-500 block">Destino, Datas e Perfil de Risco</span>
          <span className="font-bold text-gray-900 text-xs block mt-0.5">
            Gramado / Lisboa • 10/12/2026 a 17/12/2026
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">
            Perfil Médio (+15% Colchão de Segurança para Imprevistos)
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Simuladores Inclusos</span>
          <span className="font-bold text-emerald-600 text-xs block mt-0.5">
            Passagens + Bagagem | Carro (Km/Pedágio) | Hotel | Câmbio Comercial + IOF
          </span>
        </div>
      </div>
    </div>
  );

  const renderRelatoriosExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Relatórios Financeiros</h2>
          <p className="text-[11px] text-gray-500">
            Personalize os 8 gráficos analíticos, filtros de período e calendário térmico
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white border border-gray-300 font-semibold text-[10px]">
          📅 Mensal • Outubro / 2026
        </span>
      </div>
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-500" /> Personalizar Relatório (Grade 2x4)
          </span>
          <span className="text-[10px] font-bold text-amber-600">Mostrar Opções ▲</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
          {[
            'Acompanhamento de Orçamento',
            'Análise de Custo de Vida',
            'Distribuição Geral (Reais vs Planejado)',
            'Precisão por Subcategoria',
            'Compromissos Essenciais',
            'Calendário Térmico de Gastos Diários',
            'Construção Patrimonial',
            'Evolução Temporal'
          ].map((sec) => (
            <div
              key={sec}
              className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{sec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDreExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">DRE — Demonstração do Resultado</h2>
          <p className="text-[11px] text-gray-500">
            Consolidação contábil Mensal, Trimestral ou Anual
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white border border-gray-300 font-semibold text-[10px]">
          Mensal • Trimestral • Anual
        </span>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
        <div className="flex justify-between py-1.5 border-b border-gray-100 font-bold text-green-700">
          <span>(+) RECEITAS TOTAIS DO PERÍODO</span>
          <span>R$ 8.000,00 (100%)</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100 text-red-600 font-medium">
          <span>(-) DESPESAS TOTAIS POR CATEGORIA</span>
          <span>- R$ 4.350,00 (54,4%)</span>
        </div>
        <div className="flex justify-between py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 font-extrabold text-emerald-800">
          <span>(=) LUCRO / RESULTADO LÍQUIDO</span>
          <span>+ R$ 3.650,00 (Margem: 45,6%)</span>
        </div>
      </div>
    </div>
  );

  const renderBackupExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div>
        <h2 className="text-base font-bold text-gray-900">Backup e Exportação de Dados</h2>
        <p className="text-[11px] text-gray-500">
          Exporte seus dados em Excel (.xlsx), PDF, CSV ou JSON e restaure quando precisar
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
          <span className="font-bold text-gray-900 text-xs block mb-1">
            📥 Assistente de Exportação
          </span>
          <p className="text-[10px] text-gray-600 mb-2">
            Escolha exportar Tudo, apenas Despesas, Receitas, Orçamentos, Cartões ou Viagens em
            Excel, PDF, CSV ou JSON.
          </p>
          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
            Exportar Arquivo
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200">
          <span className="font-bold text-gray-900 text-xs block mb-1">
            🔄 Restaurar Backup (.JSON)
          </span>
          <p className="text-[10px] text-gray-600 mb-2">
            Carregue um arquivo de segurança salvo no seu computador ou celular para restaurar tudo.
          </p>
          <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]">
            Importar Backup
          </span>
        </div>
      </div>
    </div>
  );

  const renderConfiguracoesExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Configurações</h2>
          <p className="text-[11px] text-gray-500">
            Abas: Perfil (Nome, Foto, DDI/Telefone), Categorias & Subcategorias e Segurança
          </p>
        </div>
        <div className="flex gap-1">
          <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-bold text-[10px]">
            Perfil
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[10px]">
            Categorias
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 text-[10px]">
            Segurança
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-gray-200">
        <div>
          <span className="font-bold text-gray-800 text-xs block mb-1">
            👤 Perfil, Tema e Idioma
          </span>
          <p className="text-[10px] text-gray-600">
            Atualize seu Nome, Avatar, Telefone com DDI do País (🇧🇷 +55) e escolha Tema Claro ou
            Escuro.
          </p>
        </div>
        <div>
          <span className="font-bold text-gray-800 text-xs block mb-1">
            🏷️ Categorias, Subcategorias e Senha
          </span>
          <p className="text-[10px] text-gray-600">
            Crie novas Categorias ou Subcategorias personalizadas para usar em Despesas e no
            Orçamento!
          </p>
        </div>
      </div>
    </div>
  );

  const renderQuizExactCopy = () => (
    <div className="space-y-3 text-gray-800 text-[11px]">
      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-xs">
            🎮 Quiz: Posso Gastar? (Simulador Antes da Compra)
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold text-[10px]">
            Botões A- / A+ e Expandir Janela
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2 rounded-lg border border-gray-300">
            <span className="text-[9px] text-gray-500 block">
              1. Onde ou com o quê você quer gastar?
            </span>
            <span className="font-bold text-gray-900">Jantar de Sábado</span>
          </div>
          <div className="p-2 rounded-lg border border-gray-300">
            <span className="text-[9px] text-gray-500 block">
              2. Quantas moedas custa e Qual Pote?
            </span>
            <span className="font-bold text-green-700">R$ 80,00 • Pote: Lazer</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-amber-400 text-black font-extrabold text-center text-xs">
          🍬 Ver se Sobra Balinha no Pote!
        </div>
      </div>
    </div>
  );

  const renderMainReplica = () => {
    if (videoId === 'despesas' || videoId === 'despesas_lista') {
      return viewMode === 'list' || videoId === 'despesas_lista'
        ? renderDespesasListExactCopy()
        : renderDespesasFormExactCopy();
    }
    if (videoId === 'receitas' || videoId === 'receitas_lista') {
      return viewMode === 'list' || videoId === 'receitas_lista'
        ? renderReceitasListExactCopy()
        : renderReceitasFormExactCopy();
    }
    if (videoId === 'orcamento' || videoId === 'orcamento_tabela') {
      return renderOrcamentoExactCopy();
    }
    if (videoId === 'dashboard') {
      return renderDashboardExactCopy();
    }
    if (videoId === 'cartoes') {
      return renderCartoesExactCopy();
    }
    if (videoId === 'viagens') {
      return renderViagensExactCopy();
    }
    if (videoId === 'relatorios') {
      return renderRelatoriosExactCopy();
    }
    if (videoId === 'dre') {
      return renderDreExactCopy();
    }
    if (videoId === 'backup') {
      return renderBackupExactCopy();
    }
    if (videoId === 'configuracoes') {
      return renderConfiguracoesExactCopy();
    }
    return renderQuizExactCopy();
  };

  return (
    <div className="rounded-xl border-2 border-gray-300 bg-gray-50 shadow-xl overflow-hidden relative select-none">
      {/* Barra superior da janela simulando a tela real do sistema */}
      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="ml-2 px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-200">
            🔒 meubolso.capital/{videoId.replace('_lista', '')}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-amber-400">
          🖥️ Cópia Exata 1:1 da Tela Real do Sistema
        </span>
      </div>

      {/* Área da Tela Real (Fundo Claro Igual ao Print Enviado pelo Usuário) */}
      <div className="p-3 sm:p-4 bg-[#F8FAFC] relative overflow-hidden">
        {renderMainReplica()}

        {/* PONTEIRO DO MOUSE ANIMADO DO FIN NAVEGANDO PELA TELA */}
        <div
          style={{
            left: `${cursorX}%`,
            top: `${cursorY}%`
          }}
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out"
        >
          <div className="relative flex items-center">
            <span className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-amber-400/50 animate-ping" />
            <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xl border-2 border-white">
              <MousePointer className="w-3.5 h-3.5 fill-black" />
            </div>
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px] shadow-lg whitespace-nowrap border border-black/30">
              🖱️ FIN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinScreenReplica;
