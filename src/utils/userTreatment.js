/**
 * Utilitário para detecção de gênero e tratamento personalizado do usuário pelo FIN.
 *
 * Diretrizes de UX e Tom de Voz:
 * 1. Nome Feminino -> Trata como "amiga".
 * 2. Nome Masculino ou Ambíguo -> Trata como "amigo".
 * 3. Analogias Lúdicas:
 *    - Usuário Feminino: "brincos", "caixinha de brincos", variando com "doces", "moedinhas", "sorvete".
 *    - Usuário Masculino: "figurinhas", "álbum de figurinhas", variando com "doces", "moedinhas", "sorvete".
 * 4. Alternância Natural: em algumas frases usa o Primeiro Nome ("E aí, Elaine!"),
 *    em outras usa apenas o vocativo carinhoso ("Olha aqui, amiga...").
 * 5. NUNCA misturar os dois na mesma oração ("Elaine, amiga!" é evitado).
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
    return {
      primeiroNome: '',
      vocativo: 'amigo',
      genero: 'masculino',
      itemColecao: 'figurinhas',
      itemColecaoSingular: 'figurinha',
      recipienteColecao: 'álbum de figurinhas',
      emojiColecao: '🃏'
    };
  }

  const partes = nomeCompleto.trim().split(/\s+/);
  const primeiroNomeBruto = partes[0] || '';
  if (!primeiroNomeBruto) {
    return {
      primeiroNome: '',
      vocativo: 'amigo',
      genero: 'masculino',
      itemColecao: 'figurinhas',
      itemColecaoSingular: 'figurinha',
      recipienteColecao: 'álbum de figurinhas',
      emojiColecao: '🃏'
    };
  }

  const nomeLower = primeiroNomeBruto.toLowerCase();

  let genero = 'masculino';

  if (NOMES_AMBIGUOS.has(nomeLower)) {
    genero = 'masculino';
  } else if (EXCECOES_FEMININAS.has(nomeLower)) {
    genero = 'feminino';
  } else if (!EXCECOES_MASCULINAS.has(nomeLower)) {
    const isFeminino = TERMINACOES_FEMININAS.some(term => nomeLower.endsWith(term));
    if (isFeminino) {
      genero = 'feminino';
    }
  }

  const vocativo = genero === 'feminino' ? 'amiga' : 'amigo';
  const itemColecao = genero === 'feminino' ? 'brincos' : 'figurinhas';
  const itemColecaoSingular = genero === 'feminino' ? 'brinco' : 'figurinha';
  const recipienteColecao = genero === 'feminino' ? 'caixinha de brincos' : 'álbum de figurinhas';
  const emojiColecao = genero === 'feminino' ? '✨' : '🃏';

  const primeiroNome = primeiroNomeBruto.charAt(0).toUpperCase() + primeiroNomeBruto.slice(1).toLowerCase();

  return {
    primeiroNome,
    vocativo,
    genero,
    itemColecao,
    itemColecaoSingular,
    recipienteColecao,
    emojiColecao
  };
};
