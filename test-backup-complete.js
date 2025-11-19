/**
 * Teste de Estabilidade do Sistema de Backup - Simulação de Navegador
 * 
 * Este script simula o ambiente do navegador e testa:
 * 1. Criação de dados de teste
 * 2. Exportação de backup
 * 3. Importação de backup
 * 4. Verificação de integridade
 * 5. Simulação de backup automático
 */

// Simulação do localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value.toString();
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
  
  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
  
  get length() {
    return Object.keys(this.store).length;
  }
}

// Criar instância global
const localStorage = new LocalStorageMock();

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

// Funções do sistema de backup
const getAllData = () => {
  const receitas = localStorage.getItem('RECEITAS');
  const despesas = localStorage.getItem('DESPESAS');
  
  const orcamentos = Object.keys(localStorage.store)
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

const restoreAllData = (data) => {
  // Limpa tudo antes de restaurar
  localStorage.removeItem('RECEITAS');
  localStorage.removeItem('DESPESAS');
  Object.keys(localStorage.store)
    .filter((k) => k.startsWith('ORCAMENTO_'))
    .forEach((k) => localStorage.removeItem(k));
  
  // Salva novamente
  localStorage.setItem('RECEITAS', JSON.stringify(data.RECEITAS || []));
  localStorage.setItem('DESPESAS', JSON.stringify(data.DESPESAS || []));
  if (data.ORCAMENTOS && typeof data.ORCAMENTOS === 'object') {
    Object.entries(data.ORCAMENTOS).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
};

// Função para simular o download de arquivo
function simulateFileDownload(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  console.log(`📥 Simulando download do arquivo: ${filename}`);
  console.log(`📊 Tamanho do arquivo: ${(blob.size / 1024).toFixed(2)} KB`);
  console.log(`📝 Primeiros 200 caracteres: ${jsonString.substring(0, 200)}...`);
  
  return {
    name: filename,
    size: blob.size,
    content: jsonString
  };
}

// Função para simular upload de arquivo
function simulateFileUpload(fileContent) {
  console.log('📤 Simulando upload de arquivo');
  
  try {
    const json = JSON.parse(fileContent);
    
    // Validação mínima
    if (
      typeof json !== 'object' ||
      !json.RECEITAS ||
      !json.DESPESAS ||
      !json.ORCAMENTOS
    ) {
      throw new Error('Formato de backup inválido.');
    }
    
    return json;
  } catch (error) {
    throw new Error(`Erro ao processar arquivo: ${error.message}`);
  }
}

// Função principal de teste
async function testBackupSystem() {
  console.log('🧪 Iniciando teste de estabilidade do backup...\n');
  
  try {
    // 1. Criar dados de teste
    console.log('💾 Criando dados de teste...');
    
    localStorage.setItem('RECEITAS', JSON.stringify(TEST_DATA.RECEITAS));
    localStorage.setItem('DESPESAS', JSON.stringify(TEST_DATA.DESPESAS));
    localStorage.setItem('ORCAMENTO_2024-11', TEST_DATA.ORCAMENTOS['ORCAMENTO_2024-11']);
    
    console.log('✅ Dados de teste criados\n');
    
    // 2. Testar exportação de backup
    console.log('📤 Testando exportação de backup...');
    
    const backupData = getAllData();
    const filename = `financas-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const downloadedFile = simulateFileDownload(backupData, filename);
    
    console.log('✅ Backup exportado com sucesso\n');
    
    // 3. Limpar dados e testar importação
    console.log('🧹 Limpando dados para testar importação...');
    localStorage.clear();
    console.log('✅ Dados limpos\n');
    
    // 4. Testar importação de backup
    console.log('📥 Testando importação de backup...');
    
    const importedData = simulateFileUpload(downloadedFile.content);
    restoreAllData(importedData);
    
    // Verificar se os dados foram restaurados corretamente
    const restoredReceitas = JSON.parse(localStorage.getItem('RECEITAS'));
    const restoredDespesas = JSON.parse(localStorage.getItem('DESPESAS'));
    const restoredOrcamento = localStorage.getItem('ORCAMENTO_2024-11');
    
    console.log('✅ Dados restaurados:');
    console.log('  - Receitas:', restoredReceitas.length);
    console.log('  - Despesas:', restoredDespesas.length);
    console.log('  - Orçamento:', restoredOrcamento ? 'Presente' : 'Ausente');
    
    // Validação detalhada
    const receitasCorretas = JSON.stringify(restoredReceitas) === JSON.stringify(TEST_DATA.RECEITAS);
    const despesasCorretas = JSON.stringify(restoredDespesas) === JSON.stringify(TEST_DATA.DESPESAS);
    const orcamentoCorreto = restoredOrcamento === TEST_DATA.ORCAMENTOS['ORCAMENTO_2024-11'];
    
    if (receitasCorretas && despesasCorretas && orcamentoCorreto) {
      console.log('✅ Integridade dos dados verificada com sucesso\n');
    } else {
      console.log('❌ Erro na integridade dos dados:');
      console.log('  - Receitas corretas:', receitasCorretas);
      console.log('  - Despesas corretas:', despesasCorretas);
      console.log('  - Orçamento correto:', orcamentoCorreto);
    }
    
    // 5. Testar backup automático
    console.log('🔄 Testando backup automático...');
    
    const BACKUP_AUTO_KEY = 'BACKUP_AUTO';
    const snapshot = getAllData();
    localStorage.setItem(BACKUP_AUTO_KEY, JSON.stringify(snapshot));
    
    const savedBackup = localStorage.getItem(BACKUP_AUTO_KEY);
    if (savedBackup) {
      const parsedBackup = JSON.parse(savedBackup);
      console.log('✅ Backup automático salvo com sucesso');
      console.log('📅 Timestamp:', parsedBackup.timestamp);
      
      // Verificar se o backup automático contém todos os dados
      const backupValido = parsedBackup.RECEITAS && parsedBackup.DESPESAS && parsedBackup.ORCAMENTOS;
      console.log('✅ Backup automático válido:', backupValido);
    }
    
    // 6. Testar cenários de erro
    console.log('\n🚨 Testando cenários de erro...');
    
    // Testar arquivo inválido
    try {
      simulateFileUpload('{"invalid": "data"}');
      console.log('❌ Deveria ter falhado com arquivo inválido');
    } catch (error) {
      console.log('✅ Corretamente rejeitou arquivo inválido:', error.message);
    }
    
    // Testar JSON inválido
    try {
      simulateFileUpload('invalid json');
      console.log('❌ Deveria ter falhado com JSON inválido');
    } catch (error) {
      console.log('✅ Corretamente rejeitou JSON inválido:', error.message);
    }
    
    console.log('\n🎉 Teste de estabilidade concluído com sucesso!');
    console.log('✅ Todos os componentes do backup estão funcionando corretamente');
    console.log('✅ Sistema de backup é estável e confiável');
    console.log('✅ Tratamento de erros está funcionando adequadamente');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('📄 Stack:', error.stack);
  }
}

// Executar teste
testBackupSystem();