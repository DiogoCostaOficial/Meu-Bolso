// server/utils/lgpdConfig.js
// Versão vigente dos documentos legais. Ao alterar o texto, atualize a versão:
// todos os usuários serão solicitados a aceitar novamente.
const VERSAO_DOCUMENTOS = '2026-10-29';

const FINALIDADES = {
  TERMOS_POLITICA: 'termos_politica', // obrigatória: execução do contrato (art. 7º, V)
  COMUNICACAO: 'comunicacao_whatsapp', // opcional: consentimento (art. 7º, I)
  IA_ASSISTENTE: 'assistente_ia' // opcional: personalização com IA (art. 7º, I)
};

const FINALIDADES_OPCIONAIS = [FINALIDADES.COMUNICACAO, FINALIDADES.IA_ASSISTENTE];

module.exports = { VERSAO_DOCUMENTOS, FINALIDADES, FINALIDADES_OPCIONAIS };
