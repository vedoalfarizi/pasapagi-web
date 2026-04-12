export interface Product {
    id: string;
    name: string;
    pricePerKg: number;
    stockStatus: 'Tersedia' | 'Stok Terbatas' | 'Habis';
    source: string;
    destination: string[];
    images: string[];
  }
  
