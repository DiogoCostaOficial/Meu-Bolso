const fs = require('fs');
const path = require('path');

/**
 * Serviço de Geração de Vídeos Curtos a partir do MANUAL_DE_USO.md
 * usando Google Gemini Interactions API:
 * 1. gemini-3.8-flash: Lê o capítulo correspondente do MANUAL_DE_USO.md e refina o prompt cinematográfico + roteiro curto.
 * 2. gemini-omni-1.1-flash: Recebe a imagem oficial do mascote FIN (image-to-video) + prompt e gera o arquivo .mp4 em public/videos/manual/<topicId>.mp4.
 */

const TOPIC_MANUAL_SECTIONS = {
  orcamento: 'CAPÍTULO 3: Orçamento Mensal (Dar Nome ao Dinheiro)',
  dashboard: 'CAPÍTULO 8: Dashboard (Visão Geral e Mapa de Calor)',
  receitas: 'CAPÍTULO 4: Receitas (Suas Entradas de Dinheiro)',
  despesas: 'CAPÍTULO 5: Despesas (Controle de Gastos do Dia a Dia)',
  cartoes: 'CAPÍTULO 6: Cartões de Crédito (Faturas e Compras Parceladas)',
  investimentos: 'CAPÍTULO 7: Investimentos (A Bola de Neve dos Juros)',
  viagens: 'CAPÍTULO 9: Viagens (Planejador de Roteiros e Orçamento de Férias)',
  relatorios: 'CAPÍTULO 10: Relatórios e Exportação Personalizável',
  configuracoes: 'CAPÍTULO 2: Passo 1 Inicial — Configurações do Seu Perfil',
  fin_quiz: 'CAPÍTULO 11: Assistente FIN e o Quiz "Posso Gastar?"'
};

const MASCOT_IMAGE_BY_TOPIC = {
  orcamento: 'fin_coin_boy.png',
  dashboard: 'fin_gold_boy.png',
  receitas: 'fin_wallet_boy.png',
  despesas: 'fin_bill_boy.png',
  cartoes: 'fin_wallet_boy.png',
  investimentos: 'fin_gold_boy.png',
  viagens: 'fin_coin_boy.png',
  relatorios: 'fin_bill_boy.png',
  configuracoes: 'fin_wallet_boy.png',
  fin_quiz: 'fin_gold_boy.png'
};

function extractChapterFromManual(manualText, topicId) {
  const chapterHeader = TOPIC_MANUAL_SECTIONS[topicId] || TOPIC_MANUAL_SECTIONS.orcamento;
  const idx = manualText.indexOf(chapterHeader);
  if (idx === -1) return manualText.slice(0, 2500);
  const nextChapterIdx = manualText.indexOf('## ', idx + chapterHeader.length);
  return nextChapterIdx !== -1
    ? manualText.slice(idx, nextChapterIdx)
    : manualText.slice(idx, idx + 3000);
}

async function callGeminiInteraction(apiKey, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

const LANGUAGE_LABELS = {
  'pt-BR': 'Português do Brasil (Brazilian Portuguese)',
  'pt-PT': 'Português de Portugal (European Portuguese)',
  en: 'Inglês (English)',
  es: 'Espanhol (Spanish)',
  it: 'Italiano (Italian)',
  zh: 'Mandarim (Mandarin Chinese)',
  fr: 'Francês (French)',
  de: 'Alemão (German)'
};

/**
 * Lê o MANUAL_DE_USO.md, gera o roteiro com gemini-3.8-flash e renderiza o vídeo .mp4 com gemini-omni-1.1-flash
 */
async function generateManualVideoWithGemini({ topicId = 'orcamento', language = 'pt-BR', apiKey }) {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey) {
    throw new Error('Chave GEMINI_API_KEY não configurada. Adicione GEMINI_API_KEY no arquivo .env ou informe no gerador.');
  }

  const targetLanguageLabel = LANGUAGE_LABELS[language] || LANGUAGE_LABELS['pt-BR'];

  const rootDir = path.resolve(__dirname, '../..');
  const manualPath = path.join(rootDir, 'MANUAL_DE_USO.md');
  const manualContent = fs.existsSync(manualPath)
    ? fs.readFileSync(manualPath, 'utf8')
    : 'Manual de Uso do Sistema Meu Bolso.';

  const chapterExcerpt = extractChapterFromManual(manualContent, topicId);

  // 1. Ler o capítulo do Manual com gemini-3.8-flash e produzir o prompt cinematográfico para gemini-omni-1.1-flash no idioma do cliente
  const scriptInteraction = await callGeminiInteraction(finalApiKey, {
    model: 'gemini-3.8-flash',
    input:
      `Você é o diretor de animação do assistente financeiro FIN do aplicativo Meu Bolso.\n` +
      `Leia este trecho oficial do nosso MANUAL_DE_USO.md:\n\n${chapterExcerpt}\n\n` +
      `Crie uma descrição visual curta em inglês (máximo 70 palavras) para o modelo de vídeo gemini-omni-1.1-flash animar o nosso mascote (da imagem de referência) explicando esse módulo de forma alegre, estilo animação 3D Pixar, iluminada, com elementos visuais financeiros amigáveis e fala curta narrada no idioma: ${targetLanguageLabel}. Responda APENAS com o prompt de geração do vídeo.`
  });

  const generatedVideoPrompt =
    scriptInteraction?.output_text?.trim() ||
    'Bring this cute 3D golden coin mascot character to life in a cheerful Pixar-style animation, waving at the viewer and pointing at glowing financial budget jars and charts in a modern studio.';

  // 2. Carregar imagem oficial do mascote FIN para enviar como referência (Image-to-Video) no gemini-omni-1.1-flash
  const mascotFileName = MASCOT_IMAGE_BY_TOPIC[topicId] || 'fin_coin_boy.png';
  const mascotPath = path.join(rootDir, 'public', 'assets', mascotFileName);
  const inputParts = [];

  if (fs.existsSync(mascotPath)) {
    const imageBase64 = fs.readFileSync(mascotPath).toString('base64');
    inputParts.push({
      type: 'image',
      data: imageBase64,
      mime_type: 'image/png'
    });
  }

  inputParts.push({
    type: 'text',
    text: generatedVideoPrompt
  });

  // 3. Chamar gemini-omni-1.1-flash para gerar o vídeo .mp4
  const videoInteraction = await callGeminiInteraction(finalApiKey, {
    model: 'gemini-omni-1.1-flash',
    input: inputParts
  });

  const videoBase64 =
    videoInteraction?.output_video?.data ||
    videoInteraction?.interaction?.output_video?.data ||
    null;

  if (!videoBase64) {
    throw new Error('O modelo gemini-omni-1.1-flash respondeu sem bytes de vídeo (verifique permissões/região da chave GEMINI_API_KEY).');
  }

  const outputDir = process.env.VERCEL
    ? '/tmp/videos/manual'
    : path.join(rootDir, 'public', 'videos', 'manual');

  fs.mkdirSync(outputDir, { recursive: true });
  const outputFilePath = path.join(outputDir, `${topicId}.mp4`);
  fs.writeFileSync(outputFilePath, Buffer.from(videoBase64, 'base64'));

  return {
    topicId,
    videoUrl: `/videos/manual/${topicId}.mp4`,
    promptUsed: generatedVideoPrompt,
    savedPath: outputFilePath
  };
}

function listExistingManualVideos() {
  const rootDir = path.resolve(__dirname, '../..');
  const videosDir = path.join(rootDir, 'public', 'videos', 'manual');
  if (!fs.existsSync(videosDir)) return [];
  return fs
    .readdirSync(videosDir)
    .filter((f) => f.endsWith('.mp4'))
    .map((f) => f.replace('.mp4', ''));
}

module.exports = {
  generateManualVideoWithGemini,
  listExistingManualVideos,
  TOPIC_MANUAL_SECTIONS
};
