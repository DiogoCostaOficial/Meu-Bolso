// Script para testar login rapidamente
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_PATH = path.join(__dirname, '..', 'data', 'database.json');

function listarUsuariosESenhas() {
  try {
    console.log('📋 Listando usuários e senhas para teste...\n');
    
    const database = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
    const usuarios = database.usuarios.filter(u => u.ativo !== false);
    
    console.log('✅ Usuários disponíveis para teste:');
    console.log('='.repeat(60));
    
    usuarios.forEach(usuario => {
      console.log(`
👤 ${usuario.nome} (${usuario.tipo || 'usuario'})
📧 Email: ${usuario.email}
🔑 Tipo: ${usuario.tipo || 'usuario'}
✅ Ativo: ${usuario.ativo}
🕐 Criado em: ${new Date(usuario.dataCriacao).toLocaleString()}
🕐 Último acesso: ${usuario.ultimoAcesso ? new Date(usuario.ultimoAcesso).toLocaleString() : 'Nunca'}
${usuario.primeiroAcesso ? '⚠️  Primeiro acesso: SIM' : '✅ Primeiro acesso: NÃO'}
`);
      console.log('-'.repeat(40));
    });
    
    console.log('\n💡 Dicas de senhas para teste:');
    console.log('• Teste@2025 (senha padrão para novos usuários)');
    console.log('• Admin@123 (senha antiga do admin)');
    console.log('• 12345678 (senha simples)');
    console.log('• admin (senha super simples)');
    
    console.log('\n🌐 URLs de teste:');
    console.log('• Frontend: http://localhost:5174');
    console.log('• Backend: http://localhost:5000');
    console.log('• API Login: POST http://localhost:5000/api/auth/login');
    
    console.log('\n🚀 Comandos de teste rápido:');
    console.log('PowerShell:');
    console.log('$headers = @{"Content-Type"="application/json"};');
    console.log('$body = \'{"email":"seu-email@exemplo.com","senha":"Teste@2025"}\';');
    console.log('Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers $headers -Body $body');
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  listarUsuariosESenhas();
}

module.exports = { listarUsuariosESenhas };