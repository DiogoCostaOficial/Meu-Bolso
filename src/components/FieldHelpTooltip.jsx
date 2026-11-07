import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Dicionário completo de explicações de campos de todas as telas do sistema
 * Cada chave é normalizada (sem acentos, minúscula, sem asteriscos/dois-pontos)
 */
function normalizeKey(str) {
  return String(str || '')
    .replace(/\?/g, '')
    .replace(/\*/g, '')
    .replace(/:/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const RAW_FIELD_HELP = {
  // =========================================================================
  // DESPESAS & RECEITAS
  // =========================================================================
  'descricao': {
    text: 'Informe um título curto e claro que identifique onde ou com o quê o dinheiro foi gasto ou recebido.',
    example: '*Exemplo: "Supermercado Compra do Mês", "Conta de Energia", "Salário Mensal" ou "Aluguel".',
    note: '**OBS: Uma boa descrição facilita encontrar o lançamento depois usando a barra de busca nos Filtros.'
  },
  'valor': {
    text: 'Digite o valor monetário total da transação utilizando números e casas decimais.',
    example: '*Exemplo: Digite 150.00 para cento e cinquenta reais. Se for uma despesa parcelada, informe o valor total da compra para que o sistema divida pelas parcelas.',
    note: '**OBS: O valor será convertido automaticamente caso você alterne a moeda de visualização no topo da tela.'
  },
  'data despesa (sistema)': {
    text: 'Informe a data de lançamento da despesa no sistema. Esta é a data principal utilizada para contabilizar o gasto no mês correspondente do seu Orçamento e Relatórios.',
    example: '*Exemplo: Você está lançando hoje (05/11) uma despesa no sistema. Se a compra também aconteceu hoje, basta manter esta data preenchida.',
    note: "**OBS: Caso a compra tenha sido feita em uma data anterior ao lançamento de hoje, informe o dia exato da compra no campo 'Data compra retroativo (opcional)'."
  },
  'data da despesa': {
    text: 'Informe a data de lançamento da despesa no sistema. Esta é a data principal utilizada para contabilizar o gasto no mês correspondente do seu Orçamento e Relatórios.',
    example: '*Exemplo: Você está lançando hoje (05/11) uma despesa no sistema. Se a compra também aconteceu hoje, basta manter esta data preenchida.',
    note: "**OBS: Caso a compra tenha sido feita em uma data anterior ao lançamento de hoje, informe o dia exato da compra no campo 'Data compra retroativo (opcional)'."
  },
  'data compra retroativo (opcional)': {
    text: 'Utilize este campo para informar de forma retroativa quando foi realizada uma compra cujo lançamento no sistema está sendo feito em outra data. Assim você preserva a data exata da compra.',
    example: '*Exemplo: Posso lançar um título de despesa no dia de hoje, 05/11 (lançamento no sistema), porém a data em que comprei o item foi no dia 01/11. Preencha 01/11 neste campo de forma retroativa.',
    note: '**OBS: Se o lançamento no sistema está sendo feito no mesmo dia da compra, deixe este campo em branco.'
  },
  'data compra retroativo': {
    text: 'Utilize este campo para informar de forma retroativa quando foi realizada uma compra cujo lançamento no sistema está sendo feito em outra data.',
    example: '*Exemplo: Lançamento feito hoje (05/11) referente a uma compra realizada em 01/11.'
  },
  'data da compra (opcional)': {
    text: 'Utilize este campo para informar de forma retroativa quando foi realizada uma compra cujo lançamento no sistema está sendo feito em outra data.',
    example: '*Exemplo: Lançamento feito hoje (05/11) referente a uma compra realizada em 01/11.'
  },
  'cartao (opcional)': {
    text: 'Selecione o cartão de crédito utilizado nesta compra para vincular o gasto automaticamente à fatura mensal daquele cartão.',
    example: '*Exemplo: Ao escolher seu cartão (ex: Nubank ou Itaú), o sistema preenche sozinho o campo "Data de Vencimento (opcional)" com base no dia de vencimento cadastrado no cartão.',
    note: '**OBS: Se a despesa foi paga via Pix, Dinheiro ou Boleto, mantenha a opção "Nenhum (Não vinculado)".'
  },
  'cartao': {
    text: 'Selecione o cartão de crédito correspondente para vincular ou filtrar os lançamentos da fatura.',
    example: '*Exemplo: Escolha um cartão cadastrado na aba Cartões.'
  },
  'data de vencimento (opcional)': {
    text: 'Define a data limite de pagamento deste débito (como boletos, contas de consumo ou faturas de cartão).',
    example: '*Exemplo: Se você selecionou um Cartão acima, esta data já é preenchida automaticamente. Para outros débitos (luz, condomínio, boleto), informe o dia do vencimento aqui.',
    note: '**OBS: Ajuda a controlar quais contas vencem em cada dia do mês.'
  },
  'data de vencimento': {
    text: 'Data limite para o pagamento da conta, boleto ou fatura sem cobrança de juros.',
    example: '*Exemplo: Dia 10/11/2026.'
  },
  'categoria': {
    text: 'Classifica o lançamento dentro de um dos grandes grupos do seu planejamento financeiro (Princípio 50-20-20-0-10 ou categorias de receita).',
    example: '*Exemplo: "Despesas Fixas" (50%), "Lazer" (20%), "Educação" (20%), "Investimentos" (0%), "Reserva de Emergência" (10%) ou "Receita Principal".',
    note: '**OBS: Para criar ou editar categorias e metas, acesse o menu Configurações > aba "Categorias & Metas" e use o botão "Nova Categoria" ou o ícone de lápis no cartão da categoria.'
  },
  'subcategoria': {
    text: 'Detalha de forma específica a origem ou o destino do lançamento dentro da Categoria escolhida.',
    example: '*Exemplo: Dentro de "Despesas Fixas", você pode escolher "Moradia", "Mercado", "Saúde" ou "Transporte".',
    note: '**OBS: Para criar ou editar subcategorias, acesse o menu Configurações > aba "Categorias & Metas", digite em "+ Nova subcategoria..." no cartão da categoria e clique em +. Para remover, use o X ao lado dela.'
  },
  'status de pagamento': {
    text: 'Indica se o valor desta despesa já saiu da sua conta ("Pago") ou se ainda será pago futuramente ("Pendente").',
    example: '*Exemplo: Marque "Pendente" ao cadastrar uma conta que vence no fim do mês e altere para "Pago" assim que quitar o pagamento.',
    note: '**OBS: Na tabela de despesas, você também pode clicar direto sobre o selo Pago/Pendente para alternar o status rapidamente.'
  },
  'observacoes (opcional)': {
    text: 'Espaço livre para registrar detalhes extras, número de comprovante, nome da loja ou lembretes sobre este lançamento.',
    example: '*Exemplo: "Referente à consulta médica com reembolso parcial" ou "Dividido com a família".'
  },
  'observacoes': {
    text: 'Espaço livre para registrar detalhes adicionais ou anotações importantes sobre este registro.',
    example: '*Exemplo: "Pagamento via Pix com 5% de desconto".'
  },
  'parcelar despesa': {
    text: 'Marque esta opção quando a compra for dividida em 2 ou mais prestações mensais.',
    example: '*Exemplo: Ao comprar um eletrodoméstico de R$ 1.200 em 6 vezes, marque esta opção e informe 6 no Número de Parcelas. O sistema criará automaticamente as 6 parcelas nos meses seguintes.'
  },
  'numero de parcelas': {
    text: 'Informe em quantas prestações mensais consecutivas o valor total da despesa será dividido.',
    example: '*Exemplo: Digite 10 para dividir o valor total em 10 parcelas mensais iguais.'
  },
  'somar ao orcamento e relatorios': {
    text: 'Define se este lançamento deve entrar nos cálculos de saldo, metas do Orçamento, gráficos do Dashboard e Relatórios.',
    example: '*Exemplo: Mantenha marcado para 99% dos seus gastos e receitas reais. Desmarque apenas se quiser registrar uma movimentação neutra (como transferência entre contas próprias) sem afetar o orçamento.'
  },
  'somar ao orcamento': {
    text: 'Define se este lançamento deve ser contabilizado nos cálculos do Orçamento e Relatórios.',
    example: '*Exemplo: Deixe marcado para incluir o valor nas metas mensais.'
  },
  'quantidade de titulos': {
    text: 'Define para quantos meses consecutivos esta receita será gerada automaticamente a partir da data informada.',
    example: '*Exemplo: Se deixar "1", cadastra apenas neste mês. Se digitar "12", o sistema criará 12 lançamentos mensais consecutivos (ideal para salários fixos ou contratos anuais).'
  },
  'data': {
    text: 'Informe a data em que o valor foi ou será recebido/movimentado.',
    example: '*Exemplo: 05/11/2026 (quinto dia útil do mês).'
  },
  'receita recorrente (mensal)': {
    text: 'Identifica que esta entrada de dinheiro acontece regularmente todos os meses (como salário, aposentadoria ou aluguel recebido).',
    example: '*Exemplo: Marque esta opção para destacar visualmente na lista quais receitas são fixas/recorrentes.'
  },

  // =========================================================================
  // FILTROS DE BUSCA E EDIÇÃO EM MASSA
  // =========================================================================
  'mes': {
    text: 'Filtra os lançamentos e indicadores para exibir apenas as movimentações do mês selecionado.',
    example: '*Exemplo: Selecione "Novembro" para analisar exclusivamente os registros de novembro.'
  },
  'ano': {
    text: 'Filtra os dados exibidos na tela para o ano correspondente.',
    example: '*Exemplo: Escolha "2026" ou selecione "Todos os Anos" para ver o histórico completo.'
  },
  'data inicio': {
    text: 'Define a data inicial de um intervalo personalizado de busca.',
    example: '*Exemplo: Preencha 01/11/2026 para ver apenas lançamentos feitos a partir dessa data.'
  },
  'data fim': {
    text: 'Define a data limite final de um intervalo personalizado de busca.',
    example: '*Exemplo: Preencha 15/11/2026 para ver lançamentos realizados até essa data.'
  },
  'buscar por descricao': {
    text: 'Filtra a tabela em tempo real procurando qualquer palavra digitada dentro da descrição dos lançamentos.',
    example: '*Exemplo: Digite "Uber" ou "Luz" para listar imediatamente todas as despesas com esse nome.'
  },
  'nova descricao (opcional)': {
    text: 'Altera simultaneamente a descrição de todas as despesas selecionadas na tabela.',
    example: '*Exemplo: Deixe em branco caso queira manter a descrição original de cada item.'
  },
  'nova categoria (opcional)': {
    text: 'Move todas as despesas selecionadas na tabela para uma nova Categoria de uma só vez.',
    example: '*Exemplo: Selecione "Lazer" para reclassificar todos os itens marcados.'
  },
  'nova subcategoria (opcional)': {
    text: 'Atualiza em lote a Subcategoria de todas as despesas selecionadas.',
    example: '*Exemplo: Escolha "Mercado" para padronizar os itens selecionados.'
  },
  'novo status (opcional)': {
    text: 'Altera o status de pagamento (Pago ou Pendente) de todas as despesas selecionadas de uma só vez.',
    example: '*Exemplo: Escolha "Pago" para dar baixa em várias contas ao mesmo tempo.'
  },
  'novo status de pagamento (opcional)': {
    text: 'Altera o status de pagamento (Pago ou Pendente) de todas as despesas selecionadas de uma só vez.',
    example: '*Exemplo: Escolha "Pago" para dar baixa em várias contas ao mesmo tempo.'
  },
  'somar ao orcamento (opcional)': {
    text: 'Altera em massa se as despesas selecionadas devem ou não ser somadas aos cálculos do Orçamento e Relatórios.',
    example: '*Exemplo: Escolha "Sim (Padrão)" para incluir nos cálculos.'
  },

  // =========================================================================
  // ORÇAMENTO (PROGRAMAÇÃO MENSAL 50-20-20-0-10)
  // =========================================================================
  'renda prevista': {
    text: 'Informe quanto você planeja receber de renda bruta total neste mês.',
    example: '*Exemplo: Digite R$ 5.000,00 se essa for a soma estimada do seu salário e rendas do mês.',
    note: '**OBS: A Renda Real Disponível será calculada descontando eventuais Dívidas informadas abaixo.'
  },
  'dividas (a serem abatidas da renda)': {
    text: 'Informe o valor de compromissos ou abatimentos prévios que devem ser descontados da Renda Prevista antes de distribuir o orçamento pelas categorias.',
    example: '*Exemplo: Se você recebe R$ 5.000,00 mas precisa separar R$ 500,00 para quitar um acordo prévio, a sua Renda Real Disponível para distribuir nas categorias será R$ 4.500,00.'
  },
  'renda real disponivel': {
    text: 'Representa o valor líquido efetivo (Renda Prevista menos Dívidas) que serve como base de 100% para calcular o limite de gastos de cada categoria.',
    example: '*Exemplo: Pelo princípio inicial 50-20-20-0-10, 50% desta Renda Real vai para Despesas Fixas, 20% para Lazer, 20% para Educação, 0% para Investimentos e 10% para Reserva de Emergência.'
  },

  // =========================================================================
  // CARTÕES DE CRÉDITO
  // =========================================================================
  'vencimento (dia)': {
    text: 'Define o dia fixo do mês em que vence a fatura deste cartão de crédito.',
    example: '*Exemplo: Selecione "Dia 10". Sempre que você criar uma Nova Despesa e escolher este cartão, o campo "Data de Vencimento (opcional)" será preenchido automaticamente com o dia 10!'
  },
  'dia de vencimento (opcional)': {
    text: 'Define o dia fixo do mês em que vence a fatura deste cartão de crédito.',
    example: '*Exemplo: Ao escolher "Dia 15", toda nova despesa vinculada a este cartão terá o vencimento preenchido automaticamente no dia 15.'
  },
  'nome do cartao': {
    text: 'Informe o nome ou apelido do seu cartão de crédito para identificá-lo nas faturas e no cadastro de despesas.',
    example: '*Exemplo: "Nubank Ultravioleta", "Itaú Click" ou "Cartão Corporativo".'
  },

  // =========================================================================
  // VIAGENS
  // =========================================================================
  'nome da viagem': {
    text: 'Dê um título especial para identificar o seu planejamento de viagem.',
    example: '*Exemplo: "Férias em Gramado 2026" ou "Eurotrip Família".'
  },
  'destino': {
    text: 'Informe a cidade, estado ou país de destino da viagem.',
    example: '*Exemplo: "Orlando, EUA" ou "Maceió - AL".'
  },
  'data de ida': {
    text: 'Data de partida ou início oficial da sua viagem.',
    example: '*Exemplo: O sistema calcula automaticamente a duração em dias com base na Data de Ida e Data de Volta.'
  },
  'data de volta': {
    text: 'Data de retorno ou encerramento da viagem.',
    example: '*Exemplo: Deve ser igual ou posterior à Data de Ida.'
  },
  'orcamento previsto': {
    text: 'Defina o teto máximo que você planeja gastar somando passagens, hospedagem, alimentação e passeios nesta viagem.',
    example: '*Exemplo: Digite 8000.00 para acompanhar a barra de consumo do orçamento da viagem em tempo real.'
  },
  'moeda': {
    text: 'Escolha a moeda principal utilizada no destino da viagem.',
    example: '*Exemplo: BRL (R$), USD (US$) ou EUR (€).'
  },

  // =========================================================================
  // CONFIGURAÇÕES E PERFIL
  // =========================================================================
  'nome da categoria': {
    text: 'Informe o nome da categoria financeira para agrupar suas despesas e definir metas no Orçamento.',
    example: '*Exemplo: "Despesas Fixas", "Lazer", "Educação", "Investimentos" ou "Reserva de Emergência".'
  },
  'cor da categoria': {
    text: 'Escolha uma cor para identificar visualmente esta categoria nos gráficos do Dashboard, Orçamento e Relatórios.',
    example: '*Exemplo: Vermelho para Despesas Fixas, Azul para Lazer, Verde para Educação.'
  },
  'tipo de meta': {
    text: 'Define se o limite mensal desta categoria será calculado em Percentual (%) da sua renda ou como um Valor Fixo em dinheiro.',
    example: '*Exemplo: No princípio 50-20-20-0-10, utiliza-se "Percentual (%)" para que a meta se ajuste automaticamente quando sua renda variar.'
  },
  'valor da meta': {
    text: 'Informe a porcentagem (%) ou o valor monetário planejado como teto para esta categoria.',
    example: '*Exemplo: Digite 50 para destinar 50% da sua renda às Despesas Fixas.'
  }
};

// Normaliza todas as chaves do dicionário para busca rápida O(1)
const NORMALIZED_HELP_MAP = Object.create(null);
for (const [k, v] of Object.entries(RAW_FIELD_HELP)) {
  NORMALIZED_HELP_MAP[normalizeKey(k)] = v;
}

/**
 * Obtém a ajuda contextual para qualquer rótulo de campo do sistema.
 * Se não houver entrada exata, gera uma explicação inteligente baseada no nome do campo.
 */
export function getHelpForFieldLabel(labelStr) {
  const norm = normalizeKey(labelStr);
  if (!norm) return null;

  if (NORMALIZED_HELP_MAP[norm]) {
    return NORMALIZED_HELP_MAP[norm];
  }

  // Busca por correspondência parcial nas chaves principais
  for (const [key, val] of Object.entries(NORMALIZED_HELP_MAP)) {
    if (key.length >= 4 && (norm.includes(key) || key.includes(norm))) {
      return val;
    }
  }

  // Fallback inteligente para qualquer outro campo do sistema
  const cleanName = String(labelStr || '')
    .replace(/\?/g, '')
    .replace(/\*/g, '')
    .replace(/:/g, '')
    .trim();

  if (norm.includes('data') || norm.includes('date') || norm.includes('vencimento') || norm.includes('periodo')) {
    return {
      text: `Selecione ou digite a data referente a "${cleanName}" para registrar ou filtrar o período exato no sistema.`,
      example: '*Exemplo: Clique no ícone de calendário à direita do campo para escolher o dia, mês e ano.'
    };
  }

  if (norm.includes('valor') || norm.includes('preco') || norm.includes('custo') || norm.includes('renda') || norm.includes('orcamento') || norm.includes('meta') || norm.includes('limite')) {
    return {
      text: `Informe o valor numérico correspondente a "${cleanName}" para que o sistema calcule os totais e indicadores automaticamente.`,
      example: '*Exemplo: Digite apenas números (ex: 250.00).'
    };
  }

  if (norm.includes('filtro') || norm.includes('busca') || norm.includes('pesquisa') || norm.includes('status') || norm.includes('tipo')) {
    return {
      text: `Selecione ou preencha "${cleanName}" para classificar ou refinar os registros exibidos nesta tela.`,
      example: '*Exemplo: Escolha uma das opções da lista para atualizar os resultados imediatamente.'
    };
  }

  return {
    text: `Preencha ou selecione a informação correspondente ao campo "${cleanName}" para registrar seus dados com precisão no sistema.`,
    example: `*Exemplo: Informe os dados solicitados em "${cleanName}" antes de salvar.`
  };
}

const SECTION_HELP = {
  'planejado': 'Valor que você definiu como meta ou limite para esta categoria no mês, calculado a partir do Orçamento.',
  'plano semanal': 'Valor planejado dividido pelas semanas do mês, para ajudar a controlar o ritmo de gastos.',
  'gasto': 'Total já gasto no período, somando as despesas lançadas.',
  'gasto atual': 'Total já gasto nesta categoria no período, somando as despesas lançadas.',
  'disponivel': 'Quanto ainda resta do valor planejado (Planejado menos Gasto). Valor negativo indica que o limite foi ultrapassado.',
  'disp semanal': 'Quanto ainda pode ser gasto por semana até o fim do mês, sem estourar o planejado.',
  'utilizado': 'Percentual do valor planejado que já foi consumido pelos gastos.',
  'modo': 'Escolha se a meta da categoria é definida em valor (R$) ou em percentual (%) da renda.',
  'meta do mes': 'Valor ou percentual definido como meta desta categoria no mês selecionado.',
  'status': 'Indica a situação do item, como dentro do limite, estourado, pago ou pendente.',
  'valor': 'Valor monetário total do registro ou da categoria no período.',
  'receitas': 'Soma de todo o dinheiro recebido no período selecionado.',
  'despesas': 'Soma de todos os gastos lançados no período selecionado.',
  'saldo': 'Diferença entre receitas e despesas do período. Positivo significa sobra; negativo, déficit.',
  'lucro': 'Resultado do período: receitas menos despesas.',
  'margem': 'Percentual da receita que sobrou após pagar as despesas.',
  'trimestre': 'Agrupa os dados em blocos de 3 meses do ano.',
  'acoes': 'Botões para editar ou excluir este registro.',
  'filtros': 'Use os filtros para restringir a lista por categoria, período, status ou texto.',
  'configuracao de renda': 'Defina a renda prevista do mês e as dívidas a abater para calcular a renda real disponível.',
  'distribuicao do orcamento': 'Gráfico que mostra como a renda do mês está dividida entre as categorias.',
  'metas por categoria': 'Defina o limite de cada categoria em valor (R$) ou percentual (%) da renda.',
  'acompanhamento de orcamento': 'Compara o que foi planejado com o que já foi gasto em cada categoria.',
  'distribuicao geral': 'Compara os gastos reais com a distribuição planejada no orçamento.',
  'custo de vida': 'Média mensal dos seus gastos essenciais (Despesas Fixas, Educação e Lazer).',
  'personalizar ordem': 'Escolha quais relatórios exibir, a ordem e o tamanho de cada gráfico.',
  'evolucao mensal': 'Mostra receitas e despesas dos últimos 6 meses para você acompanhar a tendência.',
  'distribuicao de gastos': 'Mostra a participação de cada categoria no total gasto.',
  'gastos por categoria': 'Ranking do total gasto em cada categoria.',
  'status financeiro': 'Percentual da receita que sobrou (ou faltou) no mês.',
  'receitas por categoria': 'Total recebido agrupado por categoria, com a participação de cada uma.',
  'despesas por categoria': 'Total gasto agrupado por categoria, com a participação de cada uma.',
  'comparativo': 'Compara receitas, despesas e resultado entre períodos diferentes.'
};
const SECTION_KEYS = Object.keys(SECTION_HELP).map((k) => [normalizeKey(k), SECTION_HELP[k]]);

export function getHelpForSection(labelStr, kind) {
  const norm = normalizeKey(labelStr).replace(/\s*-\s*.*$/, '').replace(/[()%]/g, '').trim();
  for (const [k, text] of SECTION_KEYS) {
    if (norm === k || (k.length >= 8 && norm.includes(k))) return { text };
  }
  return {
    text: kind === 'column'
      ? 'Informação exibida nesta coluna, calculada a partir dos seus lançamentos do período selecionado.'
      : 'Esta seção apresenta informações calculadas automaticamente a partir dos seus lançamentos do período selecionado.'
  };
}

/**
 * Componente React explícito para uso direto ao lado de labels (ex: Despesas.jsx)
 */
export const FieldHelpTooltip = ({ text, example, note, fieldLabel }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placeBelow: false });
  const triggerRef = useRef(null);
  const { t } = useLanguage();

  const resolved = text
    ? { text, example, note }
    : getHelpForFieldLabel(fieldLabel || '');

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(340, window.innerWidth - 24);
    let left = rect.left - 8;
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - tooltipWidth - 12);
    }
    if (left < 12) left = 12;

    const placeBelow = rect.top < 190;
    const top = placeBelow ? rect.bottom + 8 : rect.top - 8;

    setCoords({ top, left, placeBelow });
  }, []);

  const handleOpen = () => {
    updatePosition();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!resolved) return null;

  return (
    <span
      ref={triggerRef}
      data-field-help="true"
      data-no-translate="true"
      className="relative inline-flex items-center ml-1.5 align-middle"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <span
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) {
            handleClose();
          } else {
            handleOpen();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            if (open) handleClose();
            else handleOpen();
          }
        }}
        style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px' }}
        className={`rounded-full font-bold text-[10px] leading-none inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 border ${
          open
            ? 'bg-amber-500 text-black border-amber-500 shadow-sm scale-105'
            : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500 hover:text-black hover:border-amber-500'
        }`}
        aria-label={t('Ajuda')}
      >
        ?
      </span>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-no-translate="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placeBelow ? 'translateY(0)' : 'translateY(-100%)',
              width: 'min(340px, calc(100vw - 24px))',
              zIndex: 99999
            }}
            className="p-3.5 bg-white dark:bg-slate-900 border border-amber-500/35 dark:border-amber-500/45 rounded-xl shadow-2xl text-left font-normal normal-case pointer-events-auto animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                style={{ width: '15px', height: '15px', minWidth: '15px', minHeight: '15px' }}
                className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-[9px] inline-flex items-center justify-center flex-shrink-0"
              >
                i
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-xs tracking-wide">
                {t('Ajuda')}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-slate-200 leading-relaxed">
              {t(resolved.text)}
            </p>
            {resolved.example && (
              <div className="mt-2 pl-2.5 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-500 rounded-r-md">
                <p className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed">
                  {t(resolved.example)}
                </p>
              </div>
            )}
            {resolved.note && (
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                {t(resolved.note)}
              </p>
            )}
          </div>,
          document.body
        )}
    </span>
  );
};

/**
 * Enhancer Global Automático:
 * Injeta o botão compacto (?) com o mesmo visual moderno em TODOS os campos (<label>)
 * de todas as telas e modais do sistema que ainda não possuam um botão de ajuda explícito.
 */
export const GlobalFieldHelpEnhancer = () => {
  const { t, language } = useLanguage();
  const [activeHelp, setActiveHelp] = useState(null);

  useEffect(() => {
    const closeOnScrollOrClick = () => {
      setActiveHelp(null);
    };
    window.addEventListener('scroll', closeOnScrollOrClick, true);
    window.addEventListener('click', closeOnScrollOrClick);
    return () => {
      window.removeEventListener('scroll', closeOnScrollOrClick, true);
      window.removeEventListener('click', closeOnScrollOrClick);
    };
  }, []);

  useEffect(() => {
    const enhanceLabels = () => {
      const mainContainer = document.querySelector('main') || document.body;
      if (!mainContainer) return;

      const labels = mainContainer.querySelectorAll('label, th, h2, h3, h4');
      labels.forEach((label) => {
        const kind = label.tagName === 'LABEL' ? 'field' : label.tagName === 'TH' ? 'column' : 'section';
        // Ignora labels dentro da réplica em miniatura do vídeo, marcados sem ajuda ou que já tenham ajuda
        if (label.closest('[data-fin-replica="true"]')) return;
        if (label.closest('[data-no-field-help="true"]')) return;
        if (label.querySelector('[data-field-help="true"]')) return;

        // Ignora labels que envolvem botões de upload de arquivo inteiros ou switches vazios
        if (label.querySelector('input[type="file"]')) return;
        if (label.classList.contains('sr-only')) return;

        // Extrai o texto original em PT-BR (se salvo pelo tradutor DOM) ou texto visível
        let rawLabelText = '';
        label.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            rawLabelText += ' ' + (node.__origPtBr || node.nodeValue || '');
          } else if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.getAttribute('data-field-help') !== 'true' &&
            node.tagName !== 'INPUT' &&
            node.tagName !== 'SELECT' &&
            node.tagName !== 'TEXTAREA'
          ) {
            // Procura primeiro nó de texto dentro do span/elemento
            const firstTextNode = Array.from(node.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
            rawLabelText += ' ' + (firstTextNode?.__origPtBr || node.textContent || '');
          }
        });

        const cleaned = rawLabelText.replace(/\s+/g, ' ').trim();
        if (!cleaned || cleaned.length < 2 || cleaned.length > 80) return;

        // Cria o badge compacto (?) nas cores do sistema
        const badgeWrap = document.createElement('span');
        badgeWrap.setAttribute('data-field-help', 'true');
        badgeWrap.setAttribute('data-no-translate', 'true');
        badgeWrap.className = 'relative inline-flex items-center ml-1.5 align-middle';

        const badge = document.createElement('span');
        badge.setAttribute('tabindex', '0');
        badge.style.width = '16px';
        badge.style.height = '16px';
        badge.style.minWidth = '16px';
        badge.style.minHeight = '16px';
        badge.className =
          'rounded-full font-bold text-[10px] leading-none inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 border bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500 hover:text-black hover:border-amber-500';
        badge.textContent = '?';

        const showTooltip = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = badge.getBoundingClientRect();
          const tooltipWidth = Math.min(340, window.innerWidth - 24);
          let left = rect.left - 8;
          if (left + tooltipWidth > window.innerWidth - 12) {
            left = Math.max(12, window.innerWidth - tooltipWidth - 12);
          }
          if (left < 12) left = 12;

          const placeBelow = rect.top < 190;
          const top = placeBelow ? rect.bottom + 8 : rect.top - 8;

          const helpInfo = kind === 'field' ? getHelpForFieldLabel(cleaned) : getHelpForSection(cleaned, kind);
          if (helpInfo) {
            setActiveHelp({
              ...helpInfo,
              top,
              left,
              placeBelow
            });
          }
        };

        const hideTooltip = () => {
          setActiveHelp(null);
        };

        badgeWrap.addEventListener('mouseenter', showTooltip);
        badgeWrap.addEventListener('mouseleave', hideTooltip);
        badge.addEventListener('click', showTooltip);

        badgeWrap.appendChild(badge);
        label.appendChild(badgeWrap);
      });
    };

    enhanceLabels();

    const observer = new MutationObserver(() => {
      enhanceLabels();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [language]);

  if (!activeHelp || typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-no-translate="true"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${activeHelp.top}px`,
        left: `${activeHelp.left}px`,
        transform: activeHelp.placeBelow ? 'translateY(0)' : 'translateY(-100%)',
        width: 'min(340px, calc(100vw - 24px))',
        zIndex: 99999
      }}
      className="p-3.5 bg-white dark:bg-slate-900 border border-amber-500/35 dark:border-amber-500/45 rounded-xl shadow-2xl text-left font-normal normal-case pointer-events-auto animate-in fade-in duration-150"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span
          style={{ width: '15px', height: '15px', minWidth: '15px', minHeight: '15px' }}
          className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold text-[9px] inline-flex items-center justify-center flex-shrink-0"
        >
          i
        </span>
        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs tracking-wide">
          {t('Ajuda')}
        </span>
      </div>
      <p className="text-xs text-gray-700 dark:text-slate-200 leading-relaxed">
        {t(activeHelp.text)}
      </p>
      {activeHelp.example && (
        <div className="mt-2 pl-2.5 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-500 rounded-r-md">
          <p className="text-[11px] text-gray-700 dark:text-slate-300 leading-relaxed">
            {t(activeHelp.example)}
          </p>
        </div>
      )}
      {activeHelp.note && (
        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
          {t(activeHelp.note)}
        </p>
      )}
    </div>,
    document.body
  );
};

export default FieldHelpTooltip;
