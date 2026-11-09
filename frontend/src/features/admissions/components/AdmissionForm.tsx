import React, { useState, useEffect } from 'react';
import { Stethoscope, Loader2, Clock, AlertCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
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
    setErrorMsg(null);

    const numero_episodio = formData.numero_episodio.trim();
    if (!numero_episodio) {
      setErrorMsg('El número de episodio es obligatorio.');
      return;
    }
    if (numero_episodio.length > 9) {
      setErrorMsg('El número de episodio no puede superar 9 caracteres (ej: EP-2026-1 o FP-2000).');
      return;
    }

    if (!formData.paciente) {
      setErrorMsg('Debe seleccionar un paciente de la lista.');
      return;
    }

    const cama_sala = formData.cama_sala.trim();
    if (!cama_sala) {
      setErrorMsg('La sala o cama es obligatoria.');
      return;
    }
    if (cama_sala.length > 50) {
      setErrorMsg('La sala o cama no puede superar 50 caracteres.');
      return;
    }

    if (!formData.fecha_ingreso_date || !formData.fecha_ingreso_time) {
      setErrorMsg('Debe ingresar tanto la fecha como la hora de ingreso.');
      return;
    }

    // Validar que la fecha de ingreso no sea anterior al nacimiento del paciente
    const selectedPx = pacientes.find((p) => p.id_paciente === formData.paciente);
    if (selectedPx?.fecha_nacimiento && formData.fecha_ingreso_date < selectedPx.fecha_nacimiento) {
      setErrorMsg(`La fecha de ingreso no puede ser anterior al nacimiento del paciente (${selectedPx.fecha_nacimiento}).`);
      return;
    }

    // Validar rango fisiológico de peso
    const peso = parseFloat(String(formData.peso_ingreso_kg));
    if (isNaN(peso) || peso <= 0 || peso > 500) {
      setErrorMsg('El peso de ingreso debe ser un número válido entre 0.5 y 500 kg.');
      return;
    }

    // Validar rango fisiológico de talla
    const talla = parseFloat(String(formData.talla_ingreso_cm));
    if (isNaN(talla) || talla <= 0 || talla > 260) {
      setErrorMsg('La talla de ingreso debe ser un número válido entre 20 y 260 cm.');
      return;
    }

    setIsSubmitting(true);
    try { 
      // Juntamos el Día y la Hora en el formato exacto que exige Django (ISO 8601)
      const payload = {
        numero_episodio,
        paciente: formData.paciente,
        cama_sala,
        fecha_ingreso: `${formData.fecha_ingreso_date}T${formData.fecha_ingreso_time}:00`,
        peso_ingreso_kg: peso.toFixed(2),
        talla_ingreso_cm: talla.toFixed(2)
      };
      await onSubmit(payload); 
    } 
    catch (err: any) { 
      const resData = err.response?.data;
      if (typeof resData === 'object' && resData !== null) {
        const messages = Object.entries(resData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : String(val)}`)
          .join(' | ');
        setErrorMsg(messages || 'Error al guardar la admisión. Verifique los datos.');
      } else {
        setErrorMsg(err.response?.data?.error || 'Error al guardar la admisión. Verifique los datos.');
      }
    } 
    finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E3040] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-[#334759] animate-in fade-in slide-in-from-top-4 transition-colors duration-200">
      <h3 className="text-lg font-bold border-b border-slate-200 dark:border-[#334759] pb-3 mb-4 flex items-center gap-2 text-[#1E3040] dark:text-[#F1F5F9]">
        <Stethoscope className="w-5 h-5 text-[#4D6173] dark:text-[#87C7FF]" /> 
        {initialData ? 'Editar Episodio' : 'Registrar Nueva Admisión'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {errorMsg && (
          <div className="md:col-span-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Episodio (Máx. 9 caracteres)</label>
          <Input 
            required 
            maxLength={9}
            placeholder="Ej: EP-2026-1" 
            value={formData.numero_episodio} 
            onChange={e => setFormData({...formData, numero_episodio: e.target.value})} 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Paciente</label>
          <div className="relative">
            <select 
              required
              className="w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#87C7FF]/40 focus:border-[#87C7FF] px-4 py-2 appearance-none cursor-pointer pr-10 transition-all bg-white dark:bg-[#15232F] border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100"
              style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2387C7FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px'
              }}
              value={formData.paciente} 
              onChange={e => setFormData({...formData, paciente: e.target.value})}
            >
              <option value="" disabled className="bg-white dark:bg-[#1E3040] text-slate-400">Seleccione un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente} className="bg-white dark:bg-[#1E3040] text-slate-800 dark:text-slate-100">
                  {p.nombres} {p.apellidos} - {p.dossier_erasme}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Sala / Cama</label>
          <Input 
            required 
            maxLength={50}
            placeholder="Ej: UCI - Cama 4" 
            value={formData.cama_sala} 
            onChange={e => setFormData({...formData, cama_sala: e.target.value})} 
          />
        </div>
        
        {/* COMPONENTE COMPUESTO: FECHA Y HORA COMPARTEN UNA CELDA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Fecha de Ingreso</label>
            <DatePicker 
              required 
              value={formData.fecha_ingreso_date} 
              onChange={(date) => setFormData({...formData, fecha_ingreso_date: date})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Hora</label>
            <Input 
              type="time" 
              icon={<Clock className="w-4 h-4" />} 
              required 
              value={formData.fecha_ingreso_time} 
              onChange={e => setFormData({...formData, fecha_ingreso_time: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Peso (kg)</label>
          <Input 
            type="number" 
            step="0.1" 
            min="0.5"
            max="500"
            required 
            placeholder="Ej: 75.5" 
            value={formData.peso_ingreso_kg} 
            onChange={e => setFormData({...formData, peso_ingreso_kg: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-[#334759] dark:text-slate-300">Talla (cm)</label>
          <Input 
            type="number" 
            step="0.5"
            min="20"
            max="260"
            required 
            placeholder="Ej: 175" 
            value={formData.talla_ingreso_cm} 
            onChange={e => setFormData({...formData, talla_ingreso_cm: e.target.value})} 
          />
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