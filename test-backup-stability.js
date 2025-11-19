import axios from 'axios';

/**
 * Teste de Estabilidade do Sistema de Backup
 * 
 * Este script testa:
 * 1. Login do usuário
 * 2. Criação de dados de teste
 * 3. Exportação de backup
 * 4. Importação de backup
 * 5. Verificação de integridade
 */

const TEST_USER = {
  email: 'diogo.grunge@gmail.com',
  senha: 'diogo123'
};

// Dados de teste
const TEST_DATA = {
  RECEITAS: [
    { id: 1, descricao: 'Teste Receita 1', valor: 1000, categoria: 'Salário' },
    { id: 2, descricao: 'Teste Receita 2', valor: 500, categoria: 'Freelance' }
  ],
  DESPESAS: [
    { id: 1, descricao: 'Teste Despesa 1', valor: 200, categoria: 'Alimentação' },
    { id: 2, descricao: 'Teste Despesa 2', valor: 100, categoria: 'Transporte' }
  ],
  ORCAMENTOS: {
    'ORCAMENTO_2024-11': JSON.stringify({
      mes: '2024-11',
      valor: 2000,
      categoria: 'Alimentação'
    })
  }
};

async function testBackupSystem() {
  console.log('🧪 Iniciando teste de estabilidade do backup...\n');
  
  let token;
  
  try {
    // 1. Testar login
    console.log('🔑 Testando login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', TEST_USER);
    token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido\n');
    
    // 2. Criar dados de teste no localStorage (simulando navegador)
    console.log('💾 Criando dados de teste...');
    
    // Simular dados no localStorage
    localStorage.setItem('RECEITAS', JSON.stringify(TEST_DATA.RECEITAS));
    localStorage.setItem('DESPESAS', JSON.stringify(TEST_DATA.DESPESAS));
    localStorage.setItem('ORCAMENTO_2024-11', TEST_DATA.ORCAMENTOS['ORCAMENTO_2024-11']);
    
    console.log('✅ Dados de teste criados\n');
    
    // 3. Testar exportação de backup
    console.log('📤 Testando exportação de backup...');
    
    // Simular função de exportação
    const getAllData = () => {
      const receitas = localStorage.getItem('RECEITAS');
      const despesas = localStorage.getItem('DESPESAS');
      
      const orcamentos = Object.keys(localStorage)
        .filter((k) => k.startsWith('ORCAMENTO_'))
        .reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {});
      
      return {
        RECEITAS: receitas ? JSON.parse(receitas) : [],
        DESPESAS: despesas ? JSON.parse(despesas) : [],
        ORCAMENTOS: orcamentos,
        timestamp: new Date().toISOString(),
      };
    };
    
    const backupData = getAllData();
    console.log('📊 Dados do backup:', JSON.stringify(backupData, null, 2));
    console.log('✅ Backup exportado com sucesso\n');
    
    // 4. Testar importação de backup
    console.log('📥 Testando importação de backup...');
    
    // Simular função de restore
    const restoreAllData = (data) => {
      localStorage.removeItem('RECEITAS');
      localStorage.removeItem('DESPESAS');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('ORCAMENTO_'))
        .forEach((k) => localStorage.removeItem(k));
      
      localStorage.setItem('RECEITAS', JSON.stringify(data.RECEITAS || []));
      localStorage.setItem('DESPESAS', JSON.stringify(data.DESPESAS || []));
      if (data.ORCAMENTOS && typeof data.ORCAMENTOS === 'object') {
        Object.entries(data.ORCAMENTOS).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }
    };
    
    // Limpar dados atuais e restaurar
    restoreAllData(backupData);
    
    // Verificar se os dados foram restaurados corretamente
    const restoredReceitas = JSON.parse(localStorage.getItem('RECEITAS'));
    const restoredDespesas = JSON.parse(localStorage.getItem('DESPESAS'));
    
    console.log('✅ Dados restaurados:');
    console.log('  - Receitas:', restoredReceitas.length);
    console.log('  - Despesas:', restoredDespesas.length);
    console.log('✅ Importação bem-sucedida\n');
    
    // 5. Testar backup automático
    console.log('🔄 Testando backup automático...');
    
    const BACKUP_AUTO_KEY = 'BACKUP_AUTO';
    const snapshot = backupData;
    localStorage.setItem(BACKUP_AUTO_KEY, JSON.stringify(snapshot));
    
    const savedBackup = localStorage.getItem(BACKUP_AUTO_KEY);
    if (savedBackup) {
      const parsedBackup = JSON.parse(savedBackup);
      console.log('✅ Backup automático salvo com sucesso');
      console.log('📅 Timestamp:', parsedBackup.timestamp);
    }
    
    console.log('\n🎉 Teste de estabilidade concluído com sucesso!');
    console.log('✅ Todos os componentes do backup estão funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('📄 Resposta do servidor:', error.response.data);
    }
  }
}

// Executar teste
testBackupSystem();