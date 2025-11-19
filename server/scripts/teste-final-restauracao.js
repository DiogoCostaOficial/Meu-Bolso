// Teste final completo do sistema após restauração
const fs = require('fs');
const path = require('path');

console.log('🎯 TESTE FINAL DO SISTEMA APÓS RESTAURAÇÃO');
console.log('='.repeat(70));
console.log('Data:', new Date().toLocaleString('pt-BR'));
console.log('='.repeat(70));

// Carregar banco de dados
const dbPath = path.join(__dirname, '../data/database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('\n📊 RELATÓRIO DE USUÁRIOS:');
console.log('-'.repeat(40));

let totalAdmin = 0;
let totalUsuarios = 0;

db.usuarios.forEach((usuario, index) => {
  const tipoFormatado = usuario.tipo.toUpperCase();
  const status = usuario.ativo ? '✅ ATIVO' : '❌ INATIVO';
  const migracao = usuario.migracaoAdmin ? ' (MIGRADO)' : '';
  
  console.log(`${index + 1}. ${usuario.nome}`);
  console.log(`   📧 Email: ${usuario.email}`);
  console.log(`   👤 Tipo: ${tipoFormatado}`);
  console.log(`   📊 Status: ${status}${migracao}`);
  console.log(`   📅 Criado: ${new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}`);
  console.log('');
  
  if (usuario.tipo === 'admin') totalAdmin++;
  if (usuario.tipo === 'usuario') totalUsuarios++;
});

console.log('='.repeat(70));
console.log('📈 RESUMO DO SISTEMA:');
console.log('='.repeat(70));
console.log(`Total de Administradores: ${totalAdmin}`);
console.log(`Total de Usuários Normais: ${totalUsuarios}`);
console.log(`Total Geral: ${db.usuarios.length}`);

// Verificar especificamente o caso do Diogo
const diogo = db.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');

console.log('\n🔍 ANÁLISE ESPECÍFICA - USUÁRIO DIGOGO:');
console.log('-'.repeat(50));

if (diogo) {
  console.log(`✅ Usuário encontrado: ${diogo.nome}`);
  console.log(`✅ Email: ${diogo.email}`);
  console.log(`✅ Tipo atual: ${diogo.tipo.toUpperCase()}`);
  console.log(`✅ Status: ${diogo.ativo ? 'ATIVO' : 'INATIVO'}`);
  
  if (diogo.tipo === 'usuario' && !diogo.migracaoAdmin) {
    console.log(`\n🎉 RESTAURAÇÃO BEM SUCEDIDA!`);
    console.log(`✅ O usuário Diogo está novamente como USUÁRIO NORMAL`);
    console.log(`✅ As permissões de administrador foram removidas`);
    console.log(`✅ O sistema voltou ao estado anterior à cópia de permissões`);
  } else if (diogo.tipo === 'admin') {
    console.log(`\n❌ PROBLEMA DETECTADO!`);
    console.log(`❌ O usuário ainda tem permissões de ADMINISTRADOR`);
    console.log(`❌ A restauração pode não ter sido completa`);
  }
  
  if (diogo.migracaoAdmin) {
    console.log(`\n⚠️  REGISTRO DE MIGRAÇÃO ENCONTRADO:`);
    console.log(`📅 Data da migração: ${diogo.migracaoAdmin.dataMigracao}`);
    console.log(`👤 Admin origem: ${diogo.migracaoAdmin.adminEmail}`);
  }
  
} else {
  console.log(`❌ Usuário Diogo (diogo.grunge@gmail.com) NÃO ENCONTRADO`);
}

console.log('\n' + '='.repeat(70));
console.log('🎯 CONCLUSÃO FINAL:');
console.log('='.repeat(70));

if (diogo && diogo.tipo === 'usuario' && !diogo.migracaoAdmin) {
  console.log('🎉 ✅ RESTAURAÇÃO COMPLETA E BEM SUCEDIDA!');
  console.log('');
  console.log('✅ O sistema foi restaurado com sucesso');
  console.log('✅ O usuário Diogo voltou a ser usuário normal');
  console.log('✅ As permissões de admin foram removidas');
  console.log('✅ O sistema deve funcionar como antes');
  console.log('');
  console.log('📋 O que foi feito:');
  console.log('   • Removido tipo "admin" do usuário Diogo');
  console.log('   • Removidas configurações de administrador');
  console.log('   • Removido registro de migração');
  console.log('   • Mantida a senha e dados pessoais');
  
} else {
  console.log('❌ RESTAURAÇÃO INCOMPLETA OU COM PROBLEMAS');
  console.log('');
  console.log('⚠️  Verificações necessárias:');
  console.log('   • Verificar se o usuário ainda tem permissões de admin');
  console.log('   • Verificar registros de migração');
  console.log('   • Possível necessidade de restauração manual');
}

console.log('\n' + '='.repeat(70));
console.log('📄 Documentação: server/data/restauracao-permissoes-diogo.log');
console.log('💾 Backups disponíveis em: server/data/backups/');
console.log('='.repeat(70));