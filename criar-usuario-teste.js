// Criar usuário de teste para verificar se o problema é específico do usuário diogo
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'server/data/database.json');

console.log('🔧 Criando usuário de teste verificado...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Criar novo usuário de teste
  const novoUsuario = {
    id: `user-teste-${Date.now()}`,
    nome: 'Teste Dashboard',
    email: 'teste.dashboard@teste.com',
    senha: bcrypt.hashSync('teste123', 10),
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
        descricao: 'Salário Teste',
        valor: 5000.00,
        data: '2025-01-05',
        categoria: 'Receita Principal',
        subcategoria: 'Salário',
        observacoes: 'Receita de teste',
        recorrente: false
      },
      {
        id: 2,
        descricao: 'Freelance Teste',
        valor: 2000.00,
        data: '2025-01-15',
        categoria: 'Receita Principal',
        subcategoria: 'Freelance',
        observacoes: 'Receita de teste',
        recorrente: false
      }
    ],
    despesas: [
      {
        id: 1,
        descricao: 'Aluguel Teste',
        valor: 1500.00,
        data: '2025-01-10',
        categoria: 'Despesas Fixas',
        subcategoria: 'Moradia',
        observacoes: 'Despesa de teste',
        parcelado: false,
        numeroParcelas: 1,
        statusPagamento: 'pago',
        dataVencimento: '2025-01-10'
      },
      {
        id: 2,
        descricao: 'Supermercado Teste',
        valor: 500.00,
        data: '2025-01-20',
        categoria: 'Despesas Fixas',
        subcategoria: 'Alimentação',
        observacoes: 'Despesa de teste',
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
  const dadosPath = path.join(process.cwd(), `server/data/USER_DATA_${novoUsuario.id}.json`);
  fs.writeFileSync(dadosPath, JSON.stringify(dadosTeste, null, 2));
  
  // Salvar banco de dados atualizado
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  
  console.log('✅ Usuário de teste criado com sucesso!');
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
  console.log('   - Email: teste.dashboard@teste.com');
  console.log('   - Senha: teste123');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}