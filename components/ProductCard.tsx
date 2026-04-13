'use client';

import { Product } from '@/types';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, ShoppingBag, LeafyGreen, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  selectedDestination: string;
}

export function ProductCard({ product, selectedDestination }: ProductCardProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getWhatsAppLink = () => {
    let message = `Halo PasaPagi, saya mau pesan ${product.name}.`;
    if (selectedDestination) {
      message += ` Untuk pengiriman ke ${selectedDestination}.`;
    }
    return `/api/whatsapp?text=${encodeURIComponent(message)}`;
  };

  const isAvailable = product.stockStatus !== 'Habis';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sage-100 flex flex-col hover:shadow-md transition-shadow">
      {/* Image Slider */}
      <div className="relative aspect-[4/3] bg-sage-50 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {product.images.map((img, idx) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full" key={idx}>
              <Image
                src={img}
                alt={`${product.name} - image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
          ))}
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stockStatus !== 'Tersedia' && (
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
              product.stockStatus === 'Stok Terbatas' 
                ? "bg-amber-100/90 text-amber-800" 
                : "bg-red-100/90 text-red-800"
            )}>
              {product.stockStatus}
            </span>
          )}
        </div>
        
        {/* Embla dots indicator could go here, but omitted for simplicity since swipe works */}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-bold text-lg leading-tight text-sage-900 mb-1">{product.name}</h3>
          <div className="flex items-end gap-1 mb-3">
            <span className="text-xl font-black text-sage-800">{formatPrice(product.pricePerKg)}</span>
            <span className="text-sm font-medium text-sage-400 mb-1">/ kg</span>
          </div>

          {/* Info Rows */}
          <div className="flex flex-col gap-2 text-sm text-sage-600">
            <div className="flex items-center gap-2">
              <LeafyGreen className="w-4 h-4 text-sage-400" />
              <span className="truncate">{product.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sage-400" />
              <span className="truncate line-clamp-1">
                Kirim ke: {product.destination.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-2">
          <a
            href={isAvailable ? getWhatsAppLink() : '#'}
            target={isAvailable ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98]",
              isAvailable 
                ? "bg-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-hover)] text-white shadow-sm shadow-[#25D366]/30"
                : "bg-sage-100 text-sage-400 cursor-not-allowed"
            )}
            onClick={(e) => {
              if (!isAvailable) e.preventDefault();
            }}
          >
            <Package className="w-5 h-5" />
            {isAvailable ? 'Order via WhatsApp' : 'Habis Terjual'}
          </a>
        </div>
      </div>
    </div>
  );
}
