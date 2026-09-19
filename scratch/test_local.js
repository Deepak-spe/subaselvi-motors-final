fetch("http://localhost:3000/api/catalog").then(r => r.json()).then(data => { console.log("Catalog OK", data.items.length); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
