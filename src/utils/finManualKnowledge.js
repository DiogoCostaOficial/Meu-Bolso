/**
 * Base de Conhecimento Oficial do Manual de Uso do Meu Bolso para o FIN (FINAN).
 * Contém a explicação didática (no estilo amigável do FIN) + a definição exata de cada
 * tela, botão e campo do sistema ("Para que serve tal campo?").
 */

export const FIN_MANUAL_QA_ENTRIES = [
  // 1. Ordem de uso / Como começar / Passo a passo do sistema
  {
    keywords: [
      'como comecar', 'por onde comecar', 'ordem de uso', 'passo a passo',
      'manual', 'manual de uso', 'como usar o sistema', 'como funciona o sistema',
      'primeiros passos', 'tutorial'
    ],
    matches: ['ajuda', 'sistema', 'meu bolso', 'ordem', 'usar', 'inicio'],
    response:
      "🧭 **Toca aqui! Quer aprender a usar o Meu Bolso na ordem perfeita? É igual montar um quebra-cabeça em 5 passos:**\n\n" +
      "1. 🏷️ **1º Passo — Categorias:** Crie ou revise suas gavetinhas (*Despesas Fixas*, *Lazer*, *Reserva de Emergência*).\n" +
      "2. 🎯 **2º Passo — Orçamento:** Diga quanto você vai receber no mês e quantos `%` ou `R$` cada categoria pode gastar.\n" +
      "3. 📊 **3º Passo — Dashboard ou Importador de Planilha:** Se já tem planilha Excel/CSV, clique em **'Importar Planilha'** no Dashboard! Se não, vá para Receitas e Despesas.\n" +
      "4. 💸 **4º Passo — Receitas, Despesas, Cartões e Viagens:** Registre o que entrou, o que saiu, suas parcelas de cartão e seus roteiros de férias.\n" +
      "5. 📈 **5º Passo — Relatórios e Mapa de Calor:** Olhe o placar final (DRE e Mapa de Calor) para descobrir onde economizar mais moedas!"
  },

  // 2. Importador Inteligente de Planilhas (Geral + 3 Modelos + Rollback)
  {
    keywords: [
      'importar planilha', 'importador', 'excel', 'csv', 'planilha',
      'subir planilha', 'modelo 1', 'modelo 2', 'modelo 3', 'desfazer importacao'
    ],
    matches: ['dashboard', 'como funciona', 'para que serve', 'campo', 'botao', 'importar'],
    response:
      "📊 **O Importador Inteligente de Planilhas fica lá no topo do Dashboard e traz sua planilha pro sistema em segundos!**\n\n" +
      "• **Seleção Automática:** Se sua planilha tiver várias abas (tipo *Orçamento* e *Fluxo de Caixa*), ele já abre direto na aba **Fluxo de Caixa** e lê até blocos lado a lado (*Receitas*, *Despesas Essenciais*, *Lazer* e *Investimentos*).\n" +
      "• **Os 3 Modelos:**\n" +
      "  1. ★ **Modelo 1 (Inteligente):** Detecta sozinho Data, Descrição, Categoria, Valor e se é Receita ou Despesa.\n" +
      "  2. ⚡ **Modelo 2 (Essencial):** Puxa só Data, Descrição e Valor (ótimo para extrato simples).\n" +
      "  3. 🛠️ **Modelo 3 (Manual):** Você escolhe no dedo qual coluna da planilha vai para cada campo.\n" +
      "• **Segurança Total:** Você pode usar o botão **'Desfazer Última Importação'** se quiser apagar o que subiu e testar outro modelo!"
  },

  // 3. Pergunta de Valores Zero na Importação de Planilhas
  {
    keywords: [
      'valor zero', 'valores zero', 'zerado', 'zerados', 'titulos com valor zero',
      'ignorar zero', 'r$ 0,00', 'linhas vazias na planilha'
    ],
    matches: ['importar', 'planilha', 'importador', 'campo', 'pergunta', 'sim ou nao'],
    response:
      "🔍 **Para que serve a pergunta 'Deseja importar os títulos que estão com valor zero (R$ 0,00)?'**\n\n" +
      "• Muitas planilhas de orçamento vêm com várias linhas de modelo pré-prontas (como *Uber*, *Plano de Saúde*, *Viagem*) que ficam com valor `0` nos meses em que você não usou.\n" +
      "• Marcando **'Não (Recomendado)'**, o sistema filtra e ignora todas as linhas zeradas para não sujar suas Despesas!\n" +
      "• Marcando **'Sim'**, ele importa também os títulos com `R$ 0,00` caso você queira preenchê-los depois."
  },

  // 4. Categorias e Subcategorias / Tipo de Meta e Valor da Meta
  {
    keywords: [
      'categoria', 'categorias', 'subcategoria', 'subcategorias',
      'tipo de meta', 'valor da meta', 'cor da categoria'
    ],
    matches: ['para que serve', 'campo', 'como funciona', 'criar', 'gaveta'],
    response:
      "🏷️ **Para que servem os campos da tela de Categorias?**\n" +
      "Pensa nas Categorias como os potes etiquetados onde você guarda ou separa suas moedas:\n\n" +
      "• **Nome da Categoria:** O nome do pote principal (ex.: *Despesas Fixas*, *Lazer*, *Educação*).\n" +
      "• **Tipo (`Receita` ou `Despesa`):** Define se esse pote é para dinheiro que entra ou dinheiro que sai.\n" +
      "• **Subcategorias:** São divisões dentro do pote! Exemplo: dentro de *Despesas Fixas*, você cria *Água*, *Luz* e *Internet*.\n" +
      "• **Tipo de Meta (`%` ou `R$`) e Valor da Meta:** Define o limite daquele pote — seja em porcentagem da sua renda (ex.: `30%`) ou em valor fixo (ex.: `R$ 800,00`)."
  },

  // 5. Orçamento Mensal: Renda Prevista, Dívidas, Renda Real e Valor Planejado
  {
    keywords: [
      'renda prevista', 'renda real', 'dividas no orcamento',
      'valor planejado', 'distribuicao do orcamento', 'meta percentual'
    ],
    matches: ['orcamento', 'para que serve', 'campo', 'diferenca', 'mensal'],
    response:
      "🎯 **Para que serve cada campo lá na aba Orçamento?**\n" +
      "É aqui que a gente dá nome para cada moedinha antes do mês começar:\n\n" +
      "• 💰 **Renda Prevista (Mensal):** Tudo o que você espera receber no mês (salário + vale + extras).\n" +
      "• ⚖️ **Dívidas (Mensal):** O valor separado primeiro para pagar acordos ou dívidas prioritárias.\n" +
      "• ✨ **Renda Real (Mensal):** O dinheiro líquido que realmente sobrou disponível na sua mão para distribuir entre as categorias!\n" +
      "• 📊 **Percentual (`%`) / Valor Planejado (`R$`):** Quanto cada categoria tem permissão para gastar no mês sem estourar sua meta."
  },

  // 6. Campos de Receitas (Status Recebido/Pendente, Recorrente, Somar no Orçamento)
  {
    keywords: [
      'receita recorrente', 'recorrente', 'somar no orcamento',
      'status recebido', 'cadastrar receita', 'nova receita'
    ],
    matches: ['receita', 'receitas', 'campo', 'para que serve', 'como funciona'],
    response:
      "💵 **Para que servem os campos da tela de Receitas?**\n\n" +
      "• **Descrição e Valor:** O nome da entrada (ex.: *Salário*, *Vale Refeição*, *13º*) e quantas moedas entraram.\n" +
      "• **Status (`Recebido` vs. `Pendente`):** Marca se o dinheiro já caiu de verdade no bolso (*Recebido*) ou se ainda vai cair (*Pendente*).\n" +
      "• **Recorrente:** Ative quando for um ganho fixo que se repete todo mês!\n" +
      "• **Somar no Orçamento:** Quando marcado, esse valor entra na soma oficial do seu saldo e orçamento mensal."
  },

  // 7. As 3 Datas das Despesas (Data da Compra, Data de Lançamento, Data de Vencimento)
  {
    keywords: [
      'data da compra', 'data de lancamento', 'data de vencimento',
      'tres datas', '3 datas', 'qual data usar'
    ],
    matches: ['despesa', 'despesas', 'campo', 'para que serve', 'diferenca', 'data'],
    response:
      "📅 **Para que servem os 3 campos de Data na tela de Despesas?**\n" +
      "Eu te explico igual comprar balinha na cantina:\n\n" +
      "• 🛍️ **Data da Compra:** O dia exato em que você passou o cartão ou pegou o produto na loja.\n" +
      "• 📝 **Data de Lançamento:** O dia/mês em que você registrou esse gasto no controle.\n" +
      "• ⏰ **Data de Vencimento:** O dia limite para pagar o boleto ou a fatura! *(Dica de ouro do FIN: Os relatórios mensais olham primeiro para a Data de Vencimento para você saber quanto precisa pagar naquele mês!).*"
  },

  // 8. Campos de Despesas: Status Pago/Pendente, Cartão, Mês da Fatura e Parcelamento
  {
    keywords: [
      'mes da fatura', 'status pagamento', 'pago ou pendente',
      'numero de parcelas', 'parcela atual', 'compra parcelada', 'vincular cartao'
    ],
    matches: ['despesa', 'despesas', 'cartao', 'campo', 'para que serve'],
    response:
      "🧾 **Para que servem os campos de Pagamento e Parcelas na Despesa?**\n\n" +
      "• **Status (`Pago` / `Pendente`):** Diz se a conta já foi quitada ou se ainda está esperando pagamento.\n" +
      "• **Cartão e Mês da Fatura:** Se comprou no cartão de crédito, escolha qual cartão usou e em qual mês de fatura (`MM/AAAA`) a cobrança vai cair.\n" +
      "• **Parcelado e Número de Parcelas:** Se dividiu a compra (ex.: `6x`), o sistema fatia e projeta as parcelas automaticamente nos meses seguintes para você não esquecer que aquele dinheiro já tem dono!"
  },

  // 9. Tela de Cartões de Crédito (Grade Anual Jan-Dez)
  {
    keywords: [
      'aba cartoes', 'tela de cartoes', 'grade de cartoes',
      'fatura mensal', 'cadastrar cartao', 'meus cartoes'
    ],
    matches: ['cartao', 'cartoes', 'fatura', 'como funciona', 'para que serve'],
    response:
      "💳 **Como funciona a tela de Cartões de Crédito?**\n\n" +
      "• **Nome do Cartão:** Você cadastra cada cartão que possui (ex.: *Nubank*, *Itaú*, *Inter*).\n" +
      "• **Tabela de Janeiro a Dezembro:** Mostra quanto você tem de fatura em cada mês do ano.\n" +
      "• **Soma Inteligente:** Quando você lança uma compra parcelada lá em *Despesas* vinculada ao cartão, ela ajuda a preencher a previsão dos próximos meses para você enxergar se as faturas futuras cabem no seu bolso!"
  },

  // 10. Viagens — Criar Roteiro e Perfil de Contingência / Risco
  {
    keywords: [
      'criar roteiro', 'novo roteiro', 'perfil de contingencia', 'perfil de risco',
      'contingencia', 'baixo risco', 'medio risco', 'alto risco', 'moeda principal',
      'pais para gorjetas'
    ],
    matches: ['viagem', 'viagens', 'roteiro', 'campo', 'para que serve'],
    response:
      "✈️ **Para que serve cada campo ao clicar em 'Criar Roteiro' em Viagens?**\n\n" +
      "• **Título e Cidade/Destino:** O nome das suas férias (ex.: *Eurotrip 2026*) e a cidade principal (*Roma*).\n" +
      "• **País (para gorjetas e taxas):** O sistema usa o país escolhido para calcular sozinho a gorjeta (*Tip*) e taxas turísticas locais!\n" +
      "• **Data de Partida e Retorno:** Calcula quantos dias e noites terá sua viagem.\n" +
      "• 🛡️ **Perfil de Contingência / Risco (`10%`, `15%` ou `25%`):** É o nosso 'colchão salva-férias'! Ele adiciona uma reserva extra (10% Baixo, 15% Médio ou 25% Alto) sobre o orçamento da viagem para imprevistos.\n" +
      "• 💱 **Moeda Principal:** Define se o roteiro será calculado em Real (`BRL`), Dólar (`USD`), Euro (`EUR`), Libra (`GBP`), etc."
  },

  // 11. Viagens — Aba Transporte (Passagens, Malas Despachadas e Carro / Desgaste Mecânico)
  {
    keywords: [
      'malas despachadas', 'taxa de embarque', 'assentos conforto',
      'desgaste mecanico', 'consumo km', 'fator operacional', 'pedagio',
      'simulador de carro', 'simulador de passagens'
    ],
    matches: ['viagem', 'viagens', 'transporte', 'carro', 'aviao', 'campo', 'para que serve'],
    response:
      "🚗✈️ **Para que servem os campos da aba Transporte em Viagens?**\n\n" +
      "• **Sub-aba Passagens & Bagagens:** Calcula `Tarifa × Passageiros` + `Malas Despachadas × Valor por Mala` + `Taxas de Embarque` + `Assentos Conforto`.\n" +
      "• **Sub-aba Carro:** Calcula o custo real da estrada!\n" +
      "  - **Distância (km), Consumo (km/L) e Preço do Litro:** Calcula quanto você vai gastar de combustível.\n" +
      "  - 🔧 **Incluir Desgaste Mecânico (Custo por km):** Separa algumas moedinhas por km rodado para pneus, óleo e revisão do carro!\n" +
      "  - **Pedágios e Estacionamento:** Soma pedágios, diárias de estacionamento no hotel, vagas rotativas e lavagem."
  },

  // 12. Viagens — Aba Hospedagem (City Tax, Resort Fee, Sales Tax, Limpeza e Caução)
  {
    keywords: [
      'city tax', 'resort fee', 'sales tax', 'taxa de limpeza',
      'caucao', 'deposit', 'simulador de hospedagem', 'diaria base'
    ],
    matches: ['viagem', 'viagens', 'hotel', 'hospedagem', 'campo', 'para que serve'],
    response:
      "🏨 **Para que servem os campos da aba Hospedagem em Viagens?**\n" +
      "Muita gente esquece das taxas escondidas dos hotéis, mas eu não deixo você cair nessa:\n\n" +
      "• **Diária Base e Noites:** O preço da noite multiplicado pelos dias que você vai dormir lá.\n" +
      "• 🏛️ **City Tax:** Taxa municipal cobrada por pessoa e por noite em cidades turísticas (muito comum na Europa).\n" +
      "• 🏖️ **Resort Fee e Sales Tax (`%`):** Taxas obrigatórias de infraestrutura e imposto local (muito comuns nos EUA).\n" +
      "• 🧹 **Taxa de Limpeza:** Taxa única cobrada em aluguéis de temporada (tipo Airbnb).\n" +
      "• 🔒 **Caução (Deposit):** Dinheiro que o hotel bloqueia no seu cartão por segurança no check-in e devolve no final se nada quebrar!"
  },

  // 13. Viagens — Aba Alimentação (Gorjeta / Tip e Coperto)
  {
    keywords: [
      'coperto', 'gorjeta', 'tip', 'simulador de alimentacao',
      'cafe almoco jantar'
    ],
    matches: ['viagem', 'viagens', 'alimentacao', 'comida', 'restaurante', 'campo', 'para que serve'],
    response:
      "🍽️ **Para que servem os campos da aba Alimentação em Viagens?**\n\n" +
      "• **Café, Almoço, Jantar e Lanches:** Quanto cada pessoa pretende gastar por dia em cada refeição.\n" +
      "• 💵 **Gorjeta (`Tip %`):** Percentual de serviço adicionado automaticamente conforme a cultura do país da viagem (nos EUA, por exemplo, a gorjeta é quase obrigatória!).\n" +
      "• 🥖 **Coperto:** Taxa fixa cobrada por pessoa só para sentar à mesa e receber couvert/pãozinho (muito tradicional na Itália)."
  },

  // 14. Viagens — Aba Câmbio (Spread, IOF, Cotação Manual e Modalidades)
  {
    keywords: [
      'spread', 'iof', 'conta global', 'cotacao manual',
      'simulador de cambio', 'especie', 'comprar dolar', 'comprar euro'
    ],
    matches: ['viagem', 'viagens', 'cambio', 'moeda', 'campo', 'para que serve'],
    response:
      "💱 **Para que servem os campos da aba Câmbio em Viagens?**\n\n" +
      "• **Cotação Comercial (Automática de 1 em 1 hora) ou Cotação Manual:** O valor base da moeda estrangeira.\n" +
      "• 🏦 **Spread (`%`):** É a 'gordurinha' que o banco ou casa de câmbio cobra acima da cotação oficial para te vender a moeda.\n" +
      "• 🏛️ **IOF (`%`):** Imposto sobre Operações Financeiras cobrado pelo governo na conversão.\n" +
      "• **Modalidade (Conta Global vs. Espécie vs. Cartão de Crédito):** Compara onde suas moedinhas rendem mais e pagam menos impostos!"
  },

  // 15. Relatórios — Mapa de Calor (Heatmap) e Personalizar Ordem/Minimizar
  {
    keywords: [
      'mapa de calor', 'heatmap', 'gastos diarios', 'quadradinhos',
      'personalizar ordem', 'minimizar relatorios', 'maximizar relatorios',
      'ordem dos relatorios'
    ],
    matches: ['relatorio', 'relatorios', 'calendario', 'campo', 'para que serve', 'como funciona'],
    response:
      "🔥 **Como funcionam o Mapa de Calor e a Personalização lá em Relatórios?**\n\n" +
      "• 🗓️ **Mapa de Calor de Gastos Diários (Heatmap):** É um calendário visual onde cada quadradinho é um dia do mês. Quanto mais quente/escura a cor do quadrado, mais dinheiro saiu do bolso naquele dia! Clique em qualquer dia para ver a lista exata do que você comprou naquela data.\n" +
      "• 🎛️ **Personalizar Ordem e Exibição (Maximizar / Minimizar):** Fica no topo de Relatórios (começa minimizado para economizar espaço na tela). Clicando em **'Maximizar'**, você pode ligar/desligar qualquer um dos 8 relatórios ou mudar a ordem deles com as setas!"
  },

  // 16. Backup e Restauração
  {
    keywords: [
      'backup', 'exportar dados', 'restaurar backup', 'salvar copia',
      'copia de seguranca'
    ],
    matches: ['sistema', 'arquivo', 'json', 'para que serve', 'como funciona'],
    response:
      "💾 **Para que serve a tela de Backup?**\n\n" +
      "• **Exportar Backup:** Baixa um arquivo completo com todas as suas Receitas, Despesas, Categorias, Orçamentos, Cartões e Viagens para você guardar em segurança no computador.\n" +
      "• **Restaurar Backup:** Permite subir esse arquivo de volta caso você queira recuperar seus dados em qualquer momento!"
  },

  // 17. Configurações e Zona de Perigo (Excluir Meu Cadastro)
  {
    keywords: [
      'excluir conta', 'excluir cadastro', 'excluir meu cadastro', 'apagar conta',
      'deletar conta', 'zona de perigo', 'configuracoes', 'trocar senha', 'idioma', 'tema escuro'
    ],
    matches: ['conta', 'perfil', 'seguranca', 'configuracoes', 'como faco', 'para que serve'],
    response:
      "⚙️ **O que você encontra na tela de Configurações?**\n\n" +
      "• 👤 **Aba Perfil:** Troque sua foto (avatar), nome, e-mail, WhatsApp, idioma (`PT/EN/ES`) e moeda padrão (`BRL/USD/EUR`).\n" +
      "• 🎨 **Aba Aparência:** Alterne entre Tema Claro e Tema Escuro.\n" +
      "• 🔒 **Aba Segurança da Conta:**\n" +
      "  - **Alterar Senha:** Atualiza sua senha de acesso.\n" +
      "  - ⚠️ **Zona de Perigo — Excluir Meu Cadastro:** Se um dia você quiser apagar sua conta e todos os seus dados permanentemente, basta clicar em **'Excluir Meu Cadastro'** e digitar a palavra **`EXCLUIR`** para confirmar."
  },

  // 18. Roupinhas / Estados do FIN e Quiz Posso Gastar
  {
    keywords: [
      'quiz posso gastar', 'posso gastar', 'roupa do fin', 'fin de ouro',
      'estados do fin', 'por que o fin mudou', 'minimizar fin'
    ],
    matches: ['fin', 'mascote', 'quiz', 'ajuda', 'como funciona'],
    response:
      "🏆 **Quer saber como eu funciono aqui dentro da sua tela?**\n\n" +
      "• **Minhas 4 transformações:**\n" +
      "  1. 👛 **Carteira Triste:** Quando você gastou mais do que recebeu no mês.\n" +
      "  2. 🪙 **Moeda:** Quando seu saldo está positivo, economizando até 10%.\n" +
      "  3. 💵 **Nota de Dinheiro:** Quando você economiza entre 11% e 75% da renda!\n" +
      "  4. 🌟 **FIN de Ouro:** Quando você bate recorde de economia (+75%)!\n" +
      "• 🎮 **Botão 'Quiz: Posso Gastar?':** Clique nele aqui embaixo antes de fazer uma compra! Eu olho seu orçamento real do mês na hora e te digo se o sinal está Verde, Amarelo ou Vermelho!"
  }
];
