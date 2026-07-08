/**
 * Lógica de processamento de perguntas em linguagem natural para o FIN.
 * Responde com explicações simples, didáticas e diretas para leigos.
 */

const KNOWLEDGE_BASE = [
  // 1. Datas nas Despesas/Receitas
  {
    keywords: ['data', 'datas', 'dia', 'quando', 'calendario', 'vencimento', 'compra', 'lancamento'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "No cadastro de despesas temos três datas:\n" +
              "• 📅 **Data da Despesa (ou Lançamento):** É o dia em que o gasto aconteceu de fato.\n" +
              "• ⏳ **Data de Vencimento:** É o dia limite para pagar a conta sem ter juros (ex: vencimento da conta de luz).\n" +
              "• 💳 **Data da Compra:** Útil para saber quando você passou o cartão, mesmo que só vá pagar na fatura seguinte."
  },
  {
    keywords: ['data', 'datas', 'dia', 'quando', 'calendario', 'recebimento', 'lancamento'],
    matches: ['receita', 'receitas', 'ganho', 'ganhos', 'salario'],
    response: "No cadastro de receitas temos a:\n" +
              "• 📅 **Data da Receita:** É o dia em que o dinheiro entrou ou vai entrar de fato na sua conta."
  },
  // 2. Status de Pagamento (Pendente vs Pago)
  {
    keywords: ['status', 'pago', 'pendente', 'pagamento', 'marcar', 'quitar'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "O status serve para você controlar o que já foi liquidado e o que ainda está em aberto:\n" +
              "• ✅ **Pago:** O dinheiro já saiu da sua carteira ou conta bancária.\n" +
              "• ⏳ **Pendente:** É uma conta que você sabe que vai vencer ou que já venceu, mas que você ainda não pagou."
  },
  // 3. Somar no orçamento e relatórios
  {
    keywords: ['somar', 'orcamento', 'relatorio', 'relatorios', 'aparecer', 'soma', 'dre'],
    matches: ['despesa', 'despesas', 'checkbox', 'caixinha'],
    response: "A caixinha **\"Somar ao Orçamento e Relatórios\"** define onde o gasto aparece:\n" +
              "• **Marcado (Padrão):** O valor diminui do seu orçamento limite do mês e entra nos gráficos normais.\n" +
              "• **Desmarcado (Apenas DRE):** O gasto não consome o seu limite de orçamento mensal planejado, mas ainda é contabilizado na DRE (resumo de lucro/prejuízo real do mês)."
  },
  // 4. Parcelamento
  {
    keywords: ['parcela', 'parcelado', 'parcelar', 'vezes', 'parcelas', 'dividir'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "Se você comprou algo parcelado (ex: uma geladeira em 10x):\n" +
              "1. Marque a caixinha **\"Parcelar despesa\"**.\n" +
              "2. Informe o **Valor Total** da compra no campo Valor.\n" +
              "3. Digite o **Número de Parcelas**.\n" +
              "O FIN vai dividir o valor e lançar automaticamente uma despesa para cada mês seguinte, te poupando de cadastrar uma por uma!"
  },
  // 5. Categoria e Subcategoria
  {
    keywords: ['categoria', 'categorias', 'subcategoria', 'subcategorias', 'grupo', 'tipo'],
    matches: [],
    response: "As categorias servem para organizar seus gastos de forma simples:\n" +
              "• 📂 **Categoria:** É o grupo principal (ex: *Despesas Fixas*, *Lazer*, *Educação*).\n" +
              "• 🏷️ **Subcategoria:** É o item específico dentro desse grupo (ex: dentro de *Despesas Fixas*, temos *Moradia*, *Mercado* ou *Transporte*).\n" +
              "Isso te ajuda a enxergar com precisão em qual área da sua vida você está gastando mais."
  },
  // 6. Diferença DRE vs Orçamento vs Dashboard
  {
    keywords: ['dre', 'placar', 'lucro', 'prejuizo'],
    matches: [],
    response: "O **DRE** (Demonstrativo do Resultado do Exercício) é o placar do jogo financeiro. Ele pega tudo que você ganhou (Receitas) e subtrai tudo que você gastou (Despesas) para dizer se o saldo final do mês foi positivo (**Lucro**) ou negativo (**Prejuízo**)."
  },
  {
    keywords: ['orcamento', 'planejar', 'limite', 'definir'],
    matches: [],
    response: "O **Orçamento** é o seu planejamento. Nele você diz: *\"Este mês pretendo gastar no máximo R$ 500 com mercado e R$ 200 com lazer\"*. O sistema te avisa se você estiver chegando perto do teto definido."
  },
  {
    keywords: ['dashboard', 'resumo', 'tela', 'inicial'],
    matches: [],
    response: "O **Dashboard** é a tela inicial do sistema. Ele funciona como o velocímetro de um carro, mostrando de forma resumida o saldo atual, o total de ganhos, de gastos e gráficos visuais rápidos do mês atual."
  },
  // 7. Cartões de crédito
  {
    keywords: ['cartao', 'cartoes', 'credito', 'fatura', 'limite'],
    matches: [],
    response: "A tela de **Cartões** ajuda a simular o limite e o fechamento da fatura do seu cartão. Lembre-se: o limite do cartão não é salário extra, é apenas uma facilidade de pagamento que você terá que pagar no dia do vencimento da fatura."
  }
];

const FALLBACK_RESPONSE = "Hum, não entendi muito bem. Você pode perguntar sobre 'o que são as datas', 'como parcelar uma despesa', 'para que serve o status pendente/pago' ou 'o que são categorias' e eu te explico de forma bem simples!";

export const askFinAboutSystem = (question) => {
  if (!question || typeof question !== 'string') {
    return FALLBACK_RESPONSE;
  }

  const normalized = question.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  // Pontuação de correspondência
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // Verifica palavras-chave primárias
    for (const keyword of entry.keywords) {
      const cleanKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(cleanKeyword)) {
        score += 2;
      }
    }

    // Verifica palavras-chave secundárias (contexto)
    for (const matchWord of entry.matches) {
      const cleanMatch = matchWord.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(cleanMatch)) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // Retorna a melhor resposta se houver relevância suficiente (score >= 2)
  if (bestMatch && highestScore >= 2) {
    return bestMatch.response;
  }

  return FALLBACK_RESPONSE;
};
