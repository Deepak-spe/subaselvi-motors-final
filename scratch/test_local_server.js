const { spawn } = require('child_process');
const http = require('http');

const serverProcess = spawn('node', ['server.js'], { stdio: 'pipe' });

serverProcess.stdout.on('data', data => console.log(`SERVER OUT: ${data}`));
serverProcess.stderr.on('data', data => console.error(`SERVER ERR: ${data}`));

setTimeout(() => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/credit-receipts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('RESPONSE:', res.statusCode, data);
      serverProcess.kill();
      process.exit(0);
    });
  });

  req.on('error', e => {
    console.error('REQ ERROR:', e);
    serverProcess.kill();
    process.exit(1);
  });

  req.write(JSON.stringify({
    date: '2026-09-17',
    customerName: 'Test',
    amount: 1234,
    amountWords: 'Test Words',
    settlementOf: 'TVS',
    headOfAccount: 'Test'
  }));
  req.end();
}, 2000);
