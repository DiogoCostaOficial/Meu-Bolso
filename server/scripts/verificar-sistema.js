// Testar conexão com servidor e verificar estado
const http = require('http');

console.log('🔍 VERIFICANDO ESTADO DO SERVIDOR E SISTEMA');
console.log('='.repeat(60));

// Testar se servidor está rodando
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/health',
  method: 'GET',
  timeout: 3000
}, (res) => {
  console.log(`✅ Servidor está rodando! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`📊 Resposta do servidor:`, response);
    } catch (e) {
      console.log(`📄 Resposta do servidor:`, data);
    }
  });
});

req.on('error', (err) => {
  console.log(`❌ Servidor não está acessível: ${err.message}`);
  console.log('ℹ️  Verifique se o servidor está rodando em http://localhost:5000');
});

req.on('timeout', () => {
  console.log('⏰ Tempo limite excedido ao tentar conectar ao servidor');
  req.destroy();
});

req.end();

// Verificar banco de dados localmente
setTimeout(() => {
  console.log('\n📋 VERIFICANDO BANCO DE DADOS LOCAL:');
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, '../data/database.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    console.log('Usuários no sistema:');
    db.usuarios.forEach(usuario => {
      const temMigracao = usuario.migracaoAdmin ? ' (migração admin)' : '';
      console.log(`- ${usuario.nome} (${usuario.email}): ${usuario.tipo}${temMigracao}`);
    });
    
    // Verificar especificamente o Diogo
    const diogo = db.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');
    if (diogo) {
      console.log(`\n✅ Usuário Diogo está configurado como: ${diogo.tipo}`);
      if (diogo.tipo === 'usuario' && !diogo.migracaoAdmin) {
        console.log('✅ RESTAURAÇÃO BEM SUCEDIDA! O usuário voltou ao estado original.');
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro ao ler banco de dados: ${error.message}`);
  }
}, 1000);