'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import productsData from '@/data/products.json';
import { Product } from '@/types';

const CITIES: Record<string, { lat: number, lon: number }> = {
  Padang: { lat: -0.9471, lon: 100.3658 },
  Bukittinggi: { lat: -0.3055, lon: 100.3692 }
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export default function Home() {
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  
  const products: Product[] = productsData as Product[];

  // Extract unique destinations
  const allDestinations = useMemo(() => {
    const destinations = new Set<string>();
    products.forEach((p) => {
      if (p.destination) destinations.add(p.destination);
    });
    return Array.from(destinations).sort();
  }, [products]);

  // Filter products based on selected destination
  const filteredProducts = useMemo(() => {
    if (!selectedDestination) return products;
    return products.filter((p) => p.destination === selectedDestination);
  }, [products, selectedDestination]);

  // Geolocation auto-detect effect
  useEffect(() => {
    if (!navigator.geolocation || selectedDestination !== '') return;

    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      
      let closestCity = '';
      let minDistance = Infinity;

      for (const [city, coords] of Object.entries(CITIES)) {
        const dist = getDistanceFromLatLonInKm(userLat, userLon, coords.lat, coords.lon);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      }

      if (closestCity) {
        setSelectedDestination(closestCity);
        setIsAutoDetected(true);
      }
    }, (error) => {
      console.warn("Geolocation skipped or error:", error);
    });
  }, [selectedDestination]);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <FilterBar 
        options={allDestinations} 
        selected={selectedDestination} 
        onChange={(val) => {
          setSelectedDestination(val);
          setIsAutoDetected(false); // Manual pick clears the badge
        }} 
        isAutoDetected={isAutoDetected}
      />

      <main className="container mx-auto px-4 pt-6 max-w-lg">
        {/* Organic Intro Text */}
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-sage-900 mb-2">
            Panen Hari Ini
          </h1>
          <p className="text-sage-500 text-sm">
            Sayuran dan hasil laut segar dengan kualitas terbaik yang diantar langsung dari petani dan nelayan lokal.
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
