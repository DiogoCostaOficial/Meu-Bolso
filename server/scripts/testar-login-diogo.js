// Script para testar login com a nova senha
const bcrypt = require('bcryptjs');

const email = 'diogo.grunge@gmail.com';
const senhaTeste = 'diogo123';

console.log('🧪 Testando login com nova senha...');
console.log(`📧 Email: ${email}`);
console.log(`🔑 Senha: ${senhaTeste}`);

try {
  // Simular o processo de login
  const dbData = JSON.parse(require('fs').readFileSync('./data/database.json', 'utf8'));
  const usuario = dbData.usuarios.find(user => user.email === email);
  
  if (!usuario) {
    console.log('❌ Usuário não encontrado!');
    process.exit(1);
  }
  
  console.log(`👤 Usuário encontrado: ${usuario.nome}`);
  console.log(`📝 Tipo: ${usuario.tipo}`);
  
  // Verificar se a senha está correta
  const senhaValida = bcrypt.compareSync(senhaTeste, usuario.senha);
  
  if (senhaValida) {
    console.log('✅ Login bem-sucedido!');
    console.log('🎉 A senha foi redefinida corretamente.');
  } else {
    console.log('❌ Senha incorreta!');
    console.log('🔍 Verifique se o hash foi gerado corretamente.');
  }
  
} catch (error) {
  console.error('❌ Erro ao testar login:', error.message);
  process.exit(1);
}