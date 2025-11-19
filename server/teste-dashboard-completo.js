// Teste completo simulando o dashboard do usuário diogo
console.log('📊 Teste completo simulando o dashboard do diogo.grunge@gmail.com...\n');

async function testarDashboardCompleto() {
  try {
    // 1. Fazer login
    console.log('1. 🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'diogo.grunge@gmail.com',
        senha: 'diogo123'
      })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login falhou:', loginResponse.status, errorData.message);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    
    // 2. Buscar dados do usuário
    console.log('\n2. 📊 Buscando dados do usuário...');
    const dadosResponse = await fetch('http://localhost:3001/api/user/dados', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!dadosResponse.ok) {
      const errorData = await dadosResponse.json();
      console.log('❌ Busca de dados falhou:', dadosResponse.status, errorData.message);
      return;
    }
    
    const dadosData = await dadosResponse.json();
    console.log('✅ Dados obtidos com sucesso!');
    
    // 3. Simular o processamento do dashboard
    console.log('\n3. 📈 Processando dados como o dashboard...');
    
    const financialData = {
      receitas: dadosData.dados.receitas || [],
      despesas: dadosData.dados.despesas || []
    };
    
    console.log(`   - Receitas: ${financialData.receitas.length}`);
    console.log(`   - Despesas: ${financialData.despesas.length}`);
    
    // 4. Simular filtro de ano (como no dashboard)
    const anoSelecionado = '2025'; // Ano atual
    console.log(`\n4. 🗓️  Filtrando por ano: ${anoSelecionado}`);
    
    const filtrarPorAno = (dados) => {
      if (!Array.isArray(dados)) return [];
      
      return dados.filter(item => {
        if (!item.data) return false;
        const [ano] = item.data.split('-');
        return ano === anoSelecionado;
      });
    };
    
    const receitasFiltradas = filtrarPorAno(financialData.receitas);
    const despesasFiltradas = filtrarPorAno(financialData.despesas);
    
    console.log(`   - Receitas filtradas: ${receitasFiltradas.length}`);
    console.log(`   - Despesas filtradas: ${despesasFiltradas.length}`);
    
    // 5. Calcular totais (como no dashboard)
    console.log('\n5. 💰 Calculando totais...');
    
    const calculateTotal = (items) => {
      if (!Array.isArray(items)) return 0;
      return items.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    };
    
    // Separar despesas por categoria
    const despesasEssenciais = despesasFiltradas.filter(d => d.categoria === 'Despesas Fixas');
    const despesasLazer = despesasFiltradas.filter(d => d.categoria === 'Lazer');
    const despesasEducacao = despesasFiltradas.filter(d => d.categoria === 'Educação');
    
    console.log(`   - Despesas Essenciais: ${despesasEssenciais.length}`);
    console.log(`   - Despesas Lazer: ${despesasLazer.length}`);
    console.log(`   - Despesas Educação: ${despesasEducacao.length}`);
    
    const totalReceitas = calculateTotal(receitasFiltradas);
    const totalDespesasEssenciais = calculateTotal(despesasEssenciais);
    const totalDespesasLazer = calculateTotal(despesasLazer);
    const totalDespesasEducacao = calculateTotal(despesasEducacao);
    const totalDespesas = totalDespesasEssenciais + totalDespesasLazer + totalDespesasEducacao;
    const saldoFinal = totalReceitas - totalDespesas;
    const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;
    
    console.log('\n📊 Resultados finais:');
    console.log(`   💰 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
    console.log(`   💸 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
    console.log(`   💵 Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
    console.log(`   📈 Percentual Sobra: ${percentualSobra.toFixed(1)}%`);
    
    // 6. Preparar dados do gráfico
    console.log('\n6. 📊 Preparando dados do gráfico...');
    
    const pieData = [
      { name: 'Despesas Fixas', value: totalDespesasEssenciais, color: '#ef4444' },
      { name: 'Lazer', value: totalDespesasLazer, color: '#f59e0b' },
      { name: 'Educação', value: totalDespesasEducacao, color: '#8b5cf6' },
      { name: 'Saldo', value: saldoFinal > 0 ? saldoFinal : 0, color: '#3b82f6' },
    ].filter(item => item.value > 0);
    
    console.log('Dados do gráfico:');
    pieData.forEach(item => {
      console.log(`   - ${item.name}: R$ ${item.value.toFixed(2)}`);
    });
    
    // 7. Verificar se o dashboard deveria mostrar dados
    console.log('\n7. ✅ Verificação final:');
    if (receitasFiltradas.length === 0 && despesasFiltradas.length === 0) {
      console.log('⚠️  ATENÇÃO: Dashboard mostraria "Nenhum dado para exibir"');
      console.log('   Isso explicaria o problema relatado!');
    } else {
      console.log('✅ Dashboard deveria mostrar dados normalmente');
      console.log('   O problema pode estar no frontend ou na renderização');
    }
    
    // 8. Mostrar exemplo de dados
    console.log('\n8. 📋 Exemplos de dados:');
    if (receitasFiltradas.length > 0) {
      console.log('Primeira receita filtrada:');
      console.log(JSON.stringify(receitasFiltradas[0], null, 2));
    }
    
    if (despesasFiltradas.length > 0) {
      console.log('\nPrimeira despesa filtrada:');
      console.log(JSON.stringify(despesasFiltradas[0], null, 2));
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarDashboardCompleto();