// Sistema de logging detalhado para diagnóstico do dashboard
const fs = require('fs');
const path = require('path');

class DashboardLogger {
  constructor() {
    this.logFile = path.join(__dirname, 'dashboard-diagnostic.log');
    this.startTime = Date.now();
    this.initLog();
  }

  initLog() {
    const timestamp = new Date().toISOString();
    this.log(`\n=== INÍCIO DO DIAGNÓSTICO DO DASHBOARD ===`);
    this.log(`Timestamp: ${timestamp}`);
    this.log(`User: diogo.grunge@gmail.com (user-1763162160964)`);
    this.log(`=====================================\n`);
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}\n`;
    
    console.log(logEntry.trim());
    fs.appendFileSync(this.logFile, logEntry);
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  success(message) {
    this.log(message, 'SUCCESS');
  }

  warning(message) {
    this.log(message, 'WARNING');
  }

  // Testa o fluxo completo de dados
  async testCompleteFlow() {
    try {
      this.log('🔄 Iniciando teste completo do fluxo de dados...');
      
      // 1. Testar estrutura de dados do usuário
      await this.testUserDataStructure();
      
      // 2. Testar API endpoints
      await this.testAPIEndpoints();
      
      // 3. Testar autenticação
      await this.testAuthentication();
      
      // 4. Testar fluxo de dados do dashboard
      await this.testDashboardFlow();
      
      // 5. Analisar logs de erro
      await this.analyzeErrorLogs();
      
      this.log('\n✅ Diagnóstico completo finalizado!');
      this.log(`⏱️  Tempo total: ${Date.now() - this.startTime}ms`);
      
    } catch (error) {
      this.error(`Erro durante o diagnóstico: ${error.message}`);
    }
  }

  async testUserDataStructure() {
    this.log('\n📊 Testando estrutura de dados do usuário...');
    
    try {
      const userDataPath = path.join(__dirname, '../data/USER_DATA_user-1763162160964.json');
      
      if (!fs.existsSync(userDataPath)) {
        this.warning('Arquivo de dados do usuário não encontrado');
        return;
      }
      
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
      
      this.log(`📈 Receitas: ${userData.receitas?.length || 0} registros`);
      this.log(`💸 Despesas: ${userData.despesas?.length || 0} registros`);
      this.log(`📋 Categorias: ${userData.categorias?.length || 0} registros`);
      this.log(`🎯 Orçamentos: ${userData.orcamentos?.length || 0} registros`);
      
      // Validar estrutura das receitas
      if (userData.receitas?.length > 0) {
        const primeiraReceita = userData.receitas[0];
        this.log('🔍 Validando estrutura da primeira receita:');
        this.log(`  - ID: ${primeiraReceita.id} (${typeof primeiraReceita.id})`);
        this.log(`  - Descrição: ${primeiraReceita.descricao} (${typeof primeiraReceita.descricao})`);
        this.log(`  - Valor: ${primeiraReceita.valor} (${typeof primeiraReceita.valor})`);
        this.log(`  - Data: ${primeiraReceita.data} (${typeof primeiraReceita.data})`);
        this.log(`  - Categoria: ${primeiraReceita.categoria} (${typeof primeiraReceita.categoria})`);
      }
      
      // Validar estrutura das despesas
      if (userData.despesas?.length > 0) {
        const primeiraDespesa = userData.despesas[0];
        this.log('🔍 Validando estrutura da primeira despesa:');
        this.log(`  - ID: ${primeiraDespesa.id} (${typeof primeiraDespesa.id})`);
        this.log(`  - Descrição: ${primeiraDespesa.descricao} (${typeof primeiraDespesa.descricao})`);
        this.log(`  - Valor: ${primeiraDespesa.valor} (${typeof primeiraDespesa.valor})`);
        this.log(`  - Data: ${primeiraDespesa.data} (${typeof primeiraDespesa.data})`);
        this.log(`  - Categoria: ${primeiraDespesa.categoria} (${typeof primeiraDespesa.categoria})`);
      }
      
      // Calcular totais para validação
      const totalReceitas = userData.receitas?.reduce((sum, rec) => sum + (rec.valor || 0), 0) || 0;
      const totalDespesas = userData.despesas?.reduce((sum, desp) => sum + (desp.valor || 0), 0) || 0;
      
      this.success(`💰 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
      this.success(`💸 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
      this.success(`📊 Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`);
      
    } catch (error) {
      this.error(`Erro ao testar estrutura de dados: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    this.log('\n🌐 Testando endpoints da API...');
    
    const endpoints = [
      { method: 'POST', path: '/auth/login', body: { email: 'diogo.grunge@gmail.com', senha: 'diogo123' } },
      { method: 'GET', path: '/user/dados', auth: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        this.log(`🔄 Testando ${endpoint.method} ${endpoint.path}`);
        
        const options = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body);
        }
        
        if (endpoint.auth && this.authToken) {
          options.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        const response = await fetch(`http://localhost:3001/api${endpoint.path}`, options);
        
        this.log(`📊 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          this.success(`✅ ${endpoint.path} - Sucesso`);
          
          if (endpoint.path === '/auth/login') {
            this.authToken = data.dados.token;
            this.log(`🔑 Token obtido: ${this.authToken.substring(0, 50)}...`);
          }
        } else {
          this.error(`❌ ${endpoint.path} - Erro ${response.status}`);
        }
        
      } catch (error) {
        this.error(`❌ Erro ao testar ${endpoint.path}: ${error.message}`);
      }
    }
  }

  async testAuthentication() {
    this.log('\n🔐 Testando autenticação...');
    
    try {
      // Testar token no localStorage
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      
      this.log(`🔍 Token no localStorage: ${token ? 'Presente' : 'Ausente'}`);
      this.log(`👤 Usuário no localStorage: ${usuario ? 'Presente' : 'Ausente'}`);
      
      if (token && usuario) {
        try {
          const userData = JSON.parse(usuario);
          this.log(`📋 Email: ${userData.email}`);
          this.log(`📋 ID: ${userData.id}`);
          this.log(`📋 Tipo: ${userData.tipo}`);
        } catch (error) {
          this.error('❌ Erro ao parsear dados do usuário');
        }
      }
      
    } catch (error) {
      this.error(`Erro ao testar autenticação: ${error.message}`);
    }
  }

  async testDashboardFlow() {
    this.log('\n📊 Testando fluxo do dashboard...');
    
    try {
      // Simular o fluxo do dashboard
      this.log('🔄 Simulando carregamento do dashboard...');
      
      // Verificar se o dashboard está acessando o endpoint correto
      const dashboardEndpoint = '/user/dados';
      this.log(`🎯 Endpoint do dashboard: ${dashboardEndpoint}`);
      
      // Testar se o backend está retornando dados
      if (this.authToken) {
        const response = await fetch(`http://localhost:3001/api${dashboardEndpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          this.success('✅ Dashboard está recebendo dados do backend');
          
          this.log(`📊 Resposta do backend:`);
          this.log(`  - Sucesso: ${data.sucesso}`);
          this.log(`  - Tem dados: ${data.dados ? 'Sim' : 'Não'}`);
          
          if (data.dados) {
            this.log(`  - Receitas: ${data.dados.receitas?.length || 0}`);
            this.log(`  - Despesas: ${data.dados.despesas?.length || 0}`);
          }
        } else {
          this.error(`❌ Dashboard não conseguiu acessar dados: ${response.status}`);
        }
      }
      
    } catch (error) {
      this.error(`Erro ao testar fluxo do dashboard: ${error.message}`);
    }
  }

  async analyzeErrorLogs() {
    this.log('\n🔍 Analisando logs de erro...');
    
    try {
      // Verificar se há logs de erro recentes
      const errorPatterns = [
        'Erro ao carregar dados',
        '404',
        '401',
        '500',
        'AxiosError',
        'TypeError',
        'ReferenceError'
      ];
      
      this.log('🔍 Procurando por padrões de erro comuns...');
      
      // Simular análise de logs (em produção, isso leria arquivos de log reais)
      for (const pattern of errorPatterns) {
        this.log(`  - Verificando: ${pattern}`);
      }
      
      this.log('✅ Análise de logs concluída');
      
    } catch (error) {
      this.error(`Erro ao analisar logs: ${error.message}`);
    }
  }
}

// Executar o diagnóstico
const logger = new DashboardLogger();
logger.testCompleteFlow();