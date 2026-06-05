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

    let output = '--- Resumo Q1 2026 ---\n';
    let totalQ1 = 0;
    const cats = Object.keys(gastoPorCat).sort();
    cats.forEach(cat => {
        const mediaMensal = gastoPorCat[cat] / 3;
        output += `${cat}: Total=${gastoPorCat[cat].toFixed(2)}, Média Mensal=${mediaMensal.toFixed(2)}\n`;
        totalQ1 += mediaMensal;
    });
    output += 'Total Médio Mensal Q1: ' + totalQ1.toFixed(2) + '\n';
    
    output += '\n--- Percentuais Atuais (Baseados no Total Médio de ' + totalQ1.toFixed(2) + ') ---\n';
    cats.forEach(cat => {
        const mediaMensal = gastoPorCat[cat] / 3;
        const perc = (mediaMensal / totalQ1) * 100;
        output += `${cat}: ${perc.toFixed(2)}%\n`;
    });

    fs.writeFileSync('c:/PROJETOS/FINANÇAS/financas-facil/tmp/analise_result_utf8.txt', output, 'utf8');
    console.log('Análise concluída e salva em tmp/analise_result_utf8.txt');

} catch (e) {
    console.error('Erro:', e.message);
}
