const { put, list } = require('@vercel/blob');
require('dotenv').config();

// Standard fetch is available in Node 18+

/**
 * Downloads data from Vercel Blob by filename
 * @param {string} filename 
 * @param {'json'|'buffer'} format 
 */
async function getBlobData(filename, format = 'json') {
  try {
    // List blobs to find the URL for the given filename
    const { blobs } = await list({ prefix: filename });
    const fileBlob = blobs.find(b => b.pathname === filename);
    
    if (!fileBlob) {
      return null;
    }

    const headers = {};
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
    }

    const response = await fetch(fileBlob.url, { headers });
    if (!response.ok) {
      return null;
    }

    if (format === 'json') {
      return await response.json();
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (err) {
    console.error(`Error reading blob ${filename}:`, err);
    return null;
  }
}

/**
 * Uploads data to Vercel Blob
 * @param {string} filename 
 * @param {any} data 
 */
async function putBlobData(filename, data) {
  try {
    let body = data;
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      body = JSON.stringify(data, null, 2);
    }

    // By default, try to determine access or just leave it out if the SDK allows it.
    // However, the SDK usually requires 'access' to be set.
    // If the store is private, we must set access to 'private' or remove it.
    // Wait, let's just pass 'public' if it's a public token, but there's no way to know except by trying.
    // Actually, Vercel docs say if the store is private, pass { access: 'private' }
    // Let's pass { access: 'public' } first, and fallback to { access: 'private' } if it fails.
    let blob;
    try {
      blob = await put(filename, body, {
        access: 'public',
        addRandomSuffix: false
      });
    } catch (e) {
      if (e.message && e.message.includes('Cannot use public access on a private store')) {
        blob = await put(filename, body, {
          access: 'private',
          addRandomSuffix: false
        });
      } else {
        throw e;
      }
    }
    
    return blob;
  } catch (err) {
    console.error(`Error writing blob ${filename}:`, err);
    throw err;
  }
}

module.exports = {
  getBlobData,
  putBlobData
};
