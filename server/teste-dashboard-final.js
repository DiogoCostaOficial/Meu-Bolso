const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testarDashboard() {
    console.log('🧪 Iniciando teste completo do dashboard...\n');
    
    try {
        // 1. Fazer login
        console.log('🔐 Fazendo login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso!');
        console.log(`📋 Token: ${token.substring(0, 50)}...\n`);
        
        // 2. Testar endpoint /user/dados
        console.log('📊 Testando endpoint /user/dados...');
        const dadosResponse = await axios.get(`${API_BASE}/user/dados`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`✅ Status: ${dadosResponse.status}`);
        const dados = dadosResponse.data.dados;
        
        // 3. Analisar dados
        console.log('\n📈 Análise dos dados:');
        console.log(`   Receitas: ${dados.receitas.length} registros`);
        console.log(`   Despesas: ${dados.despesas.length} registros`);
        
        // 4. Calcular totais
        const totalReceitas = dados.receitas.reduce((sum, rec) => sum + parseFloat(rec.valor), 0);
        const totalDespesas = dados.despesas.reduce((sum, desp) => sum + parseFloat(desp.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        
        console.log(`   Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
        console.log(`   Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
        console.log(`   Saldo: R$ ${saldo.toFixed(2)}`);
        
        // 5. Calcular mês atual (Novembro 2025)
        const mesAtual = '2025-11';
        const receitasMes = dados.receitas.filter(r => r.data.includes(mesAtual));
        const despesasMes = dados.despesas.filter(d => d.data.includes(mesAtual));
        
        const receitasMesTotal = receitasMes.reduce((sum, rec) => sum + parseFloat(rec.valor), 0);
        const despesasMesTotal = despesasMes.reduce((sum, desp) => sum + parseFloat(desp.valor), 0);
        const saldoMes = receitasMesTotal - despesasMesTotal;
        
        console.log('\n📅 Mês Atual (Novembro 2025):');
        console.log(`   Receitas do Mês: R$ ${receitasMesTotal.toFixed(2)}`);
        console.log(`   Despesas do Mês: R$ ${despesasMesTotal.toFixed(2)}`);
        console.log(`   Saldo do Mês: R$ ${saldoMes.toFixed(2)}`);
        
        // 6. Verificar se os dados são os esperados
        console.log('\n🔍 Verificação dos dados:');
        if (totalReceitas > 0 && totalDespesas > 0) {
            console.log('✅ Dados financeiros encontrados e válidos!');
            console.log('✅ O dashboard DEVE mostrar valores diferentes de R$ 0,00');
        } else {
            console.log('⚠️  Atenção: Dados podem estar incompletos');
        }
        
        // 7. Testar endpoint errado (com duplicação de /api)
        console.log('\n❌ Testando endpoint errado /api/user/dados...');
        try {
            await axios.get(`${API_BASE}/api/user/dados`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.log(`✅ Endpoint errado corretamente rejeitado (Status: ${error.response?.status})`);
            console.log(`✅ Isso confirma que o endpoint correto é: ${API_BASE}/user/dados`);
        }
        
        console.log('\n🎉 Teste concluído com sucesso!');
        console.log('\n📋 RESUMO:');
        console.log(`   - O backend está respondendo corretamente`);
        console.log(`   - Os dados do usuário estão sendo retornados`);
        console.log(`   - Total de receitas: R$ ${totalReceitas.toFixed(2)}`);
        console.log(`   - Total de despesas: R$ ${totalDespesas.toFixed(2)}`);
        console.log(`   - Saldo: R$ ${saldo.toFixed(2)}`);
        console.log(`   - Se o dashboard mostra R$ 0,00, o problema está no frontend!`);
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar o teste
testarDashboard();