/**
 * Remove duplicatas de um array de objetos baseado em uma propriedade específica.
 * Esta rotina garante que não haja campos duplicados sendo renderizados, 
 * podendo ser utilizada em qualquer parte do projeto.
 *
 * @param {Array} arr - O array de objetos original.
 * @param {string} key - A chave (propriedade) usada para identificar a duplicidade.
 * @returns {Array} - Um novo array limpo, sem as duplicatas.
 */
export const removeDuplicates = (arr, key) => {
  if (!Array.isArray(arr)) return arr;
  
  const seen = new Set();
  return arr.filter(item => {
    let value = item[key];
    if (typeof value === 'string') {
      value = value.trim().toLowerCase();
    }
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};
