// Sistema de logging e diagnóstico para dashboard - Versão Node.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DashboardDiagnostic {
  constructor() {
    this.logFile = path.join(__dirname, 'dashboard-complete-diagnostic.log');
    this.startTime = Date.now();
    this.token = null;
    this.userData = null;
    this.initLog();
  }

  initLog() {
    const timestamp = new Date().toISOString();
    this.log(`\n=== DIAGNÓSTICO COMPLETO DO DASHBOARD ===`);
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

  async runCompleteDiagnosis() {
    try {
      this.log('🔄 Iniciando diagnóstico completo...');
      
      // 1. Verificar estrutura de dados do usuário
      await this.analyzeUserDataStructure();
      
      // 2. Testar autenticação
      await this.testAuthentication();
      
      // 3. Testar endpoints da API
      await this.testAPIEndpoints();
      
      // 4. Simular fluxo do dashboard
      await this.simulateDashboardFlow();
      
      // 5. Validar estrutura de dados
      await this.validateDataStructure();
      
      // 6. Testar cálculos financeiros
      await this.testFinancialCalculations();
      
      // 7. Verificar problemas comuns
      await this.checkCommonIssues();
      
      this.log('\n✅ Diagnóstico completo finalizado!');
      this.log(`⏱️  Tempo total: ${Date.now() - this.startTime}ms`);
      
    } catch (error) {
      this.error(`Erro durante o diagnóstico: ${error.message}`);
      this.error(`Stack: ${error.stack}`);
    }
  }

  async analyzeUserDataStructure() {
    this.log('\n📊 Analisando estrutura de dados do usuário...');
    
    try {
      const userDataPath = path.join(__dirname, '../data/USER_DATA_user-1763162160964.json');
      
      if (!fs.existsSync(userDataPath)) {
        this.warning('❌ Arquivo de dados do usuário não encontrado');
        this.log(`Caminho esperado: ${userDataPath}`);
        return;
      }
      
      const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
      this.userData = userData;
      
      this.success('✅ Arquivo de dados encontrado');
      this.log(`📈 Receitas: ${userData.receitas?.length || 0} registros`);
      this.log(`💸 Despesas: ${userData.despesas?.length || 0} registros`);
      this.log(`📋 Categorias: ${userData.categorias?.length || 0} registros`);
      this.log(`🎯 Orçamentos: ${userData.orcamentos?.length || 0} registros`);
      
      // Validar estrutura das receitas
      if (userData.receitas?.length > 0) {
        const primeiraReceita = userData.receitas[0];
        this.log('\n🔍 Validando estrutura da primeira receita:');
        this.log(`  - ID: ${primeiraReceita.id} (${typeof primeiraReceita.id})`);
        this.log(`  - Descrição: "${primeiraReceita.descricao}" (${typeof primeiraReceita.descricao})`);
        this.log(`  - Valor: ${primeiraReceita.valor} (${typeof primeiraReceita.valor})`);
        this.log(`  - Data: ${primeiraReceita.data} (${typeof primeiraReceita.data})`);
        this.log(`  - Categoria: ${primeiraReceita.categoria} (${typeof primeiraReceita.categoria})`);
        
        // Verificar se valor é número
        if (typeof primeiraReceita.valor !== 'number') {
          this.warning('⚠️  Valor da receita não é número!');
        }
      }
      
      // Validar estrutura das despesas
      if (userData.despesas?.length > 0) {
        const primeiraDespesa = userData.despesas[0];
        this.log('\n🔍 Validando estrutura da primeira despesa:');
        this.log(`  - ID: ${primeiraDespesa.id} (${typeof primeiraDespesa.id})`);
        this.log(`  - Descrição: "${primeiraDespesa.descricao}" (${typeof primeiraDespesa.descricao})`);
        this.log(`  - Valor: ${primeiraDespesa.valor} (${typeof primeiraDespesa.valor})`);
        this.log(`  - Data: ${primeiraDespesa.data} (${typeof primeiraDespesa.data})`);
        this.log(`  - Categoria: ${primeiraDespesa.categoria} (${typeof primeiraDespesa.categoria})`);
        
        // Verificar se valor é número
        if (typeof primeiraDespesa.valor !== 'number') {
          this.warning('⚠️  Valor da despesa não é número!');
        }
      }
      
      // Calcular totais
      const totalReceitas = userData.receitas?.reduce((sum, rec) => sum + (rec.valor || 0), 0) || 0;
      const totalDespesas = userData.despesas?.reduce((sum, desp) => sum + (desp.valor || 0), 0) || 0;
      
      this.success(`\n💰 Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
      this.success(`💸 Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
      this.success(`📊 Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`);
      
    } catch (error) {
      this.error(`Erro ao analisar estrutura de dados: ${error.message}`);
    }
  }

  async testAuthentication() {
    this.log('\n🔐 Testando sistema de autenticação...');
    
    try {
      // Testar login
      this.log('🔄 Testando login...');
      
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'diogo.grunge@gmail.com',
        senha: 'diogo123'
      });
      
      if (loginResponse.data.sucesso) {
        this.success('✅ Login bem-sucedido');
        this.token = loginResponse.data.dados.token;
        this.log(`🔑 Token obtido: ${this.token.substring(0, 50)}...`);
        
        // Decodificar token para verificar payload
        const tokenParts = this.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          this.log(`📋 Token payload:`);
          this.log(`  - ID: ${payload.id}`);
          this.log(`  - Email: ${payload.email}`);
          this.log(`  - Nome: ${payload.nome}`);
          this.log(`  - Tipo: ${payload.tipo}`);
        }
      } else {
        this.error('❌ Login falhou');
        this.error(`Mensagem: ${loginResponse.data.mensagem}`);
      }
      
    } catch (error) {
      this.error(`Erro ao testar autenticação: ${error.message}`);
      if (error.response) {
        this.error(`Status: ${error.response.status}`);
        this.error(`Dados: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  async testAPIEndpoints() {
    this.log('\n🌐 Testando endpoints da API...');
    
    const endpoints = [
      { method: 'GET', path: '/user/dados', auth: true, description: 'Dados do usuário' },
      { method: 'GET', path: '/user/perfil', auth: true, description: 'Perfil do usuário' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        this.log(`🔄 Testando ${endpoint.method} ${endpoint.path} (${endpoint.description})`);
        
        const config = {
          method: endpoint.method,
          url: `http://localhost:3001/api${endpoint.path}`,
          headers: {}
        };
        
        if (endpoint.auth && this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        const response = await axios(config);
        
        this.log(`📊 Status: ${response.status}`);
        
        if (response.data.sucesso) {
          this.success(`✅ ${endpoint.path} - Sucesso`);
          
          if (endpoint.path === '/user/dados') {
            this.log(`📊 Dados recebidos:`);
            this.log(`  - Receitas: ${response.data.dados.receitas?.length || 0}`);
            this.log(`  - Despesas: ${response.data.dados.despesas?.length || 0}`);
            this.log(`  - Categorias: ${response.data.dados.categorias?.length || 0}`);
            this.log(`  - Orçamentos: ${response.data.dados.orcamentos?.length || 0}`);
          }
        } else {
          this.warning(`⚠️ ${endpoint.path} - Resposta sem sucesso`);
          this.log(`Mensagem: ${response.data.mensagem}`);
        }
        
      } catch (error) {
        this.error(`❌ Erro ao testar ${endpoint.path}: ${error.message}`);
        if (error.response) {
          this.error(`Status: ${error.response.status}`);
          this.error(`Dados: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
  }

  async simulateDashboardFlow() {
    this.log('\n📊 Simulando fluxo completo do dashboard...');
    
    try {
      // Simular o que o dashboard faz
      this.log('🔄 Simulando carregamento do dashboard...');
      
      if (!this.token) {
        this.warning('⚠️  Token não disponível, pulando simulação do dashboard');
        return;
      }
      
      // Buscar dados do usuário (como o dashboard faz)
      this.log('🔄 Buscando dados do usuário...');
      
      const response = await axios.get('http://localhost:3001/api/user/dados', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (response.data.sucesso) {
        this.success('✅ Dashboard conseguiu buscar dados com sucesso');
        
        const dados = response.data.dados;
        
        // Simular cálculos do dashboard
        this.log('\n🧮 Simulando cálculos do dashboard:');
        
        // Filtrar por ano (2025)
        const anoSelecionado = '2025';
        const receitasFiltradas = dados.receitas?.filter(rec => {
          if (!rec.data) return false;
          const [ano] = rec.data.split('-');
          return ano === anoSelecionado;
        }) || [];
        
        const despesasFiltradas = dados.despesas?.filter(desp => {
          if (!desp.data) return false;
          const [ano] = desp.data.split('-');
          return ano === anoSelecionado;
        }) || [];
        
        this.log(`📅 Filtrando por ano ${anoSelecionado}:`);
        this.log(`  - Receitas filtradas: ${receitasFiltradas.length}`);
        this.log(`  - Despesas filtradas: ${despesasFiltradas.length}`);
        
        // Calcular totais
        const totalReceitas = receitasFiltradas.reduce((sum, rec) => sum + (rec.valor || 0), 0);
        const totalDespesas = despesasFiltradas.reduce((sum, desp) => sum + (desp.valor || 0), 0);
        const saldoFinal = totalReceitas - totalDespesas;
        const percentualSobra = totalReceitas > 0 ? ((saldoFinal / totalReceitas) * 100) : 0;
        
        this.log(`\n💰 Total Receitas (2025): R$ ${totalReceitas.toFixed(2)}`);
        this.log(`💸 Total Despesas (2025): R$ ${totalDespesas.toFixed(2)}`);
        this.log(`📊 Saldo Final (2025): R$ ${saldoFinal.toFixed(2)}`);
        this.log(`📈 Percentual Sobra: ${percentualSobra.toFixed(1)}%`);
        
        // Verificar se valores são zero (problema original)
        if (totalReceitas === 0 && totalDespesas === 0) {
          this.warning('⚠️  Todos os valores são zero - problema detectado!');
        } else {
          this.success('✅ Valores calculados corretamente');
        }
        
      } else {
        this.error('❌ Dashboard não conseguiu buscar dados');
        this.error(`Mensagem: ${response.data.mensagem}`);
      }
      
    } catch (error) {
      this.error(`Erro ao simular fluxo do dashboard: ${error.message}`);
      if (error.response) {
        this.error(`Status: ${error.response.status}`);
        this.error(`Dados: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  async validateDataStructure() {
    this.log('\n🔍 Validando estrutura de dados...');
    
    try {
      if (!this.userData) {
        this.warning('⚠️  Dados do usuário não carregados');
        return;
      }
      
      // Validar receitas
      if (this.userData.receitas?.length > 0) {
        this.log('📊 Validando estrutura das receitas:');
        
        const camposObrigatorios = ['id', 'descricao', 'valor', 'data', 'categoria'];
        const receitasInvalidas = [];
        
        this.userData.receitas.forEach((receita, index) => {
          const camposFaltantes = camposObrigatorios.filter(campo => !receita[campo]);
          if (camposFaltantes.length > 0) {
            receitasInvalidas.push({
              indice: index,
              camposFaltantes,
              receita
            });
          }
        });
        
        if (receitasInvalidas.length > 0) {
          this.warning(`⚠️  ${receitasInvalidas.length} receitas com estrutura inválida`);
          receitasInvalidas.forEach(rec => {
            this.log(`  - Receita ${rec.indice}: faltando ${rec.camposFaltantes.join(', ')}`);
          });
        } else {
          this.success('✅ Todas as receitas têm estrutura válida');
        }
      }
      
      // Validar despesas
      if (this.userData.despesas?.length > 0) {
        this.log('\n📊 Validando estrutura das despesas:');
        
        const camposObrigatorios = ['id', 'descricao', 'valor', 'data', 'categoria'];
        const despesasInvalidas = [];
        
        this.userData.despesas.forEach((despesa, index) => {
          const camposFaltantes = camposObrigatorios.filter(campo => !despesa[campo]);
          if (camposFaltantes.length > 0) {
            despesasInvalidas.push({
              indice: index,
              camposFaltantes,
              despesa
            });
          }
        });
        
        if (despesasInvalidas.length > 0) {
          this.warning(`⚠️  ${despesasInvalidas.length} despesas com estrutura inválida`);
          despesasInvalidas.forEach(desp => {
            this.log(`  - Despesa ${desp.indice}: faltando ${desp.camposFaltantes.join(', ')}`);
          });
        } else {
          this.success('✅ Todas as despesas têm estrutura válida');
        }
      }
      
    } catch (error) {
      this.error(`Erro ao validar estrutura de dados: ${error.message}`);
    }
  }

  async testFinancialCalculations() {
    this.log('\n🧮 Testando cálculos financeiros...');
    
    try {
      if (!this.userData) {
        this.warning('⚠️  Dados do usuário não carregados');
        return;
      }
      
      // Testar diferentes cenários de cálculo
      const testCases = [
        { ano: '2025', descricao: 'Ano atual' },
        { ano: '2024', descricao: 'Ano anterior' }
      ];
      
      testCases.forEach(testCase => {
        this.log(`\n📅 Testando cálculos para ${testCase.descricao} (${testCase.ano}):`);
        
        const receitasFiltradas = this.userData.receitas?.filter(rec => {
          if (!rec.data) return false;
          const [ano] = rec.data.split('-');
          return ano === testCase.ano;
        }) || [];
        
        const despesasFiltradas = this.userData.despesas?.filter(desp => {
          if (!desp.data) return false;
          const [ano] = desp.data.split('-');
          return ano === testCase.ano;
        }) || [];
        
        const totalReceitas = receitasFiltradas.reduce((sum, rec) => sum + (rec.valor || 0), 0);
        const totalDespesas = despesasFiltradas.reduce((sum, desp) => sum + (desp.valor || 0), 0);
        
        this.log(`  - Receitas: ${receitasFiltradas.length} transações`);
        this.log(`  - Despesas: ${despesasFiltradas.length} transações`);
        this.log(`  - Total Receitas: R$ ${totalReceitas.toFixed(2)}`);
        this.log(`  - Total Despesas: R$ ${totalDespesas.toFixed(2)}`);
        this.log(`  - Saldo: R$ ${(totalReceitas - totalDespesas).toFixed(2)}`);
      });
      
    } catch (error) {
      this.error(`Erro ao testar cálculos financeiros: ${error.message}`);
    }
  }

  async checkCommonIssues() {
    this.log('\n🔍 Verificando problemas comuns...');
    
    try {
      // Problema 1: Valores zero
      if (this.userData) {
        const totalReceitas = this.userData.receitas?.reduce((sum, rec) => sum + (rec.valor || 0), 0) || 0;
        const totalDespesas = this.userData.despesas?.reduce((sum, desp) => sum + (desp.valor || 0), 0) || 0;
        
        if (totalReceitas === 0 && totalDespesas === 0) {
          this.warning('⚠️  PROBLEMA DETECTADO: Todos os valores são zero!');
          this.log('  - Causa possível: Filtro de ano aplicado incorretamente');
          this.log('  - Causa possível: Dados não carregados do backend');
          this.log('  - Causa possível: Problema no endpoint da API');
        }
      }
      
      // Problema 2: Verificar endpoint duplicado
      this.log('\n🔍 Verificando problema de endpoint duplicado...');
      this.log('  - Endpoint correto: /api/user/dados');
      this.log('  - Endpoint incorreto: /api/api/user/dados');
      
      // Problema 3: Verificar token
      if (!this.token) {
        this.warning('⚠️  Token de autenticação não disponível');
      }
      
      // Problema 4: Verificar estrutura de resposta
      this.log('\n🔍 Verificando estrutura de resposta da API...');
      this.log('  - Esperado: { sucesso: true, dados: { receitas: [], despesas: [] } }');
      this.log('  - Verificar se o backend está retornando a estrutura correta');
      
    } catch (error) {
      this.error(`Erro ao verificar problemas comuns: ${error.message}`);
    }
  }
}

// Executar o diagnóstico completo
const diagnostic = new DashboardDiagnostic();
diagnostic.runCompleteDiagnosis();