'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { Product } from '@/types';

export default function Home() {
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  
  const products: Product[] = productsData as Product[];

  // Extract unique destinations
  const allDestinations = useMemo(() => {
    const destinations = new Set<string>();
    products.forEach((p) => {
      p.destination.forEach((d) => destinations.add(d));
    });
    return Array.from(destinations).sort();
  }, [products]);

  // Filter products based on selected destination
  const filteredProducts = useMemo(() => {
    if (!selectedDestination) return products;
    return products.filter((p) => p.destination.includes(selectedDestination));
  }, [products, selectedDestination]);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <FilterBar 
        options={allDestinations} 
        selected={selectedDestination} 
        onChange={setSelectedDestination} 
      />

      <main className="container mx-auto px-4 pt-6 max-w-lg">
        {/* Organic Intro Text */}
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-sage-900 mb-2">
            Panen Hari Ini
          </h1>
          <p className="text-sage-500 text-sm">
            Sayuran dan hasil laut segar, diantar langsung dari petani dan nelayan lokal.
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                selectedDestination={selectedDestination} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-dashed border-2 border-sage-200">
            <p className="text-sage-500 font-medium">Belum ada produk untuk lokasi ini.</p>
          </div>
        )}
      </main>
    </div>
  );
}
