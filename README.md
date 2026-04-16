This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google Sheets CMS

Products are loaded from a Google Sheet published as a CSV. Changes to the sheet appear on the site within ~60 seconds (ISR) without redeploying.

### Sheet columns

Row 1 must contain these exact column names (case-sensitive):

`id` | `name` | `pricePerKg` | `source` | `destination` | `deliveryDate` | `preOrderStart` | `preOrderUntil` | `stockRemaining` | `images`

**Example row:**

| Field | Value |
|---|---|
| `id` | `bd44a16e-d716-4f8a-80f1-ccead0d1f9ae` |
| `name` | `Cabe Merah Keriting` |
| `pricePerKg` | `35000-50000` (number or range string) |
| `source` | `Nagari Aia Angek, Tanah Datar` |
| `destination` | `Padang` |
| `deliveryDate` | `Minggu, 19 April 2026` |
| `preOrderStart` | `2026-04-18T06:00:00+07:00` |
| `preOrderUntil` | `2026-04-18T14:00:00+07:00` |
| `stockRemaining` | `18` (numeric, stored as text in sheet) |
| `images` | `/images/cabe1.webp,/images/cabe2.webp` (comma-separated) |

- Leave `preOrderStart` / `preOrderUntil` blank → product shows as *PO Ditutup*.
- Multiple `images` become a swipeable carousel.

### Publishing the sheet

**File → Share → Publish to web → select the product sheet tab → CSV** and copy the URL.

### Environment variables

| Variable | When it is used |
|---|---|
| `GOOGLE_SHEETS_PRODUCTS_CSV_URL_STAGING` | `APP_ENV !== 'production'` (local dev, preview deploys) |
| `GOOGLE_SHEETS_PRODUCTS_CSV_URL_PRODUCTION` | `APP_ENV === 'production'` (production deploy) |

Create `.env.local` for local development:

```env
GOOGLE_SHEETS_PRODUCTS_CSV_URL_STAGING=https://docs.google.com/spreadsheets/d/YOUR_STAGING_SHEET_ID/pub?gid=0&single=true&output=csv
GOOGLE_SHEETS_PRODUCTS_CSV_URL_PRODUCTION=https://docs.google.com/spreadsheets/d/YOUR_PRODUCTION_SHEET_ID/pub?gid=0&single=true&output=csv
```

On Netlify, set both variables in **Site configuration → Environment variables**, scoping each to its deploy context.

---

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
