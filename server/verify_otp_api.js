const axios = require('axios');

async function verifyOtp() {
    try {
        console.log('🚀 Enviando solicitação de OTP...');
        const response = await axios.post('http://localhost:5000/api/auth/recuperar-senha', {
            email: 'diogo.grunge@gmail.com'
        });

        console.log('✅ Status:', response.status);
        console.log('📦 Resposta:', response.data);
    } catch (error) {
        console.error('❌ Erro:', error.response ? error.response.data : error.message);
    }
}

verifyOtp();
