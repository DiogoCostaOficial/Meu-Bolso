// Teste completo do dashboard com correção do endpoint
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarDashboardCompleto() {
  console.log('🧪 Iniciando teste completo do dashboard...\n');

  try {
    // 1. Testar login
    console.log('🔐 Testando login do Diogo...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'diogo.grunge@gmail.com',
      senha: 'diogo123'
    });

    if (loginResponse.data.sucesso) {
      console.log('✅ Login bem-sucedido!');
      const token = loginResponse.data.dados.token;
      console.log(`Token: ${token.substring(0, 50)}...`);

      // 2. Testar endpoint do dashboard (com a correção)
      console.log('\n📊 Testando endpoint do dashboard...');
      const dashboardResponse = await axios.get(`${API_URL}/user/dados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (dashboardResponse.data.sucesso) {
        console.log('✅ Endpoint do dashboard funcionando!');
        const dados = dashboardResponse.data.dados;
        
        console.log('\n📈 Dados financeiros:');
        console.log(`- Receitas: ${dados.receitas?.length || 0}`);
        console.log(`- Despesas: ${dados.despesas?.length || 0}`);
        console.log(`- Categorias: ${dados.categorias?.length || 0}`);
        console.log(`- Orçamentos: ${dados.orcamentos?.length || 0}`);

        // 3. Calcular totais
        if (dados.receitas?.length > 0) {
          const totalReceitas = dados.receitas.reduce((sum, rec) => sum + rec.valor, 0);
          console.log(`\n💰 Total de Receitas: R$ ${totalReceitas.toFixed(2)}`);
        }

        if (dados.despesas?.length > 0) {
          const totalDespesas = dados.despesas.reduce((sum, desp) => sum + desp.valor, 0);
          console.log(`💸 Total de Despesas: R$ ${totalDespesas.toFixed(2)}`);
          
          // 4. Análise por categoria
          console.log('\n📊 Despesas por categoria:');
          const despesasPorCategoria = {};
          dados.despesas.forEach(despesa => {
            const categoria = despesa.categoria || 'Sem categoria';
            despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + despesa.valor;
          });
          
          Object.entries(despesasPorCategoria).forEach(([categoria, valor]) => {
            console.log(`  - ${categoria}: R$ ${valor.toFixed(2)}`);
          });
        }

        // 5. Testar diferentes anos
        console.log('\n📅 Testando filtro por ano...');
        const anosDisponiveis = [...new Set([
          ...dados.receitas?.map(r => r.data?.split('-')[0]) || [],
          ...dados.despesas?.map(d => d.data?.split('-')[0]) || []
        ])].filter(Boolean);
        
        console.log(`Anos disponíveis: ${anosDisponiveis.join(', ')}`);

        // 6. Testar endpoint incorreto (para confirmar o problema estava no duplo /api)
        console.log('\n❌ Testando endpoint incorreto (com duplo /api)...');
        try {
          await axios.get(`${API_URL}/api/user/dados`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('⚠️  Endpoint incorreto funcionou (isso não deveria acontecer)');
        } catch (error) {
          console.log('✅ Endpoint incorreto corretamente rejeitado (404)');
        }

      } else {
        console.log('❌ Erro no endpoint do dashboard:', dashboardResponse.data.mensagem);
      }

    } else {
      console.log('❌ Login falhou:', loginResponse.data.mensagem);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensagem:', error.response.data?.mensagem || error.response.data);
    }
  }
}

// Executar o teste
testarDashboardCompleto();