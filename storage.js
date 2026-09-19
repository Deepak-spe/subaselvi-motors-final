const { put, list } = require('@vercel/blob');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_rVODt11yR7n9mSID_a3ISVBMed8wUiL5lPHGF8O3kwIjSZf";
const DATA_DIR = path.join(__dirname, "data");

function tryLocalWrite(filename, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const localPath = path.join(DATA_DIR, filename);
    fs.writeFileSync(localPath, data);
  } catch (err) {
    // Read-only filesystem in serverless functions is expected and ignored
  }
}

function tryLocalRead(filename, format = 'json') {
  try {
    const localPath = path.join(DATA_DIR, filename);
    if (fs.existsSync(localPath)) {
      if (format === 'json') {
        return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      } else {
        return fs.readFileSync(localPath);
      }
    }
  } catch (err) {}
  return null;
}

/**
 * Downloads data from Vercel Blob by filename with local fallback
 * @param {string} filename 
 * @param {'json'|'buffer'} format 
 */
async function getBlobData(filename, format = 'json') {
  try {
    const { blobs } = await list({ prefix: filename, token: BLOB_READ_WRITE_TOKEN });
    const fileBlob = blobs.find(b => b.pathname === filename);
    
    if (fileBlob) {
      const headers = { 'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}` };
      const response = await fetch(fileBlob.url, { headers });
      if (response.ok) {
        if (format === 'json') {
          return await response.json();
        } else {
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading blob ${filename}:`, err.message);
  }

  // Fallback to local files if blob fetch failed or not found
  return tryLocalRead(filename, format);
}

/**
 * Uploads data to Vercel Blob and keeps local backup if writable
 * @param {string} filename 
 * @param {any} data 
 */
async function putBlobData(filename, data) {
  let body = data;
  if (typeof data === 'object' && !Buffer.isBuffer(data)) {
    body = JSON.stringify(data, null, 2);
  }

  // Best-effort local file backup (ignored on read-only serverless disk)
  tryLocalWrite(filename, body);

  try {
    let blob;
    try {
      blob = await put(filename, body, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: BLOB_READ_WRITE_TOKEN
      });
    } catch (e) {
      if (e.message && e.message.includes('Cannot use public access on a private store')) {
        blob = await put(filename, body, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          token: BLOB_READ_WRITE_TOKEN
        });
      } else {
        throw e;
      }
    }
    return blob;
  } catch (err) {
    console.error(`Error writing blob ${filename}:`, err.message);
    throw err;
  }
}

module.exports = {
  getBlobData,
  putBlobData,
  BLOB_READ_WRITE_TOKEN
};
