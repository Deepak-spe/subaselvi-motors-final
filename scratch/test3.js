const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/BLOB_READ_WRITE_TOKEN="(.*?)"/);
if (match) {
  process.env.BLOB_READ_WRITE_TOKEN = match[1];
  const { put } = require('@vercel/blob');
  put('credit_counter.json', JSON.stringify({ next: 2 }), { access: 'public', addRandomSuffix: false })
    .then(res => console.log('Put res:', res))
    .catch(console.error);
}
