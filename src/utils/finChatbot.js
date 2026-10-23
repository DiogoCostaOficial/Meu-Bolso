import { FIN_WISDOM_QA_ENTRIES } from './finBooksKnowledge.js';

/**
 * Lógica de processamento de perguntas em linguagem natural para o FIN.
 * Personalidade do FIN:
 * - Melhor amigo do usuário ("toca aqui ✋", "promete de dedinho?").
 * - Quebra a 4ª parede (fala de dentro do vidro da tela direto com quem está segurando o mouse/celular).
 * - Explica tudo como se estivesse comprando balinhas, figurinhas ou sorvete na cantina com uma criança de 12 anos!
 */

const KNOWLEDGE_BASE = [
  ...FIN_WISDOM_QA_ENTRIES,
  // Ativos vs Passivos
  {
    keywords: ['ativo', 'ativos', 'passivo', 'passivos', 'ficar rico', 'riqueza', 'patrimonio'],
    matches: ['dica', 'conselho', 'investir', 'dinheiro'],
    response: "🌱 **Chega pertinho da tela que esse segredo vale ouro!**\n" +
              "Sabe a diferença entre quem vive sem moeda e quem tem o pote sempre cheio?\n\n" +
              "• 🍬 **Ativo (A Máquina de Fazer Balinhas):** É tudo aquilo que **coloca** moedinhas novas no seu bolso sozinho (tipo dinheiro guardado rendendo todo mês).\n" +
              "• 🦖 **Passivo (O Comilão de Balinhas):** É tudo aquilo que **come** suas moedinhas todo mês pra continuar existindo (dívidas, prestações caras).\n" +
              "• **Nosso trato de melhores amigos:** Vamos colecionar mais Máquinas de Balinhas do que Comilões!"
  },
  // Pedido geral de dica / sabedoria
  {
    keywords: ['conselho', 'dica de ouro', 'sabedoria', 'me ensina', 'ensinar', 'segredo', 'dica'],
    matches: ['fin', 'dinheiro', 'financas'],
    response: "✋ **Toca aqui na tela, melhor amigo! Olha os 4 Segredos da Nossa Dupla:**\n" +
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
  {
    keywords: ['data', 'datas', 'dia', 'quando', 'calendario', 'recebimento', 'lancamento'],
    matches: ['receita', 'receitas', 'ganho', 'ganhos', 'salario'],
    response: "📅 **Data da Receita:** É simplesmente o dia mais feliz do mês, quando as moedinhas novas caem de verdade dentro do nosso pote! 🎉"
  },
  // 2. Status de Pagamento (Pendente vs Pago)
  {
    keywords: ['status', 'pago', 'pendente', 'pagamento', 'marcar', 'quitar'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "🚦 **Olha aqui pra mim: Pago vs. Pendente é igual dever de casa!**\n" +
              "• ✅ **Pago (Ufa, já entreguei!):** As moedinhas já saíram do seu bolso e você não deve mais nada daquela conta.\n" +
              "• ⏳ **Pendente (Tá anotado na agenda!):** Você já me avisou que essa conta existe pra gente separar as balinhas dela no pote, mas ainda vai pagar!"
  },
  // 3. Somar no orçamento e relatórios
  {
    keywords: ['somar', 'orcamento', 'relatorio', 'relatorios', 'aparecer', 'soma', 'dre'],
    matches: ['despesa', 'despesas', 'checkbox', 'caixinha'],
    response: "📦 **Viu aquela caixinha \"Somar ao Orçamento e Relatórios\"? Ó o que ela faz:**\n" +
              "• **Marcada (Normal):** Toda vez que você gasta, eu tiro aquela quantidade de balinhas do seu pote do *Orçamento*.\n" +
              "• **Desmarcada:** Eu não mexo no pote do seu *Orçamento*, mas ainda conto lá no Placar Final do mês (o DRE)."
  },
  // 4. Parcelamento
  {
    keywords: ['parcela', 'parcelado', 'parcelar', 'vezes', 'parcelas', 'dividir'],
    matches: ['despesa', 'despesas', 'gasto', 'gastos'],
    response: "🍕 **Vai parcelar? Deixa que seu melhor amigo aqui dentro da tela faz o trabalho pesado!**\n" +
              "Imagina que você comprou um pacote gigante de figurinhas dividido em 5 meses:\n" +
              "1. Marca a caixinha **\"Parcelar despesa\"**.\n" +
              "2. Digita o **Preço Inteiro** do pacote.\n" +
              "3. Escolhe em quantos meses dividiu.\n" +
              "Pronto! Eu corto em pedacinhos iguais e já deixo anotado nos próximos meses pra você não esquecer!"
  },
  // 5. Categoria e Subcategoria
  {
    keywords: ['categoria', 'categorias', 'subcategoria', 'subcategorias', 'grupo', 'tipo'],
    matches: [],
    response: "🗂️ **Categorias e Subcategorias são igual organizar sua mochila:**\n" +
              "• 📂 **Categoria (O Pote Grande):** Ex: *Lazer*, *Despesas Fixas*, *Educação*.\n" +
              "• 🏷️ **Subcategoria (O Saquinho dentro do pote):** Dentro do pote de *Lazer*, tem o saquinho do *Cinema*, do *Sorvete* e do *Videogame*.\n" +
              "Assim eu e você sabemos rapidinho qual saquinho tá comendo mais moedas!"
  },
  // 6. Diferença DRE vs Orçamento vs Dashboard
  {
    keywords: ['dre', 'placar', 'lucro', 'prejuizo'],
    matches: [],
    response: "🏆 **Não deixa a sigla DRE te assustar, amigo!**\n" +
              "Entre nós dois, o DRE é só o **Placar Final do Recreio**: eu conto todas as balinhas que você ganhou no mês e tiro todas as que você comeu. Se sobrou balinha no bolso, deu **Lucro (Vitória Verde!)**. Se faltou, deu **Prejuízo (Alerta Vermelho!)**."
  },
  {
    keywords: ['orcamento', 'planejar', 'limite', 'definir'],
    matches: [],
    response: "🏷️ **O Orçamento é a nossa Fábrica de Etiquetas!**\n" +
              "É lá que a gente **dá nome pro dinheiro** antes de você sair gastando aí fora! A gente combina quantas balinhas cabem em cada pote e, se você chegar perto de esvaziar o pote, eu bato aqui no vidro da tela pra te avisar!"
  },
  {
    keywords: ['dashboard', 'resumo', 'tela', 'inicial'],
    matches: [],
    response: "🚀 **O Dashboard é a janela do nosso esconderijo!**\n" +
              "Logo que você entra aqui pra me ver, ele mostra quantas balinhas entraram, quantas saíram e quantas ainda estão salvas no seu bolso hoje!"
  },
  // 7. Cartões de crédito
  {
    keywords: ['cartao', 'cartoes', 'credito', 'fatura', 'limite'],
    matches: [],
    response: "💳 **Olha nos meus olhinhos aqui na tela: Cartão de Crédito NÃO é balinha grátis!**\n" +
              "É só o dono da cantina anotando tudo no caderninho pra te cobrar de uma vez só no dia da fatura! Só passe esse plástico lá fora se as moedinhas já estiverem separadas com nome no nosso Orçamento, combinado?"
  },
  // 8. Gestão de Orçamento
  {
    keywords: ['gestao', 'gerir', 'economizar', 'dicas', 'planejar', 'sobrar', 'limite'],
    matches: ['orcamento', 'orcamentos'],
    response: "🎯 **Nosso Plano Secreto de Melhores Amigos em 3 passos:**\n" +
              "1. **Dia de dar nome:** Caiu moeda no bolso? Corre em *Orçamento* e cola etiqueta em tudo!\n" +
              "2. **Brinca no Quiz antes de gastar:** Deu vontade de comprar algo? Clica em **'🎮 Quiz: Posso Gastar?'** aqui embaixo pra eu ver se cabe no pote!\n" +
              "3. **Primeira balinha é sua:** Sempre guarde um pedacinho no pote dos seus sonhos antes de gastar o resto!"
  },
  // 9. Como usar o DRE
  {
    keywords: ['como usar', 'usar', 'analisar', 'verificao', 'entender'],
    matches: ['dre', 'placar', 'lucro', 'prejuizo'],
    response: "🎮 **Como olhar o Placar (DRE) comigo no fim do mês:**\n" +
              "• Olha a última linha lá embaixo: ficou **verdinha**? Toca aqui ✋! Sobrou balinha no pote!\n" +
              "• Ficou **vermelha**? Algum comilão de moedas passou do limite! Aí a gente olha qual linha cresceu demais e fecha a torneira no mês seguinte!"
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

const FALLBACK_RESPONSE = "ih, melhor amigo, cocei minha cabecinha aqui dentro da tela e não entendi! 😅 Que tal clicar no botão dourado **'🎮 Quiz: Posso Gastar?'** aqui embaixo antes de fazer uma compra, ou me perguntar coisas como **'O que é dar nome ao dinheiro?'** ou **'Qual a diferença entre necessidade e desejo?'**!";

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
