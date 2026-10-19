import { useState, useEffect } from 'react';
import ModuleCard from '../components/ModuleCard';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  UserRound,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Activity,
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

interface IndicatorSerie {
  fecha: string;
  valor: number;
}

interface IndicatorInfo {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  valor?: number | string;
  serie?: IndicatorSerie[];
}

interface MindicadorResponse {
  dolar?: IndicatorInfo;
  euro?: IndicatorInfo;
  uf?: IndicatorInfo;
  utm?: IndicatorInfo;
  ipc?: IndicatorInfo;
  tpm?: IndicatorInfo;
  [key: string]: IndicatorInfo | undefined;
}

interface LiveData {
  usd: number;
  usdPrev: number;
  usdSerie: number[];
  euro: number;
  euroPrev: number;
  uf: number;
  ufPrev: number;
  utm: number;
  ipc: number;
  tpm: number;
  fecha: string;
}

function useLiveIndicators() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('https://mindicador.cl/api');
      if (!res.ok) throw new Error('No se pudo conectar con el servicio');
      const json = (await res.json()) as MindicadorResponse;

      const toNumber = (value: number | string | undefined) => {
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const pickLatest = (ind?: IndicatorInfo) =>
        toNumber(ind?.serie?.[0]?.valor ?? ind?.valor);
      const pickPrev = (ind?: IndicatorInfo) =>
        toNumber(ind?.serie?.[1]?.valor);
      const serieValues = (ind?: IndicatorInfo) =>
        ind?.serie?.map((s) => toNumber(s.valor)).reverse() ?? [];

      const usd = pickLatest(json.dolar);
      const euro = pickLatest(json.euro);
      const uf = pickLatest(json.uf);
      const utm = pickLatest(json.utm);
      const ipc = pickLatest(json.ipc);
      const tpm = pickLatest(json.tpm);

      setData({
        usd,
        usdPrev: pickPrev(json.dolar),
        usdSerie: serieValues(json.dolar),
        euro,
        euroPrev: pickPrev(json.euro),
        uf,
        ufPrev: pickPrev(json.uf),
        utm,
        ipc,
        tpm,
        fecha: json.dolar?.serie?.[0]?.fecha ?? new Date().toISOString(),
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  return { data, loading, error, reload: load };
}

function buildSparkline(values: number[], width = 280, height = 56) {
  if (!values || values.length < 2) return { points: '', area: '', color: '#FFC107' };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 6;
  const stepX = width / (values.length - 1);

  const coords = values.map((v, i) => {
    const x = i * stepX;
    const y = padY + (height - padY * 2) - ((v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area =
    `0,${height} ` +
    points +
    ` ${width},${height}`;
  const color = values[values.length - 1] >= values[0] ? '#10b981' : '#f87171';

  return { points, area, color };
}

function describePesoState(usdDeltaPct: number): { label: string; tone: 'weak' | 'stable' | 'strong' } {
  if (usdDeltaPct > 0.8)
    return { label: 'El peso chileno se debilita frente al dólar', tone: 'weak' };
  if (usdDeltaPct < -0.8)
    return { label: 'El peso chileno se fortalece frente al dólar', tone: 'strong' };
  return { label: 'El peso chileno se mantiene estable frente al dólar', tone: 'stable' };
}

interface RecentSearch {
  id: string;
  term: string;
  results_count: number;
  created_at: string;
}

export default function Home({ onNavigate }: HomeProps) {
  const { data, loading, error, reload } = useLiveIndicators();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: rows } = await supabase
        .from('search_history')
        .select('id, term, results_count, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!cancelled && rows) setRecentSearches(rows);
    };

    load();
    const interval = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const fmt = (v: number, dec = 0) =>
    new Intl.NumberFormat('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const usdDelta = data && data.usdPrev > 0 ? ((data.usd - data.usdPrev) / data.usdPrev) * 100 : 0;
  const euroDelta = data && data.euroPrev > 0 ? ((data.euro - data.euroPrev) / data.euroPrev) * 100 : 0;
  const ufDelta = data && data.ufPrev > 0 ? ((data.uf - data.ufPrev) / data.ufPrev) * 100 : 0;

  const usdSpark = data ? buildSparkline(data.usdSerie.slice(-30)) : null;
  const pesoState = describePesoState(usdDelta);

  const lastUpdate = data
    ? new Date(data.fecha).toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-tradelearn-navy to-tradelearn-dark px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,193,7,0.4)] flex-shrink-0 bg-white">
              <img src="/pngegg.png" alt="TradeLearn" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-tradelearn-gold leading-none tracking-tight">
                TradeLearn <span className="text-tradelearn-blue">Chile</span>
              </h1>
              <p className="text-slate-400 text-sm mt-2">Tu herramienta profesional de comercio exterior</p>
              <p className="text-slate-500 text-xs mt-1 capitalize">{today}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('registration')}
            className="w-14 h-14 rounded-full bg-orange-500/80 hover:bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(249,115,22,0.4)] hover:shadow-[0_0_24px_rgba(249,115,22,0.6)] transition-all active:scale-95"
            aria-label="Registro"
          >
            <UserRound size={26} className="text-white" />
          </button>
        </div>
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-tradelearn-gold transition-colors mt-2 ml-1 font-semibold"
          aria-label="Portal administrativo"
        >
          <Shield size={13} />
          <span>Portal Admin</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-6">
        {/* Featured Financial Panel — Estado actual del dólar y del peso chileno */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-3">
            Estado del Dólar Hoy
          </h2>

          <button
            onClick={() => onNavigate('indicators')}
            className="w-full text-left bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#071228] rounded-3xl p-5 border-2 border-tradelearn-gold/50 shadow-[0_0_30px_rgba(255,193,7,0.15)] hover:border-tradelearn-gold hover:shadow-[0_0_40px_rgba(255,193,7,0.25)] transition-all group relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-tradelearn-gold/5 via-transparent to-tradelearn-blue/10 rounded-3xl" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={12} className="text-tradelearn-gold animate-spin" />
                      <span className="text-xs font-bold text-tradelearn-gold/80 uppercase tracking-widest">
                        Actualizando…
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                        Dato Oficial SBIF
                      </span>
                    </>
                  )}
                </div>
                <span
                  role="button"
                  aria-label="Actualizar indicadores"
                  onClick={(e) => {
                    e.stopPropagation();
                    reload();
                  }}
                  className="flex items-center gap-1.5 text-xs text-tradelearn-gold/60 hover:text-tradelearn-gold font-semibold bg-tradelearn-gold/10 px-3 py-1 rounded-full transition"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  Actualizar
                </span>
              </div>

              {/* Error state */}
              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">
                    No se pudo cargar el valor del dólar en este momento.
                  </p>
                </div>
              )}

              {/* Loading state */}
              {loading && !data && (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 size={28} className="text-tradelearn-gold animate-spin mb-3" />
                  <p className="text-xs text-slate-400">Cargando valor del dólar…</p>
                </div>
              )}

              {/* Main USD + peso state */}
              {data && (
                <>
                  <div className="bg-tradelearn-navy/60 rounded-2xl p-4 border border-tradelearn-gold/30 mb-4">
                    <div className="flex items-end justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                          Dólar Observado (USD/CLP)
                        </p>
                        <p className="text-3xl font-bold text-tradelearn-gold leading-none">
                          ${fmt(data.usd > 0 ? data.usd : data.usdPrev, 2)}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          Peso chileno por 1 dólar
                        </p>
                      </div>
                      <div
                        className={`flex flex-col items-end ${
                          usdDelta >= 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {usdDelta >= 0 ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          <span className="text-sm font-bold">
                            {usdDelta >= 0 ? '+' : ''}
                            {usdDelta.toFixed(2)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">
                          {usdDelta >= 0 ? 'Dólar sube · peso se debilita' : 'Dólar baja · peso se fortalece'}
                        </span>
                      </div>
                    </div>

                    {/* Mini sparkline of USD last 30 days */}
                    {usdSpark && (
                      <svg viewBox="0 0 280 56" className="w-full h-14" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="usdFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={usdSpark.color} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={usdSpark.color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon points={usdSpark.area} fill="url(#usdFill)" />
                        <polyline
                          points={usdSpark.points}
                          fill="none"
                          stroke={usdSpark.color}
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}

                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                      <Activity size={10} />
                      Últimos 30 días · Actualizado {lastUpdate}
                    </p>
                  </div>

                  {/* Peso state banner */}
                  <div
                    className={`rounded-xl px-4 py-3 border mb-4 ${
                      pesoState.tone === 'weak'
                        ? 'bg-red-500/10 border-red-500/30'
                        : pesoState.tone === 'strong'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-500/10 border-slate-500/30'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${
                        pesoState.tone === 'weak'
                          ? 'text-red-400'
                          : pesoState.tone === 'strong'
                          ? 'text-emerald-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {pesoState.label}.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Un dólar alto encarece las importaciones; un dólar bajo favorece la
                      entrada de productos externos y reduce ingresos de exportadores en pesos.
                    </p>
                  </div>

                  {/* Secondary indicators: Euro, UF, IPC, TPM */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Euro / CLP</p>
                      <p className="text-lg font-bold text-tradelearn-gold">${fmt(data.euro, 2)}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          euroDelta >= 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {euroDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span className="text-[10px] font-bold">
                          {euroDelta >= 0 ? '+' : ''}
                          {euroDelta.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">UF</p>
                      <p className="text-lg font-bold text-tradelearn-gold">{fmt(data.uf, 2)}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          ufDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {ufDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span className="text-[10px] font-bold">
                          {ufDelta >= 0 ? '+' : ''}
                          {ufDelta.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">IPC anual</p>
                      <p className="text-base font-bold text-amber-400">
                        {data.ipc ? fmt(data.ipc, 1) : '—'}%
                      </p>
                    </div>
                    <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">TPM</p>
                      <p className="text-base font-bold text-tradelearn-blue">
                        {data.tpm ? fmt(data.tpm, 2) : '—'}%
                      </p>
                    </div>
                    <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-[10px] text-tradelearn-gold uppercase font-bold">
                          Ver Panel
                        </p>
                        <p className="text-2xl">→</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </button>
        </section>

        {/* Other Modules */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-3">
            Módulos
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ModuleCard
              icon="📋"
              number="01"
              title="Buscador Arancelario"
              description="Consulta 8,551 fracciones arancelarias"
              onClick={() => onNavigate('tariff')}
              gradient="bg-gradient-to-br from-tradelearn-blue to-blue-500"
            />
            <ModuleCard
              icon="🧮"
              number="02"
              title="Calculadora Comex"
              description="Importación y exportación: FOB, CIF, costos"
              onClick={() => onNavigate('calculator')}
              gradient="bg-gradient-to-br from-tradelearn-gold to-yellow-500"
            />
            <ModuleCard
              icon="📈"
              number="03"
              title="Punto de Equilibrio"
              description="Análisis de rentabilidad"
              onClick={() => onNavigate('breakeven')}
              gradient="bg-gradient-to-br from-tradelearn-blue to-cyan-500"
            />
            <ModuleCard
              icon="📄"
              number="04"
              title="Guía de Documentos"
              description="Documentación import/export"
              onClick={() => onNavigate('documents')}
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
            />
            <ModuleCard
              icon="🌐"
              number="05"
              title="Incoterms 2020"
              description="11 términos comerciales"
              onClick={() => onNavigate('incoterms')}
              gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
            />
            <ModuleCard
              icon="🎓"
              number="06"
              title="Análisis IA"
              description="Interpreta el mercado con IA"
              onClick={() => onNavigate('indicators')}
              gradient="bg-gradient-to-br from-tradelearn-gold to-amber-500"
            />
          </div>
        </section>

        {/* Key Stats */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4">
            Datos Clave
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-tradelearn-navy rounded-xl p-4 border border-tradelearn-gold/30">
              <p className="text-2xl font-bold text-tradelearn-gold">8,551</p>
              <p className="text-xs text-slate-300 mt-1">Fracciones arancelarias</p>
            </div>
            <div className="bg-tradelearn-navy rounded-xl p-4 border border-tradelearn-gold/30">
              <p className="text-2xl font-bold text-tradelearn-blue">26+</p>
              <p className="text-xs text-slate-300 mt-1">TLCs vigentes</p>
            </div>
            <div className="bg-tradelearn-navy rounded-xl p-4 border border-tradelearn-gold/30">
              <p className="text-2xl font-bold text-tradelearn-gold">11</p>
              <p className="text-xs text-slate-300 mt-1">Incoterms 2020</p>
            </div>
          </div>
        </section>

        {/* Recent Searches */}
        <section className="mb-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4">
            Búsquedas Recientes
          </h2>
          {recentSearches.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay búsquedas. Explora el buscador arancelario y aparecerán aquí.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSearches.map((search, idx) => (
                <div
                  key={search.id}
                  className={`bg-tradelearn-navy rounded-lg p-4 border-l-4 ${
                    idx % 2 === 0 ? 'border-tradelearn-gold' : 'border-tradelearn-blue'
                  } hover:bg-slate-800 transition cursor-pointer`}
                  onClick={() => onNavigate('tariff')}
                >
                  <p className="font-bold text-tradelearn-gold">{search.term}</p>
                  <p className="text-xs text-tradelearn-blue mt-2">
                    {search.results_count} resultado{search.results_count === 1 ? '' : 's'} ·{' '}
                    {new Date(search.created_at).toLocaleString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
