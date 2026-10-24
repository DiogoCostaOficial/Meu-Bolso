// src/pages/Backup.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Save,
  Upload,
  Download,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Plane,
  TrendingUp,
  TrendingDown,
  Target,
  Tag,
  FileCheck2,
  Database,
  FileSpreadsheet,
  FileText,
  FileCode2,
  Layers,
  X,
  Info
} from 'lucide-react';

const BACKUP_AUTO_KEY = 'BACKUP_AUTO_LOCAL';
const AUTO_BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

const formatarMoeda = (valor) => {
  const num = parseFloat(valor) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Backup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dadosAtuais, setDadosAtuais] = useState({
    receitas: [],
    despesas: [],
    orcamentos: [],
    cartoes: [],
    viagens: [],
    categorias: []
  });
  const [lastAutoBackup, setLastAutoBackup] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Estados do Modal Assistente de Exportação
  const [modalExportAberto, setModalExportAberto] = useState(false);
  const [conteudoExportacao, setConteudoExportacao] = useState('tudo'); // 'tudo' | 'despesas' | 'receitas' | 'orcamentos' | 'cartoes' | 'viagens'
  const [formatoExportacao, setFormatoExportacao] = useState('json'); // 'json' | 'xlsx' | 'csv' | 'pdf'

  // Carrega dados completos do backend/Supabase
  const carregarDadosServidor = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data?.data || {};

      const formatados = {
        receitas: Array.isArray(dados.receitas) ? dados.receitas : [],
        despesas: Array.isArray(dados.despesas) ? dados.despesas : [],
        orcamentos: Array.isArray(dados.orcamentos) ? dados.orcamentos : [],
        cartoes: Array.isArray(dados.cartoes) ? dados.cartoes : [],
        viagens: Array.isArray(dados.viagens) ? dados.viagens : [],
        categorias: Array.isArray(dados.categorias) ? dados.categorias : []
      };

      setDadosAtuais(formatados);
      return formatados;
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      const fallback = {
        receitas: JSON.parse(localStorage.getItem('RECEITAS') || '[]'),
        despesas: JSON.parse(localStorage.getItem('DESPESAS') || '[]'),
        orcamentos: [],
        cartoes: [],
        viagens: [],
        categorias: []
      };
      setDadosAtuais(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosServidor();

    const saved = localStorage.getItem(BACKUP_AUTO_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp) {
          setLastAutoBackup(new Date(parsed.timestamp));
        }
      } catch (_) {
        // ignore
      }
    }
  }, [carregarDadosServidor]);

  // Executa backup automático local periódico
  const performAutoBackup = useCallback(async () => {
    try {
      const dados = await carregarDadosServidor();
      const snapshot = {
        timestamp: new Date().toISOString(),
        usuario: user?.email || 'usuario',
        dados
      };
      localStorage.setItem(BACKUP_AUTO_KEY, JSON.stringify(snapshot));
      setLastAutoBackup(new Date());
    } catch (e) {
      console.warn('Backup automático não pôde ser salvo:', e);
    }
  }, [carregarDadosServidor, user?.email]);

  useEffect(() => {
    const intervalId = setInterval(performAutoBackup, AUTO_BACKUP_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [performAutoBackup]);

  // HELPERS DE FORMATAÇÃO PARA EXCEL E CSV
  const prepararLinhasDespesas = (lista) => {
    return (lista || []).map((d) => ({
      Data: d.dataLancamento || d.data || '',
      Vencimento: d.dataVencimento || d.data || '',
      Descrição: d.descricao || '',
      Categoria: d.categoria || 'Geral',
      Subcategoria: d.subcategoria || '',
      'Valor (R$)': parseFloat(d.valor) || 0,
      'Status Pagamento': d.statusPagamento || d.status || 'Pendente',
      Cartão: d.cartao || 'Nenhum',
      Parcelado: d.parcelado ? 'Sim' : 'Não',
      Parcela: d.parcelado ? `${d.parcelaAtual || 1}/${d.parcelas || 1}` : '1/1',
      Observações: d.observacao || ''
    }));
  };

  const prepararLinhasReceitas = (lista) => {
    return (lista || []).map((r) => ({
      Data: r.data || '',
      Descrição: r.descricao || '',
      Categoria: r.categoria || 'Geral',
      Subcategoria: r.subcategoria || '',
      'Valor (R$)': parseFloat(r.valor) || 0,
      Status: r.status || 'Recebido',
      Observações: r.observacao || ''
    }));
  };

  const prepararLinhasOrcamentos = (lista) => {
    return (lista || []).map((o) => ({
      Mês: o.mes || '',
      'Renda Prevista (R$)': parseFloat(o.rendaPrevista) || 0,
      'Dívidas (R$)': parseFloat(o.dividas) || 0,
      'Renda Real (R$)': parseFloat(o.rendaReal) || 0,
      'Metas de Categorias': (o.categorias || [])
        .map((c) => `${c.nome}: R$ ${c.valorPlanejado || 0} (${c.percentual || 0}%)`)
        .join('; ')
    }));
  };

  const prepararLinhasCartoes = (lista) => {
    return (lista || []).map((c) => ({
      Nome: c.nome || '',
      Identificador: c.id || '',
      Detalhes: typeof c.valores === 'object' ? JSON.stringify(c.valores) : String(c.valores || '')
    }));
  };

  const prepararLinhasViagens = (lista) => {
    return (lista || []).map((v) => ({
      Destino: v.destino || v.titulo || 'Viagem',
      DataInício: v.dataInicio || '',
      DataFim: v.dataFim || '',
      OrçamentoTotal: parseFloat(v.orcamentoTotal || v.orcamento) || 0,
      TotalGasto: parseFloat(v.totalGasto || 0),
      Status: v.status || 'Planejamento'
    }));
  };

  // EXECUTOR DA EXPORTAÇÃO PERSONALIZADA
  const executarExportacao = async () => {
    try {
      setIsExporting(true);
      // Garante dados frescos do servidor
      const res = await api.get('/user/dados');
      const dados = res.data?.dados || res.data?.data || dadosAtuais;
      const dataHora = new Date().toISOString().slice(0, 10);
      const prefixoNome = `meubolso-${conteudoExportacao}-${dataHora}`;

      // ==========================================
      // 1. EXPORTAÇÃO EM JSON (PADRÃO RESTAURAÇÃO)
      // ==========================================
      if (formatoExportacao === 'json') {
        let payload;
        if (conteudoExportacao === 'tudo') {
          payload = {
            app: 'Meu Bolso',
            versao: '2.0',
            tipoBackup: 'COMPLETO',
            timestamp: new Date().toISOString(),
            usuario: user?.email || '',
            totais: {
              receitas: (dados.receitas || []).length,
              despesas: (dados.despesas || []).length,
              orcamentos: (dados.orcamentos || []).length,
              cartoes: (dados.cartoes || []).length,
              viagens: (dados.viagens || []).length,
              categorias: (dados.categorias || []).length
            },
            dados: {
              receitas: dados.receitas || [],
              despesas: dados.despesas || [],
              orcamentos: dados.orcamentos || [],
              cartoes: dados.cartoes || [],
              viagens: dados.viagens || [],
              categorias: dados.categorias || []
            },
            // Compatibilidade com versões antigas
            RECEITAS: dados.receitas || [],
            DESPESAS: dados.despesas || [],
            ORCAMENTOS: dados.orcamentos || [],
            CARTOES: dados.cartoes || [],
            VIAGENS: dados.viagens || [],
            CATEGORIAS: dados.categorias || []
          };
        } else {
          payload = {
            app: 'Meu Bolso',
            versao: '2.0',
            tipoBackup: conteudoExportacao.toUpperCase(),
            timestamp: new Date().toISOString(),
            usuario: user?.email || '',
            total: (dados[conteudoExportacao] || []).length,
            dados: {
              [conteudoExportacao]: dados[conteudoExportacao] || []
            },
            [conteudoExportacao]: dados[conteudoExportacao] || []
          };
        }

        const dataStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefixoNome}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // ==========================================
      // 2. EXPORTAÇÃO EM EXCEL (.XLSX)
      // ==========================================
      else if (formatoExportacao === 'xlsx') {
        const wb = XLSX.utils.book_new();

        if (conteudoExportacao === 'tudo') {
          const wsDesp = XLSX.utils.json_to_sheet(prepararLinhasDespesas(dados.despesas));
          const wsRec = XLSX.utils.json_to_sheet(prepararLinhasReceitas(dados.receitas));
          const wsOrc = XLSX.utils.json_to_sheet(prepararLinhasOrcamentos(dados.orcamentos));
          const wsCard = XLSX.utils.json_to_sheet(prepararLinhasCartoes(dados.cartoes));
          const wsViag = XLSX.utils.json_to_sheet(prepararLinhasViagens(dados.viagens));

          XLSX.utils.book_append_sheet(wb, wsDesp, 'Despesas');
          XLSX.utils.book_append_sheet(wb, wsRec, 'Receitas');
          XLSX.utils.book_append_sheet(wb, wsOrc, 'Orçamentos');
          XLSX.utils.book_append_sheet(wb, wsCard, 'Cartões');
          XLSX.utils.book_append_sheet(wb, wsViag, 'Viagens');
        } else if (conteudoExportacao === 'despesas') {
          const ws = XLSX.utils.json_to_sheet(prepararLinhasDespesas(dados.despesas));
          XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
        } else if (conteudoExportacao === 'receitas') {
          const ws = XLSX.utils.json_to_sheet(prepararLinhasReceitas(dados.receitas));
          XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
        } else if (conteudoExportacao === 'orcamentos') {
          const ws = XLSX.utils.json_to_sheet(prepararLinhasOrcamentos(dados.orcamentos));
          XLSX.utils.book_append_sheet(wb, ws, 'Orçamentos');
        } else if (conteudoExportacao === 'cartoes') {
          const ws = XLSX.utils.json_to_sheet(prepararLinhasCartoes(dados.cartoes));
          XLSX.utils.book_append_sheet(wb, ws, 'Cartões');
        } else if (conteudoExportacao === 'viagens') {
          const ws = XLSX.utils.json_to_sheet(prepararLinhasViagens(dados.viagens));
          XLSX.utils.book_append_sheet(wb, ws, 'Viagens');
        }

        XLSX.writeFile(wb, `${prefixoNome}.xlsx`);
      }

      // ==========================================
      // 3. EXPORTAÇÃO EM CSV (GOOGLE SHEETS / EXCEL)
      // ==========================================
      else if (formatoExportacao === 'csv') {
        let linhas = [];
        if (conteudoExportacao === 'tudo' || conteudoExportacao === 'despesas') {
          linhas = prepararLinhasDespesas(dados.despesas);
        } else if (conteudoExportacao === 'receitas') {
          linhas = prepararLinhasReceitas(dados.receitas);
        } else if (conteudoExportacao === 'orcamentos') {
          linhas = prepararLinhasOrcamentos(dados.orcamentos);
        } else if (conteudoExportacao === 'cartoes') {
          linhas = prepararLinhasCartoes(dados.cartoes);
        } else if (conteudoExportacao === 'viagens') {
          linhas = prepararLinhasViagens(dados.viagens);
        }

        if (linhas.length === 0) {
          throw new Error('Nenhum dado encontrado para exportar em CSV.');
        }

        const colunas = Object.keys(linhas[0]);
        // Delimitador ponto-e-vírgula e escape de aspas
        const cabecalho = colunas.join(';');
        const corpo = linhas
          .map((row) =>
            colunas
              .map((col) => {
                const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                return `"${val.replace(/"/g, '""')}"`;
              })
              .join(';')
          )
          .join('\r\n');

        // Adiciona UTF-8 BOM (\uFEFF) para abrir com acentuação perfeita no Excel e Google Sheets
        const csvContent = '\uFEFF' + cabecalho + '\r\n' + corpo;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prefixoNome}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // ==========================================
      // 4. EXPORTAÇÃO EM PDF (RELATÓRIO IMPRESSO)
      // ==========================================
      else if (formatoExportacao === 'pdf') {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Cabeçalho institucional do relatório
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 28, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(212, 175, 55); // Custom Gold
        doc.text('MEU BOLSO - GESTÃO FINANCEIRA', 14, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(240, 240, 240);
        doc.text(`Relatório de Exportação: ${conteudoExportacao.toUpperCase()}`, 14, 19);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 24);

        let tableHead = [];
        let tableBody = [];
        let totalGeral = 0;

        if (conteudoExportacao === 'despesas' || conteudoExportacao === 'tudo') {
          const lista = dados.despesas || [];
          tableHead = [['Data', 'Descrição', 'Categoria', 'Forma / Cartão', 'Status', 'Valor (R$)']];
          tableBody = lista.map((d) => {
            const val = parseFloat(d.valor) || 0;
            totalGeral += val;
            return [
              d.dataLancamento || d.data || '',
              d.descricao || '',
              d.categoria || '',
              d.cartao || 'Conta',
              d.statusPagamento || d.status || 'Pendente',
              formatarMoeda(val)
            ];
          });
        } else if (conteudoExportacao === 'receitas') {
          const lista = dados.receitas || [];
          tableHead = [['Data', 'Descrição', 'Categoria', 'Status', 'Valor (R$)']];
          tableBody = lista.map((r) => {
            const val = parseFloat(r.valor) || 0;
            totalGeral += val;
            return [
              r.data || '',
              r.descricao || '',
              r.categoria || '',
              r.status || 'Recebido',
              formatarMoeda(val)
            ];
          });
        } else if (conteudoExportacao === 'orcamentos') {
          const lista = dados.orcamentos || [];
          tableHead = [['Mês', 'Renda Prevista', 'Dívidas', 'Renda Real', 'Metas']];
          tableBody = lista.map((o) => [
            o.mes || '',
            formatarMoeda(o.rendaPrevista),
            formatarMoeda(o.dividas),
            formatarMoeda(o.rendaReal),
            `${(o.categorias || []).length} metas`
          ]);
        } else {
          // Genérico
          const lista = dados[conteudoExportacao] || [];
          tableHead = [['Item', 'Detalhes']];
          tableBody = lista.map((it, idx) => [`Item #${idx + 1}`, JSON.stringify(it)]);
        }

        autoTable(doc, {
          startY: 34,
          head: tableHead,
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [30, 30, 30]
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          margin: { left: 14, right: 14 }
        });

        // Rodapé de Total quando aplicável
        if (totalGeral > 0) {
          const finalY = doc.lastAutoTable.finalY + 8;
          if (finalY < 280) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text(`Total Acumulado: ${formatarMoeda(totalGeral)}`, 14, finalY);
          }
        }

        doc.save(`${prefixoNome}.pdf`);
      }

      setStatusMessage(
        `Arquivo exportado com sucesso no formato ${formatoExportacao.toUpperCase()} (${conteudoExportacao})!`
      );
      setStatusType('success');
      setModalExportAberto(false);
    } catch (err) {
      console.error(err);
      setStatusMessage(`Falha ao exportar arquivo: ${err.message || 'Erro desconhecido'}`);
      setStatusType('error');
    } finally {
      setIsExporting(false);
    }
  };

  // IMPORTAR E RESTAURAR BACKUP COMPLETO (EXCLUSIVO JSON)
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setStatusMessage(
        'Atenção: A restauração de dados no sistema só aceita arquivos no formato .JSON (o formato oficial de backup). Planilhas Excel ou CSV são exclusivas para uso externo e não podem ser restauradas no sistema.'
      );
      setStatusType('error');
      return;
    }

    setIsImporting(true);
    setStatusMessage('Lendo arquivo de backup e restaurando dados...');
    setStatusType('info');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);

        if (typeof json !== 'object' || json === null) {
          throw new Error('Arquivo de backup inválido ou corrompido.');
        }

        const receitas = json.dados?.receitas || json.receitas || json.RECEITAS || [];
        const despesas = json.dados?.despesas || json.despesas || json.DESPESAS || [];
        let orcamentos = json.dados?.orcamentos || json.orcamentos || json.ORCAMENTOS || [];
        const cartoes = json.dados?.cartoes || json.cartoes || json.CARTOES || [];
        const viagens = json.dados?.viagens || json.viagens || json.VIAGENS || [];
        const categorias = json.dados?.categorias || json.categorias || json.CATEGORIAS || [];

        if (orcamentos && !Array.isArray(orcamentos) && typeof orcamentos === 'object') {
          orcamentos = Object.entries(orcamentos)
            .map(([key, val]) => {
              try {
                return typeof val === 'string' ? JSON.parse(val) : val;
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        }

        const payloadRestauracao = {
          receitas: Array.isArray(receitas) ? receitas : [],
          despesas: Array.isArray(despesas) ? despesas : [],
          orcamentos: Array.isArray(orcamentos) ? orcamentos : [],
          cartoes: Array.isArray(cartoes) ? cartoes : [],
          viagens: Array.isArray(viagens) ? viagens : [],
          categorias: Array.isArray(categorias) ? categorias : []
        };

        await api.post('/user/dados', payloadRestauracao);

        localStorage.setItem('RECEITAS', JSON.stringify(payloadRestauracao.receitas));
        localStorage.setItem('DESPESAS', JSON.stringify(payloadRestauracao.despesas));

        setStatusMessage(
          `Backup restaurado com sucesso! Foram recuperados: ${payloadRestauracao.receitas.length} receitas, ${payloadRestauracao.despesas.length} despesas, ${payloadRestauracao.orcamentos.length} orçamentos, ${payloadRestauracao.cartoes.length} cartões, ${payloadRestauracao.viagens.length} viagens e ${payloadRestauracao.categorias.length} categorias. Recarregando página...`
        );
        setStatusType('success');

        setTimeout(() => {
          window.location.reload();
        }, 1800);
      } catch (err) {
        console.error('Erro na importação do backup:', err);
        setStatusMessage(`Erro ao importar backup: ${err.message || 'Arquivo com formato inválido.'}`);
        setStatusType('error');
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const opcoesConteudo = [
    {
      id: 'tudo',
      titulo: 'Backup Completo (Tudo)',
      desc: 'Receitas, despesas, orçamentos, cartões, viagens e categorias.',
      qtd:
        dadosAtuais.receitas.length +
        dadosAtuais.despesas.length +
        dadosAtuais.orcamentos.length +
        dadosAtuais.cartoes.length +
        dadosAtuais.viagens.length +
        dadosAtuais.categorias.length,
      icon: Layers
    },
    {
      id: 'despesas',
      titulo: 'Somente Despesas',
      desc: 'Contas, boletos, despesas fixas, compras e parcelamentos.',
      qtd: dadosAtuais.despesas.length,
      icon: TrendingDown
    },
    {
      id: 'receitas',
      titulo: 'Somente Receitas',
      desc: 'Salários, rendas extras, investimentos e entradas.',
      qtd: dadosAtuais.receitas.length,
      icon: TrendingUp
    },
    {
      id: 'orcamentos',
      titulo: 'Meu Orçamento',
      desc: 'Renda prevista, metas por categoria em R$ ou %, dívidas e renda real.',
      qtd: dadosAtuais.orcamentos.length,
      unidade: 'meses',
      icon: Target
    },
    {
      id: 'cartoes',
      titulo: 'Somente Cartões',
      desc: 'Cartões configurados, limites e faturas.',
      qtd: dadosAtuais.cartoes.length,
      icon: CreditCard
    },
    {
      id: 'viagens',
      titulo: 'Módulo de Viagens',
      desc: 'Destinos, passagens, hospedagens, passeios e custos vinculados.',
      qtd: dadosAtuais.viagens.length,
      icon: Plane
    }
  ];

  const opcoesFormato = [
    {
      id: 'json',
      ext: '.json',
      nome: 'JSON - Backup Oficial do Sistema',
      badge: '★ RESTAURAÇÃO INTERNA',
      badgeCor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      desc: 'Formato nativo do Meu Bolso. É o ÚNICO formato que pode ser usado posteriormente na opção "Restaurar Dados" para reimportar suas informações no sistema.',
      icon: FileCode2
    },
    {
      id: 'xlsx',
      ext: '.xlsx',
      nome: 'Excel (.xlsx) - Planilhas Tradicionais',
      badge: 'PLANILHAS TRADICIONAIS',
      badgeCor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      desc: 'Gera uma planilha formatada com colunas, valores e cabeçalhos organizada para abrir no Microsoft Excel ou LibreOffice. (Para uso externo; não restaura no sistema).',
      icon: FileSpreadsheet
    },
    {
      id: 'csv',
      ext: '.csv',
      nome: 'CSV - Google Sheets & Universal',
      badge: 'GOOGLE SHEETS / EXCEL',
      badgeCor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      desc: 'Arquivo de texto delimitado por ponto-e-vírgula em UTF-8 com BOM. Perfeito para importar diretamente no Google Planilhas (Google Sheets) ou sistemas contábeis.',
      icon: FileText
    },
    {
      id: 'pdf',
      ext: '.pdf',
      nome: 'PDF - Relatório para Impressão',
      badge: 'RELATÓRIO IMPRESSO',
      badgeCor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      desc: 'Documento visual formatado em A4 pronto para imprimir ou arquivar, com cabeçalho oficial, total acumulado e listagem tabular.',
      icon: FileCheck2
    }
  ];

  const itensCobertos = [
    {
      nome: 'Receitas',
      qtd: dadosAtuais.receitas.length,
      icon: TrendingUp,
      cor: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Todas as receitas fixas, extras e recorrentes cadastradas.'
    },
    {
      nome: 'Despesas',
      qtd: dadosAtuais.despesas.length,
      icon: TrendingDown,
      cor: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/20',
      desc: 'Contas, boletos, despesas parceladas e compras.'
    },
    {
      nome: 'Orçamentos',
      qtd: dadosAtuais.orcamentos.length,
      unidade: 'meses',
      icon: Target,
      cor: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      desc: 'Renda prevista, metas de gastos por categoria em R$ ou %, dívidas e renda real.'
    },
    {
      nome: 'Cartões de Crédito',
      qtd: dadosAtuais.cartoes.length,
      icon: CreditCard,
      cor: 'text-sky-500',
      bg: 'bg-sky-500/10 border-sky-500/20',
      desc: 'Cartões configurados, limites e faturas associadas.'
    },
    {
      nome: 'Módulo de Viagens',
      qtd: dadosAtuais.viagens.length,
      icon: Plane,
      cor: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      desc: 'Itinerários, passagens, hotéis, orçamentos e despesas vinculadas a viagens.'
    },
    {
      nome: 'Categorias e Metas',
      qtd: dadosAtuais.categorias.length,
      icon: Tag,
      cor: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
      desc: 'Categorias personalizadas criadas, subcategorias, cores e ícones.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-custom-color pb-4">
        <div>
          <h2 className="text-3xl font-bold text-custom-main flex items-center gap-3">
            <Save className="w-8 h-8 text-custom-gold" />
            Backup & Exportação de Dados
          </h2>
          <p className="text-custom-main opacity-80 text-sm mt-1">
            Exporte seus dados em JSON para restauração ou em Excel/CSV/PDF para planilhas tradicionais.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-custom-main opacity-70 bg-custom-card border border-custom-color px-3 py-1.5 rounded-full self-start sm:self-auto">
          <Database className="w-3.5 h-3.5 text-custom-gold" />
          <span>Sincronizado com Supabase Cloud</span>
        </div>
      </div>

      {/* STATUS BAR */}
      {statusMessage && (
        <div
          className={`border rounded-lg p-4 flex items-start gap-3 transition-all ${
            statusType === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : statusType === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : statusType === 'error' ? (
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
          )}
          <span className="font-medium text-sm leading-relaxed">{statusMessage}</span>
        </div>
      )}

      {/* RESUMO DO QUE ESTÁ INCLUSO */}
      <section className="bg-custom-card rounded-custom shadow-custom border border-custom-color p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-custom-main flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-custom-gold" />
            Visão Geral dos seus Registros
          </h3>
          <span className="text-xs text-custom-gold font-medium bg-custom-gold/10 px-2.5 py-1 rounded-full border border-custom-gold/20">
            100% dos Dados Primários
          </span>
        </div>

        <p className="text-sm text-custom-main opacity-80 mb-4">
          O sistema armazena todas as suas entidades. Relatórios, DRE e Gráficos são demonstrativos
          dinâmicos calculados em tempo real a partir desses dados, portanto são integralmente
          reconstituídos ao restaurar seu arquivo JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {itensCobertos.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border ${item.bg} flex flex-col justify-between transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.cor}`} />
                    <span className="font-semibold text-sm text-custom-main">{item.nome}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 text-custom-main border border-white/5">
                    {loading ? '...' : `${item.qtd} ${item.unidade || 'itens'}`}
                  </span>
                </div>
                <p className="text-xs text-custom-main opacity-70 line-clamp-2">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GRID DE AÇÕES: EXPORTAR E IMPORTAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPORTAR DADOS */}
        <section className="bg-custom-card rounded-custom shadow-custom border border-custom-color p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-custom-main mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-500" />
              Exportar Dados & Backup
            </h3>
            <p className="text-custom-main opacity-80 mb-4 text-sm leading-relaxed">
              Personalize o que deseja baixar (backup completo, somente despesas, receitas ou orçamento)
              e escolha o formato desejado: <strong>JSON</strong> para restauração interna no sistema, ou{' '}
              <strong>Excel (.xlsx) / CSV / PDF</strong> para suas planilhas e relatórios externos.
            </p>
          </div>
          <button
            onClick={() => setModalExportAberto(true)}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Configurar e Exportar Arquivo
          </button>
        </section>

        {/* IMPORTAR / RESTAURAR */}
        <section className="bg-custom-card rounded-custom shadow-custom border border-custom-color p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-custom-main mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" />
              Restaurar Backup do Sistema
            </h3>
            <p className="text-custom-main opacity-80 mb-4 text-sm leading-relaxed">
              Selecione um arquivo <code>.json</code> oficial previamente exportado. O sistema
              restaurará todos os seus registros no Supabase e atualizará a aplicação na hora.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2.5 mb-4 text-xs text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Somente arquivos <strong>.JSON</strong> são aceitos para restaurar no sistema.</span>
            </div>
          </div>
          <label className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition">
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Restaurando dados...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Selecionar Arquivo JSON para Restaurar
              </>
            )}
            <input
              type="file"
              accept=".json"
              className="hidden"
              disabled={isImporting}
              onChange={handleImport}
            />
          </label>
        </section>
      </div>

      {/* SNAPSHOT AUTOMÁTICO LOCAL */}
      <section className="bg-custom-card rounded-custom shadow-custom border border-custom-color p-5 text-custom-main flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-custom-main mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-custom-gold" />
            Snapshot Automático Local
          </h3>
          <p className="text-custom-main opacity-75 text-xs">
            Um snapshot preventivo é atualizado automaticamente a cada 5 minutos no seu navegador.
          </p>
          <p className="text-xs text-custom-gold font-medium mt-1">
            Último snapshot:{' '}
            {lastAutoBackup ? lastAutoBackup.toLocaleString('pt-BR') : 'Ainda não realizado nesta sessão'}
          </p>
        </div>
        <button
          onClick={performAutoBackup}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-custom-card border border-custom-gold text-custom-gold font-semibold rounded hover:bg-custom-gold hover:text-black transition text-xs whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Criar Snapshot Agora
        </button>
      </section>

      {/* MODAL / ASSISTENTE DE EXPORTAÇÃO PERSONALIZADA */}
      {modalExportAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-custom-card border border-custom-color rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-custom-color pb-3">
              <div>
                <h3 className="text-xl font-bold text-custom-main flex items-center gap-2">
                  <Download className="w-5 h-5 text-custom-gold" />
                  Assistente de Exportação de Dados
                </h3>
                <p className="text-xs text-custom-main opacity-75 mt-0.5">
                  Escolha o conteúdo e o formato de saída ideal para a sua necessidade.
                </p>
              </div>
              <button
                onClick={() => setModalExportAberto(false)}
                className="p-1 rounded-lg text-custom-main opacity-70 hover:opacity-100 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PASSO 1: O QUE DESEJA EXPORTAR? */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-custom-main flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-custom-gold text-black flex items-center justify-center text-xs font-bold">
                  1
                </span>
                O que você deseja exportar?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {opcoesConteudo.map((opcao) => {
                  const Icon = opcao.icon;
                  const isSelected = conteudoExportacao === opcao.id;
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => setConteudoExportacao(opcao.id)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-custom-gold bg-custom-gold/10 ring-1 ring-custom-gold'
                          : 'border-custom-color bg-custom-card hover:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isSelected ? 'text-custom-gold' : 'text-custom-main'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-custom-main">
                            {opcao.titulo}
                          </span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-custom-gold">
                            {opcao.qtd} {opcao.unidade || 'itens'}
                          </span>
                        </div>
                        <p className="text-xs text-custom-main opacity-70 mt-0.5 line-clamp-1">
                          {opcao.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASSO 2: QUAL FORMATO DESEJA? */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-custom-main flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-custom-gold text-black flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Qual é o formato de arquivo desejado?
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {opcoesFormato.map((opcao) => {
                  const Icon = opcao.icon;
                  const isSelected = formatoExportacao === opcao.id;
                  return (
                    <div
                      key={opcao.id}
                      onClick={() => setFormatoExportacao(opcao.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-custom-gold bg-custom-gold/10 ring-1 ring-custom-gold'
                          : 'border-custom-color bg-custom-card hover:bg-white/5 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? 'text-custom-gold' : 'text-custom-main'
                            }`}
                          />
                          <span className="font-bold text-sm text-custom-main">{opcao.nome}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${opcao.badgeCor}`}>
                          {opcao.badge}
                        </span>
                      </div>
                      <p className="text-xs text-custom-main opacity-80 leading-relaxed pl-6">
                        {opcao.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AVISO DIDÁTICO / DESTAQUE CONFORME O FORMATO */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                formatoExportacao === 'json'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {formatoExportacao === 'json' ? (
                  <span>
                    <strong>Formato para Restauração Interna:</strong> O arquivo <code>.json</code>{' '}
                    é o formato oficial do sistema Meu Bolso. Se você formatar o computador ou quiser
                    transferir para outro usuário, utilize este arquivo na opção <strong>"Restaurar Dados"</strong>.
                  </span>
                ) : (
                  <span>
                    <strong>Exportação para Planilhas Tradicionais:</strong> O formato{' '}
                    <code>.{formatoExportacao.toUpperCase()}</code> foi gerado para você abrir no Excel,
                    Google Sheets ou imprimir. <strong>Atenção:</strong> ele serve para análise pessoal e
                    não pode ser usado para restaurar o sistema automaticamente.
                  </span>
                )}
              </div>
            </div>

            {/* AÇÕES FINAIS DO MODAL */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-custom-color">
              <button
                type="button"
                onClick={() => setModalExportAberto(false)}
                className="px-4 py-2 text-sm rounded-lg border border-custom-color text-custom-main hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executarExportacao}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar {opcoesConteudo.find((c) => c.id === conteudoExportacao)?.titulo} (
                    .{formatoExportacao.toUpperCase()})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backup;
