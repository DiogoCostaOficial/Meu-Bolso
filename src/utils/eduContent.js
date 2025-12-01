export const EDU_CONTENT = {
    dashboard: {
        title: "Entendendo o Dashboard",
        explanation: "O Dashboard é como o painel do seu carro. Ele mostra, de forma rápida, como está a saúde do seu dinheiro neste mês.",
        analogy: "Imagine que é uma foto do momento atual: quanto você tem, quanto já gastou e quanto sobra.",
        tips: [
            "Olhe o Dashboard todos os dias para não ter surpresas.",
            "Se o saldo estiver verde, parabéns! Se estiver vermelho, hora de frear os gastos.",
            "Use os gráficos para ver onde seu dinheiro está indo."
        ]
    },
    receitas: {
        title: "O que são Receitas?",
        explanation: "Receitas são todo o dinheiro que entra no seu bolso. Pode ser salário, vendas, mesada ou qualquer ganho extra.",
        analogy: "É como a água que enche a sua caixa d'água. Quanto mais entra, mais você tem para usar.",
        tips: [
            "Anote até os centavos que ganhar.",
            "Tente ter mais de uma fonte de renda, se possível.",
            "Comemore cada dinheiro que entra!"
        ]
    },
    despesas: {
        title: "O que são Despesas?",
        explanation: "Despesas são todos os gastos que tiram dinheiro do seu bolso. Contas, compras, lanches, tudo conta.",
        analogy: "É como a torneira aberta da caixa d'água. Se abrir demais, a água acaba rápido.",
        tips: [
            "Anote tudo, até o cafezinho.",
            "Separe o que é necessidade do que é desejo.",
            "Antes de comprar, pergunte-se: 'Eu preciso mesmo disso agora?'"
        ]
    },
    orcamento: {
        title: "Para que serve o Orçamento?",
        explanation: "O Orçamento é o seu plano de voo. É onde você define quanto QUER e PODE gastar em cada coisa antes do mês começar.",
        analogy: "É como dividir um bolo em fatias antes de comer. Você decide o tamanho da fatia para cada pessoa (ou gasto).",
        tips: [
            "Faça seu orçamento no primeiro dia do mês.",
            "Tente seguir o plano, mas ajuste se precisar.",
            "Deixe sempre uma fatia para guardar (investir)."
        ]
    },
    cartoes: {
        title: "Cuidado com o Cartão de Crédito",
        explanation: "O cartão de crédito não é dinheiro extra. É um empréstimo que o banco te faz e que você tem que pagar depois.",
        analogy: "É como comer a sobremesa antes do jantar. Uma hora a conta chega e você tem que pagar.",
        tips: [
            "Use o cartão com sabedoria, não gaste o que não tem.",
            "Pague sempre o valor total da fatura.",
            "Cuidado com o limite, ele não é seu salário."
        ]
    },
    relatorios: {
        title: "Lendo os Relatórios",
        explanation: "Os relatórios contam a história do seu dinheiro. Eles mostram o passado para você planejar melhor o futuro.",
        analogy: "É como olhar o álbum de fotos da sua viagem financeira. Você vê o que foi legal e o que pode melhorar.",
        tips: [
            "Veja onde você gastou mais no mês passado.",
            "Compare os meses para ver se está evoluindo.",
            "Use essas informações para ajustar seu orçamento."
        ]
    },
    dre: {
        title: "O que é DRE?",
        explanation: "DRE é um nome complicado para algo simples: é o resumo final. Mostra se você teve Lucro (sobrou dinheiro) ou Prejuízo (faltou dinheiro).",
        analogy: "É o placar final do jogo. Ganhou ou perdeu no mês?",
        tips: [
            "Busque sempre ter Lucro (saldo positivo).",
            "Se der Prejuízo, investigue onde gastou demais.",
            "O objetivo é fazer o Lucro crescer todo mês."
        ]
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
        tip: ""
    };

    if (totalReceitas === 0 && totalDespesas === 0) {
        analysis.status = "Tudo calmo por aqui.";
        analysis.analogy = "Seu caderno está em branco. Que tal começar a anotar?";
        analysis.tip = "Adicione sua primeira receita ou despesa para começarmos.";
        return analysis;
    }

    if (saldo > 0) {
        if (percentualGasto < 50) {
            analysis.status = "Uau! Você está cuidando muito bem do seu dinheiro.";
            analysis.analogy = "Sua plantinha financeira está crescendo forte e saudável!";
            analysis.tip = "Que tal guardar esse dinheiro extra para um sonho grande?";
        } else if (percentualGasto < 90) {
            analysis.status = "Muito bem! Você está no azul.";
            analysis.analogy = "Seu barco está navegando em águas tranquilas.";
            analysis.tip = "Continue assim e tente diminuir um pouquinho as despesas supérfluas.";
        } else {
            analysis.status = "Cuidado, você está gastando quase tudo que ganha.";
            analysis.analogy = "Seu copo está cheio até a borda. Qualquer gota a mais pode transbordar.";
            analysis.tip = "Tente segurar os gastos nos próximos dias para não ficar no vermelho.";
        }
    } else if (saldo === 0) {
        analysis.status = "Empate técnico! Você gastou exatamente o que ganhou.";
        analysis.analogy = "É como uma balança perfeitamente equilibrada, mas perigosa.";
        analysis.tip = "Tente gastar um pouquinho menos no próximo mês para sobrar algo.";
    } else {
        // Saldo negativo
        analysis.status = "Atenção! Você gastou mais do que ganhou.";
        analysis.analogy = "Sua mochila de gastos está muito pesada para carregar.";
        analysis.tip = "Revise suas despesas urgentes. Corte o que não for essencial agora.";
    }

    return analysis;
};
