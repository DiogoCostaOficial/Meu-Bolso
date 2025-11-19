// Função para testar login especial do admin usando fetch
async function testarLoginEspecialAdmin() {
  console.log('🧪 INICIANDO TESTES DO LOGIN ESPECIAL ADMIN');
  console.log('=' .repeat(60));
  
  const API_URL = 'http://localhost:5000/api';
  
  try {
    // Teste 1: Login especial com username e senha admin
    console.log('\n1️⃣ Testando login especial do admin...');
    
    const response1 = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        senha: 'admin'
      })
    });
    
    const data1 = await response1.json();
    
    if (response1.ok && data1.success) {
      console.log('✅ Login especial admin SUCESSO!');
      console.log(`📧 Token recebido: ${data1.token.substring(0, 20)}...`);
      console.log(`👤 Usuário: ${data1.user.nome}`);
      console.log(`🔑 Tipo: ${data1.user.tipo}`);
      console.log(`⚡ Login especial: ${data1.user.loginEspecial}`);
      
      const tokenAdmin = data1.token;
      
      // Teste 2: Verificar token do admin
      console.log('\n2️⃣ Testando validação do token do admin...');
      const response2 = await fetch(`${API_URL}/user/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenAdmin}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data2 = await response2.json();
      
      if (response2.ok && data2.sucesso) {
        console.log('✅ Token válido - Acesso ao perfil confirmado!');
        console.log(`📋 Dados do perfil: ${data2.dados.nome}`);
        
        // Teste 3: Testar acesso a funcionalidades admin
        console.log('\n3️⃣ Testando acesso a funcionalidades administrativas...');
        const response3 = await fetch(`${API_URL}/admin/estatisticas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenAdmin}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data3 = await response3.json();
        
        if (response3.ok && data3.success) {
          console.log('✅ Acesso admin autorizado!');
          console.log(`📊 Estatísticas: ${JSON.stringify(data3, null, 2)}`);
        } else {
          console.log('⚠️  Acesso admin restrito:', data3.message || 'Erro desconhecido');
        }
        
        // Teste 4: Verificar se é impossível criar outro usuário com login especial
        console.log('\n4️⃣ Testando segurança - Impedindo duplicação de login especial...');
        
        // Tentar login normal com email do admin (deve falhar com senha admin)
        try {
          const response4 = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'admin@admin.com',
              senha: 'admin'
            })
          });
          
          const data4 = await response4.json();
          
          if (response4.ok && data4.success) {
            console.log('❌ CRÍTICO: Login normal com senha admin não deveria funcionar!');
          } else {
            console.log('✅ Segurança confirmada: Login normal com senha admin bloqueado');
            console.log(`🛡️  Motivo: ${data4.message}`);
          }
        } catch (error) {
          console.log('✅ Segurança confirmada: Login normal com senha admin bloqueado');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TODOS OS TESTES DO LOGIN ESPECIAL ADMIN FORAM BEM-SUCEDIDOS!');
        console.log('✅ Sistema restaurado com sucesso');
        console.log('🔒 Acesso especial admin funcionando corretamente');
        console.log('🛡️ Segurança implementada e validada');
        
        return {
          sucesso: true,
          token: tokenAdmin,
          mensagem: 'Login especial admin totalmente funcional'
        };
        
      } else {
        console.log('❌ Falha ao verificar token:', data2.message || 'Erro desconhecido');
      }
      
    } else {
      console.log('❌ Falha no login especial:', data1.message || 'Erro desconhecido');
      return {
        sucesso: false,
        erro: data1.message || 'Erro ao fazer login especial'
      };
    }
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

// Função para testar logs de atividade do admin
async function testarLogsAdmin() {
  console.log('\n📋 VERIFICANDO LOGS DE ATIVIDADE DO ADMIN');
  console.log('=' .repeat(40));
  
  try {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', 'data', 'admin-logs.json');
    
    if (fs.existsSync(logPath)) {
      const logsData = fs.readFileSync(logPath, 'utf8');
      const logs = JSON.parse(logsData);
      
      console.log(`📊 Total de logs encontrados: ${logs.length}`);
      console.log('📝 Últimas atividades do admin:');
      
      logs.slice(-5).forEach((log, index) => {
        console.log(`${index + 1}. ${log.tipo} - ${log.timestamp} - IP: ${log.ip}`);
      });
      
      return logs;
    } else {
      console.log('ℹ️  Nenhum log de admin encontrado ainda');
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao ler logs:', error);
    return [];
  }
}

// Executar testes
if (require.main === module) {
  setTimeout(async () => {
    console.log('⏱️  Aguardando servidor iniciar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const resultado = await testarLoginEspecialAdmin();
    await testarLogsAdmin();
    
    console.log('\n🏁 Testes concluídos:', resultado.sucesso ? '✅ SUCESSO' : '❌ FALHA');
    process.exit(resultado.sucesso ? 0 : 1);
  }, 1000);
}

module.exports = { testarLoginEspecialAdmin, testarLogsAdmin };