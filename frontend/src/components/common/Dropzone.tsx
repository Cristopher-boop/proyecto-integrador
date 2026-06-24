import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';
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
  const adobe = INAAQC_THEME.palette;
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
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-400' : 'border-slate-300'}`}
      style={{ 
        borderColor: dragActive ? adobe.base : adobe.lightTint, 
        backgroundColor: dragActive ? 'hsl(208, 42%, 95%)' : '#f8fafc' 
      }}
      onMouseOver={(e) => !dragActive && (e.currentTarget.style.backgroundColor = 'hsl(208, 42%, 95%)')}
      onMouseOut={(e) => !dragActive && (e.currentTarget.style.backgroundColor = '#f8fafc')}
    >
      <div className="p-4 rounded-full mb-4 transition-colors" style={{ backgroundColor: dragActive ? adobe.base : adobe.lightTint }}>
        <UploadCloud className="w-10 h-10 transition-colors" style={{ color: dragActive ? '#fff' : adobe.base }} />
      </div>
      <h3 className="text-lg font-bold" style={{ color: adobe.base }}>{title}</h3>
      <p className="text-sm mt-1 mb-6" style={{ color: adobe.midTint }}>{subtitle}</p>
      
      {/* Detenemos la propagación para que el clic del botón no dispare dos veces el input */}
      <Button variant="primary" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Explorar Archivos
      </Button>
      
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleChange} />
    </div>
  );
};