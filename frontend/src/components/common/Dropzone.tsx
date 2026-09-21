import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from './Button'; 

interface DropzoneProps {
  title?: string;
  subtitle?: string;
  onFilesDropped: (files: File[]) => void; 
}

export const Dropzone: React.FC<DropzoneProps> = ({ 
  title = "Arrastra tus archivos médicos aquí", 
  subtitle = "Soporta: PDF, JPG, PNG",
  onFilesDropped
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lógica Interna de Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(Array.from(e.target.files));
    }
  };

  return (
    <div 
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        dragActive 
          ? 'border-[#87C7FF] bg-[#9EBDD9]/20 dark:bg-[#87C7FF]/10' 
          : 'border-slate-300 dark:border-[#334759] bg-slate-50/50 dark:bg-[#15232F]/40 hover:bg-slate-100/50 dark:hover:bg-[#15232F]/70'
      }`}
    >
      <div className={`p-4 rounded-full mb-4 transition-colors ${dragActive ? 'bg-[#1E3040] text-white dark:bg-[#87C7FF] dark:text-[#0F1A24]' : 'bg-[#9EBDD9]/30 text-[#1E3040] dark:bg-[#87C7FF]/20 dark:text-[#87C7FF]'}`}>
        <UploadCloud className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-sm mt-1 mb-6 text-slate-500 dark:text-slate-400">{subtitle}</p>
      
      {/* Detenemos la propagación para que el clic del botón no dispare dos veces el input */}
      <Button variant="primary" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Explorar Archivos
      </Button>
      
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleChange} />
    </div>
  );
};