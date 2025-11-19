// Script para executar login diretamente e testar dashboard
(async function() {
    console.log('🚀 LOGIN E TESTE DE DASHBOARD AUTOMÁTICO');
    console.log('=======================================');\n    
    try {
        // 1. Fazer login
        console.log('🔐 Fazendo login...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'diogo.grunge@gmail.com',
                senha: 'diogo123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.success || loginData.token) {
            console.log('✅ Login realizado com sucesso!');
            
            // Salvar no localStorage
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            
            console.log('📋 Dados salvos no localStorage');
            console.log(`   Token: ${loginData.token.substring(0, 30)}...`);
            console.log(`   Usuário: ${loginData.user.nome}`);
            
            // 2. Testar API de dados
            console.log('\n📊 Testando API de dados...');
            const dadosResponse = await fetch('http://localhost:3001/api/user/dados', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            const dadosData = await dadosResponse.json();
            
            if (dadosData.sucesso) {
                console.log('✅ Dados obtidos com sucesso!');
                console.log(`   Receitas: ${dadosData.dados.receitas.length}`);
                console.log(`   Despesas: ${dadosData.dados.despesas.length}`);
                console.log(`   Orçamentos: ${dadosData.dados.orcamentos.length}`);
                
                // 3. Calcular valores para dashboard
                const anoSelecionado = '2025';
                const receitas = dadosData.dados.receitas.filter(r => {
                    const [ano] = r.data.split('-');
                    return ano === anoSelecionado;
                });
                
                const despesas = dadosData.dados.despesas.filter(d => {
                    const [ano] = d.data.split('-');
                    return ano === anoSelecionado;
                });
                
                const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
                const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor), 0);
                const saldoFinal = totalReceitas - totalDespesas;
                const percentualSobra = totalReceitas > 0 ? (saldoFinal / totalReceitas) * 100 : 0;
                
                console.log('\n💰 CÁLCULOS DO DASHBOARD:');
                console.log('========================');
                console.log(`   💸 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
                console.log(`   💳 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
                console.log(`   💵 Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
                console.log(`   📊 Percentual Sobra: ${percentualSobra.toFixed(1)}%`);
                
                // 4. Redirecionar para dashboard
                console.log('\n🔄 Redirecionando para dashboard...');
                window.location.href = '/dashboard';
                
            } else {
                console.error('❌ Erro ao obter dados:', dadosData.mensagem);
            }
            
        } else {
            console.error('❌ Erro no login:', loginData.message);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
})();