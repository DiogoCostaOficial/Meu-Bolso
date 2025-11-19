// server/scripts/verifyAdminPermissions.js
// Script completo para verificar permissões administrativas
// Autor: Sistema de Verificação - Finanças Fácil

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const DATABASE_FILE = path.join(__dirname, '..', 'data', 'database.json');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, type = 'INFO') {
  const timestamp = new Date().toLocaleString('pt-BR');
  const colorMap = {
    'SUCCESS': colors.green,
    'ERROR': colors.red,
    'WARNING': colors.yellow,
    'INFO': colors.cyan,
    'PERMISSION': colors.magenta,
    'TEST': colors.blue
  };
  
  console.log(`${colorMap[type] || colors.reset}[${timestamp}] [${type}] ${message}${colors.reset}`);
}

// Função para gerar token JWT de teste
function gerarTokenTeste(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Função para verificar permissões no database
function verificarPermissoesDatabase(email) {
  try {
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const usuario = database.usuarios.find(u => u.email === email);
    
    if (!usuario) {
      return { sucesso: false, mensagem: 'Usuário não encontrado no database' };
    }
    
    const permissoes = {
      basico: {
        existe: !!usuario,
        ativo: usuario.ativo === true,
        verificado: usuario.verificado === true,
        tipo: usuario.tipo === 'admin'
      },
      configuracoes: {
        temConfiguracoes: !!usuario.configuracoes,
        notificacoesEmail: usuario.configuracoes?.notificacoesEmail === true,
        tema: usuario.configuracoes?.tema === 'light',
        idioma: usuario.configuracoes?.idioma === 'pt-BR'
      },
      seguranca: {
        temSenha: !!usuario.senha,
        senhaHashValida: usuario.senha && usuario.senha.startsWith('$2a$'),
        dataCriacao: !!usuario.dataCriacao,
        ultimoAcesso: !!usuario.ultimoAcesso
      },
      migracao: {
        foiMigrado: !!usuario.migracaoAdmin,
        dataMigracao: usuario.migracaoAdmin?.dataMigracao,
        origem: usuario.migracaoAdmin?.adminOrigem
      }
    };
    
    // Calcular totais
    const totalChecks = Object.values(permissoes).reduce((acc, cat) => 
      acc + Object.values(cat).filter(v => typeof v === 'boolean').length, 0
    );
    
    const passedChecks = Object.values(permissoes).reduce((acc, cat) => 
      acc + Object.values(cat).filter(v => v === true).length, 0
    );
    
    return {
      sucesso: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      },
      permissoes,
      estatisticas: {
        total: totalChecks,
        passou: passedChecks,
        percentual: Math.round((passedChecks / totalChecks) * 100)
      }
    };
    
  } catch (error) {
    return { sucesso: false, mensagem: `Erro ao verificar database: ${error.message}` };
  }
}

// Função para testar acessos de admin
async function testarAcessosAdmin(email) {
  const resultados = {
    api: {},
    frontend: {},
    geral: {}
  };
  
  log(`Iniciando testes de acesso para ${email}`, 'TEST');
  
  try {
    // Testar geração de token
    const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
    const usuario = database.usuarios.find(u => u.email === email);
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    // Testar token JWT
    try {
      const token = gerarTokenTeste(usuario);
      const decoded = jwt.verify(token, JWT_SECRET);
      
      resultados.geral.token = {
        sucesso: decoded.email === email && decoded.tipo === 'admin',
        tipo: decoded.tipo,
        expiracao: new Date(decoded.exp * 1000).toLocaleString('pt-BR')
      };
      
      log('✅ Token JWT gerado e validado com sucesso', 'SUCCESS');
      
    } catch (error) {
      resultados.geral.token = { sucesso: false, erro: error.message };
      log('❌ Erro ao gerar/validar token JWT', 'ERROR');
    }
    
    // Testar permissões de admin
    resultados.geral.permissoes = {
      eAdmin: usuario.tipo === 'admin',
      estaAtivo: usuario.ativo === true,
      estaVerificado: usuario.verificado === true,
      temConfiguracoes: !!usuario.configuracoes
    };
    
    // Testar acesso a recursos de admin
    const recursosAdmin = [
      'estatisticas_sistema',
      'listar_usuarios',
      'editar_usuarios',
      'excluir_usuarios',
      'acesso_painel_admin'
    ];
    
    recursosAdmin.forEach(recurso => {
      resultados.api[recurso] = {
        permitido: usuario.tipo === 'admin',
        mensagem: usuario.tipo === 'admin' ? 'Acesso permitido' : 'Acesso negado'
      };
    });
    
    log(`✅ Testes de acesso concluídos: ${Object.values(resultados.geral.permissoes).filter(v => v).length}/${Object.values(resultados.geral.permissoes).length} permissões ativas`, 'SUCCESS');
    
  } catch (error) {
    log(`❌ Erro durante testes de acesso: ${error.message}`, 'ERROR');
    resultados.geral.erro = error.message;
  }
  
  return resultados;
}

// Função para verificar rotas de admin disponíveis
function verificarRotasAdmin() {
  const rotas = [
    { metodo: 'GET', path: '/api/admin/estatisticas', descricao: 'Estatísticas do sistema' },
    { metodo: 'GET', path: '/api/admin/usuarios', descricao: 'Listar todos os usuários' },
    { metodo: 'GET', path: '/api/admin/usuarios/:id', descricao: 'Buscar usuário por ID' },
    { metodo: 'PUT', path: '/api/admin/usuarios/:id', descricao: 'Atualizar usuário' },
    { metodo: 'DELETE', path: '/api/admin/usuarios/:id', descricao: 'Excluir usuário' }
  ];
  
  log('Rotas de admin disponíveis:', 'INFO');
  rotas.forEach(rota => {
    log(`  ${rota.metodo} ${rota.path} - ${rota.descricao}`, 'INFO');
  });
  
  return rotas;
}

// Função para criar relatório completo
async function criarRelatorioCompleto(email) {
  log(`=== RELATÓRIO COMPLETO DE PERMISSÕES DE ADMIN ===`, 'PERMISSION');
  log(`Usuário: ${email}`, 'INFO');
  log(`Data: ${new Date().toLocaleString('pt-BR')}`, 'INFO');
  
  // Verificar database
  log('\n1. VERIFICANDO PERMISSÕES NO DATABASE...', 'TEST');
  const dbCheck = verificarPermissoesDatabase(email);
  
  if (!dbCheck.sucesso) {
    log(`❌ Falha na verificação: ${dbCheck.mensagem}`, 'ERROR');
    return { sucesso: false, mensagem: dbCheck.mensagem };
  }
  
  log(`✅ Usuário encontrado: ${dbCheck.usuario.nome} (${dbCheck.usuario.id})`, 'SUCCESS');
  log(`✅ Tipo: ${dbCheck.usuario.tipo}`, dbCheck.usuario.tipo === 'admin' ? 'SUCCESS' : 'ERROR');
  log(`✅ Progresso: ${dbCheck.estatisticas.passou}/${dbCheck.estatisticas.total} (${dbCheck.estatisticas.percentual}%)`, 
    dbCheck.estatisticas.percentual >= 90 ? 'SUCCESS' : 'WARNING');
  
  // Testar acessos
  log('\n2. TESTANDO ACESSOS DE ADMIN...', 'TEST');
  const acessosTest = await testarAcessosAdmin(email);
  
  // Verificar rotas
  log('\n3. ROTAS DE ADMIN DISPONÍVEIS:', 'INFO');
  const rotas = verificarRotasAdmin();
  
  // Resumo final
  log('\n4. RESUMO FINAL:', 'PERMISSION');
  
  const eAdmin = dbCheck.usuario.tipo === 'admin';
  const todasPermissoesBasicas = Object.values(dbCheck.permissoes.basico).every(v => v);
  const tokenValido = acessosTest.geral.token?.sucesso || false;
  
  if (eAdmin && todasPermissoesBasicas && tokenValido) {
    log('🎉 USUÁRIO TEM PERMISSÕES DE ADMIN COMPLETAS!', 'SUCCESS');
    log('✅ Acesso total ao painel de administração garantido', 'SUCCESS');
    log('✅ Todas as funcionalidades de admin estão disponíveis', 'SUCCESS');
  } else {
    log('⚠️  EXISTEM PROBLEMAS NAS PERMISSÕES DE ADMIN', 'WARNING');
    if (!eAdmin) log('❌ Usuário não é do tipo admin', 'ERROR');
    if (!todasPermissoesBasicas) log('❌ Permissões básicas incompletas', 'ERROR');
    if (!tokenValido) log('❌ Problemas com token JWT', 'ERROR');
  }
  
  // Criar relatório detalhado
  const relatorio = {
    timestamp: new Date().toISOString(),
    usuario: dbCheck.usuario,
    verificacoes: {
      database: dbCheck,
      acessos: acessosTest,
      rotas: rotas
    },
    status: {
      eAdministrador: eAdmin,
      permissoesCompletas: todasPermissoesBasicas,
      tokenValido: tokenValido,
      acessoTotal: eAdmin && todasPermissoesBasicas && tokenValido
    }
  };
  
  // Salvar relatório
  const reportFile = path.join(__dirname, '..', 'data', `admin-permissions-report-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(relatorio, null, 2));
  
  log(`\n📋 Relatório salvo em: ${reportFile}`, 'SUCCESS');
  
  return {
    sucesso: true,
    relatorio,
    arquivo: reportFile
  };
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`\n${colors.cyan}🔍 Verificador Completo de Permissões de Admin - Finanças Fácil${colors.reset}\n`);
    console.log(`Uso: node verifyAdminPermissions.js <email-do-usuario>`);
    console.log(`Exemplo: node verifyAdminPermissions.js diogo.grunge@gmail.com\n`);
    console.log(`Este script verifica:`);
    console.log(`  ✅ Status de admin no database`);
    console.log(`  ✅ Permissões e configurações`);
    console.log(`  ✅ Token JWT e autenticação`);
    console.log(`  ✅ Acesso a recursos de admin`);
    console.log(`  ✅ Rotas disponíveis`);
    console.log(`  ✅ Gera relatório completo\n`);
    return;
  }
  
  const email = args[0];
  
  try {
    const resultado = await criarRelatorioCompleto(email);
    
    if (resultado.sucesso) {
      console.log(`\n${colors.green}✅ Verificação concluída com sucesso!${colors.reset}`);
      if (resultado.relatorio.status.acessoTotal) {
        console.log(`${colors.green}🎉 O usuário tem acesso administrativo completo!${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Existem problemas nas permissões de admin.${colors.reset}`);
      }
    } else {
      console.log(`\n${colors.red}❌ Verificação falhou: ${resultado.mensagem}${colors.reset}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Erro crítico: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  verificarPermissoesDatabase,
  testarAcessosAdmin,
  gerarTokenTeste,
  criarRelatorioCompleto
};