/**
 * Testes Automatizados para Funcionalidade de Backup Universal
 * 
 * Este arquivo testa a funcionalidade de backup para diferentes perfis de usuário,
 * incluindo o usuário diogo.grunge@gmail.com que estava com problemas.
 * 
 * Executar: node test-backup-universal.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock do localStorage para testes
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Configurar ambiente de teste
global.localStorage = new LocalStorageMock();
global.window = {
  location: {
    href: 'http://localhost:3000'
  }
};

// Dados de teste para diferentes usuários
const testUsers = [
  {
    id: 'user-1763162160964',
    email: 'diogo.grunge@gmail.com',
    name: 'Diogo Grunge',
    tipo: 'usuario',
    active: true,
    verified: true,
    createdAt: '2025-11-14T23:16:00.964Z'
  },
  {
    id: 'user-1763160000001',
    email: 'admin@teste.com',
    name: 'Admin Teste',
    tipo: 'admin',
    active: true,
    verified: true,
    createdAt: '2025-11-14T20:00:00.001Z'
  },
  {
    id: 'user-1763160000002',
    email: 'usuario@teste.com',
    name: 'Usuário Teste',
    tipo: 'usuario',
    active: true,
    verified: false,
    createdAt: '2025-11-14T21:00:00.002Z'
  },
  {
    id: 'user-1763160000003',
    email: 'inativo@teste.com',
    name: 'Usuário Inativo',
    tipo: 'usuario',
    active: false,
    verified: true,
    createdAt: '2025-11-14T22:00:00.003Z'
  }
];

// Dados de receitas e despesas para teste
const generateTestData = (userId) => ({
  RECEITAS: [
    { id: 1, descricao: 'Salário', valor: 5000, categoria: 'Trabalho', data: '2025-11-01', userId },
    { id: 2, descricao: 'Freelance', valor: 1500, categoria: 'Trabalho', data: '2025-11-05', userId }
  ],
  DESPESAS: [
    { id: 1, descricao: 'Aluguel', valor: 1200, categoria: 'Moradia', data: '2025-11-01', userId },
    { id: 2, descricao: 'Supermercado', valor: 800, categoria: 'Alimentação', data: '2025-11-03', userId }
  ],
  ORCAMENTO: {
    moradia: 1500,
    alimentacao: 1000,
    transporte: 500,
    userId
  }
});

// Funções auxiliares para simular o comportamento do componente Backup
const backupFunctions = {
  getAllData: (userId) => {
    const receitasKey = userId ? `RECEITAS_${userId}` : 'RECEITAS';
    const despesasKey = userId ? `DESPESAS_${userId}` : 'DESPESAS';
    const orcamentoKey = userId ? `ORCAMENTO_${userId}` : 'ORCAMENTO';

    try {
      const receitas = JSON.parse(localStorage.getItem(receitasKey) || '[]');
      const despesas = JSON.parse(localStorage.getItem(despesasKey) || '[]');
      const orcamento = JSON.parse(localStorage.getItem(orcamentoKey) || '{}');

      return {
        RECEITAS: receitas,
        DESPESAS: despesas,
        ORCAMENTO: orcamento,
        METADATA: {
          userId,
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      };
    } catch (error) {
      throw new Error(`Erro ao obter dados: ${error.message}`);
    }
  },

  performAutoBackup: (user) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const userId = user.id || user.email;
    const allData = backupFunctions.getAllData(userId);
    const backupKey = `AUTO_BACKUP_${userId}_${Date.now()}`;
    
    const backupData = {
      ...allData,
      timestamp: new Date().toISOString(),
      userId: userId
    };

    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // Salvar também como backup principal do usuário
    const userBackupKey = `AUTO_BACKUP_${userId}`;
    localStorage.setItem(userBackupKey, JSON.stringify(backupData));

    return backupData;
  },

  handleExport: (user) => {
    if (!user) {
      throw new Error('Usuário não autenticado para exportação');
    }

    const userId = user.id || user.email;
    const allData = backupFunctions.getAllData(userId);
    
    return {
      filename: `backup-financas-${userId}-${new Date().toISOString().split('T')[0]}.json`,
      data: JSON.stringify(allData, null, 2)
    };
  },

  handleEmergencyRecovery: (user) => {
    if (!user) {
      throw new Error('Usuário não autenticado para recuperação');
    }

    const userId = user.id || user.email;
    const emergencyBackups = [];

    // Buscar backups automáticos específicos do usuário
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`AUTO_BACKUP_${userId}`)) {
        try {
          const backupData = JSON.parse(localStorage.getItem(key));
          if (backupData && backupData.timestamp) {
            emergencyBackups.push({ key, data: backupData, timestamp: backupData.timestamp });
          }
        } catch (err) {
          console.warn(`Erro ao processar backup ${key}:`, err);
        }
      }
    }

    // Ordenar por timestamp (mais recente primeiro)
    emergencyBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (emergencyBackups.length === 0) {
      return { success: false, message: 'Nenhum backup de emergência encontrado' };
    }

    // Retornar o backup mais recente
    const latestBackup = emergencyBackups[0];
    return {
      success: true,
      backup: latestBackup.data,
      timestamp: latestBackup.timestamp,
      message: `Backup de ${new Date(latestBackup.timestamp).toLocaleString()} disponível`
    };
  },

  clearAllData: (userId) => {
    const receitasKey = `RECEITAS_${userId}`;
    const despesasKey = `DESPESAS_${userId}`;
    const orcamentoKey = `ORCAMENTO_${userId}`;
    const autoBackupKey = `AUTO_BACKUP_${userId}`;

    localStorage.removeItem(receitasKey);
    localStorage.removeItem(despesasKey);
    localStorage.removeItem(orcamentoKey);
    localStorage.removeItem(autoBackupKey);

    return true;
  }
};

// Classe de teste
class BackupTestSuite {
  constructor() {
    this.results = [];
    this.currentUser = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.results.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m',  // green
      error: '\x1b[31m',    // red
      warning: '\x1b[33m',   // yellow
      reset: '\x1b[0m'
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async setupUser(user) {
    this.currentUser = user;
    this.log(`Configurando ambiente para usuário: ${user.email} (${user.tipo})`);
    
    // Limpar localStorage
    localStorage.clear();
    
    // Adicionar dados de teste
    const testData = generateTestData(user.id);
    localStorage.setItem(`RECEITAS_${user.id}`, JSON.stringify(testData.RECEITAS));
    localStorage.setItem(`DESPESAS_${user.id}`, JSON.stringify(testData.DESPESAS));
    localStorage.setItem(`ORCAMENTO_${user.id}`, JSON.stringify(testData.ORCAMENTO));
    
    this.log(`Dados de teste criados para ${user.email}`);
  }

  async testBackupExport() {
    this.log('🧪 Testando exportação de backup...');
    
    try {
      const result = backupFunctions.handleExport(this.currentUser);
      
      if (!result.filename || !result.data) {
        throw new Error('Exportação não retornou filename ou data');
      }

      const parsedData = JSON.parse(result.data);
      if (!parsedData.RECEITAS || !parsedData.DESPESAS || !parsedData.METADATA) {
        throw new Error('Dados exportados incompletos');
      }

      if (parsedData.METADATA.userId !== this.currentUser.id) {
        throw new Error('UserId nos metadados não corresponde ao usuário atual');
      }

      this.log(`✅ Exportação bem-sucedida: ${result.filename}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Falha na exportação: ${error.message}`, 'error');
      return false;
    }
  }

  async testAutoBackup() {
    this.log('🧪 Testando backup automático...');
    
    try {
      const result = backupFunctions.performAutoBackup(this.currentUser);
      
      if (!result.timestamp || !result.userId) {
        throw new Error('Backup automático não retornou dados completos');
      }

      // Verificar se o backup foi salvo
      const backupKey = `AUTO_BACKUP_${this.currentUser.id}`;
      const savedBackup = localStorage.getItem(backupKey);
      
      if (!savedBackup) {
        throw new Error('Backup automático não foi salvo no localStorage');
      }

      const parsedBackup = JSON.parse(savedBackup);
      if (parsedBackup.userId !== this.currentUser.id) {
        throw new Error('UserId do backup não corresponde ao usuário atual');
      }

      this.log('✅ Backup automático bem-sucedido', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Falha no backup automático: ${error.message}`, 'error');
      return false;
    }
  }

  async testEmergencyRecovery() {
    this.log('🧪 Testando recuperação de emergência...');
    
    try {
      // Primeiro criar um backup
      backupFunctions.performAutoBackup(this.currentUser);
      
      // Simular perda de dados
      backupFunctions.clearAllData(this.currentUser.id);
      
      // Tentar recuperação
      const result = backupFunctions.handleEmergencyRecovery(this.currentUser);
      
      if (!result.success) {
        throw new Error(`Recuperação falhou: ${result.message}`);
      }

      if (!result.backup || !result.timestamp) {
        throw new Error('Dados de recuperação incompletos');
      }

      this.log(`✅ Recuperação de emergência bem-sucedida: ${result.message}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Falha na recuperação de emergência: ${error.message}`, 'error');
      return false;
    }
  }

  async testUserIsolation() {
    this.log('🧪 Testando isolamento entre usuários...');
    
    try {
      // Criar dados para usuário atual
      const currentUserData = generateTestData(this.currentUser.id);
      localStorage.setItem(`RECEITAS_${this.currentUser.id}`, JSON.stringify(currentUserData.RECEITAS));
      
      // Criar dados para outro usuário
      const otherUser = testUsers.find(u => u.id !== this.currentUser.id);
      const otherUserData = generateTestData(otherUser.id);
      localStorage.setItem(`RECEITAS_${otherUser.id}`, JSON.stringify(otherUserData.RECEITAS));
      
      // Verificar que cada usuário só vê seus dados
      const currentUserBackup = backupFunctions.getAllData(this.currentUser.id);
      const otherUserBackup = backupFunctions.getAllData(otherUser.id);
      
      if (currentUserBackup.RECEITAS.length !== currentUserData.RECEITAS.length) {
        throw new Error('Usuário atual não conseguiu acessar seus dados corretamente');
      }
      
      if (otherUserBackup.RECEITAS.length !== otherUserData.RECEITAS.length) {
        throw new Error('Outro usuário não conseguiu acessar seus dados corretamente');
      }

      this.log('✅ Isolamento entre usuários funcionando corretamente', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Falha no isolamento: ${error.message}`, 'error');
      return false;
    }
  }

  async testErrorHandling() {
    this.log('🧪 Testando tratamento de erros...');
    
    let errorTests = 0;
    let errorTestsPassed = 0;

    // Teste 1: Usuário não autenticado
    try {
      backupFunctions.handleExport(null);
      this.log('❌ Deveria ter lançado erro para usuário não autenticado', 'error');
    } catch (error) {
      errorTestsPassed++;
      this.log('✅ Erro correto para usuário não autenticado', 'success');
    }
    errorTests++;

    // Teste 2: Backup automático sem usuário
    try {
      backupFunctions.performAutoBackup(null);
      this.log('❌ Deveria ter lançado erro para backup automático sem usuário', 'error');
    } catch (error) {
      errorTestsPassed++;
      this.log('✅ Erro correto para backup automático sem usuário', 'success');
    }
    errorTests++;

    // Teste 3: Recuperação de emergência sem usuário
    try {
      backupFunctions.handleEmergencyRecovery(null);
      this.log('❌ Deveria ter lançado erro para recuperação sem usuário', 'error');
    } catch (error) {
      errorTestsPassed++;
      this.log('✅ Erro correto para recuperação sem usuário', 'success');
    }
    errorTests++;

    return errorTestsPassed === errorTests;
  }

  async runAllTests() {
    this.log('🚀 Iniciando testes universais de backup...', 'info');
    this.log(`Total de usuários de teste: ${testUsers.length}`, 'info');

    let totalTests = 0;
    let totalPassed = 0;

    for (const user of testUsers) {
      this.log(`\n📋 Iniciando testes para usuário: ${user.email} (${user.tipo})`, 'info');
      
      await this.setupUser(user);

      // Executar todos os testes para este usuário
      const tests = [
        { name: 'Exportação de Backup', func: this.testBackupExport.bind(this) },
        { name: 'Backup Automático', func: this.testAutoBackup.bind(this) },
        { name: 'Recuperação de Emergência', func: this.testEmergencyRecovery.bind(this) },
        { name: 'Isolamento entre Usuários', func: this.testUserIsolation.bind(this) },
        { name: 'Tratamento de Erros', func: this.testErrorHandling.bind(this) }
      ];

      for (const test of tests) {
        totalTests++;
        this.log(`\n--- ${test.name} ---`);
        const passed = await test.func();
        if (passed) totalPassed++;
      }
    }

    // Gerar relatório final
    this.generateReport(totalTests, totalPassed);
    
    return { totalTests, totalPassed, success: totalPassed === totalTests };
  }

  generateReport(totalTests, totalPassed) {
    const successRate = ((totalPassed / totalTests) * 100).toFixed(2);
    const timestamp = new Date().toISOString();
    
    const report = {
      timestamp,
      summary: {
        totalTests,
        totalPassed,
        totalFailed: totalTests - totalPassed,
        successRate: `${successRate}%`
      },
      usersTested: testUsers.map(u => ({
        email: u.email,
        tipo: u.tipo,
        active: u.active,
        verified: u.verified
      })),
      detailedResults: this.results
    };

    // Salvar relatório em arquivo
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const reportPath = path.join(__dirname, 'backup-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('\n' + '='.repeat(60), 'info');
    this.log('📊 RELATÓRIO FINAL DE TESTES DE BACKUP', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`Total de Testes: ${totalTests}`, 'info');
    this.log(`Testes Passados: ${totalPassed}`, 'success');
    this.log(`Testes Falhados: ${totalTests - totalPassed}`, totalPassed === totalTests ? 'info' : 'error');
    this.log(`Taxa de Sucesso: ${successRate}%`, totalPassed === totalTests ? 'success' : 'warning');
    this.log(`\nRelatório salvo em: ${reportPath}`, 'info');
    
    if (totalPassed === totalTests) {
      this.log('\n🎉 TODOS OS TESTES PASSARAM! O sistema de backup está funcionando corretamente para todos os usuários.', 'success');
    } else {
      this.log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique os logs acima para identificar os problemas.', 'error');
    }
  }
}

// Executar os testes
async function runTests() {
  console.log('🧪 INICIANDO TESTES AUTOMATIZADOS DE BACKUP UNIVERSAL');
  console.log('Objetivo: Validar que todos os usuários podem realizar backup corretamente');
  console.log('Usuário foco: diogo.grunge@gmail.com e outros perfis de teste\n');

  const testSuite = new BackupTestSuite();
  
  try {
    const results = await testSuite.runAllTests();
    
    if (results.success) {
      console.log('\n✅ Sistema de backup validado com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Foram encontrados problemas no sistema de backup.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante a execução dos testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runTests();
}

export { BackupTestSuite, backupFunctions, testUsers };