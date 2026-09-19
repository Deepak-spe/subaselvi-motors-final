const http = require('https');

const req = http.request('https://subaselvi-motors-billing-zlbf.vercel.app/api/credit-receipts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('RESPONSE:', res.statusCode, data);
  });
});

req.on('error', e => {
  console.error('ERROR:', e);
});

req.write(JSON.stringify({
  date: '2026-09-17',
  customerName: 'Production Test',
  amount: 10,
  amountWords: 'Ten',
  settlementOf: 'TVS',
  headOfAccount: 'Test'
}));
req.end();
