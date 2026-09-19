const fs = require("fs");
const path = require("path");
const { getStore } = require("@netlify/blobs");

const siteID = "bdd36032-d47f-4d7e-8283-bcf236f73358";
const token = "nfp_PhXAV9JkwByYWtE1i3ePsmaLqmXG8KcG39d2";

async function uploadLocalData() {
  const store = getStore({
    name: "subaselvi-store",
    siteID,
    token
  });

  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    console.log("No data directory found.");
    return;
  }

  const files = fs.readdirSync(dataDir);
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (file.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      await store.setJSON(file, data);
      console.log(`Uploaded ${file} as JSON`);
    } else if (file.endsWith(".xlsx")) {
      const buffer = fs.readFileSync(filePath);
      await store.set(file, buffer);
      console.log(`Uploaded ${file} as Buffer`);
    }
  }
  console.log("All local data uploaded to Netlify Blobs successfully!");
}

uploadLocalData().catch(console.error);
