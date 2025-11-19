// Descobrir senha do usuário diogo e testar
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data/database.json');

console.log('🔍 Descobrindo senha do usuário diogo.grunge@gmail.com...\n');

try {
  // Ler banco de dados
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Encontrar usuário diogo
  const usuarioDiogo = dbData.usuarios.find(u => u.email === 'diogo.grunge@gmail.com');
  if (!usuarioDiogo) {
    console.log('❌ Usuário diogo não encontrado!');
    process.exit(1);
  }
  
  console.log('📋 Usuário diogo encontrado:');
  console.log(`   - Email: ${usuarioDiogo.email}`);
  console.log(`   - Nome: ${usuarioDiogo.nome}`);
  console.log(`   - ID: ${usuarioDiogo.id}`);
  console.log(`   - Ativo: ${usuarioDiogo.ativo}`);
  console.log(`   - Verificado: ${usuarioDiogo.verificado}`);
  console.log(`   - Hash: ${usuarioDiogo.senha.substring(0, 30)}...`);
  
  // Testar senhas comuns
  console.log('\n🔑 Testando senhas comuns...');
  const senhasComuns = ['123456', 'senha123', 'teste123', '12345678', 'password', 'admin', 'diogo123', 'grunge123'];
  
  for (const senha of senhasComuns) {
    const valida = await bcrypt.compare(senha, usuarioDiogo.senha);
    if (valida) {
      console.log(`🎯 Senha correta encontrada: ${senha}`);
      
      // Agora testar o login com a senha correta
      console.log('\n🚀 Testando login com senha correta...');
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'diogo.grunge@gmail.com',
          senha: senha
        })
      });
      
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.log('❌ Login falhou:', loginResponse.status, errorData.message);
      } else {
        const loginData = await loginResponse.json();
        console.log('✅ Login bem-sucedido!');
        console.log('Token:', loginData.token?.substring(0, 50) + '...');
        
        // Testar busca de dados
        console.log('\n📊 Testando busca de dados do diogo...');
        const dadosResponse = await fetch('http://localhost:3001/api/user/dados', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (!dadosResponse.ok) {
          const errorData = await dadosResponse.json();
          console.log('❌ Busca de dados falhou:', dadosResponse.status, errorData.message);
        } else {
          const dadosData = await dadosResponse.json();
          console.log('✅ Dados obtidos com sucesso!');
          console.log('Resumo:');
          console.log('- Receitas:', dadosData.dados.receitas?.length || 0);
          console.log('- Despesas:', dadosData.dados.despesas?.length || 0);
          console.log('- Categorias:', dadosData.dados.categorias?.length || 0);
          console.log('- Orçamentos:', dadosData.dados.orcamentos?.length || 0);
          
          // Mostrar primeiro exemplo de receita e despesa
          if (dadosData.dados.receitas?.length > 0) {
            console.log('\n💰 Exemplo de receita:');
            console.log(JSON.stringify(dadosData.dados.receitas[0], null, 2));
          }
          
          if (dadosData.dados.despesas?.length > 0) {
            console.log('\n💸 Exemplo de despesa:');
            console.log(JSON.stringify(dadosData.dados.despesas[0], null, 2));
          }
        }
      }
      
      break;
    }
  }
  
  console.log('\n✅ Teste concluído!');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}