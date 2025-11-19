// Teste com usuário que realmente funciona
console.log('🧪 Testando com usuário funcional teste@teste.com...\n');

async function testarUsuarioFuncional() {
  try {
    // Testar login
    console.log('🔐 Testando login com teste@teste.com...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@teste.com',
        senha: '123456'
      })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login falhou:', loginResponse.status, errorData.message);
      console.log('Resposta completa:', errorData);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('Token:', loginData.token?.substring(0, 50) + '...');
    
    // Testar busca de dados
    console.log('\n📊 Testando busca de dados...');
    const dadosResponse = await fetch('http://localhost:3001/api/user/dados', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!dadosResponse.ok) {
      const errorData = await dadosResponse.json();
      console.log('❌ Busca de dados falhou:', dadosResponse.status, errorData.message);
      return;
    }
    
    const dadosData = await dadosResponse.json();
    console.log('✅ Dados obtidos com sucesso!');
    console.log('Resumo:');
    console.log('- Receitas:', dadosData.dados.receitas?.length || 0);
    console.log('- Despesas:', dadosData.dados.despesas?.length || 0);
    console.log('- Categorias:', dadosData.dados.categorias?.length || 0);
    console.log('- Orçamentos:', dadosData.dados.orcamentos?.length || 0);
    
    // Mostrar dados completos
    console.log('\n📋 Dados completos:');
    console.log(JSON.stringify(dadosData.dados, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarUsuarioFuncional();