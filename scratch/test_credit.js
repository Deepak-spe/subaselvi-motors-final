fetch("http://localhost:3000/api/credit-receipts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: "2026-09-17",
    customerName: "Test Customer",
    amount: 1000,
    amountWords: "One Thousand",
    settlementOf: "TVS",
    headOfAccount: "Test"
  })
}).then(r => r.json()).then(data => {
  console.log("Credit Response:", data);
  process.exit(0);
}).catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
