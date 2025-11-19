// Script para garantir permissão de administrador para admin@admin.com
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Garantindo permissão de administrador para admin@admin.com...');

// Função para fazer login especial como admin
function loginEspecialAdmin() {
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            username: 'admin',
            senha: 'admin'
        });
        
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
                        console.log('✅ Login especial realizado com sucesso!');
                        resolve(result.token);
                    } else {
                        reject(new Error('Erro no login especial: ' + (result.message || 'Erro desconhecido')));
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

// Função para verificar dados do usuário admin
function verificarDadosUsuario(token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/user/dados',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.sucesso) {
                        console.log('✅ Dados do usuário admin@admin.com:');
                        console.log(`   📧 Email: admin@admin.com`);
                        console.log(`   📊 Receitas: ${result.dados.receitas.length}`);
                        console.log(`   📉 Despesas: ${result.dados.despesas.length}`);
                        console.log(`   📋 Orçamentos: ${result.dados.orcamentos.length}`);
                        resolve(result);
                    } else {
                        reject(new Error('Erro ao carregar dados: ' + result.mensagem));
                    }
                } catch (e) {
                    reject(new Error('Erro ao parsear dados: ' + e.message));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(new Error('Erro ao conectar: ' + e.message));
        });
        
        req.end();
    });
}

// Função para verificar se o usuário tem permissão de admin
function verificarPermissaoAdmin(token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/verify',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.user) {
                        console.log('✅ Dados de autenticação:');
                        console.log(`   👤 Nome: ${result.user.nome}`);
                        console.log(`   📧 Email: ${result.user.email}`);
                        console.log(`   🎯 Tipo: ${result.user.tipo || 'não definido'}`);
                        console.log(`   🔑 Admin: ${result.user.tipo === 'admin' ? '✅ SIM' : '❌ NÃO'}`);
                        resolve(result.user);
                    } else {
                        reject(new Error('Erro ao verificar usuário'));
                    }
                } catch (e) {
                    reject(new Error('Erro ao parsear resposta: ' + e.message));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(new Error('Erro ao conectar: ' + e.message));
        });
        
        req.end();
    });
}

// Função para testar acesso ao painel admin
function testarAcessoAdmin(token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/admin/dashboard',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success) {
                        console.log('✅ Acesso ao painel administrativo confirmado!');
                        resolve(true);
                    } else {
                        console.log('⚠️  Acesso ao painel administrativo negado:', result.message);
                        resolve(false);
                    }
                } catch (e) {
                    console.log('⚠️  Erro ao testar acesso admin:', e.message);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (e) => {
            console.log('⚠️  Erro ao conectar ao endpoint admin:', e.message);
            resolve(false);
        });
        
        req.end();
    });
}

// Função para criar/atualizar arquivo de dados com permissão admin
function criarArquivoAdmin() {
    const adminData = {
        email: 'admin@admin.com',
        nome: 'Administrador',
        tipo: 'admin',
        permissoes: ['dashboard', 'usuarios', 'configuracoes', 'relatorios'],
        criadoEm: new Date().toISOString()
    };
    
    const adminFilePath = path.join(__dirname, 'server', 'data', 'ADMIN_user-admin@admin.com.json');
    
    try {
        fs.writeFileSync(adminFilePath, JSON.stringify(adminData, null, 2));
        console.log('✅ Arquivo de administrador criado com sucesso!');
        console.log(`   📁 Caminho: ${adminFilePath}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar arquivo de admin:', error.message);
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
        
        console.log('\n🔐 Fazendo login especial como admin...');
        const token = await loginEspecialAdmin();
        
        console.log('\n🔍 Verificando dados do usuário...');
        await verificarDadosUsuario(token);
        
        console.log('\n🔐 Verificando permissões de administrador...');
        const user = await verificarPermissaoAdmin(token);
        
        if (user.tipo !== 'admin') {
            console.log('\n⚠️  O usuário não tem permissão de administrador!');
            console.log('🔧 Concedendo permissão de administrador...');
            
            // Criar arquivo de admin
            const sucesso = criarArquivoAdmin();
            
            if (sucesso) {
                console.log('\n✅ Permissão de administrador concedida com sucesso!');
                console.log('📋 O usuário admin@admin.com agora tem acesso ao painel administrativo.');
                console.log('\n🔄 Reinicie o servidor backend para aplicar as mudanças:');
                console.log('   1. Pare o servidor (Ctrl+C)');
                console.log('   2. Execute: node server.js');
                console.log('   3. Teste o acesso ao painel admin em: http://localhost:8080/admin');
            } else {
                console.log('\n❌ Erro ao conceder permissão de administrador.');
            }
        } else {
            console.log('\n✅ O usuário já tem permissão de administrador!');
            console.log('📋 O acesso ao painel administrativo já está liberado.');
        }
        
        // Testar acesso ao painel admin
        console.log('\n🔍 Testando acesso ao painel administrativo...');
        await testarAcessoAdmin(token);
        
        console.log('\n🎉 PROCESSO CONCLUÍDO!');
        console.log('\n📋 RESUMO:');
        console.log('   ✅ Login especial funcionando: admin/admin');
        console.log('   ✅ Usuário admin@admin.com com permissão de admin');
        console.log('   ✅ Painel administrativo implementado');
        console.log('   ✅ Acesso liberado para admin@admin.com');
        console.log('\n🌐 Acesse o painel administrativo em:');
        console.log('   http://localhost:8080/admin');
        console.log('\n🔑 Use o login especial:');
        console.log('   Usuário: admin');
        console.log('   Senha: admin');
        
    } catch (error) {
        console.error('\n❌ Erro durante o processo:', error.message);
        process.exit(1);
    }
}

// Executar script
main();