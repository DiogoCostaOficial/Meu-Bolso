/**
 * SABEDORIA DO FIN & MOTOR DO QUIZ "POSSO GASTAR?"
 * Personalidade do FIN:
 * - Melhor amigo do usuário (conversando de pertinho, "toca aqui ✋", "promete de dedinho?").
 * - Quebra a 4ª parede (sabe que mora dentro da tela do computador/celular e vê o usuário do outro lado do vidro).
 * - Linguagem 100% infantil (12 anos), explicando tudo como se estivesse comprando balinhas, figurinhas ou sorvete na cantina!
 * - Zero menção a livros, autores ou instituições.
 */

export const FIN_WISDOM_QA_ENTRIES = [
  // 1. Dar Nome ao Dinheiro
  {
    id: "dar_nome_ao_dinheiro",
    title: "🏷️ Dar Nome ao Dinheiro",
    keywords: ['nome ao dinheiro', 'dar nome', 'nomear', 'carimbar', 'envelope', 'envelopes', 'para onde vai', 'sumiu', 'some'],
    matches: ['dinheiro', 'orcamento', 'salario', 'gastar', 'controle'],
    response: "🍬 **Psiu! Chega o rosto pertinho da tela que eu te conto!**\n" +
              "Sabe quando você vai na padaria com 10 moedinhas soltas no bolso? Se você não decidir antes o que cada moedinha vai comprar, você gasta tudo em balinha de morango e depois fica sem moeda pro pão!\n\n" +
              "• **O nosso combinado de melhores amigos:** Assim que o dinheiro cair na sua mão aí fora, você corre aqui na aba **Orçamento** e cola uma etiqueta em cada potinho: *'Esse potinho se chama Conta de Luz'*, *'Esse se chama Lanche'* e *'Esse se chama Meu Grande Sonho'*.\n" +
              "• Quando a moedinha já tem nome, você não gasta ela sem querer! Toca aqui! ✋"
  },

  // 2. Necessidade vs. Desejo
  {
    id: "necessidade_vs_desejo",
    title: "🤔 Necessidade vs. Desejo: Almoço ou Balinha?",
    keywords: ['necessidade', 'necessidades', 'desejo', 'desejos', 'impulso', 'vontade', 'preciso', 'superfluo', 'consumo consciente'],
    matches: ['comprar', 'gastar', 'diferenca', 'escolher', 'controlar'],
    response: "🍭 **Olha nos meus olhinhos aqui na tela, melhor amigo!**\n" +
              "Antes de você tirar a carteira do bolso aí fora, lembra da diferença entre o **Almoço** e a **Balinha**:\n\n" +
              "• 🍞 **Necessidade (O Almoço):** É aquilo que se faltar, dá ruim de verdade — comida, água, luz, teto pra morar, remédio. Isso vem SEMPRE primeiro!\n" +
              "• 🍬 **Desejo (A Balinha Extra):** É aquele brinquedo novo, tênis da moda ou pedir comida cara na terça-feira. É gostoso? É! Mas você vive super bem sem ele hoje!\n" +
              "• **O nosso Truque dos 3 Dias:** Deu uma coceirinha na mão pra comprar uma *Balinha Cara*? Espera 3 dias! Se depois de 3 dias a vontade tiver sumido, salvamos nossas moedas!"
  },

  // 3. Troca no Tempo (Paciência vs. Impaciência)
  {
    id: "troca_intertemporal",
    title: "⏳ 1 Balinha Hoje ou o Pote Inteiro Amanhã?",
    keywords: ['troca intertemporal', 'intertemporal', 'paciencia', 'esperar', 'presente e futuro', 'troca no tempo', 'imediato'],
    matches: ['futuro', 'sonho', 'comprar', 'guardar'],
    response: "⏳ **Ei! Se eu te der 1 balinha agora ou 10 balinhas se você esperar até amanhã, qual você escolhe?**\n\n" +
              "• **Quem não aguenta esperar:** Quer chupar a balinha AGORA mesmo sem ter moeda, pega fiado com o banco e depois tem que devolver **2 pacotes inteiros** por causa dos juros!\n" +
              "• **A nossa dupla esperta:** A gente guarda uma moedinha por mês no potinho, deixa ela dar filhotinhos de moedas e depois compra à vista ganhando desconto!\n" +
              "• Promete pra mim aqui na tela: não troca o seu sonho grandão por uma balinha que acaba em 2 minutos!"
  },

  // 4. Promoção ou Cilada / Truque do R$ 39,90
  {
    id: "promocao_ou_cilada",
    title: "🕵️‍♂️ Promoção ou Pegadinha?",
    keywords: ['promocao', 'cilada', 'desconto', 'propaganda', 'anuncio', '39,90', '9,99', 'a partir de', 'parcelado sem juros', 'publicidade'],
    matches: ['comprar', 'loja', 'mercado', 'preco', 'barato', 'caro'],
    response: "🕵️‍♂️ **Abre o olho, amigo! Eu fico daqui de dentro da tela vendo as lojas tentarem te hipnotizar!**\n\n" +
              "1. 🧠 **A Pegadinha do R$ 9,99:** O dono da loja escreve R$ 9,99 pra você ler só o '9' e achar que tá baratinho, mas é **R$ 10,00**! Sempre arredonda pra cima na cabeça!\n" +
              "2. 🍬 **'Leve 3 Pague 2':** Se você só queria 1 balinha e levou 3 só por causa da placa, você gastou mais moedas do que ia gastar!\n" +
              "3. ⚖️ **Segredo de Mercado:** Olha sempre a letrinha miúda do preço por **Quilo** ou **Litro**. Às vezes o pacote grande é mais caro que dois pequenos!"
  },

  // 5. Tempo é Dinheiro / Quanto custa sua hora
  {
    id: "tempo_e_dinheiro",
    title: "⏱️ Quantas horas de trabalho vale essa balinha?",
    keywords: ['tempo e dinheiro', 'hora de trabalho', 'horas de trabalho', 'quanto vale meu tempo', 'suor', 'esforco', 'salario por hora'],
    matches: ['comprar', 'gastar', 'trabalho', 'salario', 'tempo'],
    response: "⏱️ **Para tudo e faz essa conta comigo aqui no vidro da tela!**\n" +
              "As suas moedas não nascem em árvore — você troca horas da sua vida trabalhando lá fora pra ganhar elas!\n\n" +
              "• Imagina que você ganha **15 moedinhas por cada 1 hora** de trabalho suado.\n" +
              "• Se você vê uma blusa ou um jogo de **300 moedinhas**, olha pra mim e pensa: *\"Eu topava trabalhar 20 horas seguidas só pra ganhar essa sacola?\"*\n" +
              "• Quando a gente lembra do suor que deu pra juntar cada moeda, a gente fecha o zíper da carteira rapidinho!"
  },

  // 6. O Peso Invisível do Carro
  {
    id: "peso_do_automovel",
    title: "🚗 O Carro Come Balinha Todo Dia!",
    keywords: ['carro', 'automovel', 'moto', 'veiculo', 'ipva', 'combustivel', 'gasolina', 'manutencao', 'seguro do carro'],
    matches: ['gasto', 'despesa', 'orcamento', 'comprar', 'manter'],
    response: "🚗 **Psiu! Sabe aquele carro bonitão lá na rua? Ele é um comilão de moedas disfarçado!**\n\n" +
              "• Muita gente acha que comprar carro é só pagar a parcela, mas ele pede 'balinha' todo santo mês: **Gasolina + Seguro + Imposto (IPVA) + Pneu + Oficina + Estacionamento**!\n" +
              "• Como seu melhor amigo, eu te aviso: antes de ter ou trocar de carro, coloca todos esses gastos escondidos lá no nosso **Orçamento** pra ver se ele não vai comer as balinhas da sua família!"
  },

  // 7. Armadilhas do Cartão de Crédito, Rotativo e Cheque Especial
  {
    id: "armadilhas_cartao_cheque_especial",
    title: "💣 Os 2 Bichos-Papões: Rotativo e Cheque Especial",
    keywords: ['cheque especial', 'rotativo', 'pagamento minimo', 'minimo da fatura', 'limite da conta', 'juros do cartao', 'armadilha'],
    matches: ['cartao', 'banco', 'divida', 'fatura', 'credito'],
    response: "💣 **Tira a mão daí! 😱 Eu bato aqui na tela toda vez que você chega perto desses 2 Bichos-Papões:**\n\n" +
              "1. 🕳️ **Cheque Especial (Limite do Banco):** O banco finge que aquele limite na sua conta é dinheiro seu. É cilada! É tipo pegar 1 balinha emprestada e ter que devolver um caminhão de balas depois!\n" +
              "2. 🔥 **Pagar só o 'Mínimo' do Cartão:** Se a conta do cartão veio R$ 100 e você paga só R$ 15, os R$ 85 que sobraram viram um monstro gigante no mês que vem!\n" +
              "• **Promessa de dedinho comigo:** Nunca use o Cheque Especial e pague sempre a fatura inteira do cartão!"
  },

  // 8. Qual dívida pagar primeiro?
  {
    id: "qual_divida_pagar_primeiro",
    title: "⚔️ Socorro, FIN! Qual conta eu pago primeiro?",
    keywords: ['qual divida pagar', 'pagar primeiro', 'duas dividas', 'endividado', 'sair das dividas', 'renegociar', 'negociar', 'divida', 'dividas'],
    matches: ['pagar', 'juros', 'atrasado', 'banco', 'como sair'],
    response: "⚔️ **Respira fundo e segura a minha mão aqui na tela! Amigos não se abandonam na hora do aperto!**\n\n" +
              "Se você tá devendo em dois lugares e tem poucas moedas, faz assim:\n" +
              "1. 🦖 **Derrote primeiro o Monstro que cresce mais rápido:** Pague primeiro a dívida que tem o **juro mais alto** (tipo cartão ou cheque especial)!\n" +
              "2. 🏠 **Proteja nossa casinha:** Luz, água e comida vêm antes de qualquer banco.\n" +
              "3. 🗣️ **Sem vergonha de pedir desconto:** Liga lá pro banco e fala: *'Só tenho tantas moedinhas por mês no meu Orçamento, vamos fazer um acordo?'* Eles sempre topam negociar!"
  },

  // 9. Reserva de Emergência
  {
    id: "reserva_de_emergencia",
    title: "🛡️ O Pote Secreto de Emergência!",
    keywords: ['reserva de emergencia', 'reserva financeira', 'fundo de emergencia', 'imprevisto', 'imprevistos', 'seguranca', 'escudo', 'quantos meses'],
    matches: ['guardar', 'poupar', 'dinheiro', 'emergencia', 'reserva'],
    response: "🛡️ **Shhh! Chega pertinho... você já tem o nosso Pote Secreto de Emergência?**\n\n" +
              "• Sabe quando chove bem na hora do recreio e só quem trouxe guarda-chuva não se molha? A **Reserva de Emergência** é o nosso guarda-chuva de moedas!\n" +
              "• A gente vai juntando devagarinho até ter entre **3 a 6 meses** das suas contas guardados num potinho seguro.\n" +
              "• Mas ó: **festa e sapato novo NÃO são emergência**, hein? Eu tô vigiando esse pote daqui de dentro da tela! 👀"
  },

  // 10. Inflação e Juro Real
  {
    id: "inflacao_e_juro_real",
    title: "🎈 Por que a balinha ficou mais cara? (Inflação)",
    keywords: ['inflacao', 'juro real', 'taxa real', 'poder de compra', 'dinheiro parado', 'perdendo valor', 'ipca'],
    matches: ['precos', 'mercado', 'subiu', 'caro', 'juros', 'investimento'],
    response: "🎈 **Você já reparou que antigamente 1 moedinha comprava 10 balinhas e hoje mal compra 1?**\n\n" +
              "• O nome desse fantasminha que encarece tudo é **Inflação**!\n" +
              "• Se você esconder suas moedas debaixo do colchão aí no seu quarto, o fantasminha da inflação vai deixando elas fraquinhas.\n" +
              "• Por isso a gente guarda o dinheiro em **Investimentos** que rendem mais do que a inflação — assim suas moedas ganham superforça todo mês!"
  },

  // 11. Juros Compostos (Bola de Neve)
  {
    id: "juros_simples_vs_compostos",
    title: "⛄ Moedinhas que têm Filhotinhos! (Bola de Neve)",
    keywords: ['juros simples', 'juros compostos', 'bola de neve', 'juros sobre juros', 'matematica financeira', 'valor do dinheiro no tempo'],
    matches: ['juros', 'render', 'crescer', 'divida', 'investimento'],
    response: "⛄ **Imagina um pote mágico onde toda sexta-feira suas balinhas têm filhotinhos de balinha!**\n\n" +
              "• Na outra semana, as balinhas mamães E os filhotinhos têm mais filhotinhos juntos! Vira uma **Bola de Neve** gigante!\n" +
              "• É assim que funcionam os **Juros sobre Juros** quando você investe todo mês e não come as balinhas antes da hora!\n" +
              "• Quer me deixar brilhando em Ouro aqui na sua tela? Bora alimentar a nossa bola de neve todo mês!"
  },

  // 12. Pague-se Primeiro
  {
    id: "pague_se_primeiro",
    title: "🐷 A Primeira Balinha do Pacote é Sua!",
    keywords: ['pague-se primeiro', 'pagar primeiro', 'guardar', 'poupar', 'dez por cento', '10%', 'cofrinho', 'sobrar'],
    matches: ['dinheiro', 'dica', 'conselho', 'economizar'],
    response: "🐷 **Ei, me faz uma promessa de melhor amigo agora mesmo?**\n" +
              "Quando você abre um pacote com 10 balinhas e sai oferecendo pra todo mundo na rua, quantas sobram pra você no final? **Nenhuma!**\n\n" +
              "• Com o seu salário é igualzinho! Se você pagar todo mundo primeiro esperando 'sobrar no fim do mês' pra guardar, nunca sobra!\n" +
              "• A nossa regra secreta é: **entrou 10 moedinhas? A 1ª moedinha (10%) vai direto pro seu cofrinho do futuro** antes de qualquer outra coisa!"
  },

  // 13. Finanças em Família / Casal
  {
    id: "financas_familia_casal",
    title: "👨‍👩‍👧‍👦 Ninguém Esconde Papel de Bala Debaixo do Tapete!",
    keywords: ['casal', 'familia', 'familiar', 'marido', 'esposa', 'filhos', 'casa', 'endividamento oculto', 'conversar'],
    matches: ['orcamento', 'dinheiro', 'planejamento', 'juntos'],
    response: "👨‍👩‍👧‍👦 **Psiu! Aí na sua casa todo mundo joga no mesmo time?**\n" +
              "Sabe quando alguém come doce escondido e esconde o papelzinho debaixo do sofá? Nas contas de casa, gastar escondido da família dá a maior confusão!\n\n" +
              "• Chama todo mundo pra olhar aqui pra mim na tela uma vez por mês!\n" +
              "• Quando a família inteira escolhe um sonho junto (tipo viajar nas férias) e vê os potinhos do **Orçamento**, todo mundo ajuda a economizar balinhas!"
  },

  // 14. Separar Bolso de Casa do Trabalho/Lojinha
  {
    id: "separar_pf_pj",
    title: "🏪 Não Come o Estoque da Sua Própria Barraquinha!",
    keywords: ['empresa', 'negocio', 'mei', 'cnpj', 'autonomo', 'vendas', 'lojinha', 'separar', 'pro-labore'],
    matches: ['pessoal', 'casa', 'misturar', 'caixa', 'dinheiro'],
    response: "🏪 **Imagina que a gente montou uma barraquinha pra vender limonada e balinha na rua!**\n" +
              "Se a gente beber toda a limonada e misturar o troco da barraquinha com a nossa mesada de casa, no dia seguinte não tem dinheiro nem pra comprar limão!\n\n" +
              "• Se você tem um negócio ou vende algo, **nunca misture os dois bolsos**! Separe certinho o que é da lojinha e o que é o seu salário de casa!"
  }
];

/**
 * Avalia no Quiz Infantil se o gasto pretendido pelo cliente cabe nas metas reais do Orçamento dele!
 * Fala diretamente com o usuário quebrando a 4ª parede, como melhores amigos de 12 anos dividindo um pote de balinhas!
 * @param {Object} userData Dados do usuário vindos de /user/dados (orcamentos, despesas, receitas, categorias)
 * @param {Object} quizInput { valor: number, item: string, categoria: string, tipoEscolha: 'necessidade' | 'desejo' }
 * @param {Function} formatCurrency Função para formatar valores na moeda ativa
 */
export const evaluatePurchaseQuiz = (userData, quizInput, formatCurrency) => {
  const fmt = formatCurrency || ((v) => `R$ ${Number(v || 0).toFixed(2)}`);
  const valorCompra = parseFloat(String(quizInput.valor).replace(',', '.')) || 0;
  const nomeItem = (quizInput.item || 'essa balinha').trim();
  const nomeCategoria = quizInput.categoria || 'Lazer';
  const ehDesejo = quizInput.tipoEscolha === 'desejo';

  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
  const orcamentos = Array.isArray(userData?.orcamentos) ? userData.orcamentos : [];
  const orcamentoMes = orcamentos.find((o) => o.mes === mesAtual) || orcamentos[orcamentos.length - 1] || null;

  const despesasAll = Array.isArray(userData?.despesas) ? userData.despesas : [];
  const despesasMes = despesasAll.filter((d) => d.data && d.data.startsWith(mesAtual));

  const receitasAll = Array.isArray(userData?.receitas) ? userData.receitas : [];
  const receitasMes = receitasAll.filter((r) => r.data && r.data.startsWith(mesAtual));
  const totalReceitasMes = receitasMes.reduce((acc, r) => acc + (parseFloat(r.valor) || 0), 0);

  // Renda base para calcular metas e horas de suor
  const rendaBase = parseFloat(orcamentoMes?.rendaReal) || parseFloat(orcamentoMes?.rendaPrevista) || totalReceitasMes || 0;
  const valorHoraSuor = rendaBase > 0 ? rendaBase / 160 : 0;
  const horasDeSuor = valorHoraSuor > 0 ? (valorCompra / valorHoraSuor).toFixed(1) : null;

  // Encontrar meta da categoria escolhida
  let metaCategoria = 0;
  if (orcamentoMes && Array.isArray(orcamentoMes.categorias)) {
    const catObj = orcamentoMes.categorias.find(
      (c) => c.nome?.toLowerCase() === nomeCategoria.toLowerCase()
    );
    if (catObj) {
      if (catObj.tipoMeta === 'valor' && parseFloat(catObj.valorPlanejado) > 0) {
        metaCategoria = parseFloat(catObj.valorPlanejado);
      } else if (parseFloat(catObj.percentual) > 0 && rendaBase > 0) {
        metaCategoria = (rendaBase * parseFloat(catObj.percentual)) / 100;
      } else if (parseFloat(catObj.valorPlanejado) > 0) {
        metaCategoria = parseFloat(catObj.valorPlanejado);
      }
    }
  }

  // Gasto atual na categoria neste mês
  const gastoAtualCategoria = despesasMes
    .filter((d) => d.categoria?.toLowerCase() === nomeCategoria.toLowerCase() && d.somarNoOrcamento !== false)
    .reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);

  const totalDespesasMes = despesasMes.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);

  // Caso 1: Usuário ainda não definiu meta de orçamento para esta categoria
  if (metaCategoria <= 0) {
    const saldoRestanteGeral = rendaBase - (totalDespesasMes + valorCompra);
    return {
      status: rendaBase > 0 && saldoRestanteGeral >= 0 ? 'amarelo' : 'vermelho',
      badge: '🍬 Eita! Pote de Balinhas sem Etiqueta!',
      headline: `Psst! Olha pra mim aqui na tela: eu fui abrir o seu pote de "${nomeCategoria}" e ele tá SEM META definida!`,
      numbersSummary: [
        `🍭 O que você quer pegar: ${nomeItem} (${fmt(valorCompra)})`,
        `📦 Quanto você já tirou de ${nomeCategoria} este mês: ${fmt(gastoAtualCategoria)}`,
        horasDeSuor ? `⏱️ Suor de amigo: Isso vale ${horasDeSuor} horas inteirinhas do seu trabalho lá fora!` : null
      ].filter(Boolean),
      kidExplanation:
        `Ei, melhor amigo, tira a mão da carteira por 1 segundinho! ✋ Eu dei um pulo lá nos bastidores do seu aplicativo pra contar suas balinhas de **${nomeCategoria}**, mas você ainda não colou o adesivo dizendo quanto pode gastar nesse pote!\n\n` +
        (ehDesejo
          ? `🍭 **Papo reto de melhor amigo:** Você mesmo me confessou aqui no botão que "${nomeItem}" é só uma **Vontade de Doce (Desejo)**! Se a gente comprar no escuro, pode faltar moeda pro almoço depois! Clica no botão aqui embaixo, vamos lá no *Orçamento* dar nome pro seu dinheiro primeiro e faz o **Teste dos 3 Dias**!`
          : `🍞 **Papo reto de melhor amigo:** Eu sei que "${nomeItem}" é importante (**Necessidade**), mas não deixa a nossa dupla voar de olhos vendados! Clica aqui embaixo pra gente colar a etiqueta de meta no pote de **${nomeCategoria}** lá no *Orçamento*!`)
    };
  }

  // Caso 2: Usuário TEM meta definida no Orçamento! Vamos contar as balinhas do pote!
  const disponivelAntes = metaCategoria - gastoAtualCategoria;
  const gastoDepois = gastoAtualCategoria + valorCompra;
  const disponivelDepois = metaCategoria - gastoDepois;
  const percentualDepois = (gastoDepois / metaCategoria) * 100;

  // 🟢 SINAL VERDE: Cabe com folga (usa até 80% da meta da categoria)
  if (percentualDepois <= 80) {
    return {
      status: 'verde',
      badge: '🟢 Toca Aqui ✋! Cabe no Nosso Pote!',
      headline: `Aê, melhor amigo! Eu olhei o seu pote de "${nomeCategoria}" aqui dentro do app e TEM BALINHA SOBRANDO pra "${nomeItem}"!`,
      numbersSummary: [
        `🍬 Tamanho do pote de ${nomeCategoria}: ${fmt(metaCategoria)}`,
        `😋 Já comemos: ${fmt(gastoAtualCategoria)} | Ainda tem no pote: ${fmt(disponivelAntes)}`,
        `✅ Se pegar ${fmt(valorCompra)} agora: Ainda sobram ${fmt(disponivelDepois)} no pote (${percentualDepois.toFixed(0)}% usado)!`,
        horasDeSuor ? `⏱️ Na ponta do lápis: Custa ${horasDeSuor} horas do seu suor.` : null
      ].filter(Boolean),
      kidExplanation:
        ehDesejo
          ? `🍭 **Segredinho do FIN (chega pertinho da tela):** Você mandou muito bem dando nome pro nosso dinheiro! Essa balinha de **${fmt(valorCompra)}** cabe folgada dentro do pote de **${nomeCategoria}**!\n\nMas como sou seu melhor amigo, tenho que fazer a pergunta mágica: *se você deixar essas moedas quietinhas no pote rendendo filhotinhos ou pedir um descontão à vista, não fica ainda mais gostoso?* Se quiser mesmo comprar, vai lá sem culpa e não parcela a perder de vista, hein!`
          : `🍞 **Orgulho do FIN!** Toca aqui na tela! ✋ Você planejou tudo direitinho, colou nome no pote de **${nomeCategoria}** e essa compra que você **precisa** cabe com um montão de folga! Só não esquece de chorar um descontinho à vista lá fora por mim!`
    };
  }

  // 🟡 SINAL AMARELO: Cabe, mas fica na raspinha do pote (entre 80% e 100% da meta)
  if (percentualDepois <= 100) {
    return {
      status: 'amarelo',
      badge: '🟡 Ui, Ui, Ui! Vai Raspar o Fundo do Pote!',
      headline: `Olha pra mim aqui na tela 👀: "${nomeItem}" até cabe em ${nomeCategoria}, mas vai deixar o pote com ${percentualDepois.toFixed(0)}% cheio!`,
      numbersSummary: [
        `🍬 Tamanho do pote de ${nomeCategoria}: ${fmt(metaCategoria)}`,
        `😋 Já comemos: ${fmt(gastoAtualCategoria)} | Tem hoje no pote: ${fmt(disponivelAntes)}`,
        `⚠️ Se gastar ${fmt(valorCompra)} agora: Só vai sobrar o farelo de ${fmt(disponivelDepois)} pro resto do mês inteiro!`,
        horasDeSuor ? `⏱️ Na ponta do lápis: Custa ${horasDeSuor} horas do seu suor.` : null
      ].filter(Boolean),
      kidExplanation:
        ehDesejo
          ? `🍭 **Escuta seu melhor amigo aqui:** Sabe quando só têm 3 balinhas no fundo do pote e ainda faltam vários dias pra acabar o mês? Se você comer quase tudo agora com **"${nomeItem}"** (que você me contou que é só um **Desejo**!), depois você vai ficar chupando o dedo se aparecer algo mais legal!\n\n💡 **Combinado de amigos:** Espera **3 dias** antes de comprar ou procura uma versão mais baratinha pra não secar o nosso pote!`
          : `🍞 **Atenção da nossa dupla:** Como você **precisa mesmo** de "${nomeItem}", dá pra comprar porque ainda cabe na meta! Mas ó, tô batendo aqui no vidro da tela pra te lembrar: depois disso só vão sobrar **${fmt(disponivelDepois)}** no pote de **${nomeCategoria}**. Fecha a tampa do pote com cadeado até o mês acabar!`
    };
  }

  // 🔴 SINAL VERMELHO: Estoura o pote de balinhas do cliente!
  const valorEstouro = Math.abs(disponivelDepois);
  return {
    status: 'vermelho',
    badge: '🔴 PARA TUDO! Larga a Carteira Agora! 😱',
    headline: `Socorro, melhor amigo! Gastar ${fmt(valorCompra)} em "${nomeItem}" vai QUEBRAR o nosso pote de ${nomeCategoria} em ${fmt(valorEstouro)}!`,
    numbersSummary: [
      `🍬 Limite do pote de ${nomeCategoria}: ${fmt(metaCategoria)}`,
      `😋 Já comemos: ${fmt(gastoAtualCategoria)} | Só tem no fundo do pote: ${fmt(Math.max(0, disponivelAntes))}`,
      `🚨 Se gastar ${fmt(valorCompra)}: Faltam ${fmt(valorEstouro)} de balinhas (${percentualDepois.toFixed(0)}% da meta)!`,
      horasDeSuor ? `⏱️ Pensa bem: São ${horasDeSuor} horas inteirinhas de trabalho lá fora!` : null
    ].filter(Boolean),
    kidExplanation:
      ehDesejo
        ? `🛑 **Olha bem nos meus olhos aqui na tela!** Eu sou seu melhor amigo e não vou deixar você cair nessa cilada! No nosso pote de **${nomeCategoria}** só restam **${fmt(Math.max(0, disponivelAntes))}**! Pra você comprar essa "balinha" de **${fmt(valorCompra)}** que é só um **Desejo**, você teria que assaltar **${fmt(valorEstouro)}** do potinho de outra conta importante ou do seu grande sonho!\n\n✋ **Promete de dedinho pra mim:** Guarda essa carteira no bolso agora! Deixa "${nomeItem}" pro mês que vem quando o pote encher de novo. Você vai me agradecer no fim do mês!`
        : `⚠️ **Eita, melhor amigo, temos uma emergência aqui!** Mesmo "${nomeItem}" sendo uma **Necessidade**, o pote de **${nomeCategoria}** só tem **${fmt(Math.max(0, disponivelAntes))}** e vão faltar **${fmt(valorEstouro)}**!\n\n💡 **O que a nossa dupla precisa fazer já:**\n1. Tenta negociar um preço menor ou uma opção mais baratinha lá fora.\n2. Se tiver que pagar esse valor mesmo, clica em **Ir ao Orçamento** aqui embaixo e tira **${fmt(valorEstouro)}** do pote de *Lazer/Doces* pra cobrir esse buraco sem entrar em dívida no cartão!`
  };
};
