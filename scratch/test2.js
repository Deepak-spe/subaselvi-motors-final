const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/BLOB_READ_WRITE_TOKEN="(.*?)"/);
if (match) {
  process.env.BLOB_READ_WRITE_TOKEN = match[1];
  const { list } = require('@vercel/blob');
  list().then(async res => {
    const blob = res.blobs.find(b => b.pathname === 'credit_counter.json');
    if (blob) {
      const resp = await fetch(blob.url + '?t=' + Date.now());
      const txt = await resp.text();
      console.log('credit_counter.json:', txt);
    }
    const inv = res.blobs.find(b => b.pathname === 'counter.json');
    if (inv) {
      const resp = await fetch(inv.url + '?t=' + Date.now());
      const txt = await resp.text();
      console.log('counter.json:', txt);
    }
  }).catch(console.error);
}
