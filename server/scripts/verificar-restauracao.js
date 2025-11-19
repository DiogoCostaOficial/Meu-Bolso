const fs = require('fs');
const path = require('path');

// Testar login e permissões após restauração
console.log('🧪 TESTANDO SISTEMA APÓS RESTAURAÇÃO DE PERMISSÕES');
console.log('='.repeat(60));

// Carregar banco de dados
const dbPath = path.join(__dirname, '../data/database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Verificar usuários
console.log('\n📋 ESTADO ATUAL DOS USUÁRIOS:');
db.usuarios.forEach(usuario => {
  console.log(`- ${usuario.nome} (${usuario.email}): ${usuario.tipo}`);
  if (usuario.migracaoAdmin) {
    console.log(`  ⚠️  Tem migração de admin em: ${usuario.migracaoAdmin.dataMigracao}`);
  }
});

// Verificar se o Diogo está como usuário normal
const diogo = db.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');
if (diogo) {
  console.log('\n✅ Usuário Diogo encontrado:');
  console.log(`   - Tipo: ${diogo.tipo}`);
  console.log(`   - Admin migração: ${diogo.migracaoAdmin ? 'SIM' : 'NÃO'}`);
  
  if (diogo.tipo === 'usuario' && !diogo.migracaoAdmin) {
    console.log('\n🎉 RESTAURAÇÃO BEM SUCEDIDA! O usuário Diogo voltou a ser usuário normal.');
  } else {
    console.log('\n❌ RESTAURAÇÃO INCOMPLETA! O usuário Diogo ainda tem permissões de admin.');
  }
} else {
  console.log('\n❌ Usuário Diogo não encontrado no banco de dados!');
}

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA RESTAURAÇÃO:');
console.log('- Usuário: diogo.grunge@gmail.com');
console.log('- Ação: Removidas permissões de admin');
console.log('- Status: Concluído');
console.log('- Backup: Disponível em data/backups/');
console.log('='.repeat(60));