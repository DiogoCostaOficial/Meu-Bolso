// Teste de API para verificar dados do usuário diogo.grunge@gmail.com
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testarAPI() {
  try {
    console.log('🧪 Iniciando teste da API...');
    
    // 1. Fazer login para obter token
    console.log('\n1. 🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'diogo.grunge@gmail.com',
      senha: '123456' // Senha padrão que foi configurada
    });
    
    console.log('✅ Login realizado com sucesso!');
    const token = loginResponse.data.token;
    console.log('Token obtido:', token.substring(0, 50) + '...');
    
    // 2. Buscar dados do usuário
    console.log('\n2. 📊 Buscando dados do usuário...');
    const dadosResponse = await axios.get(`${API_URL}/api/user/dados`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dados obtidos com sucesso!');
    console.log('📈 Resumo dos dados:');
    console.log(`   - Receitas: ${dadosResponse.data.dados.receitas?.length || 0} registros`);
    console.log(`   - Despesas: ${dadosResponse.data.dados.despesas?.length || 0} registros`);
    console.log(`   - Categorias: ${dadosResponse.data.dados.categorias?.length || 0} registros`);
    console.log(`   - Orçamentos: ${dadosResponse.data.dados.orcamentos?.length || 0} registros`);
    
    // 3. Verificar estrutura dos dados
    console.log('\n3. 🔍 Verificando estrutura dos dados...');
    const dados = dadosResponse.data.dados;
    
    if (dados.receitas && dados.receitas.length > 0) {
      console.log('\n📋 Exemplo de receita:');
      console.log('   Primeira receita:', JSON.stringify(dados.receitas[0], null, 2));
      
      // Verificar datas das receitas
      const anosReceitas = [...new Set(dados.receitas.map(r => r.data?.split('-')[0]))];
      console.log('\n📅 Anos com receitas:', anosReceitas);
    }
    
    if (dados.despesas && dados.despesas.length > 0) {
      console.log('\n💰 Exemplo de despesa:');
      console.log('   Primeira despesa:', JSON.stringify(dados.despesas[0], null, 2));
      
      // Verificar categorias das despesas
      const categoriasDespesas = [...new Set(dados.despesas.map(d => d.categoria))];
      console.log('\n🏷️ Categorias de despesas:', categoriasDespesas);
    }
    
    // 4. Testar filtro de ano
    console.log('\n4. 🗓️ Testando filtro de ano...');
    const anoAtual = new Date().getFullYear().toString();
    console.log('Ano atual:', anoAtual);
    
    const receitasAnoAtual = dados.receitas?.filter(r => r.data?.startsWith(anoAtual)) || [];
    const despesasAnoAtual = dados.despesas?.filter(d => d.data?.startsWith(anoAtual)) || [];
    
    console.log(`Receitas em ${anoAtual}: ${receitasAnoAtual.length}`);
    console.log(`Despesas em ${anoAtual}: ${despesasAnoAtual.length}`);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

// Executar teste
testarAPI();