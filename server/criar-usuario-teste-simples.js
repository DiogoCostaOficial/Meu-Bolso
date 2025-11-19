// Criar usuário de teste simples (sem bcrypt)
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data/database.json');

console.log('🔧 Criando usuário de teste simples...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Criar novo usuário de teste com senha simples (sem hash)
  const novoUsuario = {
    id: `user-teste-simples-${Date.now()}`,
    nome: 'Teste Dashboard Simples',
    email: 'teste.simples@teste.com',
    senha: '$2a$10$SimplesHashParaTeste123456789012345678901234567890123456', // Hash simples
    tipo: 'usuario',
    ativo: true,
    primeiroAcesso: false,
    verificado: true,
    otpCodigo: null,
    otpExpira: null,
    dataCriacao: new Date().toISOString(),
    ultimoAcesso: new Date().toISOString()
  };
  
  // Adicionar usuário
  dbData.usuarios.push(novoUsuario);
  
  // Criar dados financeiros para teste
  const dadosTeste = {
    receitas: [
      {
        id: 1,
        descricao: 'Salário Teste Simples',
        valor: 5000.00,
        data: '2025-01-05',
        categoria: 'Receita Principal',
        subcategoria: 'Salário',
        observacoes: 'Receita de teste simples',
        recorrente: false
      },
      {
        id: 2,
        descricao: 'Freelance Teste Simples',
        valor: 2000.00,
        data: '2025-01-15',
        categoria: 'Receita Principal',
        subcategoria: 'Freelance',
        observacoes: 'Receita de teste simples',
        recorrente: false
      }
    ],
    despesas: [
      {
        id: 1,
        descricao: 'Aluguel Teste Simples',
        valor: 1500.00,
        data: '2025-01-10',
        categoria: 'Despesas Fixas',
        subcategoria: 'Moradia',
        observacoes: 'Despesa de teste simples',
        parcelado: false,
        numeroParcelas: 1,
        statusPagamento: 'pago',
        dataVencimento: '2025-01-10'
      },
      {
        id: 2,
        descricao: 'Supermercado Teste Simples',
        valor: 500.00,
        data: '2025-01-20',
        categoria: 'Lazer',
        subcategoria: 'Alimentação',
        observacoes: 'Despesa de teste simples',
        parcelado: false,
        numeroParcelas: 1,
        statusPagamento: 'pago',
        dataVencimento: '2025-01-20'
      }
    ],
    categorias: [],
    orcamentos: []
  };
  
  // Salvar dados do usuário de teste
  const dadosPath = path.join(process.cwd(), `data/USER_DATA_${novoUsuario.id}.json`);
  fs.writeFileSync(dadosPath, JSON.stringify(dadosTeste, null, 2));
  
  // Salvar banco de dados atualizado
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  
  console.log('✅ Usuário de teste simples criado com sucesso!');
  console.log('\n📋 Dados do usuário de teste:');
  console.log(`   - Email: ${novoUsuario.email}`);
  console.log(`   - Senha: teste123`);
  console.log(`   - ID: ${novoUsuario.id}`);
  console.log(`   - Verificado: ${novoUsuario.verificado}`);
  console.log(`   - Ativo: ${novoUsuario.ativo}`);
  console.log('\n📊 Dados financeiros de teste:');
  console.log(`   - Receitas: ${dadosTeste.receitas.length}`);
  console.log(`   - Despesas: ${dadosTeste.despesas.length}`);
  console.log(`   - Total receitas: R$ ${dadosTeste.receitas.reduce((acc, rec) => acc + rec.valor, 0).toFixed(2)}`);
  console.log(`   - Total despesas: R$ ${dadosTeste.despesas.reduce((acc, desp) => acc + desp.valor, 0).toFixed(2)}`);
  
  console.log('\n🎯 Agora teste o login com:');
  console.log('   - Email: teste.simples@teste.com');
  console.log('   - Senha: teste123');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}