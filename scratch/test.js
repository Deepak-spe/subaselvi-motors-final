const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/BLOB_READ_WRITE_TOKEN="(.*?)"/);
if (match) {
  process.env.BLOB_READ_WRITE_TOKEN = match[1];
  const { list } = require('@vercel/blob');
  list().then(res => console.log('Blobs:', res.blobs.map(b => b.pathname))).catch(console.error);
}
