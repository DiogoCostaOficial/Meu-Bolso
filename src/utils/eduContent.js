export const EDU_CONTENT = {
    dashboard: {
        title: "Entendendo o Dashboard",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! O Dashboard é como o painel do seu carro. Ele mostra, de forma rápida, como está a saúde do seu dinheiro neste mês.",
        analogy: "Imagine que é uma foto do momento atual: quanto você tem, quanto já gastou e quanto sobra.",
        tips: [
            "Olhe o Dashboard todos os dias para não ter surpresas.",
            "Se o saldo estiver verde, parabéns! Se estiver vermelho, hora de frear os gastos.",
            "Use os gráficos para ver onde seu dinheiro está indo."
        ]
    },
    receitas: {
        title: "O que são Receitas?",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! Receitas são todo o dinheiro que entra no seu bolso. Pode ser salário, vendas, mesada ou qualquer ganho extra.",
        analogy: "É como a água que enche a sua caixa d'água. Quanto mais entra, mais você tem para usar.",
        tips: [
            "Anote até os centavos que ganhar.",
            "Tente ter mais de uma fonte de renda, se possível.",
            "Comemore cada dinheiro que entra!"
        ]
    },
    despesas: {
        title: "O que são Despesas?",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! Despesas são todos os gastos que tiram dinheiro do seu bolso. Contas, compras, lanches, tudo conta.",
        analogy: "É como a torneira aberta da caixa d'água. Se abrir demais, a água acaba rápido.",
        tips: [
            "Anote tudo, até o cafezinho.",
            "Separe o que é necessidade do que é desejo.",
            "Antes de comprar, pergunte-se: 'Eu preciso mesmo disso agora?'"
        ]
    },
    orcamento: {
        title: "Para que serve o Orçamento?",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! O Orçamento é o seu plano de voo. É onde você define quanto QUER e PODE gastar em cada coisa antes do mês começar.",
        analogy: "É como dividir um bolo em fatias antes de comer. Você decide o tamanho da fatia para cada pessoa (ou gasto).",
        tips: [
            "Faça seu orçamento no primeiro dia do mês.",
            "Tente seguir o plano, mas ajuste se precisar.",
            "Deixe sempre uma fatia para guardar (investir)."
        ]
    },
    cartoes: {
        title: "Cuidado com o Cartão de Crédito",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! O cartão de crédito não é dinheiro extra. É um empréstimo que o banco te faz e que você tem que pagar depois.",
        analogy: "É como comer a sobremesa antes do jantar. Uma hora a conta chega e você tem que pagar.",
        tips: [
            "Use o cartão com sabedoria, não gaste o que não tem.",
            "Pague sempre o valor total da fatura.",
            "Cuidado com o limite, ele não é seu salário."
        ]
    },
    relatorios: {
        title: "Lendo os Relatórios",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! Os relatórios contam a história do seu dinheiro. Eles mostram o passado para você planejar melhor o futuro.",
        analogy: "É como olhar o álbum de fotos da sua viagem financeira. Você vê o que foi legal e o que pode melhorar.",
        tips: [
            "Veja onde você gastou mais no mês passado.",
            "Compare os meses para ver se está evoluindo.",
            "Use essas informações para ajustar seu orçamento."
        ]
    },
    dre: {
        title: "O que é DRE?",
        explanation: "Olá, eu sou o FIN e irei te ajudar a manter as contas em dia e ainda sobrar um dinheirinho! DRE é um nome complicado para algo simples: é o resumo final. Mostra se você teve Lucro (sobrou dinheiro) ou Prejuízo (faltou dinheiro).",
        analogy: "É o placar final do jogo. Ganhou ou perdeu no mês?",
        tips: [
            "Busque sempre ter Lucro (saldo positivo).",
            "Se der Prejuízo, investigue onde gastou demais.",
            "O objetivo é fazer o Lucro crescer todo mês."
        ]
    }
};

export const MASCOT_EXPLANATIONS = {
    coin: "Estou como Moedinha porque estamos com pouco dinheiro ou gastando muito. Vamos economizar para eu crescer!",
    bill: "Estou como Dinheiro porque suas contas estão equilibradas. Continue assim!",
    gold: "Estou como Ouro porque você está economizando muito bem! Parabéns!"
};

export const TRANSITION_MESSAGES = {
    upgrade: {
        title: "Parabéns! Eu Evoluí!",
        message: "Uau! Suas finanças melhoraram e eu cresci! Continue cuidando bem do seu dinheiro."
    },
    downgrade: {
        title: "Cuidado! Eu Encolhi...",
        message: "Ops! Parece que gastamos demais. Mas não se preocupe, vou te ajudar a colocar tudo em ordem de novo."
    }
};

export const analyzeFinances = (receitas, despesas) => {
    const totalReceitas = receitas || 0;
    const totalDespesas = despesas || 0;
    const saldo = totalReceitas - totalDespesas;
    const percentualGasto = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;

    let analysis = {
        status: "",
        analogy: "",
        tip: "",
        explanation: "" // New field for mascot explanation
    };

    if (totalReceitas === 0 && totalDespesas === 0) {
        analysis.status = "Tudo calmo por aqui.";
        analysis.analogy = "Seu caderno está em branco. Que tal começar a anotar?";
        analysis.tip = "Adicione sua primeira receita ou despesa para começarmos.";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
        return analysis;
    }

    if (saldo > 0) {
        // Calcular percentual de economia
        const percentualEconomia = ((totalReceitas - totalDespesas) / totalReceitas) * 100;

        if (percentualEconomia > 75) {
            analysis.status = "Uau! Você está cuidando muito bem do seu dinheiro.";
            analysis.analogy = "Sua plantinha financeira está crescendo forte e saudável! Eu estou virando Ouro!";
            analysis.tip = "Que tal guardar esse dinheiro extra para um sonho grande?";
            analysis.explanation = MASCOT_EXPLANATIONS.gold;
        } else if (percentualEconomia > 10) {
            analysis.status = "Muito bem! Você está no azul.";
            analysis.analogy = "Seu barco está navegando em águas tranquilas. Estou me sentindo uma nota de Dinheiro forte!";
            analysis.tip = "Continue assim e tente diminuir um pouquinho as despesas supérfluas.";
            analysis.explanation = MASCOT_EXPLANATIONS.bill;
        } else {
            analysis.status = "Cuidado, você está gastando quase tudo que ganha.";
            analysis.analogy = "Seu copo está cheio até a borda. Qualquer gota a mais pode transbordar. Estou encolhendo e virando uma Moedinha.";
            analysis.tip = "Tente segurar os gastos nos próximos dias para não ficar no vermelho.";
            analysis.explanation = MASCOT_EXPLANATIONS.coin;
        }
    } else if (saldo === 0) {
        analysis.status = "Empate técnico! Você gastou exatamente o que ganhou.";
        analysis.analogy = "É como uma balança perfeitamente equilibrada, mas perigosa. Cuidado para eu não virar Moedinha!";
        analysis.tip = "Tente gastar um pouquinho menos no próximo mês para sobrar algo.";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
    } else {
        // Saldo negativo
        analysis.status = "Alerta Vermelho! Você gastou mais do que ganhou.";
        analysis.analogy = "Estamos no vermelho! Virei uma Moedinha preocupada.";
        analysis.tip = "Pare de gastar agora! Revise onde pode cortar para sair do vermelho.";
        analysis.explanation = MASCOT_EXPLANATIONS.coin;
    }

    return analysis;
};
