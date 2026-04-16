import Papa from 'papaparse';
import { Product } from '@/types';

function getSheetUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const url = isProduction
    ? process.env.GOOGLE_SHEETS_PRODUCTS_CSV_URL_PRODUCTION
    : process.env.GOOGLE_SHEETS_PRODUCTS_CSV_URL_STAGING;

  if (!url) {
    throw new Error(
      `Missing env var: ${isProduction ? 'GOOGLE_SHEETS_PRODUCTS_CSV_URL_PRODUCTION' : 'GOOGLE_SHEETS_PRODUCTS_CSV_URL_STAGING'}`
    );
  }

  return url;
}

function rowToProduct(row: Record<string, string>): Product {
  const images = (row['images'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: row['id'] ?? '',
    name: row['name'] ?? '',
    pricePerKg: row['pricePerKg'] ?? '',
    source: row['source'] ?? '',
    destination: row['destination'] ?? '',
    deliveryDate: row['deliveryDate'] ?? '',
    preOrderStart: row['preOrderStart'] ?? '',
    preOrderUntil: row['preOrderUntil'] ?? '',
    stockRemaining: Number(row['stockRemaining']) || 0,
    images,
  };
}

export async function getProducts(): Promise<Product[]> {
  const url = getSheetUrl();

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch products sheet: ${res.status} ${res.statusText}`);
  }

  const csv = await res.text();

  const { data, errors } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    console.error('CSV parse errors:', errors);
  }

  return data.map(rowToProduct);
}
