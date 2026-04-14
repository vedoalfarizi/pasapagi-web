export interface Product {
    id: string;
    name: string;
    pricePerKg: number | string;
    stockStatus: 'Tersedia' | 'Segera Hadir' | 'Habis';
    source: string;
    destination: string;
    deliveryDate?: string;
    images: string[];
  }
  
