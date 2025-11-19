import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para criar usuário de teste
 * Execute: node scripts/criar-usuario-teste.js
 */

async function criarUsuarioTeste() {
  try {
    console.log('🔧 Criando usuário de teste...\n');

    const DB_PATH = path.join(__dirname, '../data/database.json');

    // Dados do usuário de teste
    const usuarioTeste = {
      nome: 'Diogo Grunge',
      email: 'diogo.grunge@gmail.com',
      senhaTexto: 'Teste@2025',  // Senha temporária
      primeiroAcesso: true
    };

    console.log('📋 Dados do usuário:');
    console.log(`   Nome: ${usuarioTeste.nome}`);
    console.log(`   E-mail: ${usuarioTeste.email}`);
    console.log(`   Senha temporária: ${usuarioTeste.senhaTexto}`);
    console.log(`   Primeiro acesso: ${usuarioTeste.primeiroAcesso}\n`);

    // Gerar hash da senha
    console.log('🔐 Gerando hash bcrypt...');
    const senhaHash = await bcrypt.hash(usuarioTeste.senhaTexto, 10);
    console.log('✅ Hash gerado com sucesso!\n');

    // Ler banco de dados
    let db;
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      db = JSON.parse(data);
      console.log('📖 Banco de dados carregado');
    } catch {
      // Se não existir, criar estrutura inicial
      db = {
        usuarios: [],
        admin: {
          email: 'admin',
          senha: await bcrypt.hash('admin', 10),
          nome: 'Administrador',
          tipo: 'admin',
          primeiroAcesso: true,
          dataCriacao: new Date().toISOString()
        }
      };
      console.log('📝 Banco de dados criado');
    }

    // Verificar se usuário já existe
    const usuarioExistente = db.usuarios.find(u => u.email === usuarioTeste.email);
    
    if (usuarioExistente) {
      console.log('⚠️  Usuário já existe! Atualizando dados...\n');
      
      // Atualizar usuário existente
      const index = db.usuarios.findIndex(u => u.email === usuarioTeste.email);
      db.usuarios[index] = {
        ...db.usuarios[index],
        nome: usuarioTeste.nome,
        senha: senhaHash,
        primeiroAcesso: true,
        dataAtualizacao: new Date().toISOString()
      };
      
      console.log('✅ Usuário atualizado!');
    } else {
      console.log('➕ Adicionando novo usuário...\n');
      
      // Criar novo usuário
      const novoUsuario = {
        id: Date.now().toString(),
        nome: usuarioTeste.nome,
        email: usuarioTeste.email,
        senha: senhaHash,
        primeiroAcesso: true,
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: null
      };

      db.usuarios.push(novoUsuario);
      console.log('✅ Usuário criado!');
    }

    // Salvar banco de dados
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    console.log('💾 Banco de dados salvo!\n');

    // Resumo final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ USUÁRIO DE TESTE CRIADO COM SUCESSO!\n');
    console.log('📧 Para fazer login use:');
    console.log(`   E-mail: ${usuarioTeste.email}`);
    console.log(`   Senha:  ${usuarioTeste.senhaTexto}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Você será OBRIGADO a alterar a senha no primeiro acesso');
    console.log('   2. A nova senha deve ter:');
    console.log('      • Mínimo 8 caracteres');
    console.log('      • 1 letra maiúscula');
    console.log('      • 1 letra minúscula');
    console.log('      • 1 número');
    console.log('      • 1 caractere especial (!@#$%&*)');
    console.log('\n💡 Sugestão de nova senha: Diogo@2025');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
}

// Executar
criarUsuarioTeste();
