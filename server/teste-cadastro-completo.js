// Teste completo de cadastro com OTP
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarCadastroCompleto() {
  console.log('🧪 Iniciando teste completo de cadastro com OTP...\n');
  
  const dadosTeste = {
    nome: 'Usuário Teste',
    email: 'financasfacil10@gmail.com', // usando seu e-mail para teste
    senha: 'teste123'
  };
  
  try {
    // Passo 1: Cadastrar usuário
    console.log('📋 Passo 1: Cadastrando usuário...');
    console.log('Dados:', dadosTeste);
    
    const responseCadastro = await axios.post(`${API_URL}/auth/registrar`, dadosTeste);
    
    console.log('✅ Cadastro realizado com sucesso!');
    console.log('Resposta:', responseCadastro.data);
    console.log('');
    
    // Passo 2: Verificar se o e-mail foi enviado (aguardar 3 segundos)
    console.log('📧 Passo 2: Aguardando envio do e-mail OTP...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ E-mail OTP deveria ter sido enviado!');
    console.log('');
    
    // Passo 3: Simular validação de OTP (você precisa verificar o e-mail real)
    console.log('🔐 Passo 3: Testando validação de OTP...');
    console.log('⚠️  Você precisa verificar o e-mail e pegar o código OTP real');
    
    // Como não podemos pegar o código do e-mail automaticamente, 
    // vamos apenas verificar se a API de validação está funcionando
    const otpTeste = '000000'; // código inválido para teste
    
    try {
      const responseValidacao = await axios.post(`${API_URL}/auth/validar-otp`, {
        email: dadosTeste.email,
        codigo: otpTeste
      });
      
      console.log('✅ API de validação respondeu:', responseValidacao.data);
    } catch (error) {
      if (error.response?.data?.message === 'Código OTP inválido') {
        console.log('✅ API de validação está funcionando (código inválido rejeitado)');
      } else {
        console.log('❌ Erro na validação:', error.response?.data || error.message);
      }
    }
    
    console.log('\n🎉 Teste completo finalizado!');
    console.log('💡 Verifique seu e-mail financasfacil10@gmail.com para ver o código OTP');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:');
    console.error('Erro completo:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('E-mail já cadastrado')) {
      console.log('\n💡 O e-mail já está cadastrado. Testando login...');
      testarLoginExistente(dadosTeste.email, dadosTeste.senha);
    }
  }
}

async function testarLoginExistente(email, senha) {
  try {
    console.log('🔑 Testando login com usuário existente...');
    
    const responseLogin = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      senha: senha
    });
    
    console.log('✅ Login realizado com sucesso!');
    console.log('Resposta:', responseLogin.data);
    
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('Conta não verificada')) {
      console.log('\n💡 A conta existe mas não está verificada.');
      console.log('🔄 Testando reenvio de OTP...');
      
      try {
        const responseReenvio = await axios.post(`${API_URL}/auth/reenviar-otp`, {
          email: email
        });
        
        console.log('✅ OTP reenviado com sucesso!');
        console.log('Resposta:', responseReenvio.data);
        console.log('\n📧 Verifique seu e-mail para o novo código OTP');
        
      } catch (errorReenvio) {
        console.log('❌ Erro ao reenviar OTP:', errorReenvio.response?.data || errorReenvio.message);
      }
    }
  }
}

// Executa o teste
testarCadastroCompleto().catch(console.error);