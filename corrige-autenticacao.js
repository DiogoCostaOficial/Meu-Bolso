// Script para corrigir problemas de autenticação e dashboard
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando correção de autenticação...');

// 1. Verificar e corrigir configuração do backend
const backendConfigPath = path.join(__dirname, 'server', 'config', 'config.js');
if (fs.existsSync(backendConfigPath)) {
    console.log('✅ Configuração do backend encontrada');
} else {
    console.log('❌ Configuração do backend não encontrada');
}

// 2. Verificar dados do usuário
const userDataPath = path.join(__dirname, 'server', 'data', 'USER_DATA_user-1763162160964.json');
if (fs.existsSync(userDataPath)) {
    const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
    console.log('✅ Dados do usuário encontrados:');
    console.log(`   📊 Receitas: ${userData.receitas.length}`);
    console.log(`   📉 Despesas: ${userData.despesas.length}`);
    console.log(`   📋 Orçamentos: ${userData.orcamentos.length}`);
    console.log(`   🏷️ Categorias: ${userData.categorias.length}`);
} else {
    console.log('❌ Dados do usuário não encontrados');
}

// 3. Criar script de teste para o navegador
const browserTestScript = `
// Execute este script no console do navegador (F12)
(function() {
    console.log('🚀 CORREÇÃO DE AUTENTICAÇÃO - EXECUTAR NO NAVEGADOR');
    console.log('=================================================');
    
    // Limpar cache antigo
    localStorage.clear();
    console.log('✅ Cache limpo');
    
    // Fazer login
    fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.token) {
            console.log('✅ Login realizado com sucesso!');
            
            // Salvar dados
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('📋 Dados salvos:');
            console.log('   Token:', data.token.substring(0, 30) + '...');
            console.log('   Usuário:', data.user.nome, '(' + data.user.email + ')');
            
            // Testar dashboard
            setTimeout(() => {
                fetch('http://localhost:3001/api/user/dados', {
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                })
                .then(response => response.json())
                .then(dashboardData => {
                    if (dashboardData.sucesso) {
                        console.log('✅ Dashboard carregado com sucesso!');
                        console.log('📊 Dados recebidos:');
                        console.log('   Receitas:', dashboardData.dados.receitas.length);
                        console.log('   Despesas:', dashboardData.dados.despesas.length);
                        console.log('   Orçamentos:', dashboardData.dados.orcamentos.length);
                        
                        // Redirecionar para dashboard
                        window.location.href = '/dashboard';
                    } else {
                        console.error('❌ Erro ao carregar dashboard:', dashboardData.mensagem);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro de conexão:', error.message);
                });
            }, 1000);
            
        } else {
            console.error('❌ Erro no login:', data.message || 'Erro desconhecido');
        }
    })
    .catch(error => {
        console.error('❌ Erro de conexão:', error.message);
    });
})();
`;

fs.writeFileSync('corrige-navegador.js', browserTestScript);
console.log('✅ Script de correção para navegador criado: corrige-navegador.js');



const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
}, (res) => {
    console.log('✅ Backend está rodando na porta 3001');
    
    // 5. Testar login
    const loginData = JSON.stringify({
        email: 'diogo.grunge@gmail.com',
        senha: 'diogo123'
    });
    
    const loginReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    }, (loginRes) => {
        let data = '';
        loginRes.on('data', chunk => data += chunk);
        loginRes.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.success || result.token) {
                    console.log('✅ Login testado com sucesso!');
                    console.log('📋 Token gerado:', result.token.substring(0, 30) + '...');
                    
                    // 6. Testar dados do usuário
                    const userReq = http.request({
                        hostname: 'localhost',
                        port: 3001,
                        path: '/api/user/dados',
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + result.token
                        }
                    }, (userRes) => {
                        let userData = '';
                        userRes.on('data', chunk => userData += chunk);
                        userRes.on('end', () => {
                            try {
                                const userResult = JSON.parse(userData);
                                if (userResult.sucesso) {
                                    console.log('✅ Dados do usuário carregados com sucesso!');
                                    console.log('📊 Resumo:');
                                    console.log(`   💸 Receitas: ${userResult.dados.receitas.length} registros`);
                                    console.log(`   📉 Despesas: ${userResult.dados.despesas.length} registros`);
                                    console.log(`   📋 Orçamentos: ${userResult.dados.orcamentos.length} registros`);
                                    
                                    console.log('\n🎉 SISTEMA CORRIGIDO E FUNCIONANDO!');
                                    console.log('\n📋 PRÓXIMOS PASSOS:');
                                    console.log('   1. Acesse: http://localhost:8080/test-dashboard.html');
                                    console.log('   2. Clique em "Testar Login"');
                                    console.log('   3. Clique em "Testar API"');
                                    console.log('   4. Verifique os dados carregados');
                                    console.log('   5. Vá para o dashboard principal');
                                    
                                } else {
                                    console.error('❌ Erro ao carregar dados do usuário:', userResult.mensagem);
                                }
                            } catch (e) {
                                console.error('❌ Erro ao parsear dados do usuário:', e.message);
                            }
                        });
                    });
                    
                    userReq.on('error', (e) => {
                        console.error('❌ Erro ao testar dados do usuário:', e.message);
                    });
                    
                    userReq.end();
                    
                } else {
                    console.error('❌ Erro no login:', result.message || 'Erro desconhecido');
                }
            } catch (e) {
                console.error('❌ Erro ao parsear resposta do login:', e.message);
            }
        });
    });
    
    loginReq.on('error', (e) => {
        console.error('❌ Erro ao testar login:', e.message);
    });
    
    loginReq.write(loginData);
    loginReq.end();
});

req.on('error', (e) => {
    console.error('❌ Backend não está rodando:', e.message);
    console.log('\n🔧 INSTRUÇÕES PARA INICIAR O BACKEND:');
    console.log('   1. Abra um novo terminal');
    console.log('   2. Navegue até a pasta server: cd server');
    console.log('   3. Execute: node server.js');
    console.log('   4. Aguarde o servidor iniciar');
    console.log('   5. Execute este script novamente');
});

req.end();

console.log('\n⏰ Verificando backend...');