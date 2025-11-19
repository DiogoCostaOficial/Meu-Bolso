// Teste simples de conectividade e login
const API_URL = 'http://localhost:3001/api/auth/login';

async function testarConexaoSimples() {
  console.log('🔍 Testando conexão com o servidor...\n');
  
  try {
    // Testar se o servidor está respondendo
    const healthResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'GET'
    });
    console.log(`📊 Status do servidor: ${healthResponse.status}`);
    
    // Testar login do admin
    console.log('\n👤 Testando login do admin...');
    const adminResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', senha: 'admin' })
    });
    
    console.log(`📊 Status da resposta: ${adminResponse.status}`);
    console.log(`📋 Headers: ${JSON.stringify(Object.fromEntries(adminResponse.headers))}`);
    
    const text = await adminResponse.text();
    console.log(`📄 Corpo da resposta: ${text}`);
    
    try {
      const data = JSON.parse(text);
      if (adminResponse.ok && data.success) {
        console.log('✅ LOGIN DO ADMIN BEM-SUCEDIDO!');
        console.log(`🎫 Token: ${data.token.substring(0, 20)}...`);
        console.log(`👤 Usuário: ${data.user.nome} (${data.user.email})`);
        console.log(`🔑 Tipo: ${data.user.tipo}`);
        console.log(`🔐 Login Especial: ${data.user.loginEspecial || false}`);
      } else {
        console.log(`❌ LOGIN FALHOU: ${data.message || data.mensagem || 'Erro desconhecido'}`);
      }
    } catch (jsonError) {
      console.log(`❌ RESPOSTA NÃO É JSON: ${text}`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO DE CONEXÃO: ${error.message}`);
    console.log(`📍 Stack: ${error.stack}`);
  }
}

testarConexaoSimples();