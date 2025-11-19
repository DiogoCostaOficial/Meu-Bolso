// Atualizar usuário de teste com hash válido
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/database.json');

console.log('🔧 Atualizando hash do usuário de teste...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Encontrar usuário de teste
  const usuario = dbData.usuarios.find(u => u.email === 'teste.simples@teste.com');
  
  if (!usuario) {
    console.log('❌ Usuário de teste não encontrado!');
    process.exit(1);
  }
  
  // Usar hash de um usuário que funciona (teste@teste.com)
  const usuarioFuncional = dbData.usuarios.find(u => u.email === 'teste@teste.com');
  if (!usuarioFuncional) {
    console.log('❌ Usuário funcional não encontrado!');
    process.exit(1);
  }
  
  console.log('📋 Usuário encontrado:');
  console.log(`   - Email: ${usuario.email}`);
  console.log(`   - Nome: ${usuario.nome}`);
  console.log(`   - ID: ${usuario.id}`);
  
  console.log('\n🔑 Atualizando hash de senha...');
  console.log(`   - Hash antigo: ${usuario.senha.substring(0, 20)}...`);
  console.log(`   - Hash novo: ${usuarioFuncional.senha.substring(0, 20)}...`);
  
  // Atualizar hash (mesma senha do usuário funcional)
  usuario.senha = usuarioFuncional.senha;
  
  // Salvar alterações
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  
  console.log('✅ Hash atualizado com sucesso!');
  console.log('\n🎯 Agora teste o login com:');
  console.log('   - Email: teste.simples@teste.com');
  console.log('   - Senha: 123456 (mesma do teste@teste.com)');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}