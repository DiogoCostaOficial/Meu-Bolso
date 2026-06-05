const fs = require('fs');
const path = 'c:/PROJETOS/FINANÇAS/financas-facil/server/data/USER_DATA_user-1763162160964.json';

try {
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

    let totalQ1 = 0;
    const cats = Object.keys(gastoPorCat).sort();
    cats.forEach(cat => totalQ1 += gastoPorCat[cat] / 3);

    console.log('--- Resumo Q1 2026 ---');
    cats.forEach(cat => {
        const media = (gastoPorCat[cat] / 3).toFixed(2);
        const perc = ((gastoPorCat[cat] / 3) / totalQ1 * 100).toFixed(2);
        console.log(`${cat}: ${media} (${perc}%)`);
    });
    console.log('Total:', totalQ1.toFixed(2));

} catch (e) {
    console.error('Erro:', e.message);
}
