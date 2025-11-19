import https from 'https';

https.get('https://hub.culturabuilder.com/prompts/prompt-15.txt', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decoded);
    } catch (e) {
      console.log('Erro ao decodificar:', e.message);
      console.log('Conteúdo original:', data);
    }
  });
}).on('error', (err) => {
  console.log('Erro ao baixar:', err.message);
});