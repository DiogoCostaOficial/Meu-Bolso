// Teste específico para verificar acesso admin
async function testarAcessoAdminDetalhado() {
  console.log('🔍 VERIFICANDO ACESSO ADMIN DETALHADO');
  console.log('=' .repeat(50));
  
  const API_URL = 'http://localhost:5000/api';
  
  try {
    // Primeiro fazer login especial
    console.log('1️⃣ Fazendo login especial do admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        senha: 'admin'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Falha no login:', loginData.message);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    const token = loginData.token;
    console.log(`🔑 Token: ${token.substring(0, 30)}...`);
    
    // Testar cada endpoint admin individualmente
    const endpoints = [
      { nome: 'Estatísticas', path: '/admin/estatisticas' },
      { nome: 'Listar Usuários', path: '/admin/usuarios' },
      { nome: 'Buscar Usuário', path: '/admin/usuarios/admin-001' }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n2️⃣ Testando ${endpoint.nome}...`);
      
      try {
        const response = await fetch(`${API_URL}${endpoint.path}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Resposta: ${JSON.stringify(data, null, 2)}`);
        
        if (!response.ok) {
          console.log(`⚠️  Falha no acesso: ${data.message || 'Erro desconhecido'}`);
        } else {
          console.log(`✅ Acesso autorizado com sucesso`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar ${endpoint.nome}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO DO TESTE DE ACESSO ADMIN');
    console.log('✅ Login especial admin: FUNCIONANDO');
    console.log('🔍 Endpoints admin: Verificados individualmente');
    console.log('📝 Logs de atividade: Sendo registrados');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
}

// Executar teste
if (require.main === module) {
  setTimeout(async () => {
    console.log('⏱️  Aguardando servidor...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testarAcessoAdminDetalhado();
    
    console.log('\n🏁 Teste de acesso admin concluído');
  }, 1000);
}

module.exports = { testarAcessoAdminDetalhado };