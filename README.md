# Subaselvi Motors — Cash Invoice Billing System

A lightweight full-stack billing app for **Subaselvi Motors** (Cash Invoice — Service/Spare).

## Stack
- **Backend:** Node.js + Express + ExcelJS
- **Frontend:** Plain HTML/CSS/JS (no build step required)
- **Storage:** `data/invoices.xlsx` (auto-created), `data/counter.json` (invoice number sequence)

## Setup

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

(If port 3000 is busy, run `PORT=4000 npm start` and use that port instead.)

## How it works

1. **Invoice header** — company name, address, phone, and title are static/pre-filled per the spec.
2. **Invoice number** — fetched from the server on page load (`GET /api/next-invoice-number`), shown read-only. The number is only *consumed* (incremented) when the invoice is actually submitted, so refreshing the page without submitting won't burn a number.
3. **Receipt Mode** — Cash/Bank toggle, single-select, visually highlighted.
4. **Line items** — each row's Description dropdown carries a fixed unit price (see `ITEM_CATALOG` in `public/app.js`). Total = price × Qty, calculated live. Rows can be added/removed. A footer row sums the grand total.
5. **Footer** — J.C. No. field sits at the top of the footer block, followed by E&OE, "For Subaselvi Motors", and Authorised Signatory.
6. **Submit** — posts the full payload to `POST /api/invoices`. The server assigns the invoice number, appends a row to `data/invoices.xlsx`, and increments the counter.
7. **Print view** — on successful submit, the app swaps to a clean, control-free print layout and calls `window.print()` automatically. You can also hit "Print" again or "New Invoice" to reset for the next customer.

## Editing the item price list

Open `public/app.js` and edit the `ITEM_CATALOG` array at the top:

```js
const ITEM_CATALOG = [
  { name: "General Service", price: 1200 },
  { name: "Engine Oil Change", price: 450 },
  { name: "Brake Pad Replacement", price: 850 },
  { name: "Battery Replacement", price: 3200 },
  { name: "Wheel Alignment & Balancing", price: 600 },
];
```

Add, remove, or reprice items as needed — no other code changes required.

## Excel export format

Each submitted invoice becomes one row in `data/invoices.xlsx`, sheet `Invoices`, with these columns:

```
Invoice Number | Invoice Date | Receipt Mode | Customer Name | Customer Address |
GSTIN/UN | State | State Code | Place of Supply | J.C. No. |
Item1 Description | Item1 Qty | Item1 Total | ... (up to Item12) | Grand Total
```

The export supports up to **12 line items per invoice** (fixed columns, for a stable spreadsheet schema). Increase `MAX_ITEMS` in `server.js` if you need more — note this only affects *new* files; if `data/invoices.xlsx` already exists with fewer columns, delete it (or migrate manually) after changing the constant.

## Resetting invoice numbering / data

Delete `data/invoices.xlsx` and `data/counter.json` — both are recreated automatically (numbering restarts at `INV-001`).

## Notes / next steps

- The current invoice layout is a clean, standard Indian cash-invoice design (the reference photo mentioned in the original brief wasn't received). Send it over any time and the layout/spacing can be matched exactly.
- For multi-user / concurrent front-desk use, consider moving invoice storage to a proper database — the current JSON-counter + Excel-append approach is best suited to a single active till.
