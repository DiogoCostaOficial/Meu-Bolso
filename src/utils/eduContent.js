/**
 * Conteúdo pedagógico e lúdico do mascote FIN.
 *
 * Tom de Voz Personalizado:
 * - Feminino: analogias com "brincos", "caixinha de brincos / porta-joias", "doces", "moedinhas no cofre".
 * - Masculino: analogias com "figurinhas", "álbum de figurinhas / pacotinho", "doces", "moedinhas no cofre".
 * - Alternância natural: saudações pelo primeiro nome ("E aí, Elaine!"),
 *   conselhos e puxões de orelha pelo vocativo de carinho ("Olha aqui, amiga...").
 * - NUNCA misturar os dois na mesma oração ("Elaine, amiga!" é evitado).
 */

export const buildEduContent = (tratamento = {}) => {
  const {
    primeiroNome = '',
    vocativo = 'amigo',
    genero = 'masculino',
    itemColecao = 'figurinhas',
    recipienteColecao = 'álbum de figurinhas',
    emojiColecao = '🃏'
  } = tratamento;

  const isFeminino = genero === 'feminino';

  const saudacaoDashboard = primeiroNome ? `E aí, ${primeiroNome}! Olha o nosso Painel! 👀${emojiColecao}` : `E aí, ${vocativo}! Olha o nosso Painel! 👀${emojiColecao}`;
  const saudacaoInicio = primeiroNome ? `Oi, ${primeiroNome}!` : `Oi, ${vocativo}!`;
  const saudacaoUpdate = primeiroNome ? `Ei, ${primeiroNome}!` : `Ei, ${vocativo}!`;

  // Analogia lúdica personalizada por gênero
  const analogiaPrimeiroAcesso = isFeminino
    ? "Funciona assim, ó: cada moedinha que entra aqui no app é como organizar seus brincos e joias favoritas numa caixinha especial. Antes de sair usando sem critério, você separa um espacinho pra cada par: 'Essa divisória é da Conta de Luz', 'Essa é do Lanche de Sábado' e 'Essa é do Meu Grande Sonho'. Se cada moeda tem seu lugar certinho, nada se perde!"
    : "Funciona assim, ó: cada moedinha que entra aqui no app é como um pacotinho de figurinhas novas. Antes de sair trocando tudo no escuro, você abre o álbum e separa: 'Essas vão pro Álbum da Conta de Luz', 'Essas pro Lanche de Sábado' e 'Essas pro Meu Grande Sonho'. Se cada figurinha tem lugar no álbum, você não perde nada sem querer!";

  const analogiaDashboard = isFeminino
    ? "Sabe quando a gente abre a caixinha de brincos e o cofre pra ver se tá tudo arrumadinho ou se tá faltando peça? É exatamente o que esses números aqui em cima mostram pra gente!"
    : "Sabe quando a gente abre o álbum de figurinhas pra ver quantas páginas já completamos e quantas repetidas ainda temos pra trocar? É exatamente o que esses números aqui em cima mostram pra gente!";

  const analogiaReceitas = isFeminino
    ? `Imagina que você ganhou uma coleção novinha de brincos lindos e brilhantes! Só que ó, escuta aqui, ${vocativo}: não vai sair distribuindo tudo sem antes guardar direitinho na caixinha, hein?`
    : `Imagina que você ganhou um pacote gigante de figurinhas raras novinhas! Só que ó, escuta aqui, ${vocativo}: não vai sair trocando tudo sem antes colar no álbum, hein?`;

  const analogiaDespesas = isFeminino
    ? "É como pegar peças da sua caixinha e ir deixando uma em cada canto da cidade. Se você soltar um brinco aqui e outro ali sem prestar atenção, quando for procurar... cadê as peças?! Por isso cada saída de dinheiro precisa ser anotada!"
    : "É como trocar suas figurinhas raras do álbum por chiclete na esquina. Se trocar uma hoje e outra amanhã sem pensar, quando olhar... o álbum fica desfalcado! Por isso cada saída de dinheiro precisa ser anotada!";

  const analogiaOrcamento = isFeminino
    ? "Sabe quando você tem uma caixinha com divisórias especiais e separa: 'Nesse cantinho ficam os brincos do dia a dia, nesse os do fim de semana e nessa gavetinha secreta as moedas pro futuro'? Pronto! Agora nada se mistura e nem é gasto por engano!"
    : "Sabe quando você pega suas figurinhas e separa: 'Essas 10 vão pro álbum agora, essas 5 repetidas eu troco com meu colega no sábado e essas 2 raras eu guardo no cofre'? Pronto! Agora nada se perde e o álbum é completado sem susto!";

  const analogiaCartoes = isFeminino
    ? "Imagina que você pegou 10 brincos emprestados na loja prometendo devolver no dia 10. Se chegar o dia 10 e você não tiver os brincos, a loja te cobra 20 brincos de castigo (os juros do cartão)!"
    : "Imagina que você pegou 20 figurinhas raras emprestadas com um colega prometendo devolver no dia 10. Se chegar o dia 10 e você não tiver as figurinhas, ele te cobra 40 de castigo (os juros do cartão)!";

  const analogiaDRE = isFeminino
    ? "Sabe quando você conta quantos brincos ou moedas tinha na caixinha no começo do mês e quantas tem no final? Se você terminou com mais peças guardadas, deu LUCRO (Vitória!). Se perdeu peças, deu PREJUÍZO!"
    : "Sabe quando você conta quantas figurinhas tinha no começo do recreio e quantas tem no final? Se você terminou com mais figurinhas raras no bolso, deu LUCRO (Vitória!). Se perdeu figurinhas, deu PREJUÍZO!";

  return {
    primeiro_acesso_nome_dinheiro: {
        title: `Psst! Ei, você aí fora da tela! Toca aqui! ✋${emojiColecao}`,
        explanation: `${saudacaoInicio} Eu sou o FIN e moro aqui dentro da sua tela! Chega mais pertinho que eu vou te contar um segredo de ouro: sabe quando você vai na feira ou no shopping com 10 moedinhas no bolso, sem decidir antes o que vai fazer com elas? Você acaba gastando tudo em doces ou besteiras por impulso e depois falta moeda pro almoço! Por isso, a nossa regra número 1 aqui é: DAR NOME PRO DINHEIRO logo de cara!`,
        analogy: analogiaPrimeiroAcesso,
        tips: [
            "🏷️ Promete de dedinho? Assim que entrar dinheiro, a gente vai juntos lá em 'Orçamento' colar o nome em cada potinho!",
            `Moeda sem nome some igual mágica: Se deixar o dinheiro solto sem etiqueta, ele foge do bolso e nem eu aqui dentro da tela consigo segurar!`,
            "🎮 Quer comprar alguma coisa? Antes de passar o cartão aí fora, clica no meu 'Quiz: Posso Gastar?' aqui embaixo que eu te falo na hora se sobram moedinhas no cofre!"
        ],
        cta: {
            label: "🍬 Bora Dar Nome pro Nosso Dinheiro! (Ir pro Orçamento)",
            path: "/orcamento"
        }
    },
    dashboard: {
        title: saudacaoDashboard,
        explanation: `Psst! Eu tô te vendo daqui de dentro da tela! Essa tela aqui é o nosso esconderijo secreto (o Dashboard). É tipo olhar pra dentro da nossa mochila pra ver quantas moedinhas e ${itemColecao} entraram, quantas a gente já usou e quantas ainda estão guardadinhas no bolso!`,
        analogy: analogiaDashboard,
        tips: [
            "👀 Passa aqui todo dia pra me dar um 'oi'! Eu fico de olho nas suas contas enquanto você tá fora do computador.",
            "🟢 Se tiver tudo verdinho, toca aqui ✋! 🔴 Se ficar vermelho, tira a mão da carteira que gastamos além da conta!",
            "🎮 Deu vontade de comprar algo agora? Clica no meu 'Quiz: Posso Gastar?' aqui embaixo antes de decidir!"
        ]
    },
    receitas: {
        title: `Oba! Dia de encher o bolso de moedinhas! 🎉${emojiColecao}`,
        explanation: "Eu vi esse sorrisinho aí do outro lado da tela! Receitas são todas as moedinhas novas que chegaram no seu bolso — salário, mesada, comissão ou qualquer dinheirinho que pingou!",
        analogy: analogiaReceitas,
        tips: [
            "📝 Anota tudinho aqui pra mim, até as moedinhas pequenininhas!",
            "🏷️ Acabou de anotar? Corre lá em 'Orçamento' pra gente dar um nome pra cada pedacinho desse dinheiro!",
            "🐷 Guarda a primeira moedinha no cofrinho pro seu 'Eu do Futuro' antes de gastar o resto!"
        ]
    },
    despesas: {
        title: "Eita! Tô vendo você tirando moeda do bolso! 👀💸",
        explanation: `Ei, pode me contar tudo, ${vocativo}! Despesas são todas as vezes que você troca suas moedinhas por alguma coisa lá fora: conta de luz, mercado, pizza ou até um sorvete na esquina!`,
        analogy: analogiaDespesas,
        tips: [
            "Não esconde nada de mim! Anota até aquele cafezinho ou picolé baratinho, porque de moeda em moeda o cofre esvazia.",
            "🤔 Antes de pagar, olha pra mim aqui na tela e me responde: você PRECISA mesmo disso agora ou só deu vontade passageira?",
            "🎮 Na dúvida se pode gastar? Clica no botão 'Quiz: Posso Gastar?' aqui no meu balão que a gente testa juntos!"
        ]
    },
    orcamento: {
        title: "A Fábrica de Etiquetas! (Dar Nome ao Dinheiro) 🏷️🍭",
        explanation: "Chegamos na minha tela favorita do aplicativo inteiro! Aqui no Orçamento é onde eu e você pegamos todas as nossas moedas e separamos em potinhos com nome ANTES de você sair gastando por aí!",
        analogy: analogiaOrcamento,
        tips: [
            "🏷️ Coloque nome em 100% do seu dinheiro! Dinheiro sem etiqueta acha que é passe livre pra virar besteira.",
            "🚦 Quando a barrinha de um potinho começar a ficar amarela ou vermelha, eu vou bater aqui no vidro da tela pra te avisar!",
            "🌟 Sempre crie um potinho com o nome do seu maior sonho!"
        ]
    },
    cartoes: {
        title: "Tira a mão desse cartão e me escuta 1 segundo! 💳😱",
        explanation: "Psiu! Olha bem nos meus olhinhos aqui no canto da tela! O Cartão de Crédito NÃO é dinheiro infinito de brinquedo! Ele é só o dono da cantina anotando tudo no caderninho de fiado pra te cobrar de uma vez só no mês que vem!",
        analogy: analogiaCartoes,
        tips: [
            "🙅‍♂️ O limite do cartão não é dinheiro seu! Só passe no cartão se a moeda já estiver separada e com nome lá no Orçamento.",
            "✅ Sempre pague a conta inteira do cartão. Pagar só um pedacinho ('mínimo') faz o monstro dos juros crescer!",
            "🍕 Parcelar é dividir uma conta em 10 pedaços pelos próximos meses — cuidado pra não entupir os potes do futuro!"
        ]
    },
    relatorios: {
        title: `Hora do Detetive! Pra onde foram as moedinhas? 🕵️‍♂️📊`,
        explanation: "Chega mais perto da tela! Aqui nos Relatórios eu desenho tudo colorido pra você ver pra onde suas moedas fugiram nesse mês sem você precisar fazer conta chata!",
        analogy: "Sabe quando o pacote de biscoito acaba e você pergunta 'Quem comeu tudo?!'. Esses desenhos aqui entregam na hora qual potinho comeu mais moedas!",
        tips: [
            "🔍 Descubra qual categoria foi a mais gastadeira do mês.",
            "📈 Compare com o mês passado pra ver se a nossa dupla está mandando cada vez melhor!",
            "🛠️ Viu um potinho gastando demais? Vamos lá no Orçamento ajustar a etiqueta dele!"
        ]
    },
    dre: {
        title: "O Placar do Videogame! Ganhamos ou Perdemos? 🏆🎮",
        explanation: "Os adultos chamam isso de DRE pra parecer difícil, mas entre nós dois é só o Placar Final da fase do mês! Tudo que entrou menos tudo que saiu!",
        analogy: analogiaDRE,
        tips: [
            "🟢 Nosso objetivo aqui é terminar todo mês no verdinho!",
            "🔴 Se der vermelho, não fica triste! A gente olha onde escapou moeda e vira o jogo no mês que vem.",
            "✨ Quanto mais meses a gente vencer, mais rápido eu viro o FIN de Ouro brilhante aqui na sua tela!"
        ]
    },
    conversao_moedas: {
        title: "Uau! Olha as Bandeirinhas lá no topo da tela! 🌍🪙",
        explanation: "Ei, olha lá em cima! Agora eu sei falar a língua do dinheiro do mundo inteiro! Viu as bandeirinhas do Brasil, dos Estados Unidos e da Europa?",
        analogy: "É tipo descobrir quantas moedas brasileiras valem 1 moeda americana ou europeia! Você clica na bandeirinha lá em cima e — PUF! — eu troco todos os números da tela na mesma hora pra você!",
        tips: [
            "Eu olho o preço do Dólar e do Euro de verdade, ao vivo, pra não errar nem um centavo!",
            "Clique nas bandeirinhas lá no topo quando quiser ver seu dinheiro em outra moeda.",
            "Vai viajar? Eu cuido das contas pra você!"
        ]
    },
    atualizacoes_sistema: {
        title: `Psst! Tenho uma novidade pra gente! 🎮${emojiColecao}`,
        explanation: `${saudacaoUpdate} Que bom que você entrou! Eu andei treinando meu cérebro aqui dentro do computador e criei recursos novos só pra nós dois!`,
        analogy: "Agora, antes de você gastar seu dinheiro lá fora, você pode brincar comigo aqui dentro no 'Quiz: Posso Gastar?'!",
        tips: [
            "🎮 Quiz 'Posso Gastar?': Clica no botão dourado aqui embaixo, me conta o que você quer comprar e quanto custa, que eu abro o seu pote do Orçamento e te digo na hora se dá pra comprar!",
            "🟢 Pago ou Pendente: Nas Despesas, você pode marcar o que já pagou e o que ainda vai pagar.",
            "💬 Bate-papo com o FIN: Pode escrever qualquer dúvida aqui embaixo que eu te explico facinho!"
        ]
    }
  };
};

export const EDU_CONTENT = buildEduContent();

export const SYSTEM_UPDATES = [
  {
    id: "2026_10_19_nome_ao_dinheiro",
    date: "2026-10-19",
    topicKey: "primeiro_acesso_nome_dinheiro"
  },
  {
    id: "2026_07_08_updates",
    date: "2026-07-08",
    topicKey: "atualizacoes_sistema"
  },
  {
    id: "conversao_moedas_update",
    date: "2026-06-15",
    topicKey: "conversao_moedas"
  }
];

export const MASCOT_EXPLANATIONS = {
    coin: "Ó, olha pra mim aqui embaixo: eu tô pequenininho igual uma Moedinha porque nosso cofrinho tá quase vazio! Me ajuda a economizar pra eu crescer?",
    bill: "Aê! Tô fortão igual uma Nota de Dinheiro porque você tá cuidando super bem dos nossos potes! Toca aqui! ✋",
    gold: "UAU! Olha como eu tô brilhando em OURO aqui na sua tela! Somos a melhor dupla do mundo guardando moedinhas!"
};

export const getTransitionMessages = (tratamento = {}) => {
    const { vocativo = 'amigo' } = tratamento;
    return {
        upgrade: {
            title: "YUPIII! Eu Subi de Nível! 🌟",
            message: `Ei, olha aqui pro cantinho da tela! Você cuidou tão bem das nossas moedinhas que eu evoluí! Toca aqui, ${vocativo}! ✋`
        },
        downgrade: {
            title: "Ai, ai, ai... Eu Encolhi! 🥺",
            message: "Psst... a gente gastou além da conta esse mês e eu encolhi! Mas não desanima, segura a minha mão que a gente arruma essa bagunça juntos!"
        }
    };
};

export const TRANSITION_MESSAGES = getTransitionMessages();

export const analyzeFinances = (receitas, despesas, tratamento = {}) => {
    const {
        primeiroNome = '',
        vocativo = 'amigo',
        genero = 'masculino',
        recipienteColecao = 'álbum de figurinhas'
    } = tratamento;

    const isFeminino = genero === 'feminino';

    const totalReceitas = receitas || 0;
    const totalDespesas = despesas || 0;
    const saldo = totalReceitas - totalDespesas;

    let analysis = {
        status: "",
        analogy: "",
        tip: "",
        explanation: ""
    };

    if (totalReceitas === 0 && totalDespesas === 0) {
        analysis.status = "Toc, toc! Tem alguém aí fora da tela? 👀";
        analysis.analogy = isFeminino
          ? "Nossa caixinha de moedas ainda tá vazia porque você não anotou nada neste mês! Bora começar a organizar?"
          : "Nosso cofre e álbum de figurinhas ainda estão vazios porque você não anotou nada neste mês! Bora começar a brincar?";
        analysis.tip = "Coloca sua primeira Receita e depois vem dar nome pra ela comigo lá no Orçamento!";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
        return analysis;
    }

    if (saldo > 0) {
        const percentualEconomia = ((totalReceitas - totalDespesas) / totalReceitas) * 100;

        if (percentualEconomia > 75) {
            analysis.status = "Caramba! Você é um Mestre da Economia! 🏆✨";
            analysis.analogy = isFeminino
              ? "Nossa caixinha tá cheia até a tampa! Você guardou quase tudo que ganhou e me transformou em OURO brilhante!"
              : "Nosso cofre tá cheio e o álbum tá completinho! Você guardou quase tudo que ganhou e me transformou em OURO brilhante!";
            analysis.tip = "Bora carimbar esse dinheiro que sobrou com o nome do seu maior sonho?";
            analysis.explanation = MASCOT_EXPLANATIONS.gold;
        } else if (percentualEconomia > 10) {
            analysis.status = primeiroNome ? `Mandou bem, ${primeiroNome}! Estamos no verde! ✋🟢` : `Mandou bem, ${vocativo}! Estamos no verde! ✋🟢`;
            analysis.analogy = isFeminino
              ? "Você usou algumas moedinhas, mas deixou a maior parte guardada na caixinha pro resto do mês! Tô orgulhoso de você!"
              : "Você usou algumas moedinhas, mas deixou um montão guardado no cofre pro resto do mês! Tô orgulhoso de você!";
            analysis.tip = "Antes de comprar mais alguma coisa, brinca no meu 'Quiz: Posso Gastar?' aqui embaixo!";
            analysis.explanation = MASCOT_EXPLANATIONS.bill;
        } else {
            analysis.status = "Eita! Só sobrou o farelo no fundo do cofre! 😬🪙";
            analysis.analogy = "Eu tô vendo daqui de dentro da tela: você já gastou quase todas as moedinhas do mês! Se fizer mais uma compra sem pensar, o cofre zera!";
            analysis.tip = "Segura a carteira nos próximos dias pra gente não cair no vermelho, combinado?";
            analysis.explanation = MASCOT_EXPLANATIONS.coin;
        }
    } else if (saldo === 0) {
        analysis.status = "Zero a zero! Não sobrou nem uma moedinha! 😮";
        analysis.analogy = "Você gastou exatamente tudo que ganhou neste mês! O cofre tá limpinho, sem nenhuma reserva!";
        analysis.tip = "No mês que vem, promete guardar uma moedinha no cofrinho antes de gastar o resto?";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
    } else {
        analysis.status = `Olha aqui, ${vocativo}: gastamos além da conta! 🚨😱`;
        analysis.analogy = isFeminino
          ? "As nossas moedas acabaram e a caixinha ficou devendo! O cofre tá no vermelho!"
          : "As nossas moedas acabaram e o pote tá devendo moedas pro mês que vem!";
        analysis.tip = "Tira a mão do cartão agora! Vamos olhar juntos onde dá pra cortar gastos e usar o Quiz antes de comprar qualquer coisa!";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
    }

    return analysis;
};
