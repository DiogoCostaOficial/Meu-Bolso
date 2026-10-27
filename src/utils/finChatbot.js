import { FIN_WISDOM_QA_ENTRIES } from './finBooksKnowledge.js';
import { FIN_MANUAL_QA_ENTRIES } from './finManualKnowledge.js';

/**
 * Lógica de processamento de perguntas em linguagem natural para o FIN.
 * Personalidade do FIN:
 * - Conselheiro financeiro amigável do usuário ("toca aqui ✋", "promete de dedinho?").
 * - Quebra a 4ª parede (fala de dentro do vidro da tela direto com quem está segurando o mouse/celular).
 * - Explica tudo como se estivesse comprando balinhas, figurinhas ou sorvete na cantina com uma criança de 12 anos!
 */

const KNOWLEDGE_BASE = [
  ...FIN_MANUAL_QA_ENTRIES,
  ...FIN_WISDOM_QA_ENTRIES,
  // Ativos vs Passivos
  {
    keywords: ['ativo', 'ativos', 'passivo', 'passivos', 'ficar rico', 'riqueza', 'patrimonio'],
    matches: ['dica', 'conselho', 'investir', 'dinheiro'],
    response: "🌱 **Chega pertinho da tela que esse segredo vale ouro!**\n" +
              "Sabe a diferença entre quem vive sem moeda e quem tem o pote sempre cheio?\n\n" +
              "• 🍬 **Ativo (A Máquina de Fazer Balinhas):** É tudo aquilo que **coloca** moedinhas novas no seu bolso sozinho (tipo dinheiro guardado rendendo todo mês).\n" +
              "• 🦖 **Passivo (O Comilão de Balinhas):** É tudo aquilo que **come** suas moedinhas todo mês pra continuar existindo (dívidas, prestações caras).\n" +
              "• **Nosso trato aqui:** Vamos colecionar mais Máquinas de Balinhas do que Comilões!"
  },
  // Pedido geral de dica / sabedoria
  {
    keywords: ['conselho', 'dica de ouro', 'sabedoria', 'me ensina', 'ensinar', 'segredo', 'dica'],
    matches: ['fin', 'dinheiro', 'financas'],
    response: "✋ **Toca aqui na tela! Olha os 4 Segredos da Nossa Dupla:**\n" +
              "1. 🏷️ **Cola Nome nas Balinhas:** Entrou moeda? Corre na aba *Orçamento* e diz pra onde cada uma vai antes de gastar!\n" +
              "2. 🍭 **Almoço vs. Balinha:** Comida e luz vêm primeiro (*Necessidade*). Deu vontade de comprar besteira (*Desejo*)? Espera 3 dias!\n" +
              "3. ⏱️ **Conta as Horas de Suor:** Veja quantas horas de trabalho lá fora custa aquela compra antes de abrir a carteira.\n" +
              "4. 🎮 **Brinca no nosso Quiz:** Antes de gastar qualquer moeda, clica em **'Quiz: Posso Gastar?'** aqui embaixo que eu olho seu pote na hora!"
  },
  // 1. Datas nas Despesas/Receitas
  {
    keywords: ['data', 'datas', 'dia', 'quando', 'calendario', 'vencimento', 'compra', 'lancamento'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "📅 **Psiu! Ficou confuso com as 3 datas ali na tela? Eu te explico igual comprar balinha na venda:**\n" +
              "• 🍭 **Data da Compra:** Foi o dia em que você pegou a balinha na mão e mordeu!\n" +
              "• 📝 **Data de Lançamento:** O mês em que essa balinha entra na nossa lista de contas.\n" +
              "• ⏰ **Data de Vencimento:** É o último dia pra pagar o dono da venda antes dele ficar bravo e cobrar balinha em dobro de multa!"
  },
  // 2. Parcelamento
  {
    keywords: ['parcelar', 'parcela', 'parcelas', 'dividir', 'quantas vezes', '12x', 'sem juros'],
    matches: ['cartao', 'comprar', 'gasto'],
    response: "🍕 **Vai parcelar? Deixa que o FIN aqui dentro da tela faz o trabalho pesado!**\n" +
              "• Cada parcela que você cria é como pegar uma tesoura e recortar um pedaço das balinhas dos seus próximos meses!\n" +
              "• Se você parcelar 5 compras diferentes em '10 vezes baratinhas', no mês que vem quando você abrir o pote... não sobrou balinha pra você comer nada novo!\n" +
              "• **Regra de ouro:** Se não cabe no pote de balinhas de hoje, só parcele se for uma extrema emergência de vida!"
  },
  // 3. Orçamento vs Despesas
  {
    keywords: ['orcamento', 'despesa', 'diferenca', 'potinho', 'meta'],
    matches: ['entender', 'como funciona'],
    response: "🎯 **Olha que simples:**\n" +
              "• **Orçamento** é o **Plano** (quanto a gente combinou de gastar em cada pote antes do mês começar).\n" +
              "• **Despesa** é o **Fato** (cada moedinha que você realmente tirou do bolso).\n" +
              "O objetivo do jogo é nunca deixar a Despesa ficar maior que a etiqueta do Orçamento!"
  },
  // 4. DRE
  {
    keywords: ['dre', 'o que e dre', 'resultado', 'exercicio', 'lucro', 'prejuizo'],
    matches: ['relatorio', 'financas'],
    response: "🏆 **Não deixa essa sigla te assustar!**\n" +
              "DRE é só o placar final do mês:\n" +
              "**Tudo que entrou no bolso (Receitas)**\n" +
              "MENOS\n" +
              "**Tudo que saiu do bolso (Despesas)**\n" +
              "= O que sobrou pra guardar no cofrinho! Se sobrou moeda, você venceu o jogo do mês!"
  },
  // 5. Reserva de Emergência
  {
    keywords: ['reserva', 'emergencia', 'colchao', 'guardar dinheiro', 'poupanca'],
    matches: ['seguranca', 'futuro'],
    response: "🛡️ **A Capa de Super-Herói do seu Dinheiro:**\n" +
              "A Reserva de Emergência é um pote de moedas que a gente jura de dedinho que NUNCA vai mexer pra comprar brinquedo ou pizza!\n" +
              "Ela só pode ser aberta se o teto da casa furar, o carro quebrar ou o médico chamar. Com ela cheia, ninguém perde o sono!"
  },
  // 6. Educação Financeira / FIN
  {
    keywords: ['quem e voce', 'quem e fin', 'fin', 'mascote', 'o que voce faz'],
    matches: ['ajuda', 'tela'],
    response: "👋 **Oi! Eu sou o FIN!**\n" +
              "Moro aqui dentro da sua tela pra te proteger de gastar sem pensar! Eu fico de olho nas suas contas, bato no vidro se você for cometer um deslize e fico dourado quando você economiza!"
  },
  // 7. Cartões de Crédito
  {
    keywords: ['cartao', 'cartao de credito', 'fatura', 'limite', 'fechamento', 'melhor dia'],
    matches: ['pagar', 'comprar'],
    response: "💳 **O Segredo das Datas do Cartão:**\n" +
              "• **Dia do Fechamento:** O dia em que a conta fecha o cadeado!\n" +
              "• **Melhor Dia de Compra:** É o dia logo após o fechamento, porque aí você só paga aquela balinha quase 40 dias depois!\n" +
              "• **Vencimento:** O dia em que você TEM que pagar a conta inteira pra não alimentar o monstro dos juros!"
  },
  // 8. Viagens
  {
    keywords: ['viagem', 'viagens', 'ferias', 'viajar', 'aviao', 'hotel'],
    matches: ['planejamento', 'gasto'],
    response: "✈️ **Vai arrumar as malas?**\n" +
              "Lá na aba **Viagens**, você cria um pote especial só pra suas férias! A gente separa o dinheiro da passagem, do hotel e do sorvete antes de embarcar pra você não voltar das férias com dor de cabeça!"
  },
  // 9. Dívidas
  {
    keywords: ['divida', 'dividas', 'devendo', 'limpar nome', 'negociar'],
    matches: ['ajuda', 'aperto'],
    response: "🎯 **Nosso Plano Secreto em 3 passos:**\n" +
              "1. Liste todas as dívidas da maior pra menor taxa de juros.\n" +
              "2. Corte tudo que é balinha/besteira temporariamente.\n" +
              "3. Ligue pro credor e diga: 'Eu quero pagar, mas só tenho X moedas à vista'. Eles quase sempre dão um baita desconto!"
  },
  // 10. Fluxo de Caixa
  {
    keywords: ['fluxo de caixa', 'fluxo', 'caixa', 'entradas e saidas', 'movimentacoes'],
    matches: ['dinheiro', 'saldo'],
    response: "🍬 **Fluxo de Caixa é o movimento do nosso pote de balas:**\n" +
              "• **Mão colocando bala no pote (Receitas):** Tudo que entra.\n" +
              "• **Mão tirando bala do pote (Despesas):** Tudo que sai.\n" +
              "O segredo é nunca tentar tirar 5 balinhas na segunda-feira se você só vai ganhar balinha nova na sexta!"
  }
];

export const getFallbackResponse = ({ vocativo = 'amigo' } = {}) =>
  `Ih, ${vocativo}, cocei minha cabecinha aqui dentro da tela e não entendi! 😅 Que tal clicar no botão dourado **'🎮 Quiz: Posso Gastar?'** aqui embaixo antes de fazer uma compra, ou me perguntar coisas como **'O que é dar nome ao dinheiro?'** ou **'Qual a diferença entre necessidade e desejo?'**!`;

export const askFinAboutSystem = (question, { primeiroNome = '', vocativo = 'amigo' } = {}) => {
  if (!question || typeof question !== 'string') {
    return getFallbackResponse({ vocativo });
  }

  const normalized = question.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  // Pontuação de correspondência
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // Verifica palavras-chave primárias (frases compostas de nomes de campos recebem peso maior)
    for (const keyword of entry.keywords) {
      const cleanKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(cleanKeyword)) {
        score += cleanKeyword.includes(' ') ? 4 : 2;
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

  return getFallbackResponse({ vocativo });
};
