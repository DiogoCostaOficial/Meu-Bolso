const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/USER_DATA_admin-001.json');
const userData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Mapa de regras para reclassificar Despesas
userData.despesas.forEach(d => {
    const cat = d.categoria;
    const sub = d.subcategoria;

    if (cat === 'Moradia') {
        d.categoria = 'Despesas Fixas';
        d.subcategoria = 'Moradia';
    } else if (cat === 'Alimentação') {
        if (sub === 'Lanches e Saídas') {
            d.categoria = 'Lazer';
            d.subcategoria = 'Junkie Food';
        } else {
            d.categoria = 'Despesas Fixas';
            d.subcategoria = 'Mercado';
        }
    } else if (cat === 'Saúde') {
        d.categoria = 'Despesas Fixas';
        d.subcategoria = 'Saúde';
    } else if (cat === 'Transporte') {
        if (sub === 'Posto') {
            d.categoria = 'Despesas Fixas';
            d.subcategoria = 'Carro';
        } else {
            d.categoria = 'Despesas Fixas';
            d.subcategoria = 'Transporte';
        }
    } else if (cat === 'Educação') {
        d.categoria = 'Educação';
        if (sub === 'Cursos Extras' || sub === 'Idiomas') {
            d.subcategoria = 'Idiomas';
        } else if (sub === 'Escola Particular' || sub === 'Ensino Fundamental') {
            d.subcategoria = 'Diversos Educação';
        } else {
            d.subcategoria = 'Diversos Educação';
        }
    } else if (cat === 'Lazer') {
        d.categoria = 'Lazer';
        if (sub === 'Assinaturas') {
            d.subcategoria = 'Assinaturas';
        } else {
            d.subcategoria = 'Rolês e Passeios';
        }
    } else if (cat === 'Investimentos') {
        d.categoria = 'Investimentos';
        d.subcategoria = 'Investimentos BR';
    } else if (cat === 'Despesas Fixas') {
        d.categoria = 'Despesas Fixas';
        if (sub === 'Luz' || sub === 'Água' || sub === 'Internet') {
            d.subcategoria = 'Moradia';
        } else {
            d.subcategoria = 'Diversos Fixos';
        }
    }
});

// Atualizar Orcamentos
userData.orcamentos.forEach(orc => {
    let novasCategorias = {
        'Despesas Fixas': { percentual: 0, gastoAtual: 0, cor: '#EF4444' },
        'Lazer': { percentual: 0, gastoAtual: 0, cor: '#3B82F6' },
        'Educação': { percentual: 0, gastoAtual: 0, cor: '#10B981' },
        'Investimentos': { percentual: 0, gastoAtual: 0, cor: '#8B5CF6' },
        'Reserva de Emergência': { percentual: 0, gastoAtual: 0, cor: '#F59E0B' }
    };

    orc.categorias.forEach(c => {
        if (['Moradia', 'Alimentação', 'Saúde', 'Transporte', 'Despesas Fixas'].includes(c.nome)) {
            novasCategorias['Despesas Fixas'].percentual += c.percentual;
            novasCategorias['Despesas Fixas'].gastoAtual += c.gastoAtual;
        } else if (c.nome === 'Educação') {
            novasCategorias['Educação'].percentual += c.percentual;
            novasCategorias['Educação'].gastoAtual += c.gastoAtual;
        } else if (c.nome === 'Lazer') {
            novasCategorias['Lazer'].percentual += c.percentual;
            novasCategorias['Lazer'].gastoAtual += c.gastoAtual;
        } else if (c.nome === 'Investimentos') {
            novasCategorias['Investimentos'].percentual += c.percentual;
            novasCategorias['Investimentos'].gastoAtual += c.gastoAtual;
        } else if (c.nome === 'Reserva de Emergência') {
            novasCategorias['Reserva de Emergência'].percentual += c.percentual;
            novasCategorias['Reserva de Emergência'].gastoAtual += c.gastoAtual;
        }
    });

    // Converter objeto novasCategorias de volta para array
    orc.categorias = Object.keys(novasCategorias).map(nome => ({
        nome: nome,
        percentual: parseFloat(novasCategorias[nome].percentual.toFixed(2)),
        gastoAtual: parseFloat(novasCategorias[nome].gastoAtual.toFixed(2)),
        cor: novasCategorias[nome].cor
    }));
});

fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));
console.log("Categories fixed successfully!");
