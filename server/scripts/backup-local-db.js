// server/scripts/backup-local-db.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const backupDir = path.join(dataDir, 'backups');

// Garantir que a pasta de backup exista
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Criar timestamp para a pasta de backup específica
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const currentBackupFolder = path.join(backupDir, `backup_${timestamp}`);
fs.mkdirSync(currentBackupFolder);

console.log(`Iniciando backup em: ${currentBackupFolder}`);

try {
    const files = fs.readdirSync(dataDir);
    let copiedCount = 0;

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        const stat = fs.statSync(filePath);

        // Copiar apenas arquivos JSON diretos na pasta data
        if (stat.isFile() && file.endsWith('.json')) {
            const destPath = path.join(currentBackupFolder, file);
            fs.copyFileSync(filePath, destPath);
            console.log(`✅ Copiado: ${file}`);
            copiedCount++;
        }
    });

    console.log(`\n🎉 Backup concluído! ${copiedCount} arquivos salvos com sucesso.`);
    console.log(`📁 Localização do backup: ${currentBackupFolder}`);
} catch (error) {
    console.error('Erro ao realizar o backup:', error);
}
