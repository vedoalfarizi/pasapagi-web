import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function FilterBar({ options, selected, onChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-sage-100 shadow-sm sticky top-16 z-40">
      <div className="container mx-auto px-4 py-3 max-w-lg">
        <div className="flex items-center gap-3">
          <div className="bg-sage-50 p-2 rounded-full text-sage-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-sage-500 mb-0.5">Dikirim ke:</p>
            <select
              value={selected}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "w-full bg-transparent text-sm font-semibold text-sage-900",
                "focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              )}
            >
              <option value="">Semua Lokasi / Pilih Tujuan</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
