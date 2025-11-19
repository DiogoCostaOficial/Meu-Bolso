const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Função para carregar dados do banco
function carregarDados() {
  const databasePath = path.join(__dirname, '..', 'data', 'database.json');
  const rawData = fs.readFileSync(databasePath, 'utf8');
  return JSON.parse(rawData);
}

// Função para testar senha de um usuário
async function testarSenhaUsuario(email, senhaTeste) {
  console.log(`\n🔍 Testando senha para: ${email}`);
  
  const dados = carregarDados();
  const usuario = dados.usuarios.find(u => u.email === email);
  
  if (!usuario) {
    console.log(`❌ Usuário não encontrado: ${email}`);
    return false;
  }
  
  console.log(`✅ Usuário encontrado: ${usuario.nome} (${usuario.id})`);
  console.log(`📧 Email: ${usuario.email}`);
  console.log(`👤 Tipo: ${usuario.tipo}`);
  console.log(`✅ Ativo: ${usuario.ativo}`);
  console.log(`✅ Verificado: ${usuario.verificado}`);
  console.log(`🔐 Hash da senha: ${usuario.senha}`);
  
  // Testar senha
  const senhaValida = await bcrypt.compare(senhaTeste, usuario.senha);
  console.log(`🔑 Senha '${senhaTeste}' é válida: ${senhaValida}`);
  
  // Testar senhas comuns
  const senhasComuns = ['123456', '12345678', 'senha123', 'admin123', 'teste123', 'password'];
  console.log('\n🧪 Testando senhas comuns:');
  
  for (const senhaComum of senhasComuns) {
    const valida = await bcrypt.compare(senhaComum, usuario.senha);
    if (valida) {
      console.log(`✅ Senha comum encontrada: ${senhaComum}`);
    }
  }
  
  // Verificar estrutura do hash
  console.log('\n🔬 Análise do hash:');
  console.log(`📊 Tamanho do hash: ${usuario.senha.length} caracteres`);
  console.log(`🔢 Salt rounds detectados: ${usuario.senha.split('$')[1] || 'desconhecido'}`);
  console.log(`🔑 Versão bcrypt: ${usuario.senha.split('$')[2] || 'desconhecido'}`);
  
  return senhaValida;
}

// Função principal
async function executarTestesCompletos() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE SENHAS DOS USUÁRIOS');
  console.log('=' .repeat(60));
  
  const dados = carregarDados();
  const usuarios = dados.usuarios;
  
  console.log(`📊 Total de usuários no sistema: ${usuarios.length}`);
  
  // Testar cada usuário
  for (const usuario of usuarios) {
    console.log('\n' + '='.repeat(60));
    console.log(`\n👤 Testando usuário: ${usuario.nome}`);
    
    // Testar com senha padrão que sabemos que funciona
    const senhaTeste = '12345678';
    const senhaValida = await testarSenhaUsuario(usuario.email, senhaTeste);
    
    if (senhaValida) {
      console.log(`✅ SUCESSO: Senha padrão funciona para ${usuario.email}`);
    } else {
      console.log(`❌ FALHA: Senha padrão NÃO funciona para ${usuario.email}`);
      
      // Tentar descobrir a senha correta
      console.log('\n🔍 Tentando descobrir senha correta...');
      
      // Testar senhas baseadas no email/nome
      const senhasPossiveis = [
        usuario.email.split('@')[0] + '123',
        usuario.nome.toLowerCase().replace(/\s+/g, '') + '123',
        '123456',
        'senha123',
        'admin123',
        'teste123'
      ];
      
      let senhaEncontrada = false;
      for (const senhaPossivel of senhasPossiveis) {
        const valida = await bcrypt.compare(senhaPossivel, usuario.senha);
        if (valida) {
          console.log(`✅ Senha encontrada: ${senhaPossivel}`);
          senhaEncontrada = true;
          break;
        }
      }
      
      if (!senhaEncontrada) {
        console.log(`❌ Nenhuma senha padrão funcionou`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMO DOS TESTES:');
  console.log(`✅ Teste concluído para ${usuarios.length} usuários`);
  
  // Verificar integridade dos hashes
  console.log('\n🔍 Verificação de integridade dos hashes:');
  for (const usuario of usuarios) {
    const hashValido = usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$') || usuario.senha.startsWith('$2y$');
    console.log(`${usuario.email}: ${hashValido ? '✅ Hash válido' : '❌ Hash inválido'}`);
  }
}

// Executar testes
if (require.main === module) {
  executarTestesCompletos().catch(console.error);
}

module.exports = { testarSenhaUsuario, carregarDados };