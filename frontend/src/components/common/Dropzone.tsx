import React from 'react';
import { UploadCloud } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';
import { Button } from './Button'; 

interface DropzoneProps {
  title?: string;
  subtitle?: string;
  onFileSelect?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ 
  title = "Arrastra el PDF aquí", 
  subtitle = "Formatos soportados: PDF, JPG, PNG (Max 5MB)",
  onFileSelect
}) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
         style={{ borderColor: adobe.lightTint, backgroundColor: '#f8fafc' }}
         onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'hsl(208, 42%, 95%)'}
         onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
         onClick={onFileSelect}
    >
      <div className="p-4 rounded-full mb-4" style={{ backgroundColor: adobe.lightTint }}>
        <UploadCloud className="w-10 h-10" style={{ color: adobe.base }} />
      </div>
      <h3 className="text-lg font-bold" style={{ color: adobe.base }}>{title}</h3>
      <p className="text-sm mt-1 mb-6" style={{ color: adobe.midTint }}>{subtitle}</p>
      
      <Button variant="primary">Explorar Archivos</Button>
    </div>
  );
};