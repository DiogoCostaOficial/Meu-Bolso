const fs = require('fs');
const path = 'c:/PROJETOS/FINANÇAS/financas-facil/server/data/USER_DATA_user-1763162160964.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const despesas = data.despesas || [];

const despesasQ1 = despesas.filter(d => {
    if (!d.data || d.somarNoOrcamento === false) return false;
    const [ano, mes] = d.data.split('-');
    return ano === '2026' && (mes === '01' || mes === '02' || mes === '03');
});

const gastoPorCat = {};
despesasQ1.forEach(d => {
    const cat = d.categoria || 'Geral';
    gastoPorCat[cat] = (gastoPorCat[cat] || 0) + Number(d.valor);
});

console.log('--- Resumo Q1 2026 ---');
let totalQ1 = 0;
for (const cat in gastoPorCat) {
    const mediaMensal = gastoPorCat[cat] / 3;
    console.log(`${cat}: Total=${gastoPorCat[cat].toFixed(2)}, Média Mensal=${mediaMensal.toFixed(2)}`);
    totalQ1 += mediaMensal;
}
console.log('Total Médio Mensal Q1:', totalQ1.toFixed(2));
