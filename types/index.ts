export interface Product {
  id: string;
  name: string;
  pricePerKg: number | string;
  source: string;
  destination: string;
  deliveryDate?: string;
  preOrderStart: string;
  preOrderUntil: string;
  stockRemaining: number;
  images: string[];
}
  
