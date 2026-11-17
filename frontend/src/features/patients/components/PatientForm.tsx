import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';

interface PatientFormProps {
  initialData?: any; // Si viene con datos, es Edición. Si es null, es Creación.
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const adobe = INAAQC_THEME.palette;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dossier_erasme: '',
    dossier_mpi: '',
    fecha_nacimiento: '',
    sexo: 'M'
  });

  // Si nos pasan initialData (Edición), llenamos el formulario
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombres: initialData.nombres || '',
        apellidos: initialData.apellidos || '',
        dossier_erasme: initialData.dossier_erasme || '',
        dossier_mpi: initialData.dossier_mpi || '',
        fecha_nacimiento: initialData.fecha_nacimiento || '',
        sexo: initialData.sexo || 'M'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      alert("Error al guardar: " + (err.response?.data?.error || "Verifica los datos"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
      <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2" style={{ color: adobe.base, borderColor: '#e2e8f0' }}>
        <UserPlus className="w-5 h-5" style={{ color: adobe.midTint }} /> 
        {initialData ? 'Editar Perfil del Paciente' : 'Registrar Nuevo Paciente'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Nombres</label>
          <Input required value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Apellidos</label>
          <Input required value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Dossier Erasme</label>
          <Input required value={formData.dossier_erasme} onChange={e => setFormData({...formData, dossier_erasme: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Dossier MPI (Opcional)</label>
          <Input value={formData.dossier_mpi} onChange={e => setFormData({...formData, dossier_mpi: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Fecha de Nacimiento</label>
          <DatePicker 
            required 
            value={formData.fecha_nacimiento} 
            onChange={(date) => setFormData({...formData, fecha_nacimiento: date})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Sexo</label>
          <div className="relative">
            <select 
              className="w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 px-4 py-2 appearance-none cursor-pointer pr-10 transition-all"
              style={{ 
                backgroundColor: '#fff', 
                borderColor: '#e2e8f0', 
                color: adobe.base, 
                outlineColor: adobe.lightTint,
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234D6173' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
              value={formData.sexo} 
              onChange={e => setFormData({...formData, sexo: e.target.value})}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 mt-4 flex gap-3">
          <Button disabled={isSubmitting} type="submit" variant="primary" className="flex-1">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Guardar Cambios' : 'Registrar Paciente')}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary" className="px-8">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};