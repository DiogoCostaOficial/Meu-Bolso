// server/scripts/testAdminAccess.js
// Script prático para testar acesso administrativo completo
// Autor: Sistema de Testes - Finanças Fácil

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const DATABASE_FILE = path.join(__dirname, '..', 'data', 'database.json');

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleString('pt-BR');
  const colorMap = {
    'SUCCESS': colors.green,
    'ERROR': colors.red,
    'WARNING': colors.yellow,
    'INFO': colors.cyan,
    'TEST': colors.blue
  };
  
  console.log(`${colorMap[type] || colors.reset}[${timestamp}] [${type}] ${message}${colors.reset}`);
}

// Função para obter token de admin
async function obterTokenAdmin(email, senha) {
  try {
    log(`Obtendo token para ${email}`, 'TEST');
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: email,
      senha: senha
    });
    
    if (response.data.success) {
      log('✅ Login realizado com sucesso', 'SUCCESS');
      log(`   Usuário: ${response.data.user.nome}`, 'INFO');
      log(`   Tipo: ${response.data.user.tipo}`, 'INFO');
      return response.data.token;
    } else {
      log(`❌ Falha no login: ${response.data.message}`, 'ERROR');
      return null;
    }
    
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error.response?.data?.message || error.message}`, 'ERROR');
    return null;
  }
}

// Função para testar acesso a recursos de admin
async function testarAcessoAdmin(token, email) {
  const resultados = {
    autenticacao: {},
    admin: {},
    erros: []
  };
  
  log('\n=== TESTANDO ACESSOS ADMINISTRATIVOS ===', 'TEST');
  
  // Configurar axios com token
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Adicionar interceptores para logging
  api.interceptors.request.use(config => {
    log(`Requisição: ${config.method?.toUpperCase()} ${config.url}`, 'INFO');
    return config;
  });
  
  api.interceptors.response.use(
    response => {
      log(`✅ Sucesso: ${response.status} ${response.statusText}`, 'SUCCESS');
      return response;
    },
    error => {
      log(`❌ Erro: ${error.response?.status || 'Network'} ${error.response?.statusText || 'Error'}`, 'ERROR');
      if (error.response?.data?.message) {
        log(`   Mensagem: ${error.response.data.message}`, 'ERROR');
      }
      return Promise.reject(error);
    }
  );
  
  // Test 1: Estatísticas do sistema
  try {
    log('\n1. Testando acesso às estatísticas do sistema...', 'TEST');
    const response = await api.get('/admin/estatisticas');
    
    resultados.admin.estatisticas = {
      sucesso: true,
      dados: response.data.dados,
      mensagem: 'Acesso permitido às estatísticas'
    };
    
    log(`   Total de usuários: ${response.data.dados.totalUsuarios}`, 'INFO');
    log(`   Usuários com acesso: ${response.data.dados.usuariosComAcesso}`, 'INFO');
    
  } catch (error) {
    resultados.admin.estatisticas = {
      sucesso: false,
      erro: error.response?.data?.message || error.message
    };
    resultados.erros.push('Falha ao acessar estatísticas');
  }
  
  // Test 2: Listar todos os usuários
  try {
    log('\n2. Testando acesso à lista de usuários...', 'TEST');
    const response = await api.get('/admin/usuarios');
    
    resultados.admin.usuarios = {
      sucesso: true,
      quantidade: response.data.dados.length,
      mensagem: 'Acesso permitido à lista de usuários'
    };
    
    log(`   Usuários encontrados: ${response.data.dados.length}`, 'INFO');
    
    // Verificar se o próprio admin está na lista
    const adminUser = response.data.dados.find(u => u.email === email);
    if (adminUser) {
      log(`   ✅ Admin encontrado na lista: ${adminUser.nome} (${adminUser.tipo})`, 'SUCCESS');
    }
    
  } catch (error) {
    resultados.admin.usuarios = {
      sucesso: false,
      erro: error.response?.data?.message || error.message
    };
    resultados.erros.push('Falha ao acessar lista de usuários');
  }
  
  // Test 3: Buscar usuário específico (o próprio admin)
  try {
    log('\n3. Testando busca de usuário específico...', 'TEST');
    
    // Primeiro precisamos obter o ID do usuário
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const usuario = database.usuarios.find(u => u.email === email);
    
    if (usuario) {
      const response = await api.get(`/admin/usuarios/${usuario.id}`);
      
      resultados.admin.buscarUsuario = {
        sucesso: true,
        usuario: response.data.dados,
        mensagem: 'Acesso permitido à busca de usuário'
      };
      
      log(`   ✅ Usuário encontrado: ${response.data.dados.nome}`, 'SUCCESS');
      log(`   Email: ${response.data.dados.email}`, 'INFO');
      log(`   Tipo: ${response.data.dados.tipo}`, 'INFO');
    } else {
      throw new Error('Usuário não encontrado no database');
    }
    
  } catch (error) {
    resultados.admin.buscarUsuario = {
      sucesso: false,
      erro: error.response?.data?.message || error.message
    };
    resultados.erros.push('Falha ao buscar usuário específico');
  }
  
  // Test 4: Testar acesso negado para usuário não-admin (opcional)
  log('\n4. Verificando segurança do sistema...', 'TEST');
  
  // Criar um token inválido para testar acesso negado
  try {
    const apiInvalid = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': 'Bearer token_invalido',
        'Content-Type': 'application/json'
      }
    });
    
    await apiInvalid.get('/admin/estatisticas');
    log('⚠️  Atenção: Token inválido foi aceito (problema de segurança)', 'WARNING');
    
  } catch (error) {
    if (error.response?.status === 401) {
      log('✅ Token inválido corretamente rejeitado', 'SUCCESS');
      resultados.autenticacao.segurancaToken = true;
    } else {
      log('⚠️  Resposta inesperada para token inválido', 'WARNING');
    }
  }
  
  return resultados;
}

// Função para testar funcionalidades específicas de admin
async function testarFuncionalidadesAdmin(token) {
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const funcionalidades = {
    criarUsuario: { sucesso: false, testado: false },
    editarUsuario: { sucesso: false, testado: false },
    excluirUsuario: { sucesso: false, testado: false }
  };
  
  log('\n=== TESTANDO FUNCIONALIDADES ADMIN AVANÇADAS ===', 'TEST');
  
  // Test 1: Criar novo usuário
  try {
    log('\n1. Testando criação de novo usuário...', 'TEST');
    const novoUsuario = {
      nome: 'Usuário Teste Admin',
      email: `teste-admin-${Date.now()}@exemplo.com`,
      senha: '123456'
    };
    
    const response = await axios.post(`${API_BASE}/auth/registrar`, novoUsuario);
    
    if (response.data.success) {
      log('✅ Criação de usuário funcionando', 'SUCCESS');
      funcionalidades.criarUsuario = { sucesso: true, testado: true };
      
      // Obter ID do usuário criado para testes posteriores
      const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
      const usuarioCriado = database.usuarios.find(u => u.email === novoUsuario.email);
      
      if (usuarioCriado) {
        funcionalidades.usuarioTesteId = usuarioCriado.id;
        
        // Test 2: Editar usuário
        try {
          log('\n2. Testando edição de usuário...', 'TEST');
          const dadosAtualizacao = {
            nome: 'Usuário Teste Editado',
            email: novoUsuario.email,
            tipo: 'usuario'
          };
          
          const editResponse = await api.put(`/admin/usuarios/${usuarioCriado.id}`, dadosAtualizacao);
          
          if (editResponse.data.sucesso) {
            log('✅ Edição de usuário funcionando', 'SUCCESS');
            funcionalidades.editarUsuario = { sucesso: true, testado: true };
          }
          
        } catch (error) {
          log(`❌ Falha na edição: ${error.response?.data?.message || error.message}`, 'ERROR');
          funcionalidades.editarUsuario = { sucesso: false, testado: true, erro: error.message };
        }
        
        // Test 3: Excluir usuário
        try {
          log('\n3. Testando exclusão de usuário...', 'TEST');
          
          const deleteResponse = await api.delete(`/admin/usuarios/${usuarioCriado.id}`);
          
          if (deleteResponse.data.sucesso) {
            log('✅ Exclusão de usuário funcionando', 'SUCCESS');
            funcionalidades.excluirUsuario = { sucesso: true, testado: true };
          }
          
        } catch (error) {
          log(`❌ Falha na exclusão: ${error.response?.data?.message || error.message}`, 'ERROR');
          funcionalidades.excluirUsuario = { sucesso: false, testado: true, erro: error.message };
        }
      }
    }
    
  } catch (error) {
    log(`❌ Falha na criação de usuário: ${error.response?.data?.message || error.message}`, 'ERROR');
    funcionalidades.criarUsuario = { sucesso: false, testado: true, erro: error.message };
  }
  
  return funcionalidades;
}

// Função principal
async function testarAcessoCompleto(email, senha) {
  log(`=== TESTE COMPLETO DE ACESSO ADMINISTRATIVO ===`, 'TEST');
  log(`Usuário: ${email}`, 'INFO');
  log(`Data: ${new Date().toLocaleString('pt-BR')}`, 'INFO');
  
  // Obter token
  const token = await obterTokenAdmin(email, senha);
  
  if (!token) {
    log('❌ Não foi possível obter token. Testes cancelados.', 'ERROR');
    return { sucesso: false, mensagem: 'Falha na autenticação' };
  }
  
  // Testar acessos básicos
  log('\n' + '='.repeat(60), 'TEST');
  const resultadosBasicos = await testarAcessoAdmin(token, email);
  
  // Testar funcionalidades avançadas
  log('\n' + '='.repeat(60), 'TEST');
  const funcionalidades = await testarFuncionalidadesAdmin(token);
  
  // Gerar relatório final
  const relatorioFinal = {
    timestamp: new Date().toISOString(),
    usuario: email,
    token: token.substring(0, 20) + '...', // Token parcial para segurança
    resultados: {
      autenticacao: resultadosBasicos.autenticacao,
      admin: resultadosBasicos.admin,
      funcionalidades: funcionalidades,
      erros: resultadosBasicos.erros
    },
    estatisticas: {
      totalTestes: Object.keys(resultadosBasicos.admin).length + Object.keys(funcionalidades).length,
      sucessos: Object.values(resultadosBasicos.admin).filter(r => r.sucesso).length + 
                Object.values(funcionalidades).filter(f => f.sucesso).length,
      falhas: resultadosBasicos.erros.length
    }
  };
  
  // Análise final
  log('\n' + '='.repeat(60), 'TEST');
  log('ANÁLISE FINAL DOS TESTES', 'TEST');
  
  const acessoEstatisticas = resultadosBasicos.admin.estatisticas?.sucesso || false;
  const acessoUsuarios = resultadosBasicos.admin.usuarios?.sucesso || false;
  const acessoBusca = resultadosBasicos.admin.buscarUsuario?.sucesso || false;
  const segurancaToken = resultadosBasicos.autenticacao.segurancaToken || false;
  
  const funcCriar = funcionalidades.criarUsuario.sucesso;
  const funcEditar = funcionalidades.editarUsuario.sucesso;
  const funcExcluir = funcionalidades.excluirUsuario.sucesso;
  
  const acessoTotal = acessoEstatisticas && acessoUsuarios && acessoBusca;
  const funcionalidadesTotal = funcCriar && funcEditar && funcExcluir;
  const segurancaTotal = segurancaToken;
  
  if (acessoTotal && funcionalidadesTotal && segurancaTotal) {
    log('🎉 ACESSO ADMINISTRATIVO COMPLETO VERIFICADO!', 'SUCCESS');
    log('✅ Todas as funcionalidades de admin estão funcionando', 'SUCCESS');
    log('✅ Acesso total ao painel de administração', 'SUCCESS');
    log('✅ Segurança do sistema está ativa', 'SUCCESS');
    relatorioFinal.status = 'APROVADO';
  } else {
    log('⚠️  EXISTEM PROBLEMAS NO ACESSO ADMINISTRATIVO', 'WARNING');
    if (!acessoTotal) log('❌ Problemas de acesso a recursos básicos', 'ERROR');
    if (!funcionalidadesTotal) log('❌ Problemas em funcionalidades avançadas', 'ERROR');
    if (!segurancaTotal) log('❌ Problemas de segurança', 'ERROR');
    relatorioFinal.status = 'REPROVADO';
  }
  
  // Salvar relatório
  const reportFile = path.join(__dirname, '..', 'data', `admin-access-test-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(relatorioFinal, null, 2));
  
  log(`\n📋 Relatório completo salvo em: ${reportFile}`, 'SUCCESS');
  
  return {
    sucesso: acessoTotal && funcionalidadesTotal && segurancaTotal,
    relatorio: relatorioFinal,
    arquivo: reportFile
  };
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`\n${colors.cyan}🔧 Testador Completo de Acesso Administrativo - Finanças Fácil${colors.reset}\n`);
    console.log(`Uso: node testAdminAccess.js <email> <senha>`);
    console.log(`Exemplo: node testAdminAccess.js diogo.grunge@gmail.com 123456\n`);
    console.log(`Este script testa:`);
    console.log(`  ✅ Login e autenticação`);
    console.log(`  ✅ Acesso a estatísticas do sistema`);
    console.log(`  ✅ Listagem de usuários`);
    console.log(`  ✅ Busca de usuários específicos`);
    console.log(`  ✅ Criação, edição e exclusão de usuários`);
    console.log(`  ✅ Segurança do sistema`);
    console.log(`  ✅ Gera relatório completo\n`);
    return;
  }
  
  const [email, senha] = args;
  
  try {
    const resultado = await testarAcessoCompleto(email, senha);
    
    console.log(`\n${colors.cyan}=== RESUMO FINAL ===${colors.reset}`);
    if (resultado.sucesso) {
      console.log(`${colors.green}🎉 USUÁRIO TEM ACESSO ADMINISTRATIVO COMPLETO!${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ EXISTEM PROBLEMAS NO ACESSO ADMINISTRATIVO${colors.reset}`);
    }
    console.log(`${colors.cyan}📊 Relatório: ${resultado.arquivo}${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Erro crítico: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  testarAcessoCompleto,
  obterTokenAdmin,
  testarAcessoAdmin,
  testarFuncionalidadesAdmin
};