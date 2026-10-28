require('dotenv').config();
const { generateManualVideoWithGemini, TOPIC_MANUAL_SECTIONS } = require('../utils/geminiVideoGenerator');

async function run() {
  const argTopic = process.argv[2];
  const topics = argTopic ? [argTopic] : Object.keys(TOPIC_MANUAL_SECTIONS);

  console.log(`🎬 Iniciando pré-geração de vídeos do MANUAL_DE_USO.md via Google Gemini (gemini-3.8-flash + gemini-omni-1.1-flash)...`);
  console.log(`📋 Tópicos na fila: ${topics.join(', ')}\n`);

  for (const topicId of topics) {
    try {
      console.log(`⏳ Gerando vídeo curto para [${topicId}] (${TOPIC_MANUAL_SECTIONS[topicId] || topicId})...`);
      const res = await generateManualVideoWithGemini({ topicId });
      console.log(`✅ Vídeo salvo com sucesso em: ${res.savedPath}\n   Prompt IA: ${res.promptUsed}\n`);
    } catch (err) {
      console.error(`❌ Falha ao gerar [${topicId}]: ${err.message}\n`);
    }
  }
}

run();
