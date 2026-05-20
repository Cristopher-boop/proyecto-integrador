import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface AutocompleteProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({ options, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => opt.label.toLowerCase().includes(value.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          className="w-full border-b-2 outline-none px-9 py-1 font-bold text-slate-800"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      {isOpen && value.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-40 overflow-y-auto">
          {filtered.map((opt, i) => (
            <div key={i} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => { onChange(opt.value); setIsOpen(false); }}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};