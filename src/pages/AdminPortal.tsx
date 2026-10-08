import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Search,
  Download,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  MapPin,
  Globe,
  TrendingUp,
  UserCircle,
} from 'lucide-react';

interface AdminPortalProps {
  onBack: () => void;
}

interface Registration {
  id: string;
  nombre: string;
  correo: string;
  fecha_nacimiento: string;
  genero: string;
  region: string;
  ciudad: string;
  pais: string;
  created_at: string;
}

type View = 'login' | 'signup' | 'portal';

export default function AdminPortal({ onBack }: AdminPortalProps) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [regs, setRegs] = useState<Registration[]>([]);
  const [filtered, setFiltered] = useState<Registration[]>([]);
  const [query, setQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error: rpcError } = await supabase.rpc('is_admin');
      if (!rpcError && data === true) {
        setIsAdmin(true);
        setView('portal');
        await loadRegistrations();
      } else {
        setView('login');
      }
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loadRegistrations = async () => {
    setDataLoading(true);
    setError('');
    const { data, error: qError } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (qError) {
      console.error('loadRegistrations error', qError);
      setError('No se pudieron cargar los registros. Es posible que la sesion haya expirado.');
      setDataLoading(false);
      return;
    }
    const rows = (data ?? []) as Registration[];
    setRegs(rows);
    setFiltered(rows);
    setDataLoading(false);
  };

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(regs);
      return;
    }
    setFiltered(
      regs.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          r.correo.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          r.ciudad.toLowerCase().includes(q) ||
          r.pais.toLowerCase().includes(q),
      ),
    );
  }, [query, regs]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setLoading(false);
      return;
    }

    const { data: adminCheck, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError || adminCheck !== true) {
      setError('Esta cuenta no tiene permisos de administrador.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setView('portal');
    setLoading(false);
    await loadRegistrations();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError('No se pudo crear la cuenta: ' + signUpError.message);
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      setError('No se pudo crear la cuenta.');
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc('bootstrap_first_admin');
    if (rpcError) {
      if (rpcError.message.includes('Admin already configured')) {
        setError(
          'Ya existe un administrador. Esta cuenta no tiene permisos de acceso.',
        );
      } else {
        setError('No se pudo configurar como administrador: ' + rpcError.message);
      }
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setInfo('Cuenta de administrador creada exitosamente.');
    setIsAdmin(true);
    setView('portal');
    setLoading(false);
    await loadRegistrations();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setView('login');
    setEmail('');
    setPassword('');
    setRegs([]);
    setFiltered([]);
  };

  const exportCsv = () => {
    const headers = [
      'Nombre',
      'Correo',
      'Fecha Nacimiento',
      'Genero',
      'Region',
      'Ciudad',
      'Pais',
      'Registrado',
    ];
    const rows = filtered.map((r) => [
      r.nombre,
      r.correo,
      r.fecha_nacimiento,
      r.genero,
      r.region,
      r.ciudad,
      r.pais,
      new Date(r.created_at).toLocaleString('es-CL'),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    'w-full bg-tradelearn-dark border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-tradelearn-gold focus:ring-1 focus:ring-tradelearn-gold transition-all text-sm';
  const labelClass =
    'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5';

  if (view === 'portal' && isAdmin) {
    const stats = {
      total: regs.length,
      today: regs.filter(
        (r) =>
          new Date(r.created_at).toDateString() === new Date().toDateString(),
      ).length,
      regions: new Set(regs.map((r) => r.region)).size,
      countries: new Set(regs.map((r) => r.pais)).size,
    };

    const genderCounts = regs.reduce<Record<string, number>>((acc, r) => {
      acc[r.genero] = (acc[r.genero] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-tradelearn-navy pb-24">
        <Header
          title="Portal Administrativo"
          subtitle="Base de datos de registros"
          onBack={onBack}
        />

        <div className="px-4 py-6 max-w-3xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-tradelearn-dark to-slate-800 rounded-xl p-4 border border-tradelearn-gold/30">
              <Users size={20} className="text-tradelearn-gold mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total registros</p>
            </div>
            <div className="bg-gradient-to-br from-tradelearn-dark to-slate-800 rounded-xl p-4 border border-emerald-500/30">
              <Calendar size={20} className="text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.today}</p>
              <p className="text-xs text-slate-400">Hoy</p>
            </div>
            <div className="bg-gradient-to-br from-tradelearn-dark to-slate-800 rounded-xl p-4 border border-tradelearn-blue/30">
              <MapPin size={20} className="text-tradelearn-blue mb-2" />
              <p className="text-2xl font-bold text-white">{stats.regions}</p>
              <p className="text-xs text-slate-400">Regiones</p>
            </div>
            <div className="bg-gradient-to-br from-tradelearn-dark to-slate-800 rounded-xl p-4 border border-tradelearn-gold/30">
              <Globe size={20} className="text-tradelearn-gold mb-2" />
              <p className="text-2xl font-bold text-white">{stats.countries}</p>
              <p className="text-xs text-slate-400">Paises</p>
            </div>
          </div>

          {/* Gender distribution */}
          {regs.length > 0 && (
            <div className="bg-tradelearn-dark rounded-xl p-4 mb-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-tradelearn-gold" />
                <p className="text-xs uppercase font-bold text-slate-400">
                  Distribucion por genero
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(genderCounts).map(([g, count]) => (
                  <div
                    key={g}
                    className="bg-tradelearn-navy rounded-lg px-4 py-2 border border-slate-600"
                  >
                    <span className="text-white font-bold capitalize">{g}</span>
                    <span className="text-slate-400 text-sm ml-2">
                      ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + Export */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, correo, region..."
                className={`${inputClass} pl-10`}
              />
            </div>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 bg-tradelearn-gold text-tradelearn-navy font-bold px-4 py-3 rounded-xl hover:bg-tradelearn-accent transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              <Download size={16} /> CSV
            </button>
          </div>

          {/* Records */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {dataLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-tradelearn-gold" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                {regs.length === 0
                  ? 'No hay registros aun. Los usuarios que completen el formulario de registro apareceran aqui.'
                  : 'No se encontraron resultados para tu busqueda.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="bg-tradelearn-dark rounded-xl p-4 border border-slate-700 hover:border-tradelearn-gold/40 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tradelearn-gold/10 border border-tradelearn-gold/30 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={20} className="text-tradelearn-gold" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{r.nombre}</p>
                        <p className="text-sm text-slate-400">{r.correo}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                    <div>
                      <p className="text-slate-500 uppercase">Nacimiento</p>
                      <p className="text-slate-300">
                        {new Date(r.fecha_nacimiento).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Genero</p>
                      <p className="text-slate-300 capitalize">{r.genero}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Region</p>
                      <p className="text-slate-300 truncate">{r.region}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase">Ciudad</p>
                      <p className="text-slate-300">{r.ciudad}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-500/20 transition"
          >
            <LogOut size={18} /> Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header title="Portal Administrativo" onBack={onBack} />

      <div className="px-4 py-8 max-w-md mx-auto">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-tradelearn-gold/10 border-2 border-tradelearn-gold/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={36} className="text-tradelearn-gold" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {view === 'login' ? 'Acceso Administrador' : 'Configurar Administrador'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {view === 'login'
              ? 'Solo el creador de la app puede acceder.'
              : 'Crea la cuenta de administrador (solo una vez).'}
          </p>
        </div>

        {/* Error / Info */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {info && (
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400 text-sm">{info}</p>
          </div>
        )}

        <form
          onSubmit={view === 'login' ? handleLogin : handleSignup}
          className="space-y-4"
        >
          <div>
            <label className={labelClass}>Correo electronico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tradelearn.cl"
                required
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Contrasena</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                required
                minLength={6}
                className={`${inputClass} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-tradelearn-gold to-yellow-500 text-tradelearn-navy font-bold py-4 rounded-xl transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : view === 'login' ? (
              'Ingresar'
            ) : (
              'Crear cuenta de administrador'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          {view === 'login' ? (
            <>
              No hay cuenta admin?{' '}
              <button
                onClick={() => {
                  setView('signup');
                  setError('');
                  setInfo('');
                }}
                className="text-tradelearn-blue hover:text-blue-300 font-semibold"
              >
                Configurar ahora
              </button>
            </>
          ) : (
            <>
              Ya tienes cuenta?{' '}
              <button
                onClick={() => {
                  setView('login');
                  setError('');
                  setInfo('');
                }}
                className="text-tradelearn-blue hover:text-blue-300 font-semibold"
              >
                Iniciar sesion
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
