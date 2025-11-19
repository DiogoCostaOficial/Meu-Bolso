const bcrypt = require('bcryptjs');

// Testar senha que foi definida anteriormente
const email = 'diogo.grunge@gmail.com';
const senhaTeste = 'diogo123';

console.log('🧪 Testando login do usuário diogo.grunge@gmail.com');
console.log('🔑 Senha teste: diogo123');

try {
  // Simular o processo de login
  const dbData = JSON.parse(require('fs').readFileSync('./data/database.json', 'utf8'));
  const usuario = dbData.usuarios.find(user => user.email === email);
  
  if (!usuario) {
    console.log('❌ Usuário não encontrado no banco de dados!');
    process.exit(1);
  }
  
  console.log(`👤 Usuário encontrado:`);
  console.log(`   Nome: ${usuario.nome}`);
  console.log(`   Email: ${usuario.email}`);
  console.log(`   Tipo: ${usuario.tipo}`);
  console.log(`   Ativo: ${usuario.ativo}`);
  console.log(`   Verificado: ${usuario.verificado}`);
  console.log(`   Primeiro Acesso: ${usuario.primeiroAcesso}`);
  
  // Verificar se a senha está correta
  const senhaValida = bcrypt.compareSync(senhaTeste, usuario.senha);
  
  if (senhaValida) {
    console.log('✅ Senha válida! Login funcionando corretamente.');
  } else {
    console.log('❌ Senha inválida!');
    console.log('🔍 A senha pode ter sido alterada ou o hash está incorreto.');
  }
  
} catch (error) {
  console.error('❌ Erro ao testar login:', error.message);
  process.exit(1);
}