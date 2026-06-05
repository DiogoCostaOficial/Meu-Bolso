import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, DollarSign, Calendar, Tag, FileText, TrendingUp, Filter, X, ChevronUp, ChevronDown, Check, XCircle, GraduationCap, ArrowUpDown } from 'lucide-react';
import api from '../services/api';
import useDebouncedSave from '../hooks/useDebouncedSave';
import SaveIndicator from '../components/SaveIndicator';
import { useEdu } from '../contexts/EduContext';
import EduHelpButton from '../components/EduHelpButton';

const Receitas = () => {
  const { showLesson } = useEdu();
  const [receitas, setReceitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtrosMinimizados, setFiltrosMinimizados] = useState(false);
  // NOVO: Estados para edição inline
  const [editingItemId, setEditingItemId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });
  const [inlineEditForm, setInlineEditForm] = useState({
    categoria: '',
    subcategoria: '',
    somarNoOrcamento: true
  });
  const [novaReceita, setNovaReceita] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: 'Receita Principal', // Categoria padrão
    subcategoria: '',
    observacoes: '',
    recorrente: false,
    somarNoOrcamento: true
  });
  const [quantidadeTitulos, setQuantidadeTitulos] = useState(1);
  const [filtros, setFiltros] = useState({
    categoria: '',
    subcategoria: '',
    mes: '',
    ano: new Date().getFullYear().toString(),
    dataInicio: '',
    dataFim: '',
    descricao: ''
  });
  const categorias = [
    'Receita Principal',
    'Outras Receitas'
  ];
  const subcategorias = {
    'Receita Principal': ['Salário Principal', 'Vale Salário', 'Vale Refeição', '13º Salário', 'PLR', 'Outros'],
    'Outras Receitas': ['Freelance', 'Venda de itens', 'Outros']
  };
  const meses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' }
  ];
  const gerarListaAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      anos.push(i.toString());
    }
    return anos;
  };
  useEffect(() => {
    carregarReceitas();
  }, []);
  const carregarReceitas = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      const receitasData = userData.receitas || [];

      setReceitas(Array.isArray(receitasData) ? receitasData : []);
      console.log('✅ Receitas carregadas:', receitasData.length);
    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error);
      setReceitas([]);
    }
  };

  const salvarReceitas = async (novasReceitas) => {
    try {
      // OTIMIZAÇÃO: Enviar apenas as receitas para atualização parcial
      // Não é mais necessário buscar todos os dados do usuário antes

      await api.post('/user/dados', { receitas: novasReceitas });

      setReceitas(novasReceitas);
      console.log('✅ Receitas salvas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar receitas:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';

      // Relançar o erro para o hook capturar
      throw new Error(`Erro ao salvar receita: ${errorMessage}`);
    }
  };

  // Hook de debounce para salvamento otimizado
  const {
    debouncedSave,
    saveImmediately,
    isSaving,
    saveStatus,
    lastSaved
  } = useDebouncedSave(salvarReceitas, 1000); // Aguarda 1 segundo antes de salvar
  const adicionarReceita = (e) => {
    e.preventDefault();

    if (!novaReceita.descricao || !novaReceita.valor || !novaReceita.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios (Descrição, Valor e Categoria).');
      return;
    }
    const valorNumerico = parseFloat(novaReceita.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }

    const qtd = parseInt(quantidadeTitulos);
    if (isNaN(qtd) || qtd <= 0) {
      alert('Por favor, insira uma quantidade válida de títulos.');
      return;
    }

    let receitasAtualizadas = [...receitas];

    if (editando) {
      // Modo edição: atualiza apenas a receita existente
      const receitaParaSalvar = {
        ...novaReceita,
        id: editando.id,
        valor: valorNumerico,
        somarNoOrcamento: novaReceita.somarNoOrcamento !== undefined ? novaReceita.somarNoOrcamento : true
      };
      receitasAtualizadas = receitas.map(r =>
        r.id === editando.id ? receitaParaSalvar : r
      );
      setEditando(null);
    } else {
      // Modo criação: cria múltiplas receitas com datas incrementadas
      const timestamp = Date.now();
      const dataInicial = new Date(novaReceita.data + 'T00:00:00');
      const novasReceitas = [];

      for (let i = 0; i < qtd; i++) {
        const dataReceita = new Date(dataInicial);
        dataReceita.setMonth(dataReceita.getMonth() + i);

        novasReceitas.push({
          ...novaReceita,
          id: timestamp + i,
          valor: valorNumerico,
          data: dataReceita.toISOString().split('T')[0],
          somarNoOrcamento: novaReceita.somarNoOrcamento !== undefined ? novaReceita.somarNoOrcamento : true
        });
      }

      receitasAtualizadas = [...receitas, ...novasReceitas];
    }

    // Usar debounce para salvamento otimizado
    debouncedSave(receitasAtualizadas);
    resetarFormulario();
  };
  // NOVO: Iniciar edição inline
  const iniciarEdicaoInline = (receita) => {
    setEditingItemId(receita.id);
    setInlineEditForm({
      descricao: receita.descricao,
      valor: receita.valor,
      categoria: receita.categoria,
      subcategoria: receita.subcategoria || '',
      somarNoOrcamento: receita.somarNoOrcamento !== undefined ? receita.somarNoOrcamento : true
    });
    setMostrarFormulario(false);
  };
  // NOVO: Handle inline change
  const handleInlineChange = (e) => {
    const { name, value } = e.target;
    setInlineEditForm(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'categoria') {
        // Ao mudar categoria, resetar subcategoria se não for válida
        const availableSubs = subcategorias[value] || [];
        newState.subcategoria = availableSubs.length > 0 ? availableSubs[0] : '';
      }
      return newState;
    });
  };
  // NOVO: Salvar edição inline
  const handleInlineSave = (id) => {
    const valorNumerico = parseFloat(inlineEditForm.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }
    const updatedReceitas = receitas.map(r =>
      r.id === id ? {
        ...r,
        ...inlineEditForm,
        valor: valorNumerico
      } : r
    );

    // Usar debounce para edição inline
    debouncedSave(updatedReceitas);
    setEditingItemId(null);
    setInlineEditForm({ descricao: '', valor: '', categoria: '', subcategoria: '', somarNoOrcamento: true });
  };
  // NOVO: Cancelar edição inline
  const handleInlineCancel = () => {
    setEditingItemId(null);
    setInlineEditForm({ descricao: '', valor: '', categoria: '', subcategoria: '', somarNoOrcamento: true });
  };
  const excluirReceita = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      const receitasAtualizadas = receitas.filter(r => r.id !== id);

      // Usar salvamento imediato para exclusões (ação crítica)
      saveImmediately(receitasAtualizadas);
      setEditingItemId(null);
    }
  };
  const resetarFormulario = () => {
    setNovaReceita({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      subcategoria: '',
      observacoes: '',
      recorrente: false,
      somarNoOrcamento: true
    });
    setQuantidadeTitulos(1);
    setMostrarFormulario(false);
    setEditando(null);
  };
  const limparFiltros = () => {
    setFiltros({
      categoria: '',
      subcategoria: '',
      mes: '',
      ano: new Date().getFullYear().toString(),
      dataInicio: '',
      dataFim: '',
      descricao: ''
    });
  };
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };
  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };
  const receitasFiltradas = receitas.filter(receita => {
    if (filtros.categoria && receita.categoria !== filtros.categoria) return false;
    if (filtros.subcategoria && receita.subcategoria !== filtros.subcategoria) return false;
    if (filtros.mes) {
      const [ano, mes] = receita.data.split('-');
      if (mes !== filtros.mes) return false;
    }
    if (filtros.ano) {
      const [ano] = receita.data.split('-');
      if (ano !== filtros.ano) return false;
    }
    if (filtros.dataInicio && receita.data < filtros.dataInicio) return false;
    if (filtros.dataFim && receita.data > filtros.dataFim) return false;
    if (filtros.descricao && !receita.descricao.toLowerCase().includes(filtros.descricao.toLowerCase())) return false;
    return true;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReceitas = React.useMemo(() => {
    let sortableItems = [...receitasFiltradas];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'valor') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        // Normalização para strings
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [receitasFiltradas, sortConfig]);


  const totalReceitas = receitasFiltradas
    .filter(r => r.somarNoOrcamento !== false)
    .reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);
  const categoriasAtivas = [...new Set(receitasFiltradas.map(r => r.categoria))].length;
  const subcategoriasAtivas = [...new Set(receitasFiltradas.filter(r => r.subcategoria).map(r => r.subcategoria))].length;
  return (
    <div className="space-y-6 bg-transparent min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Receitas</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gerencie suas entradas e acompanhe sua evolução financeira.</p>
        </div>
        <div className="flex gap-3">
          <EduHelpButton topic="receitas" />
          <button
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              setEditingItemId(null);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {mostrarFormulario ? 'Cancelar' : 'Nova Receita'}
          </button>
        </div>
      </div>

      {/* NOVO POSICIONAMENTO: Formulário de Nova Receita aparece AQUI */}
      {mostrarFormulario && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-500" />
            {editando ? 'Editar Receita' : 'Nova Receita'}
          </h2>
          <form onSubmit={adicionarReceita} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Descrição *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Ex: Salário, Venda, Freelance..."
                  value={novaReceita.descricao}
                  onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
                  required
                />
              </div>
              {!editando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Quantidade de Títulos *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="Ex: 6 (para 6 meses)"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    value={quantidadeTitulos}
                    onChange={(e) => setQuantidadeTitulos(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Serão criados {quantidadeTitulos} título(s) com datas mensais consecutivas
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  value={novaReceita.valor}
                  onChange={(e) => setNovaReceita({ ...novaReceita, valor: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Data *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  value={novaReceita.data}
                  onChange={(e) => setNovaReceita({ ...novaReceita, data: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Categoria *
                </label>
                <select
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  value={novaReceita.categoria}
                  onChange={(e) => setNovaReceita({ ...novaReceita, categoria: e.target.value, subcategoria: '' })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Subcategoria
                </label>
                <select
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50"
                  value={novaReceita.subcategoria}
                  onChange={(e) => setNovaReceita({ ...novaReceita, subcategoria: e.target.value })}
                  disabled={!novaReceita.categoria}
                >
                  <option value="">Selecione uma subcategoria (opcional)</option>
                  {novaReceita.categoria && subcategorias[novaReceita.categoria]?.map((sub, index) => (
                    <option key={index} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Observações (Opcional)
              </label>
              <textarea
                placeholder="Adicione detalhes adicionais sobre a receita..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                rows="3"
                value={novaReceita.observacoes}
                onChange={(e) => setNovaReceita({ ...novaReceita, observacoes: e.target.value })}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recorrente"
                className="w-4 h-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-slate-700 rounded focus:ring-green-500"
                checked={novaReceita.recorrente}
                onChange={(e) => setNovaReceita({ ...novaReceita, recorrente: e.target.checked })}
              />
              <label htmlFor="recorrente" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                Receita recorrente (mensal)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="somarNoOrcamento"
                className="w-4 h-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-slate-700 rounded focus:ring-green-500"
                checked={novaReceita.somarNoOrcamento}
                onChange={(e) => setNovaReceita({ ...novaReceita, somarNoOrcamento: e.target.checked })}
              />
              <label htmlFor="somarNoOrcamento" className="ml-2 text-sm text-gray-700 dark:text-slate-300 font-bold">
                Somar ao Orçamento e Relatórios
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetarFormulario}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                {editando ? 'Atualizar Receita' : 'Adicionar Receita'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Filtros
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={limparFiltros}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </button>
            <button
              onClick={() => setFiltrosMinimizados(!filtrosMinimizados)}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={filtrosMinimizados ? "Expandir Filtros" : "Minimizar Filtros"}
            >
              {filtrosMinimizados ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {!filtrosMinimizados && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Categoria</label>
              <select
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value, subcategoria: '' })}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Subcategoria</label>
              <select
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                value={filtros.subcategoria}
                onChange={(e) => setFiltros({ ...filtros, subcategoria: e.target.value })}
                disabled={!filtros.categoria}
              >
                <option value="">Todas as subcategorias</option>
                {filtros.categoria && subcategorias[filtros.categoria]?.map((sub, index) => (
                  <option key={index} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mês</label>
              <select
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filtros.mes}
                onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
              >
                <option value="">Selecione o mês</option>
                {meses.map(mes => (
                  <option key={mes.valor} value={mes.valor}>{mes.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Ano</label>
              <select
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filtros.ano}
                onChange={(e) => setFiltros({ ...filtros, ano: e.target.value })}
              >
                {gerarListaAnos().map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Data Início</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.descricao}
                onChange={(e) => setFiltros({ ...filtros, descricao: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Receitas</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatarMoeda(totalReceitas)}</p>
          <p className="text-sm text-gray-500 mt-1">{receitasFiltradas.length} receita(s)</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Categorias</h3>
            <Tag className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{categoriasAtivas}</p>
          <p className="text-sm text-gray-500 mt-1">categorias ativas</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Subcategorias</h3>
            <Tag className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{subcategoriasAtivas}</p>
          <p className="text-sm text-gray-500 mt-1">subcategorias ativas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('data')}
                >
                  <div className="flex items-center gap-1">
                    Data
                    {sortConfig.key === 'data' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortConfig.key !== 'data' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('descricao')}
                >
                  <div className="flex items-center gap-1">
                    Descrição
                    {sortConfig.key === 'descricao' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortConfig.key !== 'descricao' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('categoria')}
                >
                  <div className="flex items-center gap-1">
                    Categoria
                    {sortConfig.key === 'categoria' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortConfig.key !== 'categoria' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('subcategoria')}
                >
                  <div className="flex items-center gap-1">
                    Subcategoria
                    {sortConfig.key === 'subcategoria' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortConfig.key !== 'subcategoria' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('valor')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Valor
                    {sortConfig.key === 'valor' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortConfig.key !== 'valor' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receitasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <DollarSign className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Nenhuma receita encontrada</p>
                      <p className="text-sm mt-2">
                        {receitas.length === 0
                          ? 'Clique em "Nova Receita" para começar'
                          : 'Tente ajustar os filtros'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedReceitas
                  .map((receita) => (
                    <tr key={receita.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(receita.data)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingItemId === receita.id ? (
                          <>
                            <input
                              type="text"
                              name="descricao"
                              value={inlineEditForm.descricao}
                              onChange={handleInlineChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                            {/* Campo de Somar ao Orçamento na Edição Inline */}
                            <label className="flex items-center cursor-pointer text-xs mt-2">
                              <input
                                type="checkbox"
                                name="somarNoOrcamento"
                                checked={inlineEditForm.somarNoOrcamento}
                                onChange={(e) => setInlineEditForm(prev => ({ ...prev, somarNoOrcamento: e.target.checked }))}
                                className="form-checkbox h-3 w-3 text-green-600 rounded focus:ring-green-500 mr-1"
                              />
                              <span className="text-gray-700 font-bold">Somar ao Orçamento</span>
                            </label>
                          </>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              {receita.descricao}
                              {receita.recorrente && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-semibold">
                                  Recorrente
                                </span>
                              )}
                              {receita.somarNoOrcamento === false && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase border border-gray-200">
                                  Apenas DRE
                                </span>
                              )}
                            </div>
                            {receita.observacoes && (
                              <p className="text-xs text-gray-500 mt-1">{receita.observacoes}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingItemId === receita.id ? (
                          <select
                            name="categoria"
                            value={inlineEditForm.categoria}
                            onChange={handleInlineChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                          >
                            {categorias.map((cat, index) => (
                              <option key={index} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-700">{receita.categoria}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingItemId === receita.id ? (
                          <select
                            name="subcategoria"
                            value={inlineEditForm.subcategoria}
                            onChange={handleInlineChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
                          >
                            <option value="">Selecione</option>
                            {subcategorias[inlineEditForm.categoria]?.map((sub, index) => (
                              <option key={index} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-700">{receita.subcategoria || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                        {editingItemId === receita.id ? (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">R$</span>
                            <input
                              type="number"
                              name="valor"
                              value={inlineEditForm.valor}
                              onChange={handleInlineChange}
                              step="0.01"
                              min="0.01"
                              className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-right"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          formatarMoeda(receita.valor)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {editingItemId === receita.id ? (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleInlineSave(receita.id)}
                              className="text-green-600 hover:text-green-900 transition"
                              title="Salvar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleInlineCancel}
                              className="text-gray-600 hover:text-gray-900 transition"
                              title="Cancelar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => iniciarEdicaoInline(receita)}
                              className="text-blue-600 hover:text-blue-900 transition"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => excluirReceita(receita.id)}
                              className="text-red-600 hover:text-red-900 transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicador de salvamento */}
      <SaveIndicator
        isSaving={isSaving}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
    </div>
  );
};

export default Receitas;
