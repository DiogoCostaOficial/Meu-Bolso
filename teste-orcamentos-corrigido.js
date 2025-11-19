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
            console.log(`   Mês/Ano: ${orcamento.mes}`);
            console.log(`   Renda Prevista: R$ ${parseFloat(orcamento.rendaPrevista).toFixed(2)}`);
            console.log(`   Renda Real: R$ ${parseFloat(orcamento.rendaReal).toFixed(2)}`);
            console.log(`   Dívidas: ${orcamento.dividas || 'Nenhuma'}`);
            
            if (orcamento.categorias && orcamento.categorias.length > 0) {
                console.log(`   Categorias (${orcamento.categorias.length}):`);
                orcamento.categorias.forEach(categoria => {
                    console.log(`      - ${categoria.nome}: ${categoria.percentual}% (Cor: ${categoria.cor})`);
                });
            }
            
            // Calcular gastos do mês correspondente
            const [ano, mes] = orcamento.mes.split('-').map(Number);
            const gastosMes = dados.despesas.filter(d => {
                const dataDespesa = new Date(d.data);
                return dataDespesa.getMonth() + 1 === mes && 
                       dataDespesa.getFullYear() === ano;
            });
            
            const totalGastos = gastosMes.reduce((sum, d) => sum + parseFloat(d.valor), 0);
            const rendaReal = parseFloat(orcamento.rendaReal);
            const percentualGasto = (totalGastos / rendaReal) * 100;
            const saldoRestante = rendaReal - totalGastos;
            
            console.log(`   Gastos do mês: R$ ${totalGastos.toFixed(2)} (${percentualGasto.toFixed(1)}%)`);
            console.log(`   Saldo restante: R$ ${saldoRestante.toFixed(2)}`);
            
            // Verificar se está dentro do orçamento por categoria
            if (orcamento.categorias) {
                console.log(`   Análise por categoria:`);
                orcamento.categorias.forEach(categoria => {
                    const gastosCategoria = gastosMes.filter(d => d.categoria === categoria.nome);
                    const totalCategoria = gastosCategoria.reduce((sum, d) => sum + parseFloat(d.valor), 0);
                    const orcamentoCategoria = (rendaReal * categoria.percentual) / 100;
                    const percentualUso = (totalCategoria / orcamentoCategoria) * 100;
                    
                    console.log(`      ${categoria.nome}:`);
                    console.log(`         Orçado: R$ ${orcamentoCategoria.toFixed(2)} (${categoria.percentual}%)`);
                    console.log(`         Gasto: R$ ${totalCategoria.toFixed(2)} (${percentualUso.toFixed(1)}% usado)`);
                    console.log(`         Disponível: R$ ${(orcamentoCategoria - totalCategoria).toFixed(2)}`);
                });
            }
        });
    } else {
        console.log('❌ Nenhum orçamento encontrado');
    }
    
    console.log('\n🔄 TESTES DE DIFERENTES CENÁRIOS:');
    console.log('=================================');
    
    // Teste 1: Análise de performance orçamentária
    console.log('\n📊 Teste 1: Performance Orçamentária por Mês');
    const performancePorMes = {};
    
    dados.orcamentos.forEach(orcamento => {
        const [ano, mes] = orcamento.mes.split('-').map(Number);
        const rendaReal = parseFloat(orcamento.rendaReal);
        
        const gastosMes = dados.despesas.filter(d => {
            const dataDespesa = new Date(d.data);
            return dataDespesa.getMonth() + 1 === mes && 
                   dataDespesa.getFullYear() === ano;
        }).reduce((sum, d) => sum + parseFloat(d.valor), 0);
        
        const percentualGasto = (gastosMes / rendaReal) * 100;
        const saldo = rendaReal - gastosMes;
        
        performancePorMes[orcamento.mes] = {
            renda: rendaReal,
            gastos: gastosMes,
            percentual: percentualGasto,
            saldo: saldo
        };
    });
    
    Object.keys(performancePorMes).forEach(mes => {
        const perf = performancePorMes[mes];
        console.log(`   ${mes}:`);
        console.log(`      Renda: R$ ${perf.renda.toFixed(2)}`);
        console.log(`      Gastos: R$ ${perf.gastos.toFixed(2)}`);
        console.log(`      % Usado: ${perf.percentual.toFixed(1)}%`);
        console.log(`      Saldo: R$ ${perf.saldo.toFixed(2)}`);
        console.log(`      Status: ${perf.percentual > 100 ? '❌ Estourado' : perf.percentual > 80 ? '⚠️ Próximo do limite' : '✅ Dentro do orçamento'}`);
    });
    
    // Teste 2: Comparação entre meses
    console.log('\n📈 Teste 2: Comparação Entre Meses');
    const mesesOrdenados = Object.keys(performancePorMes).sort();
    for (let i = 1; i < mesesOrdenados.length; i++) {
        const mesAtual = mesesOrdenados[i];
        const mesAnterior = mesesOrdenados[i - 1];
        const perfAtual = performancePorMes[mesAtual];
        const perfAnterior = performancePorMes[mesAnterior];
        
        const variacaoGastos = ((perfAtual.gastos - perfAnterior.gastos) / perfAnterior.gastos) * 100;
        const variacaoSaldo = ((perfAtual.saldo - perfAnterior.saldo) / Math.abs(perfAnterior.saldo)) * 100;
        
        console.log(`   ${mesAnterior} → ${mesAtual}:`);
        console.log(`      Variação de gastos: ${variacaoGastos >= 0 ? '+' : ''}${variacaoGastos.toFixed(1)}%`);
        console.log(`      Variação de saldo: ${variacaoSaldo >= 0 ? '+' : ''}${variacaoSaldo.toFixed(1)}%`);
    }
    
    // Teste 3: Simulação de alertas e recomendações
    console.log('\n⚠️ Teste 3: Sistema de Alertas e Recomendações');
    dados.orcamentos.forEach(orcamento => {
        const [ano, mes] = orcamento.mes.split('-').map(Number);
        const rendaReal = parseFloat(orcamento.rendaReal);
        
        const gastosMes = dados.despesas.filter(d => {
            const dataDespesa = new Date(d.data);
            return dataDespesa.getMonth() + 1 === mes && 
                   dataDespesa.getFullYear() === ano;
        }).reduce((sum, d) => sum + parseFloat(d.valor), 0);
        
        const percentualGasto = (gastosMes / rendaReal) * 100;
        
        console.log(`\n   ${orcamento.mes}:`);
        if (percentualGasto > 100) {
            console.log(`      🚨 ALERTA: Orçamento estourado em ${(percentualGasto - 100).toFixed(1)}%`);
            console.log(`      💡 Recomendação: Reduzir gastos ou aumentar renda`);
        } else if (percentualGasto > 90) {
            console.log(`      ⚠️ ATENÇÃO: Próximo do limite (${percentualGasto.toFixed(1)}%)`);
            console.log(`      💡 Recomendação: Monitorar gastos restantes do mês`);
        } else if (percentualGasto < 50) {
            console.log(`      ✅ BOM: Gastos abaixo da metade (${percentualGasto.toFixed(1)}%)`);
            console.log(`      💡 Recomendação: Considerar investir o excedente`);
        } else {
            console.log(`      ✓ Normal: ${percentualGasto.toFixed(1)}% do orçamento utilizado`);
        }
    });
    
    console.log('\n✅ Teste de diferentes tipos de orçamentos concluído!');
}

// Executar teste
testarOrcamentosTipos();