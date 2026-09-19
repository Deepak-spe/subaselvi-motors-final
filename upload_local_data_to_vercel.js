const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// This script uploads local data files to Vercel Blob storage
// You need to set BLOB_READ_WRITE_TOKEN environment variable

async function uploadToVercelBlob() {
  const DATA_DIR = path.join(__dirname, 'data');
  
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN environment variable is not set');
    console.error('Please set it using: set BLOB_READ_WRITE_TOKEN=your_token_here');
    return;
  }

  console.log('=== UPLOADING LOCAL DATA TO VERCEL BLOB ===\n');

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath);
        const contentType = file.endsWith('.xlsx') 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json';
        
        await put(`subaselvi/${file}`, fileContent, {
          access: 'public',
          contentType: contentType,
          addRandomSuffix: false,
          allowOverwrite: true
        });
        
        console.log(`✓ Uploaded: ${file} (${fileContent.length} bytes)`);
      } catch (error) {
        console.error(`✗ Failed to upload ${file}:`, error.message);
      }
    } else {
      console.log(`⊘ Skipped: ${file} (not found locally)`);
    }
  }

  console.log('\n=== UPLOAD COMPLETE ===');
  console.log('Your local data has been uploaded to Vercel Blob storage.');
  console.log('The admin console should now show this data.');
}

uploadToVercelBlob().catch(console.error);
