import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function debugSistemaCompleto() {
    console.log('🔍 Debug completo do sistema de login e dashboard...\n');
    
    // 1. Testar login via API
    console.log('🔐 TESTANDO LOGIN VIA API:');
    console.log('=========================');
    
    try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        });
        
        console.log('✅ Login API bem-sucedido');
        console.log(`   Token: ${loginResponse.data.token.substring(0, 50)}...`);
        console.log(`   Usuário: ${loginResponse.data.user.nome}`);
        
        // 2. Testar acesso aos dados com token
        const token = loginResponse.data.token;
        
        console.log('\n🌐 TESTANDO REQUISIÇÃO AUTENTICADA:');
        console.log('===================================');
        
        const dadosResponse = await axios.get(`${API_URL}/api/user/dados`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Requisição autenticada bem-sucedida');
        console.log(`   Receitas: ${dadosResponse.data.dados.receitas.length}`);
        console.log(`   Despesas: ${dadosResponse.data.dados.despesas.length}`);
        console.log(`   Orçamentos: ${dadosResponse.data.dados.orcamentos.length}`);
        
        // 3. Simular o que o Dashboard.jsx faz
        console.log('\n📊 SIMULANDO DASHBOARD:');
        console.log('=======================');
        
        const dados = dadosResponse.data.dados;
        const anoSelecionado = '2025'; // Valor padrão do Dashboard
        
        // Simular filtro por ano (igual ao Dashboard.jsx)
        const filtrarPorAno = (dados) => {
            if (!Array.isArray(dados)) return [];
            return dados.filter(item => {
                if (!item.data) return false;
                const [ano] = item.data.split('-');
                return ano === anoSelecionado;
            });
        };
        
        const receitasFiltradas = filtrarPorAno(dados.receitas);
        const despesasFiltradas = filtrarPorAno(dados.despesas);
        
        console.log(`📅 Filtro para ano ${anoSelecionado}:`);
        console.log(`   - Receitas filtradas: ${receitasFiltradas.length}`);
        console.log(`   - Despesas filtradas: ${despesasFiltradas.length}`);
        
        // 4. Simular cálculos do Dashboard
        const calculateTotal = (items) => {
            if (!Array.isArray(items)) return 0;
            return items.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
        };
        
        const totalReceitas = calculateTotal(receitasFiltradas);
        const totalDespesas = calculateTotal(despesasFiltradas);
        const saldoFinal = totalReceitas - totalDespesas;
        const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;
        
        console.log('\n💰 CÁLCULOS DO DASHBOARD:');
        console.log('========================');
        console.log(`   💸 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
        console.log(`   💳 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
        console.log(`   💵 Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
        console.log(`   📊 Percentual Sobra: ${percentualSobra.toFixed(1)}%`);
        
        // 5. Verificar categorias de despesas
        console.log('\n🏷️ ANÁLISE DE CATEGORIAS:');
        console.log('=========================');
        
        const despesasEssenciais = despesasFiltradas.filter(d => d.categoria === 'Despesas Fixas');
        const despesasLazer = despesasFiltradas.filter(d => d.categoria === 'Lazer');
        const despesasEducacao = despesasFiltradas.filter(d => d.categoria === 'Educação');
        
        console.log(`   - Despesas Fixas: ${despesasEssenciais.length} itens`);
        console.log(`   - Lazer: ${despesasLazer.length} itens`);
        console.log(`   - Educação: ${despesasEducacao.length} itens`);
        
        const totalEssenciais = calculateTotal(despesasEssenciais);
        const totalLazer = calculateTotal(despesasLazer);
        const totalEducacao = calculateTotal(despesasEducacao);
        
        console.log(`   - Total Despesas Fixas: R$ ${totalEssenciais.toFixed(2)}`);
        console.log(`   - Total Lazer: R$ ${totalLazer.toFixed(2)}`);
        console.log(`   - Total Educação: R$ ${totalEducacao.toFixed(2)}`);
        
        // 6. Verificar se há problemas
        console.log('\n🔍 VERIFICAÇÃO DE PROBLEMAS:');
        console.log('============================');
        
        let problemas = [];
        
        if (receitasFiltradas.length === 0) {
            problemas.push('❌ Nenhuma receita encontrada para o ano selecionado');
        }
        
        if (despesasFiltradas.length === 0) {
            problemas.push('❌ Nenhuma despesa encontrada para o ano selecionado');
        }
        
        if (totalReceitas === 0) {
            problemas.push('❌ Total de receitas é zero');
        }
        
        if (problemas.length === 0) {
            console.log('✅ Nenhum problema detectado nos dados!');
            console.log('✅ O dashboard DEVE estar exibindo os dados corretamente!');
        } else {
            console.log('Problemas encontrados:');
            problemas.forEach(problema => console.log(`   ${problema}`));
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('🔒 Token inválido ou expirado');
        }
    }
    
    console.log('\n✅ Debug completo finalizado!');
}

// Executar debug
debugSistemaCompleto();