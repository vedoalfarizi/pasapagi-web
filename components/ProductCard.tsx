'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, LeafyGreen, Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  selectedDestination: string;
}

export function ProductCard({ product, selectedDestination }: ProductCardProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  const formatPrice = (price: number | string) => {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (typeof price === 'number') return formatter.format(price);

    const parts = price.toString().split('-').map(p => p.trim());
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      return `${formatter.format(Number(parts[0]))} - ${formatter.format(Number(parts[1]))}`;
    }
    return price;
  };

  const getWhatsAppLink = () => {
    let message = `Halo PasaPagi, saya mau pesan ${product.name}.`;
    if (selectedDestination) {
      message += ` Untuk pengiriman ke ${selectedDestination}.`;
    }
    return `/api/whatsapp?text=${encodeURIComponent(message)}`;
  };

  const dynamicGroupLinks: Record<string, string | undefined> = {
    'Padang': process.env.NEXT_PUBLIC_WA_GROUP_PADANG,
    'Bukittinggi': process.env.NEXT_PUBLIC_WA_GROUP_BUKITTINGGI
  };

  const getWaGroupLink = () => {
    const link = dynamicGroupLinks[product.destination];
    if (link) return link;
    return `https://wa.me/${process.env.NEXT_PUBLIC_WA_PHONE || ''}?text=Halo, info pre-order produk PasaPagi area ${product.destination}`;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sage-100 flex flex-col hover:shadow-md transition-shadow">
      {/* Image Slider */}
      <div className="relative aspect-[4/3] bg-sage-50 overflow-hidden group" ref={emblaRef}>
        <div className="flex h-full">
          {product.images.map((img, idx) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-full" key={idx}>
              <Image
                src={img}
                alt={`${product.name} - image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
                priority={idx === 0}
              />
            </div>
          ))}
          {/* Fallback pattern if no images */}
          {product.images.length === 0 && (
            <div className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-sage-100">
              <Package className="w-12 h-12 text-sage-300" />
            </div>
          )}
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.stockStatus !== 'Tersedia' && (
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
              product.stockStatus === 'Segera Hadir'
                ? "bg-amber-100/90 text-amber-800"
                : "bg-sage-100/90 text-sage-600"
            )}>
              {product.stockStatus}
            </span>
          )}
        </div>

        {/* Embla dots indicator */}
        {scrollSnaps.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {scrollSnaps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex ? "w-4 bg-white shadow-sm" : "w-1.5 bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div>
          <h3 className="font-bold text-lg leading-tight text-sage-900 mb-1">{product.name}</h3>

          {product.stockStatus !== 'Habis' ? (
            <div className="flex items-end gap-1 mb-3">
              <span className="text-xl font-black text-sage-800">{formatPrice(product.pricePerKg)}</span>
              <span className="text-sm font-medium text-sage-400 mb-1">/ kg</span>
            </div>
          ) : (
            <div className="flex items-end gap-1 mb-3 opacity-60">
              <span className="text-lg font-semibold text-sage-400 line-through">
                {formatPrice(product.pricePerKg)}
              </span>
              <span className="text-xs font-medium text-sage-400 mb-1 ml-1">/ kg</span>
            </div>
          )}

          {/* Info Rows */}
          <div className="flex flex-col gap-2 text-sm text-sage-600">
            <div className="flex items-center gap-2">
              <LeafyGreen className="w-4 h-4 text-sage-400" />
              <span className="truncate">{product.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sage-400" />
              <span className="truncate line-clamp-1">
                Kirim ke: {product.destination}
              </span>
            </div>
            {product.stockStatus === 'Tersedia' && product.deliveryDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sage-400" />
                <span className="truncate line-clamp-1">
                  Pengiriman: {product.deliveryDate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Elements */}
        <div className="mt-auto pt-2">
          {product.stockStatus === 'Tersedia' && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] bg-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-hover)] text-white shadow-sm shadow-[#25D366]/30"
            >
              <Package className="w-5 h-5" />
              Order via WhatsApp
            </a>
          )}

          {product.stockStatus === 'Segera Hadir' && (
            <a
              href={getWaGroupLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30"
            >
              <Package className="w-5 h-5" />
              Pantau Stok di WhatsApp
            </a>
          )}

          {product.stockStatus === 'Habis' && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base bg-sage-100 text-sage-400 cursor-not-allowed"
            >
              <Package className="w-5 h-5" />
              Stok Habis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
