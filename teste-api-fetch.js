// Teste simples da API com fetch
console.log('🧪 Testando API com fetch...\n');

// Função para testar a API
async function testarAPI() {
  try {
    // Testar se a API está rodando
    console.log('1. 🌐 Testando se a API está respondendo...');
    const healthResponse = await fetch('http://localhost:3001/');
    const healthData = await healthResponse.json();
    console.log('✅ API está respondendo:', healthData.message);
    
    // Testar login
    console.log('\n2. 🔐 Testando login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'diogo.grunge@gmail.com',
        senha: '123456'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login falhou:', loginResponse.status, loginResponse.statusText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', loginData.token?.substring(0, 50) + '...');
    
    // Testar busca de dados
    console.log('\n3. 📊 Testando busca de dados...');
    const dadosResponse = await fetch('http://localhost:3001/api/user/dados', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!dadosResponse.ok) {
      console.log('❌ Busca de dados falhou:', dadosResponse.status, dadosResponse.statusText);
      return;
    }
    
    const dadosData = await dadosResponse.json();
    console.log('✅ Dados obtidos com sucesso!');
    console.log('Resumo:');
    console.log('- Receitas:', dadosData.dados.receitas?.length || 0);
    console.log('- Despesas:', dadosData.dados.despesas?.length || 0);
    console.log('- Categorias:', dadosData.dados.categorias?.length || 0);
    console.log('- Orçamentos:', dadosData.dados.orcamentos?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarAPI();