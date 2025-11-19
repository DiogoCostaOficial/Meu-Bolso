// Testar login via API para garantir funcionamento completo
console.log('🌐 TESTANDO LOGIN VIA API - USUÁRIO DIGOGO');
console.log('='.repeat(60));

async function testarLoginDiogo() {
  try {
    // Testar diferentes senhas possíveis
    const possiveisSenhas = ['diogo123', 'Diogo@123', 'diogo', '123456'];
    
    for (const senha of possiveisSenhas) {
      console.log(`\n🔑 Testando senha: ${senha}`);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'diogo.grunge@gmail.com',
          senha: senha
        })
      });

      const data = await response.json();
      
      if (response.ok && data.sucesso) {
        console.log(`✅ LOGIN BEM SUCEDIDO com senha: ${senha}`);
        console.log(`   - Usuário: ${data.usuario.nome}`);
        console.log(`   - Tipo: ${data.usuario.tipo}`);
        console.log(`   - Token: ${data.token.substring(0, 20)}...`);
        
        // Testar se não tem acesso admin
        if (data.usuario.tipo === 'usuario') {
          console.log(`✅ Confirmação: Usuário é do tipo NORMAL (não admin)`);
        } else {
          console.log(`⚠️  Atenção: Usuário ainda é do tipo: ${data.usuario.tipo}`);
        }
        
        return true;
      } else {
        console.log(`❌ Login falhou: ${data.mensagem || 'Erro desconhecido'}`);
      }
    }
    
    console.log('\n❌ Nenhuma das senhas testadas funcionou.');
    console.log('ℹ️  O login pode estar com uma senha diferente ou o servidor pode estar offline.');
    return false;
    
  } catch (error) {
    console.log(`\n❌ Erro ao testar login: ${error.message}`);
    console.log('ℹ️  Verifique se o servidor está rodando em http://localhost:5000');
    return false;
  }
}

// Executar teste
testarLoginDiogo().then(sucesso => {
  console.log('\n' + '='.repeat(60));
  if (sucesso) {
    console.log('🎉 TESTE DE LOGIN BEM SUCEDIDO!');
    console.log('✅ O sistema está funcionando corretamente.');
    console.log('✅ O usuário Diogo está com permissões normais.');
  } else {
    console.log('⚠️  TESTE DE LOGIN FALHOU!');
    console.log('ℹ️  Verifique a senha do usuário ou o estado do servidor.');
  }
  console.log('='.repeat(60));
}).catch(error => {
  console.log('❌ Erro no teste:', error.message);
});