import { useState } from 'react';
import { User, Mail, Calendar, Users, MapPin, Building2, Globe, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RegistrationProps {
  onBack: () => void;
}

interface FormData {
  nombre: string;
  correo: string;
  fecha_nacimiento: string;
  genero: string;
  region: string;
  ciudad: string;
  pais: string;
}

const REGIONES_CHILE = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana de Santiago',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región del Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena',
];

function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mes = hoy.getMonth() - nac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

const EMPTY_FORM: FormData = {
  nombre: '',
  correo: '',
  fecha_nacimiento: '',
  genero: '',
  region: '',
  ciudad: '',
  pais: 'Chile',
};

export default function Registration({ onBack }: RegistrationProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const edad = calcularEdad(form.fecha_nacimiento);

  const set = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validate = (): string | null => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      return 'Ingresa un correo electrónico válido.';
    if (!form.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (edad !== null && edad < 10) return 'Debes tener al menos 10 años para registrarte.';
    if (edad !== null && edad > 120) return 'Fecha de nacimiento no válida.';
    if (!form.genero) return 'Selecciona un género.';
    if (!form.region) return 'Selecciona una región.';
    if (!form.ciudad.trim()) return 'La ciudad es obligatoria.';
    if (!form.pais.trim()) return 'El país es obligatorio.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('registrations').insert({
      nombre: form.nombre.trim(),
      correo: form.correo.trim().toLowerCase(),
      fecha_nacimiento: form.fecha_nacimiento,
      genero: form.genero,
      region: form.region,
      ciudad: form.ciudad.trim(),
      pais: form.pais.trim(),
    });

    if (error) {
      setErrorMsg('No se pudo completar el registro. Intenta nuevamente.');
      setStatus('error');
    } else {
      setStatus('success');
      setForm(EMPTY_FORM);
    }
  };

  const inputClass =
    'w-full bg-tradelearn-dark border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-tradelearn-gold focus:ring-1 focus:ring-tradelearn-gold transition-all text-sm';

  const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5';

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-tradelearn-navy flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-8 pb-4">
          <button onClick={onBack} className="p-2 rounded-lg bg-tradelearn-dark text-tradelearn-gold hover:bg-slate-800 transition">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">Registro</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-400 flex items-center justify-center mb-6">
            <CheckCircle2 size={44} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Registro exitoso!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
            Tu información ha sido guardada correctamente. Bienvenido/a a TradeLearn Chile.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-tradelearn-gold text-tradelearn-navy font-bold rounded-xl hover:bg-tradelearn-accent transition-all active:scale-95"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => setStatus('idle')}
            className="mt-3 px-8 py-3 bg-transparent border border-slate-600 text-slate-400 font-semibold rounded-xl hover:border-slate-400 transition-all text-sm"
          >
            Registrar otra persona
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-4 sticky top-0 bg-tradelearn-navy z-10 border-b border-slate-800">
        <button onClick={onBack} className="p-2 rounded-lg bg-tradelearn-dark text-tradelearn-gold hover:bg-slate-800 transition">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">Registro de Usuario</h1>
          <p className="text-xs text-slate-400">Completa tus datos para unirte</p>
        </div>
      </div>

      {/* Hero banner */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-gradient-to-r from-tradelearn-dark to-[#0a2a5e] border border-tradelearn-gold/20 px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-tradelearn-gold/10 border border-tradelearn-gold/30 flex items-center justify-center flex-shrink-0">
          <Users size={22} className="text-tradelearn-gold" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Únete a TradeLearn Chile</p>
          <p className="text-slate-400 text-xs mt-0.5">Tu herramienta de comercio exterior</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-5">

        {/* Nombre */}
        <div>
          <label className={labelClass}>Nombre completo</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Juan Pérez"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Correo */}
        <div>
          <label className={labelClass}>Correo electrónico</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={e => set('correo', e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className={labelClass}>Fecha de nacimiento</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              value={form.fecha_nacimiento}
              onChange={e => set('fecha_nacimiento', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`${inputClass} pl-10 [color-scheme:dark]`}
            />
          </div>
          {edad !== null && edad >= 0 && edad <= 120 && (
            <p className="text-xs text-tradelearn-gold mt-1.5 pl-1">
              Edad: <span className="font-bold">{edad} años</span>
            </p>
          )}
        </div>

        {/* Género */}
        <div>
          <label className={labelClass}>Género</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'hombre', label: 'Hombre' },
              { value: 'mujer', label: 'Mujer' },
              { value: 'otros', label: 'Otros' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('genero', opt.value)}
                className={`py-2.5 px-2 rounded-xl border text-sm font-semibold transition-all ${
                  form.genero === opt.value
                    ? 'bg-tradelearn-gold border-tradelearn-gold text-tradelearn-navy'
                    : 'bg-tradelearn-dark border-slate-600 text-slate-400 hover:border-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Región */}
        <div>
          <label className={labelClass}>Región de Chile</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={form.region}
              onChange={e => set('region', e.target.value)}
              className={`${inputClass} pl-10 appearance-none [color-scheme:dark]`}
            >
              <option value="">Selecciona una región</option>
              {REGIONES_CHILE.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Ciudad */}
        <div>
          <label className={labelClass}>Ciudad</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Santiago"
              value={form.ciudad}
              onChange={e => set('ciudad', e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* País */}
        <div>
          <label className={labelClass}>País</label>
          <div className="relative">
            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Chile"
              value={form.pais}
              onChange={e => set('pais', e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 bg-tradelearn-gold text-tradelearn-navy font-bold text-base rounded-xl hover:bg-tradelearn-accent transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Registrando...
            </>
          ) : (
            'Registrarme'
          )}
        </button>

        <p className="text-xs text-slate-500 text-center pb-4">
          Al registrarte aceptas el uso de tus datos para fines educativos de TradeLearn Chile.
        </p>
      </form>
    </div>
  );
}
