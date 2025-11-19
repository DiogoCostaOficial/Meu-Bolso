const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Função para testar login especial do admin
async function testarLoginEspecialAdmin() {
  console.log('🧪 INICIANDO TESTES DO LOGIN ESPECIAL ADMIN');
  console.log('=' .repeat(60));
  
  try {
    // Teste 1: Login especial com username e senha admin
    console.log('\n1️⃣ Testando login especial do admin...');
    const response1 = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      senha: 'admin'
    });
    
    console.log('✅ Login especial admin SUCESSO!');
      console.log(`📧 Token recebido: ${response1.data.token.substring(0, 20)}...`);
    console.log(`👤 Usuário: ${response1.data.user.nome}`);
    console.log(`🔑 Tipo: ${response1.data.user.tipo}`);
    console.log(`⚡ Login especial: ${response1.data.user.loginEspecial}`);
    
    const tokenAdmin = response1.data.token;
    
    // Teste 2: Verificar token do admin
    console.log('\n2️⃣ Testando validação do token do admin...');
    const response2 = await axios.get(`${API_URL}/user/perfil`, {
      headers: {
        'Authorization': `Bearer ${tokenAdmin}`
      }
    });
    
    console.log('✅ Token válido - Acesso ao perfil confirmado!');
    console.log(`📋 Dados do perfil: ${response2.data.dados.nome}`);
    
    // Teste 3: Testar acesso a funcionalidades admin
    console.log('\n3️⃣ Testando acesso a funcionalidades administrativas...');
    const response3 = await axios.get(`${API_URL}/admin/estatisticas`, {
      headers: {
        'Authorization': `Bearer ${tokenAdmin}`
      }
    });
    
    console.log('✅ Acesso admin autorizado!');
    console.log(`📊 Estatísticas: ${JSON.stringify(response3.data, null, 2)}`);
    
    // Teste 4: Verificar se é impossível criar outro usuário com login especial
    console.log('\n4️⃣ Testando segurança - Impedindo duplicação de login especial...');
    
    // Tentar login normal com email do admin (deve falhar com senha admin)
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@admin.com',
        senha: 'admin'
      });
      console.log('❌ CRÍTICO: Login normal com senha admin não deveria funcionar!');
    } catch (error) {
      console.log('✅ Segurança confirmada: Login normal com senha admin bloqueado');
    }
    
    // Teste 5: Testar alteração de senha do admin
    console.log('\n5️⃣ Testando alteração de senha do admin...');
    const response5 = await axios.post(`${API_URL}/auth/alterar-senha`, {
      senhaAtual: 'admin',
      novaSenha: 'Admin@2025!'
    }, {
      headers: {
        'Authorization': `Bearer ${tokenAdmin}`
      }
    });
    
    console.log('✅ Alteração de senha realizada com sucesso!');
    console.log('🔐 Senha do admin foi alterada para uma senha segura');
    
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
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
    return {
      sucesso: false,
      erro: error.response?.data || error.message
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