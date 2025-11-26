require('dotenv').config({ path: 'server/.env' });
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('EMAIL_PASS first 2 chars:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 2) : 'N/A');
console.log('EMAIL_PASS last 2 chars:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 2) : 'N/A');
