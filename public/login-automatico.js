// Script para testar login automático no navegador
(function() {
    console.log('🚀 TESTE DE LOGIN AUTOMÁTICO');
    console.log('=================================');
    
    // Verificar se já está logado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        console.log('✅ Usuário já está logado!');
        console.log('🔄 Redirecionando para dashboard...');
        window.location.href = '/dashboard';
        return;
    }
    
    console.log('🔐 Realizando login automático...');
    
    // Função para fazer login
    async function fazerLogin() {
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'diogo.grunge@gmail.com',
                    senha: 'diogo123'
                })
            });
            
            const data = await response.json();
            
            if (data.success || data.token) {
                console.log('✅ Login realizado com sucesso!');
                
                // Salvar no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('📋 Dados salvos:');
                console.log(`   Token: ${data.token.substring(0, 30)}...`);
                console.log(`   Usuário: ${data.user.nome}`);
                console.log(`   Email: ${data.user.email}`);
                
                console.log('🔄 Redirecionando para dashboard...');
                window.location.href = '/dashboard';
                
            } else {
                console.error('❌ Erro no login:', data.message || 'Erro desconhecido');
            }
            
        } catch (error) {
            console.error('❌ Erro de conexão:', error.message);
        }
    }
    
    // Executar login
    fazerLogin();
})();