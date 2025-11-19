const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.json');
const backupPath = path.join(__dirname, `../data/database.backup.${Date.now()}.json`);

const raw = fs.readFileSync(dbPath, 'utf8');
fs.writeFileSync(backupPath, raw);

const data = JSON.parse(raw);
const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
const filtrados = usuarios.filter(u => u.tipo === 'admin' || u.email === 'admin@admin.com');
data.usuarios = filtrados;

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log(`Usuarios removidos: ${usuarios.length - filtrados.length}`);
console.log(`Usuarios restantes: ${filtrados.length}`);