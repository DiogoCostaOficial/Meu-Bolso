import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testarLogin() {
    try {
        console.log('🧪 Testando login do usuário...');
        
        // Testar login
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        });
        
        console.log('✅ Login realizado com sucesso!');
        console.log('📋 Resposta completa:');
        console.log(JSON.stringify(loginResponse.data, null, 2));
        
        // Testar acesso aos dados
        const token = loginResponse.data.token;
        const dadosResponse = await axios.get(`${API_URL}/api/user/dados`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('\n✅ Dados acessados com sucesso!');
        console.log(`📊 Receitas: ${dadosResponse.data.dados.receitas.length}`);
        console.log(`📉 Despesas: ${dadosResponse.data.dados.despesas.length}`);
        console.log(`📋 Orçamentos: ${dadosResponse.data.dados.orcamentos.length}`);
        
        return { sucesso: true, token };
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
        return { sucesso: false, erro: error.message };
    }
}

// Executar teste
testarLogin().then(resultado => {
    if (resultado.sucesso) {
        console.log('\n🎉 Sistema de login funcionando perfeitamente!');
        console.log('✅ O usuário pode acessar o dashboard normalmente.');
    } else {
        console.log('\n❌ Problema detectado no sistema de login.');
    }
});