// Verificar e resolver problema de verificação do usuário
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'server/data/database.json');

console.log('🔍 Verificando status de verificação do usuário diogo.grunge@gmail.com...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Encontrar usuário
  const usuario = dbData.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');
  
  if (!usuario) {
    console.log('❌ Usuário não encontrado!');
    process.exit(1);
  }
  
  console.log('📋 Status atual do usuário:');
  console.log(`   - Nome: ${usuario.nome}`);
  console.log(`   - Email: ${usuario.email}`);
  console.log(`   - ID: ${usuario.id}`);
  console.log(`   - Verificado: ${usuario.verificado}`);
  console.log(`   - Ativo: ${usuario.ativo}`);
  console.log(`   - OTP Código: ${usuario.otpCodigo}`);
  console.log(`   - OTP Expira: ${usuario.otpExpira}`);
  
  // Verificar se o código OTP ainda é válido
  const agora = new Date();
  const otpExpira = usuario.otpExpira ? new Date(usuario.otpExpira) : null;
  const otpValido = otpExpira && otpExpira > agora;
  
  console.log(`\n🔑 Status do OTP: ${otpValido ? 'VÁLIDO' : 'EXPIRADO/NENHUM'}`);
  
  if (otpValido) {
    console.log(`   - Código OTP válido: ${usuario.otpCodigo}`);
    console.log(`   - Use este código para verificar a conta!`);
    console.log(`   - Expira em: ${usuario.otpExpira}`);
  } else {
    console.log('   - Nenhum código OTP válido encontrado');
  }
  
  // Verificar manualmente a conta
  console.log('\n✅ Verificando conta manualmente...');
  usuario.verificado = true;
  usuario.otpCodigo = null;
  usuario.otpExpira = null;
  
  // Salvar alterações
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  
  console.log('✅ Conta verificada com sucesso!');
  console.log('\n📝 Novo status:');
  console.log(`   - Verificado: ${usuario.verificado}`);
  console.log(`   - OTP Código: ${usuario.otpCodigo}`);
  console.log(`   - OTP Expira: ${usuario.otpExpira}`);
  
  console.log('\n🎉 Agora o usuário pode fazer login normalmente!');
  console.log('   - Email: diogo.grunge@gmail.com');
  console.log('   - Use a senha que foi definida no cadastro');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}