/**
 * CATÁLOGO COMPLETO DE VÍDEOS EXPLICATIVOS PARA LEIGOS (CÓPIA 1:1 DAS TELAS REAIS)
 * - Pensado para usuários leigos: explica TODOS os campos, botões, datas, filtros e tabelas de cada tela.
 * - As telas mais ricas (Orçamento, Despesas e Receitas) possuem Parte 1 e Parte 2 dedicadas na própria tela
 *   para que nenhum detalhe fique sem explicação!
 */

export const FIN_MANUAL_VIDEOS = [
  // ============================================================================
  // ORÇAMENTO — PARTE 1 & PARTE 2
  // ============================================================================
  {
    id: 'orcamento',
    pageGroup: '/orcamento',
    partLabel: '🎬 Vídeo 1: Renda, Dívidas e Botões do Topo',
    title: 'Orçamento (Parte 1): Topo da Tela, Renda Prevista, Dívidas e Renda Real',
    shortLabel: '🏷️ Orçamento (Parte 1)',
    route: '/orcamento',
    mp4Url: '/videos/manual/orcamento.mp4',
    mascotPose: 'wallet',
    screenHeader: '🏷️ Programação do Orçamento • Parte 1',
    scenes: [
      {
        step: 1,
        badge: 'Botões do Topo: Mês, Resetar, Copiar Mês Anterior e Replicar Meses',
        activeFieldId: 'orc_topo',
        cursorPos: { x: 55, y: 12 },
        visualTitle: '📅 Seletor de Mês + Resetar + Copiar Mês Anterior + Replicar Meses',
        visualDetail: 'No topo você escolhe o mês, pode zerar com Resetar, puxar os dados do mês passado em Copiar Mês Anterior ou repetir para o ano todo em Replicar Meses.',
        narration:
          'Bem-vindo à tela de Programação do Orçamento! Olhando aqui no topo, você primeiro escolhe o mês e o ano. Se quiser limpar tudo, basta clicar em Resetar. Se já montou o orçamento no mês passado, o botão Copiar Mês Anterior traz tudo pronto para você! E o botão Replicar Meses serve para copiar esse mesmo planejamento para vários meses seguintes de uma só vez.',
        pose: 'coin'
      },
      {
        step: 2,
        badge: 'Configuração de Renda: Campo Renda Prevista (R$)',
        activeFieldId: 'renda_prevista',
        typedValue: '8000.00',
        cursorPos: { x: 25, y: 38 },
        visualTitle: '💰 Campo 1: Renda Prevista (Quanto você espera ganhar no mês)',
        visualDetail: 'Digite no campo Renda Prevista todo o dinheiro que você prevê receber no mês, como seu salário.',
        narration:
          'Agora descemos para o cartão Configuração de Renda, aqui do lado esquerdo. O primeiro campo é a Renda Prevista: nele eu clico e digito o valor total que você espera receber no mês, por exemplo oito mil reais de salário.',
        pose: 'wallet'
      },
      {
        step: 3,
        badge: 'Campo Dívidas e Cálculo Automático da Renda Real Disponível',
        activeFieldId: 'dividas_renda_real',
        cursorPos: { x: 25, y: 52 },
        visualTitle: '🧮 Campo 2: Dívidas a Abater e Quadro Renda Real Disponível',
        visualDetail: 'Se tiver alguma dívida prioritária, informe no campo Dívidas. O sistema desconta sozinho e mostra sua Renda Real Disponível!',
        narration:
          'Logo abaixo temos o campo Dívidas a serem abatidas da renda: se você tem um acordo ou desconto que já sai direto do seu pagamento, coloque aqui. Caso não tenha, deixe zero. Veja que o quadro dourado Renda Real Disponível faz a conta sozinho, mostrando quanto dinheiro livre você realmente tem para planejar o mês!',
        pose: 'gold'
      },
      {
        step: 4,
        badge: 'Gráfico de Distribuição Inicial (Princípio 50-20-20-0-10)',
        activeFieldId: 'orc_grafico',
        cursorPos: { x: 74, y: 42 },
        visualTitle: '📊 Distribuição do Orçamento (Princípio 50% - 20% - 20% - 0% - 10%)',
        visualDetail: 'O sistema já inicia configurado com 50% Despesas Fixas, 20% Lazer, 20% Educação, 0% Investimentos e 10% Reserva de Emergência.',
        narration:
          'E aqui do lado direito fica o cartão Distribuição do Orçamento! Para facilitar sua vida, o sistema já vem iniciado com o princípio cinquenta, vinte, vinte, zero e dez: cinquenta por cento para Despesas Fixas, vinte por cento para Lazer, vinte por cento para Educação, zero por cento para Investimentos e dez por cento para Reserva de Emergência!',
        pose: 'coin'
      }
    ]
  },
  {
    id: 'orcamento_tabela',
    pageGroup: '/orcamento',
    partLabel: '🎬 Vídeo 2: Tabela de Metas (Princípio 50-20-20-0-10) e Salvar',
    title: 'Orçamento (Parte 2): Tabela Metas por Categoria (50-20-20-0-10) e Botão Salvar',
    shortLabel: '🏷️ Orçamento (Parte 2)',
    route: '/orcamento',
    mp4Url: '/videos/manual/orcamento_tabela.mp4',
    mascotPose: 'gold',
    screenHeader: '🏷️ Programação do Orçamento • Parte 2',
    scenes: [
      {
        step: 1,
        badge: 'Barra de Resumo: Renda Real, Já Configurado e Falta Configurar',
        activeFieldId: 'meta_cat',
        cursorPos: { x: 65, y: 66 },
        visualTitle: '📋 Barra de Alocação: Renda Real | Já Configurado | Falta Configurar',
        visualDetail: 'Antes da tabela, o sistema mostra quanto da sua renda já foi distribuído nos potes e quanto ainda falta planejar.',
        narration:
          'Neste segundo vídeo do Orçamento, vamos entender a tabela Metas por Categoria! Repare primeiro na barra de resumo logo acima da tabela: ela mostra a sua Renda Real, quanto você Já Configurou e quanto ainda Falta Configurar até fechar cem por cento.',
        pose: 'coin'
      },
      {
        step: 2,
        badge: 'Parâmetros Iniciais: 50% Fixas, 20% Lazer, 20% Educação, 0% Invest. e 10% Reserva',
        activeFieldId: 'meta_cat',
        cursorPos: { x: 40, y: 78 },
        visualTitle: '🎛️ Princípio Inicial 50-20-20-0-10 + Modo [R$ | %]',
        visualDetail: 'Para todo cadastro novo, as metas já vêm iniciadas em 50% Despesas Fixas, 20% Lazer, 20% Educação, 0% Investimentos e 10% Reserva de Emergência.',
        narration:
          'Na tabela, cada linha é um pote do seu bolso e já começa com nossos parâmetros recomendados: cinquenta por cento para Despesas Fixas, vinte por cento para Lazer, vinte por cento para Educação, zero por cento para Investimentos e dez por cento para Reserva de Emergência! E se você quiser personalizar, basta escolher na coluna Modo entre R cifrão ou Porcentagem e digitar sua meta!',
        pose: 'wallet'
      },
      {
        step: 3,
        badge: 'Colunas Planejado, Gasto Atual e Disponível',
        activeFieldId: 'meta_cat',
        cursorPos: { x: 82, y: 82 },
        visualTitle: '📈 Colunas Planejado, Gasto Atual e Disponível',
        visualDetail: 'O sistema converte a meta em reais na coluna Planejado, soma suas despesas lançadas em Gasto Atual e mostra a sobra em Disponível.',
        narration:
          'Olha como as três últimas colunas trabalham para você: a coluna Planejado mostra o teto em reais daquela categoria; a coluna Gasto Atual soma sozinha tudo o que você lançou lá na tela de Despesas; e a coluna Disponível mostra quanto dinheiro ainda sobra livre naquele pote!',
        pose: 'bill'
      },
      {
        step: 4,
        badge: 'Botão Azul Salvar Orçamento no Canto Superior Direito',
        activeFieldId: 'btn_salvar',
        cursorPos: { x: 88, y: 12 },
        visualTitle: '💾 Clicando em "Salvar Orçamento" para Gravar Tudo',
        visualDetail: 'Sempre que terminar de ajustar suas metas, clique no botão azul Salvar Orçamento no topo direito.',
        narration:
          'Depois de distribuir as metas das suas categorias até fechar cem por cento na linha Total, suba o mouse até o botão azul Salvar Orçamento no canto superior direito e clique nele! Pronto: seu orçamento mensal está salvo e o nosso Quiz já consegue avaliar suas compras!',
        pose: 'gold'
      }
    ]
  },

  // ============================================================================
  // DESPESAS — PARTE 1 (FORMULÁRIO COMPLETO 11 CAMPOS) & PARTE 2 (FILTROS, RESUMO, TABELA E EDIÇÃO EM MASSA)
  // ============================================================================
  {
    id: 'despesas',
    pageGroup: '/despesas',
    partLabel: '🎬 Vídeo 1: Como Cadastrar Nova Despesa (Todos os 11 Campos)',
    title: 'Despesas (Parte 1): Explicando Todos os Campos de "Adicionar Nova Despesa"',
    shortLabel: '💸 Despesas (Parte 1)',
    route: '/despesas',
    mp4Url: '/videos/manual/despesas.mp4',
    mascotPose: 'bill',
    screenHeader: '💸 Despesas • Parte 1: Adicionar Nova Despesa',
    scenes: [
      {
        step: 1,
        stageViewMode: 'form',
        viewMode: 'form',
        badge: 'Botões Exportar e + Nova Despesa no Topo',
        activeFieldId: 'btn_nova_despesa',
        cursorPos: { x: 92, y: 8 },
        visualTitle: '➕ Botão Vermelho "+ Nova Despesa" e Botão "Exportar"',
        visualDetail: 'Clique no botão vermelho + Nova Despesa no canto superior direito para abrir o quadro branco Adicionar Nova Despesa.',
        narration:
          'Vamos aprender a usar toda a tela de Despesas passo a passo! No topo direito você tem o botão Exportar e o botão vermelho Nova Despesa. Quando você clica em Nova Despesa, abre exatamente este quadro branco chamado Adicionar Nova Despesa.',
        pose: 'bill'
      },
      {
        step: 2,
        viewMode: 'form',
        badge: 'Linha 1: Campos Descrição e Valor (R$)',
        activeFieldId: 'descricao',
        typedValue: 'Supermercado da Semana',
        cursorPos: { x: 25, y: 24 },
        visualTitle: '📝 Campo 1: Descrição  |  💰 Campo 2: Valor (R$)',
        visualDetail: 'Na primeira linha você digita a Descrição (ex: Aluguel, Conta de Luz, Supermercado) e ao lado o Valor gasto em reais.',
        narration:
          'Na primeira linha do formulário temos dois campos obrigatórios: à esquerda, no campo Descrição, você escreve onde ou com o quê gastou, como Aluguel, Conta de Luz ou Supermercado. Ao lado direito, no campo Valor, você digita quanto custou em reais, por exemplo quatrocentos e vinte reais.',
        pose: 'coin'
      },
      {
        step: 3,
        viewMode: 'form',
        badge: 'Linha 2: Data da Despesa vs. Data de Vencimento (opcional)',
        activeFieldId: 'data_despesa',
        cursorPos: { x: 52, y: 36 },
        visualTitle: '📅 Campo 3: Data da Despesa  |  📅 Campo 4: Data de Vencimento (opcional)',
        visualDetail: 'A Data da Despesa define em qual mês o gasto entra nos relatórios. Já a Data de Vencimento serve para anotar o dia em que o boleto vence.',
        narration:
          'Na segunda linha ficam duas datas importantes: à esquerda está a Data da Despesa, que já vem preenchida com o dia de hoje e define em qual mês esse gasto vai aparecer no seu controle. Ao lado direito está a Data de Vencimento opcional: se for um boleto ou conta de luz que só vence mais para frente, coloque o vencimento aqui para acompanhar os prazos!',
        pose: 'wallet'
      },
      {
        step: 4,
        viewMode: 'form',
        badge: 'Linha 3: Data da Compra (opcional) e Categoria',
        activeFieldId: 'data_compra_cat',
        cursorPos: { x: 70, y: 48 },
        visualTitle: '🛍️ Campo 5: Data da Compra (opcional)  |  🏷️ Campo 6: Categoria',
        visualDetail: 'Anote o dia exato em que fez a compra na loja e escolha a Categoria correspondente ao seu Orçamento.',
        narration:
          'Na terceira linha, à esquerda temos a Data da Compra opcional, que serve para registrar o dia exato em que você passou o cartão na loja. E à direita temos o campo Categoria: clique nele para escolher de qual pote do seu Orçamento esse dinheiro vai sair, como Despesas Fixas, Lazer ou Educação.',
        pose: 'coin'
      },
      {
        step: 5,
        viewMode: 'form',
        badge: 'Linha 4: Subcategoria e Status de Pagamento (Pendente ou Pago)',
        activeFieldId: 'subcat_status',
        cursorPos: { x: 70, y: 60 },
        visualTitle: '📂 Campo 7: Subcategoria  |  ✅ Campo 8: Status de Pagamento',
        visualDetail: 'Escolha a Subcategoria (ex: Moradia, Mercado) e marque o Status como Pendente (ainda vai pagar) ou Pago (já pagou).',
        narration:
          'Na quarta linha, à esquerda você escolhe a Subcategoria para detalhar melhor o gasto, como Moradia, Mercado ou Saúde. Ao lado direito fica o Status de Pagamento: escolha Pendente se for uma conta que você ainda vai pagar no futuro, ou mude para Pago se o dinheiro já saiu da sua conta!',
        pose: 'bill'
      },
      {
        step: 6,
        viewMode: 'form',
        badge: 'Linha 5 e 6: Cartão (opcional) e Observações (opcional)',
        activeFieldId: 'cartao_obs',
        typedValue: 'Compra mensal da família no supermercado',
        cursorPos: { x: 30, y: 74 },
        visualTitle: '💳 Campo 9: Cartão (opcional)  |  🗒️ Campo 10: Observações (opcional)',
        visualDetail: 'Se pagou no cartão de crédito, selecione-o em Cartão (opcional). Se pagou em Pix ou dinheiro, deixe Nenhum. Abaixo, anote qualquer detalhe em Observações.',
        narration:
          'Na quinta linha fica o campo Cartão opcional: se essa compra foi feita no cartão de crédito, selecione o seu cartão aqui para o valor ir direto para a fatura dele! Se você pagou no Pix, Débito ou Dinheiro, basta deixar como Nenhum. E logo abaixo você tem a caixa Observações opcional para escrever qualquer lembrete ou detalhe sobre a compra.',
        pose: 'wallet'
      },
      {
        step: 7,
        viewMode: 'form',
        badge: 'Caixinha: Parcelar despesa (Cálculo Automático das Parcelas)',
        activeFieldId: 'parcelado',
        cursorPos: { x: 25, y: 86 },
        visualTitle: '🔢 Caixinha 1: "Parcelar despesa" + Número de Parcelas',
        visualDetail: 'Ao marcar Parcelar despesa, o sistema abre o campo Número de Parcelas, mostra o valor de cada prestação e lança nos próximos meses sozinho!',
        narration:
          'Mais embaixo temos a primeira caixinha chamada Parcelar despesa: se você comprou algo dividido em várias vezes, marque essa caixinha! Na mesma hora abre o campo Número de Parcelas: você digita em quantas vezes dividiu e o sistema já mostra o valor de cada parcela e espalha automaticamente nos próximos meses!',
        pose: 'gold'
      },
      {
        step: 8,
        viewMode: 'form',
        badge: 'Caixinha: Somar ao Orçamento e Relatórios + Botão Adicionar Despesa',
        activeFieldId: 'somar_salvar',
        cursorPos: { x: 90, y: 94 },
        visualTitle: '☑️ "Somar ao Orçamento e Relatórios" + Botão Verde "Adicionar Despesa"',
        visualDetail: 'Mantenha marcada a opção Somar ao Orçamento e clique no botão verde Adicionar Despesa no canto inferior direito.',
        narration:
          'Por último, deixe marcada a caixinha azul Somar ao Orçamento e Relatórios para que esse gasto seja descontado da sua meta do mês. Depois é só clicar no botão verde Adicionar Despesa aqui no canto inferior direito, ou em Cancelar se quiser fechar sem salvar!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'despesas_lista',
    pageGroup: '/despesas',
    partLabel: '🎬 Vídeo 2: Filtros, Resumo, Lista e Edição em Massa',
    title: 'Despesas (Parte 2): Como Usar os Filtros, Resumo, Lista e Edição em Massa',
    shortLabel: '💸 Despesas (Parte 2)',
    route: '/despesas',
    mp4Url: '/videos/manual/despesas_lista.mp4',
    mascotPose: 'coin',
    screenHeader: '💸 Despesas • Parte 2: Filtros, Resumo e Lista',
    scenes: [
      {
        step: 1,
        viewMode: 'list',
        badge: 'Painel de Filtros Completo da Tela de Despesas',
        activeFieldId: 'filtros_despesas',
        cursorPos: { x: 50, y: 20 },
        visualTitle: '🔍 Quadro de Filtros: Categoria, Subcategoria, Mês, Ano, Datas, Busca e Status',
        visualDetail: 'Filtre suas contas por Categoria, Subcategoria, Mês, Ano, intervalo de Datas, palavra-chave ou veja apenas contas Pendentes!',
        narration:
          'Neste segundo vídeo de Despesas, vamos conhecer a parte de baixo da tela! Primeiro temos o quadro de Filtros: nele você pode filtrar suas contas por Categoria, Subcategoria, Mês e Ano, ou procurar apenas as contas que estão com Status Pendente para saber o que falta pagar. Para voltar a ver tudo, basta clicar em Limpar Filtros!',
        pose: 'coin'
      },
      {
        step: 2,
        viewMode: 'list',
        badge: 'Os 3 Cartões Coloridos de Resumo',
        activeFieldId: 'cards_despesas',
        cursorPos: { x: 50, y: 45 },
        visualTitle: '📊 Cartões: Total de Despesas (Vermelho), Categorias (Azul) e Subcategorias (Amarelo)',
        visualDetail: 'Mostram instantaneamente a soma em reais de todas as despesas filtradas e quantas categorias foram utilizadas.',
        narration:
          'Logo abaixo dos filtros ficam os três cartões de resumo: o cartão vermelho mostra o Total de Despesas somado na hora e a quantidade de lançamentos; o cartão azul mostra quantas Categorias ativas você usou; e o cartão amarelo mostra quantas Subcategorias estão ativas no período.',
        pose: 'wallet'
      },
      {
        step: 3,
        viewMode: 'list',
        badge: 'Tabela Lista de Despesas: Status Clicável, Editar e Excluir',
        activeFieldId: 'tabela_despesas',
        cursorPos: { x: 78, y: 76 },
        visualTitle: '📋 Tabela Lista de Despesas (Ordenação, Status Pago/Pendente e Ações)',
        visualDetail: 'Clique sobre o selo Pendente na tabela para mudá-lo para Pago na hora, ou use os ícones de lápis e lixeira à direita.',
        narration:
          'Mais abaixo fica a Lista de Despesas com todas as suas contas organizadas por Data, Descrição, Categoria, Subcategoria, Valor e Status. Uma dica de ouro: quando você pagar uma conta que estava Pendente, basta clicar direto em cima da palavrinha Pendente na tabela que ela muda para Pago na mesma hora! E nos ícones à direita você pode editar ou excluir qualquer linha.',
        pose: 'bill'
      },
      {
        step: 4,
        viewMode: 'list',
        badge: 'Edição em Massa: Marcar Várias Despesas de Uma Só Vez',
        activeFieldId: 'bulk_despesas',
        cursorPos: { x: 65, y: 58 },
        visualTitle: '⚡ Ações Rápidas em Massa: "Marcar Selecionados como Pago" e "Excluir Selecionados"',
        visualDetail: 'Marque as caixinhas na primeira coluna da tabela para pagar várias contas juntas ou alterar a categoria de vários itens de uma vez!',
        narration:
          'E se você quiser dar baixa em várias contas de uma vez só? Basta marcar as caixinhas na primeira coluna da tabela! Automaticamente aparece o painel Editar Despesas Selecionadas com os botões rápidos Marcar Selecionados como Pago e Excluir Selecionados, além da opção de trocar a categoria de vários gastos juntos!',
        pose: 'gold'
      }
    ]
  },

  // ============================================================================
  // RECEITAS — PARTE 1 (FORMULÁRIO COMPLETO) & PARTE 2 (FILTROS, RESUMO E TABELA)
  // ============================================================================
  {
    id: 'receitas',
    pageGroup: '/receitas',
    partLabel: '🎬 Vídeo 1: Como Cadastrar Nova Receita (Todos os Campos)',
    title: 'Receitas (Parte 1): Explicando Todos os Campos de "Nova Receita"',
    shortLabel: '📈 Receitas (Parte 1)',
    route: '/receitas',
    mp4Url: '/videos/manual/receitas.mp4',
    mascotPose: 'wallet',
    screenHeader: '📈 Receitas • Parte 1: Nova Receita',
    scenes: [
      {
        step: 1,
        viewMode: 'form',
        badge: 'Botão Verde + Nova Receita e Campo Descrição *',
        activeFieldId: 'rec_desc',
        typedValue: 'Salário Mensal Empresa',
        cursorPos: { x: 25, y: 26 },
        visualTitle: '➕ Botão "+ Nova Receita"  |  📝 Campo 1: Descrição *',
        visualDetail: 'Clique no botão verde + Nova Receita no topo direito e digite a Descrição da entrada (ex: Salário, Venda, Freelance).',
        narration:
          'Bem-vindo à tela de Receitas, onde registramos todo o dinheiro que entra no seu bolso! Ao clicar no botão verde Nova Receita no canto superior direito, abre este formulário. No primeiro campo à esquerda, chamado Descrição, você escreve de onde veio o dinheiro, como Salário, Venda ou Freelance.',
        pose: 'wallet'
      },
      {
        step: 2,
        viewMode: 'form',
        badge: 'Campo Quantidade de Títulos * (Repetição Mensal Automática)',
        activeFieldId: 'rec_qtd',
        cursorPos: { x: 72, y: 26 },
        visualTitle: '🔢 Campo 2: Quantidade de Títulos * (De 1 até 60 meses)',
        visualDetail: 'Se for um recebimento único, deixe 1. Se for um contrato ou salário de vários meses (ex: 6 ou 12), ele já cria os meses seguintes sozinho!',
        narration:
          'Ao lado direito da Descrição está o campo Quantidade de Títulos: se você recebeu esse valor apenas uma vez, deixe o número um. Mas se você fechou um serviço ou quer lançar seu salário para os próximos seis ou doze meses de uma vez, basta digitar a quantidade de meses aqui que o sistema cria todos os lançamentos mensais consecutivos para você!',
        pose: 'coin'
      },
      {
        step: 3,
        viewMode: 'form',
        badge: 'Linha 2: Campos Valor * e Data *',
        activeFieldId: 'rec_valor_data',
        typedValue: '8000.00',
        cursorPos: { x: 35, y: 44 },
        visualTitle: '💵 Campo 3: Valor *  |  📅 Campo 4: Data *',
        visualDetail: 'Digite o valor recebido em reais e escolha a data em que o dinheiro entrou na sua conta.',
        narration:
          'Na segunda linha, à esquerda temos o campo Valor, onde você digita quanto entrou em reais. E à direita temos o campo Data, onde você seleciona no calendário o dia exato em que o dinheiro caiu na sua conta.',
        pose: 'wallet'
      },
      {
        step: 4,
        viewMode: 'form',
        badge: 'Linha 3: Categoria * e Subcategoria',
        activeFieldId: 'rec_cat_sub',
        cursorPos: { x: 55, y: 58 },
        visualTitle: '🏷️ Campo 5: Categoria *  |  📂 Campo 6: Subcategoria',
        visualDetail: 'Selecione a Categoria (ex: Receita Principal, Renda Extra) e depois a Subcategoria (ex: Salário Principal, Freelance).',
        narration:
          'Na terceira linha, você escolhe à esquerda a Categoria da sua entrada, como Receita Principal, Renda Extra ou Investimentos. Assim que você escolhe a Categoria, o campo Subcategoria à direita é liberado para você detalhar se foi Salário Principal, Décimo Terceiro, Freelance ou Dividendos!',
        pose: 'coin'
      },
      {
        step: 5,
        viewMode: 'form',
        badge: 'Campo Observações (Opcional)',
        activeFieldId: 'rec_obs',
        typedValue: 'Pagamento mensal depositado em conta corrente',
        cursorPos: { x: 40, y: 74 },
        visualTitle: '🗒️ Campo 7: Observações (Opcional)',
        visualDetail: 'Use este espaço livre caso queira anotar o nome do cliente, número da nota fiscal ou qualquer detalhe extra.',
        narration:
          'Logo abaixo temos a caixa de Observações opcional: aqui você pode anotar livremente o nome do cliente que te pagou, o banco onde caiu o dinheiro ou qualquer detalhe que queira lembrar depois.',
        pose: 'bill'
      },
      {
        step: 6,
        viewMode: 'form',
        badge: 'Caixinhas Recorrente e Somar ao Orçamento + Botão Adicionar Receita',
        activeFieldId: 'rec_checks_salvar',
        cursorPos: { x: 75, y: 92 },
        visualTitle: '☑️ "Receita recorrente" + "Somar ao Orçamento" + Botão Verde "Adicionar Receita"',
        visualDetail: 'Marque Receita recorrente se ela se repete todo mês, mantenha Somar ao Orçamento marcado e clique no botão verde Adicionar Receita!',
        narration:
          'Para terminar, temos duas caixinhas muito importantes: marque Receita recorrente mensal se esse ganho se repete todo mês, e mantenha marcada a opção Somar ao Orçamento e Relatórios para que esse dinheiro entre no saldo do seu Dashboard. Depois é só clicar no botão verde Adicionar Receita!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'receitas_lista',
    pageGroup: '/receitas',
    partLabel: '🎬 Vídeo 2: Filtros, Cartões de Resumo e Tabela de Receitas',
    title: 'Receitas (Parte 2): Como Usar os Filtros, Resumo e Tabela de Receitas',
    shortLabel: '📈 Receitas (Parte 2)',
    route: '/receitas',
    mp4Url: '/videos/manual/receitas_lista.mp4',
    mascotPose: 'gold',
    screenHeader: '📈 Receitas • Parte 2: Filtros, Resumo e Lista',
    scenes: [
      {
        step: 1,
        viewMode: 'list',
        badge: 'Usando o Painel de Filtros de Receitas',
        activeFieldId: 'rec_filtros',
        cursorPos: { x: 50, y: 22 },
        visualTitle: '🔍 Quadro de Filtros: Categoria, Subcategoria, Mês, Ano, Datas e Descrição',
        visualDetail: 'Filtre suas receitas por período ou categoria para conferir quanto ganhou em um mês específico.',
        narration:
          'Neste segundo vídeo de Receitas, vemos como consultar tudo o que você já cadastrou! No quadro de Filtros você pode escolher uma Categoria, um Mês, um Ano ou buscar pelo nome da entrada. E se quiser ver todas novamente, clique em Limpar Filtros.',
        pose: 'coin'
      },
      {
        step: 2,
        viewMode: 'list',
        badge: 'Os 3 Cartões de Resumo e a Tabela de Receitas',
        activeFieldId: 'rec_resumo_tabela',
        cursorPos: { x: 50, y: 65 },
        visualTitle: '📊 Cartões (Total, Categorias e Subcategorias) + Tabela de Receitas',
        visualDetail: 'Confira o Total recebido em verde e edite ou exclua qualquer lançamento nos ícones de Ações da tabela.',
        narration:
          'Logo abaixo, o cartão verde mostra o Total somado de todas as receitas da lista, acompanhado dos cartões de Categorias e Subcategorias ativas. E na tabela lá embaixo você confere cada recebimento e pode clicar no lápis para editar um valor na própria linha ou na lixeira para excluir!',
        pose: 'gold'
      }
    ]
  },

  // ============================================================================
  // DASHBOARD, CARTÕES, VIAGENS, RELATÓRIOS, DRE, BACKUP, CONFIGURAÇÕES E QUIZ
  // ============================================================================
  {
    id: 'dashboard',
    pageGroup: '/dashboard',
    partLabel: '🎬 Vídeo Completo: Como Usar o Dashboard e Importar Planilha',
    title: 'Dashboard: Filtro de Período, 4 Cartões, Metas e Importar Planilha',
    shortLabel: '📊 Dashboard',
    route: '/dashboard',
    mp4Url: '/videos/manual/dashboard.mp4',
    mascotPose: 'gold',
    screenHeader: '📊 Dashboard • Visão Geral Completa',
    scenes: [
      {
        step: 1,
        badge: 'Escolhendo o Mês, Ano e Moeda no Topo do Dashboard',
        activeFieldId: 'filtro_mes',
        cursorPos: { x: 88, y: 12 },
        visualTitle: '📅 Seletor de Mês, Ano e Moeda Comercial no Topo',
        visualDetail: 'Use o seletor no canto superior direito para escolher qual mês e ano você deseja inspecionar.',
        narration:
          'Aqui na tela de Dashboard você tem o painel geral do seu dinheiro! No canto superior direito, você pode escolher a Moeda de visualização e selecionar exatamente qual Mês e qual Ano quer analisar.',
        pose: 'coin'
      },
      {
        step: 2,
        badge: 'Os 4 Cartões Principais: Receitas, Despesas, Saldo Final e Percentual Sobra',
        activeFieldId: 'cards_resumo',
        cursorPos: { x: 50, y: 38 },
        visualTitle: '💳 Receitas (Verde) • Despesas (Vermelho) • Saldo Final • Percentual Sobra',
        visualDetail: 'Os 4 cartões calculam sozinhos tudo o que entrou, tudo o que saiu, o saldo líquido e quantos por cento da sua renda sobraram no mês.',
        narration:
          'Logo abaixo ficam os quatro cartões principais: o primeiro soma todas as suas Receitas do mês; o segundo soma todas as suas Despesas; o terceiro mostra o seu Saldo Final livre; e o quarto mostra o Percentual de Sobra, ou seja, quantos por cento do seu dinheiro você conseguiu economizar!',
        pose: 'wallet'
      },
      {
        step: 3,
        badge: 'Acompanhamento de Metas por Categoria e Gráficos no Dashboard',
        activeFieldId: 'mapa_calor',
        cursorPos: { x: 50, y: 74 },
        visualTitle: '🚦 Barras de Progresso das Metas do Orçamento e Gráficos',
        visualDetail: 'Acompanhe em tempo real quanto já consumiu da meta de cada categoria configurada no seu Orçamento.',
        narration:
          'Mais abaixo, o Dashboard mostra as barras de progresso das metas que você configurou lá no Orçamento, além dos gráficos de evolução mensal e distribuição de gastos por categoria!',
        pose: 'bill'
      },
      {
        step: 4,
        badge: 'Botão Verde Importar Planilha no Topo do Dashboard',
        activeFieldId: 'btn_importar',
        cursorPos: { x: 70, y: 12 },
        visualTitle: '📥 Botão Verde "Importar Planilha" (Excel / CSV)',
        visualDetail: 'Traga seus lançamentos de uma planilha pronta e marque a opção de ignorar títulos zerados se desejar.',
        narration:
          'E se você já anotava suas contas em uma planilha do Excel, basta clicar no botão verde Importar Planilha aqui no topo: você escolhe o arquivo do seu computador, pode marcar a opção de ignorar lançamentos com valor zero e importa tudo de uma vez!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'cartoes',
    pageGroup: '/cartoes',
    partLabel: '🎬 Vídeo Completo: Controle de Cartões e Faturas de Janeiro a Dezembro',
    title: 'Cartões: Como Cadastrar Cartões, Lançar Faturas Mensais e Ver Compras',
    shortLabel: '💳 Cartões',
    route: '/cartoes',
    mp4Url: '/videos/manual/cartoes.mp4',
    mascotPose: 'wallet',
    screenHeader: '💳 Controle de Cartões',
    scenes: [
      {
        step: 1,
        badge: 'Botão Verde + Novo Cartão e Nome do Cartão na Tabela',
        activeFieldId: 'card_nome',
        cursorPos: { x: 74, y: 12 },
        visualTitle: '➕ Botão "+ Novo Cartão" e Coluna CARTÕES',
        visualDetail: 'Clique no botão verde + Novo Cartão no topo, digite o nome do banco na primeira coluna da tabela e escolha o Ano.',
        narration:
          'Na tela de Controle de Cartões você enxerga as faturas do ano inteiro de janeiro a dezembro! Para começar, clique no botão verde Novo Cartão lá no topo e digite o nome do seu cartão na primeira coluna da tabela, como Nubank ou Itaú.',
        pose: 'wallet'
      },
      {
        step: 2,
        badge: 'Valores Automáticos das Compras vs. Edição Manual por Mês',
        activeFieldId: 'card_datas',
        cursorPos: { x: 55, y: 60 },
        visualTitle: '📅 Colunas dos Meses (Janeiro a Dezembro) + Link "Ver compras desta fatura"',
        visualDetail: 'Todas as despesas vinculadas ao cartão aparecem somadas automaticamente no mês da fatura, e você pode clicar em "compras" para ver cada item!',
        narration:
          'Toda vez que você cadastra uma despesa e seleciona esse cartão, o sistema soma o valor automaticamente dentro do mês correspondente aqui na tabela! Você pode clicar no link azul embaixo do valor para abrir uma janela com todas as compras daquela fatura, ou digitar um valor manualmente se preferir.',
        pose: 'coin'
      },
      {
        step: 3,
        badge: 'Clicando no Botão Azul Salvar Alterações',
        activeFieldId: 'card_salvar',
        cursorPos: { x: 90, y: 12 },
        visualTitle: '💾 Botão Azul "Salvar Alterações" e Coluna TOTAL',
        visualDetail: 'Ao terminar de criar um cartão ou ajustar um valor, clique no botão azul Salvar Alterações no canto superior direito.',
        narration:
          'A última coluna à direita soma o Total anual de cada cartão e a linha de baixo mostra o Total geral de todas as faturas de cada mês. Sempre que adicionar um cartão ou editar um valor, lembre-se de clicar no botão azul Salvar Alterações no topo direito!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'viagens',
    pageGroup: '/viagens',
    partLabel: '🎬 Vídeo Completo: Planejamento de Viagens, Passagens, Carro, Hotel e Câmbio',
    title: 'Viagens: Como Criar Roteiros, Simular Transporte, Hotel, Alimentação e Câmbio',
    shortLabel: '✈️ Viagens',
    route: '/viagens',
    mp4Url: '/videos/manual/viagens.mp4',
    mascotPose: 'coin',
    screenHeader: '✈️ Planejamento de Viagens',
    scenes: [
      {
        step: 1,
        badge: 'Criando uma Nova Viagem: Destino, Datas, Moeda e Perfil de Risco',
        activeFieldId: 'via_dest',
        cursorPos: { x: 88, y: 12 },
        visualTitle: '✈️ Botão "+ Nova Viagem" e Abas do Planejador',
        visualDetail: 'Clique em + Nova Viagem para definir o destino, datas de ida e volta, a moeda principal (R$, Dólar, Euro) e o colchão de segurança.',
        narration:
          'No módulo de Planejamento de Viagens, você planeja suas férias sem sustos! Clique em Nova Viagem no topo para informar o destino, a data de ida e volta, a moeda do país e o seu perfil de segurança, que já separa uma reserva extra para imprevistos.',
        pose: 'coin'
      },
      {
        step: 2,
        badge: 'Navegando pelas Abas: Transporte, Hospedagem, Alimentação, Câmbio e Itens',
        activeFieldId: 'via_gastos',
        cursorPos: { x: 50, y: 55 },
        visualTitle: '🏨 Simuladores de Passagens/Carro, Hotel, Alimentação com Gorjetas e Câmbio',
        visualDetail: 'Use cada aba da tela para calcular passagens e bagagens, combustível e pedágio de carro, diárias de hotel, refeições e conversão de moeda com IOF!',
        narration:
          'Depois, basta navegar pelas abas da tela: em Transporte você simula passagens aéreas com bagagem ou viagem de carro com combustível e pedágio; em Hospedagem calcula as diárias; em Alimentação estima café, almoço e jantar já com gorjetas; e em Câmbio vê a cotação comercial ao vivo com taxas!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'relatorios',
    pageGroup: '/relatorios',
    partLabel: '🎬 Vídeo Completo: Relatórios Personalizáveis (8 Gráficos) e Calendário Térmico',
    title: 'Relatórios: Como Personalizar os 8 Gráficos, Filtrar Períodos e Ler o Mapa de Calor',
    shortLabel: '📑 Relatórios',
    route: '/relatorios',
    mp4Url: '/videos/manual/relatorios.mp4',
    mascotPose: 'bill',
    screenHeader: '📑 Relatórios Financeiros',
    scenes: [
      {
        step: 1,
        badge: 'Painel Personalizar Relatório (Grade 2x4 com 8 Gráficos)',
        activeFieldId: 'rel_painel',
        cursorPos: { x: 50, y: 45 },
        visualTitle: '🎛️ Botão "Mostrar Opções" e Grade 2x4 de Gráficos Analíticos',
        visualDetail: 'Clique em Mostrar Opções para marcar ou desmarcar quais dos 8 relatórios visuais você deseja ver na tela.',
        narration:
          'Na tela de Relatórios Financeiros, você tem oito análises completas! Clicando em Mostrar Opções no quadro Personalizar Relatório, você escolhe quais gráficos quer exibir na tela, como Acompanhamento de Orçamento, Custo de Vida, Compromissos Essenciais e Construção Patrimonial.',
        pose: 'bill'
      },
      {
        step: 2,
        badge: 'Calendário Térmico de Gastos Diários (Mapa de Calor)',
        activeFieldId: 'rel_export',
        cursorPos: { x: 50, y: 75 },
        visualTitle: '🔥 Calendário Térmico de Gastos Diários e Filtros de Período',
        visualDetail: 'Veja no calendário quais dias do mês foram econômicos (verde) e em quais dias houve maior concentração de despesas (vermelho).',
        narration:
          'E no Calendário Térmico de Gastos Diários, você enxerga cada dia do mês pintado por cor: verde nos dias em que você gastou pouquinho, amarelo nos dias moderados e vermelho nos dias de gasto mais alto!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'dre',
    pageGroup: '/dre',
    partLabel: '🎬 Vídeo Completo: Como Ler a DRE (Mensal, Trimestral e Anual)',
    title: 'DRE: Demonstração do Resultado do Exercício e Margem de Economia',
    shortLabel: '📊 DRE',
    route: '/dre',
    mp4Url: '/videos/manual/dre.mp4',
    mascotPose: 'bill',
    screenHeader: '📊 DRE Gerencial',
    scenes: [
      {
        step: 1,
        badge: 'Escolhendo o Período: Mensal, Trimestral ou Anual',
        activeFieldId: 'dre_periodo',
        cursorPos: { x: 80, y: 15 },
        visualTitle: '📅 Filtro de Período: Mensal, Trimestral ou Anual',
        visualDetail: 'No topo da DRE você escolhe se quer ver o fechamento de um único mês, de um trimestre inteiro ou do ano completo.',
        narration:
          'A tela de DRE mostra um raio-x profissional do seu bolso, igualzinho as empresas fazem, mas de um jeito bem simples! No topo você escolhe se quer ver o resultado Mensal, Trimestral ou do Ano inteiro.',
        pose: 'bill'
      },
      {
        step: 2,
        badge: 'Receitas (-) Despesas (=) Resultado Líquido e Margem',
        activeFieldId: 'dre_resultado',
        cursorPos: { x: 50, y: 65 },
        visualTitle: '📈 Receitas Totais (-) Despesas por Categoria (=) Resultado Líquido',
        visualDetail: 'Veja exatamente quantos por cento da sua renda consumiu em cada categoria e qual foi o seu lucro líquido no período.',
        narration:
          'A tabela começa lá em cima com todas as suas Receitas somadas, depois vai diminuindo cada categoria de Despesa uma por uma e entrega lá embaixo o seu Resultado Líquido e a sua Margem de Lucro, mostrando se o período fechou no azul!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'backup',
    pageGroup: '/backup',
    partLabel: '🎬 Vídeo Completo: Como Exportar (Excel/PDF/JSON) e Restaurar Backup',
    title: 'Backup: Como Exportar Seus Dados em Planilha/PDF e Restaurar Arquivos',
    shortLabel: '💾 Backup',
    route: '/backup',
    mp4Url: '/videos/manual/backup.mp4',
    mascotPose: 'wallet',
    screenHeader: '💾 Backup e Exportação',
    scenes: [
      {
        step: 1,
        badge: 'Exportando Seus Dados em Excel (.xlsx), PDF, CSV ou JSON',
        activeFieldId: 'bkp_export',
        cursorPos: { x: 28, y: 55 },
        visualTitle: '📥 Cartão Exportar Dados: Escolha o Conteúdo e o Formato',
        visualDetail: 'Exporte todos os dados do sistema ou apenas Despesas/Receitas em formato Excel (.xlsx), Relatório PDF, CSV ou Backup JSON.',
        narration:
          'Na tela de Backup você guarda uma cópia segura de tudo o que lançou no sistema! No cartão de Exportação, você pode escolher baixar uma planilha Excel pronta, um relatório em PDF para imprimir ou um arquivo completo de segurança JSON.',
        pose: 'wallet'
      },
      {
        step: 2,
        badge: 'Importando e Restaurando um Arquivo de Backup',
        activeFieldId: 'bkp_import',
        cursorPos: { x: 74, y: 55 },
        visualTitle: '🔄 Cartão Importar / Restaurar Backup',
        visualDetail: 'Se trocar de computador ou quiser restaurar uma cópia salva anteriormente, basta selecionar o arquivo JSON aqui.',
        narration:
          'E no cartão ao lado, se um dia você quiser restaurar um backup salvo no seu computador ou celular, basta clicar em Importar Backup, escolher o arquivo e todos os seus dados voltam na mesma hora!',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'configuracoes',
    pageGroup: '/configuracoes',
    partLabel: '🎬 Vídeo Completo: Perfil, Categorias Personalizadas e Segurança',
    title: 'Configurações: Como Ajustar Perfil, Criar Categorias/Subcategorias e Senha',
    shortLabel: '⚙️ Configurações',
    route: '/configuracoes',
    mp4Url: '/videos/manual/configuracoes.mp4',
    mascotPose: 'wallet',
    screenHeader: '⚙️ Configurações da Conta',
    scenes: [
      {
        step: 1,
        badge: 'Aba Perfil: Nome, Foto, Telefone com DDI e Tema Visual',
        activeFieldId: 'cfg_perfil',
        cursorPos: { x: 30, y: 55 },
        visualTitle: '👤 Aba Perfil: Seus Dados Pessoais, DDI do País e Aparência',
        visualDetail: 'Na primeira aba você altera seu nome, foto de perfil, telefone com o código do seu país e escolhe entre Tema Claro ou Escuro.',
        narration:
          'Na tela de Configurações temos três abas muito fáceis de usar! Na primeira aba, chamada Perfil, você pode colocar sua foto, atualizar seu nome, seu telefone escolhendo o país e alternar entre o Tema Claro e o Tema Escuro.',
        pose: 'wallet'
      },
      {
        step: 2,
        badge: 'Aba Categorias e Aba Segurança (Troca de Senha)',
        activeFieldId: 'cfg_cats',
        cursorPos: { x: 72, y: 55 },
        visualTitle: '🏷️ Aba Categorias (Criar Novas Categorias e Subcategorias) + Aba Segurança',
        visualDetail: 'Na aba Categorias você pode criar novos potes de gastos ou adicionar subcategorias personalizadas, e na aba Segurança altera sua senha.',
        narration:
          'Clicando na segunda aba, chamada Categorias, você pode criar novas categorias ou adicionar novas subcategorias personalizadas com a cor que quiser para usar lá em Despesas e no Orçamento! E na terceira aba, Segurança, você pode alterar sua senha de acesso quando desejar.',
        pose: 'gold'
      }
    ]
  },
  {
    id: 'fin_quiz',
    pageGroup: 'quiz',
    partLabel: '🎬 Vídeo Completo: Como Usar o Quiz "Posso Gastar?" e Letras Inclusivas',
    title: 'Quiz "Posso Gastar?" e Acessibilidade do FIN (A-/A+)',
    shortLabel: '🎮 Quiz & FIN',
    route: 'quiz',
    mp4Url: '/videos/manual/fin_quiz.mp4',
    mascotPose: 'gold',
    screenHeader: '🎓 Assistente FIN • Quiz: Posso Gastar?',
    scenes: [
      {
        step: 1,
        badge: 'Preenchendo os 3 Campos do Quiz "Posso Gastar?"',
        activeFieldId: 'quiz_item',
        cursorPos: { x: 45, y: 48 },
        visualTitle: '🍽️ Campo 1 (O que comprar), Campo 2 (Valor e Pote) e Campo 3 (Necessidade ou Desejo)',
        visualDetail: 'Antes de fazer uma compra por impulso, digite o item, o valor, a categoria do seu Orçamento e marque se é Almoço (Necessidade) ou Balinha (Desejo).',
        narration:
          'O nosso Quiz Posso Gastar ajuda você a decidir antes de abrir a carteira! Basta preencher no campo um o que você quer comprar, no campo dois quanto custa e de qual pote do Orçamento vai sair, e no campo três marcar se é uma Necessidade ou um Desejo.',
        pose: 'coin'
      },
      {
        step: 2,
        badge: 'Clicando em Ver se Sobra Balinha no Pote!',
        activeFieldId: 'quiz_btn',
        cursorPos: { x: 50, y: 80 },
        visualTitle: '🍬 Diagnóstico Completo (Ou Aviso do que Falta Preencher no Orçamento)',
        visualDetail: 'O FIN consulta seu Orçamento real na hora e responde em Verde, Amarelo ou Vermelho — e se faltar configurar o Orçamento, ele te explica o que falta!',
        narration:
          'Ao clicar no botão Ver se Sobra Balinha no Pote, eu olho o seu Orçamento na mesma hora e te digo se a compra cabe com folga ou se vai estourar a meta! E se você ainda não tiver preenchido o seu Orçamento, eu te mostro uma listinha explicando exatamente o que falta preencher!',
        pose: 'gold'
      }
    ]
  }
];

/**
 * Retorna TODOS os vídeos pertencentes a uma determinada rota (ex: Parte 1 e Parte 2 de /despesas).
 */
export function getVideosForRoute(routeOrId) {
  if (!routeOrId) return [FIN_MANUAL_VIDEOS[0]];
  const clean = String(routeOrId).toLowerCase().trim();

  const matchingByGroup = FIN_MANUAL_VIDEOS.filter(
    (v) =>
      v.pageGroup === clean ||
      (v.route && v.route.startsWith('/') && clean.startsWith(v.route))
  );

  if (matchingByGroup.length > 0) return matchingByGroup;

  const byId = FIN_MANUAL_VIDEOS.find((v) => v.id === clean);
  if (byId) {
    return FIN_MANUAL_VIDEOS.filter((v) => v.pageGroup === byId.pageGroup);
  }

  return [FIN_MANUAL_VIDEOS[0]];
}

/**
 * Retorna o vídeo correspondente à rota atual ou ao ID solicitado.
 */
export function getVideoForRouteOrId(routeOrId) {
  if (!routeOrId) return FIN_MANUAL_VIDEOS[0];
  const clean = String(routeOrId).toLowerCase().trim();

  const byId = FIN_MANUAL_VIDEOS.find((v) => v.id === clean);
  if (byId) return byId;

  const byRoute = FIN_MANUAL_VIDEOS.find((v) => clean.startsWith(v.route));
  if (byRoute) return byRoute;

  return FIN_MANUAL_VIDEOS[0];
}
