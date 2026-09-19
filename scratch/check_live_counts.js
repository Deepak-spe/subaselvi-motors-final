require('dotenv').config({ path: '.env.local' });
const { list } = require('@vercel/blob');

async function getLiveCounts() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const fetchOptions = {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  };

  const getCounter = async (filename) => {
    try {
      const blobs = await list({ prefix: `subaselvi/${filename}`, token });
      if (blobs.blobs && blobs.blobs.length > 0) {
        const matching = blobs.blobs.find(b => b.pathname === `subaselvi/${filename}`) || blobs.blobs[0];
        const blobUrl = matching.downloadUrl || matching.url;
        const res = await fetch(`${blobUrl}${blobUrl.includes('?') ? '&' : '?'}t=${Date.now()}`, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          return data.next;
        }
      }
      return 1;
    } catch(e) {
      return 1;
    }
  };

  const service = await getCounter("counter.json");
  const credit = await getCounter("credit_counter.json");
  const mahindra = await getCounter("mahindra_counter.json");
  
  console.log(`LIVE COUNTS:`);
  console.log(`Service Invoices (INV): ${service - 1}`);
  console.log(`Credit Receipts (RT): ${credit - 1}`);
  console.log(`Mahindra Invoices (MAH): ${mahindra - 1}`);
  
  const total = (service - 1) + (credit - 1) + (mahindra - 1);
  console.log(`Total generated across all roles: ${total}`);
}

getLiveCounts();
