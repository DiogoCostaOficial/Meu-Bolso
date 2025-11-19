const bcrypt = require('bcryptjs');

// Dados dos usuários do banco de dados
const usuarios = [
  {
    nome: "Teste",
    email: "teste@teste.com", 
    senhaHash: "$2a$10$qicDgLZeCArSdITv7VLFV.u/kfp.pgFRWpehzwNUPtYPv4UcX3uFW"
  },
  {
    nome: "Diogo",
    email: "diogo.grunge@gmail.com",
    senhaHash: "$2a$10$kcNG3krkMmfRN3tv7VHYyu1TIvvZYFU8OcvCoi1.3EnHrvkKR9XY6"
  },
  {
    nome: "Diogo Costa da Silva",
    email: "diogo-costa@outlook.com",
    senhaHash: "$2a$10$2FDxD.L1wpINPoI2VrGbU.OdEE/edBn5pRaXNOSoNahb5JPjYZAly"
  }
];

// Senhas que queremos testar
const senhasParaTestar = ['123456', '12345678', 'password', 'admin', 'teste', 'diogo'];

async function verificarSenhas() {
  console.log('🔍 Verificando hashes de senha dos usuários...\n');
  
  for (const usuario of usuarios) {
    console.log(`\n👤 Usuário: ${usuario.nome} (${usuario.email})`);
    console.log(`Hash: ${usuario.senhaHash}`);
    
    let senhaCorreta = null;
    
    for (const senha of senhasParaTestar) {
      const match = await bcrypt.compare(senha, usuario.senhaHash);
      if (match) {
        senhaCorreta = senha;
        console.log(`✅ Senha correta encontrada: "${senha}"`);
        break;
      }
    }
    
    if (!senhaCorreta) {
      console.log(`❌ Nenhuma senha testada funcionou`);
      // Tentar gerar hash para senhas comuns
      console.log('🔄 Gerando hashes para comparação...');
      for (const senha of senhasParaTestar) {
        const hash = await bcrypt.hash(senha, 10);
        console.log(`Senha "${senha}" gera hash: ${hash}`);
      }
    }
  }
}

verificarSenhas().catch(console.error);