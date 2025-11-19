// Teste completo de autenticação
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Lista de usuários para teste
const usuariosTeste = [
  { email: 'admin@admin.com', senha: 'Teste@2025', tipo: 'admin' },
  { email: 'diogo.grunge@gmail.com', senha: 'Teste@2025', tipo: 'admin' },
  { email: 'teste@teste.com', senha: 'Teste@2025', tipo: 'usuario' },
  { email: 'diogo-costa@outlook.com', senha: 'Teste@2025', tipo: 'usuario' }
];

async function testarAutenticacao() {
  console.log('🔍 INICIANDO TESTE COMPLETO DE AUTENTICAÇÃO');
  console.log('='.repeat(60));
  
  let totalTestes = 0;
  let testesAprovados = 0;
  
  for (const usuario of usuariosTeste) {
    totalTestes++;
    console.log(`\n📋 Testando: ${usuario.email} (${usuario.tipo})`);
    console.log('-'.repeat(40));
    
    try {
      // Teste 1: Login
      console.log('🔄 Teste 1: Login...');
      const responseLogin = await axios.post(`${API_URL}/auth/login`, {
        email: usuario.email,
        senha: usuario.senha
      });
      
      if (responseLogin.data.success) {
        console.log('✅ Login: APROVADO');
        testesAprovados++;
        
        const token = responseLogin.data.token;
        console.log(`📄 Token recebido: ${token.substring(0, 20)}...`);
        
        // Teste 2: Verificar token
        console.log('🔄 Teste 2: Verificar token...');
        const responseVerificar = await axios.get(`${API_URL}/auth/verificar-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (responseVerificar.data.success) {
          console.log('✅ Token válido: APROVADO');
          testesAprovados++;
          
          // Teste 3: Acessar dashboard (se for admin)
          if (usuario.tipo === 'admin') {
            console.log('🔄 Teste 3: Acessar dashboard admin...');
            try {
              const responseDashboard = await axios.get(`${API_URL}/admin/estatisticas`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (responseDashboard.data.success) {
                console.log('✅ Dashboard admin: APROVADO');
                testesAprovados++;
              }
            } catch (error) {
              console.log('⚠️ Dashboard admin: NÃO DISPONÍVEL');
            }
          }
        } else {
          console.log('❌ Token inválido: REPROVADO');
        }
      } else {
        console.log('❌ Login: REPROVADO');
        console.log(`❌ Mensagem: ${responseLogin.data.message}`);
      }
      
    } catch (error) {
      console.log('❌ ERRO no teste');
      console.log(`❌ Mensagem: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        console.log('🔒 Não autorizado - credenciais inválidas');
      } else if (error.response?.status === 500) {
        console.log('🔥 Erro interno do servidor');
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RESULTADO FINAL:`);
  console.log(`✅ Testes aprovados: ${testesAprovados}/${totalTestes}`);
  console.log(`📈 Taxa de sucesso: ${((testesAprovados/totalTestes)*100).toFixed(1)}%`);
  
  if (testesAprovados === totalTestes) {
    console.log('🎉 TODOS OS TESTES APROVADOS! Sistema funcionando perfeitamente.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
  }
  
  return { totalTestes, testesAprovados };
}

// Testar conectividade com o backend
async function testarConectividade() {
  console.log('🔌 Testando conectividade com o backend...');
  try {
    const response = await axios.get('http://localhost:5000');
    console.log('✅ Backend conectado:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Backend offline ou inacessível');
    return false;
  }
}

// Executar testes
async function executarTestesCompletos() {
  console.log('🚀 INICIANDO ANÁLISE COMPLETA DE AUTENTICAÇÃO');
  console.log(new Date().toLocaleString());
  console.log('='.repeat(60));
  
  // Teste 0: Conectividade
  const backendOnline = await testarConectividade();
  if (!backendOnline) {
    console.log('❌ Backend offline. Testes cancelados.');
    return;
  }
  
  // Teste principal
  await testarAutenticacao();
  
  console.log('\n✅ Análise concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestesCompletos().catch(console.error);
}

module.exports = { testarAutenticacao, testarConectividade };