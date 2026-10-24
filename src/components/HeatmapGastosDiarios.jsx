import React, { useState, useMemo } from 'react';
import {
  Calendar, Flame, DollarSign, TrendingUp, Sparkles,
  ShoppingBag, HelpCircle, Layers, BarChart2, Hash, ArrowRight
} from 'lucide-react';

const DIAS_SEMANA_CABECALHO = [
  { dayIndex: 0, sigla: 'Dom', label: 'Domingo', fimDeSemana: true },
  { dayIndex: 1, sigla: 'Seg', label: 'Segunda-feira', fimDeSemana: false },
  { dayIndex: 2, sigla: 'Ter', label: 'Terça-feira', fimDeSemana: false },
  { dayIndex: 3, sigla: 'Qua', label: 'Quarta-feira', fimDeSemana: false },
  { dayIndex: 4, sigla: 'Qui', label: 'Quinta-feira', fimDeSemana: false },
  { dayIndex: 5, sigla: 'Sex', label: 'Sexta-feira', fimDeSemana: false },
  { dayIndex: 6, sigla: 'Sáb', label: 'Sábado', fimDeSemana: true },
];

const CARDS_DIAS_CONFIG = [
  { dayIndex: 1, sigla: 'Seg', label: 'Segunda', icone: '💼' },
  { dayIndex: 2, sigla: 'Ter', label: 'Terça', icone: '📊' },
  { dayIndex: 3, sigla: 'Qua', label: 'Quarta', icone: '☕' },
  { dayIndex: 4, sigla: 'Qui', label: 'Quinta', icone: '⚡' },
  { dayIndex: 5, sigla: 'Sex', label: 'Sexta', icone: '🎉' },
  { dayIndex: 6, sigla: 'Sáb', label: 'Sábado', icone: '🛍️' },
  { dayIndex: 0, sigla: 'Dom', label: 'Domingo', icone: '☀️' },
];

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const formatarCompacto = (valor) => {
  if (!valor || valor === 0) return '';
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1).replace('.', ',')}M`;
  }
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return Math.round(valor).toString();
};

const HeatmapGastosDiarios = ({
  despesas = [],
  anoSelecionado,
  mesSelecionado,
  periodoSelecionado = 'mensal',
  formatarMoeda,
  theme
}) => {
  const [metricaAtiva, setMetricaAtiva] = useState('valor'); // 'valor' | 'qtd' | 'ticket'
  const [hoveredCell, setHoveredCell] = useState(null);

  const ano = parseInt(anoSelecionado) || new Date().getFullYear();
  const mes = parseInt(mesSelecionado) || (new Date().getMonth() + 1);
  const nomeMes = NOMES_MESES[mes - 1] || 'Mês';

  const {
    cardsDias,
    diaPico,
    diaPicoMes,
    calendarioSemanas,
    totalGeral,
    totalQtdGeral,
    ticketMedioGeral,
    maxValorDia,
    maxQtdDia,
    maxTicketDia,
    diasComGastosCount,
    insights
  } = useMemo(() => {
    const totalDiasMes = new Date(ano, mes, 0).getDate();
    // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
    const diasMesAnterior = new Date(ano, mes - 1, 0).getDate();

    // Map para armazenar despesas por dia do mês (1 a totalDiasMes)
    const despesasPorDia = {};
    for (let d = 1; d <= totalDiasMes; d++) {
      despesasPorDia[d] = {
        dia: d,
        valor: 0,
        qtd: 0,
        itens: [],
        categoriasMap: {}
      };
    }

    // Inicializar agregadores por dia da semana
    const agregadorDiasSemana = {
      0: { valor: 0, qtd: 0, categorias: {} }, // Dom
      1: { valor: 0, qtd: 0, categorias: {} }, // Seg
      2: { valor: 0, qtd: 0, categorias: {} }, // Ter
      3: { valor: 0, qtd: 0, categorias: {} }, // Qua
      4: { valor: 0, qtd: 0, categorias: {} }, // Qui
      5: { valor: 0, qtd: 0, categorias: {} }, // Sex
      6: { valor: 0, qtd: 0, categorias: {} }, // Sáb
    };

    let somaGeral = 0;
    let countGeral = 0;

    despesas.forEach(item => {
      if (!item.data) return;
      let dAno, dMes, dDia;

      if (item.data.includes('-')) {
        const parts = item.data.split('-');
        dAno = parseInt(parts[0]);
        dMes = parseInt(parts[1]);
        dDia = parseInt(parts[2]);
      } else if (item.data.includes('/')) {
        const parts = item.data.split('/');
        dDia = parseInt(parts[0]);
        dMes = parseInt(parts[1]);
        dAno = parseInt(parts[2]);
      }

      // Se for filtro mensal, valida mês e ano
      if (periodoSelecionado === 'mensal' && (dAno !== ano || dMes !== mes)) {
        return;
      }

      const val = Number(item.valor) || 0;
      if (val <= 0) return;

      somaGeral += val;
      countGeral += 1;

      // Dia do mês válido
      if (dDia >= 1 && dDia <= totalDiasMes && despesasPorDia[dDia]) {
        despesasPorDia[dDia].valor += val;
        despesasPorDia[dDia].qtd += 1;
        despesasPorDia[dDia].itens.push(item);

        const cat = item.categoria || 'Outros';
        despesasPorDia[dDia].categoriasMap[cat] = (despesasPorDia[dDia].categoriasMap[cat] || 0) + val;
      }

      // Dia da semana
      const dateObj = new Date(dAno, dMes - 1, dDia);
      if (!isNaN(dateObj.getTime())) {
        const diaSem = dateObj.getDay();
        if (agregadorDiasSemana[diaSem]) {
          agregadorDiasSemana[diaSem].valor += val;
          agregadorDiasSemana[diaSem].qtd += 1;
          const cat = item.categoria || 'Outros';
          agregadorDiasSemana[diaSem].categorias[cat] = (agregadorDiasSemana[diaSem].categorias[cat] || 0) + val;
        }
      }
    });

    // Encontrar dia da semana de pico
    let maxValorDiaSemana = -1;
    let picoDiaSemanaKey = 1;
    Object.keys(agregadorDiasSemana).forEach(key => {
      if (agregadorDiasSemana[key].valor > maxValorDiaSemana) {
        maxValorDiaSemana = agregadorDiasSemana[key].valor;
        picoDiaSemanaKey = parseInt(key);
      }
    });

    // Encontrar o dia específico do mês com maior gasto (Pico absoluto do mês)
    let maxValDiaMes = 0;
    let diaPicoDoMes = null;
    let maxQtdDiaMes = 0;
    let maxTicketDiaMes = 0;
    let diasComGastos = 0;

    Object.values(despesasPorDia).forEach(d => {
      if (d.valor > 0) diasComGastos += 1;
      if (d.valor > maxValDiaMes) {
        maxValDiaMes = d.valor;
        diaPicoDoMes = d.dia;
      }
      if (d.qtd > maxQtdDiaMes) maxQtdDiaMes = d.qtd;
      const t = d.qtd > 0 ? d.valor / d.qtd : 0;
      if (t > maxTicketDiaMes) maxTicketDiaMes = t;
    });

    // Gerar cards dos dias da semana (Segunda a Domingo)
    const cards = CARDS_DIAS_CONFIG.map(diaCfg => {
      const info = agregadorDiasSemana[diaCfg.dayIndex];
      const percentual = somaGeral > 0 ? (info.valor / somaGeral) * 100 : 0;
      const ticketMedio = info.qtd > 0 ? info.valor / info.qtd : 0;
      const isPico = diaCfg.dayIndex === picoDiaSemanaKey && info.valor > 0;

      let topCat = 'N/A';
      let maxCatVal = -1;
      Object.entries(info.categorias).forEach(([cat, val]) => {
        if (val > maxCatVal) {
          maxCatVal = val;
          topCat = cat;
        }
      });

      return {
        ...diaCfg,
        valor: info.valor,
        qtd: info.qtd,
        percentual,
        ticketMedio,
        isPico,
        topCat
      };
    });

    // Construção do Calendário Mensal Real (Semanas como Linhas, Dias como Colunas Dom a Sáb)
    const numSemanas = Math.ceil((totalDiasMes + primeiroDiaSemana) / 7);
    const semanas = [];

    const hoje = new Date();
    const isMesAtual = hoje.getFullYear() === ano && (hoje.getMonth() + 1) === mes;
    const diaHoje = isMesAtual ? hoje.getDate() : -1;

    for (let w = 0; w < numSemanas; w++) {
      let totalSemanaValor = 0;
      let totalSemanaQtd = 0;
      const diasDaSemana = [];

      for (let d = 0; d < 7; d++) {
        // dia do mês: offset pela semana e pelo primeiro dia
        const diaNum = w * 7 + d - primeiroDiaSemana + 1;

        if (diaNum >= 1 && diaNum <= totalDiasMes) {
          const dadosDia = despesasPorDia[diaNum];
          const val = dadosDia ? dadosDia.valor : 0;
          const qtd = dadosDia ? dadosDia.qtd : 0;
          const ticket = qtd > 0 ? val / qtd : 0;

          totalSemanaValor += val;
          totalSemanaQtd += qtd;

          diasDaSemana.push({
            dia: diaNum,
            isCurrentMonth: true,
            isHoje: diaNum === diaHoje,
            isPicoDoMes: diaNum === diaPicoDoMes && val > 0,
            valor: val,
            qtd,
            ticket,
            dataStr: `${String(diaNum).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`,
            diaSemanaNome: DIAS_SEMANA_CABECALHO[d].label,
            categoriasMap: dadosDia ? dadosDia.categoriasMap : {}
          });
        } else if (diaNum < 1) {
          // Dia do mês anterior (preenchimento visual suave de calendário)
          diasDaSemana.push({
            dia: diasMesAnterior + diaNum,
            isCurrentMonth: false,
            isHoje: false,
            isPicoDoMes: false,
            valor: 0,
            qtd: 0,
            ticket: 0,
            dataStr: '',
            diaSemanaNome: '',
            categoriasMap: {}
          });
        } else {
          // Dia do próximo mês
          diasDaSemana.push({
            dia: diaNum - totalDiasMes,
            isCurrentMonth: false,
            isHoje: false,
            isPicoDoMes: false,
            valor: 0,
            qtd: 0,
            ticket: 0,
            dataStr: '',
            diaSemanaNome: '',
            categoriasMap: {}
          });
        }
      }

      semanas.push({
        numeroSemana: w + 1,
        dias: diasDaSemana,
        totalValor: totalSemanaValor,
        totalQtd: totalSemanaQtd,
        ticketMedio: totalSemanaQtd > 0 ? totalSemanaValor / totalSemanaQtd : 0
      });
    }

    // Insights Comportamentais
    const cardPico = cards.find(c => c.isPico);
    const diasUteisValor = cards
      .filter(c => c.dayIndex >= 1 && c.dayIndex <= 5)
      .reduce((acc, c) => acc + c.valor, 0);
    const percUteis = somaGeral > 0 ? Math.round((diasUteisValor / somaGeral) * 100) : 0;
    const percFimDeSemana = 100 - percUteis;

    // Semana com maior gasto
    let semanaPicoObj = semanas[0];
    let maxSemVal = -1;
    semanas.forEach(s => {
      if (s.totalValor > maxSemVal) {
        maxSemVal = s.totalValor;
        semanaPicoObj = s;
      }
    });

    const insightsGerados = {
      diaPicoNome: cardPico ? cardPico.label : 'N/A',
      diaPicoValor: cardPico ? cardPico.valor : 0,
      diaPicoPerc: cardPico ? Math.round(cardPico.percentual) : 0,
      diaPicoTopCat: cardPico ? cardPico.topCat : 'N/A',
      diaPicoMesNum: diaPicoDoMes,
      diaPicoMesValor: maxValDiaMes,
      percUteis,
      percFimDeSemana,
      semanaPicoNum: semanaPicoObj ? semanaPicoObj.numeroSemana : 1,
      semanaPicoValor: maxSemVal > 0 ? maxSemVal : 0,
      semanaPicoPerc: somaGeral > 0 ? Math.round((maxSemVal / somaGeral) * 100) : 0
    };

    return {
      cardsDias: cards,
      diaPico: cardPico,
      diaPicoMes: diaPicoDoMes,
      calendarioSemanas: semanas,
      totalGeral: somaGeral,
      totalQtdGeral: countGeral,
      ticketMedioGeral: countGeral > 0 ? somaGeral / countGeral : 0,
      maxValorDia: maxValDiaMes,
      maxQtdDia: maxQtdDiaMes,
      maxTicketDia: maxTicketDiaMes,
      diasComGastosCount: diasComGastos,
      insights: insightsGerados
    };
  }, [despesas, ano, mes, periodoSelecionado]);

  // Função para intensidade térmica da célula do calendário
  const getCellIntensity = (cell) => {
    if (!cell.isCurrentMonth) {
      return {
        bg: 'bg-black/5 dark:bg-white/[0.02]',
        border: 'border-transparent opacity-30',
        text: 'text-custom-main opacity-20'
      };
    }

    if (cell.valor === 0) {
      return {
        bg: 'bg-custom-card hover:bg-custom-primary/40',
        border: 'border-custom-color/50',
        text: 'text-custom-main opacity-70'
      };
    }

    let ratio = 0;
    if (metricaAtiva === 'valor' && maxValorDia > 0) {
      ratio = cell.valor / maxValorDia;
    } else if (metricaAtiva === 'qtd' && maxQtdDia > 0) {
      ratio = cell.qtd / maxQtdDia;
    } else if (metricaAtiva === 'ticket' && maxTicketDia > 0) {
      ratio = cell.ticket / maxTicketDia;
    }

    // Escala térmica de calor sofisticada (dourado/âmbar elegante, sem roxo)
    if (ratio > 0.75) {
      return {
        bg: 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500',
        border: 'border-amber-600',
        badge: 'bg-black/30 text-white',
        text: 'text-white font-extrabold'
      };
    }
    if (ratio > 0.45) {
      return {
        bg: 'bg-amber-500/80 text-white shadow-xs',
        border: 'border-amber-500',
        badge: 'bg-black/25 text-white',
        text: 'text-white font-bold'
      };
    }
    if (ratio > 0.2) {
      return {
        bg: 'bg-custom-gold/30 text-custom-main',
        border: 'border-custom-gold/60',
        badge: 'bg-custom-gold/40 text-custom-main',
        text: 'text-custom-main font-semibold'
      };
    }
    return {
      bg: 'bg-custom-gold/15 text-custom-main',
      border: 'border-custom-gold/30',
      badge: 'bg-custom-gold/25 text-custom-main',
      text: 'text-custom-main'
    };
  };

  return (
    <div className="bg-custom-card p-6 rounded-custom shadow-custom border border-custom-color transition-colors flex flex-col gap-6">
      {/* 1. Header do Módulo com Seletor de Métricas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-custom-color">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-custom-gold/15 text-custom-gold border border-custom-gold/30">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-custom-main">
                  Calendário Térmico de Gastos Diários
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Avançado PRO
                </span>
              </div>
              <p className="text-xs text-custom-main opacity-70 mt-0.5">
                Visualização clássica em calendário mensal • Identifique dias com maior concentração de gastos e padrões de consumo
              </p>
            </div>
          </div>
        </div>

        {/* Alternador de Métricas */}
        <div className="flex items-center bg-custom-primary/50 p-1 rounded-xl border border-custom-color self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setMetricaAtiva('valor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricaAtiva === 'valor'
                ? 'bg-custom-gold text-black shadow-xs font-extrabold'
                : 'text-custom-main opacity-70 hover:opacity-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Valor (R$)</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricaAtiva('qtd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricaAtiva === 'qtd'
                ? 'bg-custom-gold text-black shadow-xs font-extrabold'
                : 'text-custom-main opacity-70 hover:opacity-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Qtd Gastos</span>
          </button>

          <button
            type="button"
            onClick={() => setMetricaAtiva('ticket')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metricaAtiva === 'ticket'
                ? 'bg-custom-gold text-black shadow-xs font-extrabold'
                : 'text-custom-main opacity-70 hover:opacity-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Ticket Médio</span>
          </button>
        </div>
      </div>

      {/* 2. Cards de Resumo Semanal no Topo */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-custom-main opacity-75 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-custom-gold" />
            <span>Despesas por Dia da Semana ({nomeMes} de {ano})</span>
          </h4>
          <span className="text-[11px] text-custom-main opacity-60">
            Total do Mês: <strong className="text-custom-main opacity-90">{formatarMoeda(totalGeral)}</strong> ({totalQtdGeral} registros em {diasComGastosCount} dias)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {cardsDias.map(card => (
            <div
              key={card.sigla}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                card.isPico
                  ? 'bg-custom-gold/10 border-custom-gold shadow-xs'
                  : 'bg-custom-primary/30 border-custom-color'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-custom-main flex items-center gap-1 truncate">
                  <span>{card.icone}</span>
                  <span>{card.sigla}</span>
                </span>
                {card.isPico && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                    <Flame className="w-2.5 h-2.5" />
                    PICO
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-custom-main">{card.qtd}</span>
                  <span className="text-[10px] text-custom-main opacity-60">gastos</span>
                </div>
                <span className="text-xs font-bold text-custom-gold">
                  {card.percentual.toFixed(0)}%
                </span>
              </div>

              <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    card.isPico ? 'bg-amber-500' : 'bg-custom-gold/70'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(card.percentual, 3))}%` }}
                />
              </div>

              <div className="pt-2 border-t border-custom-color/40 flex flex-col gap-0.5">
                <span className="text-xs font-bold text-custom-main truncate">
                  {formatarMoeda(card.valor)}
                </span>
                <span className="text-[10px] text-custom-main opacity-65 truncate">
                  ticket {formatarMoeda(card.ticketMedio)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CALENDÁRIO MENSAL TÉRMICO (Totalmente amigável e familiar para o usuário) */}
      <div className="border border-custom-color rounded-2xl p-4 sm:p-5 bg-custom-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-custom-color/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-custom-gold" />
            <span className="text-sm font-bold text-custom-main uppercase tracking-wider">
              {nomeMes} de {ano}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-custom-main opacity-70">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-custom-card border border-custom-color"></span>
              <span>Sem gasto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-custom-gold/25 border border-custom-gold/40"></span>
              <span>Gasto moderado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-600 text-white font-bold text-[8px] flex items-center justify-center">🔥</span>
              <span>Pico de gastos</span>
            </div>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Linha de Cabeçalho: Dias da Semana + Total da Semana */}
            <div className="grid grid-cols-8 gap-2 mb-2 text-center text-xs font-bold text-custom-main opacity-80 select-none">
              {DIAS_SEMANA_CABECALHO.map(dia => (
                <div
                  key={dia.sigla}
                  className={`py-2 px-1 rounded-lg ${dia.fimDeSemana ? 'text-amber-500 font-extrabold' : ''}`}
                >
                  <span>{dia.sigla}</span>
                </div>
              ))}
              <div className="py-2 px-1 text-right pr-2 text-custom-gold font-extrabold uppercase text-[10px] tracking-wider">
                Total Sem.
              </div>
            </div>

            {/* Linhas das Semanas */}
            <div className="space-y-2">
              {calendarioSemanas.map((semana) => (
                <div key={semana.numeroSemana} className="grid grid-cols-8 gap-2 items-center">
                  {/* 7 Células de Dias (Dom a Sáb) */}
                  {semana.dias.map((celula, dIdx) => {
                    const style = getCellIntensity(celula);
                    const isHovered = hoveredCell && hoveredCell.dia === celula.dia && celula.isCurrentMonth;

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={() => celula.isCurrentMonth && setHoveredCell(celula)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`relative h-20 sm:h-22 rounded-xl border p-2 flex flex-col justify-between transition-all duration-200 select-none ${
                          style.border
                        } ${style.bg} ${
                          celula.isCurrentMonth ? 'cursor-pointer hover:scale-[1.02] shadow-xs' : 'cursor-default pointer-events-none'
                        }`}
                      >
                        {/* Topo da Célula: Número do Dia + Indicador de Hoje/Pico */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold leading-none ${
                              celula.isHoje
                                ? 'w-5 h-5 rounded-full bg-custom-gold text-black flex items-center justify-center shadow-xs'
                                : style.text
                            }`}
                          >
                            {celula.dia}
                          </span>

                          {celula.isPicoDoMes && (
                            <span
                              className="text-[9px] font-extrabold px-1 rounded bg-black/30 text-amber-300 flex items-center gap-0.5"
                              title="Maior gasto diário do mês"
                            >
                              <Flame className="w-2.5 h-2.5" />
                              Pico
                            </span>
                          )}
                        </div>

                        {/* Centro/Rodapé da Célula: Métricas de Gasto */}
                        {celula.isCurrentMonth && celula.valor > 0 ? (
                          <div className="flex flex-col gap-0.5 mt-auto">
                            <span className="text-xs font-extrabold truncate">
                              {metricaAtiva === 'valor'
                                ? formatarMoeda(celula.valor)
                                : metricaAtiva === 'qtd'
                                ? `${celula.qtd} gastos`
                                : formatarMoeda(celula.ticket)}
                            </span>
                            <span className="text-[9px] opacity-75 truncate">
                              {metricaAtiva === 'valor'
                                ? `${celula.qtd} ${celula.qtd === 1 ? 'gasto' : 'gastos'}`
                                : metricaAtiva === 'qtd'
                                ? formatarMoeda(celula.valor)
                                : `${celula.qtd} reg`}
                            </span>
                          </div>
                        ) : celula.isCurrentMonth ? (
                          <span className="text-[10px] opacity-30 mt-auto">-</span>
                        ) : null}

                        {/* Tooltip Detalhado no Hover */}
                        {isHovered && celula.valor > 0 && (
                          <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 rounded-xl bg-custom-card text-custom-main border border-custom-gold shadow-2xl text-left pointer-events-none animate-fade-in">
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-custom-color text-[11px] font-bold">
                              <span>{celula.dataStr}</span>
                              <span className="text-custom-gold">{celula.diaSemanaNome}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-[10px]">
                              <div className="flex justify-between">
                                <span className="opacity-70">Total Gasto:</span>
                                <span className="font-bold text-red-500">{formatarMoeda(celula.valor)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Transações:</span>
                                <span className="font-bold">{celula.qtd} despesas</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Ticket Médio:</span>
                                <span className="font-bold">{formatarMoeda(celula.ticket)}</span>
                              </div>

                              {Object.keys(celula.categoriasMap).length > 0 && (
                                <div className="pt-1.5 mt-1 border-t border-custom-color/50">
                                  <span className="opacity-70 block mb-0.5 font-semibold">Categorias no dia:</span>
                                  {Object.entries(celula.categoriasMap).slice(0, 3).map(([cat, val]) => (
                                    <div key={cat} className="flex justify-between text-[9px] opacity-85">
                                      <span className="truncate max-w-[110px]">{cat}:</span>
                                      <span className="font-bold">{formatarMoeda(val)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 8ª Coluna: Total da Linha (Semana) */}
                  <div className="h-20 sm:h-22 rounded-xl bg-custom-primary/40 border border-custom-color/70 p-2.5 flex flex-col justify-between text-right">
                    <span className="text-[10px] font-bold text-custom-gold uppercase tracking-wider">
                      Sem. {semana.numeroSemana}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-custom-main truncate">
                        {metricaAtiva === 'valor'
                          ? formatarMoeda(semana.totalValor)
                          : metricaAtiva === 'qtd'
                          ? `${semana.totalQtd} gastos`
                          : formatarMoeda(semana.ticketMedio)}
                      </span>
                      <span className="text-[9px] text-custom-main opacity-60">
                        {semana.totalQtd} reg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé Resumo do Calendário */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-custom-color/60 text-xs text-custom-main">
              <div className="p-2.5 rounded-xl bg-custom-primary/30 border border-custom-color flex flex-col">
                <span className="opacity-70 text-[10px] uppercase font-bold">Total Desembolsado</span>
                <span className="text-sm font-extrabold text-custom-gold mt-0.5">{formatarMoeda(totalGeral)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-custom-primary/30 border border-custom-color flex flex-col">
                <span className="opacity-70 text-[10px] uppercase font-bold">Média Diária (30 dias)</span>
                <span className="text-sm font-bold text-custom-main mt-0.5">{formatarMoeda(totalGeral / 30)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-custom-primary/30 border border-custom-color flex flex-col">
                <span className="opacity-70 text-[10px] uppercase font-bold">Dias com Despesas</span>
                <span className="text-sm font-bold text-custom-main mt-0.5">{diasComGastosCount} de {new Date(ano, mes, 0).getDate()} dias</span>
              </div>
              <div className="p-2.5 rounded-xl bg-custom-primary/30 border border-custom-color flex flex-col">
                <span className="opacity-70 text-[10px] uppercase font-bold">Pico do Mês (Dia {diaPicoMes || '-'})</span>
                <span className="text-sm font-bold text-amber-500 mt-0.5">{diaPicoMes ? formatarMoeda(maxValorDia) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Diagnóstico Comportamental FINAN */}
      <div className="p-4 rounded-xl border border-custom-gold/40 bg-custom-gold/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-custom-gold/20 text-custom-gold border border-custom-gold/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-custom-main flex items-center gap-2">
              <span>Diagnóstico de Hábitos do FINAN</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-custom-gold/20 text-custom-gold font-bold">
                Análise Preditiva
              </span>
            </h5>
            <p className="text-xs text-custom-main opacity-85 leading-relaxed">
              {totalGeral > 0 ? (
                <>
                  Você concentra a maior parte dos seus gastos às <strong>{insights.diaPicoNome}</strong> ({formatarMoeda(insights.diaPicoValor)} — <strong>{insights.diaPicoPerc}%</strong> do mês), com maior frequência na categoria <strong>{insights.diaPicoTopCat}</strong>. 
                  Os <strong>dias úteis</strong> respondem por <strong>{insights.percUteis}%</strong> das despesas e a <strong>Semana {insights.semanaPicoNum}</strong> registrou o maior volume ({formatarMoeda(insights.semanaPicoValor)}).
                </>
              ) : (
                'Nenhuma despesa registrada para o período selecionado para traçar o perfil comportamental.'
              )}
            </p>
          </div>
        </div>

        {totalGeral > 0 && (
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 bg-custom-card px-3 py-2 rounded-xl border border-custom-color text-xs">
            <TrendingUp className="w-4 h-4 text-custom-gold" />
            <span className="text-custom-main opacity-80">
              Ticket Médio Geral: <strong className="text-custom-main">{formatarMoeda(ticketMedioGeral)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapGastosDiarios;
