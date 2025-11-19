import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para testar diferentes tipos de orçamentos
function testarOrcamentosTipos() {
    console.log('🧪 Testando diferentes tipos de orçamentos...\n');

    const userDataPath = path.join(__dirname, 'server/data/USER_DATA_user-1763162160964.json');
    
    if (!fs.existsSync(userDataPath)) {
        console.log('❌ Arquivo de dados do usuário não encontrado');
        return;
    }

    const dados = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
    
    console.log('📊 ANÁLISE DE ORÇAMENTOS EXISTENTES:');
    console.log('=====================================');
    
    // Analisar orçamentos existentes
    if (dados.orcamentos && dados.orcamentos.length > 0) {
        dados.orcamentos.forEach((orcamento, index) => {
            console.log(`\n📋 Orçamento ${index + 1}:`);
            console.log(`   ID: ${orcamento.id}`);
            console.log(`   Mês/Ano: ${orcamento.mes}/${orcamento.ano}`);
            console.log(`   Valor: R$ ${orcamento.valor.toFixed(2)}`);
            console.log(`   Categoria: ${orcamento.categoria || 'Geral'}`);
            console.log(`   Descrição: ${orcamento.descricao || 'Sem descrição'}`);
            console.log(`   Status: ${orcamento.status || 'Ativo'}`);
            
            // Calcular gastos do mês
            const gastosMes = dados.despesas.filter(d => {
                const dataDespesa = new Date(d.data);
                return dataDespesa.getMonth() + 1 === orcamento.mes && 
                       dataDespesa.getFullYear() === orcamento.ano;
            });
            
            const totalGastos = gastosMes.reduce((sum, d) => sum + d.valor, 0);
            const percentualGasto = (totalGastos / orcamento.valor) * 100;
            
            console.log(`   Gastos do mês: R$ ${totalGastos.toFixed(2)} (${percentualGasto.toFixed(1)}%)`);
            console.log(`   Saldo restante: R$ ${(orcamento.valor - totalGastos).toFixed(2)}`);
        });
    } else {
        console.log('❌ Nenhum orçamento encontrado');
    }
    
    console.log('\n🔄 TESTES DE DIFERENTES CENÁRIOS:');
    console.log('=================================');
    
    // Teste 1: Orçamento mensal por categoria
    console.log('\n📅 Teste 1: Orçamento Mensal por Categoria');
    const orcamentosPorCategoria = {};
    
    dados.orcamentos.forEach(orcamento => {
        const categoria = orcamento.categoria || 'Geral';
        if (!orcamentosPorCategoria[categoria]) {
            orcamentosPorCategoria[categoria] = [];
        }
        orcamentosPorCategoria[categoria].push(orcamento);
    });
    
    Object.keys(orcamentosPorCategoria).forEach(categoria => {
        const total = orcamentosPorCategoria[categoria].reduce((sum, o) => sum + o.valor, 0);
        console.log(`   ${categoria}: R$ ${total.toFixed(2)} (${orcamentosPorCategoria[categoria].length} orçamentos)`);
    });
    
    // Teste 2: Comparação com receitas do mês
    console.log('\n💰 Teste 2: Comparação Orçamento vs Receitas');
    dados.orcamentos.forEach(orcamento => {
        const receitasMes = dados.receitas.filter(r => {
            const dataReceita = new Date(r.data);
            return dataReceita.getMonth() + 1 === orcamento.mes && 
                   dataReceita.getFullYear() === orcamento.ano;
        });
        
        const totalReceitas = receitasMes.reduce((sum, r) => sum + r.valor, 0);
        const proporcaoOrcamento = (orcamento.valor / totalReceitas) * 100;
        
        console.log(`   ${orcamento.mes}/${orcamento.ano}:`);
        console.log(`      Orçamento: R$ ${orcamento.valor.toFixed(2)}`);
        console.log(`      Receitas: R$ ${totalReceitas.toFixed(2)}`);
        console.log(`      Proporção: ${proporcaoOrcamento.toFixed(1)}%`);
    });
    
    // Teste 3: Análise de tendências
    console.log('\n📈 Teste 3: Análise de Tendências de Orçamento');
    const orcamentosOrdenados = [...dados.orcamentos].sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
    });
    
    console.log('   Evolução mensal:');
    orcamentosOrdenados.forEach((orcamento, index) => {
        if (index > 0) {
            const orcamentoAnterior = orcamentosOrdenados[index - 1];
            const variacao = ((orcamento.valor - orcamentoAnterior.valor) / orcamentoAnterior.valor) * 100;
            console.log(`      ${orcamento.mes}/${orcamento.ano}: R$ ${orcamento.valor.toFixed(2)} (${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%)`);
        } else {
            console.log(`      ${orcamento.mes}/${orcamento.ano}: R$ ${orcamento.valor.toFixed(2)}`);
        }
    });
    
    // Teste 4: Simulação de diferentes tipos de orçamento
    console.log('\n🎯 Teste 4: Simulação de Diferentes Tipos de Orçamento');
    
    const simulacoes = [
        { tipo: 'Mensal Fixo', valor: 3000, mes: 11, ano: 2025, categoria: 'Moradia' },
        { tipo: 'Mensal Variável', valor: 1500, mes: 11, ano: 2025, categoria: 'Alimentação' },
        { tipo: 'Trimestral', valor: 5000, mes: 10, ano: 2025, categoria: 'Transporte' },
        { tipo: 'Anual', valor: 12000, mes: 1, ano: 2025, categoria: 'Saúde' },
        { tipo: 'Por Categoria', valor: 800, mes: 11, ano: 2025, categoria: 'Lazer' }
    ];
    
    simulacoes.forEach(simulacao => {
        console.log(`\n   ${simulacao.tipo}:`);
        console.log(`      Valor: R$ ${simulacao.valor.toFixed(2)}`);
        console.log(`      Período: ${simulacao.mes}/${simulacao.ano}`);
        console.log(`      Categoria: ${simulacao.categoria}`);
        
        // Calcular impacto nas finanças
        const receitasSimuladas = dados.receitas.filter(r => {
            const data = new Date(r.data);
            return data.getMonth() + 1 === simulacao.mes && data.getFullYear() === simulacao.ano;
        }).reduce((sum, r) => sum + r.valor, 0);
        
        const despesasSimuladas = dados.despesas.filter(d => {
            const data = new Date(d.data);
            return data.getMonth() + 1 === simulacao.mes && data.getFullYear() === simulacao.ano;
        }).reduce((sum, d) => sum + d.valor, 0);
        
        const saldoAtual = receitasSimuladas - despesasSimuladas;
        const saldoComOrcamento = receitasSimuladas - (despesasSimuladas + simulacao.valor);
        
        console.log(`      Saldo atual: R$ ${saldoAtual.toFixed(2)}`);
        console.log(`      Saldo c/ orçamento: R$ ${saldoComOrcamento.toFixed(2)}`);
        console.log(`      Impacto: ${((simulacao.valor / receitasSimuladas) * 100).toFixed(1)}% das receitas`);
    });
    
    console.log('\n✅ Teste de diferentes tipos de orçamentos concluído!');
}

// Executar teste
testarOrcamentosTipos();