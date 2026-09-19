require('dotenv').config({ path: '.env.local' });
const { list } = require('@vercel/blob');
const ExcelJS = require('exceljs');

async function test() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const fetchOptions = {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  };
  
  const blobs = await list({ prefix: `subaselvi/invoices.xlsx`, token });
  const matching = blobs.blobs.find(b => b.pathname === `subaselvi/invoices.xlsx`) || blobs.blobs[0];
  const blobUrl = matching.downloadUrl || matching.url;
  const res = await fetch(`${blobUrl}${blobUrl.includes('?') ? '&' : '?'}t=${Date.now()}`, fetchOptions);
  
  const buffer = await res.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet("Invoices");
  
  let rows = [];
  ws.eachRow((row, rowNumber) => {
    rows.push(row.values);
  });
  console.log("Direct Blob Store Excel Rows:", rows.length);
  console.log(JSON.stringify(rows[rows.length - 1]));
}

test();
