// Testar alteração de senha do admin - versão corrigida
console.log('🔑 TESTANDO ALTERAÇÃO DE SENHA DO ADMIN (VERSÃO CORRIGIDA)');
console.log('='.repeat(60));

async function testarAlteracaoSenha() {
  try {
    // Dados do admin
    const senhaAtual = 'admin';
    const novaSenha = 'Admin@123';
    
    console.log(`\n📋 Dados do teste:`);
    console.log(`   Senha atual: ${senhaAtual}`);
    console.log(`   Nova senha: ${novaSenha}`);
    
    // Fazer login primeiro
    console.log('\n🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        senha: senhaAtual
      })
    });

    const loginData = await loginResponse.json();
    console.log('📄 Resposta completa do login:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log(`❌ Login falhou: ${loginData.mensagem}`);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    
    // Verificar estrutura da resposta
    if (loginData.dados && loginData.dados.token) {
      console.log(`   Token: ${loginData.dados.token.substring(0, 20)}...`);
      console.log(`   Usuário: ${loginData.dados.usuario.nome}`);
      console.log(`   Tipo: ${loginData.dados.usuario.tipo}`);
      console.log(`   Primeiro acesso: ${loginData.dados.usuario.primeiroAcesso}`);

      // Agora testar alteração de senha
      console.log('\n🔄 Alterando senha...');
      const alterarSenhaResponse = await fetch('http://localhost:3001/api/auth/alterar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.dados.token}`
        },
        body: JSON.stringify({
          senhaAtual: senhaAtual,
          novaSenha: novaSenha
        })
      });

      const alterarSenhaData = await alterarSenhaResponse.json();
      console.log('📄 Resposta da alteração de senha:', JSON.stringify(alterarSenhaData, null, 2));

      if (alterarSenhaResponse.ok) {
        console.log('✅ Senha alterada com sucesso!');
        console.log(`   Mensagem: ${alterarSenhaData.mensagem}`);
      } else {
        console.log(`❌ Erro ao alterar senha: ${alterarSenhaData.mensagem}`);
        console.log(`   Status: ${alterarSenhaResponse.status}`);
      }

      // Testar login com nova senha
      console.log('\n🔐 Testando login com nova senha...');
      const novoLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          senha: novaSenha
        })
      });

      const novoLoginData = await novoLoginResponse.json();
      if (novoLoginResponse.ok) {
        console.log('✅ Login com nova senha funcionou!');
        console.log(`   Primeiro acesso agora: ${novoLoginData.dados.usuario.primeiroAcesso}`);
      } else {
        console.log('❌ Login com nova senha falhou');
        console.log(`   Erro: ${novoLoginData.mensagem}`);
      }
    } else {
      console.log('❌ Estrutura da resposta inesperada:');
      console.log('📄 Resposta:', JSON.stringify(loginData, null, 2));
    }

  } catch (error) {
    console.log(`❌ Erro durante o teste: ${error.message}`);
    console.log('ℹ️  Verifique se o servidor está rodando em http://localhost:3001');
  }
}

// Executar teste
testarAlteracaoSenha().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TESTE CONCLUÍDO');
  console.log('='.repeat(60));
});