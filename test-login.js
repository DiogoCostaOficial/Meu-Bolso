import axios from 'axios';

async function testLogin() {
  try {
    console.log('🧪 Testando login do usuário diogo.grunge@gmail.com...');
    console.log('📧 Email: diogo.grunge@gmail.com');
    console.log('🔑 Senha: diogo123');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'diogo.grunge@gmail.com',
      senha: 'diogo123'
    }, {
      timeout: 5000,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Aceita qualquer status para análise
      }
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📄 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('✅ Login bem-sucedido!');
      console.log('🔑 Token recebido:', response.data.token.substring(0, 20) + '...');
      
      // Testar token
      console.log('\n🧪 Testando token...');
      const userResponse = await axios.get('http://localhost:3001/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ Token válido!');
      console.log('👤 Dados do usuário:', userResponse.data);
      
    } else if (response.data.erro) {
      console.log('❌ Erro no login:', response.data.erro);
    } else {
      console.log('⚠️  Resposta inesperada:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:');
    if (error.code === 'ECONNREFUSED') {
      console.error('📄 Servidor não está respondendo na porta 3001');
    } else if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Mensagem:', error.response.data);
    } else if (error.request) {
      console.error('📄 Nenhuma resposta do servidor');
      console.error('📄 Request:', error.request);
    } else {
      console.error('📄 Erro:', error.message);
    }
  }
}

// Testar conexão com o servidor primeiro
async function testConnection() {
  try {
    console.log('🌐 Testando conexão com o servidor...');
    const response = await axios.get('http://localhost:3001/api/health', {
      timeout: 3000,
      validateStatus: function (status) {
        return true; // Aceita qualquer status
      }
    });
    console.log('✅ Servidor está respondendo!');
    console.log('📊 Status:', response.status);
    
    // Agora testar o login
    await testLogin();
    
  } catch (error) {
    console.error('❌ Servidor não está respondendo:');
    console.error('📄 Erro:', error.message);
    console.error('💡 Verifique se o servidor está rodando em http://localhost:3001');
  }
}

testConnection();