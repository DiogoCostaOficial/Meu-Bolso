// Teste completo de login de todos os usuários
const API_URL = 'http://localhost:3001/api/auth/login';

// Dados de teste para todos os usuários
const usuariosTeste = [
  {
    nome: 'Admin (especial)',
    login: { username: 'admin', senha: 'admin' },
    tipo: 'especial'
  },
  {
    nome: 'Teste',
    login: { email: 'teste@teste.com', senha: '123456' },
    tipo: 'normal'
  },
  {
    nome: 'Diogo',
    login: { email: 'diogo.grunge@gmail.com', senha: '12345678' },
    tipo: 'normal'
  },
  {
    nome: 'Diogo Costa da Silva',
    login: { email: 'diogo-costa@outlook.com', senha: '12345678' },
    tipo: 'normal'
  }
];

async function testarTodosLogins() {
  console.log('🧪 Testando login de todos os usuários...\n');
  
  let sucessos = 0;
  let falhas = 0;
  
  for (const usuario of usuariosTeste) {
    console.log(`👤 Testando: ${usuario.nome}`);
    console.log(`📧 Tipo: ${usuario.tipo}`);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario.login)
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        console.log(`❌ RESPOSTA NÃO É JSON: ${text}`);
        console.log(`📢 Status: ${response.status} ${response.statusText}`);
        falhas++;
        continue;
      }
      
      if (response.ok && data.success) {
        console.log(`✅ LOGIN BEM-SUCEDIDO`);
        console.log(`🎫 Token: ${data.token.substring(0, 20)}...`);
        console.log(`👤 Usuário: ${data.user.nome} (${data.user.email})`);
        console.log(`🔑 Tipo: ${data.user.tipo}`);
        sucessos++;
      } else {
        console.log(`❌ LOGIN FALHOU`);
        console.log(`📢 Erro: ${data.message || data.mensagem || 'Erro desconhecido'}`);
        falhas++;
      }
    } catch (error) {
      console.log(`❌ ERRO NA REQUISIÇÃO`);
      console.log(`📢 Erro: ${error.message}`);
      console.log(`📍 Stack: ${error.stack}`);
      falhas++;
    }
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`📈 Taxa de Sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%`);
  
  if (falhas === 0) {
    console.log('\n🎉 TODOS OS USUÁRIOS CONSEGUEM FAZER LOGIN!');
    console.log('✅ Sistema 100% restaurado!');
  } else {
    console.log(`\n⚠️  ${falhas} usuário(s) ainda com problemas de login`);
  }
}

// Aguardar um momento para o servidor iniciar
console.log('⏳ Aguardando servidor...');
setTimeout(testarTodosLogins, 2000);