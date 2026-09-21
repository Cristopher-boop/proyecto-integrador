import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Importamos las flechas

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {

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
    <div className="py-2.5 px-4 border-t flex flex-col sm:flex-row justify-between items-center gap-2 bg-white dark:bg-[#1E3040] border-slate-200 dark:border-[#334759] transition-colors duration-200">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
        Mostrando {totalItems > 0 ? 1 + (currentPage - 1) * itemsPerPage : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
      </span>
      
      <div className="flex items-center gap-1">
        {/* Botón Inicio (<<) */}
        <button 
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-[#334759]" 
          title="Ir al inicio"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Botón Anterior (<) */}
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-[#334759] mr-2" 
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Números Dinámicos */}
        {getPageNumbers().map(page => (
          <button 
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              currentPage === page 
                ? 'bg-[#1E3040] text-white dark:bg-[#87C7FF] dark:text-[#0F1A24] shadow-xs' 
                : 'border border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#334759]'
            }`} 
          >
            {page}
          </button>
        ))}

        {/* Botón Siguiente (>) */}
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-[#334759] disabled:opacity-50 ml-2" 
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Botón Final (>>) */}
        <button 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-slate-200 dark:border-[#334759] text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-[#334759]" 
          title="Ir al final"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};