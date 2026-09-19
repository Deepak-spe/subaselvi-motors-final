fetch("https://subaselvi-motors-billing.vercel.app/api/download/Subaselvi_Motors_Invoices.xlsx")
  .then(async r => {
    if (r.ok) {
      console.log("Download OK. Size:", (await r.arrayBuffer()).byteLength);
    } else {
      console.log("Download Failed:", r.status, await r.text());
    }
  }).catch(console.error);
