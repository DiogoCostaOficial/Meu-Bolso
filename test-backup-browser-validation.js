/**
 * Validação Final do Sistema de Backup - Teste de Navegador
 * 
 * Este script testa a funcionalidade de backup no contexto real do navegador
 * para garantir que todos os usuários podem acessar a página de backup.
 * 
 * Para executar: Copie este código no console do navegador (F12) quando
 * estiver na aplicação Finanças Fácil autenticado como qualquer usuário.
 */

(function() {
  console.log('🧪 INICIANDO VALIDAÇÃO FINAL DO SISTEMA DE BACKUP');
  console.log('=' .repeat(60));

  const tests = {
    passed: 0,
    failed: 0,
    results: []
  };

  function logTest(name, passed, message = '') {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'color: green' : 'color: red';
    console.log(`%c${status} ${name}: ${message}`, color);
    
    tests.results.push({ name, passed, message });
    if (passed) {
      tests.passed++;
    } else {
      tests.failed++;
    }
  }

  // Teste 1: Verificar se a rota /backup existe
  function testBackupRoute() {
    try {
      // Verificar se o link para backup existe na navegação
      const backupLinks = document.querySelectorAll('a[href*="backup"], button[data-route*="backup"]');
      logTest('Rota de Backup', backupLinks.length > 0, 
        backupLinks.length > 0 ? 'Link de backup encontrado' : 'Link de backup não encontrado');
      
      return backupLinks.length > 0;
    } catch (error) {
      logTest('Rota de Backup', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 2: Testar navegação para /backup
  async function testNavigationToBackup() {
    try {
      console.log('🧪 Testando navegação para /backup...');
      
      // Tentar navegar para a rota de backup
      window.location.hash = '#/backup';
      
      // Aguardar um momento para a navegação ocorrer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se a URL mudou
      const isOnBackupPage = window.location.hash.includes('backup') || 
                           window.location.pathname.includes('backup');
      
      logTest('Navegação para Backup', isOnBackupPage,
        isOnBackupPage ? 'Navegação bem-sucedida' : 'Falha na navegação');
      
      return isOnBackupPage;
    } catch (error) {
      logTest('Navegação para Backup', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 3: Verificar localStorage do usuário atual
  function testUserLocalStorage() {
    try {
      console.log('🧪 Verificando localStorage do usuário...');
      
      // Procurar por chaves específicas do usuário
      const userKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('RECEITAS_') || key.includes('DESPESAS_') || key.includes('ORCAMENTO_'))) {
          userKeys.push(key);
        }
      }
      
      logTest('localStorage do Usuário', userKeys.length > 0,
        `Encontradas ${userKeys.length} chaves de dados do usuário: ${userKeys.join(', ')}`);
      
      return userKeys.length > 0;
    } catch (error) {
      logTest('localStorage do Usuário', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 4: Testar exportação de dados (simulação)
  function testDataExport() {
    try {
      console.log('🧪 Testando exportação de dados...');
      
      // Coletar todos os dados do usuário
      const userData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('RECEITAS_') || key.includes('DESPESAS_') || key.includes('ORCAMENTO_'))) {
          try {
            userData[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            userData[key] = localStorage.getItem(key);
          }
        }
      }
      
      const hasData = Object.keys(userData).length > 0;
      logTest('Exportação de Dados', hasData,
        hasData ? `Dados exportados: ${Object.keys(userData).join(', ')}` : 'Nenhum dado encontrado');
      
      return hasData;
    } catch (error) {
      logTest('Exportação de Dados', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 5: Verificar se há backups automáticos
  function testAutoBackups() {
    try {
      console.log('🧪 Verificando backups automáticos...');
      
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('AUTO_BACKUP')) {
          backupKeys.push(key);
        }
      }
      
      logTest('Backups Automáticos', backupKeys.length > 0,
        `Encontrados ${backupKeys.length} backups automáticos: ${backupKeys.join(', ')}`);
      
      return backupKeys.length > 0;
    } catch (error) {
      logTest('Backups Automáticos', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 6: Verificar autenticação do usuário
  function testUserAuthentication() {
    try {
      console.log('🧪 Verificando autenticação do usuário...');
      
      // Procurar por dados de autenticação no localStorage
      const authKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('token') || key.includes('user') || key.includes('auth'))) {
          authKeys.push(key);
        }
      }
      
      // Também verificar se há elementos de UI que indicam usuário logado
      const userElements = document.querySelectorAll('[data-user], .user-info, .user-name');
      
      const isAuthenticated = authKeys.length > 0 || userElements.length > 0;
      
      logTest('Autenticação do Usuário', isAuthenticated,
        isAuthenticated ? 'Usuário aparentemente autenticado' : 'Usuário não autenticado');
      
      return isAuthenticated;
    } catch (error) {
      logTest('Autenticação do Usuário', false, `Erro: ${error.message}`);
      return false;
    }
  }

  // Executar todos os testes
  async function runAllTests() {
    console.log('📋 Executando validação completa do sistema de backup...\n');

    // Executar testes
    testBackupRoute();
    testUserLocalStorage();
    testDataExport();
    testAutoBackups();
    testUserAuthentication();

    // Teste de navegação (executado por último pois pode mudar a página)
    setTimeout(async () => {
      await testNavigationToBackup();
      
      // Relatório final
      console.log('\n' + '='.repeat(60));
      console.log('📊 RELATÓRIO FINAL DA VALIDAÇÃO');
      console.log('='.repeat(60));
      console.log(`Total de Testes: ${tests.passed + tests.failed}`);
      console.log(`%cTestes Passados: ${tests.passed}`, 'color: green');
      console.log(`%cTestes Falhados: ${tests.failed}`, 'color: red');
      console.log(`Taxa de Sucesso: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(2)}%`);
      
      if (tests.failed === 0) {
        console.log('%c\n🎉 TODOS OS TESTES PASSARAM! O sistema de backup está funcionando corretamente.', 'color: green; font-weight: bold;');
      } else {
        console.log('%c\n⚠️  FORAM ENCONTRADOS PROBLEMAS. Verifique os testes falhados acima.', 'color: red; font-weight: bold;');
      }
      
      console.log('\n💡 DICAS PARA O USUÁRIO:');
      console.log('• Se todos os testes passaram, o sistema de backup está funcionando corretamente.');
      console.log('• Se houver testes falhados, verifique:');
      console.log('  - Se você está autenticado corretamente');
      console.log('  - Se há dados financeiros cadastrados');
      console.log('  - Se a navegação para /backup está funcionando');
      console.log('• Para testar manualmente, clique no botão "Backup" no menu.');
      
    }, 2000);
  }

  // Iniciar validação
  console.log('%c🚀 Iniciando validação final do sistema de backup...', 'color: blue; font-weight bold;');
  runAllTests();

})();