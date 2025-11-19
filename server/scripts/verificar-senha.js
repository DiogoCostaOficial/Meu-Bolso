import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para verificar e corrigir senha do usuário
 */

async function verificarESenha() {
  try {
    console.log('🔍 Verificando usuário no banco de dados...\n');

    const DB_PATH = path.join(__dirname, '../data/database.json');

    // Ler banco de dados
    let db;
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      db = JSON.parse(data);
    } catch {
      console.log('❌ Banco de dados não encontrado!');
      return;
    }

    // Buscar usuário
    const usuario = db.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco!');
      console.log('   Execute: criar-usuario-teste.bat');
      return;
    }

    console.log('✅ Usuário encontrado!\n');
    console.log('📋 Dados do usuário:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   E-mail: ${usuario.email}`);
    console.log(`   Primeiro Acesso: ${usuario.primeiroAcesso}`);
    console.log(`   Data Criação: ${usuario.dataCriacao}`);
    console.log(`   Último Acesso: ${usuario.ultimoAcesso || 'Nunca'}\n`);

    // Testar senhas
    const senhasTestar = ['Teste@2025', 'teste@2025', 'admin', 'Admin@123'];

    console.log('🔐 Testando senhas...\n');

    for (const senha of senhasTestar) {
      const valida = await bcrypt.compare(senha, usuario.senha);
      console.log(`   ${senha.padEnd(15)} → ${valida ? '✅ CORRETA' : '❌ incorreta'}`);
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('\n💡 SOLUÇÃO:\n');
    console.log('   A senha atual correta é: Teste@2025');
    console.log('\n   Se mesmo assim não funcionar, execute:');
    console.log('   criar-usuario-teste.bat\n');
    console.log('   Isso vai resetar o usuário com a senha correta.');
    console.log('\n══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar
verificarESenha();
