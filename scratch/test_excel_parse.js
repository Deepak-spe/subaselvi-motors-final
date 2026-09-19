const ExcelJS = require('exceljs');
fetch("https://subaselvi-motors-billing.vercel.app/api/download/Subaselvi_Motors_Invoices.xlsx")
  .then(async r => {
    const buffer = await r.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet("Invoices");
    console.log("Total rows in Invoices sheet:", ws.rowCount);
    let rows = [];
    ws.eachRow((row, rowNumber) => {
      rows.push(row.values);
    });
    console.log(JSON.stringify(rows, null, 2));
  }).catch(console.error);
