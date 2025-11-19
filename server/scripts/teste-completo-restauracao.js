// Teste completo de restauração do sistema
async function testeCompletoRestauracao() {
  console.log('🚀 TESTE COMPLETO DE RESTAURAÇÃO DO SISTEMA');
  console.log('=' .repeat(60));
  
  const API_URL = 'http://localhost:5000/api';
  const resultados = {
    loginEspecialAdmin: false,
    loginNormalUsuarios: [],
    acessoFuncionalidades: false,
    seguranca: false,
    logs: false
  };
  
  try {
    // 1. Testar Login Especial do Admin
    console.log('\n1️⃣ TESTANDO LOGIN ESPECIAL DO ADMIN');
    console.log('-'.repeat(40));
    
    const loginAdminResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        senha: 'admin'
      })
    });
    
    const loginAdminData = await loginAdminResponse.json();
    
    if (loginAdminResponse.ok && loginAdminData.success) {
      console.log('✅ Login especial admin: FUNCIONANDO');
      console.log(`👤 Usuário: ${loginAdminData.user.nome}`);
      console.log(`🔑 Tipo: ${loginAdminData.user.tipo}`);
      console.log(`⚡ Login especial: ${loginAdminData.user.loginEspecial}`);
      resultados.loginEspecialAdmin = true;
      
      // Testar segurança - login normal com senha admin não deve funcionar
      console.log('\n🔒 Testando segurança - Login normal com senha admin...');
      const loginNormalAdminResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@admin.com',
          senha: 'admin'
        })
      });
      
      const loginNormalAdminData = await loginNormalAdminResponse.json();
      
      if (!loginNormalAdminResponse.ok) {
        console.log('✅ Segurança: Login normal com senha admin BLOQUEADO');
        console.log(`🛡️  Motivo: ${loginNormalAdminData.message}`);
        resultados.seguranca = true;
      } else {
        console.log('❌ CRÍTICO: Segurança comprometida!');
      }
      
      // 2. Testar Login Normal de Usuários
      console.log('\n2️⃣ TESTANDO LOGIN NORMAL DE USUÁRIOS');
      console.log('-'.repeat(40));
      
      const usuariosTeste = [
        { email: 'teste@teste.com', senha: '123456', nome: 'Teste' },
        { email: 'diogo.grunge@gmail.com', senha: '12345678', nome: 'Diogo' },
        { email: 'diogo-costa@outlook.com', senha: '12345678', nome: 'Diogo Costa' }
      ];
      
      for (const usuario of usuariosTeste) {
        console.log(`\n👤 Testando login de: ${usuario.nome} (${usuario.email})`);
        
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: usuario.email,
            senha: usuario.senha
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.success) {
          console.log(`✅ Login de ${usuario.nome}: SUCESSO`);
          resultados.loginNormalUsuarios.push({ usuario: usuario.nome, sucesso: true });
        } else {
          console.log(`❌ Login de ${usuario.nome}: FALHA - ${loginData.message}`);
          resultados.loginNormalUsuarios.push({ usuario: usuario.nome, sucesso: false, erro: loginData.message });
        }
      }
      
      // 3. Testar Funcionalidades Principais
      console.log('\n3️⃣ TESTANDO FUNCIONALIDADES PRINCIPAIS');
      console.log('-'.repeat(40));
      
      const tokenAdmin = loginAdminData.token;
      
      // Testar dashboard
      console.log('\n📊 Testando acesso ao dashboard...');
      const dashboardResponse = await fetch(`${API_URL}/user/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (dashboardResponse.ok) {
        console.log('✅ Acesso ao dashboard: AUTORIZADO');
        resultados.acessoFuncionalidades = true;
      } else {
        console.log('❌ Acesso ao dashboard: NEGADO');
      }
      
      // Testar estatísticas admin
      console.log('\n📈 Testando acesso às estatísticas admin...');
      const statsResponse = await fetch(`${API_URL}/admin/estatisticas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        console.log('✅ Acesso às estatísticas: AUTORIZADO');
      } else {
        console.log('❌ Acesso às estatísticas: NEGADO');
      }
      
      // 4. Verificar Logs
      console.log('\n4️⃣ VERIFICANDO SISTEMA DE LOGS');
      console.log('-'.repeat(40));
      
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '..', 'data', 'admin-logs.json');
      
      if (fs.existsSync(logPath)) {
        const logsData = fs.readFileSync(logPath, 'utf8');
        const logs = JSON.parse(logsData);
        
        console.log(`📋 Total de logs registrados: ${logs.length}`);
        console.log('📝 Últimas atividades:');
        
        logs.slice(-3).forEach((log, index) => {
          console.log(`${index + 1}. ${log.tipo} - ${new Date(log.timestamp).toLocaleString('pt-BR')} - IP: ${log.ip}`);
        });
        
        resultados.logs = true;
      } else {
        console.log('ℹ️  Nenhum log encontrado');
      }
      
    } else {
      console.log('❌ Login especial admin: FALHA');
      console.log(`📋 Motivo: ${loginAdminData.message}`);
    }
    
    // RELATÓRIO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DE RESTAURAÇÃO');
    console.log('='.repeat(60));
    
    console.log(`\n🔑 Login Especial Admin: ${resultados.loginEspecialAdmin ? '✅ OK' : '❌ FALHA'}`);
    console.log(`🛡️  Segurança Implementada: ${resultados.seguranca ? '✅ OK' : '❌ FALHA'}`);
    console.log(`📊 Acesso às Funcionalidades: ${resultados.acessoFuncionalidades ? '✅ OK' : '❌ FALHA'}`);
    console.log(`📝 Sistema de Logs: ${resultados.logs ? '✅ OK' : '❌ FALHA'}`);
    
    console.log('\n👥 Login de Usuários Normais:');
    resultados.loginNormalUsuarios.forEach(resultado => {
      console.log(`   ${resultado.usuario}: ${resultado.sucesso ? '✅ OK' : '❌ FALHA'} ${!resultado.sucesso && resultado.erro ? `- ${resultado.erro}` : ''}`);
    });
    
    const totalSucessos = [
      resultados.loginEspecialAdmin,
      resultados.seguranca,
      resultados.acessoFuncionalidades,
      resultados.logs,
      ...resultados.loginNormalUsuarios.map(r => r.sucesso)
    ].filter(Boolean).length;
    
    const totalTestes = 4 + resultados.loginNormalUsuarios.length;
    
    console.log(`\n📈 Taxa de Sucesso: ${totalSucessos}/${totalTestes} (${Math.round((totalSucessos/totalTestes) * 100)}%)`);
    
    if (totalSucessos === totalTestes) {
      console.log('\n🎉 SISTEMA TOTALMENTE RESTAURADO COM SUCESSO!');
      console.log('✅ Todas as funcionalidades estão operacionais');
      console.log('🔒 Segurança implementada corretamente');
      console.log('👨‍💻 Sistema pronto para uso');
    } else {
      console.log('\n⚠️  SISTEMA PARCIALMENTE RESTAURADO');
      console.log('🔧 Algumas funcionalidades precisam de atenção');
    }
    
    return {
      sucesso: totalSucessos === totalTestes,
      taxaSucesso: Math.round((totalSucessos/totalTestes) * 100),
      detalhes: resultados
    };
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Executar teste completo
if (require.main === module) {
  setTimeout(async () => {
    console.log('⏱️  Aguardando servidor iniciar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const resultado = await testeCompletoRestauracao();
    
    console.log('\n🏁 Teste de restauração concluído');
    process.exit(resultado.sucesso ? 0 : 1);
  }, 1000);
}

module.exports = { testeCompletoRestauracao };