require('dotenv').config({ path: '.env.local' });
const { list } = require('@vercel/blob');
async function test() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const blobs = await list({ token });
  console.log(blobs.blobs.map(b => b.pathname));
}
test();
