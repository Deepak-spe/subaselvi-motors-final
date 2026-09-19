fetch("https://subaselvi-motors-billing.vercel.app/api/invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    invoiceDate: "2026-09-17",
    receiptMode: "Cash",
    customer: { name: "Test Live", vehicleType: "Car", vehicleNo: "TN 01 AB 1234", phoneNo: "1234567890" },
    jcNo: "123",
    items: [ { description: "Test Item", qty: 1, total: 100 } ],
    grandTotal: 100
  })
}).then(async r => {
  const txt = await r.text();
  console.log("Status:", r.status);
  console.log("Body:", txt);
}).catch(console.error);
