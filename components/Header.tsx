
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-sage-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-lg">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-sage-200/50">
            <Image src="/images/icon.webp" alt="PasaPagi Logo" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tight text-sage-900">PasaPagi</span>
        </Link>
        <div className="text-xs font-medium text-sage-500 bg-sage-50 px-3 py-1 rounded-full border border-sage-100">
          Fresh & High Quality
        </div>
      </div>
    </header>
  );
}
