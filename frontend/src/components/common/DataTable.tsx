import type { ReactNode } from 'react';
import { ArrowUpDown } from 'lucide-react';

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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-[#15232F] border-b border-slate-200 dark:border-[#334759] transition-colors">
            {columns.map((col, index) => (
              <th 
                key={index}
                className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#334759] dark:text-slate-300 ${col.sortable ? 'cursor-pointer group select-none' : ''} text-${col.align || 'left'} ${col.width || ''}`} 
                onClick={() => col.sortable && col.accessorKey && onSort && onSort(col.accessorKey)}
              >
                {col.header}
                {col.sortable && (
                  <ArrowUpDown className={`w-3 h-3 inline-block ml-1 transition-colors ${sortConfig?.key === col.accessorKey ? 'text-[#1E3040] dark:text-[#87C7FF]' : 'text-slate-300 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-100 dark:border-[#334759]/40 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#334759]/30">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`py-2.5 px-4 text-${col.align || 'left'} text-slate-700 dark:text-slate-200`}>
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