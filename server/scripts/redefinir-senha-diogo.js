const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '../data/database.json');

// Senha temporária
const novaSenha = 'diogo123';

console.log('🔄 Iniciando redefinição de senha...');

try {
  // Ler o banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Encontrar o usuário
  const usuarioIndex = dbData.usuarios.findIndex(user => user.email === 'diogo.grunge@gmail.com');
  
  if (usuarioIndex === -1) {
    console.log('❌ Usuário não encontrado!');
    process.exit(1);
  }
  
  // Gerar hash da nova senha
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(novaSenha, saltRounds);
  
  // Atualizar a senha
  dbData.usuarios[usuarioIndex].senha = hashedPassword;
  
  // Salvar o banco de dados atualizado
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  
  console.log('✅ Senha redefinida com sucesso!');
  console.log(`📧 Email do usuário: diogo.grunge@gmail.com`);
  console.log(`🔑 Nova senha: ${novaSenha}`);
  console.log('');
  console.log('⚠️  O usuário deve alterar esta senha temporária no próximo login.');
  
} catch (error) {
  console.error('❌ Erro ao redefinir senha:', error.message);
  process.exit(1);
}