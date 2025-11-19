// Script para verificar e corrigir senha do admin
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando credenciais do administrador...');

// Função para testar diferentes senhas do admin
function testarSenhaAdmin(email, senha) {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({ email, senha });
        
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success || result.token) {
                        resolve({ sucesso: true, token: result.token, senha: senha });
                    } else {
                        resolve({ sucesso: false, mensagem: result.message, senha: senha });
                    }
                } catch (e) {
                    reject(new Error('Erro ao parsear resposta: ' + e.message));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(new Error('Erro ao conectar ao backend: ' + e.message));
        });
        
        req.write(loginData);
        req.end();
    });
}

// Função para verificar usuários existentes no sistema
function verificarUsuariosExistentes() {
    const dataDir = path.join(__dirname, 'server', 'data');
    const usuarios = [];
    
    try {
        const files = fs.readdirSync(dataDir);
        files.forEach(file => {
            if (file.startsWith('USER_DATA_') && file.endsWith('.json')) {
                try {
                    const filePath = path.join(dataDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);
                    
                    // Procurar por informações de usuário
                    if (data.usuario || data.user) {
                        const userInfo = data.usuario || data.user;
                        usuarios.push({
                            arquivo: file,
                            email: userInfo.email || 'desconhecido',
                            nome: userInfo.nome || userInfo.name || 'desconhecido',
                            tipo: userInfo.tipo || userInfo.type || 'não definido'
                        });
                    }
                } catch (e) {
                    console.log(`⚠️  Erro ao ler arquivo ${file}: ${e.message}`);
                }
            }
        });
    } catch (e) {
        console.log(`⚠️  Erro ao acessar diretório de dados: ${e.message}`);
    }
    
    return usuarios;
}

// Função para criar usuário admin padrão
function criarUsuarioAdminPadrao() {
    const adminData = {
        usuario: {
            email: 'admin@admin.com',
            nome: 'Administrador',
            senha: 'admin123', // senha padrão
            tipo: 'admin',
            criadoEm: new Date().toISOString()
        },
        receitas: [],
        despesas: [],
        orcamentos: [],
        categorias: [
            { id: 1, nome: 'Salário', tipo: 'receita', cor: '#10b981' },
            { id: 2, nome: 'Freelance', tipo: 'receita', cor: '#3b82f6' },
            { id: 3, nome: 'Investimentos', tipo: 'receita', cor: '#8b5cf6' },
            { id: 4, nome: 'Alimentação', tipo: 'despesa', cor: '#ef4444' },
            { id: 5, nome: 'Transporte', tipo: 'despesa', cor: '#f59e0b' },
            { id: 6, nome: 'Moradia', tipo: 'despesa', cor: '#ec4899' },
            { id: 7, nome: 'Saúde', tipo: 'despesa', cor: '#06b6d4' },
            { id: 8, nome: 'Educação', tipo: 'despesa', cor: '#84cc16' }
        ]
    };
    
    const timestamp = Date.now();
    const adminFilePath = path.join(__dirname, 'server', 'data', `USER_DATA_user-${timestamp}.json`);
    
    try {
        fs.writeFileSync(adminFilePath, JSON.stringify(adminData, null, 2));
        console.log('✅ Usuário administrador criado com sucesso!');
        console.log(`   📁 Arquivo: ${path.basename(adminFilePath)}`);
        console.log(`   📧 Email: admin@admin.com`);
        console.log(`   🔑 Senha: admin123`);
        console.log(`   🎯 Tipo: admin`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error.message);
        return false;
    }
}

// Script principal
async function main() {
    try {
        console.log('\n🔍 Verificando backend na porta 3001...');
        
        // Testar se o backend está rodando
        await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3001,
                path: '/api/health',
                method: 'GET'
            }, (res) => {
                console.log('✅ Backend está rodando!');
                resolve();
            });
            
            req.on('error', (e) => {
                console.error('❌ Backend não está rodando na porta 3001');
                console.log('\n🔧 INSTRUÇÕES PARA INICIAR O BACKEND:');
                console.log('   1. Abra um novo terminal');
                console.log('   2. Navegue até a pasta server: cd server');
                console.log('   3. Execute: node server.js');
                console.log('   4. Aguarde o servidor iniciar');
                console.log('   5. Execute este script novamente');
                reject(e);
            });
            
            req.end();
        });
        
        console.log('\n👥 Verificando usuários existentes...');
        const usuarios = verificarUsuariosExistentes();
        
        if (usuarios.length > 0) {
            console.log('✅ Usuários encontrados:');
            usuarios.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.nome} (${user.email}) - Tipo: ${user.tipo}`);
            });
        } else {
            console.log('⚠️  Nenhum usuário encontrado');
        }
        
        // Verificar se já existe admin
        const adminExistente = usuarios.find(u => u.email === 'admin@admin.com');
        
        if (adminExistente) {
            console.log(`\n✅ Administrador encontrado: ${adminExistente.nome}`);
            console.log(`   📧 Email: ${adminExistente.email}`);
            console.log(`   🎯 Tipo: ${adminExistente.tipo}`);
            
            // Testar senha do admin
            console.log('\n🔐 Testando senha do administrador...');
            const senhasParaTestar = ['admin123', 'admin', '123456', 'admin@123', 'Admin123'];
            
            for (const senha of senhasParaTestar) {
                console.log(`   Testando senha: ${senha}`);
                const resultado = await testarSenhaAdmin('admin@admin.com', senha);
                
                if (resultado.sucesso) {
                    console.log(`   ✅ ✅ SENHA CORRETA ENCONTRADA: ${senha}`);
                    console.log('\n🎉 CREDENCIAIS DO ADMINISTRADOR:');
                    console.log(`   📧 Email: admin@admin.com`);
                    console.log(`   🔑 Senha: ${senha}`);
                    console.log(`   🎯 Tipo: ${adminExistente.tipo}`);
                    
                    if (adminExistente.tipo !== 'admin') {
                        console.log('\n⚠️  ATENÇÃO: O usuário não tem permissão de administrador!');
                        console.log('🔧 Execute o script "concede-admin-permission.js" com a senha correta.');
                    }
                    
                    console.log('\n✅ Teste concluído com sucesso!');
                    return;
                } else {
                    console.log(`   ❌ Senha incorreta: ${resultado.mensagem}`);
                }
            }
            
            console.log('\n❌ Nenhuma das senhas testadas funcionou.');
            console.log('🔧 Sugestões de senhas para tentar:');
            console.log('   - Verifique no banco de dados ou arquivos de configuração');
            console.log('   - Crie um novo usuário administrador');
            
        } else {
            console.log('\n⚠️  Administrador não encontrado!');
            console.log('🔧 Criando usuário administrador padrão...');
            
            const sucesso = criarUsuarioAdminPadrao();
            
            if (sucesso) {
                console.log('\n✅ Administrador criado com sucesso!');
                console.log('📋 Use as seguintes credenciais para login:');
                console.log('   📧 Email: admin@admin.com');
                console.log('   🔑 Senha: admin123');
                console.log('   🎯 Tipo: admin');
                console.log('\n🔄 Reinicie o servidor backend e teste o login!');
            } else {
                console.log('\n❌ Erro ao criar administrador.');
            }
        }
        
        console.log('\n🎉 PROCESSO CONCLUÍDO!');
        
    } catch (error) {
        console.error('\n❌ Erro durante o processo:', error.message);
        process.exit(1);
    }
}

// Executar script
main();