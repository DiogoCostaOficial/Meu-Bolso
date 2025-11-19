// Script para debugar o frontend no navegador
(function() {
    console.log('🔍 DEBUG DO DASHBOARD - EXECUTADO NO NAVEGADOR');
    console.log('=================================================');
    
    // 1. Verificar localStorage
    console.log('\n📦 CONTEÚDO DO LOCALSTORAGE:');
    console.log('===========================');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    }
    
    // 2. Verificar se usuário está logado
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('\n🔐 STATUS DE LOGIN:');
    console.log('===================');
    console.log(`   Token presente: ${token ? 'SIM' : 'NÃO'}`);
    console.log(`   Usuário presente: ${usuario ? 'SIM' : 'NÃO'}`);
    
    if (token) {
        console.log(`   Token (primeiros 30 chars): ${token.substring(0, 30)}...`);
    }
    
    if (usuario) {
        try {
            const userData = JSON.parse(usuario);
            console.log(`   Nome: ${userData.nome || 'N/A'}`);
            console.log(`   Email: ${userData.email || 'N/A'}`);
        } catch (e) {
            console.log('   Erro ao parsear usuário:', e.message);
        }
    }
    
    // 3. Verificar se está na página de login ou dashboard
    console.log('\n📍 LOCALIZAÇÃO ATUAL:');
    console.log('=====================');
    console.log(`   URL: ${window.location.href}`);
    console.log(`   Path: ${window.location.pathname}`);
    
    // 4. Verificar erros de rede
    console.log('\n🌐 MONITORANDO REQUISIÇÕES:');
    console.log('===========================');
    
    // Interceptar requisições axios se disponível
    if (window.axios) {
        window.axios.interceptors.request.use(
            (config) => {
                console.log(`📤 Requisição: ${config.method?.toUpperCase()} ${config.url}`);
                if (config.headers.Authorization) {
                    console.log(`   Authorization presente: SIM`);
                } else {
                    console.log(`   Authorization presente: NÃO`);
                }
                return config;
            },
            (error) => {
                console.log('❌ Erro na requisição:', error.message);
                return Promise.reject(error);
            }
        );
        
        window.axios.interceptors.response.use(
            (response) => {
                console.log(`📥 Resposta: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.log(`❌ Erro na resposta: ${error.response?.status} ${error.response?.config?.url}`);
                console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
                return Promise.reject(error);
            }
        );
        console.log('✅ Interceptores axios configurados');
    } else {
        console.log('⚠️ Axios não encontrado');
    }
    
    // 5. Verificar se há elementos do dashboard na página
    setTimeout(() => {
        console.log('\n📊 ELEMENTOS DO DASHBOARD:');
        console.log('==========================');
        
        const cards = document.querySelectorAll('[class*="bg-white"]');
        console.log(`   Cards encontrados: ${cards.length}`);
        
        const valores = document.querySelectorAll('[class*="text-2xl"]');
        console.log(`   Valores encontrados: ${valores.length}`);
        valores.forEach((valor, i) => {
            console.log(`   Valor ${i + 1}: "${valor.textContent.trim()}"`);
        });
        
        // 6. Forçar atualização do dashboard se possível
        if (window.React) {
            console.log('✅ React detectado');
        }
        
        console.log('\n✅ Debug do dashboard concluído!');
        console.log('\n💡 DICAS:');
        console.log('   - Verifique o console (F12) para ver os logs');
        console.log('   - Verifique a aba Network para ver as requisições');
        console.log('   - Verifique a aba Application > Local Storage');
    }, 2000);
})();