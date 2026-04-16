'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import type { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, LeafyGreen, Package, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  selectedDestination: string;
}

export type DerivedPhase = 'LOADING' | 'UPCOMING' | 'ACTIVE' | 'SOLD_OUT' | 'FINISHED';

const phaseBadgeLabels: Record<Exclude<DerivedPhase, 'ACTIVE' | 'LOADING'>, string> = {
  UPCOMING: 'Segera Hadir',
  SOLD_OUT: 'Stok Habis',
  FINISHED: 'PO Ditutup',
};

export function ProductCard({ product, selectedDestination }: ProductCardProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  const onInit = useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const frame = window.requestAnimationFrame(() => {
      onInit(emblaApi);
      onSelect(emblaApi);
    });

    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);

    return () => {
      window.cancelAnimationFrame(frame);
      emblaApi.off('reInit', onInit);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setNow(Date.now());
    });

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatPreOrderStart = (dateString: string) => {
    const date = new Date(dateString);
    const parts = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(date);

    const day = parts.find((part) => part.type === 'day')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const hour = parts.find((part) => part.type === 'hour')?.value;
    const minute = parts.find((part) => part.type === 'minute')?.value;

    if (!day || !month || !hour || !minute) {
      return 'Buka segera';
    }

    return `Pre-order akan dibuka pada ${day} ${month} pukul ${hour}:${minute}`;
  };

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

  const preOrderStartTime = new Date(product.preOrderStart).getTime();
  const preOrderEndTime = new Date(product.preOrderUntil).getTime();

  const getCurrentPhase = (): DerivedPhase => {
    if (!mounted) return 'LOADING';
    if (Number.isNaN(preOrderStartTime) || Number.isNaN(preOrderEndTime)) return 'FINISHED';
    if (now < preOrderStartTime) return 'UPCOMING';
    if (now > preOrderEndTime) return 'FINISHED';
    if (product.stockRemaining <= 0) return 'SOLD_OUT';
    return 'ACTIVE';
  };

  const phase = getCurrentPhase();
  const timeLeft = Math.max(0, preOrderEndTime - now);

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

  const shouldShowPhaseBadge = phase !== 'ACTIVE' && phase !== 'LOADING';
  const showInactivePrice = phase === 'SOLD_OUT';

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
          {shouldShowPhaseBadge && (
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
              phase === 'UPCOMING'
                ? "bg-amber-100/90 text-amber-800"
                : phase === 'SOLD_OUT'
                  ? "bg-orange-100/90 text-orange-800"
                  : "bg-sage-100/90 text-sage-700"
            )}>
              {phaseBadgeLabels[phase]}
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

          {!showInactivePrice ? (
            <div className="flex items-end gap-1 mb-3">
              <span className="text-xl font-black text-sage-800">{formatPrice(product.pricePerKg)}</span>
              <span className="text-sm font-medium text-sage-400 mb-1">/ kg</span>
              {typeof product.pricePerKg === 'string' && (
                <div className="relative group mb-1 ml-0.5">
                  <Info className="w-3.5 h-3.5 text-sage-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 px-2.5 py-1.5 rounded-lg bg-sage-800 text-white text-xs font-medium text-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    Mengikuti harga pasar saat pre-order dibuka
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sage-800" />
                  </div>
                </div>
              )}
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
            {phase === 'ACTIVE' && product.deliveryDate && (
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
          {/* FOMO Stock Scarcity */}
          {phase === 'ACTIVE' && (
            <div className="mb-2.5 px-0.5 text-center">
               <span className={cn(
                 "text-sm font-black", 
                 product.stockRemaining <= 5 ? "text-orange-500 animate-pulse" : "text-sage-600"
               )}>
                 Sisa {product.stockRemaining} kg lagi!
               </span>
            </div>
          )}

          {phase === 'LOADING' && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-bold text-sage-500 bg-sage-50 py-2 rounded-xl border border-sage-100 shadow-sm">
                Status pre-order: <span className="font-mono tracking-wider text-sm ml-1">--:--</span>
              </div>
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base bg-sage-100 text-sage-400 cursor-not-allowed"
              >
                <Package className="w-5 h-5" />
                Memuat status
              </button>
            </div>
          )}

          {phase === 'UPCOMING' && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-bold text-amber-800 bg-amber-50 py-2 rounded-xl border border-amber-100 shadow-sm">
                {formatPreOrderStart(product.preOrderStart)}
              </div>
              <a
                href={getWaGroupLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/30"
              >
                <Package className="w-5 h-5" />
                Pantau Stok di WhatsApp
              </a>
            </div>
          )}

          {phase === 'ACTIVE' && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-bold text-sage-600 bg-sage-50 py-2 rounded-xl border border-sage-100 shadow-sm">
                ⏳ PO Berakhir Dalam: <span className="font-mono text-sage-900 tracking-wider text-sm ml-1">{formatTime(timeLeft)}</span>
              </div>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] bg-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-hover)] text-white shadow-sm shadow-[#25D366]/30"
              >
                <Package className="w-5 h-5" />
                Order via WhatsApp
              </a>
            </div>
          )}

          {phase === 'SOLD_OUT' && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-bold text-orange-700 bg-orange-50 py-2 rounded-xl border border-orange-100 shadow-sm">
                Stok habis untuk periode pre-order ini.
              </div>
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-base bg-sage-100 text-sage-400 cursor-not-allowed"
              >
                <Package className="w-5 h-5" />
                Stok Habis
              </button>
            </div>
          )}

          {phase === 'FINISHED' && (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-bold text-sage-700 bg-sage-50 py-2 rounded-xl border border-sage-100 shadow-sm">
                PO Ditutup
              </div>
              <a
                href={getWaGroupLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-[0.98] bg-sage-600 hover:bg-sage-700 text-white shadow-sm shadow-sage-600/30"
              >
                <Package className="w-5 h-5" />
                Dapatkan info PO berikutnya di WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
