// Teste detalhado do login para verificar o que está acontecendo
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data/database.json');

console.log('🔍 Teste detalhado do processo de login...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Testar com usuário que funciona
  const usuarioFuncional = dbData.usuarios.find(u => u.email === 'teste@teste.com');
  if (!usuarioFuncional) {
    console.log('❌ Usuário funcional não encontrado!');
    process.exit(1);
  }
  
  console.log('📋 Usuário funcional encontrado:');
  console.log(`   - Email: ${usuarioFuncional.email}`);
  console.log(`   - Nome: ${usuarioFuncional.nome}`);
  console.log(`   - ID: ${usuarioFuncional.id}`);
  console.log(`   - Ativo: ${usuarioFuncional.ativo}`);
  console.log(`   - Verificado: ${usuarioFuncional.verificado}`);
  console.log(`   - Tipo: ${usuarioFuncional.tipo}`);
  console.log(`   - Hash: ${usuarioFuncional.senha.substring(0, 30)}...`);
  
  // Simular o processo de login
  const email = 'teste@teste.com';
  const senha = '123456';
  
  console.log(`\n🔑 Simulando login:`);
  console.log(`   - Email: ${email}`);
  console.log(`   - Senha: ${senha}`);
  
  // Encontrar usuário
  const usuario = dbData.usuarios.find(u => u.email === email);
  console.log(`\n✅ Usuário encontrado: ${usuario ? 'SIM' : 'NÃO'}`);
  
  if (usuario) {
    console.log(`   - Verificado: ${usuario.verificado}`);
    console.log(`   - Ativo: ${usuario.ativo}`);
    
    // Verificar se está ativo
    if (!usuario.ativo) {
      console.log('❌ Usuário inativo!');
    } else {
      console.log('✅ Usuário ativo');
    }
    
    // Verificar se está verificado
    if (!usuario.verificado) {
      console.log('❌ Usuário não verificado!');
    } else {
      console.log('✅ Usuário verificado');
    }
    
    // Validar senha
    console.log('\n🔐 Validando senha...');
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log(`✅ Senha válida: ${senhaValida}`);
    
    if (senhaValida) {
      console.log('\n🎉 Login deveria funcionar!');
      console.log('O problema pode estar no servidor ou na comunicação.');
    } else {
      console.log('\n❌ Senha inválida!');
    }
  }
  
  // Agora testar com o usuário de teste que criamos
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Testando usuário de teste simples...\n');
  
  const usuarioTeste = dbData.usuarios.find(u => u.email === 'teste.simples@teste.com');
  if (usuarioTeste) {
    console.log('📋 Usuário de teste encontrado:');
    console.log(`   - Email: ${usuarioTeste.email}`);
    console.log(`   - Nome: ${usuarioTeste.nome}`);
    console.log(`   - ID: ${usuarioTeste.id}`);
    console.log(`   - Ativo: ${usuarioTeste.ativo}`);
    console.log(`   - Verificado: ${usuarioTeste.verificado}`);
    console.log(`   - Hash: ${usuarioTeste.senha.substring(0, 30)}...`);
    
    // Comparar hashes
    console.log('\n🔍 Comparando hashes:');
    console.log(`   - Funcional: ${usuarioFuncional.senha}`);
    console.log(`   - Teste:     ${usuarioTeste.senha}`);
    console.log(`   - Iguais: ${usuarioFuncional.senha === usuarioTeste.senha}`);
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}