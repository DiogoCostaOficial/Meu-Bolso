import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Edit2,
  Plus,
  CreditCard,
  Calendar,
  Tag,
  DollarSign,
  AlertCircle, // Reutilizado para 'pendente'
  Check,
  Layers,
  Filter,
  XCircle,
  ChevronUp,
  ChevronDown,
  Search,
  CheckCircle, // Novo ícone para 'pago'
  TrendingDown, // Adicionado para o card de despesas
  GraduationCap,
  ArrowUpDown // Import for sorting
} from 'lucide-react';
import api from '../services/api';
import useDebouncedSave from '../hooks/useDebouncedSave';
import SaveIndicator from '../components/SaveIndicator';
import { useEdu } from '../contexts/EduContext';
import EduHelpButton from '../components/EduHelpButton';

// Categorias padrão com cores (Fallback)
const categoriasDefault = [
  {
    nome: 'Despesas Fixas',
    cor: '#EF4444',
    subcategorias: ['Moradia', 'Mercado', 'Saúde', 'Carro', 'Transporte', 'Bichos', 'Diversos Fixos']
  },
  {
    nome: 'Lazer',
    cor: '#3B82F6',
    subcategorias: ['Junkie Food', 'Assinaturas', 'Rolês e Passeios', 'Datas especiais', 'Presentes', 'Diversos Lazer']
  },
  {
    nome: 'Educação',
    cor: '#10B981',
    subcategorias: ['Cursos', 'Livros', 'Workshops', 'Material Escolar', 'Faculdade', 'Idiomas', 'Pós-graduação', 'Diversos Educação']
  },
  {
    nome: 'Investimentos',
    cor: '#8B5CF6',
    subcategorias: ['Investimentos BR', 'Investimentos US', 'Cripto', 'Diversos Investimentos']
  },
  {
    nome: 'Reserva de Emergência',
    cor: '#F59E0B',
    subcategorias: ['Fundo de Emergência', 'Fundo de Oportunidade', 'Diversos Reserva']
  }
];

// Lista de meses em português
const mesesDoAno = [
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

const Despesas = () => {
  const { showLesson } = useEdu();
  const [despesas, setDespesas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [categorias, setCategorias] = useState(categoriasDefault); // Inicializa com as categorias padrão
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear().toString());
  const [filtroStatus, setFiltroStatus] = useState(''); // Estado para o filtro de status
  const [isCategoriasMinimized, setIsCategoriasMinimized] = useState(false); // Não usado no código atual, mas mantido
  const [isFiltrosMinimized, setIsFiltrosMinimized] = useState(false);
  const [isSubcategoriasMinimized, setIsSubcategoriasMinimized] = useState(false); // Não usado no código atual, mas mantido
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [isListaMinimized, setIsListaMinimized] = useState(false);
  const [selectedDespesas, setSelectedDespesas] = useState([]);
  const [mostrarBulkEditForm, setMostrarBulkEditForm] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    descricao: '',
    categoria: '',
    subcategoria: '',
    statusPagamento: '' // Campo para edição em massa de status
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });
  const [inlineEditForm, setInlineEditForm] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    subcategoria: '',
    observacoes: '', // Campo de observações para edição inline
    dataVencimento: '', // Campo de data de vencimento para edição inline
    somarNoOrcamento: true // Campo para definir se soma no orçamento
  });

  // Função para obter as subcategorias disponíveis para uma dada categoria (Baseada no estado atual)
  const getAvailableSubcategories = (categoryName) => {
    const cat = categorias.find(c => c.nome === categoryName);
    return cat ? cat.subcategorias || [] : [];
  };

  // Lista de todas as subcategorias para filtros (Baseada no estado atual)
  const allSubcategories = [...new Set(categorias.flatMap(c => c.subcategorias || []))].sort();

  // Define os valores iniciais padrão para o formulário
  const initialDefaultCategory = categoriasDefault[0].nome;
  const initialDefaultSubcategories = categoriasDefault[0].subcategorias;
  const initialDefaultSubcategory = initialDefaultSubcategories.length > 0 ? initialDefaultSubcategories[0] : '';
  const [formulario, setFormulario] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: initialDefaultCategory,
    subcategoria: initialDefaultSubcategory,
    observacoes: '',
    parcelado: false,
    numeroParcelas: 1,
    statusPagamento: 'pendente', // Status inicial para novas despesas
    dataVencimento: '', // Campo para data de vencimento
    somarNoOrcamento: true // Padrão: somar ao orçamento
  });

  // Gera lista de anos (últimos 5 anos + próximos 2 anos)
  const gerarListaAnos = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
      anos.push(i.toString());
    }
    return anos;
  };

  useEffect(() => {
    carregarDespesas();
    carregarCategorias();
  }, []);

  // NOVO useEffect para resetar filtroSubcategoria quando filtroCategoria muda
  useEffect(() => {
    // Quando a categoria do filtro muda, resetamos a subcategoria do filtro
    // para garantir que as opções exibidas sejam consistentes com a nova categoria.
    setFiltroSubcategoria('');
  }, [filtroCategoria]);

  // Carrega categorias do backend ou usa as padrão
  const carregarCategorias = async () => {
    try {
      const response = await api.get('/user/dados');
      if (response.data.success && response.data.dados && response.data.dados.categorias && response.data.dados.categorias.length > 0) {
        setCategorias(response.data.dados.categorias);
      } else {
        // Se não houver categorias no backend, usa as padrão
        setCategorias(categoriasDefault);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Em caso de erro, garante que as categorias padrão sejam usadas
      setCategorias(categoriasDefault);
    }
  };

  const carregarDespesas = async () => {
    try {
      const response = await api.get('/user/dados');
      const userData = response.data.dados || {};
      const despesasData = userData.despesas || [];

      // Garante que todas as despesas carregadas tenham statusPagamento, observacoes e dataVencimento
      const despesasComDefaults = despesasData.map(d => ({
        ...d,
        statusPagamento: d.statusPagamento || 'pendente',
        observacoes: d.observacoes || '',
        dataVencimento: d.dataVencimento || '',
        somarNoOrcamento: d.somarNoOrcamento !== undefined ? d.somarNoOrcamento : true
      }));
      setDespesas(despesasComDefaults);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setDespesas([]);
    }
  };

  const salvarDespesas = async (novasDespesas) => {
    try {
      // OTIMIZAÇÃO: Enviar apenas as despesas para atualização parcial

      await api.post('/user/dados', { despesas: novasDespesas });

      setDespesas(novasDespesas);
      console.log('✅ Despesas salvas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar despesas:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';

      // Relançar o erro para o hook capturar
      throw new Error(`Erro ao salvar despesa: ${errorMessage}`);
    }
  };

  // Hook de debounce para salvamento otimizado
  const {
    debouncedSave,
    saveImmediately,
    isSaving,
    saveStatus,
    lastSaved
  } = useDebouncedSave(salvarDespesas, 1000); // Aguarda 1 segundo antes de salvar

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => {
      const newState = { ...prev };
      if (name === 'parcelado') {
        newState[name] = checked;
        if (!checked) {
          newState.numeroParcelas = 1; // Reseta o número de parcelas se desmarcar
        }
      } else if (name === 'numeroParcelas') {
        newState[name] = parseInt(value, 10) || 1; // Garante que seja um número e mínimo 1
      } else {
        newState[name] = value;
      }
      // Se a categoria mudar, atualiza a subcategoria para a primeira disponível da nova categoria
      if (name === 'categoria') {
        const availableSubs = getAvailableSubcategories(value);
        newState.subcategoria =
          availableSubs.length > 0 ? availableSubs[0] : '';
      }
      return newState;
    });
  };

  // Calcula o valor de cada parcela para exibição no formulário
  const calcularValorParcela = () => {
    const valor = parseFloat(formulario.valor);
    const numParcelas = parseInt(formulario.numeroParcelas, 10);
    if (formulario.parcelado && !isNaN(valor) && valor > 0 && numParcelas > 0) {
      return valor / numParcelas;
    }
    return 0;
  };

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setFormulario(prev => ({ ...prev, [name]: checked }));
  };

  // Função para adicionar meses a uma data (usada para parcelamento)
  const adicionarMeses = (dataString, meses) => {
    const data = new Date(dataString + 'T00:00:00');
    data.setMonth(data.getMonth() + meses);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (
      !formulario.descricao ||
      !formulario.valor ||
      !formulario.categoria ||
      !formulario.subcategoria
    ) {
      alert('Preencha a descrição, valor, categoria e subcategoria!');
      return;
    }
    let novasDespesas = [];
    if (formulario.parcelado) {
      const valorPorParcela = parseFloat(formulario.valor) / formulario.numeroParcelas;
      for (let i = 0; i < formulario.numeroParcelas; i++) {
        const dataParcela = adicionarMeses(formulario.data, i);
        const novaDespesa = {
          id: Date.now() + i, // ID único para cada parcela
          descricao: `${formulario.descricao} (Parcela ${i + 1}/${formulario.numeroParcelas})`,
          valor: valorPorParcela,
          data: dataParcela,
          categoria: formulario.categoria,
          subcategoria: formulario.subcategoria,
          observacoes: formulario.observacoes,
          parcelado: formulario.parcelado,
          numeroParcelas: formulario.numeroParcelas,
          statusPagamento: 'pendente', // Status padrão para parcelas
          dataVencimento: formulario.dataVencimento ? adicionarMeses(formulario.dataVencimento, i) : '', // Data de vencimento para parcelas
          somarNoOrcamento: formulario.somarNoOrcamento
        };
        novasDespesas.push(novaDespesa);
      }
    } else {
      const novaDespesa = {
        id: Date.now(),
        descricao: formulario.descricao,
        valor: parseFloat(formulario.valor),
        data: formulario.data,
        categoria: formulario.categoria,
        subcategoria: formulario.subcategoria,
        observacoes: formulario.observacoes,
        parcelado: formulario.parcelado,
        numeroParcelas: formulario.numeroParcelas,
        statusPagamento: 'pendente', // Status padrão para despesa única
        dataVencimento: formulario.dataVencimento || '', // Data de vencimento para despesa única
        somarNoOrcamento: formulario.somarNoOrcamento
      };
      novasDespesas.push(novaDespesa);
    }

    // Usar debounce para salvamento otimizado
    debouncedSave([...despesas, ...novasDespesas]);
    resetarFormulario();
  };

  const resetarFormulario = () => {
    const defaultCategory = categorias.length > 0 ? categorias[0].nome : 'Despesas Fixas';
    const defaultSubcategories = getAvailableSubcategories(defaultCategory);
    setFormulario({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: defaultCategory,
      subcategoria:
        defaultSubcategories.length > 0 ? defaultSubcategories[0] : '',
      observacoes: '',
      parcelado: false,
      numeroParcelas: 1,
      statusPagamento: 'pendente', // Resetar status para padrão
      dataVencimento: '', // Resetar data de vencimento
      somarNoOrcamento: true // Resetar para padrão
    });
    setEditando(null);
    setMostrarFormulario(false);
    setIsFormMinimized(false);
  };

  const iniciarEdicaoInline = despesa => {
    setEditingItemId(despesa.id);
    setInlineEditForm({
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria,
      subcategoria: despesa.subcategoria,
      observacoes: despesa.observacoes, // Preencher observações
      dataVencimento: despesa.dataVencimento, // Preencher data de vencimento
      somarNoOrcamento: despesa.somarNoOrcamento !== undefined ? despesa.somarNoOrcamento : true
    });
    setMostrarFormulario(false);
    setMostrarBulkEditForm(false);
    // setEditingItemId(null); // Garante que apenas uma edição inline esteja ativa - REMOVIDO: isso desativaria a edição imediatamente
  };

  const handleInlineChange = e => {
    const { name, value } = e.target;
    setInlineEditForm(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'categoria') {
        const availableSubs = getAvailableSubcategories(value);
        newState.subcategoria =
          availableSubs.length > 0 ? availableSubs[0] : '';
      }
      return newState;
    });
  };

  const handleInlineSave = id => {
    const valorNumerico = parseFloat(inlineEditForm.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor, insira um valor válido maior que zero.');
      return;
    }
    const updatedDespesas = despesas.map(d =>
      d.id === id ? {
        ...d,
        ...inlineEditForm,
        valor: valorNumerico
      } : d
    );

    // Usar debounce para edição inline
    debouncedSave(updatedDespesas);
    setEditingItemId(null);
    setInlineEditForm({ descricao: '', valor: '', categoria: '', subcategoria: '', observacoes: '', dataVencimento: '', somarNoOrcamento: true }); // Resetar campos
  };

  const handleInlineCancel = () => {
    setEditingItemId(null);
    setInlineEditForm({ descricao: '', valor: '', categoria: '', subcategoria: '', observacoes: '', dataVencimento: '', somarNoOrcamento: true }); // Resetar campos
  };

  const excluirDespesa = id => {
    if (window.confirm('Deseja realmente excluir esta despesa?')) {
      const novasDespesas = despesas.filter(d => d.id !== id);

      // Usar salvamento imediato para exclusões (ação crítica)
      saveImmediately(novasDespesas);
      setSelectedDespesas(prev => prev.filter(dId => dId !== id));
      setEditingItemId(null);
    }
  };

  // Função para alternar o status de pagamento
  const toggleStatusPagamento = (id) => {
    const updatedDespesas = despesas.map(d =>
      d.id === id
        ? { ...d, statusPagamento: d.statusPagamento === 'pago' ? 'pendente' : 'pago' }
        : d
    );

    // Usar debounce para alteração de status
    debouncedSave(updatedDespesas);
  };

  const formatarMoeda = valor => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = data => {
    if (!data) return '';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Função para obter o tooltip da data de vencimento
  const getDueDateTooltip = (despesa) => {
    if (despesa.dataVencimento) {
      return `Vencimento: ${formatarData(despesa.dataVencimento)}`;
    }
    return 'Sem data de vencimento';
  };

  const getCorCategoria = nomeCategoria => {
    const categoria = categorias.find(cat => cat.nome === nomeCategoria);
    return categoria ? categoria.cor : '#6B7280';
  };

  /* Filtragem com filtro de ano funcionando corretamente */
  const despesasFiltradas = despesas.filter(despesa => {
    let passaNoFiltro = true;
    // Filtro por categoria
    if (filtroCategoria && despesa.categoria !== filtroCategoria) {
      passaNoFiltro = false;
    }
    // Filtro por subcategoria
    // A subcategoria só é filtrada se uma categoria também estiver selecionada,
    // ou se o filtro de subcategoria estiver ativo e a subcategoria da despesa não corresponder.
    // Com o useEffect, garantimos que filtroSubcategoria será resetado se a categoria mudar.
    if (passaNoFiltro && filtroSubcategoria) {
      // Se uma categoria está selecionada no filtro, verifica se a subcategoria pertence a ela.
      // Se não houver categoria selecionada, verifica contra todas as subcategorias.
      const subcategoriasPermitidasParaFiltro = filtroCategoria
        ? getAvailableSubcategories(filtroCategoria)
        : allSubcategories;

      if (!subcategoriasPermitidasParaFiltro.includes(despesa.subcategoria) || despesa.subcategoria !== filtroSubcategoria) {
        passaNoFiltro = false;
      }
    }

    // Filtro por status de pagamento
    if (passaNoFiltro && filtroStatus && despesa.statusPagamento !== filtroStatus) {
      passaNoFiltro = false;
    }
    // FILTRO POR MÊS E ANO (tem prioridade sobre data início/fim)
    if (passaNoFiltro && filtroMes && filtroAno) {
      const primeiroDia = new Date(`${filtroAno}-${filtroMes}-01T00:00:00-03:00`);
      const ultimoDia = new Date(primeiroDia);
      ultimoDia.setMonth(ultimoDia.getMonth() + 1);
      ultimoDia.setDate(0);
      ultimoDia.setHours(23, 59, 59, 999);
      const dataDespesa = new Date(despesa.data + 'T00:00:00-03:00');
      if (dataDespesa < primeiroDia || dataDespesa > ultimoDia) {
        passaNoFiltro = false;
      }
    } else {
      // Filtro por ano quando não há filtro de mês
      if (passaNoFiltro && filtroAno && !filtroMes) {
        const dataDespesa = new Date(despesa.data + 'T00:00:00-03:00');
        const anoDespesa = dataDespesa.getFullYear();
        if (anoDespesa !== parseInt(filtroAno)) {
          passaNoFiltro = false;
        }
      }
      // Filtros de data início e fim (quando não há filtro por mês)
      if (passaNoFiltro && filtroDataInicio && !filtroMes) {
        const dataDespesa = new Date(despesa.data + 'T00:00:00-03:00');
        const dataInicio = new Date(filtroDataInicio + 'T00:00:00-03:00');
        if (dataDespesa < dataInicio) {
          passaNoFiltro = false;
        }
      }
      if (passaNoFiltro && filtroDataFim && !filtroMes) {
        const dataDespesa = new Date(despesa.data + 'T00:00:00-03:00');
        const dataFim = new Date(filtroDataFim + 'T23:59:59-03:00');
        if (dataDespesa > dataFim) {
          passaNoFiltro = false;
        }
      }
    }
    // Filtro por descrição
    if (passaNoFiltro && filtroDescricao) {
      if (!despesa.descricao.toLowerCase().includes(filtroDescricao.toLowerCase())) {
        passaNoFiltro = false;
      }
    }
    return passaNoFiltro;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDespesas = React.useMemo(() => {
    let sortableItems = [...despesasFiltradas];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Normalização para ordenação correta
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
  }, [despesasFiltradas, sortConfig]);

  // Cálculos para os cards de resumo
  const totalDespesasFiltradas = despesasFiltradas.reduce((acc, d) => acc + d.valor, 0);
  const categoriasAtivasDespesas = [...new Set(despesasFiltradas.map(d => d.categoria))].length;
  const subcategoriasAtivasDespesas = [...new Set(despesasFiltradas.filter(d => d.subcategoria).map(d => d.subcategoria))].length;

  // Estes cálculos não são usados diretamente nos cards de resumo, mas podem ser úteis para outros gráficos ou análises.
  const despesasPorCategoriaFiltradas = categorias.map(cat => {
    const total = despesasFiltradas
      .filter(d => d.categoria === cat.nome)
      .reduce((acc, d) => acc + d.valor, 0);
    return {
      categoria: cat.nome,
      cor: cat.cor,
      total
    };
  }).filter(item => item.total > 0);
  const despesasPorSubcategoriaFiltradas = allSubcategories.map(sub => {
    const total = despesasFiltradas
      .filter(d => d.subcategoria === sub)
      .reduce((acc, d) => acc + d.valor, 0);
    return { subcategoria: sub, total };
  }).filter(item => item.total > 0);

  const limparFiltros = () => {
    setFiltroCategoria('');
    setFiltroSubcategoria('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroDescricao('');
    setFiltroMes('');
    setFiltroAno(new Date().getFullYear().toString());
    setFiltroStatus(''); // Limpar filtro de status
  };

  const handleSelectDespesa = id => {
    setSelectedDespesas(prev =>
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDespesas = isChecked => {
    if (isChecked) {
      setSelectedDespesas(despesasFiltradas.map(d => d.id));
    } else {
      setSelectedDespesas([]);
    }
  };

  const handleBulkEditChange = e => {
    const { name, value } = e.target;
    setBulkEditForm(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'categoria') {
        const availableSubs = getAvailableSubcategories(value);
        newState.subcategoria = availableSubs.length > 0 ? availableSubs[0] : '';
      }
      return newState;
    });
  };

  const handleBulkEditSubmit = e => {
    e.preventDefault();
    if (selectedDespesas.length === 0) {
      alert('Selecione ao menos uma despesa para atualizar.');
      return;
    }
    let updatedDespesas = despesas.map(despesa => {
      if (selectedDespesas.includes(despesa.id)) {
        const newDespesa = { ...despesa };
        if (bulkEditForm.descricao) {
          newDespesa.descricao = bulkEditForm.descricao;
        }
        if (bulkEditForm.categoria) {
          newDespesa.categoria = bulkEditForm.categoria;
          if (bulkEditForm.subcategoria) {
            newDespesa.subcategoria = bulkEditForm.subcategoria;
          } else {
            const availableSubs = getAvailableSubcategories(newDespesa.categoria);
            if (!availableSubs.includes(newDespesa.subcategoria)) {
              newDespesa.subcategoria = availableSubs.length > 0 ? availableSubs[0] : '';
            }
          }
        } else if (bulkEditForm.subcategoria) {
          const availableSubs = getAvailableSubcategories(newDespesa.categoria);
          if (availableSubs.includes(bulkEditForm.subcategoria)) {
            newDespesa.subcategoria = bulkEditForm.subcategoria;
          } else {
            alert(`A subcategoria '${bulkEditForm.subcategoria}' não é válida para a categoria '${newDespesa.categoria}'.`);
            return despesa;
          }
        }
        // Atualiza o status de pagamento na edição em massa
        if (bulkEditForm.statusPagamento) {
          newDespesa.statusPagamento = bulkEditForm.statusPagamento;
        }
        // Atualiza somarNoOrcamento na edição em massa
        if (bulkEditForm.somarNoOrcamento !== undefined) {
          newDespesa.somarNoOrcamento = bulkEditForm.somarNoOrcamento;
        }
        return newDespesa;
      }
      return despesa;
    });

    // Usar debounce para edição em massa
    debouncedSave(updatedDespesas);
    setSelectedDespesas([]);
    setBulkEditForm({ descricao: '', categoria: '', subcategoria: '', statusPagamento: '', somarNoOrcamento: undefined }); // Resetar status
    setMostrarBulkEditForm(false);
    alert(`${selectedDespesas.length} despesa(s) atualizada(s) com sucesso!`);
  };

  const handleMarkSelectedAsPaid = () => {
    if (selectedDespesas.length === 0) {
      alert('Selecione ao menos uma despesa.');
      return;
    }

    // Filtra apenas as despesas selecionadas que estão pendentes
    const despesasParaAtualizar = despesas.filter(d =>
      selectedDespesas.includes(d.id) && d.statusPagamento !== 'pago'
    );

    if (despesasParaAtualizar.length === 0) {
      alert('Nenhuma das despesas selecionadas está pendente.');
      return;
    }

    const updatedDespesas = despesas.map(d => {
      if (selectedDespesas.includes(d.id) && d.statusPagamento !== 'pago') {
        return { ...d, statusPagamento: 'pago' };
      }
      return d;
    });

    debouncedSave(updatedDespesas);
    setSelectedDespesas([]);
    alert(`${despesasParaAtualizar.length} despesa(s) marcada(s) como paga(s) com sucesso!`);
  };

  return (
    <div className="space-y-6 bg-transparent min-h-screen transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Despesas</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gerencie seus gastos e mantenha sua saúde financeira em dia.</p>
        </div>
        <div className="flex justify-end mb-6 gap-3">
          <EduHelpButton topic="despesas" />
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setEditando(null);
              setIsFormMinimized(false);
              setMostrarBulkEditForm(false);
              setEditingItemId(null);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Despesa
          </button>
        </div>
      </div>
      {/* NOVO POSICIONAMENTO: Formulário de Nova Despesa */}
      {
        mostrarFormulario && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-500" />
                {editando ? 'Editar Despesa' : 'Adicionar Nova Despesa'}
              </h2>
              <button
                onClick={() => setIsFormMinimized(!isFormMinimized)}
                className="text-gray-500 hover:text-gray-700"
                title={isFormMinimized ? "Expandir Formulário" : "Minimizar Formulário"}
              >
                {isFormMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
            {!isFormMinimized && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      id="descricao"
                      name="descricao"
                      value={formulario.descricao}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                      placeholder="Ex: Aluguel, Conta de Luz, Supermercado"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
                      Valor
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        id="valor"
                        name="valor"
                        value={formulario.valor}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                      Data da Despesa
                    </label>
                    <input
                      type="date"
                      id="data"
                      name="data"
                      value={formulario.data}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  {/* NOVO: Campo para Data de Vencimento */}
                  <div>
                    <label htmlFor="dataVencimento" className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Vencimento (opcional)
                    </label>
                    <input
                      type="date"
                      id="dataVencimento"
                      name="dataVencimento"
                      value={formulario.dataVencimento}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={formulario.categoria}
                      onChange={handleChange}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                      required
                    >
                      {categorias.map(cat => (
                        <option key={cat.nome} value={cat.nome}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategoria
                    </label>
                    <select
                      id="subcategoria"
                      name="subcategoria"
                      value={formulario.subcategoria}
                      onChange={handleChange}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                      required
                    >
                      {getAvailableSubcategories(formulario.categoria).map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formulario.observacoes}
                    onChange={handleChange}
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                    placeholder="Adicione detalhes ou notas importantes sobre a despesa..."
                  ></textarea>
                </div>
                <div className="flex items-center space-x-4">
                  <label htmlFor="parcelado" className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="parcelado"
                      name="parcelado"
                      checked={formulario.parcelado}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-gray-700 text-sm font-bold">Parcelar despesa</span>
                  </label>
                  {formulario.parcelado && (
                    <div className="flex-1">
                      <label htmlFor="numeroParcelas" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas
                      </label>
                      <input
                        type="number"
                        id="numeroParcelas"
                        name="numeroParcelas"
                        value={formulario.numeroParcelas}
                        onChange={handleChange}
                        min="1"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-red-500"
                        placeholder="1"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="somarNoOrcamento" className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="somarNoOrcamento"
                        name="somarNoOrcamento"
                        checked={formulario.somarNoOrcamento}
                        onChange={handleCheckboxChange}
                        className="form-checkbox h-5 w-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-gray-700 text-sm font-bold">Somar ao Orçamento e Relatórios</span>
                    </label>
                  </div>
                </div>
                {/* Exibir valor de cada parcela */}
                {formulario.parcelado && parseFloat(formulario.valor) > 0 && parseInt(formulario.numeroParcelas, 10) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        Valor de cada parcela: <span className="text-lg font-bold">{formatarMoeda(calcularValorParcela())}</span>
                      </p>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {formulario.numeroParcelas}x de {formatarMoeda(calcularValorParcela())} = {formatarMoeda(parseFloat(formulario.valor))}
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetarFormulario}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
                  >
                    {editando ? 'Salvar Edição' : 'Adicionar Despesa'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      }
      {/* Seção de Filtros */}
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
              <XCircle className="w-4 h-4" />
              Limpar Filtros
            </button>
            <button
              onClick={() => setIsFiltrosMinimized(!isFiltrosMinimized)}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={isFiltrosMinimized ? "Expandir Filtros" : "Minimizar Filtros"}
            >
              {isFiltrosMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {!isFiltrosMinimized && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filtroCategoria" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Categoria
                </label>
                <select
                  id="filtroCategoria"
                  value={filtroCategoria}
                  onChange={e => setFiltroCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(cat => (
                    <option key={cat.nome} value={cat.nome}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filtroSubcategoria" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Layers className="inline w-4 h-4 mr-1" />
                  Subcategoria
                </label>
                <select
                  id="filtroSubcategoria"
                  value={filtroSubcategoria}
                  onChange={e => setFiltroSubcategoria(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:opacity-50"
                  disabled={filtroCategoria && getAvailableSubcategories(filtroCategoria).length === 0}
                >
                  <option value="">Todas as subcategorias</option>
                  {filtroCategoria // Se uma categoria está selecionada
                    ? getAvailableSubcategories(filtroCategoria).map(sub => ( // Mostra apenas as subcategorias da categoria
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))
                    : allSubcategories.map(sub => ( // Caso contrário, mostra todas as subcategorias
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="filtroMes" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Mês
                </label>
                <select
                  id="filtroMes"
                  value={filtroMes}
                  onChange={e => setFiltroMes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                  <option value="">Selecione o mês</option>
                  {mesesDoAno.map(mes => (
                    <option key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filtroAno" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ano
                </label>
                <select
                  id="filtroAno"
                  value={filtroAno}
                  onChange={e => setFiltroAno(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                  {gerarListaAnos().map(ano => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filtroDataInicio" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  id="filtroDataInicio"
                  value={filtroDataInicio}
                  onChange={e => setFiltroDataInicio(e.target.value)}
                  disabled={!!filtroMes}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:opacity-50"
                />
                {filtroMes && (
                  <p className="text-xs text-orange-600 mt-1">
                    Desativado (filtro por mês ativo)
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="filtroDataFim" className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  id="filtroDataFim"
                  value={filtroDataFim}
                  onChange={e => setFiltroDataFim(e.target.value)}
                  disabled={!!filtroMes}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {filtroMes && (
                  <p className="text-xs text-orange-600 mt-1">
                    Desativado (filtro por mês ativo)
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="filtroDescricao" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="filtroDescricao"
                    value={filtroDescricao}
                    onChange={e => setFiltroDescricao(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  />
                </div>
              </div>
            </div>
            {/* NOVO: Filtro por Status de Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="filtroStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Status de Pagamento
                </label>
                <select
                  id="filtroStatus"
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white"
                >
                  <option value="">Todos os Status</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={limparFiltros}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition duration-150 flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards de Resumo de Despesas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Despesas</h3>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{formatarMoeda(totalDespesasFiltradas)}</p>
          <p className="text-sm text-gray-500 mt-1">{despesasFiltradas.length} despesa(s)</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Categorias</h3>
            <Tag className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{categoriasAtivasDespesas}</p>
          <p className="text-sm text-gray-500 mt-1">categorias ativas</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Subcategorias</h3>
            <Layers className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{subcategoriasAtivasDespesas}</p>
          <p className="text-sm text-gray-500 mt-1">subcategorias ativas</p>
        </div>
      </div>

      {/* Formulário de Edição em Massa (Bulk Edit) */}
      {
        selectedDespesas.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-orange-600" />
                Editar Despesas Selecionadas ({selectedDespesas.length})
              </h2>
              <button
                onClick={() => setMostrarBulkEditForm(!mostrarBulkEditForm)}
                className="text-gray-500 hover:text-gray-700"
                title={mostrarBulkEditForm ? "Minimizar Edição em Massa" : "Expandir Edição em Massa"}
              >
                {mostrarBulkEditForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Ações Rápidas */}
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-sm font-semibold text-orange-800 w-full mb-1">Ações Rápidas:</span>
              <button
                onClick={handleMarkSelectedAsPaid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar Selecionados como Pago
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Deseja realmente excluir as ${selectedDespesas.length} despesas selecionadas?`)) {
                    const novasDespesas = despesas.filter(d => !selectedDespesas.includes(d.id));
                    saveImmediately(novasDespesas);
                    setSelectedDespesas([]);
                    alert(`${selectedDespesas.length} despesas excluídas com sucesso!`);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Selecionados
              </button>
            </div>
            {mostrarBulkEditForm && (
              <form onSubmit={handleBulkEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="bulkDescricao" className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      id="bulkDescricao"
                      name="descricao"
                      value={bulkEditForm.descricao}
                      onChange={handleBulkEditChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500"
                      placeholder="Deixe em branco para não alterar"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulkCategoria" className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Categoria (opcional)
                    </label>
                    <select
                      id="bulkCategoria"
                      name="categoria"
                      value={bulkEditForm.categoria}
                      onChange={handleBulkEditChange}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Não alterar</option>
                      {categorias.map(cat => (
                        <option key={cat.nome} value={cat.nome}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bulkSubcategoria" className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Subcategoria (opcional)
                    </label>
                    <select
                      id="bulkSubcategoria"
                      name="subcategoria"
                      value={bulkEditForm.subcategoria}
                      onChange={handleBulkEditChange}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500"
                      disabled={!bulkEditForm.categoria && !selectedDespesas.some(id => getAvailableSubcategories(despesas.find(d => d.id === id)?.categoria).length > 0)}
                    >
                      <option value="">Não alterar</option>
                      {bulkEditForm.categoria
                        ? getAvailableSubcategories(bulkEditForm.categoria).map(sub => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))
                        : allSubcategories.map(sub => ( // Permite selecionar qualquer subcategoria se a categoria não for alterada
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                  {/* Campo para edição em massa do status */}
                  <div>
                    <label htmlFor="bulkStatusPagamento" className="block text-sm font-medium text-gray-700 mb-1">
                      Novo Status (opcional)
                    </label>
                    <select
                      id="bulkStatusPagamento"
                      name="statusPagamento"
                      value={bulkEditForm.statusPagamento}
                      onChange={handleBulkEditChange}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Não alterar</option>
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bulkSomarNoOrcamento" className="block text-sm font-medium text-gray-700 mb-1">
                      Somar ao Orçamento (opcional)
                    </label>
                    <select
                      id="bulkSomarNoOrcamento"
                      name="somarNoOrcamento"
                      value={bulkEditForm.somarNoOrcamento === undefined ? '' : bulkEditForm.somarNoOrcamento.toString()}
                      onChange={(e) => {
                        const val = e.target.value === '' ? undefined : e.target.value === 'true';
                        setBulkEditForm(prev => ({ ...prev, somarNoOrcamento: val }));
                      }}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Não alterar</option>
                      <option value="true">Sim</option>
                      <option value="false">Não (Apenas DRE)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDespesas([]);
                      setBulkEditForm({ descricao: '', categoria: '', subcategoria: '', statusPagamento: '' });
                      setMostrarBulkEditForm(false);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
                  >
                    Aplicar Edição em Massa
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      }
      {/* Lista de Despesas */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-green-600" />
            Lista de Despesas
          </h2>
          <button
            onClick={() => setIsListaMinimized(!isListaMinimized)}
            className="text-gray-500 hover:text-gray-700"
            title={isListaMinimized ? "Expandir Lista" : "Minimizar Lista"}
          >
            {isListaMinimized ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
        {!isListaMinimized && (
          <>
            {despesasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma despesa encontrada</p>
                <p className="text-gray-400 text-sm mt-2">
                  Adicione uma nova despesa ou ajuste os filtros
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedDespesas.length === despesasFiltradas.length && despesasFiltradas.length > 0}
                          onChange={e => handleSelectAllDespesas(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
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
                      {/* Coluna para Status */}
                      <th
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() => handleSort('statusPagamento')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Status
                          {sortConfig.key === 'statusPagamento' && (
                            sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                          {sortConfig.key !== 'statusPagamento' && <ArrowUpDown className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDespesas.map(despesa => (
                      <tr key={despesa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDespesas.includes(despesa.id)}
                            onChange={() => handleSelectDespesa(despesa.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(despesa.data)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900" title={getDueDateTooltip(despesa)}> {/* Tooltip de vencimento */}
                          {editingItemId === despesa.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                name="descricao"
                                value={inlineEditForm.descricao}
                                onChange={handleInlineChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />
                              {/* Campo de Observações na Edição Inline */}
                              <textarea
                                name="observacoes"
                                value={inlineEditForm.observacoes}
                                onChange={handleInlineChange}
                                rows="2"
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                                placeholder="Observações..."
                              />
                              {/* Campo de Data de Vencimento na Edição Inline */}
                              <input
                                type="date"
                                name="dataVencimento"
                                value={inlineEditForm.dataVencimento}
                                onChange={handleInlineChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                              />
                              {/* Campo de Somar ao Orçamento na Edição Inline */}
                              <label className="flex items-center cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  name="somarNoOrcamento"
                                  checked={inlineEditForm.somarNoOrcamento}
                                  onChange={(e) => setInlineEditForm(prev => ({ ...prev, somarNoOrcamento: e.target.checked }))}
                                  className="form-checkbox h-3 w-3 text-red-600 rounded focus:ring-red-500 mr-1"
                                />
                                <span className="text-gray-700 font-bold">Somar ao Orçamento</span>
                              </label>
                            </div>
                          ) : (
                            <>
                              <p className="font-medium">{despesa.descricao}</p>
                              {despesa.observacoes && (
                                <p className="text-xs text-gray-500 italic mt-1">Obs: {despesa.observacoes}</p>
                              )}
                              {despesa.dataVencimento && (
                                <p className="text-xs text-red-500 mt-1">Vencimento: {formatarData(despesa.dataVencimento)}</p>
                              )}
                              {despesa.somarNoOrcamento === false && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase border border-gray-200">
                                  Apenas DRE
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingItemId === despesa.id ? (
                            <select
                              name="categoria"
                              value={inlineEditForm.categoria}
                              onChange={handleInlineChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              {categorias.map(cat => (
                                <option key={cat.nome} value={cat.nome}>
                                  {cat.nome}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: getCorCategoria(despesa.categoria) }}
                            >
                              {despesa.categoria}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingItemId === despesa.id ? (
                            <select
                              name="subcategoria"
                              value={inlineEditForm.subcategoria}
                              onChange={handleInlineChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              {getAvailableSubcategories(inlineEditForm.categoria).map(sub => (
                                <option key={sub} value={sub}>
                                  {sub}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                              {despesa.subcategoria}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                          {editingItemId === despesa.id ? (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">R$</span>
                              <input
                                type="number"
                                name="valor"
                                value={inlineEditForm.valor}
                                onChange={handleInlineChange}
                                step="0.01"
                                min="0.01"
                                className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
                                placeholder="0.00"
                              />
                            </div>
                          ) : (
                            formatarMoeda(despesa.valor)
                          )}
                        </td>
                        {/* Célula para o Status de Pagamento */}
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            onClick={() => toggleStatusPagamento(despesa.id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ease-in-out
                              ${despesa.statusPagamento === 'pago'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                            title={despesa.statusPagamento === 'pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                          >
                            {despesa.statusPagamento === 'pago' ? (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            ) : (
                              <AlertCircle className="w-4 h-4 mr-1" />
                            )}
                            {despesa.statusPagamento === 'pago' ? 'Pago' : 'Pendente'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          {editingItemId === despesa.id ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleInlineSave(despesa.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Salvar"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleInlineCancel}
                                className="text-gray-600 hover:text-gray-900"
                                title="Cancelar"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => iniciarEdicaoInline(despesa)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => excluirDespesa(despesa.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>


      < SaveIndicator
        isSaving={isSaving}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
      />
    </div >
  );
};

export default Despesas;
