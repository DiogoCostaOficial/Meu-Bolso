// Testar comparação de senha
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/database.json');

console.log('🔐 Testando comparação de senha...\n');

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
  console.log(`   - Hash: ${usuarioFuncional.senha.substring(0, 30)}...`);
  
  // Testar senha
  const senhaTeste = '123456';
  console.log(`\n🔑 Testando senha: ${senhaTeste}`);
  
  const senhaValida = await bcrypt.compare(senhaTeste, usuarioFuncional.senha);
  console.log(`✅ Senha válida: ${senhaValida}`);
  
  if (senhaValida) {
    console.log('\n🎉 A senha está correta! O problema pode ser outro.');
  } else {
    console.log('\n❌ A senha não corresponde ao hash.');
    console.log('Tentando descobrir a senha correta...');
    
    // Testar senhas comuns
    const senhasComuns = ['123456', 'senha123', 'teste123', '12345678', 'password', 'admin'];
    for (const senha of senhasComuns) {
      const valida = await bcrypt.compare(senha, usuarioFuncional.senha);
      if (valida) {
        console.log(`🎯 Senha correta encontrada: ${senha}`);
        break;
      }
    }
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}