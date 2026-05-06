import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, Loader2, AlertCircle, FileText, ChevronDown, Network, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';

interface Admision {
  id_admision: string;
  numero_episodio: string;
  paciente_nombre?: string;
}

interface Diagnosis {
  name: string;
  probability: number;
  severity: 'high' | 'medium' | 'low';
  factors: string[];
}

const NeuralPrototype: React.FC = () => {
  const [admisiones, setAdmisiones] = useState<Admision[]>([]);
  const [selectedAdmision, setSelectedAdmision] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[] | null>(null);
  const [error, setError] = useState('');

  // Cargar admisiones
  useEffect(() => {
    const fetchAdmisiones = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [pacientesRes, admisionesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/patients/', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/v1/patients/admisiones/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const admisionesConNombre = admisionesRes.data.map((a: any) => {
          const px = pacientesRes.data.find((p: any) => p.id_paciente === a.paciente);
          return { ...a, paciente_nombre: px ? `${px.nombres} ${px.apellidos}` : 'Desconocido' };
        });
        setAdmisiones(admisionesConNombre);
      } catch (err) {
        setError('No se pudo cargar la lista de episodios.');
      }
    };
    fetchAdmisiones();
  }, []);

  // --- SIMULACIÓN DEL MOTOR DE INFERENCIA NEURONAL ---
  const runNeuralNetwork = async () => {
    if (!selectedAdmision) return;
    
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setDiagnoses(null);
    setError('');

    const addLog = (msg: string, delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setAnalysisLogs(prev => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    try {
      const token = localStorage.getItem('accessToken');
      
      // 1. Extracción de Datos
      await addLog("> Extrayendo historial longitudinal del paciente...", 500);
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/observaciones/admision/${selectedAdmision}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = response.data;
      await addLog(`> ${data.length} vectores biomédicos encontrados.`, 800);

      if (data.length === 0) {
        await addLog("> ERROR: Insuficientes datos para inferencia. Proceso abortado.", 500);
        setIsAnalyzing(false);
        return;
      }

      // 2. Preprocesamiento (Simulado)
      await addLog("> Normalizando tensores de entrada (VIT, LAB, GLAS, PUL)...", 1200);
      await addLog("> Activando capas ocultas (Perceptrón Multicapa)...", 1500);
      await addLog("> Cruzando patrones con base de datos clínica...", 1800);

      // 3. Heurística (El "Cerebro" del Prototipo)
      // Aquí el prototipo lee los datos reales y adivina el diagnóstico
      const mockDiagnoses: Diagnosis[] = [];
      let phVal = data.find((d: any) => d.parametro.toLowerCase() === 'ph')?.valor_numerico;
      let hrVal = data.find((d: any) => d.parametro.toLowerCase().includes('frecuencia'))?.valor_numerico;
      let lacVal = data.find((d: any) => d.parametro.toLowerCase().includes('lactato'))?.valor_numerico;

      await addLog("> Calculando pesos sinápticos y probabilidades...", 2000);

      // Lógica Condicional del Prototipo
      if (phVal && parseFloat(phVal) < 7.35) {
        mockDiagnoses.push({
          name: 'Acidosis Metabólica / Respiratoria',
          probability: 87.5,
          severity: 'high',
          factors: [`pH detectado en ${phVal} (Por debajo de 7.35)`]
        });
      }

      if (hrVal && parseFloat(hrVal) > 100) {
        const factors = [`Frecuencia cardíaca elevada (${hrVal} bpm)`];
        if (lacVal && parseFloat(lacVal) > 2.0) factors.push(`Lactato elevado (${lacVal} mmol/L)`);
        
        mockDiagnoses.push({
          name: parseFloat(lacVal) > 2.0 ? 'Sepsis Temprana' : 'Taquicardia Sinusal',
          probability: parseFloat(lacVal) > 2.0 ? 92.1 : 65.4,
          severity: parseFloat(lacVal) > 2.0 ? 'high' : 'medium',
          factors: factors
        });
      }

      if (mockDiagnoses.length === 0) {
        mockDiagnoses.push({
          name: 'Paciente Estable / Sin anomalías críticas',
          probability: 98.2,
          severity: 'low',
          factors: ['Parámetros vitales y laboratorios dentro del rango de normalidad']
        });
      }

      await addLog("> Convergencia alcanzada. Resultados listos.", 1000);
      setDiagnoses(mockDiagnoses);

    } catch (err) {
      await addLog("> ERROR FATAL EN EL NÚCLEO DE INFERENCIA.", 500);
      setError('Fallo al conectar con el servidor.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <BrainCircuit className="text-indigo-600 w-8 h-8" />
            Motor de Inferencia Neuronal <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200 ml-2">PROTOTIPO v1.0</span>
          </h2>
          <p className="text-slate-500 font-medium">Reconocimiento de patrones y clasificación automática de diagnósticos.</p>
        </div>
        
        <div className="w-full md:w-96">
          <select 
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold p-3 rounded-xl focus:border-indigo-600 outline-none transition-all"
            value={selectedAdmision}
            onChange={(e) => { setSelectedAdmision(e.target.value); setDiagnoses(null); setAnalysisLogs([]); }}
          >
            <option value="">Seleccionar Episodio Clínico...</option>
            {admisiones.map(a => (
              <option key={a.id_admision} value={a.id_admision}>{a.numero_episodio} - {a.paciente_nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-900 p-4 rounded text-red-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* ÁREA DE TRABAJO */}
      {!selectedAdmision ? (
        <div className="bg-white p-16 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <Network className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">Selecciona un episodio para alimentar la red neuronal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TERMINAL DE PROCESAMIENTO */}
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 p-6 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Activity className="text-indigo-400 w-5 h-5" />
                Terminal Neuronal
              </h3>
            </div>

            <div className="flex-1 bg-black/50 rounded-xl p-4 overflow-y-auto font-mono text-xs text-emerald-400 space-y-2 border border-slate-800/50">
              {analysisLogs.length === 0 && !isAnalyzing && (
                <span className="text-slate-600">Esperando inicialización del motor...</span>
              )}
              {analysisLogs.map((log, idx) => (
                <div key={idx} className="animate-fade-in-up">{log}</div>
              ))}
              {isAnalyzing && (
                <div className="flex items-center gap-2 mt-4 text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                </div>
              )}
            </div>

            <button 
              onClick={runNeuralNetwork}
              disabled={isAnalyzing}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
              {isAnalyzing ? 'Red Activa...' : 'Iniciar Escaneo de Patrones'}
            </button>
          </div>

          {/* PANEL DE RESULTADOS (DIAGNÓSTICOS) */}
          <div className="lg:col-span-2">
            {!diagnoses ? (
              <div className="h-full bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[500px]">
                <ShieldAlert className="w-16 h-16 opacity-20 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">Sin Diagnósticos Activos</h3>
                <p className="text-sm">Inicia el motor neuronal para analizar el historial biomédico y sugerir patologías.</p>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 min-h-[500px] space-y-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                  Diagnósticos Sugeridos (Output)
                </h3>
                
                {diagnoses.map((diag, idx) => (
                  <div key={idx} className={`p-6 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${diag.severity === 'high' ? 'border-rose-300' : diag.severity === 'medium' ? 'border-amber-300' : 'border-emerald-300'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className={`text-lg font-bold uppercase tracking-tight ${diag.severity === 'high' ? 'text-rose-700' : diag.severity === 'medium' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {diag.name}
                      </h4>
                      <div className="text-right">
                        <span className={`text-2xl font-black ${diag.severity === 'high' ? 'text-rose-600' : diag.severity === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {diag.probability}%
                        </span>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Confianza</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Patrones Identificados (Pesos):</p>
                      <ul className="space-y-1">
                        {diag.factors.map((factor, fIdx) => (
                          <li key={fIdx} className="text-sm text-slate-700 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NeuralPrototype;