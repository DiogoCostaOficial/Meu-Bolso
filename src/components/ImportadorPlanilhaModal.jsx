import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Filter,
  Check,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  Settings2,
  Calendar,
  Sparkles,
  HelpCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Undo2
} from 'lucide-react';
import api from '../services/api';

// Paleta harmoniosa para novas categorias absorvidas (respeita o Purple Ban)
const PALETA_CORES = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#06B6D4',
  '#14B8A6', '#F97316', '#64748B', '#0EA5E9', '#84CC16',
  '#EAB308', '#EC4899', '#059669', '#2563EB', '#D97706'
];

const SNAPSHOT_STORAGE_KEY = 'MB_ULTIMA_IMPORTACAO_SNAPSHOT';

/**
 * Converte qualquer representação de data (número serial Excel, DD/MM/AAAA, YYYY-MM-DD, Date) para YYYY-MM-DD
 */
function normalizarData(valor) {
  if (!valor) {
    return new Date().toISOString().slice(0, 10);
  }
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    const y = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    const d = String(valor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof valor === 'number') {
    try {
      const ms = Math.round((valor - 25569) * 86400 * 1000);
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // fallback
    }
  }

  const str = String(valor).trim();
  const matchBR = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/);
  if (matchBR) {
    const dia = matchBR[1].padStart(2, '0');
    const mes = matchBR[2].padStart(2, '0');
    let ano = matchBR[3];
    if (ano.length === 2) {
      ano = (parseInt(ano, 10) > 50 ? '19' : '20') + ano;
    }
    return `${ano}-${mes}-${dia}`;
  }

  const matchISO = str.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
  if (matchISO) {
    return `${matchISO[1]}-${matchISO[2].padStart(2, '0')}-${matchISO[3].padStart(2, '0')}`;
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Converte representações de valor numérico/brasileiro para float e detecta sinal negativo
 */
function normalizarValor(valor) {
  if (typeof valor === 'number') {
    return {
      valorAbsoluto: Math.abs(valor),
      eraNegativo: valor < 0
    };
  }
  if (!valor) {
    return { valorAbsoluto: 0, eraNegativo: false };
  }

  const str = String(valor).trim();
  const eraNegativo = str.includes('-') || (str.startsWith('(') && str.endsWith(')'));

  let limpo = str.replace(/[R$\s\(\)]/gi, '').replace('-', '');

  if (limpo.includes(',') && limpo.includes('.')) {
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (limpo.includes(',')) {
    limpo = limpo.replace(',', '.');
  }

  const num = parseFloat(limpo) || 0;
  return {
    valorAbsoluto: Math.abs(num),
    eraNegativo
  };
}

/**
 * Normaliza strings para busca/matching de cabeçalho
 */
function normalizarTexto(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Detecta se uma coluna é do tipo Tipo/Natureza/Operação
 */
function inferirTipoPorTexto(texto, eraNegativo, tipoPadrao = 'auto') {
  if (eraNegativo) return 'despesa';
  if (!texto) {
    if (tipoPadrao === 'receita') return 'receita';
    return 'despesa';
  }

  const norm = normalizarTexto(texto);
  if (
    norm.includes('receita') ||
    norm.includes('entrada') ||
    norm.includes('credito') ||
    norm.includes('salario') ||
    norm === 'c' ||
    norm === '+' ||
    norm.includes('rendimento')
  ) {
    return 'receita';
  }

  if (
    norm.includes('despesa') ||
    norm.includes('saida') ||
    norm.includes('debito') ||
    norm.includes('gasto') ||
    norm.includes('pagamento') ||
    norm === 'd' ||
    norm === '-'
  ) {
    return 'despesa';
  }

  if (tipoPadrao === 'receita') return 'receita';
  return 'despesa';
}

const MESES_NOMES_SET = new Set([
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]);

/**
 * Detecta se a aba possui múltiplos blocos lado a lado (ex: "Fluxo de Caixa" com Receitas, Despesas Essenciais, Lazer e Investimentos)
 */
function detectarEstruturaMultiBloco(jsonData) {
  if (!Array.isArray(jsonData) || jsonData.length < 2) return null;

  for (let r = 0; r < Math.min(jsonData.length, 40); r++) {
    const row = jsonData[r];
    if (!Array.isArray(row)) continue;

    const blocos = [];
    for (let c = 0; c < row.length; c++) {
      const cellNorm = normalizarTexto(row[c]);
      if (cellNorm === 'data' || cellNorm === 'dt') {
        let colCategoria = -1;
        let colMes = -1;
        let colDescricao = -1;
        let colValor = -1;

        for (let k = c + 1; k <= Math.min(c + 6, row.length - 1); k++) {
          const kNorm = normalizarTexto(row[k]);
          if (kNorm === 'data' || kNorm === 'dt') break;
          if (colCategoria === -1 && (kNorm.includes('categoria') || kNorm.includes('grupo') || kNorm.includes('titulo'))) {
            colCategoria = k;
          } else if (colMes === -1 && (kNorm === 'mes' || kNorm.includes('mes'))) {
            colMes = k;
          } else if (colDescricao === -1 && (kNorm.includes('descricao') || kNorm.includes('detalhe') || kNorm.includes('historico') || kNorm.includes('obs'))) {
            colDescricao = k;
          } else if (colValor === -1 && (kNorm.includes('valor') || kNorm.includes('quantia') || kNorm.includes('total'))) {
            colValor = k;
          }
        }

        if (colValor !== -1 && (colCategoria !== -1 || colDescricao !== -1)) {
          let tituloGrupo = '';
          if (r > 0 && Array.isArray(jsonData[r - 1])) {
            for (let g = c; g <= colValor; g++) {
              const gVal = String(jsonData[r - 1][g] || '').trim();
              if (gVal) {
                tituloGrupo = gVal;
                break;
              }
            }
          }

          const normGrupo = normalizarTexto(tituloGrupo);
          const tipo = (
            normGrupo.includes('receita') ||
            normGrupo.includes('entrada') ||
            normGrupo.includes('renda')
          ) ? 'receita' : 'despesa';

          blocos.push({
            colData: c,
            colCategoria,
            colMes,
            colDescricao,
            colValor,
            tituloGrupo: tituloGrupo || (tipo === 'receita' ? 'Receitas' : 'Despesas'),
            tipo
          });

          c = colValor;
        }
      }
    }

    if (blocos.length >= 2) {
      // Detecta o ano base predominante na planilha (ex: 2025)
      const contagemAnos = {};
      for (let i = r + 1; i < jsonData.length; i++) {
        const linha = jsonData[i];
        if (!Array.isArray(linha)) continue;
        blocos.forEach(b => {
          const valData = linha[b.colData];
          if (!valData) return;
          const dtIso = normalizarData(valData);
          const ano = parseInt(dtIso.slice(0, 4), 10);
          if (ano >= 2000 && ano <= 2100) {
            contagemAnos[ano] = (contagemAnos[ano] || 0) + 1;
          }
        });
      }

      let anoBase = new Date().getFullYear();
      let maxCount = 0;
      Object.entries(contagemAnos).forEach(([ano, count]) => {
        if (count > maxCount) {
          maxCount = count;
          anoBase = parseInt(ano, 10);
        }
      });

      return {
        headerRowIdx: r,
        blocos,
        anoBase
      };
    }
  }

  return null;
}

/**
 * Extrai todos os lançamentos (inclusive os de valor zero, marcados com isValorZero) de uma planilha Multi-Bloco
 */
function extrairItensMultiBloco(jsonData, multiBlocoInfo, presetNum, arquivoNome) {
  const { headerRowIdx, blocos, anoBase } = multiBlocoInfo;
  const itens = [];
  let seq = 0;

  for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
    const linha = jsonData[r];
    if (!Array.isArray(linha)) continue;

    // Verifica condição de parada caso haja tabelas de resumo no rodapé (ex: CSV unificado)
    const textoLinhaNorm = linha.map(c => normalizarTexto(c)).join(' ');
    if (
      textoLinhaNorm.includes('acompanhamento mensal') ||
      textoLinhaNorm.includes('acompanhamento anual') ||
      textoLinhaNorm.includes('nao edite informacoes dessa tabela') ||
      textoLinhaNorm.includes('despesas totais (1 + 2 + 3 + 4)') ||
      textoLinhaNorm.includes('1o trimestre')
    ) {
      break;
    }

    blocos.forEach((bloco) => {
      const rawData = bloco.colData >= 0 ? linha[bloco.colData] : '';
      const rawCat = bloco.colCategoria >= 0 ? linha[bloco.colCategoria] : '';
      const rawMes = bloco.colMes >= 0 ? linha[bloco.colMes] : '';
      const rawDesc = bloco.colDescricao >= 0 ? linha[bloco.colDescricao] : '';
      const rawVal = bloco.colValor >= 0 ? linha[bloco.colValor] : '';

      const catStr = String(rawCat || '').trim();
      const descStr = String(rawDesc || '').trim();
      const mesStr = String(rawMes || '').trim();

      // Ignora células divisórias de mês (ex: "JANEIRO", "FEVEREIRO") ou linhas totalmente vazias no bloco
      if (!catStr && !descStr) return;
      if (MESES_NOMES_SET.has(normalizarTexto(catStr))) return;
      if (!catStr && MESES_NOMES_SET.has(normalizarTexto(mesStr))) return;

      const { valorAbsoluto } = normalizarValor(rawVal);

      // Trata placeholders de template ("Alterar nome do campo para personalizar #1")
      let tituloCat = catStr;
      if (normalizarTexto(tituloCat).startsWith('alterar nome do campo para personalizar')) {
        tituloCat = descStr || tituloCat.replace(/alterar nome do campo para personalizar\s*/i, 'Personalizado ');
      }

      // Monta descrição amigável combinando o título (Categoria da planilha) + Descrição (se houver)
      let descFinal = '';
      if (tituloCat && descStr && normalizarTexto(tituloCat) !== normalizarTexto(descStr)) {
        descFinal = `${tituloCat} - ${descStr}`;
      } else {
        descFinal = tituloCat || descStr || `Item #${seq + 1}`;
      }

      // Calcula a data respeitando a coluna Mês (1..12) quando presente ou quando a Data está em branco
      const mesNum = parseInt(mesStr, 10);
      const temDataPreenchida = rawData !== '' && rawData !== null && rawData !== undefined && String(rawData).trim() !== '';
      let dataFormatada = temDataPreenchida ? normalizarData(rawData) : '';

      if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
        const mesPadded = String(mesNum).padStart(2, '0');
        let diaPadded = '05';
        if (temDataPreenchida && /^\d{4}-\d{2}-\d{2}$/.test(dataFormatada)) {
          const diaExtraido = parseInt(dataFormatada.slice(8, 10), 10);
          const maxDiasNoMes = new Date(anoBase, mesNum, 0).getDate();
          const diaValido = Math.min(Math.max(1, diaExtraido || 5), maxDiasNoMes);
          diaPadded = String(diaValido).padStart(2, '0');
        }
        dataFormatada = `${anoBase}-${mesPadded}-${diaPadded}`;
      } else if (!dataFormatada) {
        dataFormatada = `${anoBase}-01-05`;
      }

      // Define Categoria e Subcategoria para o sistema
      let catSistema = 'Outros';
      let subcatSistema = '';

      if (presetNum === 2) {
        catSistema = bloco.tipo === 'receita' ? 'Receita Principal' : 'Outros';
      } else {
        catSistema = tituloCat || bloco.tituloGrupo || (bloco.tipo === 'receita' ? 'Receita Principal' : 'Outros');
        subcatSistema = bloco.tituloGrupo || '';
      }

      seq++;
      itens.push({
        id: `imp-${Date.now()}-${seq}-${Math.random().toString(36).substr(2, 4)}`,
        data: dataFormatada,
        descricao: descFinal,
        valor: valorAbsoluto,
        isValorZero: valorAbsoluto === 0,
        categoria: catSistema,
        subcategoria: subcatSistema,
        tipo: bloco.tipo,
        observacoes: `Importado de planilha (${bloco.tituloGrupo}): ${arquivoNome || 'Planilha'}`,
        statusPagamento: 'pago',
        somarNoOrcamento: true,
        recorrente: false
      });
    });
  }

  return itens;
}

const ImportadorPlanilhaModal = ({
  isOpen,
  onClose,
  onImportSuccess,
  categoriasExistentes = [],
  tipoPadrao = 'auto' // 'auto' | 'despesa' | 'receita'
}) => {
  // Passos: 1: 'upload', 2: 'presets', 3: 'preview', 4: 'confirm'
  const [etapa, setEtapa] = useState(1);
  const [arquivoNome, setArquivoNome] = useState('');
  const [planilhasNomes, setPlanilhasNomes] = useState([]);
  const [planilhaSelecionada, setPlanilhaSelecionada] = useState('');
  const [rawWorkbook, setRawWorkbook] = useState(null);
  const [rawJsonData, setRawJsonData] = useState([]);
  const [multiBlocoInfo, setMultiBlocoInfo] = useState(null);
  const [colunasDisponiveis, setColunasDisponiveis] = useState([]);
  const [linhasBrutas, setLinhasBrutas] = useState([]);

  // Pergunta: "Deseja importar os títulos que estão com valor zero? Sim ou Não?" (Padrão: false = Não)
  const [importarValoresZero, setImportarValoresZero] = useState(false);
  const [todosItensGerados, setTodosItensGerados] = useState([]);

  // Modo de Leitura Escolhido (1: Automático, 2: Essencial, 3: Manual)
  const [modoLeitura, setModoLeitura] = useState(1);

  // Mapeamento de Colunas
  const [mapeamento, setMapeamento] = useState({
    colData: '',
    colDescricao: '',
    colValor: '',
    colCategoria: '',
    colSubcategoria: '',
    colTipo: ''
  });

  // Pergunta Global de Data Única: 'dataLancamento' | 'dataCompra' | 'dataVencimento'
  const [campoDataDestino, setCampoDataDestino] = useState('dataLancamento');
  const [detectouApenasUmaData, setDetectouApenasUmaData] = useState(true);

  // Linhas Processadas para o Preview Interativo
  const [itensPreview, setItensPreview] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState(new Set());
  const [abaPreview, setAbaPreview] = useState('todos'); // 'todos' | 'despesas' | 'receitas'
  const [buscaPreview, setBuscaPreview] = useState('');

  // Modo de Importação Final: 'somar' (append) | 'substituir' (overwrite)
  const [modoImportacao, setModoImportacao] = useState('somar');

  // Estados de Backup para Rollback (Desfazer Importação e testar outro modelo)
  const [backupAntesImportacao, setBackupAntesImportacao] = useState(null);
  const [temSnapshotSalvo, setTemSnapshotSalvo] = useState(false);

  // Estados de Carregamento e Mensagens
  const [isProcessando, setIsProcessando] = useState(false);
  const [isSalvando, setIsSalvando] = useState(false);
  const [isDesfazendo, setIsDesfazendo] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [alertaInfo, setAlertaInfo] = useState(null);

  const fileInputRef = useRef(null);

  // Verifica se há snapshot de importação anterior no sessionStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const salvo = sessionStorage.getItem(SNAPSHOT_STORAGE_KEY);
        if (salvo) {
          const parsed = JSON.parse(salvo);
          if (parsed && (parsed.receitas || parsed.despesas)) {
            setBackupAntesImportacao(parsed);
            setTemSnapshotSalvo(true);
          }
        }
      } catch {
        // silencioso
      }
    }
  }, [isOpen]);

  // Reset geral ao fechar ou reabrir
  const handleFechar = () => {
    setEtapa(1);
    setArquivoNome('');
    setPlanilhasNomes([]);
    setPlanilhaSelecionada('');
    setRawWorkbook(null);
    setRawJsonData([]);
    setMultiBlocoInfo(null);
    setColunasDisponiveis([]);
    setLinhasBrutas([]);
    setTodosItensGerados([]);
    setImportarValoresZero(false);
    setItensPreview([]);
    setItensSelecionados(new Set());
    setErro(null);
    setSucesso(null);
    setAlertaInfo(null);
    onClose();
  };

  // Processa o arquivo selecionado
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processarArquivo(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processarArquivo(file);
  };

  const processarArquivo = async (file) => {
    setErro(null);
    setAlertaInfo(null);
    setIsProcessando(true);
    setArquivoNome(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Nenhuma planilha encontrada no arquivo.');
      }

      setRawWorkbook(workbook);
      setPlanilhasNomes(workbook.SheetNames);

      // Prioriza automaticamente abas de Fluxo de Caixa / Lançamentos quando existirem múltiplas abas
      const abaPreferencial = workbook.SheetNames.find(nome => {
        const n = normalizarTexto(nome);
        return (
          n.includes('fluxo de caixa') ||
          n.includes('fluxo') ||
          n.includes('lancamento') ||
          n.includes('transac') ||
          n.includes('extrato') ||
          n.includes('moviment')
        );
      }) || workbook.SheetNames[0];

      setPlanilhaSelecionada(abaPreferencial);

      carregarAba(workbook, abaPreferencial);
    } catch (err) {
      console.error('Erro ao ler planilha:', err);
      setErro(err.message || 'Erro ao processar arquivo. Verifique o formato (.xlsx, .xls ou .csv).');
      setIsProcessando(false);
    }
  };

  // Carrega a aba especificada do workbook
  const carregarAba = (workbook, nomeAba) => {
    const sheet = workbook.Sheets[nomeAba];
    if (!sheet) {
      setErro('Aba não encontrada.');
      setIsProcessando(false);
      return;
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (!jsonData || jsonData.length === 0) {
      setErro('A planilha selecionada está vazia.');
      setIsProcessando(false);
      return;
    }

    setRawJsonData(jsonData);

    // Verifica se é uma planilha com múltiplos blocos lado a lado (ex: Receitas | Despesas Essenciais | Lazer | Investimentos)
    const detectadoMulti = detectarEstruturaMultiBloco(jsonData);
    setMultiBlocoInfo(detectadoMulti);

    let cabecalhoIndex = detectadoMulti ? detectadoMulti.headerRowIdx : 0;
    if (!detectadoMulti) {
      for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
        const linha = jsonData[i];
        if (Array.isArray(linha) && linha.filter(cell => String(cell).trim() !== '').length >= 2) {
          cabecalhoIndex = i;
          break;
        }
      }
    }

    const headers = (jsonData[cabecalhoIndex] || []).map((h, idx) => {
      const val = String(h || '').trim();
      return val || `Coluna ${idx + 1}`;
    });

    const rows = jsonData.slice(cabecalhoIndex + 1).filter(r => {
      if (!Array.isArray(r)) return false;
      return r.some(cell => String(cell).trim() !== '');
    });

    setColunasDisponiveis(headers);
    setLinhasBrutas(rows);

    const mapeado = autoDetectarColunas(headers);
    setMapeamento(mapeado);

    if (detectadoMulti) {
      setDetectouApenasUmaData(true);
    } else {
      const colunasDeData = headers.filter(h => {
        const norm = normalizarTexto(h);
        return norm.includes('data') || norm.includes('dt') || norm.includes('periodo') || norm.includes('vencimento');
      });
      setDetectouApenasUmaData(colunasDeData.length <= 1);
    }

    setIsProcessando(false);
    setEtapa(2);
  };

  // Detecção inteligente por palavras-chave
  const autoDetectarColunas = (headers) => {
    let colData = '';
    let colDescricao = '';
    let colValor = '';
    let colCategoria = '';
    let colSubcategoria = '';
    let colTipo = '';

    headers.forEach(h => {
      const norm = normalizarTexto(h);

      if (!colData && (norm.includes('data') || norm.includes('dt') || norm.includes('periodo') || norm.includes('date') || norm.includes('vencimento') || norm.includes('lancamento'))) {
        colData = h;
      }

      if (!colDescricao && (norm.includes('descricao') || norm.includes('historico') || norm.includes('detalhe') || norm.includes('estabelecimento') || norm.includes('titulo') || norm.includes('lancamento') || norm.includes('item') || norm.includes('nome'))) {
        colDescricao = h;
      }

      if (!colValor && (norm.includes('valor') || norm.includes('quantia') || norm.includes('preco') || norm.includes('amount') || norm.includes('total') || norm.includes('saldo'))) {
        colValor = h;
      }

      if (!colCategoria && (norm.includes('categoria') || norm.includes('grupo') || norm.includes('classificacao') || norm.includes('departamento'))) {
        colCategoria = h;
      }

      if (!colSubcategoria && (norm.includes('subcategoria') || norm.includes('sub-categoria') || norm.includes('sub_categoria'))) {
        colSubcategoria = h;
      }

      if (!colTipo && (norm.includes('tipo') || norm.includes('natureza') || norm.includes('operacao') || norm.includes('d/c') || norm.includes('credito/debito') || norm.includes('entrada/saida'))) {
        colTipo = h;
      }
    });

    if (!colDescricao && headers.length > 0) {
      colDescricao = headers.find(h => h !== colData && h !== colValor) || headers[0];
    }
    if (!colValor && headers.length > 1) {
      colValor = headers.find(h => h !== colData && h !== colDescricao) || headers[1];
    }

    return { colData, colDescricao, colValor, colCategoria, colSubcategoria, colTipo };
  };

  // Aplica o Preset e gera os itens para o preview
  const aplicarPresetEGerarPreview = (presetNum, mapConfig = mapeamento, incluirZerosOverride = importarValoresZero) => {
    setModoLeitura(presetNum);
    setIsProcessando(true);
    setErro(null);

    try {
      let todosExtraidos = [];

      // Se a planilha possui múltiplos blocos lado a lado (Fluxo de Caixa) e estamos no Modelo 1 ou 2
      if (multiBlocoInfo && presetNum !== 3) {
        todosExtraidos = extrairItensMultiBloco(rawJsonData, multiBlocoInfo, presetNum, arquivoNome);
      } else {
        const indexMap = {
          data: colunasDisponiveis.indexOf(mapConfig.colData),
          descricao: colunasDisponiveis.indexOf(mapConfig.colDescricao),
          valor: colunasDisponiveis.indexOf(mapConfig.colValor),
          categoria: colunasDisponiveis.indexOf(mapConfig.colCategoria),
          subcategoria: colunasDisponiveis.indexOf(mapConfig.colSubcategoria),
          tipo: colunasDisponiveis.indexOf(mapConfig.colTipo)
        };

        linhasBrutas.forEach((linha, idx) => {
          const textoLinhaNorm = linha.map(c => normalizarTexto(c)).join(' ');
          if (
            textoLinhaNorm.includes('nao edite informacoes dessa tabela') ||
            textoLinhaNorm.includes('despesas totais (1 + 2 + 3 + 4)')
          ) {
            return;
          }

          const rawData = indexMap.data >= 0 ? linha[indexMap.data] : '';
          const rawDesc = indexMap.descricao >= 0 ? linha[indexMap.descricao] : '';
          const rawVal = indexMap.valor >= 0 ? linha[indexMap.valor] : '';
          const rawCatCol = indexMap.categoria >= 0 ? linha[indexMap.categoria] : '';
          const rawCat = presetNum === 2 ? 'Outros' : (rawCatCol || 'Outros');
          const rawSubcat = presetNum === 2 ? '' : (indexMap.subcategoria >= 0 ? linha[indexMap.subcategoria] : '');
          const rawTipo = presetNum === 2 ? '' : (indexMap.tipo >= 0 ? linha[indexMap.tipo] : '');

          const descLimpa = String(rawDesc || '').trim();
          const catColLimpa = String(rawCatCol || '').trim();
          const { valorAbsoluto, eraNegativo } = normalizarValor(rawVal);

          // Ignora linhas totalmente em branco ou cabeçalhos divisores de mês sem valor
          if (!descLimpa && !catColLimpa && valorAbsoluto === 0) return;
          if (MESES_NOMES_SET.has(normalizarTexto(descLimpa)) && valorAbsoluto === 0) return;

          const descNormalizada = descLimpa || catColLimpa || `Item da Planilha #${idx + 1}`;
          const dataFormatada = normalizarData(rawData);
          const tipoFinal = inferirTipoPorTexto(rawTipo, eraNegativo, tipoPadrao);

          let catFinal = String(rawCat || '').trim();
          if (!catFinal || catFinal === 'undefined' || catFinal === 'null') {
            catFinal = tipoFinal === 'receita' ? 'Receita Principal' : 'Outros';
          }

          todosExtraidos.push({
            id: `imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            data: dataFormatada,
            descricao: descNormalizada,
            valor: valorAbsoluto,
            isValorZero: valorAbsoluto === 0,
            categoria: catFinal,
            subcategoria: String(rawSubcat || '').trim(),
            tipo: tipoFinal,
            observacoes: `Importado de planilha: ${arquivoNome || 'Planilha'}`,
            statusPagamento: 'pago',
            somarNoOrcamento: true,
            recorrente: false
          });
        });
      }

      setTodosItensGerados(todosExtraidos);

      const itensVisiveis = incluirZerosOverride
        ? todosExtraidos
        : todosExtraidos.filter(item => (parseFloat(item.valor) || 0) > 0);

      if (itensVisiveis.length === 0 && todosExtraidos.length === 0) {
        throw new Error('Nenhum registro válido foi encontrado com a configuração selecionada.');
      }

      setItensPreview(itensVisiveis);
      setItensSelecionados(new Set(itensVisiveis.map(i => i.id)));
      setEtapa(3);
    } catch (err) {
      console.error(err);
      setErro(err.message || 'Erro ao processar as linhas da planilha.');
    } finally {
      setIsProcessando(false);
    }
  };

  // Alterna a opção "Deseja importar os títulos que estão com valor zero? (Sim / Não)" tanto na Etapa 2 quanto na Etapa 3
  const handleAlternarImportarValoresZero = (novoValor) => {
    setImportarValoresZero(novoValor);
    if (etapa === 3 && todosItensGerados.length > 0) {
      if (novoValor) {
        // Inclui os itens de valor zero que ainda não estavam no preview
        const idsAtuais = new Set(itensPreview.map(i => i.id));
        const zerosParaAdicionar = todosItensGerados.filter(
          i => (parseFloat(i.valor) || 0) === 0 && !idsAtuais.has(i.id)
        );
        const novaLista = [...itensPreview, ...zerosParaAdicionar];
        setItensPreview(novaLista);
        setItensSelecionados(prev => {
          const next = new Set(prev);
          zerosParaAdicionar.forEach(z => next.add(z.id));
          return next;
        });
      } else {
        // Remove os itens com valor zero do preview e da seleção
        const semZeros = itensPreview.filter(i => (parseFloat(i.valor) || 0) > 0);
        const idsSemZeros = new Set(semZeros.map(i => i.id));
        setItensPreview(semZeros);
        setItensSelecionados(prev => {
          const next = new Set();
          prev.forEach(id => {
            if (idsSemZeros.has(id)) next.add(id);
          });
          return next;
        });
      }
    }
  };

  // Quantidade de títulos com valor zero detectados na aba atual
  const resumoZerosAba = useMemo(() => {
    if (todosItensGerados.length > 0) {
      const zeros = todosItensGerados.filter(i => (parseFloat(i.valor) || 0) === 0).length;
      const comValor = todosItensGerados.length - zeros;
      return { zeros, comValor, total: todosItensGerados.length };
    }
    if (multiBlocoInfo && rawJsonData.length > 0) {
      const simulado = extrairItensMultiBloco(rawJsonData, multiBlocoInfo, 1, arquivoNome);
      const zeros = simulado.filter(i => (parseFloat(i.valor) || 0) === 0).length;
      return { zeros, comValor: simulado.length - zeros, total: simulado.length };
    }
    if (linhasBrutas.length > 0) {
      const idxVal = colunasDisponiveis.indexOf(mapeamento.colValor);
      const idxDesc = colunasDisponiveis.indexOf(mapeamento.colDescricao);
      let zeros = 0;
      let comValor = 0;
      linhasBrutas.forEach(l => {
        const rawVal = idxVal >= 0 ? l[idxVal] : '';
        const rawDesc = idxDesc >= 0 ? String(l[idxDesc] || '').trim() : '';
        const { valorAbsoluto } = normalizarValor(rawVal);
        if (valorAbsoluto > 0) comValor++;
        else if (rawDesc) zeros++;
      });
      return { zeros, comValor, total: zeros + comValor };
    }
    return { zeros: 0, comValor: 0, total: 0 };
  }, [todosItensGerados, multiBlocoInfo, rawJsonData, linhasBrutas, colunasDisponiveis, mapeamento, arquivoNome]);

  // Alterna diretamente entre os 3 modelos mesmo dentro da Etapa 3 (Preview)
  const alternarModeloNoPreview = (novoModelo) => {
    aplicarPresetEGerarPreview(novoModelo, mapeamento, importarValoresZero);
  };

  // AÇÃO: "Não gostou do modelo? Limpar dados do preview e voltar para escolher outro modelo"
  const handleLimparPreviewETrocarModelo = () => {
    setItensPreview([]);
    setItensSelecionados(new Set());
    setErro(null);
    setAlertaInfo('Prévia anterior cancelada. Escolha outro modelo abaixo para interpretar sua planilha.');
    setEtapa(2);
  };

  // AÇÃO: "Desfazer importação que subiu no sistema e testar outro modelo" (Rollback)
  const handleDesfazerImportacao = async () => {
    if (!backupAntesImportacao) {
      setErro('Não foi encontrado backup da importação anterior para restaurar.');
      return;
    }

    const confirmou = window.confirm(
      'Deseja realmente desfazer esta importação e apagar os lançamentos que foram inseridos no sistema? Seus dados serão restaurados ao estado anterior e você poderá escolher outro modelo.'
    );
    if (!confirmou) return;

    setIsDesfazendo(true);
    setErro(null);

    try {
      // 1. Restaura os dados anteriores no backend
      const payloadRestauracao = {
        receitas: backupAntesImportacao.receitas || [],
        despesas: backupAntesImportacao.despesas || [],
        categorias: backupAntesImportacao.categorias || []
      };

      await api.post('/user/dados', payloadRestauracao);

      // 2. Atualiza localStorage
      localStorage.setItem('RECEITAS', JSON.stringify(payloadRestauracao.receitas));
      localStorage.setItem('DESPESAS', JSON.stringify(payloadRestauracao.despesas));

      // 3. Notifica componente pai para sincronizar estado
      if (typeof onImportSuccess === 'function') {
        onImportSuccess(payloadRestauracao);
      }

      // 4. Limpa estados de sucesso e itens
      setSucesso(null);
      setItensPreview([]);
      setItensSelecionados(new Set());
      sessionStorage.removeItem(SNAPSHOT_STORAGE_KEY);
      setTemSnapshotSalvo(false);

      // 5. Se o arquivo da planilha ainda está em memória, vai para etapa 2 (escolha de modelo).
      // Se não, volta para etapa 1.
      if (linhasBrutas.length > 0) {
        setAlertaInfo(
          'A importação anterior foi desfeita e os dados foram apagados com sucesso! Seus dados retornaram ao estado original. Escolha outro modelo abaixo para tentar novamente.'
        );
        setEtapa(2);
      } else {
        setAlertaInfo(
          'A importação anterior foi desfeita e os lançamentos foram apagados com sucesso! O sistema foi restaurado.'
        );
        setEtapa(1);
      }
    } catch (err) {
      console.error('Erro ao desfazer importação:', err);
      setErro(`Falha ao desfazer importação: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsDesfazendo(false);
    }
  };

  // Alterna o tipo de um item específico (Receita ⇄ Despesa)
  const toggleTipoItem = (id) => {
    setItensPreview(prev =>
      prev.map(item => {
        if (item.id === id) {
          const novoTipo = item.tipo === 'despesa' ? 'receita' : 'despesa';
          return { ...item, tipo: novoTipo };
        }
        return item;
      })
    );
  };

  // Atualização inline de um campo de item
  const handleAtualizarItem = (id, campo, valor) => {
    setItensPreview(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, [campo]: valor };
        }
        return item;
      })
    );
  };

  // Excluir item do preview
  const handleExcluirItem = (id) => {
    setItensPreview(prev => prev.filter(item => item.id !== id));
    setItensSelecionados(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Selecionar / desselecionar todos
  const handleToggleSelecionarTodos = () => {
    if (itensSelecionados.size === itensFiltrados.length && itensFiltrados.length > 0) {
      setItensSelecionados(prev => {
        const next = new Set(prev);
        itensFiltrados.forEach(i => next.delete(i.id));
        return next;
      });
    } else {
      setItensSelecionados(prev => {
        const next = new Set(prev);
        itensFiltrados.forEach(i => next.add(i.id));
        return next;
      });
    }
  };

  // Alterna seleção individual
  const handleToggleSelecaoItem = (id) => {
    setItensSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Ações em massa para itens selecionados
  const aplicarAcaoEmMassa = (novoTipo) => {
    setItensPreview(prev =>
      prev.map(item => {
        if (itensSelecionados.has(item.id)) {
          return { ...item, tipo: novoTipo };
        }
        return item;
      })
    );
  };

  const excluirSelecionados = () => {
    setItensPreview(prev => prev.filter(item => !itensSelecionados.has(item.id)));
    setItensSelecionados(new Set());
  };

  // Filtros de preview
  const itensFiltrados = useMemo(() => {
    return itensPreview.filter(item => {
      if (abaPreview === 'despesas' && item.tipo !== 'despesa') return false;
      if (abaPreview === 'receitas' && item.tipo !== 'receita') return false;
      if (buscaPreview.trim()) {
        const termo = normalizarTexto(buscaPreview);
        const emDesc = normalizarTexto(item.descricao).includes(termo);
        const emCat = normalizarTexto(item.categoria).includes(termo);
        const emSubcat = normalizarTexto(item.subcategoria).includes(termo);
        return emDesc || emCat || emSubcat;
      }
      return true;
    });
  }, [itensPreview, abaPreview, buscaPreview]);

  // Totais e KPIs dos selecionados
  const kpis = useMemo(() => {
    let totRec = 0;
    let totDesp = 0;
    let qtdRec = 0;
    let qtdDesp = 0;

    itensPreview.forEach(item => {
      if (itensSelecionados.has(item.id)) {
        const val = parseFloat(item.valor) || 0;
        if (item.tipo === 'receita') {
          totRec += val;
          qtdRec++;
        } else {
          totDesp += val;
          qtdDesp++;
        }
      }
    });

    return {
      totRec,
      totDesp,
      qtdRec,
      qtdDesp,
      saldo: totRec - totDesp,
      totalItens: qtdRec + qtdDesp
    };
  }, [itensPreview, itensSelecionados]);

  // Lista de todas as categorias únicas (existentes + absorvidas)
  const todasCategorias = useMemo(() => {
    const nomes = new Set(categoriasExistentes.map(c => c.nome || c));
    itensPreview.forEach(i => {
      if (i.categoria && i.categoria.trim()) {
        nomes.add(i.categoria.trim());
      }
    });
    return Array.from(nomes).sort();
  }, [categoriasExistentes, itensPreview]);

  // SALVAR NO BANCO DE DADOS
  const executarImportacaoFinal = async () => {
    setIsSalvando(true);
    setErro(null);

    try {
      // 1. Carrega dados frescos do backend para formar o snapshot de rollback
      const res = await api.get('/user/dados');
      const dadosAtuais = res.data?.dados || res.data?.data || {};

      const receitasAtuais = Array.isArray(dadosAtuais.receitas) ? [...dadosAtuais.receitas] : [];
      const despesasAtuais = Array.isArray(dadosAtuais.despesas) ? [...dadosAtuais.despesas] : [];
      const categoriasAtuais = Array.isArray(dadosAtuais.categorias) ? [...dadosAtuais.categorias] : [];

      // Salva snapshot para caso o usuário queira desfazer depois de subir
      const snapshot = {
        receitas: receitasAtuais,
        despesas: despesasAtuais,
        categorias: categoriasAtuais,
        dataHora: new Date().toISOString()
      };
      setBackupAntesImportacao(snapshot);
      try {
        sessionStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
        setTemSnapshotSalvo(true);
      } catch {
        // silencioso
      }

      // 2. Separa os itens selecionados em novas receitas e despesas
      const novasReceitas = [];
      const novasDespesas = [];

      itensPreview.forEach(item => {
        if (!itensSelecionados.has(item.id)) return;

        const baseTransacao = {
          descricao: item.descricao,
          valor: parseFloat(item.valor) || 0,
          data: item.data,
          categoria: item.categoria,
          subcategoria: item.subcategoria || '',
          observacoes: item.observacoes || '',
          statusPagamento: item.statusPagamento || 'pago',
          somarNoOrcamento: item.somarNoOrcamento !== false,
          importadoEm: new Date().toISOString(),
          origemPlanilha: arquivoNome || 'Planilha'
        };

        if (campoDataDestino === 'dataCompra') {
          baseTransacao.dataCompra = item.data;
          baseTransacao.dataLancamento = item.data;
        } else if (campoDataDestino === 'dataVencimento') {
          baseTransacao.dataVencimento = item.data;
          baseTransacao.dataLancamento = item.data;
        } else {
          baseTransacao.dataLancamento = item.data;
        }

        if (item.tipo === 'receita') {
          novasReceitas.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            ...baseTransacao,
            recorrente: false
          });
        } else {
          novasDespesas.push({
            id: `desp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            ...baseTransacao,
            parcelado: false,
            numeroParcelas: 1
          });
        }
      });

      // 3. Absorve novas categorias sem duplicidade
      const nomesCategoriasCadastradas = new Set(
        categoriasAtuais.map(c => normalizarTexto(c.nome || c))
      );

      let corIdx = 0;
      todasCategorias.forEach(nomeCat => {
        const norm = normalizarTexto(nomeCat);
        if (!nomesCategoriasCadastradas.has(norm)) {
          nomesCategoriasCadastradas.add(norm);
          const corEscolhida = PALETA_CORES[corIdx % PALETA_CORES.length];
          corIdx++;

          categoriasAtuais.push({
            nome: nomeCat,
            cor: corEscolhida,
            subcategorias: []
          });
        }
      });

      // 4. Monta o payload final respeitando a escolha: somar ou substituir
      const receitasFinais = modoImportacao === 'substituir'
        ? novasReceitas
        : [...receitasAtuais, ...novasReceitas];

      const despesasFinais = modoImportacao === 'substituir'
        ? novasDespesas
        : [...despesasAtuais, ...novasDespesas];

      const payloadAtualizacao = {
        ...dadosAtuais,
        receitas: receitasFinais,
        despesas: despesasFinais,
        categorias: categoriasAtuais
      };

      // 5. Salva no banco de dados e local storage
      await api.post('/user/dados', payloadAtualizacao);
      localStorage.setItem('RECEITAS', JSON.stringify(receitasFinais));
      localStorage.setItem('DESPESAS', JSON.stringify(despesasFinais));

      setSucesso({
        receitas: novasReceitas.length,
        despesas: novasDespesas.length,
        total: novasReceitas.length + novasDespesas.length,
        modo: modoImportacao
      });

      // Notifica o componente pai
      if (typeof onImportSuccess === 'function') {
        onImportSuccess({
          receitas: receitasFinais,
          despesas: despesasFinais,
          categorias: categoriasAtuais
        });
      }
    } catch (err) {
      console.error('Erro ao salvar lançamentos importados:', err);
      setErro(`Falha ao salvar dados no sistema: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Container Principal do Modal */}
      <div className="bg-custom-card border border-custom-color rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-custom-main">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-custom-color flex items-center justify-between bg-custom-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-custom-main">
                  Importador Inteligente de Planilhas
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Excel & CSV
                </span>
              </div>
              <p className="text-xs text-custom-main opacity-75 mt-0.5">
                Traga seu histórico financeiro do Excel, Google Sheets ou extrato bancário em segundos.
              </p>
            </div>
          </div>

          <button
            onClick={handleFechar}
            className="p-1.5 rounded-lg text-custom-main opacity-70 hover:opacity-100 hover:bg-white/10 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Passos */}
        <div className="px-5 py-3 bg-white/[0.02] border-b border-custom-color/60 flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-6 min-w-max">
            <div className={`flex items-center gap-1.5 font-medium ${etapa === 1 ? 'text-emerald-400 font-bold' : etapa > 1 ? 'text-emerald-500' : 'opacity-50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${etapa === 1 ? 'bg-emerald-500 text-black font-bold' : etapa > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-custom-main'}`}>
                {etapa > 1 ? '✓' : '1'}
              </span>
              <span>1. Enviar Arquivo</span>
            </div>

            <span className="text-custom-main opacity-30">→</span>

            <div className={`flex items-center gap-1.5 font-medium ${etapa === 2 ? 'text-emerald-400 font-bold' : etapa > 2 ? 'text-emerald-500' : 'opacity-50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${etapa === 2 ? 'bg-emerald-500 text-black font-bold' : etapa > 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-custom-main'}`}>
                {etapa > 2 ? '✓' : '2'}
              </span>
              <span>2. Escolha de Modelo</span>
            </div>

            <span className="text-custom-main opacity-30">→</span>

            <div className={`flex items-center gap-1.5 font-medium ${etapa === 3 ? 'text-emerald-400 font-bold' : etapa > 3 ? 'text-emerald-500' : 'opacity-50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${etapa === 3 ? 'bg-emerald-500 text-black font-bold' : etapa > 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-custom-main'}`}>
                {etapa > 3 ? '✓' : '3'}
              </span>
              <span>3. Conferência & Ajustes</span>
            </div>

            <span className="text-custom-main opacity-30">→</span>

            <div className={`flex items-center gap-1.5 font-medium ${etapa === 4 ? 'text-emerald-400 font-bold' : 'opacity-50'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${etapa === 4 ? 'bg-emerald-500 text-black font-bold' : 'bg-white/10 text-custom-main'}`}>
                4
              </span>
              <span>4. Salvar no Sistema</span>
            </div>
          </div>

          {arquivoNome && (
            <span className="hidden md:inline-block text-[11px] px-2 py-0.5 rounded bg-white/5 border border-custom-color truncate max-w-xs text-custom-main opacity-80">
              📄 {arquivoNome}
            </span>
          )}
        </div>

        {/* Mensagens de Alerta Informativo / Erro */}
        {alertaInfo && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              {alertaInfo}
            </div>
            <button onClick={() => setAlertaInfo(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {erro && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Erro:</span> {erro}
            </div>
            <button onClick={() => setErro(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ======================================================== */}
          {/* ETAPA 1: UPLOAD DO ARQUIVO */}
          {/* ======================================================== */}
          {etapa === 1 && (
            <div className="space-y-6">
              {/* Opção de Desfazer Importação Recente caso exista snapshot */}
              {temSnapshotSalvo && (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-amber-400 block">Subiu dados e não gostou do modelo?</strong>
                      <span className="text-custom-main opacity-85 text-[11px]">
                        Você pode desfazer a última planilha importada com 1 clique e restaurar o sistema exatamente como estava antes.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDesfazerImportacao}
                    disabled={isDesfazendo}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer flex-shrink-0 shadow-sm"
                  >
                    {isDesfazendo ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Desfazendo...
                      </>
                    ) : (
                      <>
                        <Undo2 className="w-3.5 h-3.5" /> Desfazer e Apagar Dados da Planilha
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-custom-color hover:border-emerald-500/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-emerald-500/[0.03] group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base sm:text-lg font-bold text-custom-main mb-1">
                  Arraste sua planilha aqui ou clique para selecionar
                </h4>
                <p className="text-xs sm:text-sm text-custom-main opacity-70 max-w-md mx-auto">
                  Suportamos arquivos <strong>.XLSX</strong>, <strong>.XLS</strong> ou <strong>.CSV</strong> do Excel, Google Sheets, bancos ou qualquer controle financeiro.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    ✓ 3 Modelos de Visualização
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    ✓ Botão para Trocar e Desfazer
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    ✓ Absorção de Categorias
                  </span>
                </div>
              </div>

              {/* Dicas e Instruções Úteis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-custom-color bg-custom-card/50">
                  <div className="text-xs font-semibold text-custom-gold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> 3 Modelos Flexíveis
                  </div>
                  <p className="text-[11px] text-custom-main opacity-75">
                    Se não gostar do modelo escolhido, você pode limpar os dados e alternar para outro com 1 clique.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-custom-color bg-custom-card/50">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Segurança Total
                  </div>
                  <p className="text-[11px] text-custom-main opacity-75">
                    Mesmo após subir os dados, você sempre terá a opção de desfazer a importação e voltar ao modelo anterior.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-custom-color bg-custom-card/50">
                  <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5" /> Ambas as Contas
                  </div>
                  <p className="text-[11px] text-custom-main opacity-75">
                    Se a planilha contiver despesas e receitas juntas, nosso sistema separa cada uma automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ETAPA 2: PRESETS VISUAIS & MAPEAMENTO */}
          {/* ======================================================== */}
          {etapa === 2 && (
            <div className="space-y-6">
              {/* Seletor de Aba (se houver mais de uma na planilha) */}
              {planilhasNomes.length > 1 && (
                <div className="p-3.5 rounded-xl border border-custom-color bg-custom-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-custom-main block">
                      Selecione a aba da planilha para importar:
                    </span>
                    <span className="text-[11px] text-emerald-400 opacity-90">
                      ✓ Selecionamos automaticamente a aba de lançamentos ({planilhaSelecionada})
                    </span>
                  </div>
                  <select
                    value={planilhaSelecionada}
                    onChange={(e) => {
                      setPlanilhaSelecionada(e.target.value);
                      carregarAba(rawWorkbook, e.target.value);
                    }}
                    className="text-xs bg-custom-card border border-custom-color rounded-lg px-3 py-1.5 text-custom-main cursor-pointer"
                  >
                    {planilhasNomes.map(aba => (
                      <option key={aba} value={aba}>{aba}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Aviso de Detecção de Múltiplos Blocos Lado a Lado (ex: Fluxo de Caixa) */}
              {multiBlocoInfo && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-custom-main leading-relaxed">
                    <strong className="text-emerald-400 block mb-0.5">
                      Layout de Múltiplos Blocos Detectado Automaticamente!
                    </strong>
                    Identificamos <strong>{multiBlocoInfo.blocos.length} blocos lado a lado</strong> nesta aba (
                    {multiBlocoInfo.blocos.map(b => b.tituloGrupo).join(', ')}
                    ). O sistema unificará todas as receitas e despesas automaticamente e preencherá datas em branco usando a coluna <strong>Mês</strong> ({multiBlocoInfo.anoBase}).
                  </div>
                </div>
              )}

              {/* PERGUNTA: DESEJA IMPORTAR OS TÍTULOS QUE ESTÃO COM VALOR ZERO? (SIM OU NÃO) */}
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2.5">
                    <Filter className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-custom-main">
                        Deseja importar os títulos que estão com valor zero (R$ 0,00)?
                      </h5>
                      <p className="text-xs text-custom-main opacity-80 mt-0.5 leading-relaxed">
                        {resumoZerosAba.zeros > 0 ? (
                          <>
                            Encontramos <strong className="text-amber-400">{resumoZerosAba.zeros} títulos com valor zero/em branco</strong> e{' '}
                            <strong className="text-emerald-400">{resumoZerosAba.comValor} lançamentos com valor preenchido</strong> nesta planilha.
                          </>
                        ) : (
                          'Escolha se linhas de modelo sem valor preenchido (R$ 0,00) devem entrar ou ser ignoradas.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label
                    onClick={() => handleAlternarImportarValoresZero(false)}
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                      !importarValoresZero
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40'
                        : 'border-custom-color bg-custom-card text-custom-main opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importarValoresZeroStep2"
                        checked={!importarValoresZero}
                        onChange={() => handleAlternarImportarValoresZero(false)}
                        className="accent-emerald-500"
                      />
                      <span>Não — Ignorar títulos com valor zero (Recomendado)</span>
                    </div>
                    {resumoZerosAba.comValor > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {resumoZerosAba.comValor} itens
                      </span>
                    )}
                  </label>

                  <label
                    onClick={() => handleAlternarImportarValoresZero(true)}
                    className={`flex items-center justify-between gap-2 p-3 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                      importarValoresZero
                        ? 'border-amber-500 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40'
                        : 'border-custom-color bg-custom-card text-custom-main opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importarValoresZeroStep2"
                        checked={importarValoresZero}
                        onChange={() => handleAlternarImportarValoresZero(true)}
                        className="accent-amber-500"
                      />
                      <span>Sim — Importar também os títulos com valor R$ 0,00</span>
                    </div>
                    {resumoZerosAba.total > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        {resumoZerosAba.total} itens (+{resumoZerosAba.zeros} zerados)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Informações da Leitura */}
              <div>
                <h4 className="text-sm font-semibold text-custom-main mb-1">
                  Como você prefere interpretar os dados da planilha?
                </h4>
                <p className="text-xs text-custom-main opacity-70">
                  Escolha um dos 3 modelos abaixo. Se não gostar do resultado na prévia ou após salvar, você poderá apagar e testar outro modelo facilmente.
                </p>
              </div>

              {/* 3 CARDS DE PRESET */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* MODELO 1: Mapeamento Inteligente */}
                <div
                  onClick={() => setModoLeitura(1)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    modoLeitura === 1
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                      : 'border-custom-color bg-custom-card hover:border-emerald-500/40 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                    ★ MODELO 1 (RECOMENDADO)
                  </span>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-sm text-custom-main">
                        Mapeamento Inteligente
                      </h5>
                    </div>
                    <p className="text-xs text-custom-main opacity-75 mb-3 leading-relaxed">
                      Detecta automaticamente colunas de Data, Descrição, Valor, Categoria e Tipo (Receita/Despesa).
                    </p>
                  </div>

                  <div className="text-[11px] space-y-1 pt-2 border-t border-custom-color/40 text-custom-main opacity-80">
                    <div>📅 Data: <strong>{mapeamento.colData || 'Detectada'}</strong></div>
                    <div>📝 Descrição: <strong>{mapeamento.colDescricao || 'Detectada'}</strong></div>
                    <div>💰 Valor: <strong>{mapeamento.colValor || 'Detectada'}</strong></div>
                    <div>🏷️ Categoria: <strong>{mapeamento.colCategoria || 'Automática'}</strong></div>
                  </div>
                </div>

                {/* MODELO 2: Estrutura Essencial */}
                <div
                  onClick={() => setModoLeitura(2)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    modoLeitura === 2
                      ? 'border-custom-gold bg-custom-gold/10 ring-1 ring-custom-gold'
                      : 'border-custom-color bg-custom-card hover:border-custom-gold/40 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-custom-gold text-black">
                    ⚡ MODELO 2 (RÁPIDO)
                  </span>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-custom-gold/20 text-custom-gold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-sm text-custom-main">
                        Estrutura Essencial
                      </h5>
                    </div>
                    <p className="text-xs text-custom-main opacity-75 mb-3 leading-relaxed">
                      Foca exclusivamente no essencial: Data, Descrição e Valor. Ideal para extratos simples de bancos.
                    </p>
                  </div>

                  <div className="text-[11px] space-y-1 pt-2 border-t border-custom-color/40 text-custom-main opacity-80">
                    <div>📅 Data: <strong>{mapeamento.colData || 'Auto'}</strong></div>
                    <div>📝 Descrição: <strong>{mapeamento.colDescricao || 'Auto'}</strong></div>
                    <div>💰 Valor: <strong>{mapeamento.colValor || 'Auto'}</strong></div>
                    <div>🏷️ Categoria: <em>Definir no Preview</em></div>
                  </div>
                </div>

                {/* MODELO 3: Manual / Personalizado */}
                <div
                  onClick={() => setModoLeitura(3)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    modoLeitura === 3
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                      : 'border-custom-color bg-custom-card hover:border-blue-500/40 opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                    🛠️ MODELO 3 (MANUAL)
                  </span>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <Settings2 className="w-4 h-4" />
                      </div>
                      <h5 className="font-bold text-sm text-custom-main">
                        Mapeamento Manual
                      </h5>
                    </div>
                    <p className="text-xs text-custom-main opacity-75 mb-3 leading-relaxed">
                      Aponte manualmente qual coluna da planilha corresponde a cada campo do sistema.
                    </p>
                  </div>

                  <div className="text-[11px] pt-2 border-t border-custom-color/40 text-blue-400 font-medium">
                    Personalize os seletores abaixo ↓
                  </div>
                </div>
              </div>

              {/* SELETORES MANUAIS */}
              {modoLeitura === 3 && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" /> Mapeamento Manual de Colunas
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Data *</label>
                      <select
                        value={mapeamento.colData}
                        onChange={(e) => setMapeamento(m => ({ ...m, colData: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Selecione...</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Descrição *</label>
                      <select
                        value={mapeamento.colDescricao}
                        onChange={(e) => setMapeamento(m => ({ ...m, colDescricao: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Selecione...</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Valor *</label>
                      <select
                        value={mapeamento.colValor}
                        onChange={(e) => setMapeamento(m => ({ ...m, colValor: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Selecione...</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Categoria (opcional)</label>
                      <select
                        value={mapeamento.colCategoria}
                        onChange={(e) => setMapeamento(m => ({ ...m, colCategoria: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Nenhuma (usar 'Outros')</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Subcategoria (opcional)</label>
                      <select
                        value={mapeamento.colSubcategoria}
                        onChange={(e) => setMapeamento(m => ({ ...m, colSubcategoria: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Nenhuma</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-custom-main mb-1 block">Tipo Receita/Despesa (opcional)</label>
                      <select
                        value={mapeamento.colTipo}
                        onChange={(e) => setMapeamento(m => ({ ...m, colTipo: e.target.value }))}
                        className="w-full text-xs bg-custom-card border border-custom-color rounded-lg px-2.5 py-1.5 text-custom-main"
                      >
                        <option value="">Inferir por sinal (+ / -)</option>
                        {colunasDisponiveis.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PERGUNTA GLOBAL DE DATA ÚNICA */}
              {detectouApenasUmaData && (
                <div className="p-4 rounded-xl border border-custom-gold/40 bg-custom-gold/5 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-custom-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-custom-gold uppercase tracking-wider">
                        Configuração de Data da Planilha
                      </h5>
                      <p className="text-xs text-custom-main opacity-90 mt-0.5 leading-relaxed">
                        Identificamos apenas uma coluna de data na sua planilha. Como o sistema possui controle detalhado, em qual campo você prefere registrar essa data para todos os itens?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                        campoDataDestino === 'dataLancamento'
                          ? 'border-custom-gold bg-custom-gold/15 text-custom-gold'
                          : 'border-custom-color bg-custom-card opacity-75 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campoData"
                        value="dataLancamento"
                        checked={campoDataDestino === 'dataLancamento'}
                        onChange={() => setCampoDataDestino('dataLancamento')}
                        className="accent-amber-500"
                      />
                      <span>Data de Lançamento (Padrão)</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                        campoDataDestino === 'dataCompra'
                          ? 'border-custom-gold bg-custom-gold/15 text-custom-gold'
                          : 'border-custom-color bg-custom-card opacity-75 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campoData"
                        value="dataCompra"
                        checked={campoDataDestino === 'dataCompra'}
                        onChange={() => setCampoDataDestino('dataCompra')}
                        className="accent-amber-500"
                      />
                      <span>Data da Compra</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-medium ${
                        campoDataDestino === 'dataVencimento'
                          ? 'border-custom-gold bg-custom-gold/15 text-custom-gold'
                          : 'border-custom-color bg-custom-card opacity-75 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campoData"
                        value="dataVencimento"
                        checked={campoDataDestino === 'dataVencimento'}
                        onChange={() => setCampoDataDestino('dataVencimento')}
                        className="accent-amber-500"
                      />
                      <span>Data de Vencimento / Fatura</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ETAPA 3: PREVIEW INTERATIVO & AJUSTES */}
          {/* ======================================================== */}
          {etapa === 3 && (
            <div className="space-y-4">
              {/* BARRA DE ALTERNÂNCIA / DESFAZER MODELO E FILTRO DE ZERADOS */}
              <div className="p-3 rounded-xl border border-custom-color bg-custom-card/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-custom-main opacity-80">
                      Modelo em uso:
                    </span>
                    <div className="inline-flex rounded-lg border border-custom-color bg-white/[0.02] p-0.5">
                      <button
                        type="button"
                        onClick={() => alternarModeloNoPreview(1)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                          modoLeitura === 1
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-custom-main opacity-70 hover:opacity-100'
                        }`}
                      >
                        ★ 1. Inteligente
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarModeloNoPreview(2)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                          modoLeitura === 2
                            ? 'bg-custom-gold/20 text-custom-gold border border-custom-gold/40'
                            : 'text-custom-main opacity-70 hover:opacity-100'
                        }`}
                      >
                        ⚡ 2. Essencial
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarModeloNoPreview(3)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                          modoLeitura === 3
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'text-custom-main opacity-70 hover:opacity-100'
                        }`}
                      >
                        🛠️ 3. Manual
                      </button>
                    </div>
                  </div>

                  {/* Pergunta rápida no Preview: Importar títulos com valor zero? Sim / Não */}
                  <div className="flex items-center gap-2 pl-0 sm:pl-2 sm:border-l border-custom-color/60">
                    <span className="font-semibold text-custom-main opacity-80">
                      Importar títulos com valor zero?
                    </span>
                    <div className="inline-flex rounded-lg border border-custom-color bg-white/[0.02] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleAlternarImportarValoresZero(false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                          !importarValoresZero
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-custom-main opacity-70 hover:opacity-100'
                        }`}
                      >
                        Não (Ignorar R$ 0,00)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlternarImportarValoresZero(true)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                          importarValoresZero
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'text-custom-main opacity-70 hover:opacity-100'
                        }`}
                      >
                        Sim {resumoZerosAba.zeros > 0 ? `(+${resumoZerosAba.zeros})` : ''}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botão Dedicado: Limpar e Escolher Outro Modelo */}
                <button
                  type="button"
                  onClick={handleLimparPreviewETrocarModelo}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer self-start lg:self-auto"
                  title="Não gostou do resultado? Limpe os dados do preview e escolha outro modelo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Não gostou? Limpar e Escolher Outro Modelo</span>
                </button>
              </div>

              {/* Barra de KPIs Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border border-custom-color bg-custom-card">
                  <div className="text-[11px] text-custom-main opacity-70">Selecionados</div>
                  <div className="text-base sm:text-lg font-bold text-custom-main">
                    {itensSelecionados.size} <span className="text-xs font-normal opacity-60">de {itensPreview.length}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Receitas ({kpis.qtdRec})
                  </div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">
                    {kpis.totRec.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Despesas ({kpis.qtdDesp})
                  </div>
                  <div className="text-base sm:text-lg font-bold text-rose-400">
                    {kpis.totDesp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-custom-color bg-custom-card">
                  <div className="text-[11px] text-custom-main opacity-70">Saldo da Planilha</div>
                  <div className={`text-base sm:text-lg font-bold ${kpis.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {kpis.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>

              {/* Datalist para autocomplete de categorias */}
              <datalist id="lista-categorias-importador">
                {todasCategorias.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              {/* Filtros e Ações em Massa */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                {/* Abas de Filtro */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-custom-color rounded-xl">
                  <button
                    onClick={() => setAbaPreview('todos')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      abaPreview === 'todos'
                        ? 'bg-custom-card text-custom-main shadow-sm'
                        : 'text-custom-main opacity-70 hover:opacity-100'
                    }`}
                  >
                    Todos ({itensPreview.length})
                  </button>
                  <button
                    onClick={() => setAbaPreview('despesas')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      abaPreview === 'despesas'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'text-rose-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    Despesas ({itensPreview.filter(i => i.tipo === 'despesa').length})
                  </button>
                  <button
                    onClick={() => setAbaPreview('receitas')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      abaPreview === 'receitas'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-emerald-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    Receitas ({itensPreview.filter(i => i.tipo === 'receita').length})
                  </button>
                </div>

                {/* Busca e Ações Rápidas */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filtrar lançamentos..."
                    value={buscaPreview}
                    onChange={(e) => setBuscaPreview(e.target.value)}
                    className="text-xs bg-custom-card border border-custom-color rounded-xl px-3 py-1.5 text-custom-main placeholder:opacity-50 w-full sm:w-48"
                  />

                  {itensSelecionados.size > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => aplicarAcaoEmMassa('despesa')}
                        title="Marcar selecionados como Despesa"
                        className="px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Tornar Despesa
                      </button>
                      <button
                        onClick={() => aplicarAcaoEmMassa('receita')}
                        title="Marcar selecionados como Receita"
                        className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                      >
                        Tornar Receita
                      </button>
                      <button
                        onClick={excluirSelecionados}
                        title="Excluir selecionados"
                        className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-custom-main hover:text-rose-400 border border-custom-color rounded-lg text-xs transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabela de Itens Editáveis */}
              <div className="border border-custom-color rounded-xl overflow-hidden bg-custom-card/30">
                <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-custom-card/80 sticky top-0 z-10 border-b border-custom-color text-custom-main opacity-80 select-none">
                      <tr>
                        <th className="p-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={itensFiltrados.length > 0 && itensFiltrados.every(i => itensSelecionados.has(i.id))}
                            onChange={handleToggleSelecionarTodos}
                            className="rounded accent-emerald-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-2.5 w-28">Tipo</th>
                        <th className="p-2.5 w-32">Data</th>
                        <th className="p-2.5">Descrição</th>
                        <th className="p-2.5 w-40">Categoria</th>
                        <th className="p-2.5 w-32 text-right">Valor (R$)</th>
                        <th className="p-2.5 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-custom-color/40">
                      {itensFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-custom-main opacity-60">
                            Nenhum lançamento encontrado para os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        itensFiltrados.map((item) => {
                          const isSelected = itensSelecionados.has(item.id);
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-white/[0.02]' : 'opacity-40 hover:opacity-75'
                              }`}
                            >
                              <td className="p-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelecaoItem(item.id)}
                                  className="rounded accent-emerald-500 cursor-pointer"
                                />
                              </td>

                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => toggleTipoItem(item.id)}
                                  className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                    item.tipo === 'receita'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                                  }`}
                                  title="Clique para alternar entre Receita e Despesa"
                                >
                                  {item.tipo === 'receita' ? (
                                    <>
                                      <TrendingUp className="w-3 h-3" /> Receita
                                    </>
                                  ) : (
                                    <>
                                      <TrendingDown className="w-3 h-3" /> Despesa
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="p-2">
                                <input
                                  type="date"
                                  value={item.data}
                                  onChange={(e) => handleAtualizarItem(item.id, 'data', e.target.value)}
                                  className="w-full bg-custom-card border border-custom-color rounded-lg px-2 py-1 text-xs text-custom-main"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.descricao}
                                  onChange={(e) => handleAtualizarItem(item.id, 'descricao', e.target.value)}
                                  className="w-full bg-custom-card border border-custom-color rounded-lg px-2 py-1 text-xs text-custom-main"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="text"
                                  list="lista-categorias-importador"
                                  value={item.categoria}
                                  onChange={(e) => handleAtualizarItem(item.id, 'categoria', e.target.value)}
                                  placeholder="Categoria"
                                  className="w-full bg-custom-card border border-custom-color rounded-lg px-2 py-1 text-xs text-custom-main"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.valor}
                                  onChange={(e) => handleAtualizarItem(item.id, 'valor', parseFloat(e.target.value) || 0)}
                                  className="w-full text-right bg-custom-card border border-custom-color rounded-lg px-2 py-1 text-xs font-semibold text-custom-main"
                                />
                              </td>

                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleExcluirItem(item.id)}
                                  className="p-1 rounded text-custom-main opacity-50 hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Remover este lançamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-custom-main opacity-70 gap-2">
                <span>
                  💡 Dica: Você pode editar qualquer campo diretamente na tabela ou alternar entre Receita e Despesa com 1 clique antes de salvar.
                </span>
                <button
                  type="button"
                  onClick={handleLimparPreviewETrocarModelo}
                  className="text-rose-400 underline hover:opacity-100 cursor-pointer self-start sm:self-auto"
                >
                  Limpar dados e escolher outro modelo
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ETAPA 4: DECISÃO FINAL & CONFIRMAÇÃO */}
          {/* ======================================================== */}
          {etapa === 4 && (
            <div className="space-y-6">
              {/* Confirmação de Sucesso (após salvar) com Botão para Desfazer */}
              {sucesso ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-400">
                    Importação Concluída com Sucesso!
                  </h4>
                  <p className="text-xs text-custom-main opacity-85 max-w-md mx-auto">
                    Foram integrados <strong>{sucesso.receitas} receitas</strong> e <strong>{sucesso.despesas} despesas</strong>{' '}
                    ({sucesso.modo === 'somar' ? 'somados aos seus lançamentos existentes' : 'substituindo lançamentos anteriores'}).
                    Todas as novas categorias da planilha foram absorvidas automaticamente.
                  </p>

                  {/* DUAS OPÇÕES DEPOIS DE SUBIR: CONCLUIR OU DESFAZER PARA TESTAR OUTRO MODELO */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleFechar}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-custom transition cursor-pointer"
                    >
                      Concluir e Voltar ao Sistema
                    </button>

                    <button
                      type="button"
                      onClick={handleDesfazerImportacao}
                      disabled={isDesfazendo}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      title="Apaga os dados importados desta planilha e retorna para escolher outro modelo"
                    >
                      {isDesfazendo ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Desfazendo...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Não gostou? Desfazer e testar outro modelo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="text-base font-bold text-custom-main mb-1">
                      Como deseja aplicar os dados no seu Meu Bolso?
                    </h4>
                    <p className="text-xs text-custom-main opacity-70">
                      Você selecionou <strong>{kpis.totalItens} lançamentos</strong> ({kpis.qtdRec} receitas e {kpis.qtdDesp} despesas) prontos para abastecer o sistema.
                    </p>
                  </div>

                  {/* 2 OPÇÕES: SOMAR VS SUBSTITUIR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Opção 1: Somar */}
                    <div
                      onClick={() => setModoImportacao('somar')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        modoImportacao === 'somar'
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50'
                          : 'border-custom-color bg-custom-card hover:border-emerald-500/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-black">
                        ★ RECOMENDADO
                      </span>

                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Plus className="w-5 h-5" />
                          </div>
                          <h5 className="font-bold text-sm text-custom-main">
                            Somar aos lançamentos existentes
                          </h5>
                        </div>
                        <p className="text-xs text-custom-main opacity-75 leading-relaxed">
                          Mantém todas as receitas e despesas que você já tem cadastradas e adiciona os novos dados da planilha. Ideal para importar extratos mensais ou planilhas complementares.
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-custom-color/40 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                        <Check className="w-4 h-4" /> Seguro: nenhum dado anterior será apagado
                      </div>
                    </div>

                    {/* Opção 2: Substituir */}
                    <div
                      onClick={() => setModoImportacao('substituir')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        modoImportacao === 'substituir'
                          ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                          : 'border-custom-color bg-custom-card hover:border-amber-500/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <RefreshCw className="w-5 h-5" />
                          </div>
                          <h5 className="font-bold text-sm text-custom-main">
                            Substituir totalmente pelos dados da planilha
                          </h5>
                        </div>
                        <p className="text-xs text-custom-main opacity-75 leading-relaxed">
                          Remove as receitas e despesas atuais e inicia seu controle financeiro do zero com o conteúdo exato desta planilha.
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-custom-color/40 flex items-center gap-2 text-amber-400 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4" /> Recomeço limpo a partir desta planilha
                      </div>
                    </div>
                  </div>

                  {/* Resumo dos Dados que serão gravados */}
                  <div className="p-4 rounded-xl border border-custom-color bg-custom-card/40 space-y-2 text-xs">
                    <div className="font-bold text-custom-main flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-custom-gold" /> Resumo do Registro
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-custom-main opacity-85">
                      <div>
                        <span className="opacity-60 block">Receitas a importar:</span>
                        <strong className="text-emerald-400">{kpis.qtdRec} itens</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Despesas a importar:</span>
                        <strong className="text-rose-400">{kpis.qtdDesp} itens</strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Data mapeada para:</span>
                        <strong>
                          {campoDataDestino === 'dataCompra' ? 'Data da Compra' : campoDataDestino === 'dataVencimento' ? 'Vencimento / Fatura' : 'Lançamento'}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-60 block">Categorias absorvidas:</span>
                        <strong className="text-custom-gold">{todasCategorias.length} categorias</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Navegação dos Passos */}
        {!sucesso && (
          <div className="p-4 sm:p-5 border-t border-custom-color flex items-center justify-between bg-custom-card/50">
            {/* Botão Voltar */}
            {etapa > 1 ? (
              <button
                type="button"
                onClick={() => setEtapa(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl border border-custom-color bg-custom-card hover:bg-white/5 text-custom-main text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <div />
            )}

            {/* Botão Avançar / Concluir */}
            <div className="flex items-center gap-2">
              {etapa === 2 && (
                <button
                  type="button"
                  onClick={() => aplicarPresetEGerarPreview(modoLeitura)}
                  disabled={isProcessando}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-custom transition cursor-pointer"
                >
                  {isProcessando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      <span>Gerar Prévia com Este Modelo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {etapa === 3 && (
                <button
                  type="button"
                  onClick={() => {
                    if (itensSelecionados.size === 0) {
                      setErro('Selecione pelo menos um item para importar.');
                      return;
                    }
                    setEtapa(4);
                  }}
                  disabled={itensSelecionados.size === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-custom transition cursor-pointer"
                >
                  <span>Avançar para Importação ({itensSelecionados.size})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {etapa === 4 && (
                <button
                  type="button"
                  onClick={executarImportacaoFinal}
                  disabled={isSalvando || itensSelecionados.size === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-custom transition cursor-pointer"
                >
                  {isSalvando ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Salvando no Sistema...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar e Salvar no Sistema</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportadorPlanilhaModal;
