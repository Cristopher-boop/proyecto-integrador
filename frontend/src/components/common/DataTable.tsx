import React, { ReactNode } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string; // <--- NUEVO: Permite fijar el tamaño de la columna
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: keyof T) => void;
  sortConfig?: { key: keyof T; direction: 'asc' | 'desc' } | null;
}

export function DataTable<T>({ data, columns, onSort, sortConfig }: DataTableProps<T>) {
  const adobe = INAAQC_THEME.palette;

  return (
    // ELIMINAMOS el pb-24 y el min-h-[300px] que causaba el hueco gigante
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b" style={{ borderColor: '#e2e8f0' }}>
            {columns.map((col, index) => (
              <th 
                key={index}
                // Aplicamos el 'width' que le pasemos por configuración
                className={`p-4 text-xs font-bold uppercase tracking-wider ${col.sortable ? 'cursor-pointer group' : ''} text-${col.align || 'left'} ${col.width || ''}`} 
                style={{ color: adobe.darkTint }}
                onClick={() => col.sortable && col.accessorKey && onSort && onSort(col.accessorKey)}
              >
                {col.header}
                {col.sortable && (
                  <ArrowUpDown className={`w-3 h-3 inline-block ml-1 transition-colors ${sortConfig?.key === col.accessorKey ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b transition-colors hover:bg-slate-50" style={{ borderColor: '#f1f5f9' }}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`p-4 text-${col.align || 'left'}`}>
                  {col.render ? col.render(row) : (row[col.accessorKey as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}