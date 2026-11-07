# Log Auditável do Projeto — Meu Bolso (financas-facil)

| Campo | Valor |
|---|---|
| Gerado em | 2026-10-29T20:26-03:00 |
| Repositório | https://github.com/DiogoCostaOficial/Meu-Bolso.git |
| Branch | main |
| HEAD (SHA completo) | d4d085c9e61f2a1808da968cdfc5f4cc84dc44b8 |
| Arquivos alterados não commitados | 0 |
| Versão (package.json) | 2.0.0 |
| Commits totais | 84 (83 diogo-costa85, 1 DiogoCostaOficial) |
| Arquivos rastreados | 475 |

## 1. Estrutura
- Frontend: React 18 + Vite 7 + Tailwind (src/: components, contexts, hooks, lib, pages, services, utils)
- Backend: Node/Express (server/: controllers, middleware, routes, utils, scripts) + api/ (serverless Vercel)
- Mobile: Capacitor 8 / Android
- Deploy: Vercel (meubolso.capital, vercel.app), keep-alive workflow Supabase (.github)

## 2. Achados de segurança e qualidade
| # | Severidade | Achado | Evidência | Recomendação |
|---|---|---|---|---|
| 1 | Baixa | .env.production rastreado no git | contém apenas VITE_API_URL (sem segredos) | Aceitável; manter sem segredos |
| 2 | Info | Varredura de segredos (chaves Google, sk-, URLs de BD com senha, JWT_SECRET) em arquivos rastreados | Nenhuma ocorrência | — |
| 3 | Info | .env, .env.local e server/.env ignorados no .gitignore | .gitignore linhas 9-15 e 90 | — |
| 4 | Média | Dependência 'data-fns' (typo provável de date-fns, risco de typosquatting) | package.json | Remover; date-fns já existe |
| 5 | Média | xlsx 0.18.5 (npm) possui CVEs conhecidos (prototype pollution/ReDoS) | versão fixa no package.json | Migrar para versão do CDN SheetJS ou alternativa |
| 6 | Média | npm audit NÃO executado (sem rede no ambiente) | erro ENOTFOUND | Rodar 'npm audit --omit=dev' localmente |
| 7 | Baixa | Script lint é placeholder ('vite lint \|\| echo') | package.json | Configurar eslint (eslint.config.js existe) |
| 8 | Baixa | Binários grandes versionados (intro.mp4 e FIN-VIDEO.mp4, 4,1 MB cada, duplicados) | git ls-files | Deduplicar / usar Git LFS ou CDN |
| 9 | Baixa | Pastas sem uso aparente versionadas/presentes: backup-antes-toon, new_node_modules, tmp | raiz | Revisar e remover |
| 10 | Baixa | Sem testes automatizados declarados | package.json sem script test | Adicionar suíte (Vitest) |

## 3. Histórico de commits (mais recente primeiro)
| SHA | Data | Autor | Mensagem |
|---|---|---|---|
| d4d085c | 2026-10-28 | diogo-costa85 | feat(fin): adiciona vídeos, voz e ajustes de orçamento e despesas |
| 6627e5f | 2026-10-27 | diogo-costa85 | feat(fin): adiciona manual de uso completo na inteligencia do FIN e controles inclusivos de fonte (A-/A+) e expansao |
| 11eeebc | 2026-10-27 | diogo-costa85 | fix(server): usa /tmp/uploads na Vercel e protege mkdirSync com try/catch |
| b7b1d58 | 2026-10-27 | diogo-costa85 | fix(api): usa rota relativa /api em ambos os dominios de producao (meubolso.capital e vercel.app) |
| edd3556 | 2026-10-27 | diogo-costa85 | fix(viagens): corrige salvamento de roteiros no PostgreSQL em producao e atualiza melhorias |
| c5c36ee | 2026-10-24 | diogo-costa85 | feat(mascot-fin): personalized analogies for gender (brincos vs figurinhas, cofrinho, doces) |
| 1df1b3c | 2026-10-24 | diogo-costa85 | feat(mascot-fin): personalized gender vocative treatment and natural conversational tone |
| 8ae9fc4 | 2026-10-23 | diogo-costa85 | feat(relatorios-auth): advanced reports separation, thermal calendar, totals and authentication improvements |
| 40cba41 | 2026-10-23 | diogo-costa85 | fix: resolve zero values on Receitas and Despesas summary cards caused by LanguageContext DOM override |
| a7e1039 | 2026-10-23 | diogo-costa85 | fix: total calculation and date filtering for Despesas and Receitas cards |
| f4739ac | 2026-10-23 | diogo-costa85 | fix(prod): allow meubolso.capital domain in CORS, enable COOP popups, and allow direct admin login |
| 1aefe33 | 2026-10-23 | diogo-costa85 | fix(auth): serverless writable fs support, mandatory country and whatsapp fields, language selector moved to top |
| ba52c28 | 2026-10-23 | diogo-costa85 | feat: Painel Admin PM/PO analytics, dinamic travel forms, GitHub restore and system versioning |
| 8b77421 | 2026-10-21 | DiogoCostaOficial | Add keep-alive workflow for Supabase |
| 0c11821 | 2026-10-05 | diogo-costa85 | feat: melhorias de performance e sincronizacao no dashboard e eduContext |
| df742ac | 2026-10-05 | diogo-costa85 | feat: suporte multimoeda e modulo de passagens e bagagens em viagens |
| e45e351 | 2026-10-05 | diogo-costa85 | merge main into feature/modulo-viagens |
| ab5a77a | 2026-10-05 | diogo-costa85 | fix(cartoes): persistencia definitiva da exclusao de cartoes e sanitizacao de IDs no Postgres |
| 492add1 | 2026-10-05 | diogo-costa85 | feat(viagens): modulo de viagens com calculos e cotacao e fix de cartoes |
| 76a5a5c | 2026-10-05 | diogo-costa85 | feat: mascote FIN movel com ancoragem no menu, alinhamento do header e seletor de moedas |
| 093a23c | 2026-10-01 | diogo-costa85 | fix(database): inicializar colunas cartao e metas automaticamente no Supabase Postgres |
| 3f41f02 | 2026-10-01 | diogo-costa85 | docs: remover manuais avulsos e rascunhos redundantes da raiz |
| fd8a35f | 2026-10-01 | diogo-costa85 | chore: remover arquivos legados, scripts de teste descartaveis e componentes obsoletos |
| dd5c4b6 | 2026-10-01 | diogo-costa85 | feat: integracao de despesas com cartoes e metas orcamentarias por categoria |
| e8c36f8 | 2026-09-14 | diogo-costa85 | ci: adiciona headers anti-cache e ping no servico de auth para garantir atividade do banco no supabase |
| c454e9e | 2026-09-07 | diogo-costa85 | fix(relatorios): corrigir colunas zeradas e barras ausentes no acompanhamento de orcamento |
| ce7b1f8 | 2026-08-20 | diogo-costa85 | feat(auth): add admin123 as alternative fallback password for admin login |
| 1c37f59 | 2026-08-20 | diogo-costa85 | fix(vercel): use .cjs extension for serverless entrypoint to prevent ES module require errors |
| 4eb5e33 | 2026-08-20 | diogo-costa85 | fix(vercel): restore full builds config with api/index.js entrypoint and add routes for /user /auth /admin /debug to fix 405 errors |
| 8b4fa19 | 2026-08-20 | diogo-costa85 | fix(vercel): add api/index.js serverless entrypoint and configure rewrites to fix 405 Method Not Allowed error on POST /api/user/dados |
| dd19f92 | 2026-08-20 | diogo-costa85 | fix(db): ensure all transaction IDs and batch UNNEST arrays are strongly typed strings to prevent PostgreSQL cast errors |
| 70391d3 | 2026-08-20 | diogo-costa85 | fix: clear cached layout classes on load and lock default theme to lux-gold for correct light/dark support |
| afa2214 | 2026-08-20 | diogo-costa85 | fix: remove remaining references to layoutVariant in sidebar theme button to resolve runtime error |
| 7cd3238 | 2026-08-20 | diogo-costa85 | fix: remove dynamic layout variant options and resolve list visual lag for revenues and expenses |
| 989c894 | 2026-08-14 | diogo-costa85 | feat: implement automatic JSON backup sync for database and users in production Supabase mode |
| c3c5bb4 | 2026-08-11 | diogo-costa85 | feat: add missing LayoutVariantContext file |
| 850783e | 2026-08-11 | diogo-costa85 | ui: implement eye icon password togglers in register screen |
| 0192701 | 2026-08-11 | diogo-costa85 | ui: reset eye icon state on login mode toggle |
| a23354b | 2026-08-11 | diogo-costa85 | chore: update fallback credentials and login security block to use secure generated password |
| 109b592 | 2026-08-11 | diogo-costa85 | chore: update default admin operator to use secure generated password |
| 4e66eb4 | 2026-08-11 | diogo-costa85 | feat: allow converting single expense to installment payments inside inline editing |
| 8911719 | 2026-08-05 | diogo-costa85 | ci: altera ping para consultar tabela de categorias para contornar seguranca do supabase |
| 73c44ce | 2026-08-05 | diogo-costa85 | ci: ajusta headers de autenticacao para nova chave do supabase |
| 9236eea | 2026-08-05 | diogo-costa85 | ci: adiciona tratamento de URL e logs de diagnóstico no ping |
| 70e9579 | 2026-08-05 | diogo-costa85 | ci: adiciona tratamento de URL e logs de diagnóstico no ping |
| 820e8c5 | 2026-08-05 | diogo-costa85 | ci: adiciona rotina para manter o supabase ativo |
| 1e1140a | 2026-07-08 | diogo-costa85 | feat: namespace system update announcements per user login |
| 02b6097 | 2026-07-08 | diogo-costa85 | feat: implement dynamic system update registry and automated announcement loop for FIN |
| e7f7ff2 | 2026-07-08 | diogo-costa85 | feat: add knowledge cards for DRE usage, Budgeting, and Cash Flow in FIN chatbot |
| 8610438 | 2026-07-08 | diogo-costa85 | feat: add automatic announcement of July 8 updates via FIN |
| 274b4a2 | 2026-07-08 | diogo-costa85 | feat: add missing finChatbot module |
| a06bd3c | 2026-07-08 | diogo-costa85 | feat: add natural language question answering to FIN assistant |
| 0409203 | 2026-07-08 | diogo-costa85 | feat: add payment status selection to new expense |
| e80048f | 2026-07-08 | diogo-costa85 | feat: adicionar popup do fin avisando sobre conversao de moedas no primeiro acesso |
| fb19064 | 2026-07-08 | diogo-costa85 | feat: adicionar seletor de moedas global (BRL, USD, EUR) |
| 3daa3a6 | 2026-07-08 | diogo-costa85 | fix: remove duplicatas de categorias no frontend |
| cd4d11d | 2026-06-12 | diogo-costa85 | feat: permite login com usuario admin |
| ca17ce0 | 2026-06-12 | diogo-costa85 | feat: reduz tempo de OTP para 2 minutos |
| 9964baa | 2026-06-05 | diogo-costa85 | fix: limpa espacos e quebras de linha das chaves do supabase |
| bb803f2 | 2026-06-05 | diogo-costa85 | fix: atualiza google client id no backend |
| c25a954 | 2026-06-05 | diogo-costa85 | fix: atualiza google client id |
| 476b48b | 2026-06-05 | diogo-costa85 | chore: limpeza de arquivos não utilizados |
| 7f25727 | 2026-06-05 | diogo-costa85 | feat: adiciona todos os arquivos do projeto |
| 87f3700 | 2025-12-04 | diogo-costa85 | Update ProtectedRoute.jsx |
| 86b060c | 2025-12-04 | diogo-costa85 | Dashboard |
| 1019196 | 2025-12-03 | diogo-costa85 | Painel Admin Funções |
| 9dca780 | 2025-12-03 | diogo-costa85 | painel admin |
| b6758a8 | 2025-12-03 | diogo-costa85 | DIOGO ADMIN |
| 2da7035 | 2025-12-03 | diogo-costa85 | Update LoginNovo.jsx |
| eadf58f | 2025-12-03 | diogo-costa85 | Novo Login |
| 2f5a833 | 2025-12-03 | diogo-costa85 | Atu OTP |
| 5127700 | 2025-12-03 | diogo-costa85 | Commit |
| 28541e0 | 2025-12-03 | diogo-costa85 | Mascote |
| a38ba73 | 2025-11-30 | diogo-costa85 | Agente Financeiro V1 |
| ed6887f | 2025-11-30 | diogo-costa85 | Gravar Orçamento |
| d80597e | 2025-11-26 | diogo-costa85 | Login 3 |
| 4bce94b | 2025-11-26 | diogo-costa85 | erro login2 |
| c6d144b | 2025-11-26 | diogo-costa85 | Login |
| 3d00e1b | 2025-11-26 | diogo-costa85 | Atu-pagina |
| 80e89b0 | 2025-11-26 | diogo-costa85 | Correção |
| 07f4b06 | 2025-11-26 | diogo-costa85 | banco de dados e vercel |
| 28502b2 | 2025-11-21 | diogo-costa85 | Novo landingpage |
| ad17eed | 2025-11-20 | diogo-costa85 | Atu - Perfil do Usuário |
| 986c0a0 | 2025-11-19 | diogo-costa85 | Finanças Fácil |

## 4. Metodologia e reprodutibilidade
Comandos usados: git rev-parse HEAD, git log, git shortlog -sn, git status --porcelain, git ls-files, git grep (padrões de segredos), Get-Content package.json, npm audit (falhou: sem rede).
Limitações: análise estática superficial; sem análise de código-fonte linha a linha, sem scan de vulnerabilidades de dependências, sem revisão da infraestrutura Vercel/Supabase.
