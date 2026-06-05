const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/USER_DATA_admin-001.json');
const userData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const months = ['2026-01', '2026-02', '2026-03', '2026-04'];

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function distributeExpenses(totalAmount, month) {
    const expenses = [];
    let remaining = totalAmount;

    const weights = {
        'Moradia': 0.35,
        'Educação': 0.20,
        'Alimentação': 0.25,
        'Saúde': 0.10,
        'Transporte': 0.05,
        'Lazer': 0.03,
        'Despesas Fixas': 0.02
    };

    let idCounter = Date.now() + Math.floor(Math.random() * 1000000);

    for (const [cat, weight] of Object.entries(weights)) {
        let amount = totalAmount * weight;
        if (cat === 'Despesas Fixas') {
            amount = remaining; // Adjust the last one to make sum exact
        } else {
            amount = parseFloat((amount * randomBetween(0.9, 1.1)).toFixed(2));
            remaining -= amount;
        }

        expenses.push({
            descricao: `Despesa ${cat}`,
            valor: parseFloat(amount.toFixed(2)),
            data: `${month}-15`,
            categoria: cat,
            subcategoria: "Geral",
            observacoes: "Gerado automaticamente",
            recorrente: true,
            pago: true,
            id: idCounter++
        });
    }

    const sum = expenses.reduce((acc, curr) => acc + curr.valor, 0);
    const diff = totalAmount - sum;
    if (diff !== 0) {
        expenses[expenses.length - 1].valor = parseFloat((expenses[expenses.length - 1].valor + diff).toFixed(2));
    }

    return expenses;
}

for (const month of months) {
    let idCounter = Date.now() + Math.floor(Math.random() * 1000000);
    
    // Renda
    userData.receitas.push({
      "descricao": "Salário Pai",
      "valor": 6000.00,
      "data": `${month}-05`,
      "categoria": "Receita Principal",
      "subcategoria": "Salário Principal",
      "observacoes": "Líquido CLT",
      "recorrente": true,
      "id": idCounter++
    });
    userData.receitas.push({
      "descricao": "Salário Mãe",
      "valor": 4000.00,
      "data": `${month}-05`,
      "categoria": "Receita Principal",
      "subcategoria": "Salário Principal",
      "observacoes": "Líquido CLT",
      "recorrente": true,
      "id": idCounter++
    });

    // Despesas
    const totalExpenses = parseFloat(randomBetween(6000, 8200).toFixed(2));
    const monthlyExpenses = distributeExpenses(totalExpenses, month);
    userData.despesas.push(...monthlyExpenses);

    // Orçamento
    userData.orcamentos.push({
      "mes": month,
      "rendaPrevista": "10000.00",
      "dividas": "0.00",
      "rendaReal": "10000.00",
      "categorias": [
        { "nome": "Moradia", "percentual": 35, "cor": "#3B82F6", "gastoAtual": parseFloat((totalExpenses * 0.35).toFixed(2)) },
        { "nome": "Educação", "percentual": 20, "cor": "#F59E0B", "gastoAtual": parseFloat((totalExpenses * 0.20).toFixed(2)) },
        { "nome": "Alimentação", "percentual": 25, "cor": "#EF4444", "gastoAtual": parseFloat((totalExpenses * 0.25).toFixed(2)) },
        { "nome": "Saúde", "percentual": 10, "cor": "#10B981", "gastoAtual": parseFloat((totalExpenses * 0.10).toFixed(2)) },
        { "nome": "Transporte", "percentual": 5, "cor": "#8B5CF6", "gastoAtual": parseFloat((totalExpenses * 0.05).toFixed(2)) },
        { "nome": "Despesas Fixas", "percentual": 2, "cor": "#6B7280", "gastoAtual": parseFloat((totalExpenses * 0.02).toFixed(2)) },
        { "nome": "Lazer", "percentual": 3, "cor": "#EC4899", "gastoAtual": parseFloat((totalExpenses * 0.03).toFixed(2)) }
      ]
    });
}

fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));
console.log("Mock data generated successfully!");
