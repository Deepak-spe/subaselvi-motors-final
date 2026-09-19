const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/BLOB_READ_WRITE_TOKEN="(.*?)"/);
if(match) {
  process.env.BLOB_READ_WRITE_TOKEN = match[1];
  const { put, del, list } = require('@vercel/blob');
  
  async function resetData() {
    try {
      console.log('Resetting counters...');
      await put('counter.json', JSON.stringify({ next: 1 }), { access: 'public', addRandomSuffix: false, allowOverwrite: true });
      await put('credit_counter.json', JSON.stringify({ next: 1 }), { access: 'public', addRandomSuffix: false, allowOverwrite: true });
      
      console.log('Fetching blobs to delete excel files...');
      const { blobs } = await list();
      const invoiceBlob = blobs.find(b => b.pathname === 'invoices.xlsx');
      const creditBlob = blobs.find(b => b.pathname === 'credit_receipts.xlsx');
      
      if (invoiceBlob) {
        console.log('Deleting invoices.xlsx...');
        await del(invoiceBlob.url);
      }
      if (creditBlob) {
        console.log('Deleting credit_receipts.xlsx...');
        await del(creditBlob.url);
      }
      
      console.log('Data successfully reset!');
    } catch (err) {
      console.error('Error resetting data:', err);
    }
  }
  
  resetData();
} else {
  console.log('No token found');
}
