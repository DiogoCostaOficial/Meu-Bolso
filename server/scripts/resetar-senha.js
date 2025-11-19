// Script para resetar senha de usuário
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATABASE_PATH = path.join(__dirname, '..', 'data', 'database.json');

async function resetarSenha(email, novaSenha) {
  try {
    console.log(`🔐 Resetando senha para: ${email}`);
    
    // Ler banco de dados
    const database = JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
    
    // Encontrar usuário
    const usuario = database.usuarios.find(u => u.email === email);
    
    if (!usuario) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return false;
    }
    
    console.log(`✅ Usuário encontrado: ${usuario.nome}`);
    
    // Gerar novo hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);
    
    // Atualizar senha
    usuario.senha = senhaHash;
    usuario.ultimoAcesso = new Date().toISOString();
    
    // Salvar banco de dados
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(database, null, 2));
    
    console.log(`✅ Senha resetada com sucesso!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nova senha: ${novaSenha}`);
    console.log(`🕐 Data/Hora: ${new Date().toLocaleString()}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error.message);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const email = process.argv[2];
  const novaSenha = process.argv[3] || 'Teste@2025';
  
  if (!email) {
    console.log('📋 Uso: node resetar-senha.js <email> [nova_senha]');
    console.log('Exemplo: node resetar-senha.js diogo.grunge@gmail.com Teste@2025');
    process.exit(1);
  }
  
  resetarSenha(email, novaSenha).then(sucesso => {
    process.exit(sucesso ? 0 : 1);
  });
}

module.exports = { resetarSenha };