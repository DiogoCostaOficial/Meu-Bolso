// EXEMPLO DE CONVERSÃO JSON -> TOON
// Mantendo JSON original e criando versão TOON

// 📊 DADOS JSON ORIGINAIS (seu banco de dados atual)
const jsonOriginal = {
  "usuarios": [
    {
      "id": "admin-001",
      "nome": "Administrador",
      "email": "admin@admin.com",
      "senha": "$2a$10$YrXNLU.MsoOSt541oPsJrumID4j89fbvaQ0CkUz8YzmXmTFRrmwuK",
      "tipo": "admin",
      "ativo": true,
      "verificado": true,
      "primeiroAcesso": false,
      "dataCriacao": "2025-01-01T00:00:00.000Z",
      "ultimoAcesso": "2025-11-15T23:52:24.318Z",
      "configuracoes": {
        "notificacoesEmail": true,
        "tema": "light",
        "idioma": "pt-BR"
      }
    },
    {
      "id": "user-1763161760176",
      "nome": "Teste",
      "email": "teste@teste.com",
      "senha": "$2a$10$qicDgLZeCArSdITv7VLFV.u/kfp.pgFRWpehzwNUPtYPv4UcX3uFW",
      "tipo": "usuario",
      "ativo": true,
      "primeiroAcesso": false,
      "verificado": true,
      "otpCodigo": null,
      "otpExpira": null,
      "dataCriacao": "2025-11-14T23:09:20.176Z",
      "ultimoAcesso": "2025-11-15T22:54:33.004Z"
    }
  ],
  "categorias": [
    {
      "id": "cat-001",
      "nome": "Salário",
      "tipo": "receita",
      "cor": "#10b981",
      "icone": "💰"
    },
    {
      "id": "cat-002",
      "nome": "Freelance",
      "tipo": "receita",
      "cor": "#3b82f6",
      "icone": "💼"
    }
  ]
};

// 🚀 VERSÃO TOON (formato ultra-compacto)
const toonUsuarios = `usuarios[2]{id,nome,email,senha,tipo,ativo,verificado,primeiroAcesso,dataCriacao,ultimoAcesso,configuracoes}:
admin-001,Administrador,admin@admin.com,$2a$10$YrXNLU.MsoOSt541oPsJrumID4j89fbvaQ0CkUz8YzmXmTFRrmwuK,admin,true,true,false,2025-01-01T00:00:00.000Z,2025-11-15T23:52:24.318Z,{notificacoesEmail:true,tema:light,idioma:pt-BR}
user-1763161760176,Teste,teste@teste.com,$2a$10$qicDgLZeCArSdITv7VLFV.u/kfp.pgFRWpehzwNUPtYPv4UcX3uFW,usuario,true,true,false,null,2025-11-14T23:09:20.176Z,2025-11-15T22:54:33.004Z,null`;

const toonCategorias = `categorias[2]{id,nome,tipo,cor,icone}:
cat-001,Salário,receita,#10b981,💰
cat-002,Freelance,receita,#3b82f6,💼`;

// 📊 COMPARAÇÃO DE TAMANHO
function calcularTamanho() {
  const jsonStr = JSON.stringify(jsonOriginal);
  const toonStr = toonUsuarios + '\\n' + toonCategorias;
  
  console.log('📊 COMPARAÇÃO DE TAMANHO:');
  console.log('JSON Original:', jsonStr.length, 'caracteres');
  console.log('TOON Compacto:', toonStr.length, 'caracteres');
  console.log('💰 Economia:', Math.round((1 - toonStr.length/jsonStr.length) * 100) + '%');
  console.log('⚡ Redução:', jsonStr.length - toonStr.length, 'caracteres');
}

// 🔧 CONVERSOR SIMPLES JSON -> TOON
function converterParaToon(dados) {
  let resultado = '';
  
  // Converter usuários
  if (dados.usuarios && dados.usuarios.length > 0) {
    const campos = Object.keys(dados.usuarios[0]).join(',');
    resultado += `usuarios[${dados.usuarios.length}]{${campos}}:\n`;
    
    dados.usuarios.forEach(user => {
      const valores = Object.values(user).map(v => 
        v === null ? 'null' : 
        typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '') : 
        v.toString()
      ).join(',');
      resultado += valores + '\\n';
    });
  }
  
  // Converter categorias
  if (dados.categorias && dados.categorias.length > 0) {
    const campos = Object.keys(dados.categorias[0]).join(',');
    resultado += `categorias[${dados.categorias.length}]{${campos}}:\n`;
    
    dados.categorias.forEach(cat => {
      const valores = Object.values(cat).join(',');
      resultado += valores + '\\n';
    });
  }
  
  return resultado.trim();
}

// 🧪 TESTE
console.log('=== CONVERSÃO JSON -> TOON ===');
calcularTamanho();
console.log('\\n📄 VERSÃO TOON:');
console.log(converterParaToon(jsonOriginal));

// 📋 FORMATO TOON DETALHADO
console.log('\\n=== FORMATO TOON EXPLICADO ===');
console.log('usuarios[2]{id,nome,email,tipo}:');
console.log('id001,João,joao@email.com,admin');
console.log('id002,Maria,maria@email.com,usuario');
console.log('');
console.log('🎯 Sintaxe: tabela[qtd]{campos}: valor1,valor2,valor3...');