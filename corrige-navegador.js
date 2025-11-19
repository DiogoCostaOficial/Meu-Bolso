
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
