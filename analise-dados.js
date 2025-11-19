// Teste direto dos dados do usuário diogo.grunge@gmail.com
import fs from 'fs';
import path from 'path';

console.log('🧪 Analisando dados do usuário diogo.grunge@gmail.com...\n');

// Ler dados diretamente do arquivo
const userId = 'user-1763162160964';
const dadosPath = path.join(process.cwd(), 'server/data/USER_DATA_' + userId + '.json');

try {
  if (!fs.existsSync(dadosPath)) {
    console.log('❌ Arquivo de dados não encontrado:', dadosPath);
    process.exit(1);
  }
  
  const dados = JSON.parse(fs.readFileSync(dadosPath, 'utf8'));
  
  console.log('✅ Dados encontrados!');
  console.log('\n📊 RESUMO DOS DADOS:');
  console.log(`   - Receitas: ${dados.receitas?.length || 0} registros`);
  console.log(`   - Despesas: ${dados.despesas?.length || 0} registros`);
  console.log(`   - Categorias: ${dados.categorias?.length || 0} registros`);
  console.log(`   - Orçamentos: ${dados.orcamentos?.length || 0} registros`);
  
  // Análise detalhada das receitas
  console.log('\n💰 ANÁLISE DAS RECEITAS:');
  if (dados.receitas && dados.receitas.length > 0) {
    const totalReceitas = dados.receitas.reduce((acc, rec) => acc + (parseFloat(rec.valor) || 0), 0);
    console.log(`   - Total de receitas: R$ ${totalReceitas.toFixed(2)}`);
    
    // Agrupar por ano
    const receitasPorAno = {};
    dados.receitas.forEach(rec => {
      if (rec.data) {
        const ano = rec.data.split('-')[0];
        receitasPorAno[ano] = (receitasPorAno[ano] || 0) + 1;
      }
    });
    console.log('   - Distribuição por ano:', receitasPorAno);
    
    // Verificar estrutura das receitas
    const exemploReceita = dados.receitas[0];
    console.log('\n   - Exemplo de receita:');
    console.log('     Descrição:', exemploReceita.descricao);
    console.log('     Valor:', exemploReceita.valor);
    console.log('     Data:', exemploReceita.data);
    console.log('     Categoria:', exemploReceita.categoria);
  }
  
  // Análise detalhada das despesas
  console.log('\n💸 ANÁLISE DAS DESPESAS:');
  if (dados.despesas && dados.despesas.length > 0) {
    const totalDespesas = dados.despesas.reduce((acc, desp) => acc + (parseFloat(desp.valor) || 0), 0);
    console.log(`   - Total de despesas: R$ ${totalDespesas.toFixed(2)}`);
    
    // Agrupar por categoria
    const despesasPorCategoria = {};
    dados.despesas.forEach(desp => {
      const categoria = desp.categoria || 'Sem categoria';
      despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + 1;
    });
    console.log('   - Distribuição por categoria:', despesasPorCategoria);
    
    // Verificar estrutura das despesas
    const exemploDespesa = dados.despesas[0];
    console.log('\n   - Exemplo de despesa:');
    console.log('     Descrição:', exemploDespesa.descricao);
    console.log('     Valor:', exemploDespesa.valor);
    console.log('     Data:', exemploDespesa.data);
    console.log('     Categoria:', exemploDespesa.categoria);
  }
  
  // Análise dos orçamentos
  console.log('\n📊 ANÁLISE DOS ORÇAMENTOS:');
  if (dados.orcamentos && dados.orcamentos.length > 0) {
    console.log(`   - ${dados.orcamentos.length} orçamento(s) encontrado(s)`);
    dados.orcamentos.forEach((orc, index) => {
      console.log(`   - Orçamento ${index + 1}:`);
      console.log(`     Mês: ${orc.mes}`);
      console.log(`     Renda prevista: R$ ${orc.rendaPrevista}`);
      console.log(`     Categorias: ${orc.categorias?.length || 0}`);
    });
  }
  
  // Simular o filtro do dashboard
  console.log('\n🎯 SIMULAÇÃO DO FILTRO DO DASHBOARD:');
  const anoSelecionado = '2025'; // Ano que está sendo filtrado no dashboard
  console.log(`Ano selecionado: ${anoSelecionado}`);
  
  const receitasFiltradas = dados.receitas?.filter(rec => {
    if (!rec.data) return false;
    const [ano] = rec.data.split('-');
    return ano === anoSelecionado;
  }) || [];
  
  const despesasFiltradas = dados.despesas?.filter(desp => {
    if (!desp.data) return false;
    const [ano] = desp.data.split('-');
    return ano === anoSelecionado;
  }) || [];
  
  console.log(`Receitas filtradas: ${receitasFiltradas.length}`);
  console.log(`Despesas filtradas: ${despesasFiltradas.length}`);
  
  if (receitasFiltradas.length === 0 && despesasFiltradas.length === 0) {
    console.log('\n⚠️  ATENÇÃO: Nenhum dado encontrado para o ano selecionado!');
    console.log('Isso explicaria por que o dashboard está vazio.');
  }
  
  // Verificar problemas potenciais
  console.log('\n🔍 VERIFICAÇÃO DE PROBLEMAS:');
  
  // Verificar se as datas estão no formato correto
  const datasInvalidas = dados.receitas?.filter(rec => !rec.data || !rec.data.match(/^\d{4}-\d{2}-\d{2}$/)) || [];
  if (datasInvalidas.length > 0) {
    console.log(`⚠️  ${datasInvalidas.length} receita(s) com data inválida!`);
  }
  
  // Verificar se os valores são numéricos
  const valoresInvalidos = dados.receitas?.filter(rec => isNaN(parseFloat(rec.valor))) || [];
  if (valoresInvalidos.length > 0) {
    console.log(`⚠️  ${valoresInvalidos.length} receita(s) com valor inválido!`);
  }
  
  console.log('\n✅ Análise concluída!');
  
} catch (error) {
  console.error('❌ Erro ao analisar dados:', error.message);
}