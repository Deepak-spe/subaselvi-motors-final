const fs = require('fs');
const path = require('path');

// This script helps sync local data to understand what needs to be uploaded
const DATA_DIR = path.join(__dirname, 'data');

console.log('=== LOCAL DATA STATUS ===\n');

const files = [
  'invoices.xlsx',
  'credit_receipts.xlsx', 
  'mahindra_invoices.xlsx',
  'counter.json',
  'credit_counter.json',
  'mahindra_counter.json',
  'catalog.json',
  'mahindra_prices.json'
];

files.forEach(file => {
  const filePath = path.join(DATA_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`${file}:`);
    console.log(`  Size: ${stats.size} bytes`);
    console.log(`  Modified: ${stats.mtime}`);
    console.log(`  Exists: Yes\n`);
  } else {
    console.log(`${file}: Not found\n`);
  }
});

console.log('=== RECOMMENDATION ===');
console.log('To sync this data to Vercel Blob, you need to:');
console.log('1. Deploy these files to Vercel');
console.log('2. The server will automatically use local files if blob storage is empty');
console.log('3. Or manually upload these files to Vercel Blob storage');
console.log('\nCurrent local data will be used when deployed.');
