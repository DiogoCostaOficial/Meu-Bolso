// Script para executar no console do navegador
(function() {
    console.log('🔍 VERIFICAÇÃO DE LOGIN NO NAVEGADOR');
    console.log('======================================');
    
    // 1. Verificar localStorage
    console.log('\n📦 CONTEÚDO DO LOCALSTORAGE:');
    console.log('===========================');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    }
    
    // 2. Verificar status de autenticação
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const usuario = localStorage.getItem('usuario');
    const session = localStorage.getItem('SESSION');
    
    console.log('\n🔐 STATUS DE LOGIN:');
    console.log('===================');
    console.log(`   Token presente: ${token ? 'SIM' : 'NÃO'}`);
    console.log(`   User presente: ${user ? 'SIM' : 'NÃO'}`);
    console.log(`   Usuario presente: ${usuario ? 'SIM' : 'NÃO'}`);
    console.log(`   Session presente: ${session ? 'SIM' : 'NÃO'}`);
    
    // 3. Verificar rota atual
    console.log('\n📍 LOCALIZAÇÃO ATUAL:');
    console.log('=====================');
    console.log(`   URL: ${window.location.href}`);
    console.log(`   Path: ${window.location.pathname}`);
    
    // 4. Verificar se está na página de login
    const isLoginPage = window.location.pathname.includes('login');
    console.log(`   Página de login: ${isLoginPage ? 'SIM' : 'NÃO'}`);
    
    // 5. Forçar login se necessário (para teste)
    if (!token && !isLoginPage) {
        console.log('\n⚠️ USUÁRIO NÃO ESTÁ LOGADO!');
        console.log('Redirecionando para login...');
        
        // Salvar token e user para teste
        localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTc2MzE2MjE2MDk2NCIsIm5vbWUiOiJEaW9nbyIsImVtYWlsIjoiZGlvZ28uZ3J1bmdlQGdtYWlsLmNvbSIsInNlbmhhIjoiJDJhJDEwJHNOa1h0Y0tkLldqbXlNR2xsbGMuVnVKZGUwQ3loS1dWOUhZVTFGTHhsL1pwYVB2Wml0b055IiwidGlwbyI6InVzdWFyaW8iLCJhdGl2byI6dHJ1ZSwicHJpbWVpcm9BY2Vzc28iOmZhbHNlLCJ2ZXJpZmljYWRvIjp0cnVlLCJvdHBDb2RpZ28iOm51bGwsIm90cEV4cGlyYSI6bnVsbCwiZGF0YUNyaWFjYW8iOiIyMDI1LTExLTE0VDIzOjE2OjAwLjk2NFoiLCJ1bHRpbW9BY2Nlc3NvIjoiMjAyNS0xMS0xNlQwMjozMDo0Mi4yMzdaIiwiaWF0IjoxNzYzMjU5NjQyLCJleHAiOjE3NjM4NjQ0NDJ9.your_token_here');
        localStorage.setItem('user', JSON.stringify({
            "id": "user-1763162160964",
            "nome": "Diogo",
            "email": "diogo.grunge@gmail.com",
            "tipo": "usuario",
            "primeiroAcesso": false
        }));
        
        console.log('✅ Token e usuário salvos no localStorage');
        console.log('🔄 Recarregando página...');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        console.log('\n✅ USUÁRIO ESTÁ LOGADO!');
        console.log('O dashboard deve estar carregando os dados...');
    }
    
    // 6. Verificar dashboard
    setTimeout(() => {
        console.log('\n📊 VERIFICAÇÃO DO DASHBOARD:');
        console.log('============================');
        
        // Verificar se há elementos visíveis
        const cards = document.querySelectorAll('[class*="bg-white"]');
        console.log(`   Cards visíveis: ${cards.length}`);
        
        const valores = document.querySelectorAll('[class*="text-2xl"]');
        console.log(`   Valores visíveis: ${valores.length}`);
        
        if (valores.length > 0) {
            valores.forEach((valor, i) => {
                console.log(`   Valor ${i + 1}: "${valor.textContent.trim()}"`);
            });
        } else {
            console.log('   ❌ Nenhum valor encontrado no dashboard');
        }
        
        // Verificar se há mensagem de erro
        const erros = document.querySelectorAll('[class*="error"], [class*="erro"]');
        console.log(`   Mensagens de erro: ${erros.length}`);
        
        if (erros.length > 0) {
            erros.forEach((erro, i) => {
                console.log(`   Erro ${i + 1}: "${erro.textContent.trim()}"`);
            });
        }
        
    }, 3000);
    
    console.log('\n✅ Verificação concluída!');
})();