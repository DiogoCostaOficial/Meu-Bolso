import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para FORÇAR reset de senha do usuário
 */

async function resetarSenhaForcado() {
  try {
    console.log('🔧 RESETANDO SENHA DO USUÁRIO (FORÇADO)...\n');

    const DB_PATH = path.join(__dirname, '../data/database.json');

    // Dados do usuário
    const email = 'diogo.grunge@gmail.com';
    const senhaTemporaria = 'Teste@2025';

    console.log('📋 Configuração:');
    console.log(`   E-mail: ${email}`);
    console.log(`   Nova Senha: ${senhaTemporaria}\n`);

    // Gerar hash NOVO
    console.log('🔐 Gerando hash bcrypt...');
    const senhaHash = await bcrypt.hash(senhaTemporaria, 10);
    console.log('✅ Hash gerado!\n');

    // Testar se o hash está correto
    const testeHash = await bcrypt.compare(senhaTemporaria, senhaHash);
    console.log(`🧪 Teste do hash: ${testeHash ? '✅ OK' : '❌ FALHOU'}\n`);

    if (!testeHash) {
      console.log('❌ ERRO: Hash não está funcionando!');
      return;
    }

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
    const usuarioIndex = db.usuarios.findIndex(u => u.email === email);

    if (usuarioIndex === -1) {
      console.log('❌ Usuário não encontrado!');
      console.log('   Criando novo usuário...\n');

      // Criar novo usuário
      db.usuarios.push({
        id: Date.now().toString(),
        nome: 'Diogo Grunge',
        email: email,
        senha: senhaHash,
        primeiroAcesso: true,
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: null
      });
    } else {
      console.log('✅ Usuário encontrado! Atualizando...\n');

      // Atualizar usuário existente
      db.usuarios[usuarioIndex] = {
        ...db.usuarios[usuarioIndex],
        senha: senhaHash,
        primeiroAcesso: true,
        dataAtualizacao: new Date().toISOString()
      };
    }

    // Salvar banco de dados
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log('💾 Banco de dados atualizado!\n');

    // Verificar se salvou corretamente
    const dbVerificar = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
    const usuarioVerificar = dbVerificar.usuarios.find(u => u.email === email);
    
    const senhaCorreta = await bcrypt.compare(senhaTemporaria, usuarioVerificar.senha);
    console.log(`🔍 Verificação final: ${senhaCorreta ? '✅ SENHA CORRETA' : '❌ SENHA INCORRETA'}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ USUÁRIO RESETADO COM SUCESSO!\n');
    console.log('📧 Login:');
    console.log(`   E-mail: ${email}`);
    console.log(`   Senha:  ${senhaTemporaria}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. REINICIE O BACKEND (Ctrl+C e npm run dev)');
    console.log('   2. LIMPE O CACHE DO NAVEGADOR (F12 → Application → Clear storage)');
    console.log('   3. Ou execute: localStorage.clear() no console');
    console.log('   4. RECARREGUE A PÁGINA (F5)');
    console.log('   5. Faça LOGIN DO ZERO');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar
resetarSenhaForcado();
