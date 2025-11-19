import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function debugDashboardData() {
    try {
        console.log('🧪 Debugando estrutura de dados do dashboard...');
        
        // Fazer login
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login realizado com sucesso');
        console.log('📋 Estrutura do login:', JSON.stringify(loginResponse.data, null, 2));
        
        // Buscar dados do usuário
        const dadosResponse = await axios.get(`${API_URL}/api/user/dados`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('\n✅ Dados do usuário obtidos');
        console.log('📊 Estrutura dos dados:', JSON.stringify(dadosResponse.data, null, 2));
        
        // Analisar a estrutura
        const dados = dadosResponse.data;
        console.log('\n🔍 Análise da estrutura:');
        console.log('   - dados.sucesso:', dados.sucesso);
        console.log('   - dados.dados:', !!dados.dados);
        console.log('   - dados.dados.receitas:', dados.dados?.receitas?.length || 'não existe');
        console.log('   - dados.dados.despesas:', dados.dados?.despesas?.length || 'não existe');
        console.log('   - dados.dados.orcamentos:', dados.dados?.orcamentos?.length || 'não existe');
        
        // Verificar se os dados estão no formato esperado
        if (dados.sucesso && dados.dados) {
            console.log('\n✅ Dados estão no formato esperado!');
            console.log('   Receitas:', dados.dados.receitas?.length || 0);
            console.log('   Despesas:', dados.dados.despesas?.length || 0);
            console.log('   Orçamentos:', dados.dados.orcamentos?.length || 0);
        } else {
            console.log('\n❌ Dados NÃO estão no formato esperado');
            console.log('   Estrutura encontrada:', Object.keys(dados));
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error.response?.data || error.message);
    }
}

debugDashboardData();