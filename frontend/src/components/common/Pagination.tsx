import React from 'react';
import { INAAQC_THEME } from '../../config/theme';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Importamos las flechas

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const adobe = INAAQC_THEME.palette;

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="p-4 border-t flex justify-between items-center bg-white" style={{ borderColor: '#e2e8f0' }}>
      <span className="text-xs font-bold" style={{ color: adobe.darkTint }}>
        Mostrando {totalItems > 0 ? 1 + (currentPage - 1) * itemsPerPage : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
      </span>
      
      <div className="flex items-center gap-1">
        {/* Botón Inicio (<<) */}
        <button 
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border transition-colors disabled:opacity-50 hover:bg-slate-50" 
          style={{ borderColor: '#e2e8f0', color: adobe.darkTint }}
          title="Ir al inicio"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Botón Anterior (<) */}
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border transition-colors disabled:opacity-50 hover:bg-slate-50 mr-2" 
          style={{ borderColor: '#e2e8f0', color: adobe.darkTint }}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Números Dinámicos */}
        {getPageNumbers().map(page => (
          <button 
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${currentPage === page ? 'shadow-sm' : 'border hover:bg-slate-50'}`} 
            style={{ 
              backgroundColor: currentPage === page ? adobe.base : 'transparent', 
              color: currentPage === page ? '#fff' : adobe.darkTint,
              borderColor: currentPage === page ? 'transparent' : '#e2e8f0'
            }}
          >
            {page}
          </button>
        ))}

        {/* Botón Siguiente (>) */}
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border transition-colors hover:bg-slate-50 disabled:opacity-50 ml-2" 
          style={{ borderColor: '#e2e8f0', color: adobe.darkTint }}
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón Final (>>) */}
        <button 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border transition-colors disabled:opacity-50 hover:bg-slate-50" 
          style={{ borderColor: '#e2e8f0', color: adobe.darkTint }}
          title="Ir al final"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};