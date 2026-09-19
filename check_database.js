const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'p1_check.db');
const db = new sqlite3.Database(dbPath);

console.log('=== CHECKING DATABASE FOR MISSING DATA ===\n');

db.serialize(() => {
  // Get all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return;
    }
    
    console.log('Tables found:', tables.map(t => t.name).join(', '));
    
    if (tables.length > 0) {
      tables.forEach(table => {
        const tableName = table.name;
        console.log(`\n--- Table: ${tableName} ---`);
        
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
          if (err) {
            console.error(`Error reading ${tableName}:`, err);
          } else {
            console.log(`Rows: ${rows.length}`);
            if (rows.length > 0) {
              console.log('Sample data:');
              rows.slice(0, 5).forEach((row, index) => {
                console.log(`Row ${index + 1}:`, JSON.stringify(row));
              });
            }
          }
        });
      });
    }
  });
  
  setTimeout(() => {
    db.close();
    console.log('\n=== DATABASE CHECK COMPLETE ===');
  }, 2000);
});
