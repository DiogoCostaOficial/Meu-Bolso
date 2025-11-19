const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../data/database.json');

async function resetarSenhasUsuarios() {
  console.log('🔄 Resetando senhas dos usuários para teste...\n');
  
  try {
    // Ler o banco de dados
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Senhas novas para os usuários
    const novasSenhas = {
      'diogo.grunge@gmail.com': '12345678',
      'diogo-costa@outlook.com': '12345678'
    };
    
    let alteracoes = 0;
    
    // Atualizar senhas dos usuários
    for (const usuario of dbData.usuarios) {
      if (novasSenhas[usuario.email]) {
        const novaSenha = novasSenhas[usuario.email];
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        
        console.log(`👤 Usuário: ${usuario.nome} (${usuario.email})`);
        console.log(`📧 Senha antiga: [hash] ${usuario.senha}`);
        console.log(`🔑 Nova senha: "${novaSenha}"`);
        console.log(`🔐 Novo hash: ${novaSenhaHash}`);
        
        usuario.senha = novaSenhaHash;
        alteracoes++;
        
        console.log(`✅ Senha alterada com sucesso!\n`);
      }
    }
    
    if (alteracoes > 0) {
      // Salvar alterações no banco de dados
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
      console.log(`🎉 ${alteracoes} senha(s) alterada(s) com sucesso!`);
      console.log('📋 Usuários podem fazer login com a senha: "12345678"');
    } else {
      console.log('ℹ️ Nenhuma senha foi alterada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao resetar senhas:', error.message);
  }
}

resetarSenhasUsuarios();