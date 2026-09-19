const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function checkExcelFiles() {
  console.log('=== CHECKING LOCAL EXCEL FILES ===\n');
  
  const files = [
    { name: 'invoices.xlsx', sheet: 'Invoices' },
    { name: 'credit_receipts.xlsx', sheet: 'Credit Receipts' },
    { name: 'mahindra_invoices.xlsx', sheet: 'Mahindra Invoices' }
  ];
  
  for (const file of files) {
    console.log(`--- ${file.name} ---`);
    const filePath = path.join(__dirname, 'data', file.name);
    
    if (fs.existsSync(filePath)) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(file.sheet);
        
        if (worksheet) {
          console.log(`Rows: ${worksheet.rowCount}`);
          console.log(`Columns: ${worksheet.columnCount}`);
          console.log('First 5 rows:');
          
          let count = 0;
          worksheet.eachRow((row, rowNumber) => {
            if (count < 5) {
              const values = [];
              row.eachCell((cell) => {
                values.push(cell.value);
              });
              console.log(`Row ${rowNumber}: ${values.join(' | ')}`);
              count++;
            }
          });
        } else {
          console.log('Worksheet not found');
        }
      } catch (e) {
        console.log(`Error: ${e.message}`);
      }
    } else {
      console.log('File not found');
    }
    console.log();
  }
  
  // Check counters
  console.log('=== COUNTERS ===');
  const counters = ['counter.json', 'credit_counter.json', 'mahindra_counter.json'];
  for (const counter of counters) {
    const filePath = path.join(__dirname, 'data', counter);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`${counter}: ${JSON.stringify(data)}`);
    }
  }
}

checkExcelFiles().catch(console.error);
