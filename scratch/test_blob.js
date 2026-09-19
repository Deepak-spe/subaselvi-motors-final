require('dotenv').config({ path: '.env.local' });
const storage = require('../storage.js');

async function testBlob() {
  try {
    console.log("Token:", process.env.BLOB_READ_WRITE_TOKEN ? "Exists" : "Missing");
    const result = await storage.putBlobData('test_blob.txt', 'hello world');
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testBlob();
