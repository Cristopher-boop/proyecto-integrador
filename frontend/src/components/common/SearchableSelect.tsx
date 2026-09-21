import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';

export interface SearchableOption {
  value: string;
  label: string;
  secondary?: string;
  badge?: string;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  size?: 'sm' | 'md';
  showClear?: boolean;
  dropdownWidth?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opción...',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  className = '',
  icon,
  searchable = true,
  size = 'md',
  showClear = true,
  dropdownWidth,
}) => {
  const adobe = INAAQC_THEME.palette;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar teclado (Escape para cerrar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Enfocar input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Opción seleccionada actualmente
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filtrado de opciones en tiempo real
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const lowerQuery = query.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(lowerQuery);
      const matchSecondary = opt.secondary ? opt.secondary.toLowerCase().includes(lowerQuery) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(lowerQuery) : false;
      return matchLabel || matchSecondary || matchBadge;
    });
  }, [options, query]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border text-left font-bold transition-all outline-none bg-white ${
          size === 'sm' ? 'px-2.5 py-1.5 rounded-lg text-xs' : 'px-3.5 py-2.5 rounded-xl text-xs sm:text-sm'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-slate-300'
        }`}
        style={{
          borderColor: isOpen ? adobe.highlight : '#e2e8f0',
          boxShadow: isOpen ? `0 0 0 3px ${adobe.highlight}20` : 'none',
          color: adobe.base,
        }}
      >
        <div className="flex items-center gap-2 truncate flex-1 mr-1">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          {selectedOption ? (
            <div className="truncate flex items-center gap-1.5">
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#9EBDD9]/40 text-[#1E3040] border border-[#9FB0BF] shrink-0">
                  {selectedOption.badge}
                </span>
              )}
              {selectedOption.secondary && (
                <span className="text-xs font-normal text-slate-400 truncate hidden sm:inline">
                  • {selectedOption.secondary}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && showClear && (
            <span
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              title="Limpiar selección"
            >
              <X size={size === 'sm' ? 12 : 13} />
            </span>
          )}
          <ChevronDown
            size={size === 'sm' ? 14 : 16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1E3040]' : ''}`}
          />
        </div>
      </button>

      {/* DROPDOWN FLOTANTE */}
      {isOpen && (
        <div className={`absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up ${
          dropdownWidth ? dropdownWidth : 'w-full min-w-full'
        }`}>
          {/* BARRA DE BÚSQUEDA INTERNA */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs font-medium border border-slate-200 rounded-lg outline-none bg-white text-slate-800 placeholder-slate-400 focus:border-[#87C7FF] transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* LISTA DE OPCIONES */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {query ? `No se encontraron opciones para "${query}"` : 'No hay opciones disponibles'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2'
                    } ${
                      isSelected
                        ? 'bg-[#9EBDD9]/30 text-[#1E3040] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold">{opt.label}</span>
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-[#1E3040] border border-slate-200/80 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.secondary && (
                        <span className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                          {opt.secondary}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-[#1E3040]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
