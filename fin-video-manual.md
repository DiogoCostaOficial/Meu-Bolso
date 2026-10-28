# Plano de Implementação: Gerador e Player de Vídeos Curtos do Manual no FIN (Google Gemini AI)

## 1. Objetivo
Permitir que o sistema leia o `MANUAL_DE_USO.md` e disponibilize vídeos curtos explicativos dentro da janela do assistente **FIN**, combinando:
1. **Motor Google Gemini (`@google/genai`):**
   - `gemini-3.8-flash`: Lê as seções do `MANUAL_DE_USO.md` e gera roteiros curtos, legendas e descrições visuais na linguagem do FIN.
   - `gemini-omni-1.1-flash`: Gera vídeos `.mp4` animados usando a imagem oficial do mascote FIN (`public/assets/fin_coin_boy.png` / `fin_gold_boy.png`) como referência visual (`image-to-video`) e salva em `public/videos/manual/<topico>.mp4`.
2. **Player de Vídeo Embutido no FIN (`EduMascot.jsx`):**
   - Botão **"🎬 Vídeo deste Módulo"** em todas as telas do sistema e nas respostas do Manual dentro do FIN.
   - Reproduz o arquivo `.mp4` pré-gerado em `public/videos/manual/<topico>.mp4` e conta também com reprodução animada interativa imediata (cenas do Manual + legendas sincronizadas + narração em português + botão para gerar/atualizar o `.mp4` via `gemini-omni-1.1-flash`).

## 2. Arquivos Criados / Atualizados
- `src/utils/finManualVideos.js`: Catálogo de vídeos curtos estruturados a partir dos capítulos do `MANUAL_DE_USO.md` (Dashboard, Orçamento, Receitas, Despesas, Cartões, Investimentos, Viagens, Relatórios, Configurações e Quiz/FIN), mapeados por rota (`pathname`) e por tópico do Manual.
- `server/utils/geminiVideoGenerator.js`: Serviço backend utilizando o SDK oficial `@google/genai` (`gemini-3.8-flash` para leitura do `MANUAL_DE_USO.md` e criação do roteiro + `gemini-omni-1.1-flash` para geração do vídeo `.mp4` com imagem de referência do FIN).
- `server/scripts/generateManualVideos.js`: Script CLI (`npm run generate:videos`) para pré-gerar todos os vídeos `.mp4` do Manual de Uso na pasta `public/videos/manual/`.
- `server/routes/user.js`: Rota `POST /api/user/fin-video/generate` e `GET /api/user/fin-video/status` para consultar vídeos `.mp4` gerados e acionar a pré-geração via chave da Gemini API.
- `src/components/FinVideoPlayer.jsx`: Componente de player de vídeo curto dentro do FIN (suporta `.mp4` nativo gerado pelo `gemini-omni-1.1-flash` + modo Storyboard Animado IA com narração em português e legendas passo a passo do Manual).
- `src/components/EduMascot.jsx`: Integração do botão **"🎬 Ver Vídeo Explicativo"** no cabeçalho/atalhos e nas respostas de ajuda do Manual.
