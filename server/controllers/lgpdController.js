// server/controllers/lgpdController.js
const db = require('../utils/database');
const { registrar } = require('../utils/audit');
const { VERSAO_DOCUMENTOS, FINALIDADES, FINALIDADES_OPCIONAIS } = require('../utils/lgpdConfig');

const ultimoPorFinalidade = (consentimentos) => {
  const mapa = {};
  // consentimentos vem ordenado do mais recente para o mais antigo
  for (const c of consentimentos) {
    if (!(c.finalidade in mapa)) mapa[c.finalidade] = c;
  }
  return mapa;
};

const montarStatus = async (userId) => {
  const consentimentos = await db.listarConsentimentos(userId);
  const ultimos = ultimoPorFinalidade(consentimentos);
  const termos = ultimos[FINALIDADES.TERMOS_POLITICA];
  return {
    versaoVigente: VERSAO_DOCUMENTOS,
    aceitouVersaoVigente: Boolean(termos && termos.concedido && termos.versao === VERSAO_DOCUMENTOS),
    opcionais: FINALIDADES_OPCIONAIS.map((finalidade) => ({
      finalidade,
      concedido: Boolean(ultimos[finalidade] && ultimos[finalidade].concedido)
    })),
    historico: consentimentos
  };
};

const status = async (req, res) => {
  try {
    res.json({ success: true, ...(await montarStatus(req.usuario.id)) });
  } catch (error) {
    console.error('Erro ao consultar status LGPD:', error.message);
    res.status(500).json({ success: false, message: 'Erro ao consultar consentimentos' });
  }
};

// Aceite dos Termos/Política (usado por contas existentes e por novos cadastros via login social)
const aceitarTermos = async (req, res) => {
  try {
    if (req.body.aceite !== true) {
      return res.status(400).json({ success: false, message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade.' });
    }
    await db.registrarConsentimento({
      userId: req.usuario.id,
      finalidade: FINALIDADES.TERMOS_POLITICA,
      versao: VERSAO_DOCUMENTOS,
      concedido: true,
      ip: req.ip
    });
    res.json({ success: true, message: 'Aceite registrado.', versao: VERSAO_DOCUMENTOS });
  } catch (error) {
    console.error('Erro ao registrar aceite:', error.message);
    res.status(500).json({ success: false, message: 'Erro ao registrar aceite' });
  }
};

// Concede ou revoga um consentimento opcional (art. 8º, §5º)
const definirConsentimento = async (req, res) => {
  try {
    const { finalidade, concedido } = req.body;
    if (!FINALIDADES_OPCIONAIS.includes(finalidade) || typeof concedido !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Finalidade ou valor inválido.' });
    }
    await db.registrarConsentimento({
      userId: req.usuario.id,
      finalidade,
      versao: VERSAO_DOCUMENTOS,
      concedido,
      ip: req.ip
    });
    res.json({ success: true, message: concedido ? 'Consentimento registrado.' : 'Consentimento revogado.' });
  } catch (error) {
    console.error('Erro ao definir consentimento:', error.message);
    res.status(500).json({ success: false, message: 'Erro ao atualizar consentimento' });
  }
};

// Acesso e portabilidade (art. 18, II e V): cópia completa dos dados do titular
const exportarMeusDados = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const usuarios = await db.getUsuarios();
    const usuario = usuarios.find((u) => u.id === userId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const { senha, otpCodigo, otpExpira, ...perfil } = usuario;
    const dadosFinanceiros = await db.buscarDadosUsuario(userId);
    const consentimentos = await db.listarConsentimentos(userId);

    await registrar(req, 'lgpd:exportacao_dados', { alvoId: userId });

    const pacote = {
      geradoEm: new Date().toISOString(),
      versaoDocumentos: VERSAO_DOCUMENTOS,
      titular: perfil,
      dadosFinanceiros,
      consentimentos
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="meus-dados-meu-bolso.json"');
    res.send(JSON.stringify(pacote, null, 2));
  } catch (error) {
    console.error('Erro ao exportar dados do titular:', error.message);
    res.status(500).json({ success: false, message: 'Erro ao exportar dados' });
  }
};

// Trilha de auditoria (somente admin)
const listarAuditoria = async (req, res) => {
  try {
    const itens = await db.listarAuditoria(req.query.limite);
    res.json({ success: true, total: itens.length, auditoria: itens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao listar auditoria' });
  }
};

module.exports = { status, aceitarTermos, definirConsentimento, exportarMeusDados, listarAuditoria };
