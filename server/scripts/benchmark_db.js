const { inicializarDB, salvarDadosUsuario, deletarUsuario } = require('../utils/database');
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const userId = 'benchmark_user_' + Date.now();

const generatePayload = (count) => {
    const transactions = [];
    for (let i = 0; i < count; i++) {
        transactions.push({
            id: generateId(),
            descricao: `Transaction ${i}`,
            valor: 100 + i,
            data: new Date().toISOString().split('T')[0],
            categoria: 'Others',
            subcategoria: 'Test',
            tipo: i % 2 === 0 ? 'receita' : 'despesa',
            status: 'efetivado',
            statusPagamento: 'pago',
            parcelado: false,
            parcelas: 1,
            parcelaAtual: 1,
            observacao: 'Benchmark'
        });
    }
    return transactions;
};

const runBenchmark = async () => {
    console.log('Starting Benchmark...');
    try {
        await inicializarDB();

        // 100 Transactions
        const transactions = generatePayload(100);
        const startTime = Date.now();

        await salvarDadosUsuario(userId, {
            receitas: transactions.filter(t => t.tipo === 'receita'),
            despesas: transactions.filter(t => t.tipo === 'despesa')
        });

        const endTime = Date.now();
        console.log(`Time taken to save 100 transactions: ${endTime - startTime}ms`);

        // Clean up
        await deletarUsuario(userId);
        console.log('Cleanup done.');

    } catch (err) {
        console.error('Benchmark failed:', err);
    }
    process.exit(0);
};

runBenchmark();
