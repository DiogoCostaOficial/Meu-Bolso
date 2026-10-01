# Feature: Integração entre Gerenciamento de Cartões e Lançamento de Despesas

## Objetivo
Permitir a vinculação opcional de cartões de crédito ao cadastrar uma nova despesa (com as opções de cartões carregadas dinamicamente a partir do "Gerenciamento de Cartões"). As despesas vinculadas devem somar automaticamente na fatura do mês correspondente (mês seguinte por padrão ou pela data de vencimento) na tabela de Cartões, com suporte a parcelamento e ajuste manual.

---

## Decisões Tomadas com o Usuário
1. **Mês da Fatura:** Mês seguinte automático (Mês da compra + 1) ou pela `dataVencimento` informada na despesa.
2. **Compras Parceladas:** Distribuição automática de cada parcela nos meses subsequentes da fatura (ex: parcela 1 no mês seguinte, parcela 2 no próximo, etc.).
3. **Tabela de Cartões:** Valor somado automaticamente das despesas vinculadas, mantendo a possibilidade de ajuste ou edição manual na tabela de cartões se necessário.
4. **Campo Opcional:** Na tela de despesas, o campo Cartão é opcional (pode selecionar "Nenhum / Não vinculado").

---

## Tarefas de Implementação

- [ ] **Tarefa 1: Suporte no Backend para Vínculo de Cartão nas Transações**
  - Atualizar `server/utils/databasePg.js` para adicionar colunas `cartao` e `cartao_id` na tabela `transactions`.
  - Atualizar `buscarDadosUsuario` e `salvarDadosUsuario` no PostgreSQL para mapear e persistir `cartao` e `cartaoId`.
  - Atualizar `server/utils/databaseJson.js` para garantir que `cartao` e `cartaoId` sejam preservados.

- [ ] **Tarefa 2: Seleção de Cartão no Formulário de Despesas (`src/pages/Despesas.jsx`)**
  - Carregar lista de cartões cadastrados em `carregarDados` / `carregarCategorias`.
  - Adicionar campo seletor "Cartão (opcional)" no formulário "Adicionar Nova Despesa" (com ícone e estilo idêntico aos campos existentes).
  - Incluir suporte nos formulários de edição (inline e modal).
  - Ao salvar despesa vinculada a cartão, calcular o mês da fatura (mês seguinte automático ou data de vencimento, com suporte a parcelamento).
  - Exibir badge com o nome do cartão na tabela de listagem de despesas.

- [ ] **Tarefa 3: Cálculo e Exibição Automática na Tela de Cartões (`src/pages/Cartoes.jsx`)**
  - Carregar `despesas` em `Cartoes.jsx`.
  - Implementar cálculo dinâmico dos gastos por cartão e por mês (`getValorDespesasCartao`).
  - Integrar com o valor manual/ajuste existente (`getValorEfetivo`), atualizando os totais por mês, por cartão e total geral.
  - Exibir indicador visual de despesas vinculadas e modal de detalhamento das compras que compõem a fatura do mês.

- [ ] **Tarefa 4: Verificação e Build**
  - Executar `npm run build` para garantir ausência de erros de sintaxe ou tipos.
  - Testar fluxo ponta a ponta.

---

## Critérios de Sucesso (Done When)
- [ ] Cartões cadastrados aparecem dinamicamente no seletor de cartão em "Adicionar Nova Despesa".
- [ ] Campo de cartão é opcional.
- [ ] Despesa vinculada soma automaticamente no mês correto da fatura (mês seguinte ou vencimento) no "Gerenciamento de Cartões".
- [ ] Compras parceladas distribuem cada parcela nos meses futuros da fatura do cartão.
- [ ] Usuário ainda pode fazer ajustes manuais na tabela de cartões se desejar.
- [ ] Build do frontend passa com sucesso sem erros.
