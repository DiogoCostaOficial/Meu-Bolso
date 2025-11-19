// server/scripts/verifyAdminMigration.js
// Script para verificar a integridade da migração de admin
// Autor: Sistema de Verificação - Finanças Fácil

const fs = require('fs');
const path = require('path');

const DATABASE_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'INFO') {
  const colorMap = {
    'SUCCESS': colors.green,
    'ERROR': colors.red,
    'WARNING': colors.yellow,
    'INFO': colors.cyan
  };
  console.log(`${colorMap[type] || colors.reset}${message}${colors.reset}`);
}

function verifyAdminPrivileges(email) {
  try {
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const user = database.usuarios.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        message: `Usuário ${email} não encontrado`
      };
    }
    
    // Verificações de privilégios de admin
    const checks = [
      {
        name: 'Tipo de usuário é admin',
        test: user.tipo === 'admin',
        critical: true
      },
      {
        name: 'Status ativo',
        test: user.ativo === true,
        critical: true
      },
      {
        name: 'Status verificado',
        test: user.verificado === true,
        critical: true
      },
      {
        name: 'Tem configurações',
        test: !!user.configuracoes,
        critical: false
      },
      {
        name: 'Configurações de notificações',
        test: user.configuracoes?.notificacoesEmail !== undefined,
        critical: false
      },
      {
        name: 'Configurações de tema',
        test: !!user.configuracoes?.tema,
        critical: false
      },
      {
        name: 'Metadata de migração',
        test: !!user.migracaoAdmin,
        critical: false
      },
      {
        name: 'Data de migração válida',
        test: user.migracaoAdmin?.dataMigracao && !isNaN(Date.parse(user.migracaoAdmin.dataMigracao)),
        critical: false
      }
    ];
    
    const results = checks.map(check => ({
      ...check,
      passed: check.test
    }));
    
    const failedCritical = results.filter(r => !r.passed && r.critical);
    const failedNonCritical = results.filter(r => !r.passed && !r.critical);
    const passed = results.filter(r => r.passed);
    
    return {
      success: failedCritical.length === 0,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
        ativo: user.ativo,
        verificado: user.verificado,
        dataMigracao: user.migracaoAdmin?.dataMigracao,
        adminOrigem: user.migracaoAdmin?.adminOrigem
      },
      results: {
        passed: passed.length,
        failedCritical: failedCritical.length,
        failedNonCritical: failedNonCritical.length,
        total: checks.length,
        details: results
      },
      message: failedCritical.length > 0 
        ? `Falhas críticas encontradas: ${failedCritical.map(f => f.name).join(', ')}`
        : 'Todas as verificações críticas passaram'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao verificar: ${error.message}`
    };
  }
}

function compareUsers(sourceEmail, targetEmail) {
  try {
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const sourceUser = database.usuarios.find(u => u.email === sourceEmail);
    const targetUser = database.usuarios.find(u => u.email === targetEmail);
    
    if (!sourceUser) {
      return { success: false, message: `Usuário origem ${sourceEmail} não encontrado` };
    }
    
    if (!targetUser) {
      return { success: false, message: `Usuário destino ${targetEmail} não encontrado` };
    }
    
    // Campos a serem comparados
    const comparableFields = [
      'tipo', 'ativo', 'verificado', 'configuracoes'
    ];
    
    const differences = [];
    const similarities = [];
    
    comparableFields.forEach(field => {
      const sourceValue = sourceUser[field];
      const targetValue = targetUser[field];
      
      if (JSON.stringify(sourceValue) === JSON.stringify(targetValue)) {
        similarities.push(field);
      } else {
        differences.push({
          field,
          source: sourceValue,
          target: targetValue
        });
      }
    });
    
    return {
      success: true,
      sourceUser: {
        id: sourceUser.id,
        email: sourceUser.email,
        nome: sourceUser.nome
      },
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        nome: targetUser.nome
      },
      comparison: {
        similarities: similarities.length,
        differences: differences.length,
        similarityFields: similarities,
        differenceDetails: differences
      },
      migrationComplete: differences.length === 0 && targetUser.tipo === 'admin'
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Erro na comparação: ${error.message}`
    };
  }
}

function listAllAdmins() {
  try {
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const admins = database.usuarios.filter(u => u.tipo === 'admin');
    
    return {
      success: true,
      count: admins.length,
      admins: admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        nome: admin.nome,
        ativo: admin.ativo,
        dataMigracao: admin.migracaoAdmin?.dataMigracao,
        adminOrigem: admin.migracaoAdmin?.adminOrigem
      }))
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao listar admins: ${error.message}`
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n🔍 Verificador de Migração de Admin - Finanças Fácil\n');
    console.log('Comandos disponíveis:');
    console.log('  verify <email>          - Verificar privilégios de admin');
    console.log('  compare <origem> <dest> - Comparar dois usuários');
    console.log('  list                    - Listar todos os administradores');
    console.log('\nExemplos:');
    console.log('  node verifyAdminMigration.js verify diogo.grunge@gmail.com');
    console.log('  node verifyAdminMigration.js compare admin@admin.com diogo.grunge@gmail.com');
    console.log('  node verifyAdminMigration.js list\n');
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'verify':
      if (args.length !== 2) {
        console.log('Uso: node verifyAdminMigration.js verify <email>');
        return;
      }
      
      const verifyResult = verifyAdminPrivileges(args[1]);
      
      if (verifyResult.success) {
        log(`\n✅ ${args[1]} tem privilégios de administrador válidos!`, 'SUCCESS');
        log(`   Nome: ${verifyResult.user.nome}`, 'INFO');
        log(`   ID: ${verifyResult.user.id}`, 'INFO');
        log(`   Status: ${verifyResult.user.ativo ? 'Ativo' : 'Inativo'}`, 'INFO');
        
        if (verifyResult.user.dataMigracao) {
          log(`   Migrado em: ${new Date(verifyResult.user.dataMigracao).toLocaleString()}`, 'INFO');
        }
        
        log(`\n📊 Resultados da verificação:`, 'INFO');
        log(`   ✅ Passou: ${verifyResult.results.passed}/${verifyResult.results.total}`, 'SUCCESS');
        
        if (verifyResult.results.failedNonCritical > 0) {
          log(`   ⚠️  Falhas não-críticas: ${verifyResult.results.failedNonCritical}`, 'WARNING');
        }
        
        if (verifyResult.results.failedCritical > 0) {
          log(`   ❌ Falhas críticas: ${verifyResult.results.failedCritical}`, 'ERROR');
        }
        
      } else {
        log(`\n❌ ${verifyResult.message}`, 'ERROR');
      }
      break;
      
    case 'compare':
      if (args.length !== 3) {
        console.log('Uso: node verifyAdminMigration.js compare <email-origem> <email-destino>');
        return;
      }
      
      const compareResult = compareUsers(args[1], args[2]);
      
      if (compareResult.success) {
        log(`\n🔍 Comparando ${args[1]} → ${args[2]}:`, 'INFO');
        log(`   Origem: ${compareResult.sourceUser.nome} (${compareResult.sourceUser.id})`, 'INFO');
        log(`   Destino: ${compareResult.targetUser.nome} (${compareResult.targetUser.id})`, 'INFO');
        log(`\n📊 Resultados:`, 'INFO');
        log(`   Campos idênticos: ${compareResult.comparison.similarities}`, 'SUCCESS');
        log(`   Diferenças: ${compareResult.comparison.differences}`, compareResult.comparison.differences > 0 ? 'WARNING' : 'SUCCESS');
        
        if (compareResult.comparison.differences > 0) {
          log(`\n📝 Diferenças encontradas:`, 'WARNING');
          compareResult.comparison.differenceDetails.forEach(diff => {
            log(`   ${diff.field}: ${JSON.stringify(diff.source)} → ${JSON.stringify(diff.target)}`, 'WARNING');
          });
        }
        
        if (compareResult.migrationComplete) {
          log(`\n✅ Migração está completa e idêntica!`, 'SUCCESS');
        }
        
      } else {
        log(`\n❌ ${compareResult.message}`, 'ERROR');
      }
      break;
      
    case 'list':
      const listResult = listAllAdmins();
      
      if (listResult.success) {
        log(`\n👥 Administradores do sistema (${listResult.count}):`, 'INFO');
        
        listResult.admins.forEach((admin, index) => {
          log(`\n${index + 1}. ${admin.email}`, 'INFO');
          log(`   Nome: ${admin.nome}`, 'INFO');
          log(`   ID: ${admin.id}`, 'INFO');
          log(`   Status: ${admin.ativo ? 'Ativo' : 'Inativo'}`, 'INFO');
          
          if (admin.dataMigracao) {
            log(`   Migrado em: ${new Date(admin.dataMigracao).toLocaleString()}`, 'INFO');
            log(`   Origem: ${admin.adminOrigem}`, 'INFO');
          }
        });
        
      } else {
        log(`\n❌ ${listResult.message}`, 'ERROR');
      }
      break;
      
    default:
      console.log(`Comando desconhecido: ${command}`);
      console.log('Use "node verifyAdminMigration.js" para ver comandos disponíveis');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyAdminPrivileges,
  compareUsers,
  listAllAdmins
};