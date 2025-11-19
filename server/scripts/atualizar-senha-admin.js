const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Função para atualizar senha do admin
async function atualizarSenhaAdmin() {
  console.log('🔄 Atualizando senha do administrador...');
  
  const databasePath = path.join(__dirname, '..', 'data', 'database.json');
  
  try {
    // Carregar banco de dados
    const rawData = fs.readFileSync(databasePath, 'utf8');
    const database = JSON.parse(rawData);
    
    // Encontrar o admin
    const admin = database.usuarios.find(u => u.email === 'admin@admin.com');
    
    if (!admin) {
      console.log('❌ Administrador não encontrado no banco de dados');
      return false;
    }
    
    console.log(`✅ Administrador encontrado: ${admin.nome} (${admin.email})`);
    
    // Criar hash da senha "admin"
    const novaSenhaHash = await bcrypt.hash('admin', 10);
    
    // Atualizar senha e marcar como primeiro acesso
    admin.senha = novaSenhaHash;
    admin.primeiroAcesso = true; // Força mudança de senha no primeiro login
    
    console.log('🔐 Senha atualizada para: admin');
    console.log('⚠️  Primeiro acesso ativado - senha deverá ser alterada');
    
    // Salvar alterações
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
    
    console.log('✅ Senha do administrador atualizada com sucesso!');
    console.log('📋 Detalhes:');
    console.log(`   - Usuário: admin (login especial)`);
    console.log(`   - Senha: admin`);
    console.log(`   - Primeiro acesso: Sim (obrigatório mudar senha)`);
    console.log(`   - Hash: ${novaSenhaHash.substring(0, 20)}...`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senha do admin:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarSenhaAdmin();
}

module.exports = { atualizarSenhaAdmin };