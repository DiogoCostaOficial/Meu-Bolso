// Script para debugar o sistema completo de autenticação e dashboard
(function() {
    console.clear();
    console.log('🔍 DEBUG COMPLETO DO SISTEMA');
    console.log('=============================');
    
    // 1. Verificar autenticação atual
    console.log('\n1️⃣ VERIFICANDO AUTENTICAÇÃO ATUAL:');
    console.log('===================================');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log(`📍 URL atual: ${window.location.href}`);
    console.log(`🔑 Token: ${token ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    console.log(`👤 User: ${user ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    
    if (token) {
        console.log(`   Token preview: ${token.substring(0, 30)}...`);
    }
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log(`   User data: ${userData.nome} (${userData.email})`);
        } catch (e) {
            console.log(`   Erro ao parsear user: ${e.message}`);
        }
    }
    
    // 2. Verificar se está na página correta
    console.log('\n2️⃣ VERIFICANDO LOCALIZAÇÃO:');
    console.log('=============================');
    console.log(`📍 Path: ${window.location.pathname}`);
    console.log(`🔍 Search: ${window.location.search}`);
    console.log(`#️⃣ Hash: ${window.location.hash}`);
    
    // 3. Interceptar requisições para ver redirecionamentos
    console.log('\n3️⃣ MONITORANDO REDIRECIONAMENTOS:');
    console.log('==================================');
    
    // Guardar fetch original
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
        console.log(`📤 Fetch: ${args[0]} ${args[1]?.method || 'GET'}`);
        return originalFetch.apply(this, args).then(response => {
            console.log(`📥 Response: ${response.status} ${response.statusText}`);
            if (response.status === 401) {
                console.log('🔒 Resposta 401 - Não autorizado!');
            }
            return response;
        }).catch(error => {
            console.log(`❌ Fetch error: ${error.message}`);
            throw error;
        });
    };
    
    // 4. Verificar localStorage completo
    console.log('\n4️⃣ LOCALSTORAGE COMPLETO:');
    console.log('==========================');
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    }
    
    // 5. Testar login se necessário
    if (!token) {
        console.log('\n5️⃣ REALIZANDO LOGIN AUTOMÁTICO:');
        console.log('=================================');
        
        // Fazer login via fetch
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
                
                // Salvar no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('📋 Dados salvos:');
                console.log(`   Token: ${data.token.substring(0, 30)}...`);
                console.log(`   Usuário: ${data.user.nome}`);
                
                // Aguardar um momento e redirecionar
                setTimeout(() => {
                    console.log('🔄 Redirecionando para dashboard...');
                    window.location.href = '/dashboard';
                }, 1000);
                
            } else {
                console.error('❌ Erro no login:', data.message || 'Erro desconhecido');
            }
        })
        .catch(error => {
            console.error('❌ Erro de conexão:', error.message);
        });
        
    } else {
        console.log('\n5️⃣ USUÁRIO JÁ ESTÁ LOGADO!');
        console.log('=================================');
        console.log('✅ Token encontrado, verificando dashboard...');
        
        // Testar API com token existente
        fetch('http://localhost:3001/api/user/dados', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ API respondendo corretamente!');
                console.log(`📊 Receitas: ${data.dados.receitas.length}`);
                console.log(`📉 Despesas: ${data.dados.despesas.length}`);
                console.log(`📋 Orçamentos: ${data.dados.orcamentos.length}`);
                
                // Calcular valores
                const anoSelecionado = '2025';
                const receitas = data.dados.receitas.filter(r => {
                    const [ano] = r.data.split('-');
                    return ano === anoSelecionado;
                });
                
                const despesas = data.dados.despesas.filter(d => {
                    const [ano] = d.data.split('-');
                    return ano === anoSelecionado;
                });
                
                const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
                const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
                const saldoFinal = totalReceitas - totalDespesas;
                
                console.log('\n💰 CÁLCULOS DO DASHBOARD:');
                console.log('=========================');
                console.log(`   💸 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
                console.log(`   💳 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
                console.log(`   💵 Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
                
                // Verificar se está na página correta
                if (window.location.pathname !== '/dashboard') {
                    console.log('\n🔄 NÃO ESTÁ NA DASHBOARD! Redirecionando...');
                    window.location.href = '/dashboard';
                } else {
                    console.log('\n✅ ESTÁ NA DASHBOARD CORRETA!');
                    console.log('O dashboard deve estar exibindo os dados...');
                    
                    // Verificar elementos visíveis
                    setTimeout(() => {
                        const cards = document.querySelectorAll('[class*="bg-white"]');
                        const valores = document.querySelectorAll('[class*="text-2xl"]');
                        
                        console.log('\n👀 ELEMENTOS VISÍVEIS:');
                        console.log('=====================');
                        console.log(`   Cards encontrados: ${cards.length}`);
                        console.log(`   Valores encontrados: ${valores.length}`);
                        
                        if (valores.length > 0) {
                            valores.forEach((valor, i) => {
                                console.log(`   Valor ${i + 1}: "${valor.textContent.trim()}"`);
                            });
                        } else {
                            console.log('   ❌ Nenhum valor encontrado no dashboard');
                        }
                    }, 2000);
                }
                
            } else {
                console.error('❌ Erro na API:', data.mensagem);
            }
        })
        .catch(error => {
            console.error('❌ Erro ao testar API:', error.message);
        });
    }
    
    console.log('\n✅ Debug concluído!');
})();