// Quick test to check authentication status
const token = localStorage.getItem('token');
const usuario = localStorage.getItem('usuario');

console.log('=== STATUS DE AUTENTICAÇÃO ===');
console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
console.log('Usuario:', usuario ? '✅ Presente' : '❌ Ausente');

if (token && usuario) {
    try {
        const userData = JSON.parse(usuario);
        console.log('Dados do usuário:', userData);
        console.log('Email:', userData.email);
        console.log('ID:', userData.id);
    } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
    }
} else {
    console.log('Usuário não autenticado');
}

// Test API call
if (token) {
    console.log('=== TESTANDO API ===');
    fetch('http://localhost:3001/api/user/dados', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ API Response:', data);
        if (data.dados) {
            console.log('Receitas:', data.dados.receitas?.length || 0);
            console.log('Despesas:', data.dados.despesas?.length || 0);
        }
    })
    .catch(error => {
        console.error('❌ API Error:', error);
    });
}