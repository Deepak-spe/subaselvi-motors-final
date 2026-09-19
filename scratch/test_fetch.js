const { list } = require("@vercel/blob");
require("dotenv").config({ path: ".env.local" });

async function testFetch() {
  try {
    const blobs = await list({ prefix: "subaselvi/test.txt" });
    const matching = blobs.blobs[0];
    const blobUrl = matching.downloadUrl || matching.url;
    const res = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });
    const text = await res.text();
    console.log("Body:", text);
  } catch(e) {
    console.error(e);
  }
}
testFetch();
