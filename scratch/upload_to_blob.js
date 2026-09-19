require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { put } = require("@vercel/blob");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

async function uploadFiles() {
  const files = fs.readdirSync(DATA_DIR);
  for (const file of files) {
    if (file === ".gitkeep") continue;
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath);
    try {
      console.log(`Uploading ${file}...`);
      await put(file, content, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true
      });
      console.log(`Successfully uploaded public ${file}`);
    } catch (err) {
      console.log(`Public upload failed for ${file}, trying private...`);
      try {
        await put(file, content, {
          access: "private",
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true
        });
        console.log(`Successfully uploaded private ${file}`);
      } catch (privErr) {
        console.error(`Failed to upload ${file}:`, privErr);
      }
    }
  }
}

uploadFiles().then(() => console.log("Done."));
