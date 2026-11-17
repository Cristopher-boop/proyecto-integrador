import React, { useState, useEffect } from 'react';
import { Stethoscope, Loader2, Clock } from 'lucide-react'; // Importamos el Reloj
import { INAAQC_THEME } from '../../../config/theme';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { DatePicker } from '../../../components/common/DatePicker';

interface AdmissionFormProps {
  initialData?: any;
  pacientes: any[]; 
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const AdmissionForm: React.FC<AdmissionFormProps> = ({ initialData, pacientes, onSubmit, onCancel }) => {
  const adobe = INAAQC_THEME.palette;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dividimos la fecha en dos variables para que la UI sea fácil de usar
  const [formData, setFormData] = useState({
    numero_episodio: '',
    paciente: '', 
    cama_sala: '',
    fecha_ingreso_date: '', // Solo la fecha (YYYY-MM-DD)
    fecha_ingreso_time: '', // Solo la hora (HH:mm)
    peso_ingreso_kg: '',  
    talla_ingreso_cm: ''  
  });

  useEffect(() => {
    let initDate = '';
    let initTime = '';

    if (initialData && initialData.fecha_ingreso) {
      // Si estamos editando, separamos la fecha de Django en Día y Hora
      const dateObj = new Date(initialData.fecha_ingreso);
      if (!isNaN(dateObj.getTime())) {
        initDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        initTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
      }
    } else {
      // MAGIA UX: Si es un registro nuevo, autocompletamos con el instante exacto actual
      const now = new Date();
      initDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      initTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    setFormData({
      numero_episodio: initialData?.numero_episodio || '',
      paciente: initialData?.paciente || '',
      cama_sala: initialData?.cama_sala || '',
      fecha_ingreso_date: initDate,
      fecha_ingreso_time: initTime,
      peso_ingreso_kg: initialData?.peso_ingreso_kg || '',
      talla_ingreso_cm: initialData?.talla_ingreso_cm || ''
    });
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try { 
      // Juntamos el Día y la Hora en el formato exacto que exige Django (ISO 8601)
      const payload = {
        numero_episodio: formData.numero_episodio,
        paciente: formData.paciente,
        cama_sala: formData.cama_sala,
        fecha_ingreso: `${formData.fecha_ingreso_date}T${formData.fecha_ingreso_time}:00`,
        peso_ingreso_kg: formData.peso_ingreso_kg,
        talla_ingreso_cm: formData.talla_ingreso_cm
      };
      await onSubmit(payload); 
    } 
    catch (err: any) { alert("Error al guardar: Verifica los datos"); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
      <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2" style={{ color: adobe.base, borderColor: '#e2e8f0' }}>
        <Stethoscope className="w-5 h-5" style={{ color: adobe.midTint }} /> 
        {initialData ? 'Editar Episodio' : 'Registrar Nueva Admisión'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Episodio</label>
          <Input required placeholder="Ej: EP-2026-001" value={formData.numero_episodio} onChange={e => setFormData({...formData, numero_episodio: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Paciente</label>
          <div className="relative">
            <select 
              required
              className="w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 px-4 py-2 appearance-none cursor-pointer pr-10 transition-all"
              style={{ 
                backgroundColor: '#fff', borderColor: '#e2e8f0', color: adobe.base, outlineColor: adobe.lightTint,
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234D6173' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px'
              }}
              value={formData.paciente} 
              onChange={e => setFormData({...formData, paciente: e.target.value})}
            >
              <option value="" disabled>Seleccione un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombres} {p.apellidos} - {p.dossier_erasme}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Sala / Cama</label>
          <Input required placeholder="Ej: UCI - Cama 4" value={formData.cama_sala} onChange={e => setFormData({...formData, cama_sala: e.target.value})} />
        </div>
        
        {/* COMPONENTE COMPUESTO: FECHA Y HORA COMPARTEN UNA CELDA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Fecha de Ingreso</label>
            <DatePicker required value={formData.fecha_ingreso_date} onChange={(date) => setFormData({...formData, fecha_ingreso_date: date})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Hora</label>
            <Input type="time" icon={<Clock className="w-4 h-4" />} required value={formData.fecha_ingreso_time} onChange={e => setFormData({...formData, fecha_ingreso_time: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Peso (kg)</label>
          <Input type="number" step="0.1" required placeholder="Ej: 75.5" value={formData.peso_ingreso_kg} onChange={e => setFormData({...formData, peso_ingreso_kg: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: adobe.darkTint }}>Talla (cm)</label>
          <Input type="number" required placeholder="Ej: 175" value={formData.talla_ingreso_cm} onChange={e => setFormData({...formData, talla_ingreso_cm: e.target.value})} />
        </div>

        <div className="md:col-span-2 mt-4 flex gap-3">
          <Button disabled={isSubmitting} type="submit" variant="primary" className="flex-1">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Guardar Cambios' : 'Registrar Admisión')}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary" className="px-8">Cancelar</Button>
        </div>
      </form>
    </div>
  );
};