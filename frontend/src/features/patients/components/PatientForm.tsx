import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';

interface PatientFormProps {
  initialData?: any; // Si viene con datos, es Edición. Si es null, es Creación.
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dossier_erasme: '',
    dossier_mpi: '',
    fecha_nacimiento: '',
    sexo: 'M'
  });

  const todayStr = new Date().toISOString().split('T')[0];

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
    setErrorMsg(null);

    const nombres = formData.nombres.trim();
    const apellidos = formData.apellidos.trim();
    const dossier_erasme = formData.dossier_erasme.trim();
    const dossier_mpi = formData.dossier_mpi.trim();

    if (nombres.length < 2) {
      setErrorMsg('El nombre debe contener al menos 2 caracteres.');
      return;
    }
    if (apellidos.length < 2) {
      setErrorMsg('Los apellidos deben contener al menos 2 caracteres.');
      return;
    }
    if (dossier_erasme.length < 2 || dossier_erasme.length > 20) {
      setErrorMsg('El Dossier Erasme debe tener entre 2 y 20 caracteres.');
      return;
    }
    if (dossier_mpi && dossier_mpi.length > 20) {
      setErrorMsg('El Dossier MPI no puede superar los 20 caracteres.');
      return;
    }
    if (!formData.fecha_nacimiento) {
      setErrorMsg('La fecha de nacimiento es obligatoria.');
      return;
    }
    if (formData.fecha_nacimiento > todayStr) {
      setErrorMsg('La fecha de nacimiento no puede ser en el futuro.');
      return;
    }
    const birthYear = Number(formData.fecha_nacimiento.split('-')[0]);
    if (birthYear < 1900) {
      setErrorMsg('El año de nacimiento no puede ser anterior a 1900.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        nombres,
        apellidos,
        dossier_erasme,
        dossier_mpi: dossier_mpi || null,
      });
    } catch (err: any) {
      const resData = err.response?.data;
      if (typeof resData === 'object' && resData !== null) {
        const messages = Object.entries(resData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : String(val)}`)
          .join(' | ');
        setErrorMsg(messages || 'Error al guardar el paciente. Verifique los datos.');
      } else {
        setErrorMsg(err.response?.data?.error || 'Error al guardar el paciente. Verifique los datos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E3040] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#334759] animate-in fade-in slide-in-from-top-4 transition-colors duration-200">
      <h3 className="text-lg font-bold border-b border-slate-200 dark:border-[#334759] pb-3 mb-4 flex items-center gap-2 text-[#1E3040] dark:text-[#F1F5F9]">
        <UserPlus className="w-5 h-5 text-[#4D6173] dark:text-[#87C7FF]" /> 
        {initialData ? 'Editar Perfil del Paciente' : 'Registrar Nuevo Paciente'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {errorMsg && (
          <div className="md:col-span-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Nombres</label>
          <Input 
            required 
            placeholder="Ej: Jean" 
            value={formData.nombres} 
            onChange={e => setFormData({...formData, nombres: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Apellidos</label>
          <Input 
            required 
            placeholder="Ej: Dupont" 
            value={formData.apellidos} 
            onChange={e => setFormData({...formData, apellidos: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Dossier Erasme</label>
          <Input 
            required 
            maxLength={20}
            placeholder="Ej: 80004512" 
            value={formData.dossier_erasme} 
            onChange={e => setFormData({...formData, dossier_erasme: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Dossier MPI (Opcional)</label>
          <Input 
            maxLength={20}
            placeholder="Ej: MPI-908123" 
            value={formData.dossier_mpi} 
            onChange={e => setFormData({...formData, dossier_mpi: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Fecha de Nacimiento</label>
          <DatePicker 
            required 
            maxDate={todayStr}
            minDate="1900-01-01"
            value={formData.fecha_nacimiento} 
            onChange={(date) => setFormData({...formData, fecha_nacimiento: date})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Sexo</label>
          <div className="relative">
            <select 
              className="w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#87C7FF]/40 focus:border-[#87C7FF] px-4 py-2 appearance-none cursor-pointer pr-10 transition-all bg-white dark:bg-[#15232F] border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100"
              style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2387C7FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
              value={formData.sexo} 
              onChange={e => setFormData({...formData, sexo: e.target.value})}
            >
              <option value="M" className="bg-white dark:bg-[#1E3040] text-slate-800 dark:text-slate-100">Masculino</option>
              <option value="F" className="bg-white dark:bg-[#1E3040] text-slate-800 dark:text-slate-100">Femenino</option>
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