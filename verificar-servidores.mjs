// Verificar status dos servidores backend e frontend
import http from 'http';
import { exec } from 'child_process';

console.log('🔍 VERIFICANDO STATUS DOS SERVIDORES');
console.log('='.repeat(60));
console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
console.log('='.repeat(60));

// Função para verificar porta
function verificarPorta(porta, nome) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: porta,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      console.log(`\n✅ ${nome} está rodando!`);
      console.log(`   📊 Porta: ${porta}`);
      console.log(`   📄 Status: ${res.statusCode}`);
      console.log(`   🔗 URL: http://localhost:${porta}`);
      
      if (res.headers['content-type']) {
        console.log(`   📋 Content-Type: ${res.headers['content-type']}`);
      }
      
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`\n❌ ${nome} NÃO está rodando na porta ${porta}`);
      console.log(`   📄 Erro: ${err.message}`);
      console.log(`   ℹ️  Verifique se o servidor foi iniciado`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`\n⏰ ${nome} - Tempo limite excedido na porta ${porta}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Verificar ambos os servidores
async function verificarServidores() {
  console.log('\n🌐 VERIFICANDO SERVIDORES:');
  
  // Backend na porta 5000
  await verificarPorta(5000, 'Backend Server');
  
  // Frontend na porta 3000  
  await verificarPorta(3000, 'Frontend Server');
  
  // Verificar também a API do backend
  setTimeout(() => {
    console.log('\n🔌 VERIFICANDO ENDPOINTS DA API:');
    verificarAPI();
  }, 1000);
}

function verificarAPI() {
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/health',
    method: 'GET',
    timeout: 2000
  }, (res) => {
    console.log(`✅ API de autenticação está acessível`);
    console.log(`   📄 Status: ${res.statusCode}`);
    console.log(`   🔗 Endpoint: http://localhost:5000/api/auth/health`);
  });

  req.on('error', () => {
    console.log(`❌ API de autenticação NÃO está acessível`);
    console.log(`   ℹ️  Verifique se o backend está rodando corretamente`);
  });

  req.end();
}

verificarServidores();

// Resumo final
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMO DA VERIFICAÇÃO:');
  console.log('='.repeat(60));
  console.log('✅ Para iniciar os servidores, use:');
  console.log('   🔧 Backend: npm run server (ou npm run dev na pasta server)');
  console.log('   🎨 Frontend: npm run dev (na pasta raiz)');
  console.log('');
  console.log('📄 Logs e testes disponíveis em: server/scripts/');
  console.log('='.repeat(60));
}, 3000);