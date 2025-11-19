// server/scripts/rollbackMigration.js
// Script para reverter migração de privilégios de administrador
// Autor: Sistema de Rollback - Finanças Fácil

const fs = require('fs');
const path = require('path');

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

const DATABASE_FILE = path.join(__dirname, '..', 'data', 'database.json');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  const colorMap = {
    'INFO': colors.cyan,
    'SUCCESS': colors.green,
    'WARNING': colors.yellow,
    'ERROR': colors.red,
    'ROLLBACK': colors.magenta
  };
  
  console.log(`${colorMap[level] || colors.reset}${logEntry}${colors.reset}`);
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      log('Nenhum backup encontrado', 'WARNING');
      return [];
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    return files.map(file => ({
      filename: file,
      fullPath: path.join(BACKUP_DIR, file),
      created: fs.statSync(path.join(BACKUP_DIR, file)).birthtime
    }));
  } catch (error) {
    log(`Erro ao listar backups: ${error.message}`, 'ERROR');
    return [];
  }
}

function restoreFromBackup(backupFile) {
  try {
    log('=== INICIANDO ROLLBACK ===', 'ROLLBACK');
    log(`Restaurando do backup: ${backupFile}`, 'INFO');
    
    // Verificar se o backup existe
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup não encontrado: ${backupFile}`);
    }
    
    // Ler backup
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    // Validar estrutura do backup
    if (!backupData.usuarios || !Array.isArray(backupData.usuarios)) {
      throw new Error('Estrutura inválida no arquivo de backup');
    }
    
    // Criar backup atual antes de restaurar
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const currentBackupFile = path.join(BACKUP_DIR, `pre-rollback-${timestamp}.json`);
    const currentData = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    fs.writeFileSync(currentBackupFile, JSON.stringify(currentData, null, 2));
    
    log(`Backup atual criado: ${currentBackupFile}`, 'SUCCESS');
    
    // Restaurar dados
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(backupData, null, 2));
    
    log('=== ROLLBACK CONCLUÍDO COM SUCESSO ===', 'SUCCESS');
    log(`Database restaurado com sucesso`, 'SUCCESS');
    log(`Backup pré-rollback salvo: ${currentBackupFile}`, 'INFO');
    
    return {
      success: true,
      message: 'Rollback concluído com sucesso',
      backupFile,
      preRollbackBackup: currentBackupFile
    };
    
  } catch (error) {
    log(`Erro durante rollback: ${error.message}`, 'ERROR');
    return {
      success: false,
      message: error.message
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Listar backups disponíveis
    log('Backups disponíveis:', 'INFO');
    const backups = listBackups();
    
    if (backups.length === 0) {
      log('Nenhum backup encontrado para rollback', 'WARNING');
      return;
    }
    
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.filename} (${backup.created.toLocaleString()})`);
    });
    
    console.log(`\nUso: node rollbackMigration.js <número-do-backup>`);
    console.log(`Ou: node rollbackMigration.js <caminho-completo-do-backup>`);
    return;
  }
  
  const arg = args[0];
  let backupFile;
  
  if (arg.match(/^\d+$/)) {
    // Selecionar por número
    const backups = listBackups();
    const index = parseInt(arg) - 1;
    
    if (index < 0 || index >= backups.length) {
      log(`Número de backup inválido: ${arg}`, 'ERROR');
      return;
    }
    
    backupFile = backups[index].fullPath;
  } else if (fs.existsSync(arg)) {
    // Caminho completo fornecido
    backupFile = arg;
  } else {
    log(`Arquivo de backup não encontrado: ${arg}`, 'ERROR');
    return;
  }
  
  // Executar rollback
  const result = restoreFromBackup(backupFile);
  
  if (result.success) {
    console.log(`\n✅ Rollback concluído com sucesso!`);
  } else {
    console.log(`\n❌ Rollback falhou: ${result.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  restoreFromBackup,
  listBackups
};