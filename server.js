const express = require("express");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/debug-env", (req, res) => {
  res.json({
    VERCEL: !!process.env.VERCEL,
    BLOB_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    VERCEL_BLOB: !!vercelBlob
  });
});

const DATA_DIR = path.join(__dirname, "data");

const MAX_ITEMS = 12;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    }
  }
}));

// ---------- Setup helpers ----------

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function getBlobData(filename, type = "json") {
  // Local only for now - will work on localhost
  const localPath = path.join(DATA_DIR, filename);
  if (fs.existsSync(localPath)) {
    try {
      console.log(`Reading ${filename} from local file system`);
      if (type === "json") return JSON.parse(fs.readFileSync(localPath, "utf-8"));
      if (type === "buffer") return fs.readFileSync(localPath);
    } catch (err) {
      console.error("Local read error:", err);
    }
  }
  console.log(`No data found for ${filename}`);
  return null;
}

async function putBlobData(filename, data) {
  // Local only for now - will work on localhost
  console.log(`Saving ${filename} to local storage...`);
  try {
    ensureDataDir();
    const localPath = path.join(DATA_DIR, filename);
    fs.writeFileSync(localPath, data);
    console.log(`Successfully saved ${filename} to local file system`);
  } catch (err) {
    console.error("Local file write error:", err);
    throw err;
  }
}

async function ensureCounter() {
  const data = await getBlobData("counter.json", "json");
  if (!data) {
    await putBlobData("counter.json", JSON.stringify({ next: 1 }, null, 2));
  }
}

async function ensureCreditCounter() {
  const data = await getBlobData("credit_counter.json", "json");
  if (!data) {
    await putBlobData("credit_counter.json", JSON.stringify({ next: 1 }, null, 2));
  }
}

async function ensureMahindraCounter() {
  const data = await getBlobData("mahindra_counter.json", "json");
  if (!data) {
    await putBlobData("mahindra_counter.json", JSON.stringify({ next: 1 }, null, 2));
  }
}

async function ensureMahindraPrices() {
  const data = await getBlobData("mahindra_prices.json", "json");
  if (!data) {
    await putBlobData("mahindra_prices.json", JSON.stringify([
      { name: "Mahindra Oil 10L", price: 0 },
      { name: "Mahindra Oil 20L", price: 0 }
    ], null, 2));
  }
}

const DEFAULT_CATALOG = [
  { name: "General Service", price: 1200 },
  { name: "Engine Oil Change", price: 450 },
  { name: "Brake Pad Replacement", price: 850 },
  { name: "Battery Replacement", price: 3200 },
  { name: "Wheel Alignment & Balancing", price: 600 },
  { name: "Labour", price: 0 },
];

async function ensureCatalog() {
  const data = await getBlobData("catalog.json", "json");
  if (!data) {
    await putBlobData("catalog.json", JSON.stringify(DEFAULT_CATALOG, null, 2));
  }
}

async function readCatalog() {
  await ensureCatalog();
  const data = await getBlobData("catalog.json", "json");
  return data || DEFAULT_CATALOG;
}

async function saveCatalog(items) {
  await putBlobData("catalog.json", JSON.stringify(items, null, 2));
}

async function readCounter() {
  await ensureCounter();
  const data = await getBlobData("counter.json", "json");
  return data ? data.next : 1;
}

async function writeCounter(nextValue) {
  await putBlobData("counter.json", JSON.stringify({ next: nextValue }, null, 2));
}

async function readCreditCounter() {
  await ensureCreditCounter();
  const data = await getBlobData("credit_counter.json", "json");
  return data ? data.next : 1;
}

async function writeCreditCounter(nextValue) {
  await putBlobData("credit_counter.json", JSON.stringify({ next: nextValue }, null, 2));
}

async function readMahindraCounter() {
  await ensureMahindraCounter();
  const data = await getBlobData("mahindra_counter.json", "json");
  return data ? data.next : 1;
}

async function writeMahindraCounter(nextValue) {
  await putBlobData("mahindra_counter.json", JSON.stringify({ next: nextValue }, null, 2));
}

async function readMahindraPrices() {
  await ensureMahindraPrices();
  const data = await getBlobData("mahindra_prices.json", "json");
  return data || [];
}

async function writeMahindraPrices(prices) {
  await putBlobData("mahindra_prices.json", JSON.stringify(prices, null, 2));
}

function formatInvoiceNumber(n) {
  return "INV-" + String(n).padStart(3, "0");
}

function formatCreditNumber(n) {
  return String(n).padStart(4, "0");
}

function formatMahindraNumber(n) {
  return "INV " + String(n).padStart(4, "0");
}

function buildHeaderRow() {
  return [
    "Invoice Number",
    "Invoice Date",
    "Receipt Mode",
    "Customer Name",
    "Vehicle Type",
    "Vehicle Number",
    "Phone Number",
    "J.C. No.",
    "Sl. No.",
    "Description of Product/Service",
    "Qty",
    "Amount",
    "Grand Total",
  ];
}

function styleWorksheet(ws) {
  ws.getRow(1).font = { bold: true };
  const widths = [16, 14, 14, 22, 18, 18, 16, 12, 10, 34, 10, 14, 16];
  widths.forEach((w, idx) => {
    ws.getColumn(idx + 1).width = w;
  });
}

async function ensureWorkbook() {
  let rebuild = false;
  const buffer = await getBlobData("invoices.xlsx", "buffer");

  if (buffer) {
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.getWorksheet("Invoices");
      if (!ws) {
        rebuild = true;
      } else {
        const descHeader = ws.getRow(1).getCell(10).value;
        if (descHeader !== "Description of Product/Service") {
          rebuild = true;
        } else {
          return wb;
        }
      }
    } catch (e) {
      rebuild = true;
    }
  } else {
    rebuild = true;
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Invoices");
  ws.addRow(buildHeaderRow());
  styleWorksheet(ws);

  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("invoices.xlsx", newBuffer);
  return workbook;
}

async function appendInvoiceRow(invoice) {
  const workbook = await ensureWorkbook();
  const ws = workbook.getWorksheet("Invoices");

  const totalItems = invoice.items.length;
  invoice.items.forEach((item, idx) => {
    const isFirstItem = idx === 0;
    const isLastItem = idx === totalItems - 1;

    ws.addRow([
      isFirstItem ? invoice.invoiceNumber : "",
      isFirstItem ? invoice.invoiceDate : "",
      isFirstItem ? invoice.receiptMode : "",
      isFirstItem ? invoice.customer.name : "",
      isFirstItem ? invoice.customer.vehicleType : "",
      isFirstItem ? invoice.customer.vehicleNo : "",
      isFirstItem ? invoice.customer.phoneNo : "",
      isFirstItem ? invoice.jcNo : "",
      item.slNo,
      item.description,
      item.qty,
      item.total,
      isLastItem ? invoice.grandTotal : "",
    ]);
  });

  styleWorksheet(ws);
  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("invoices.xlsx", newBuffer);
}

// ---------- Credit Excel Handling ----------
async function ensureCreditWorkbook() {
  let rebuild = false;
  const buffer = await getBlobData("credit_receipts.xlsx", "buffer");

  if (buffer) {
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.getWorksheet("Credit Receipts");
      if (!ws) rebuild = true;
      else return wb;
    } catch (e) {
      rebuild = true;
    }
  } else {
    rebuild = true;
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Credit Receipts");
  ws.addRow([
    "Rt. No.",
    "Date",
    "Customer Name",
    "Amount",
    "Amount (Words)",
    "Settlement Of",
    "Head of Account"
  ]);
  ws.getRow(1).font = { bold: true };
  const widths = [12, 14, 25, 12, 35, 25, 20];
  widths.forEach((w, idx) => { ws.getColumn(idx + 1).width = w; });

  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("credit_receipts.xlsx", newBuffer);
  return workbook;
}

async function appendCreditRow(receipt) {
  const workbook = await ensureCreditWorkbook();
  const ws = workbook.getWorksheet("Credit Receipts");
  ws.addRow([
    receipt.rtNo,
    receipt.date,
    receipt.customerName,
    receipt.amount,
    receipt.amountWords,
    receipt.settlementOf,
    receipt.headOfAccount
  ]);

  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("credit_receipts.xlsx", newBuffer);
}

// ---------- Mahindra Excel Handling ----------
async function ensureMahindraWorkbook() {
  let rebuild = false;
  const buffer = await getBlobData("mahindra_invoices.xlsx", "buffer");

  if (buffer) {
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.getWorksheet("Mahindra Invoices");
      if (!ws) rebuild = true;
      else return wb;
    } catch (e) {
      rebuild = true;
    }
  } else {
    rebuild = true;
  }

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Mahindra Invoices");
  ws.addRow([
    "Invoice Number",
    "Date",
    "Payment Mode",
    "Customer Name",
    "Phone Number",
    "Component",
    "Quantity",
    "Price",
    "Amount",
    "Total Bill"
  ]);
  ws.getRow(1).font = { bold: true };
  const widths = [16, 14, 14, 22, 16, 30, 10, 12, 12, 14];
  widths.forEach((w, idx) => { ws.getColumn(idx + 1).width = w; });

  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("mahindra_invoices.xlsx", newBuffer);
  return workbook;
}

async function appendMahindraRow(invoice) {
  const workbook = await ensureMahindraWorkbook();
  const ws = workbook.getWorksheet("Mahindra Invoices");
  
  const totalItems = invoice.items.length;
  invoice.items.forEach((item, idx) => {
    const isFirstItem = idx === 0;
    const isLastItem = idx === totalItems - 1;

    ws.addRow([
      isFirstItem ? invoice.invoiceNumber : "",
      isFirstItem ? invoice.date : "",
      isFirstItem ? invoice.paymentMode : "",
      isFirstItem ? invoice.customerName : "",
      isFirstItem ? invoice.phoneNumber : "",
      item.component,
      item.quantity,
      item.price,
      item.amount,
      isLastItem ? invoice.totalAmount : ""
    ]);
  });

  const newBuffer = await workbook.xlsx.writeBuffer();
  await putBlobData("mahindra_invoices.xlsx", newBuffer);
}

// ---------- Routes ----------

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password === "Subaselvi@123") {
    return res.json({ success: true, message: "Admin login successful" });
  } else {
    return res.status(401).json({ error: "Invalid Admin password" });
  }
});

app.post("/api/service/login", (req, res) => {
  const { password } = req.body || {};
  if (password === "Service@123") {
    return res.json({ success: true, message: "Service login successful" });
  } else {
    return res.status(401).json({ error: "Invalid Service password" });
  }
});

app.post("/api/credit/login", (req, res) => {
  const { password } = req.body || {};
  if (password === "Credit@123") {
    return res.json({ success: true, message: "Credit login successful" });
  } else {
    return res.status(401).json({ error: "Invalid Credit password" });
  }
});

app.post("/api/mahindra/login", (req, res) => {
  const { password } = req.body || {};
  if (password === "Mahindra@123") {
    return res.json({ success: true, message: "Mahindra login successful" });
  } else {
    return res.status(401).json({ error: "Invalid Mahindra password" });
  }
});

app.get("/api/next-invoice-number", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const next = await readCounter();
    res.json({ invoiceNumber: formatInvoiceNumber(next) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read invoice counter." });
  }
});

app.post("/api/invoices", async (req, res) => {
  try {
    const body = req.body;

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: "Invoice must include at least one line item." });
    }

    const nextNum = await readCounter();
    const invoiceNumber = formatInvoiceNumber(nextNum);

    const invoice = {
      invoiceNumber,
      invoiceDate: body.invoiceDate || "",
      receiptMode: body.receiptMode || "",
      customer: {
        name: body.customer?.name || "",
        vehicleType: body.customer?.vehicleType || "",
        vehicleNo: body.customer?.vehicleNo || "",
        phoneNo: body.customer?.phoneNo || "",
      },
      jcNo: body.jcNo || "",
      items: body.items.map((it, idx) => ({
        slNo: idx + 1,
        description: it.description || "",
        qty: Number(it.qty) || 0,
        total: Number(it.total) || 0,
      })),
      grandTotal: Number(body.grandTotal) || 0,
    };

    await appendInvoiceRow(invoice);
    await writeCounter(nextNum + 1);

    res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save invoice." });
  }
});

app.get("/api/next-credit-number", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const next = await readCreditCounter();
    res.json({ rtNo: formatCreditNumber(next) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read credit counter." });
  }
});

app.post("/api/credit-receipts", async (req, res) => {
  try {
    const body = req.body;
    const nextNum = await readCreditCounter();
    const rtNo = formatCreditNumber(nextNum);

    const receipt = {
      rtNo,
      date: body.date || "",
      customerName: body.customerName || "",
      amount: Number(body.amount) || 0,
      amountWords: body.amountWords || "",
      settlementOf: body.settlementOf || "TVS CREDIT SERVICES LIMITED",
      headOfAccount: body.headOfAccount || ""
    };

    await appendCreditRow(receipt);
    await writeCreditCounter(nextNum + 1);

    res.json({ success: true, receipt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save credit receipt." });
  }
});

app.get("/api/mahindra-prices", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const prices = await readMahindraPrices();
    res.json({ prices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read Mahindra prices." });
  }
});

app.post("/api/mahindra-prices", async (req, res) => {
  try {
    const newPrices = req.body.prices;
    if (!Array.isArray(newPrices)) {
      return res.status(400).json({ error: "Invalid payload format." });
    }
    await writeMahindraPrices(newPrices);
    res.json({ success: true, prices: newPrices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save Mahindra prices." });
  }
});

app.get("/api/next-mahindra-number", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const next = await readMahindraCounter();
    res.json({ invoiceNumber: formatMahindraNumber(next) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read Mahindra counter." });
  }
});

app.post("/api/mahindra-invoices", async (req, res) => {
  try {
    const body = req.body;
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: "Invoice must include at least one item." });
    }

    const nextNum = await readMahindraCounter();
    const invoiceNumber = formatMahindraNumber(nextNum);

    const invoice = {
      invoiceNumber,
      date: body.date || "",
      paymentMode: body.paymentMode || "Cash",
      customerName: body.customerName || "",
      phoneNumber: body.phoneNumber || "",
      items: body.items.map(it => ({
        component: it.component || "",
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
        amount: Number(it.amount) || 0
      })),
      totalAmount: Number(body.totalAmount) || 0
    };

    await appendMahindraRow(invoice);
    await writeMahindraCounter(nextNum + 1);

    res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save Mahindra invoice." });
  }
});

app.get("/api/catalog", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const items = await readCatalog();
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read product catalog." });
  }
});

app.post("/api/upload-catalog", express.raw({ type: "*/*", limit: "10mb" }), async (req, res) => {
  try {
    const buffer = req.body;
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "No Excel file data uploaded." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const ws = workbook.worksheets[0];
    if (!ws) {
      return res.status(400).json({ error: "Uploaded Excel sheet is empty." });
    }

    let nameCol = 1;
    let priceCol = 2;

    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || "").toLowerCase();
      if (val.includes("desc") || val.includes("product") || val.includes("item") || val.includes("service") || val.includes("name")) {
        nameCol = colNumber;
      }
      if (val.includes("price") || val.includes("rate") || val.includes("amount") || val.includes("cost")) {
        priceCol = colNumber;
      }
    });

    const items = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const name = String(row.getCell(nameCol).value || "").trim();
      const rawPrice = row.getCell(priceCol).value;
      const priceVal = Number(rawPrice);
      const price = isNaN(priceVal) ? 0 : priceVal;

      if (name && name.toLowerCase() !== "description" && name.toLowerCase() !== "item name") {
        items.push({ name, price });
      }
    });

    if (items.length === 0) {
      return res.status(400).json({ error: "No valid product/service items found in Excel file." });
    }

    const hasLabour = items.some((i) => i.name.toLowerCase().includes("labour"));
    if (!hasLabour) {
      items.push({ name: "Labour", price: 0 });
    }

    await saveCatalog(items);
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse uploaded Excel file." });
  }
});

app.get(["/api/download-excel", "/api/download/Subaselvi_Motors_Invoices.xlsx"], async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const localPath = path.join(DATA_DIR, "invoices.xlsx");
    if (fs.existsSync(localPath) && !process.env.VERCEL && !process.env.NETLIFY) {
      return res.download(localPath, "Subaselvi_Motors_Invoices.xlsx");
    }
    const workbook = await ensureWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="Subaselvi_Motors_Invoices.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not download Excel file." });
  }
});

app.get(["/api/download-credit-excel", "/api/download/Subaselvi_Motors_Credit_Receipts.xlsx"], async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const localPath = path.join(DATA_DIR, "credit_receipts.xlsx");
    if (fs.existsSync(localPath) && !process.env.VERCEL && !process.env.NETLIFY) {
      return res.download(localPath, "Subaselvi_Motors_Credit_Receipts.xlsx");
    }
    const workbook = await ensureCreditWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="Subaselvi_Motors_Credit_Receipts.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not download Credit Excel file." });
  }
});

app.get(["/api/download-mahindra-excel", "/api/download/Subaselvi_Motors_Mahindra_Invoices.xlsx"], async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const localPath = path.join(DATA_DIR, "mahindra_invoices.xlsx");
    if (fs.existsSync(localPath) && !process.env.VERCEL && !process.env.NETLIFY) {
      return res.download(localPath, "Subaselvi_Motors_Mahindra_Invoices.xlsx");
    }
    const workbook = await ensureMahindraWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="Subaselvi_Motors_Mahindra_Invoices.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not download Mahindra Excel file." });
  }
});

// ---------- Invoice Statistics ----------
app.get("/api/admin/statistics", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    console.log("Fetching statistics...");
    
    // Get counter values
    const serviceCounter = await readCounter();
    const creditCounter = await readCreditCounter();
    const mahindraCounter = await readMahindraCounter();
    
    console.log(`Counters - Service: ${serviceCounter}, Credit: ${creditCounter}, Mahindra: ${mahindraCounter}`);
    
    // Count actual invoices from Excel files
    let serviceInvoiceCount = 0;
    let creditReceiptCount = 0;
    let mahindraInvoiceCount = 0;
    
    // Read service invoices
    const serviceBuffer = await getBlobData("invoices.xlsx", "buffer");
    if (serviceBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(serviceBuffer);
        const ws = wb.getWorksheet("Invoices");
        if (ws) {
          serviceInvoiceCount = ws.rowCount - 1; // Exclude header
          console.log(`Service invoices: ${serviceInvoiceCount} rows`);
        }
      } catch (e) {
        console.error("Error reading service invoices:", e);
      }
    }
    
    // Read credit receipts
    const creditBuffer = await getBlobData("credit_receipts.xlsx", "buffer");
    if (creditBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(creditBuffer);
        const ws = wb.getWorksheet("Credit Receipts");
        if (ws) {
          creditReceiptCount = ws.rowCount - 1; // Exclude header
          console.log(`Credit receipts: ${creditReceiptCount} rows`);
        }
      } catch (e) {
        console.error("Error reading credit receipts:", e);
      }
    }
    
    // Read mahindra invoices
    const mahindraBuffer = await getBlobData("mahindra_invoices.xlsx", "buffer");
    if (mahindraBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(mahindraBuffer);
        const ws = wb.getWorksheet("Mahindra Invoices");
        if (ws) {
          mahindraInvoiceCount = ws.rowCount - 1; // Exclude header
          console.log(`Mahindra invoices: ${mahindraInvoiceCount} rows`);
        }
      } catch (e) {
        console.error("Error reading mahindra invoices:", e);
      }
    }
    
    const stats = {
      service: {
        counter: serviceCounter - 1, // Next number - 1 = current count
        actual: serviceInvoiceCount,
        missing: Math.max(0, (serviceCounter - 1) - serviceInvoiceCount)
      },
      credit: {
        counter: creditCounter - 1,
        actual: creditReceiptCount,
        missing: Math.max(0, (creditCounter - 1) - creditReceiptCount)
      },
      mahindra: {
        counter: mahindraCounter - 1,
        actual: mahindraInvoiceCount,
        missing: Math.max(0, (mahindraCounter - 1) - mahindraInvoiceCount)
      }
    };
    
    console.log("Statistics response:", stats);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({ error: "Could not fetch statistics." });
  }
});

// ---------- Export Statistics to Excel ----------
app.get("/api/admin/export-statistics", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    
    // Get counter values
    const serviceCounter = await readCounter();
    const creditCounter = await readCreditCounter();
    const mahindraCounter = await readMahindraCounter();
    
    // Count actual invoices from Excel files
    let serviceInvoiceCount = 0;
    let creditReceiptCount = 0;
    let mahindraInvoiceCount = 0;
    
    // Read service invoices
    const serviceBuffer = await getBlobData("invoices.xlsx", "buffer");
    if (serviceBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(serviceBuffer);
        const ws = wb.getWorksheet("Invoices");
        if (ws) {
          serviceInvoiceCount = ws.rowCount - 1; // Exclude header
        }
      } catch (e) {
        console.error("Error reading service invoices:", e);
      }
    }
    
    // Read credit receipts
    const creditBuffer = await getBlobData("credit_receipts.xlsx", "buffer");
    if (creditBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(creditBuffer);
        const ws = wb.getWorksheet("Credit Receipts");
        if (ws) {
          creditReceiptCount = ws.rowCount - 1; // Exclude header
        }
      } catch (e) {
        console.error("Error reading credit receipts:", e);
      }
    }
    
    // Read mahindra invoices
    const mahindraBuffer = await getBlobData("mahindra_invoices.xlsx", "buffer");
    if (mahindraBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(mahindraBuffer);
        const ws = wb.getWorksheet("Mahindra Invoices");
        if (ws) {
          mahindraInvoiceCount = ws.rowCount - 1; // Exclude header
        }
      } catch (e) {
        console.error("Error reading mahindra invoices:", e);
      }
    }
    
    const stats = {
      service: {
        counter: serviceCounter - 1,
        actual: serviceInvoiceCount,
        missing: Math.max(0, (serviceCounter - 1) - serviceInvoiceCount)
      },
      credit: {
        counter: creditCounter - 1,
        actual: creditReceiptCount,
        missing: Math.max(0, (creditCounter - 1) - creditReceiptCount)
      },
      mahindra: {
        counter: mahindraCounter - 1,
        actual: mahindraInvoiceCount,
        missing: Math.max(0, (mahindraCounter - 1) - mahindraInvoiceCount)
      }
    };
    
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Invoice Statistics");
    
    ws.addRow(["Role", "Counter Value", "Actual Invoices", "Missing Records"]);
    ws.getRow(1).font = { bold: true };
    
    ws.addRow(["Service (TVS)", stats.service.counter, stats.service.actual, stats.service.missing]);
    ws.addRow(["Credit (TVS Credit)", stats.credit.counter, stats.credit.actual, stats.credit.missing]);
    ws.addRow(["Mahindra", stats.mahindra.counter, stats.mahindra.actual, stats.mahindra.missing]);
    
    ws.getColumn(1).width = 20;
    ws.getColumn(2).width = 15;
    ws.getColumn(3).width = 15;
    ws.getColumn(4).width = 15;
    
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="Subaselvi_Motors_Statistics.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not export statistics." });
  }
});

// ---------- Missing Details Detection ----------
app.get("/api/admin/missing-details", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    
    const missingDetails = {
      service: [],
      credit: [],
      mahindra: []
    };
    
    // Check service invoices for missing details
    const serviceBuffer = await getBlobData("invoices.xlsx", "buffer");
    if (serviceBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(serviceBuffer);
        const ws = wb.getWorksheet("Invoices");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const invoiceNumber = row.getCell(1).value;
            const invoiceDate = row.getCell(2).value;
            const customerName = row.getCell(4).value;
            const vehicleType = row.getCell(5).value;
            const vehicleNo = row.getCell(6).value;
            const phoneNo = row.getCell(7).value;
            const description = row.getCell(10).value;
            
            const issues = [];
            if (!invoiceNumber) issues.push("Missing Invoice Number");
            if (!invoiceDate) issues.push("Missing Invoice Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!vehicleType) issues.push("Missing Vehicle Type");
            if (!vehicleNo) issues.push("Missing Vehicle Number");
            if (!phoneNo) issues.push("Missing Phone Number");
            if (!description) issues.push("Missing Description");
            
            if (issues.length > 0) {
              missingDetails.service.push({
                row: rowNumber,
                invoiceNumber: invoiceNumber || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading service invoices for missing details:", e);
      }
    }
    
    // Check credit receipts for missing details
    const creditBuffer = await getBlobData("credit_receipts.xlsx", "buffer");
    if (creditBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(creditBuffer);
        const ws = wb.getWorksheet("Credit Receipts");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const rtNo = row.getCell(1).value;
            const date = row.getCell(2).value;
            const customerName = row.getCell(3).value;
            const amount = row.getCell(4).value;
            const amountWords = row.getCell(5).value;
            
            const issues = [];
            if (!rtNo) issues.push("Missing RT No");
            if (!date) issues.push("Missing Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!amount) issues.push("Missing Amount");
            if (!amountWords) issues.push("Missing Amount in Words");
            
            if (issues.length > 0) {
              missingDetails.credit.push({
                row: rowNumber,
                rtNo: rtNo || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading credit receipts for missing details:", e);
      }
    }
    
    // Check mahindra invoices for missing details
    const mahindraBuffer = await getBlobData("mahindra_invoices.xlsx", "buffer");
    if (mahindraBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(mahindraBuffer);
        const ws = wb.getWorksheet("Mahindra Invoices");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const invoiceNumber = row.getCell(1).value;
            const date = row.getCell(2).value;
            const customerName = row.getCell(4).value;
            const phoneNumber = row.getCell(5).value;
            const component = row.getCell(6).value;
            
            const issues = [];
            if (!invoiceNumber) issues.push("Missing Invoice Number");
            if (!date) issues.push("Missing Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!phoneNumber) issues.push("Missing Phone Number");
            if (!component) issues.push("Missing Component");
            
            if (issues.length > 0) {
              missingDetails.mahindra.push({
                row: rowNumber,
                invoiceNumber: invoiceNumber || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading mahindra invoices for missing details:", e);
      }
    }
    
    res.json(missingDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch missing details." });
  }
});

// ---------- Debug Endpoint for Blob Storage ----------
app.get("/api/admin/debug-blob", async (req, res) => {
  try {
    const { filename } = req.query;
    const debugInfo = {
      environment: {
        VERCEL: !!process.env.VERCEL,
        NETLIFY: !!process.env.NETLIFY,
        BLOB_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
        vercelBlob: !!vercelBlob
      },
      files: {}
    };
    
    const filesToCheck = filename ? [filename] : ["invoices.xlsx", "credit_receipts.xlsx", "mahindra_invoices.xlsx", "counter.json", "credit_counter.json", "mahindra_counter.json"];
    
    for (const file of filesToCheck) {
      const buffer = await getBlobData(file, "buffer");
      if (buffer) {
        try {
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(buffer);
          const ws = wb.worksheets[0];
          debugInfo.files[file] = {
            found: true,
            size: buffer.length,
            worksheets: wb.worksheets.map(ws => ws.name),
            rowCount: ws ? ws.rowCount : 0,
            columnCount: ws ? ws.columnCount : 0
          };
        } catch (e) {
          debugInfo.files[file] = {
            found: true,
            size: buffer.length,
            error: "Not an Excel file",
            type: "buffer"
          };
        }
      } else {
        debugInfo.files[file] = {
          found: false
        };
      }
    }
    
    res.json(debugInfo);
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Get Invoice Data for Admin View ----------
app.get("/api/admin/invoices-data", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    const { type } = req.query;
    
    if (!type || !["service", "credit", "mahindra"].includes(type)) {
      return res.status(400).json({ error: "Invalid type. Must be service, credit, or mahindra" });
    }
    
    let data = [];
    let filename = "";
    let worksheetName = "";
    
    if (type === "service") {
      filename = "invoices.xlsx";
      worksheetName = "Invoices";
    } else if (type === "credit") {
      filename = "credit_receipts.xlsx";
      worksheetName = "Credit Receipts";
    } else if (type === "mahindra") {
      filename = "mahindra_invoices.xlsx";
      worksheetName = "Mahindra Invoices";
    }
    
    console.log(`Fetching ${filename} for admin view...`);
    
    // Force fresh read from blob storage
    const buffer = await getBlobData(filename, "buffer");
    if (buffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(buffer);
        const ws = wb.getWorksheet(worksheetName);
        if (ws) {
          console.log(`Worksheet ${worksheetName} found with ${ws.rowCount} rows`);
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            const rowData = [];
            // Get all cells in the row, even if some are empty
            const columnCount = row.cellCount;
            for (let i = 1; i <= columnCount; i++) {
              const cell = row.getCell(i);
              let cellValue = cell.value;
              // Handle different cell value types
              if (cellValue === null || cellValue === undefined) {
                cellValue = "";
              } else if (typeof cellValue === "object" && cellValue.result) {
                cellValue = cellValue.result; // Handle formula results
              } else if (typeof cellValue === "object" && cellValue.text) {
                cellValue = cellValue.text; // Handle rich text
              }
              rowData.push(cellValue);
            }
            data.push(rowData);
          });
          console.log(`Loaded ${data.length} invoice rows from ${filename}`);
        } else {
          console.log(`Worksheet ${worksheetName} not found`);
        }
      } catch (e) {
        console.error(`Error reading ${filename}:`, e);
        return res.status(500).json({ error: `Error reading Excel file: ${e.message}` });
      }
    } else {
      console.log(`No buffer found for ${filename}`);
    }
    
    res.json({ data, type, count: data.length });
  } catch (err) {
    console.error("Error in invoices-data endpoint:", err);
    res.status(500).json({ error: "Could not fetch invoice data." });
  }
});

// ---------- Export Missing Details to Excel ----------
app.get("/api/admin/export-missing-details", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    
    const missingDetails = {
      service: [],
      credit: [],
      mahindra: []
    };
    
    // Check service invoices for missing details
    const serviceBuffer = await getBlobData("invoices.xlsx", "buffer");
    if (serviceBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(serviceBuffer);
        const ws = wb.getWorksheet("Invoices");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const invoiceNumber = row.getCell(1).value;
            const invoiceDate = row.getCell(2).value;
            const customerName = row.getCell(4).value;
            const vehicleType = row.getCell(5).value;
            const vehicleNo = row.getCell(6).value;
            const phoneNo = row.getCell(7).value;
            const description = row.getCell(10).value;
            
            const issues = [];
            if (!invoiceNumber) issues.push("Missing Invoice Number");
            if (!invoiceDate) issues.push("Missing Invoice Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!vehicleType) issues.push("Missing Vehicle Type");
            if (!vehicleNo) issues.push("Missing Vehicle Number");
            if (!phoneNo) issues.push("Missing Phone Number");
            if (!description) issues.push("Missing Description");
            
            if (issues.length > 0) {
              missingDetails.service.push({
                row: rowNumber,
                invoiceNumber: invoiceNumber || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading service invoices for missing details:", e);
      }
    }
    
    // Check credit receipts for missing details
    const creditBuffer = await getBlobData("credit_receipts.xlsx", "buffer");
    if (creditBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(creditBuffer);
        const ws = wb.getWorksheet("Credit Receipts");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const rtNo = row.getCell(1).value;
            const date = row.getCell(2).value;
            const customerName = row.getCell(3).value;
            const amount = row.getCell(4).value;
            const amountWords = row.getCell(5).value;
            
            const issues = [];
            if (!rtNo) issues.push("Missing RT No");
            if (!date) issues.push("Missing Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!amount) issues.push("Missing Amount");
            if (!amountWords) issues.push("Missing Amount in Words");
            
            if (issues.length > 0) {
              missingDetails.credit.push({
                row: rowNumber,
                rtNo: rtNo || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading credit receipts for missing details:", e);
      }
    }
    
    // Check mahindra invoices for missing details
    const mahindraBuffer = await getBlobData("mahindra_invoices.xlsx", "buffer");
    if (mahindraBuffer) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(mahindraBuffer);
        const ws = wb.getWorksheet("Mahindra Invoices");
        if (ws) {
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            
            const invoiceNumber = row.getCell(1).value;
            const date = row.getCell(2).value;
            const customerName = row.getCell(4).value;
            const phoneNumber = row.getCell(5).value;
            const component = row.getCell(6).value;
            
            const issues = [];
            if (!invoiceNumber) issues.push("Missing Invoice Number");
            if (!date) issues.push("Missing Date");
            if (!customerName) issues.push("Missing Customer Name");
            if (!phoneNumber) issues.push("Missing Phone Number");
            if (!component) issues.push("Missing Component");
            
            if (issues.length > 0) {
              missingDetails.mahindra.push({
                row: rowNumber,
                invoiceNumber: invoiceNumber || "N/A",
                issues: issues.join(", ")
              });
            }
          });
        }
      } catch (e) {
        console.error("Error reading mahindra invoices for missing details:", e);
      }
    }
    
    const workbook = new ExcelJS.Workbook();
    
    // Service sheet
    if (missingDetails.service.length > 0) {
      const ws = workbook.addWorksheet("Service Missing Details");
      ws.addRow(["Row", "Invoice Number", "Missing Issues"]);
      ws.getRow(1).font = { bold: true };
      missingDetails.service.forEach(item => {
        ws.addRow([item.row, item.invoiceNumber, item.issues]);
      });
      ws.getColumn(1).width = 10;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 50;
    }
    
    // Credit sheet
    if (missingDetails.credit.length > 0) {
      const ws = workbook.addWorksheet("Credit Missing Details");
      ws.addRow(["Row", "RT No", "Missing Issues"]);
      ws.getRow(1).font = { bold: true };
      missingDetails.credit.forEach(item => {
        ws.addRow([item.row, item.rtNo, item.issues]);
      });
      ws.getColumn(1).width = 10;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 50;
    }
    
    // Mahindra sheet
    if (missingDetails.mahindra.length > 0) {
      const ws = workbook.addWorksheet("Mahindra Missing Details");
      ws.addRow(["Row", "Invoice Number", "Missing Issues"]);
      ws.getRow(1).font = { bold: true };
      missingDetails.mahindra.forEach(item => {
        ws.addRow([item.row, item.invoiceNumber, item.issues]);
      });
      ws.getColumn(1).width = 10;
      ws.getColumn(2).width = 20;
      ws.getColumn(3).width = 50;
    }
    
    if (workbook.worksheets.length === 0) {
      const ws = workbook.addWorksheet("Summary");
      ws.addRow(["Status", "Message"]);
      ws.addRow(["No Missing Details", "All records are complete!"]);
      ws.getColumn(1).width = 20;
      ws.getColumn(2).width = 40;
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", 'attachment; filename="Subaselvi_Motors_Missing_Details.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not export missing details." });
  }
});

// Run init in background for serverless
ensureCounter();
ensureCreditCounter();
ensureMahindraCounter();
ensureMahindraPrices();
ensureCatalog();

// Always start local server for development
app.listen(PORT, () => {
  console.log(`Subaselvi Motors billing app running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

// Export for serverless (Netlify, Vercel)
module.exports = app;
module.exports.app = app;
