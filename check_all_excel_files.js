const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function checkAllExcelFiles() {
  console.log('=== CHECKING ALL EXCEL FILES IN PROJECT ===\n');
  
  const files = [
    'credit_receipts_new.xlsx',
    'data/credit_receipts.xlsx',
    'data/invoices.xlsx',
    'data/mahindra_invoices.xlsx'
  ];
  
  for (const file of files) {
    console.log(`--- ${file} ---`);
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        console.log(`Size: ${stats.size} bytes`);
        console.log(`Modified: ${stats.mtime}`);
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        
        console.log(`Worksheets: ${workbook.worksheets.map(ws => ws.name).join(', ')}`);
        
        const worksheet = workbook.worksheets[0];
        if (worksheet) {
          console.log(`Rows: ${worksheet.rowCount}`);
          console.log(`Columns: ${worksheet.columnCount}`);
          
          console.log('All data rows:');
          worksheet.eachRow((row, rowNumber) => {
            const values = [];
            row.eachCell((cell) => {
              values.push(cell.value);
            });
            console.log(`Row ${rowNumber}: ${values.join(' | ')}`);
          });
        }
      } catch (e) {
        console.log(`Error: ${e.message}`);
      }
    } else {
      console.log('File not found');
    }
    console.log();
  }
}

checkAllExcelFiles().catch(console.error);
