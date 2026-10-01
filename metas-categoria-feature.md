# Feature: Metas por Categoria Principal com Alternância R$/% e Replicação Multimeses

## Objetivo
Permitir a definição de metas mensais por categoria principal (com escolha entre valor monetário em R$ ou percentual %), incluindo a possibilidade de replicar essas metas para outros meses selecionados, além de definir metas padrão nas Configurações e visualizar o progresso no Dashboard.

---

## Decisões Tomadas
- **Configuração:** Em `Orcamento.jsx` (mês a mês) e em `Configuracoes.jsx` (meta padrão da categoria).
- **Flexibilidade de Entrada:** Alternador `[ R$ ]` ou `[ % ]` por categoria. Se preencher R$, calcula o % correspondente; se preencher %, calcula o R$ com base na renda/receita.
- **Replicação:** Botão e modal interativo em `Orcamento.jsx` para copiar as metas do mês atual para múltiplos meses selecionados (com atalhos: "Restante do ano", "Próximos 3 meses", seleção individual).
- **Edge Case 1 (Base %):** Renda Real do Orçamento do mês -> fallback para soma das Receitas do mês -> fallback para exibição em %.
- **Edge Case 2 (Categorias existentes):** Meta é opcional; adicionado modal/botão de edição em cada card de categoria em `Configuracoes.jsx` para editar nome, cor e meta de categorias existentes.
- **Visualização de Progresso:** Barra de progresso e status visual (verde/amarelo/vermelho) no Dashboard e no Orçamento.

---

## Tarefas de Implementação

- [x] **Tarefa 1: Suporte no Backend e Persistência de Dados**
  - Adaptar `server/utils/databasePg.js` e `server/utils/databaseJson.js` para garantir persistência dos campos `tipoMeta` e `valorMeta` nas categorias, além de suportar salvar orçamentos replicados em lote sem perda de integridade.
  - *Verificação:* Executar script de teste ou chamada à API salvando e recuperando categoria com `tipoMeta` e `valorMeta`.

- [x] **Tarefa 2: Gerenciamento e Edição de Categorias em `Configuracoes.jsx`**
  - Atualizar formulário de "Nova Categoria" para incluir campos opcionais de meta (`tipoMeta`: `valor` ou `percentual`, e `valorMeta`).
  - Adicionar botão de edição em cada card de categoria existente para abrir modal de edição (nome, cor, meta e tipo).
  - *Verificação:* Cadastrar nova categoria com meta em R$ ou % e editar categoria existente salvando no backend.

- [x] **Tarefa 3: Alternância R$/% e Cálculo Reativo em `Orcamento.jsx`**
  - Na tabela (desktop) e nos cards (mobile) de `Orcamento.jsx`, permitir alternar entre `[ R$ ]` e `[ % ]` para cada categoria.
  - Atualizar os cálculos reativos para converter automaticamente entre valor monetário planejado e percentual conforme a renda real disponível.
  - *Verificação:* Inserir valor em R$ e verificar cálculo do %; inserir % e verificar cálculo em R$.

- [x] **Tarefa 4: Modal de Replicação de Metas para Múltiplos Meses em `Orcamento.jsx`**
  - Adicionar botão "Copiar Metas para outros meses" no cabeçalho de `Orcamento.jsx`.
  - Criar modal com checkboxes dos meses do ano, botões de atalho ("Selecionar Restante do Ano", "Próximos 3 meses", "Limpar") e botão de confirmação.
  - Salvar as categorias e metas para todos os meses selecionados via API.
  - *Verificação:* Definir metas no mês atual, replicar para 3 meses à frente e navegar entre os meses confirmando a persistência.

- [x] **Tarefa 5: Visualização do Progresso e Atingimento de Metas no `Dashboard.jsx`**
  - Adicionar card/seção no `Dashboard.jsx` com barras de progresso do consumo da meta por categoria no mês selecionado (verde < 80%, amarelo 80-100%, vermelho > 100%).
  - *Verificação:* Abrir Dashboard e verificar se categorias com meta exibem barra de progresso com valor gasto vs meta.

- [x] **Tarefa 6: Validação Final e Testes do Fluxo Completo**
  - Testar fluxo ponta a ponta: Configurações -> Orçamento -> Cópia de meses -> Dashboard.
  - Executar checagem de build/lint no frontend.
  - *Verificação:* `npm run build` executado com sucesso sem erros de sintaxe ou tipos.

---

## Critérios de Sucesso (Done When)
- [x] O usuário consegue configurar meta por R$ ou % para cada categoria.
- [x] O usuário consegue copiar metas de um mês para outros meses escolhidos.
- [x] Categorias já existentes podem ser editadas para incluir ou alterar metas.
- [x] O Dashboard exibe o progresso de gastos em relação às metas do mês.
- [x] Build e testes de frontend passam sem erros.
