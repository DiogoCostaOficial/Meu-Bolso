import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function debugSistemaCompleto() {
    console.log('🔍 Debug completo do sistema de login e dashboard...\n');
    
    // 1. Verificar o que está no localStorage
    console.log('📦 CONTEÚDO DO LOCALSTORAGE:');
    console.log('===========================');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    }
    
    // 2. Testar login via API
    console.log('\n🔐 TESTANDO LOGIN VIA API:');
    console.log('=========================');
    
    try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'diogo.grunge@gmail.com',
            senha: 'diogo123'
        });
        
        console.log('✅ Login API bem-sucedido');
        console.log(`   Token: ${loginResponse.data.token.substring(0, 50)}...`);
        console.log(`   Usuário: ${loginResponse.data.user.nome}`);
        
        // 3. Simular o que o frontend deveria fazer
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('usuario', JSON.stringify(loginResponse.data.user));
        
        console.log('\n📋 Simulação do frontend:');
        console.log('   Token salvo no localStorage');
        console.log('   Usuário salvo no localStorage');
        
    } catch (error) {
        console.error('❌ Erro no login via API:', error.response?.data || error.message);
        return;
    }
    
    // 4. Testar se o axios interceptor está funcionando
    console.log('\n🌐 TESTANDO REQUISIÇÃO AUTENTICADA:');
    console.log('===================================');
    
    try {
        // Criar instância axios igual ao frontend
        const api = axios.create({
            baseURL: 'http://localhost:3001/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        // Adicionar interceptor igual ao frontend
        api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                console.log(`   🔑 Token encontrado: ${token ? 'SIM' : 'NÃO'}`);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log(`   📤 Enviando token: ${token.substring(0, 30)}...`);
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        
        const response = await api.get('/user/dados');
        console.log('✅ Requisição autenticada bem-sucedida');
        console.log(`   Receitas: ${response.data.dados.receitas.length}`);
        console.log(`   Despesas: ${response.data.dados.despesas.length}`);
        console.log(`   Orçamentos: ${response.data.dados.orcamentos.length}`);
        
    } catch (error) {
        console.error('❌ Erro na requisição autenticada:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('🔒 Token inválido ou expirado');
        }
    }
    
    // 5. Verificar o que o Dashboard.jsx espera
    console.log('\n📊 VERIFICANDO ESTRUTURA ESPERADA PELO DASHBOARD:');
    console.log('=================================================');
    
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await axios.get('http://localhost:3001/api/user/dados', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const dados = response.data;
            console.log('✅ Estrutura dos dados:');
            console.log(`   - dados.sucesso: ${dados.sucesso}`);
            console.log(`   - dados.dados.receitas: ${dados.dados.receitas?.length || 0} itens`);
            console.log(`   - dados.dados.despesas: ${dados.dados.despesas?.length || 0} itens`);
            console.log(`   - dados.dados.orcamentos: ${dados.dados.orcamentos?.length || 0} itens`);
            
            // 6. Simular o filtro do Dashboard
            console.log('\n🔍 SIMULANDO FILTRO DO DASHBOARD:');
            console.log('=================================');
            
            const anoSelecionado = '2025'; // Valor padrão do Dashboard
            const filtrarPorAno = (dados) => {
                if (!Array.isArray(dados)) return [];
                return dados.filter(item => {
                    if (!item.data) return false;
                    const [ano] = item.data.split('-');
                    return ano === anoSelecionado;
                });
            };
            
            const receitasFiltradas = filtrarPorAno(dados.dados.receitas);
            const despesasFiltradas = filtrarPorAno(dados.dados.despesas);
            
            console.log(`📅 Filtro para ano ${anoSelecionado}:`);
            console.log(`   - Receitas filtradas: ${receitasFiltradas.length}`);
            console.log(`   - Despesas filtradas: ${despesasFiltradas.length}`);
            
            // 7. Simular cálculos do Dashboard
            const calculateTotal = (items) => {
                if (!Array.isArray(items)) return 0;
                return items.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
            };
            
            const totalReceitas = calculateTotal(receitasFiltradas);
            const totalDespesas = calculateTotal(despesasFiltradas);
            const saldoFinal = totalReceitas - totalDespesas;
            const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;
            
            console.log('\n💰 CÁLCULOS DO DASHBOARD:');
            console.log('========================');
            console.log(`   💸 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
            console.log(`   💳 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
            console.log(`   💵 Saldo Final: R$ ${saldoFinal.toFixed(2)}`);
            console.log(`   📊 Percentual Sobra: ${percentualSobra.toFixed(1)}%`);
            
        } catch (error) {
            console.error('❌ Erro ao verificar estrutura:', error.response?.data || error.message);
        }
    } else {
        console.log('❌ Nenhum token encontrado no localStorage');
    }
    
    console.log('\n✅ Debug completo finalizado!');
}

// Executar debug
debugSistemaCompleto();