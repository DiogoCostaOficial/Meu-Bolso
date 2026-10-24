/**
 * Utilitário para detecção de gênero e tratamento personalizado do usuário pelo FIN.
 *
 * Diretrizes de UX e Tom de Voz:
 * 1. Nome Feminino -> Trata como "amiga".
 * 2. Nome Masculino ou Ambíguo -> Trata como "amigo".
 * 3. Alternância Natural: em algumas frases usa o Primeiro Nome ("E aí, Elaine!"),
 *    em outras usa apenas o vocativo carinhoso ("Olha aqui, amiga...").
 * 4. NUNCA misturar os dois na mesma oração ("Elaine, amiga!" é proibido).
 */

const EXCECOES_MASCULINAS = new Set([
  'lucas', 'luca', 'joshua', 'jean', 'elias', 'jonas', 'matias', 'isaias', 'isaia',
  'dimas', 'barnabé', 'josué', 'noé', 'andre', 'andré', 'alexandre', 'guilherme',
  'felipe', 'henrique', 'jorge', 'davi', 'lucca', 'buda', 'ayrton', 'alysson'
]);

const NOMES_AMBIGUOS = new Set([
  'cris', 'alex', 'sam', 'ari', 'dani', 'kim', 'robin', 'pat'
]);

const EXCECOES_FEMININAS = new Set([
  'carmen', 'raquel', 'miriam', 'ester', 'ruth', 'elis', 'inês', 'ines', 'cléo', 'cleo',
  'solange', 'shirley', 'sueli', 'suely', 'roseli', 'rosely', 'marlene', 'ivone', 'cleide'
]);

const TERMINACOES_FEMININAS = [
  'a', 'ine', 'elle', 'ele', 'ice', 'ete', 'iz', 'ane', 'any', 'elly', 'eli'
];

export const obterTratamentoUsuario = (nomeCompleto) => {
  if (!nomeCompleto || typeof nomeCompleto !== 'string') {
    return { primeiroNome: '', vocativo: 'amigo' };
  }

  const partes = nomeCompleto.trim().split(/\s+/);
  const primeiroNomeBruto = partes[0] || '';
  if (!primeiroNomeBruto) {
    return { primeiroNome: '', vocativo: 'amigo' };
  }

  const nomeLower = primeiroNomeBruto.toLowerCase();

  let vocativo = 'amigo'; // Padrão seguro para masculino ou ambíguo

  if (NOMES_AMBIGUOS.has(nomeLower)) {
    vocativo = 'amigo';
  } else if (EXCECOES_FEMININAS.has(nomeLower)) {
    vocativo = 'amiga';
  } else if (!EXCECOES_MASCULINAS.has(nomeLower)) {
    const isFeminino = TERMINACOES_FEMININAS.some(term => nomeLower.endsWith(term));
    if (isFeminino) {
      vocativo = 'amiga';
    }
  }

  const primeiroNome = primeiroNomeBruto.charAt(0).toUpperCase() + primeiroNomeBruto.slice(1).toLowerCase();

  return {
    primeiroNome,
    vocativo // 'amiga' ou 'amigo'
  };
};
