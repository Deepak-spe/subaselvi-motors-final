fetch("http://localhost:3000/api/invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    invoiceDate: "2026-09-17",
    receiptMode: "Cash",
    customer: { name: "Test User", vehicleType: "Car", vehicleNo: "TN 01 AB 1234", phoneNo: "1234567890" },
    jcNo: "123",
    items: [ { description: "Test Item", qty: 1, total: 100 } ],
    grandTotal: 100
  })
}).then(r => r.json()).then(data => {
  console.log("Invoice Response:", data);
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
