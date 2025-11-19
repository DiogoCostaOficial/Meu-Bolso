// server/scripts/migrateAdminPrivileges.js
// Script seguro para migração de privilégios de administrador
// Autor: Sistema de Migração - Finanças Fácil
// Data: ${new Date().toISOString()}

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configurações de segurança
const MIGRATION_LOG_FILE = path.join(__dirname, '..', 'data', 'migration.log');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');
const DATABASE_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Cores para logs no console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função de logging seguro
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  
  // Log no console com cores
  const colorMap = {
    'INFO': colors.cyan,
    'SUCCESS': colors.green,
    'WARNING': colors.yellow,
    'ERROR': colors.red,
    'MIGRATION': colors.magenta
  };
  
  console.log(`${colorMap[level] || colors.reset}${logEntry}${colors.reset}`);
  
  // Log no arquivo
  try {
    fs.appendFileSync(MIGRATION_LOG_FILE, logEntry);
  } catch (error) {
    console.error(`${colors.red}Erro ao escrever log: ${error.message}${colors.reset}`);
  }
}

// Função para criar backup seguro
function createBackup() {
  try {
    // Criar diretório de backups se não existir
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      log('Diretório de backups criado', 'SUCCESS');
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `database-backup-${timestamp}.json`);
    
    // Ler database atual
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    
    // Criar backup
    fs.writeFileSync(backupFile, JSON.stringify(database, null, 2));
    
    log(`Backup criado com sucesso: ${backupFile}`, 'SUCCESS');
    return backupFile;
  } catch (error) {
    log(`Erro ao criar backup: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Função para validar estrutura do usuário
function validateUser(user, userType = 'source') {
  const requiredFields = ['id', 'email', 'tipo', 'ativo', 'verificado'];
  const missingFields = requiredFields.filter(field => !user[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Usuário ${userType} tem campos obrigatórios faltando: ${missingFields.join(', ')}`);
  }
  
  if (!['admin', 'usuario'].includes(user.tipo)) {
    throw new Error(`Tipo de usuário inválido: ${user.tipo}`);
  }
  
  return true;
}

// Função para copiar dados do admin
function copyAdminData(sourceAdmin, targetUser) {
  log('Iniciando cópia de dados do administrador', 'MIGRATION');
  
  // Campos críticos que devem ser copiados
  const criticalFields = [
    'tipo',           // Tipo admin
    'configuracoes',  // Configurações do admin
    'ultimoAcesso',   // Último acesso
    'ativo',          // Status ativo
    'verificado'      // Status verificado
  ];
  
  // Campos que não devem ser sobrescritos
  const preserveFields = [
    'id',             // ID único do usuário
    'email',          // Email do usuário
    'nome',           // Nome do usuário
    'senha',          // Senha do usuário
    'dataCriacao',    // Data de criação original
    'primeiroAcesso', // Status de primeiro acesso
    'otpCodigo',      // Código OTP
    'otpExpira'       // Expiração do OTP
  ];
  
  // Criar objeto com dados migrados
  const migratedData = { ...targetUser };
  
  // Copiar campos críticos
  criticalFields.forEach(field => {
    if (sourceAdmin[field] !== undefined) {
      migratedData[field] = sourceAdmin[field];
      log(`Campo '${field}' migrado: ${JSON.stringify(sourceAdmin[field])}`, 'INFO');
    }
  });
  
  // Preservar campos importantes do usuário alvo
  preserveFields.forEach(field => {
    if (targetUser[field] !== undefined) {
      migratedData[field] = targetUser[field];
    }
  });
  
  // Adicionar metadata da migração
  migratedData.migracaoAdmin = {
    dataMigracao: new Date().toISOString(),
    adminOrigem: sourceAdmin.id,
    adminEmail: sourceAdmin.email,
    camposMigrados: criticalFields
  };
  
  return migratedData;
}

// Função principal de migração
async function migrateAdminPrivileges(sourceEmail, targetEmail) {
  log('=== INICIANDO MIGRAÇÃO DE PRIVILÉGIOS DE ADMINISTRADOR ===', 'MIGRATION');
  log(`Origem: ${sourceEmail} → Destino: ${targetEmail}`, 'INFO');
  
  let backupFile = null;
  
  try {
    // Criar backup antes de qualquer alteração
    log('Criando backup de segurança...', 'INFO');
    backupFile = createBackup();
    
    // Ler database atual
    log('Lendo database atual...', 'INFO');
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    
    if (!database.usuarios || !Array.isArray(database.usuarios)) {
      throw new Error('Estrutura do database inválida');
    }
    
    // Encontrar usuários
    const sourceAdmin = database.usuarios.find(u => u.email === sourceEmail);
    const targetUser = database.usuarios.find(u => u.email === targetEmail);
    
    // Validações de segurança
    if (!sourceAdmin) {
      throw new Error(`Usuário administrador ${sourceEmail} não encontrado`);
    }
    
    if (!targetUser) {
      throw new Error(`Usuário alvo ${targetEmail} não encontrado`);
    }
    
    if (sourceAdmin.tipo !== 'admin') {
      throw new Error(`Usuário ${sourceEmail} não é administrador`);
    }
    
    log(`Usuário origem encontrado: ${sourceAdmin.nome} (${sourceAdmin.id})`, 'SUCCESS');
    log(`Usuário destino encontrado: ${targetUser.nome} (${targetUser.id})`, 'SUCCESS');
    
    // Validar estrutura dos usuários
    validateUser(sourceAdmin, 'source');
    validateUser(targetUser, 'target');
    
    // Criar cópia dos dados do admin para o novo usuário
    const migratedUser = copyAdminData(sourceAdmin, targetUser);
    
    // Validar migração
    if (migratedUser.tipo !== 'admin') {
      throw new Error('Falha na migração: tipo não foi alterado para admin');
    }
    
    if (!migratedUser.configuracoes) {
      throw new Error('Falha na migração: configurações não foram copiadas');
    }
    
    // Atualizar usuário no database
    const userIndex = database.usuarios.findIndex(u => u.email === targetEmail);
    database.usuarios[userIndex] = migratedUser;
    
    // Salvar alterações
    log('Salvando alterações no database...', 'INFO');
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(database, null, 2));
    
    // Validação final
    log('Realizando validação final...', 'INFO');
    const finalDatabase = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const finalUser = finalDatabase.usuarios.find(u => u.email === targetEmail);
    
    if (!finalUser) {
      throw new Error('Usuário não encontrado após migração');
    }
    
    if (finalUser.tipo !== 'admin') {
      throw new Error('Validação falhou: usuário não é admin após migração');
    }
    
    if (!finalUser.migracaoAdmin) {
      throw new Error('Validação falhou: metadata de migração não encontrada');
    }
    
    log('=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===', 'SUCCESS');
    log(`Usuário ${targetEmail} agora tem privilégios de administrador`, 'SUCCESS');
    log(`Backup criado em: ${backupFile}`, 'SUCCESS');
    
    return {
      success: true,
      message: 'Migração concluída com sucesso',
      backupFile,
      migratedUser: {
        id: finalUser.id,
        email: finalUser.email,
        tipo: finalUser.tipo,
        dataMigracao: finalUser.migracaoAdmin.dataMigracao
      }
    };
    
  } catch (error) {
    log(`ERRO CRÍTICO NA MIGRAÇÃO: ${error.message}`, 'ERROR');
    
    // Em caso de erro, o backup ainda existe para recuperação manual
    if (backupFile) {
      log(`Backup disponível para recuperação: ${backupFile}`, 'WARNING');
    }
    
    return {
      success: false,
      message: error.message,
      backupFile
    };
  }
}

// Função para verificar integridade após migração
function verifyMigrationIntegrity(targetEmail) {
  try {
    log('Verificando integridade da migração...', 'INFO');
    
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const user = database.usuarios.find(u => u.email === targetEmail);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    const checks = [
      { name: 'Tipo admin', test: user.tipo === 'admin' },
      { name: 'Status ativo', test: user.ativo === true },
      { name: 'Status verificado', test: user.verificado === true },
      { name: 'Metadata de migração', test: !!user.migracaoAdmin },
      { name: 'Configurações existem', test: !!user.configuracoes }
    ];
    
    const failedChecks = checks.filter(check => !check.test);
    
    if (failedChecks.length > 0) {
      throw new Error(`Falhas na verificação: ${failedChecks.map(f => f.name).join(', ')}`);
    }
    
    log('Verificação de integridade: TODOS OS TESTES PASSARAM', 'SUCCESS');
    return { success: true, checks };
    
  } catch (error) {
    log(`Falha na verificação de integridade: ${error.message}`, 'ERROR');
    return { success: false, message: error.message };
  }
}

// Função para criar relatório detalhado
function generateMigrationReport(result, sourceEmail, targetEmail) {
  const report = {
    timestamp: new Date().toISOString(),
    sourceEmail,
    targetEmail,
    success: result.success,
    message: result.message,
    backupFile: result.backupFile,
    migratedUser: result.migratedUser,
    verification: result.success ? verifyMigrationIntegrity(targetEmail) : null
  };
  
  const reportFile = path.join(__dirname, '..', 'data', `migration-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(`Relatório de migração salvo: ${reportFile}`, 'SUCCESS');
  return reportFile;
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log(`\n${colors.cyan}Uso: node migrateAdminPrivileges.js <email-admin-origem> <email-usuario-destino>${colors.reset}\n`);
    console.log(`Exemplo: node migrateAdminPrivileges.js admin@admin.com diogo.grunge@gmail.com\n`);
    process.exit(1);
  }
  
  const [sourceEmail, targetEmail] = args;
  
  try {
    // Executar migração
    const result = await migrateAdminPrivileges(sourceEmail, targetEmail);
    
    // Gerar relatório
    const reportFile = generateMigrationReport(result, sourceEmail, targetEmail);
    
    if (result.success) {
      log(`\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!`, 'SUCCESS');
      log(`📋 Relatório salvo em: ${reportFile}`, 'INFO');
      log(`💾 Backup criado em: ${result.backupFile}`, 'INFO');
      log(`\n🎯 O usuário ${targetEmail} agora possui privilégios de administrador!`, 'SUCCESS');
    } else {
      log(`\n❌ MIGRAÇÃO FALHOU!`, 'ERROR');
      log(`📋 Relatório salvo em: ${reportFile}`, 'INFO');
      if (result.backupFile) {
        log(`💾 Backup disponível para recuperação: ${result.backupFile}`, 'WARNING');
      }
      process.exit(1);
    }
    
  } catch (error) {
    log(`Erro crítico: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

// Exportar funções para testes
module.exports = {
  migrateAdminPrivileges,
  verifyMigrationIntegrity,
  createBackup,
  copyAdminData,
  validateUser
};