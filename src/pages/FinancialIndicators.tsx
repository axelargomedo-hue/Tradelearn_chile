import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import {
  Activity,
  BarChart2,
  DollarSign,
  Loader2,
  Minus,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface FinancialIndicatorsProps {
  onBack: () => void;
}

interface SeriePoint {
  fecha: string;
  valor: number | string;
}

interface IndicatorData {
  valor?: number | string;
  serie?: SeriePoint[];
}

interface MindicadorResponse {
  dolar?: IndicatorData;
  euro?: IndicatorData;
  uf?: IndicatorData;
  utm?: IndicatorData;
  ipc?: IndicatorData;
  tpm?: IndicatorData;
}

interface LiveData {
  usd: number;
  usdPrevious: number;
  usdSeries: number[];
  usdDate: string;
  euro: number;
  uf: number;
  utm: number;
  ipc: number;
  tpm: number;
}

interface Indicator {
  id: string;
  label: string;
  value: number;
  previous: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  description: string;
}

function toNumber(value: number | string | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function latestValue(indicator?: IndicatorData): number {
  return toNumber(indicator?.serie?.[0]?.valor ?? indicator?.valor);
}

function previousValue(indicator?: IndicatorData): number {
  return toNumber(indicator?.serie?.[1]?.valor);
}

function seriesValues(indicator?: IndicatorData): number[] {
  return indicator?.serie?.map((point) => toNumber(point.valor)).reverse() ?? [];
}

function IndicatorCard({ indicator, index }: { indicator: Indicator; index: number }) {
  const delta = indicator.previous > 0
    ? ((indicator.value - indicator.previous) / indicator.previous) * 100
    : 0;
  const isUp = delta > 0.01;
  const isDown = delta < -0.01;

  const formatted = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: indicator.decimals,
    maximumFractionDigits: indicator.decimals,
  }).format(indicator.value);

  return (
    <div
      className="bg-gradient-to-br from-[#0d1f3a] to-[#071228] rounded-2xl p-4 border border-tradelearn-gold/20 hover:border-tradelearn-gold/50 transition-all"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-tradelearn-gold/70">{indicator.icon}</div>
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isUp
              ? 'bg-emerald-500/20 text-emerald-400'
              : isDown
              ? 'bg-red-500/20 text-red-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
          {Math.abs(delta).toFixed(2)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">
        {indicator.prefix && <span className="text-tradelearn-gold">{indicator.prefix}</span>}
        {formatted}
        {indicator.suffix && <span className="text-tradelearn-gold text-base ml-1">{indicator.suffix}</span>}
      </p>
      <p className="text-xs font-bold text-tradelearn-gold/80 uppercase tracking-wider">{indicator.label}</p>
      <p className="text-[10px] text-slate-500 mt-1">{indicator.description}</p>
    </div>
  );
}

export default function FinancialIndicators({ onBack }: FinancialIndicatorsProps) {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('https://mindicador.cl/api', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo actualizar el dólar');

      const json = (await response.json()) as MindicadorResponse;
      const usd = latestValue(json.dolar);
      if (usd <= 0) throw new Error('El servicio no entregó un valor válido');

      setData({
        usd,
        usdPrevious: previousValue(json.dolar),
        usdSeries: seriesValues(json.dolar),
        usdDate: json.dolar?.serie?.[0]?.fecha ?? new Date().toISOString(),
        euro: latestValue(json.euro),
        uf: latestValue(json.uf),
        utm: latestValue(json.utm),
        ipc: latestValue(json.ipc),
        tpm: latestValue(json.tpm),
      });
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const usdSeries = useMemo(() => {
    if (!data) return [];
    return data.usdSeries.length > 1 ? data.usdSeries : [data.usd * 0.99, data.usd];
  }, [data]);

  const indicators: Indicator[] = data
    ? [
        {
          id: 'usd',
          label: 'Dólar Observado',
          value: data.usd,
          previous: data.usdPrevious,
          decimals: 2,
          prefix: '$',
          icon: <DollarSign size={18} />,
          description: 'CLP por USD · dato actualizado',
        },
        {
          id: 'euro',
          label: 'Euro',
          value: data.euro,
          previous: 0,
          decimals: 2,
          prefix: '$',
          icon: <Activity size={18} />,
          description: 'CLP por EUR',
        },
        {
          id: 'uf',
          label: 'UF',
          value: data.uf,
          previous: 0,
          decimals: 2,
          prefix: '$',
          icon: <Zap size={18} />,
          description: 'Valor vigente',
        },
        {
          id: 'ipc',
          label: 'IPC Anual',
          value: data.ipc,
          previous: 0,
          decimals: 1,
          suffix: '%',
          icon: <BarChart2 size={18} />,
          description: 'Inflación 12 meses',
        },
        {
          id: 'tpm',
          label: 'TPM',
          value: data.tpm,
          previous: 0,
          decimals: 2,
          suffix: '%',
          icon: <Target size={18} />,
          description: 'Tasa política Banco Central',
        },
        {
          id: 'utm',
          label: 'UTM',
          value: data.utm,
          previous: 0,
          decimals: 0,
          prefix: '$',
          icon: <Zap size={18} />,
          description: 'Unidad tributaria mensual',
        },
      ]
    : [];

  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 180;
  const PAD_LEFT = 50;
  const PAD_RIGHT = 10;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 30;
  const PLOT_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const PLOT_HEIGHT = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const chartMin = usdSeries.length ? Math.min(...usdSeries) - 5 : 0;
  const chartMax = usdSeries.length ? Math.max(...usdSeries) + 5 : 1;
  const chartAverage = usdSeries.length
    ? usdSeries.reduce((total, value) => total + value, 0) / usdSeries.length
    : 0;
  const toX = (index: number) => PAD_LEFT + (index / Math.max(usdSeries.length - 1, 1)) * PLOT_WIDTH;
  const toY = (value: number) => PAD_TOP + PLOT_HEIGHT - ((value - chartMin) / Math.max(chartMax - chartMin, 1)) * PLOT_HEIGHT;
  const linePoints = usdSeries.map((value, index) => `${toX(index)},${toY(value)}`).join(' ');
  const areaPoints = usdSeries.length
    ? `${toX(0)},${PAD_TOP + PLOT_HEIGHT} ${linePoints} ${toX(usdSeries.length - 1)},${PAD_TOP + PLOT_HEIGHT}`
    : '';
  const variation = usdSeries.length > 1
    ? ((usdSeries[usdSeries.length - 1] - usdSeries[0]) / usdSeries[0]) * 100
    : 0;
  const dateLabel = data
    ? new Date(data.usdDate).toLocaleDateString('es-CL')
    : '—';
  const updateLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const handleChartMouse = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || usdSeries.length < 2) return;
    const rect = chartRef.current.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const rawIndex = Math.round(((svgX - PAD_LEFT) / PLOT_WIDTH) * (usdSeries.length - 1));
    setHoveredChartIndex(Math.max(0, Math.min(usdSeries.length - 1, rawIndex)));
  };

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Panel Financiero"
        subtitle="Valor actual del dólar e indicadores oficiales de Chile"
        onBack={onBack}
      />

      <div className="bg-tradelearn-navy/80 border-b border-tradelearn-gold/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span className={`text-xs font-bold ${error ? 'text-red-400' : 'text-emerald-400'}`}>
            {error ? 'SIN ACTUALIZACIÓN' : 'DATOS EN LÍNEA'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Actualizado {updateLabel}</span>
          <button
            onClick={loadData}
            disabled={loading}
            className="text-tradelearn-gold/60 hover:text-tradelearn-gold transition disabled:opacity-50"
            aria-label="Actualizar datos"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-tradelearn-gold animate-spin mb-3" />
            <p className="text-sm text-slate-400">Consultando el valor actual del dólar…</p>
          </div>
        ) : error && !data ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
            <p className="text-red-400 font-semibold">No se pudo obtener el dólar actual.</p>
            <button onClick={loadData} className="mt-4 bg-tradelearn-gold text-tradelearn-navy font-bold px-5 py-2 rounded-xl">
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
                Indicadores Económicos Oficiales
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {indicators.map((indicator, index) => (
                  <IndicatorCard key={indicator.id} indicator={indicator} index={index} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold flex items-center gap-2">
                  <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
                  Evolución real del dólar
                </h3>
                <span className="text-xs text-slate-400">Serie disponible</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Mínimo</p>
                  <p className="text-base font-bold text-red-400">${Math.min(...usdSeries).toFixed(2)}</p>
                </div>
                <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Promedio</p>
                  <p className="text-base font-bold text-tradelearn-gold">${chartAverage.toFixed(2)}</p>
                </div>
                <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Máximo</p>
                  <p className="text-base font-bold text-emerald-400">${Math.max(...usdSeries).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#0a1628] to-[#071220] rounded-2xl p-4 border border-tradelearn-gold/20 relative">
                <svg
                  ref={chartRef}
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="w-full cursor-crosshair"
                  onMouseMove={handleChartMouse}
                  onMouseLeave={() => setHoveredChartIndex(null)}
                >
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC107" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const y = PAD_TOP + PLOT_HEIGHT * (1 - fraction);
                    const value = chartMin + (chartMax - chartMin) * fraction;
                    return (
                      <g key={fraction}>
                        <line x1={PAD_LEFT} y1={y} x2={SVG_WIDTH - PAD_RIGHT} y2={y} stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
                        <text x={PAD_LEFT - 4} y={y + 4} fontSize="9" fill="#4a6fa5" textAnchor="end">{value.toFixed(0)}</text>
                      </g>
                    );
                  })}
                  <line x1={PAD_LEFT} y1={toY(chartAverage)} x2={SVG_WIDTH - PAD_RIGHT} y2={toY(chartAverage)} stroke="#FFC107" strokeWidth="1" strokeDasharray="8 4" opacity="0.4" />
                  <polygon points={areaPoints} fill="url(#goldFill)" />
                  <polyline points={linePoints} fill="none" stroke="#FFC107" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {hoveredChartIndex !== null && (
                    <>
                      <line x1={toX(hoveredChartIndex)} y1={PAD_TOP} x2={toX(hoveredChartIndex)} y2={PAD_TOP + PLOT_HEIGHT} stroke="#FFC107" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                      <circle cx={toX(hoveredChartIndex)} cy={toY(usdSeries[hoveredChartIndex])} r="5" fill="#FFC107" stroke="#fff" strokeWidth="1.5" />
                      <text x={Math.min(toX(hoveredChartIndex), SVG_WIDTH - 45)} y={Math.max(toY(usdSeries[hoveredChartIndex]) - 12, 12)} fontSize="11" fill="#FFC107" textAnchor="middle" fontWeight="bold">
                        ${usdSeries[hoveredChartIndex].toFixed(2)}
                      </text>
                    </>
                  )}
                </svg>
                <p className="text-xs text-slate-400 text-center mt-3">
                  Variación de la serie: <span className={`font-bold ${variation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{variation >= 0 ? '+' : ''}{variation.toFixed(2)}%</span> · Dato del {dateLabel}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
