let currentCatalog = [
  { name: "General Service", price: 1200 },
  { name: "Engine Oil Change", price: 450 },
  { name: "Brake Pad Replacement", price: 850 },
  { name: "Battery Replacement", price: 3200 },
  { name: "Wheel Alignment & Balancing", price: 600 },
  { name: "Labour", price: 0 },
];

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Views
const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const serviceView = document.getElementById("serviceView");
const printView = document.getElementById("printView");
const creditView = document.getElementById("creditView");
const mahindraView = document.getElementById("mahindraView");
const printMahindraView = document.getElementById("printMahindraView");

// Login Elements
const loginForm = document.getElementById("loginForm");
const dealershipCode = document.getElementById("dealershipCode");
const roleSelect = document.getElementById("roleSelect");
const passwordGroup = document.getElementById("passwordGroup");
const passwordLabel = document.getElementById("passwordLabel");
const rolePassword = document.getElementById("rolePassword");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

const dealershipGroup = document.getElementById("dealershipGroup");
const roleGroup = document.getElementById("roleGroup");
const openAdminBtn = document.getElementById("openAdminBtn");
const backToUserBtn = document.getElementById("backToUserBtn");
const adminLinkContainer = document.getElementById("adminLinkContainer");

let currentLoginMode = "user";

// Admin Elements
const uploadCatalogBtn = document.getElementById("uploadCatalogBtn");
const catalogFileInput = document.getElementById("catalogFileInput");
const downloadExcelBtn = document.getElementById("downloadExcelBtn");
const downloadMahindraExcelBtn = document.getElementById("downloadMahindraExcelBtn");
const adminStatusMsg = document.getElementById("adminStatusMsg");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const exportStatisticsBtn = document.getElementById("exportStatisticsBtn");
const refreshStatisticsBtn = document.getElementById("refreshStatisticsBtn");
const exportMissingDetailsBtn = document.getElementById("exportMissingDetailsBtn");
const invoiceTypeSelect = document.getElementById("invoiceTypeSelect");
const loadInvoicesBtn = document.getElementById("loadInvoicesBtn");
const debugBlobBtn = document.getElementById("debugBlobBtn");

// Service / Billing Elements
const serviceLogoutBtn = document.getElementById("serviceLogoutBtn");
const itemsBody = document.getElementById("itemsBody");
const addRowBtn = document.getElementById("addRowBtn");
const grandTotalCell = document.getElementById("grandTotalCell");
const statusMsg = document.getElementById("statusMsg");

// Credit Billing Elements
const crRtNo = document.getElementById("crRtNo");
const crDate = document.getElementById("crDate");
const crCustomerName = document.getElementById("crCustomerName");
const crAmount = document.getElementById("crAmount");
const crAmountWords = document.getElementById("crAmountWords");
const crSettlementOf = document.getElementById("crSettlementOf");
const crHeadOfAccount = document.getElementById("crHeadOfAccount");
const submitCreditBtn = document.getElementById("submitCreditBtn");
const newCreditBtn = document.getElementById("newCreditBtn");
const creditStatusMsg = document.getElementById("creditStatusMsg");
const downloadCreditExcelBtn = document.getElementById("downloadCreditExcelBtn");
const downloadCreditExcelBtn2 = document.getElementById("downloadCreditExcelBtn2");
const creditLogoutBtn = document.getElementById("creditLogoutBtn");

let receiptMode = "Cash";
let isInvoiceInitialized = false;
let isCreditInitialized = false;

// ---------- View Navigation ----------
function switchView(viewName) {
  loginView.classList.add("hidden");
  adminView.classList.add("hidden");
  serviceView.classList.add("hidden");
  printView.classList.add("hidden");
  if (creditView) creditView.classList.add("hidden");
  if (mahindraView) mahindraView.classList.add("hidden");
  if (printMahindraView) printMahindraView.classList.add("hidden");

  if (viewName === "login") {
    loginView.classList.remove("hidden");
  } else if (viewName === "admin") {
    adminView.classList.remove("hidden");
  } else if (viewName === "service") {
    serviceView.classList.remove("hidden");
    if (!isInvoiceInitialized) {
      initInvoice();
      isInvoiceInitialized = true;
    }
  } else if (viewName === "credit") {
    if (creditView) creditView.classList.remove("hidden");
    if (!isCreditInitialized) {
      initCreditReceipt();
      isCreditInitialized = true;
    }
  } else if (viewName === "print") {
    printView.classList.remove("hidden");
  } else if (viewName === "mahindra") {
    if (mahindraView) mahindraView.classList.remove("hidden");
    if (!isMahindraInitialized) {
      initMahindraInvoice();
      isMahindraInitialized = true;
    }
  } else if (viewName === "print_mahindra") {
    if (printMahindraView) printMahindraView.classList.remove("hidden");
  }
}

// ---------- Login & Role Handling ----------
if (openAdminBtn) {
  openAdminBtn.addEventListener("click", (e) => {
    e.preventDefault();
    currentLoginMode = "admin";
    dealershipGroup.classList.add("hidden");
    roleGroup.classList.add("hidden");
    adminLinkContainer.classList.add("hidden");
    
    dealershipCode.required = false;
    roleSelect.required = false;
    
    passwordGroup.classList.remove("hidden");
    passwordLabel.textContent = "Admin Password";
    rolePassword.placeholder = "Enter Admin Password";
    rolePassword.required = true;
    rolePassword.value = "";
    rolePassword.focus();
    
    backToUserBtn.classList.remove("hidden");
    loginStatus.textContent = "";
  });
}

if (backToUserBtn) {
  backToUserBtn.addEventListener("click", () => {
    currentLoginMode = "user";
    dealershipGroup.classList.remove("hidden");
    roleGroup.classList.remove("hidden");
    adminLinkContainer.classList.remove("hidden");
    
    dealershipCode.required = true;
    roleSelect.required = true;
    
    backToUserBtn.classList.add("hidden");
    loginStatus.textContent = "";
    
    roleSelect.dispatchEvent(new Event("change"));
  });
}

roleSelect.addEventListener("change", () => {
  if (roleSelect.value === "service" || roleSelect.value === "tvs_credit" || roleSelect.value === "mahindra") {
    passwordGroup.classList.remove("hidden");
    passwordLabel.textContent = "Password";
    rolePassword.placeholder = "Enter Password";
    rolePassword.required = true;
    rolePassword.value = "";
    rolePassword.focus();
  } else {
    passwordGroup.classList.add("hidden");
    rolePassword.required = false;
    rolePassword.value = "";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "";
  loginStatus.className = "login-status";

  const password = rolePassword.value;

  if (currentLoginMode === "admin") {
    if (!password) {
      loginStatus.textContent = "Please enter Admin password.";
      loginStatus.classList.add("error");
      return;
    }
    
    loginStatus.textContent = "Authenticating...";
    loginStatus.classList.add("info");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        loginStatus.textContent = "";
        rolePassword.value = "";
        switchView("admin");
      } else {
        loginStatus.textContent = data.error || "Incorrect password.";
        loginStatus.className = "login-status error";
      }
    } catch (err) {
      console.error(err);
      loginStatus.textContent = "Server error during login.";
      loginStatus.className = "login-status error";
    }
    return;
  }

  const code = dealershipCode.value.trim();
  const role = roleSelect.value;

  if (!code) {
    loginStatus.textContent = "Please enter Dealership Code.";
    loginStatus.classList.add("error");
    return;
  }

  if (code !== "67124") {
    loginStatus.textContent = "Invalid Dealership Code. Access denied.";
    loginStatus.classList.add("error");
    return;
  }

  if (!role) {
    loginStatus.textContent = "Please select a role.";
    loginStatus.classList.add("error");
    return;
  }

  if (!password) {
    loginStatus.textContent = "Please enter password.";
    loginStatus.classList.add("error");
    return;
  }

  loginStatus.textContent = "Authenticating...";
  loginStatus.classList.add("info");

  const endpoint = role === "tvs_credit" ? "/api/credit/login" : role === "mahindra" ? "/api/mahindra/login" : "/api/service/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      loginStatus.textContent = "";
      rolePassword.value = "";
      switchView(role === "tvs_credit" ? "credit" : role === "mahindra" ? "mahindra" : "service");
    } else {
      loginStatus.textContent = data.error || "Incorrect password.";
      loginStatus.className = "login-status error";
    }
  } catch (err) {
    console.error(err);
    loginStatus.textContent = "Server error during login.";
    loginStatus.className = "login-status error";
  }
});

// ---------- Logout / Switch Account Handlers ----------
adminLogoutBtn.addEventListener("click", () => {
  adminStatusMsg.textContent = "";
  if (backToUserBtn) backToUserBtn.click();
  switchView("login");
});

// ---------- Statistics Functions ----------
async function loadStatistics() {
  try {
    const res = await fetch(`/api/admin/statistics?t=${Date.now()}`);
    const data = await res.json();
    
    if (res.ok) {
      document.getElementById("statServiceCounter").textContent = data.service.counter;
      document.getElementById("statServiceActual").textContent = data.service.actual;
      document.getElementById("statServiceMissing").textContent = data.service.missing;
      
      document.getElementById("statCreditCounter").textContent = data.credit.counter;
      document.getElementById("statCreditActual").textContent = data.credit.actual;
      document.getElementById("statCreditMissing").textContent = data.credit.missing;
      
      document.getElementById("statMahindraCounter").textContent = data.mahindra.counter;
      document.getElementById("statMahindraActual").textContent = data.mahindra.actual;
      document.getElementById("statMahindraMissing").textContent = data.mahindra.missing;
      
      // Highlight missing records
      document.getElementById("statServiceMissing").style.color = data.service.missing > 0 ? "#e74c3c" : "#27ae60";
      document.getElementById("statCreditMissing").style.color = data.credit.missing > 0 ? "#e74c3c" : "#27ae60";
      document.getElementById("statMahindraMissing").style.color = data.mahindra.missing > 0 ? "#e74c3c" : "#27ae60";
      
      document.getElementById("statisticsContent").style.display = "block";
      document.getElementById("statisticsLoading").style.display = "none";
    } else {
      document.getElementById("statisticsLoading").textContent = "Error loading statistics";
    }
  } catch (err) {
    console.error("Error loading statistics:", err);
    document.getElementById("statisticsLoading").textContent = "Error loading statistics";
  }
}

if (refreshStatisticsBtn) {
  refreshStatisticsBtn.addEventListener("click", loadStatistics);
}

if (exportStatisticsBtn) {
  exportStatisticsBtn.addEventListener("click", () => {
    downloadExcelFile("/api/admin/export-statistics", "Subaselvi_Motors_Statistics.xlsx");
    if (adminStatusMsg) {
      adminStatusMsg.textContent = "Downloading Statistics Excel spreadsheet to your system...";
      adminStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (adminStatusMsg.textContent.includes("Downloading")) adminStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

if (exportMissingDetailsBtn) {
  exportMissingDetailsBtn.addEventListener("click", () => {
    downloadExcelFile("/api/admin/export-missing-details", "Subaselvi_Motors_Missing_Details.xlsx");
    if (adminStatusMsg) {
      adminStatusMsg.textContent = "Downloading Missing Details Excel spreadsheet to your system...";
      adminStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (adminStatusMsg.textContent.includes("Downloading")) adminStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

// ---------- View All Invoices ----------
const invoiceHeaders = {
  service: ["Invoice Number", "Invoice Date", "Receipt Mode", "Customer Name", "Vehicle Type", "Vehicle Number", "Phone Number", "J.C. No.", "Sl. No.", "Description", "Qty", "Amount", "Grand Total"],
  credit: ["Rt. No.", "Date", "Customer Name", "Amount", "Amount (Words)", "Settlement Of", "Head of Account"],
  mahindra: ["Invoice Number", "Date", "Payment Mode", "Customer Name", "Phone Number", "Component", "Quantity", "Price", "Amount", "Total Bill"]
};

if (loadInvoicesBtn) {
  loadInvoicesBtn.addEventListener("click", async () => {
    const type = invoiceTypeSelect.value;
    if (!type) {
      alert("Please select a role first");
      return;
    }
    
    document.getElementById("invoicesTableContainer").style.display = "none";
    document.getElementById("invoicesLoading").style.display = "block";
    document.getElementById("invoicesError").style.display = "none";
    
    try {
      const res = await fetch(`/api/admin/invoices-data?type=${type}&t=${Date.now()}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load invoices");
      }
      
      displayInvoices(data.data, type, data.count);
    } catch (err) {
      console.error("Error loading invoices:", err);
      document.getElementById("invoicesError").textContent = "Error loading invoices: " + err.message;
      document.getElementById("invoicesError").style.display = "block";
    } finally {
      document.getElementById("invoicesLoading").style.display = "none";
    }
  });
}

function displayInvoices(data, type, count) {
  const headers = invoiceHeaders[type] || [];
  const tableHead = document.getElementById("invoicesTableHead");
  const tableBody = document.getElementById("invoicesTableBody");
  
  // Clear existing content
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  
  // Add headers
  const headerRow = document.createElement("tr");
  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.style.padding = "8px";
    th.style.border = "1px solid #1a1a7a";
    th.style.textAlign = "left";
    th.style.fontSize = "11px";
    th.style.whiteSpace = "nowrap";
    th.style.minWidth = "80px";
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);
  
  // Add data rows
  if (data && data.length > 0) {
    data.forEach((rowData, rowIndex) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";
      
      // Ensure we have data for all columns
      const columnsToDisplay = headers.length;
      for (let i = 0; i < columnsToDisplay; i++) {
        const cellValue = rowData[i] !== undefined && rowData[i] !== null ? rowData[i] : "";
        const td = document.createElement("td");
        td.textContent = cellValue;
        td.style.padding = "6px 8px";
        td.style.border = "1px solid #dee2e6";
        td.style.textAlign = "left";
        td.style.fontSize = "12px";
        td.style.whiteSpace = "nowrap";
        tr.appendChild(td);
      }
      tableBody.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = headers.length;
    td.textContent = "No invoices found";
    td.style.padding = "20px";
    td.style.textAlign = "center";
    td.style.color = "#666";
    td.style.border = "1px solid #dee2e6";
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }
  
  // Show count
  document.getElementById("invoicesCount").textContent = `Total: ${count || 0} invoices displayed`;
  
  // Show table
  document.getElementById("invoicesTableContainer").style.display = "block";
}

// ---------- Debug Blob Storage ----------
if (debugBlobBtn) {
  debugBlobBtn.addEventListener("click", async () => {
    const debugOutput = document.getElementById("debugOutput");
    debugOutput.style.display = "block";
    debugOutput.textContent = "Checking blob storage...";
    
    try {
      const res = await fetch(`/api/admin/debug-blob?t=${Date.now()}`);
      const data = await res.json();
      
      if (res.ok) {
        debugOutput.innerHTML = `<strong>Environment:</strong><br>` +
          `VERCEL: ${data.environment.VERCEL}<br>` +
          `NETLIFY: ${data.environment.NETLIFY}<br>` +
          `BLOB_TOKEN: ${data.environment.BLOB_TOKEN}<br>` +
          `vercelBlob: ${data.environment.vercelBlob}<br><br>` +
          `<strong>Files:</strong><br>` +
          Object.entries(data.files).map(([file, info]) => {
            if (info.found) {
              return `${file}: Found (${info.size} bytes, ${info.rowCount} rows)`;
            } else {
              return `${file}: Not found`;
            }
          }).join("<br>");
      } else {
        debugOutput.textContent = "Error: " + (data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Debug error:", err);
      debugOutput.textContent = "Error: " + err.message;
    }
  });
}

// Load statistics when admin view is shown
const originalSwitchView = switchView;
switchView = function(viewName) {
  originalSwitchView(viewName);
  if (viewName === "admin") {
    loadStatistics();
  }
};

// ---------- Logout / Switch Account Handlers ----------
if (serviceLogoutBtn) {
  serviceLogoutBtn.addEventListener("click", () => {
    switchView("login");
  });
}

if (creditLogoutBtn) {
  creditLogoutBtn.addEventListener("click", () => {
    switchView("login");
  });
}

// ---------- Fetch product catalog ----------
async function fetchCatalog() {
  try {
    const res = await fetch(`/api/catalog?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        currentCatalog = data.items;
        updateAllSelects();
      }
    }
  } catch (err) {
    console.error("Could not load product catalog", err);
  }
}

function updateAllSelects() {
  itemsBody.querySelectorAll("select").forEach((select) => {
    const selectedVal = select.value;
    select.innerHTML = "";
    populateSelectOptions(select);
    select.value = selectedVal;
  });
}

// ---------- Invoice number & date ----------
async function loadNextInvoiceNumber() {
  try {
    const res = await fetch(`/api/next-invoice-number?t=${Date.now()}`);
    const data = await res.json();
    document.getElementById("invoiceNumber").value = data.invoiceNumber;
  } catch (err) {
    document.getElementById("invoiceNumber").value = "INV-???";
    console.error("Could not fetch invoice number", err);
  }
}

function setDefaultDate() {
  document.getElementById("invoiceDate").value = getLocalDateString();
}

// ---------- Receipt mode toggle ----------
document.getElementById("btnCash").addEventListener("click", () => setReceiptMode("Cash"));
document.getElementById("btnBank").addEventListener("click", () => setReceiptMode("Bank"));

function setReceiptMode(mode) {
  receiptMode = mode;
  document.getElementById("btnCash").classList.toggle("active", mode === "Cash");
  document.getElementById("btnBank").classList.toggle("active", mode === "Bank");
}

// ---------- Line items table ----------
function populateSelectOptions(select) {
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "-- Select item --";
  blank.dataset.price = "0";
  blank.dataset.isManual = "false";
  select.appendChild(blank);

  currentCatalog.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.name;
    const isLabour = item.name.toLowerCase().includes("labour") || item.price === 0;
    opt.textContent = isLabour
      ? `${item.name} (Manual Price)`
      : `${item.name} (₹${Number(item.price).toFixed(2)})`;
    opt.dataset.price = item.price;
    opt.dataset.isManual = isLabour ? "true" : "false";
    select.appendChild(opt);
  });
}

function buildDescriptionSelect() {
  const select = document.createElement("select");
  populateSelectOptions(select);
  return select;
}

function addRow() {
  const row = document.createElement("tr");

  const slCell = document.createElement("td");
  slCell.className = "sl-no-cell";
  row.appendChild(slCell);

  const descCell = document.createElement("td");
  const select = buildDescriptionSelect();
  descCell.appendChild(select);
  row.appendChild(descCell);

  const qtyCell = document.createElement("td");
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyCell.appendChild(qtyInput);
  row.appendChild(qtyCell);

  const totalCell = document.createElement("td");
  const totalInput = document.createElement("input");
  totalInput.type = "number";
  totalInput.step = "0.01";
  totalInput.value = "0.00";
  totalCell.appendChild(totalInput);
  row.appendChild(totalCell);

  const actionCell = document.createElement("td");
  actionCell.className = "no-print";
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-row-btn";
  removeBtn.innerHTML = "&times;";
  removeBtn.title = "Remove row";
  removeBtn.addEventListener("click", () => {
    row.remove();
    renumberRows();
    recalcGrandTotal();
  });
  actionCell.appendChild(removeBtn);
  row.appendChild(actionCell);

  function handleItemChange() {
    const selected = select.options[select.selectedIndex];
    const isManual = selected?.dataset.isManual === "true" || select.value.toLowerCase().includes("labour");

    if (isManual) {
      totalInput.readOnly = false;
      totalInput.classList.add("manual-amount");
      if (Number(totalInput.value) === 0 || !totalInput.value) {
        totalInput.value = "";
      }
      totalInput.focus();
    } else {
      totalInput.readOnly = false;
      totalInput.classList.remove("manual-amount");
      const price = Number(selected?.dataset.price || 0);
      const qty = Number(qtyInput.value || 0);
      totalInput.value = (price * qty).toFixed(2);
    }
    recalcGrandTotal();
  }

  select.addEventListener("change", handleItemChange);
  qtyInput.addEventListener("input", () => {
    const selected = select.options[select.selectedIndex];
    const isManual = selected?.dataset.isManual === "true" || select.value.toLowerCase().includes("labour");
    if (!isManual) {
      const price = Number(selected?.dataset.price || 0);
      const qty = Number(qtyInput.value || 0);
      totalInput.value = (price * qty).toFixed(2);
    }
    recalcGrandTotal();
  });
  totalInput.addEventListener("input", recalcGrandTotal);

  itemsBody.appendChild(row);
  renumberRows();
}

function renumberRows() {
  [...itemsBody.querySelectorAll("tr")].forEach((row, idx) => {
    row.querySelector(".sl-no-cell").textContent = idx + 1;
  });
}

function recalcGrandTotal() {
  let sum = 0;
  itemsBody.querySelectorAll("tr").forEach((row) => {
    const totalInput = row.querySelectorAll("input")[1];
    sum += Number(totalInput.value || 0);
  });
  grandTotalCell.textContent = sum.toFixed(2);
  const sumVal = Math.round(sum);
  if (document.getElementById("grandTotalWords")) {
    document.getElementById("grandTotalWords").textContent = numberToWords(sumVal);
  }
}

addRowBtn.addEventListener("click", addRow);

// ---------- Form Data Payload ----------
function collectInvoicePayload() {
  const items = [];
  itemsBody.querySelectorAll("tr").forEach((row) => {
    const select = row.querySelector("select");
    const qtyInput = row.querySelectorAll("input")[0];
    const totalInput = row.querySelectorAll("input")[1];
    if (select.value) {
      items.push({
        description: select.value,
        qty: Number(qtyInput.value || 0),
        total: Number(totalInput.value || 0),
      });
    }
  });

  return {
    invoiceDate: document.getElementById("invoiceDate").value,
    receiptMode,
    customer: {
      name: document.getElementById("custName").value,
      vehicleType: document.getElementById("vehicleType").value,
      vehicleNo: document.getElementById("vehicleNo").value,
      phoneNo: document.getElementById("phoneNo").value,
    },
    jcNo: document.getElementById("jcNo").value,
    items,
    grandTotal: Number(grandTotalCell.textContent || 0),
  };
}

// ---------- Submit Invoice ----------
document.getElementById("submitBtn").addEventListener("click", async () => {
  const payload = collectInvoicePayload();

  if (payload.items.length === 0) {
    statusMsg.textContent = "Please add at least one line item with a selected description.";
    statusMsg.style.color = "#b3392c";
    return;
  }

  statusMsg.textContent = "Saving invoice...";
  statusMsg.style.color = "";

  try {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      statusMsg.textContent = data.error || "Something went wrong.";
      statusMsg.style.color = "#b3392c";
      return;
    }

    statusMsg.textContent = "";
    renderPrintView(data.invoice);
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Could not reach the server.";
    statusMsg.style.color = "#b3392c";
  }
});

// ---------- Print View ----------
function renderPrintView(invoice) {
  document.getElementById("pv-invoiceNumber").textContent = invoice.invoiceNumber;
  let dateParts = invoice.invoiceDate.split('-');
  let formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : invoice.invoiceDate;
  document.getElementById("pv-invoiceDate").textContent = formattedDate;
  document.getElementById("pv-receiptMode").textContent = invoice.receiptMode;
  document.getElementById("pv-custName").textContent = invoice.customer.name || "";
  document.getElementById("pv-vehicleType").textContent = invoice.customer.vehicleType || "";
  document.getElementById("pv-vehicleNo").textContent = invoice.customer.vehicleNo || "";
  document.getElementById("pv-phoneNo").textContent = invoice.customer.phoneNo || "";
  document.getElementById("pv-jcNo").textContent = invoice.jcNo;

  const pvBody = document.getElementById("pv-itemsBody");
  pvBody.innerHTML = "";
  invoice.items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.slNo}</td>
      <td>${item.description}</td>
      <td>${item.qty}</td>
      <td>${item.total.toFixed(2)}</td>
    `;
    pvBody.appendChild(tr);
  });
  document.getElementById("pv-grandTotal").textContent = invoice.grandTotal.toFixed(2);
  if (document.getElementById("pv-grandTotalWords")) {
    document.getElementById("pv-grandTotalWords").textContent = numberToWords(Math.round(invoice.grandTotal));
  }

  switchView("print");
  document.body.classList.add("print-service");
  setTimeout(() => {
    window.print();
  }, 300);
  function onAfterPrintService() {
    document.body.classList.remove("print-service");
    window.removeEventListener("afterprint", onAfterPrintService);
    document.getElementById("newInvoiceBtn").click();
  }
  window.addEventListener("afterprint", onAfterPrintService);
}

document.getElementById("printBtn").addEventListener("click", () => window.print());
document.getElementById("newInvoiceBtn").addEventListener("click", () => {
  // Reset invoice form and return to service view
  itemsBody.innerHTML = "";
  document.getElementById("custName").value = "";
  document.getElementById("vehicleType").value = "";
  document.getElementById("vehicleNo").value = "";
  document.getElementById("phoneNo").value = "";
  document.getElementById("jcNo").value = "";
  loadNextInvoiceNumber();
  setDefaultDate();
  addRow();
  switchView("service");
});

// ---------- Excel Downloads to Local System ----------
function downloadExcelFile(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }, 1000);
}

if (downloadExcelBtn) {
  downloadExcelBtn.addEventListener("click", () => {
    downloadExcelFile("/api/download/Subaselvi_Motors_Invoices.xlsx", "Subaselvi_Motors_Invoices.xlsx");
    if (adminStatusMsg) {
      adminStatusMsg.textContent = "Downloading Service Excel spreadsheet to your system...";
      adminStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (adminStatusMsg.textContent.includes("Downloading")) adminStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

if (downloadCreditExcelBtn) {
  downloadCreditExcelBtn.addEventListener("click", () => {
    downloadExcelFile("/api/download/Subaselvi_Motors_Credit_Receipts.xlsx", "Subaselvi_Motors_Credit_Receipts.xlsx");
    if (adminStatusMsg) {
      adminStatusMsg.textContent = "Downloading Credit Excel spreadsheet to your system...";
      adminStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (adminStatusMsg.textContent.includes("Downloading")) adminStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

if (downloadMahindraExcelBtn) {
  downloadMahindraExcelBtn.addEventListener("click", () => {
    downloadExcelFile("/api/download/Subaselvi_Motors_Mahindra_Invoices.xlsx", "Subaselvi_Motors_Mahindra_Invoices.xlsx");
    if (adminStatusMsg) {
      adminStatusMsg.textContent = "Downloading Mahindra Excel spreadsheet to your system...";
      adminStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (adminStatusMsg.textContent.includes("Downloading")) adminStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

if (downloadCreditExcelBtn2) {
  downloadCreditExcelBtn2.addEventListener("click", () => {
    downloadExcelFile("/api/download/Subaselvi_Motors_Credit_Receipts.xlsx", "Subaselvi_Motors_Credit_Receipts.xlsx");
    if (creditStatusMsg) {
      creditStatusMsg.textContent = "Downloading Credit Excel spreadsheet to your system...";
      creditStatusMsg.style.color = "#107c41";
      setTimeout(() => {
        if (creditStatusMsg.textContent.includes("Downloading")) creditStatusMsg.textContent = "";
      }, 4000);
    }
  });
}

// ---------- Admin Action 2: Upload Products Excel ----------
if (uploadCatalogBtn && catalogFileInput) {
  uploadCatalogBtn.addEventListener("click", () => {
    catalogFileInput.click();
  });

  catalogFileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    adminStatusMsg.textContent = "Uploading product catalog...";
    adminStatusMsg.style.color = "#0b4f6c";

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await fetch("/api/upload-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: arrayBuffer,
      });

      const data = await res.json();
      if (!res.ok) {
        adminStatusMsg.textContent = data.error || "Failed to upload product catalog.";
        adminStatusMsg.style.color = "#b3392c";
        return;
      }

      adminStatusMsg.textContent = "Product catalog Excel uploaded successfully!";
      adminStatusMsg.style.color = "#107c41";
      await fetchCatalog();
      catalogFileInput.value = "";
    } catch (err) {
      console.error(err);
      adminStatusMsg.textContent = "Error uploading file to server.";
      adminStatusMsg.style.color = "#b3392c";
    }
  });
}

// ---------- Initialization ----------
async function initInvoice() {
  loadNextInvoiceNumber();
  setDefaultDate();
  await fetchCatalog();
  if (itemsBody.children.length === 0) {
    addRow();
  }
}

// ---------- TVS Credit Specific Logic ----------
async function loadNextCreditNumber() {
  try {
    const res = await fetch(`/api/next-credit-number?t=${Date.now()}`);
    const data = await res.json();
    if (crRtNo) crRtNo.textContent = data.rtNo;
  } catch (err) {
    if (crRtNo) crRtNo.textContent = "????";
    console.error("Could not fetch credit number", err);
  }
}

function initCreditReceipt() {
  loadNextCreditNumber();
  if (crDate) crDate.value = getLocalDateString();
  if (crCustomerName) crCustomerName.value = "";
  if (crAmount) crAmount.value = "";
  if (crAmountWords) crAmountWords.value = "";
  if (crSettlementOf) crSettlementOf.value = "TVS CREDIT SERVICES LIMITED";
  if (crHeadOfAccount) crHeadOfAccount.value = "";
  if (creditStatusMsg) creditStatusMsg.textContent = "";
}

if (submitCreditBtn) {
  submitCreditBtn.addEventListener("click", async () => {
    if (!crCustomerName.value || !crAmount.value) {
      creditStatusMsg.textContent = "Please fill in Customer Name and Amount.";
      creditStatusMsg.style.color = "#b3392c";
      return;
    }

    creditStatusMsg.textContent = "Saving receipt...";
    creditStatusMsg.style.color = "#0b4f6c";

    const payload = {
      date: crDate.value,
      customerName: crCustomerName.value,
      amount: crAmount.value,
      amountWords: crAmountWords.value,
      settlementOf: crSettlementOf.value,
      headOfAccount: crHeadOfAccount.value
    };

    try {
      const res = await fetch("/api/credit-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        creditStatusMsg.textContent = data.error || "Something went wrong.";
        creditStatusMsg.style.color = "#b3392c";
        return;
      }

      creditStatusMsg.textContent = "Receipt saved!";
      creditStatusMsg.style.color = "#107c41";
      
      // Sync the screen's RT NO with the server's actual saved RT NO before printing
      if (crRtNo && data.receipt && data.receipt.rtNo) {
        crRtNo.textContent = data.receipt.rtNo;
      }

      // Print as A5 Landscape
      document.body.classList.add("print-credit");
      setTimeout(() => {
        window.print();
      }, 300);
      function onAfterPrintCredit() {
        document.body.classList.remove("print-credit");
        window.removeEventListener("afterprint", onAfterPrintCredit);
        // Re-initialize to get the new RT NO and clear the form for the next receipt
        initCreditReceipt();
        creditStatusMsg.textContent = "";
      }
      window.addEventListener("afterprint", onAfterPrintCredit);

    } catch (err) {
      console.error(err);
      creditStatusMsg.textContent = "Could not reach the server.";
      creditStatusMsg.style.color = "#b3392c";
    }
  });
}

if (newCreditBtn) {
  newCreditBtn.addEventListener("click", () => {
    initCreditReceipt();
  });
}



// ---------- Number to Words Utility ----------
function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num < 0) return "";
  
  const n = String(num).padStart(9, "0");
  const crore = parseInt(n.substring(0, 2), 10);
  const lakh = parseInt(n.substring(2, 4), 10);
  const thousand = parseInt(n.substring(4, 6), 10);
  const hundred = parseInt(n.substring(6, 7), 10);
  const tens = parseInt(n.substring(7, 9), 10);
  
  let str = "";
  
  const getTens = (t) => {
    if (t < 20) return a[t];
    return b[Math.floor(t / 10)] + (t % 10 !== 0 ? " " + a[t % 10] : "");
  };
  
  if (crore) str += getTens(crore) + " Crore ";
  if (lakh) str += getTens(lakh) + " Lakh ";
  if (thousand) str += getTens(thousand) + " Thousand ";
  if (hundred) str += getTens(hundred) + " Hundred ";
  
  if (tens) {
    str += getTens(tens);
  }
  
  return (str.trim() + " Rupees Only").toUpperCase();
}

const resizeTextarea = (el) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

if (crAmount) {
  crAmount.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      crAmountWords.value = numberToWords(val);
    } else {
      crAmountWords.value = "";
    }
    resizeTextarea(crAmountWords);
  });
}

if (crAmountWords) {
  crAmountWords.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
    resizeTextarea(e.target);
  });
}

if (crCustomerName) {
  crCustomerName.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
  });
}

// ---------- Mahindra Billing Logic ----------
let mahindraPrices = [];
let isMahindraInitialized = false;
let mhReceiptMode = "Cash";

const mhInvoiceNumber = document.getElementById("mhInvoiceNumber");
const mhInvoiceDate = document.getElementById("mhInvoiceDate");
const mhBtnCash = document.getElementById("mhBtnCash");
const mhBtnBank = document.getElementById("mhBtnBank");
const mhCustName = document.getElementById("mhCustName");
const mhPhoneNo = document.getElementById("mhPhoneNo");
const mhItemsBody = document.getElementById("mhItemsBody");
const mhGrandTotalCell = document.getElementById("mhGrandTotalCell");
const mhStatusMsg = document.getElementById("mhStatusMsg");
const mhAddRowBtn = document.getElementById("mhAddRowBtn");
const mhUploadPriceBtn = document.getElementById("mhUploadPriceBtn");
const mhSubmitBtn = document.getElementById("mhSubmitBtn");
const mahindraLogoutBtn = document.getElementById("mahindraLogoutBtn");
const mhPrintBtn = document.getElementById("mhPrintBtn");
const mhNewInvoiceBtn = document.getElementById("mhNewInvoiceBtn");

if (mahindraLogoutBtn) {
  mahindraLogoutBtn.addEventListener("click", () => switchView("login"));
}

if (mhBtnCash) mhBtnCash.addEventListener("click", () => setMhReceiptMode("Cash"));
if (mhBtnBank) mhBtnBank.addEventListener("click", () => setMhReceiptMode("Bank"));

function setMhReceiptMode(mode) {
  mhReceiptMode = mode;
  if (mhBtnCash) mhBtnCash.classList.toggle("active", mode === "Cash");
  if (mhBtnBank) mhBtnBank.classList.toggle("active", mode === "Bank");
}

async function fetchMahindraPrices() {
  try {
    const res = await fetch(`/api/mahindra-prices?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      mahindraPrices = data.prices || [];
      updateMhPriceSelects();
    }
  } catch (err) {
    console.error("Could not fetch Mahindra prices", err);
  }
}

function updateMhPriceSelects() {
  if (mhItemsBody) {
    mhItemsBody.querySelectorAll(".mh-price-select").forEach(select => {
      const currentVal = select.value;
      select.innerHTML = '<option value="0">-- Select Price --</option>';
      mahindraPrices.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.price;
        opt.textContent = `₹${p.price.toFixed(2)}`;
        select.appendChild(opt);
      });
      // Try to keep previous selection, else reset to first non-zero if currentVal is 0 and only 1 price exists
      if (currentVal !== "0" && select.querySelector(`option[value="${currentVal}"]`)) {
        select.value = currentVal;
      } else if (mahindraPrices.length === 1) {
        select.value = mahindraPrices[0].price;
      }
      select.dispatchEvent(new Event("change"));
    });
  }
}

const mhPriceModal = document.getElementById("mhPriceModal");
const mhPriceList = document.getElementById("mhPriceList");
const mhNewPriceInput = document.getElementById("mhNewPriceInput");
const mhAddNewPriceBtn = document.getElementById("mhAddNewPriceBtn");
const mhClosePriceModalBtn = document.getElementById("mhClosePriceModalBtn");

function renderPriceList() {
  if (!mhPriceList) return;
  mhPriceList.innerHTML = "";
  mahindraPrices.forEach((p, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "8px 10px";
    li.style.borderBottom = "1px solid #eee";
    
    const text = document.createElement("span");
    text.textContent = `₹${p.price.toFixed(2)}`;
    
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.background = "none";
    delBtn.style.border = "none";
    delBtn.style.cursor = "pointer";
    delBtn.style.color = "red";
    delBtn.onclick = async () => {
      if (confirm(`Are you sure you want to delete ₹${p.price.toFixed(2)}?`)) {
        const updatedPrices = mahindraPrices.filter((_, i) => i !== index);
        await saveMahindraPrices(updatedPrices);
      }
    };
    
    li.appendChild(text);
    li.appendChild(delBtn);
    mhPriceList.appendChild(li);
  });
}

async function saveMahindraPrices(updatedPrices) {
  try {
    const res = await fetch("/api/mahindra-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices: updatedPrices })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.prices) mahindraPrices = data.prices;
      updateMhPriceSelects();
      renderPriceList();
    } else {
      alert("Failed to save price.");
    }
  } catch (err) {
    console.error(err);
    alert("Error saving price.");
  }
}

if (mhUploadPriceBtn) {
  mhUploadPriceBtn.addEventListener("click", () => {
    renderPriceList();
    mhPriceModal.classList.remove("hidden");
  });
}

if (mhClosePriceModalBtn) {
  mhClosePriceModalBtn.addEventListener("click", () => {
    mhPriceModal.classList.add("hidden");
  });
}

if (mhAddNewPriceBtn) {
  mhAddNewPriceBtn.addEventListener("click", async () => {
    const newPrice = Number(mhNewPriceInput.value);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Invalid price.");
      return;
    }
    if (mahindraPrices.some(p => p.price === newPrice)) {
      alert("This price already exists.");
      return;
    }
    const updatedPrices = [...mahindraPrices, { price: newPrice }];
    await saveMahindraPrices(updatedPrices);
    mhNewPriceInput.value = "";
  });
}

function addMhRow() {
  if (!mhItemsBody) return;
  const row = document.createElement("tr");

  const slCell = document.createElement("td");
  slCell.className = "sl-no-cell";
  row.appendChild(slCell);

  const descCell = document.createElement("td");
  const compSelect = document.createElement("select");
  compSelect.className = "mh-comp-select";
  compSelect.innerHTML = `
    <option value="">-- Select --</option>
    <option value="Mahindra Oil 10L">Mahindra Oil 10L</option>
    <option value="Mahindra Oil 20L">Mahindra Oil 20L</option>
  `;
  descCell.appendChild(compSelect);
  row.appendChild(descCell);

  const qtyCell = document.createElement("td");
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyCell.appendChild(qtyInput);
  row.appendChild(qtyCell);

  const priceCell = document.createElement("td");
  const priceSelect = document.createElement("select");
  priceSelect.className = "mh-price-select";
  priceSelect.innerHTML = '<option value="0">-- Select Price --</option>';
  mahindraPrices.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.price;
    opt.textContent = `₹${p.price.toFixed(2)}`;
    priceSelect.appendChild(opt);
  });
  if (mahindraPrices.length === 1) priceSelect.value = mahindraPrices[0].price;
  priceCell.appendChild(priceSelect);
  row.appendChild(priceCell);

  const amountCell = document.createElement("td");
  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.step = "0.01";
  amountInput.value = "0.00";
  amountInput.readOnly = true;
  amountCell.appendChild(amountInput);
  row.appendChild(amountCell);

  const actionCell = document.createElement("td");
  actionCell.className = "no-print";
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-row-btn";
  removeBtn.innerHTML = "&times;";
  removeBtn.title = "Remove row";
  removeBtn.addEventListener("click", () => {
    row.remove();
    renumberMhRows();
    recalcMhGrandTotal();
  });
  actionCell.appendChild(removeBtn);
  row.appendChild(actionCell);

  const recalcRow = () => {
    const q = Number(qtyInput.value || 0);
    const p = Number(priceSelect.value || 0);
    amountInput.value = (q * p).toFixed(2);
    recalcMhGrandTotal();
  };

  qtyInput.addEventListener("input", recalcRow);
  priceSelect.addEventListener("change", recalcRow);

  mhItemsBody.appendChild(row);
  renumberMhRows();
  recalcRow();
}

function renumberMhRows() {
  if (!mhItemsBody) return;
  [...mhItemsBody.querySelectorAll("tr")].forEach((row, idx) => {
    row.querySelector(".sl-no-cell").textContent = idx + 1;
  });
}

function recalcMhGrandTotal() {
  if (!mhItemsBody) return;
  let sum = 0;
  mhItemsBody.querySelectorAll("tr").forEach((row) => {
    const amountInput = row.querySelectorAll("input")[1];
    sum += Number(amountInput.value || 0);
  });
  if (mhGrandTotalCell) mhGrandTotalCell.textContent = sum.toFixed(2);
  const sumVal = Math.round(sum);
  if (document.getElementById("mhGrandTotalWords")) {
    document.getElementById("mhGrandTotalWords").textContent = numberToWords(sumVal);
  }
}

if (mhAddRowBtn) {
  mhAddRowBtn.addEventListener("click", addMhRow);
}

async function initMahindraInvoice() {
  try {
    const res = await fetch(`/api/next-mahindra-number?t=${Date.now()}`);
    const data = await res.json();
    if (mhInvoiceNumber) mhInvoiceNumber.value = data.invoiceNumber;
  } catch (err) {
    if (mhInvoiceNumber) mhInvoiceNumber.value = "INV????";
  }

  if (mhInvoiceDate) mhInvoiceDate.value = getLocalDateString();
  if (mhCustName) mhCustName.value = "";
  if (mhPhoneNo) mhPhoneNo.value = "";
  
  await fetchMahindraPrices();
  
  if (mhItemsBody && mhItemsBody.children.length === 0) {
    addMhRow();
  }
}

if (mhSubmitBtn) {
  mhSubmitBtn.addEventListener("click", async () => {
    const items = [];
    mhItemsBody.querySelectorAll("tr").forEach((row) => {
      const compSelect = row.querySelector(".mh-comp-select");
      const qtyInput = row.querySelectorAll("input")[0];
      const priceSelect = row.querySelector(".mh-price-select");
      const amountInput = row.querySelectorAll("input")[1];
      
      if (compSelect.value) {
        items.push({
          component: compSelect.value,
          quantity: Number(qtyInput.value || 0),
          price: Number(priceSelect.value || 0),
          amount: Number(amountInput.value || 0)
        });
      }
    });

    if (items.length === 0) {
      mhStatusMsg.textContent = "Please add at least one item with a selected component.";
      mhStatusMsg.style.color = "#b3392c";
      return;
    }

    mhStatusMsg.textContent = "Saving invoice...";
    mhStatusMsg.style.color = "";

    const payload = {
      date: mhInvoiceDate.value,
      paymentMode: mhReceiptMode,
      customerName: mhCustName.value,
      phoneNumber: mhPhoneNo.value,
      items,
      totalAmount: Number(mhGrandTotalCell.textContent || 0)
    };

    try {
      const res = await fetch("/api/mahindra-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        mhStatusMsg.textContent = data.error || "Failed to save invoice.";
        mhStatusMsg.style.color = "#b3392c";
        return;
      }

      mhStatusMsg.textContent = "";
      renderMahindraPrintView(data.invoice);
    } catch (err) {
      console.error(err);
      mhStatusMsg.textContent = "Could not reach the server.";
      mhStatusMsg.style.color = "#b3392c";
    }
  });
}

function renderMahindraPrintView(invoice) {
  document.getElementById("pmh-invoiceNumber").textContent = invoice.invoiceNumber;
  let dateParts = invoice.date.split('-');
  let formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : invoice.date;
  document.getElementById("pmh-invoiceDate").textContent = formattedDate;
  document.getElementById("pmh-receiptMode").textContent = invoice.paymentMode;
  document.getElementById("pmh-custName").textContent = invoice.customerName || "";
  document.getElementById("pmh-phoneNo").textContent = invoice.phoneNumber || "";

  const pmhBody = document.getElementById("pmh-itemsBody");
  pmhBody.innerHTML = "";
  invoice.items.forEach((item, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.component}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${item.amount.toFixed(2)}</td>
    `;
    pmhBody.appendChild(tr);
  });
  document.getElementById("pmh-grandTotal").textContent = invoice.totalAmount.toFixed(2);
  if (document.getElementById("pmh-grandTotalWords")) {
    document.getElementById("pmh-grandTotalWords").textContent = numberToWords(Math.round(invoice.totalAmount));
  }

  switchView("print_mahindra");
  document.body.classList.add("print-mahindra");
  setTimeout(() => {
    window.print();
  }, 300);
  function onAfterPrintMahindra() {
    document.body.classList.remove("print-mahindra");
    window.removeEventListener("afterprint", onAfterPrintMahindra);
    if (mhNewInvoiceBtn) mhNewInvoiceBtn.click();
  }
  window.addEventListener("afterprint", onAfterPrintMahindra);
}

if (mhPrintBtn) mhPrintBtn.addEventListener("click", () => window.print());
if (mhNewInvoiceBtn) {
  mhNewInvoiceBtn.addEventListener("click", () => {
    mhItemsBody.innerHTML = "";
    initMahindraInvoice();
    switchView("mahindra");
  });
}

// Initial view is Login box
switchView("login");
