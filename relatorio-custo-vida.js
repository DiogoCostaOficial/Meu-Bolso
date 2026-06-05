import fs from 'fs';
import path from 'path';

const userId = 'user-1763162160964';
const dadosPath = path.join(process.cwd(), 'server/data/USER_DATA_' + userId + '.json');

try {
    if (!fs.existsSync(dadosPath)) {
        console.error('❌ Arquivo de dados não encontrado:', dadosPath);
        process.exit(1);
    }

    const dados = JSON.parse(fs.readFileSync(dadosPath, 'utf8'));
    const despesas = dados.despesas || [];

    const categoriasAlvo = ['Despesas Fixas', 'Educação', 'Lazer'];

    // Filtrar despesas das categorias alvo
    const despesasFiltradas = despesas.filter(d => categoriasAlvo.includes(d.categoria));

    if (despesasFiltradas.length === 0) {
        console.log('⚠️ Nenhuma despesa encontrada para as categorias:', categoriasAlvo.join(', '));
        process.exit(0);
    }

    // Agrupar por mês e ano para calcular a média mensal
    const gastosPorMes = {};
    const totaisPorCategoria = {
        'Despesas Fixas': 0,
        'Educação': 0,
        'Lazer': 0
    };

    despesasFiltradas.forEach(d => {
        const valor = parseFloat(d.valor) || 0;
        const data = d.data; // Formato YYYY-MM-DD
        const mesAno = data.substring(0, 7); // YYYY-MM

        if (!gastosPorMes[mesAno]) {
            gastosPorMes[mesAno] = {
                total: 0,
                'Despesas Fixas': 0,
                'Educação': 0,
                'Lazer': 0
            };
        }

        gastosPorMes[mesAno].total += valor;
        gastosPorMes[mesAno][d.categoria] += valor;
        totaisPorCategoria[d.categoria] += valor;
    });

    const meses = Object.keys(gastosPorMes).sort();
    const numMeses = meses.length;

    const totalGeral = Object.values(totaisPorCategoria).reduce((a, b) => a + b, 0);
    const mediaMensalGeral = totalGeral / numMeses;

    const mediasPorCategoria = {};
    for (const cat of categoriasAlvo) {
        mediasPorCategoria[cat] = totaisPorCategoria[cat] / numMeses;
    }

    // Gerar o relatório em Markdown
    let relatorio = `# 📊 Relatório de Custo de Vida\n\n`;
    relatorio += `**Categorias Analisadas:** ${categoriasAlvo.join(', ')}\n`;
    relatorio += `**Período:** ${meses[0]} até ${meses[numMeses - 1]} (${numMeses} meses)\n\n`;

    relatorio += `## 💰 Resumo Geral\n\n`;
    relatorio += `| Categoria | Total Gasto | Média Mensal |\n`;
    relatorio += `| :--- | :--- | :--- |\n`;
    categoriasAlvo.forEach(cat => {
        relatorio += `| ${cat} | R$ ${totaisPorCategoria[cat].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | R$ ${mediasPorCategoria[cat].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    });
    relatorio += `| **TOTAL** | **R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** | **R$ ${mediaMensalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** |\n\n`;

    relatorio += `## 📉 Detalhamento Mensal\n\n`;
    relatorio += `| Mês | Despesas Fixas | Educação | Lazer | Total |\n`;
    relatorio += `| :--- | :--- | :--- | :--- | :--- |\n`;
    meses.forEach(mes => {
        const g = gastosPorMes[mes];
        relatorio += `| ${mes} | R$ ${g['Despesas Fixas'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${g['Educação'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${g['Lazer'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | R$ ${g.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |\n`;
    });

    relatorio += `\n\n> **Conclusão:** O custo de vida médio mensal, considerando as categorias selecionadas, é de **R$ ${mediaMensalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.`;

    const relatorioPath = path.join(process.cwd(), 'relatorio_custo_vida.md');
    fs.writeFileSync(relatorioPath, relatorio);

    console.log('✅ Relatório gerado com sucesso em:', relatorioPath);
    console.log('\n--- RESUMO ---');
    console.log(`Total de meses: ${numMeses}`);
    console.log(`Média do Custo de Vida: R$ ${mediaMensalGeral.toFixed(2)}`);

} catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
}
