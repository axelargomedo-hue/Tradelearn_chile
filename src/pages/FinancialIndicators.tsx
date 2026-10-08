import { useState, useEffect, useMemo, useRef } from 'react';
import Header from '../components/Header';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Brain,
  DollarSign, BarChart2, Zap, Target, Activity,
} from 'lucide-react';

interface FinancialIndicatorsProps {
  onBack: () => void;
}

// ─── Simulated data generators ───────────────────────────────────────────────

function seed(n: number) {
  const x = Math.sin(n + 17.3) * 43758.5453;
  return x - Math.floor(x);
}

function generateUsdHistory(): number[] {
  const BASE = 920;
  const data: number[] = [];
  let v = BASE;
  for (let i = 0; i < 30; i++) {
    const s = seed(i);
    const trend = (i / 29) * 16; // drift +16 over month
    const noise = (s - 0.5) * 22;
    v = BASE + trend + noise;
    data.push(Math.round(v * 100) / 100);
  }
  return data;
}

function applyTick(base: number, tick: number, pct: number): number {
  const s = seed(tick * 7.1 + base);
  return base + base * (s - 0.5) * pct;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Indicator {
  id: string;
  label: string;
  value: number;
  prev: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  description: string;
}

interface Commodity {
  id: string;
  label: string;
  value: number;
  prev: number;
  unit: string;
  icon: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IndicatorCard({ ind, i }: { ind: Indicator; i: number }) {
  const delta = ((ind.value - ind.prev) / ind.prev) * 100;
  const up = delta > 0.01;
  const down = delta < -0.01;

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: ind.decimals,
      maximumFractionDigits: ind.decimals,
    }).format(v);

  return (
    <div
      className="bg-gradient-to-br from-[#0d1f3a] to-[#071228] rounded-2xl p-4 border border-tradelearn-gold/20 hover:border-tradelearn-gold/50 transition-all"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-tradelearn-gold/70">{ind.icon}</div>
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            up
              ? 'bg-emerald-500/20 text-emerald-400'
              : down
              ? 'bg-red-500/20 text-red-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {up ? <TrendingUp size={10} /> : down ? <TrendingDown size={10} /> : <Minus size={10} />}
          {Math.abs(delta).toFixed(2)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">
        {ind.prefix && <span className="text-tradelearn-gold">{ind.prefix}</span>}
        {fmt(ind.value)}
        {ind.suffix && <span className="text-tradelearn-gold text-base ml-1">{ind.suffix}</span>}
      </p>
      <p className="text-xs font-bold text-tradelearn-gold/80 uppercase tracking-wider">{ind.label}</p>
      <p className="text-[10px] text-slate-500 mt-1">{ind.description}</p>
    </div>
  );
}

function CommodityRow({ c }: { c: Commodity }) {
  const delta = ((c.value - c.prev) / c.prev) * 100;
  const up = delta > 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const barPct = Math.min(Math.abs(delta) * 20, 100);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-tradelearn-gold/10 last:border-0">
      <span className="text-2xl w-8 text-center flex-shrink-0">{c.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-white text-sm">{c.label}</span>
          <span className={`text-sm font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? '+' : ''}{delta.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-tradelearn-gold text-xs font-semibold">
            {fmt(c.value)} {c.unit}
          </p>
          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${up ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancialIndicators({ onBack }: FinancialIndicatorsProps) {
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const manualRefresh = () => {
    setTick((t) => t + 1);
    setLastUpdated(new Date());
  };

  // ─── Live Indicator Data ─────────────────────────────────────────────────────

  const USD_BASE = 936.5;
  const UF_BASE = 37842.15;
  const EUR_BASE = 1008.3;
  const UTM_BASE = 66496;

  const indicators: Indicator[] = useMemo(
    () => [
      {
        id: 'uf',
        label: 'UF',
        value: applyTick(UF_BASE, tick, 0.002),
        prev: UF_BASE,
        decimals: 2,
        prefix: '$',
        icon: <Zap size={18} />,
        description: 'Valor hoy',
      },
      {
        id: 'usd',
        label: 'Dólar Observado',
        value: applyTick(USD_BASE, tick, 0.008),
        prev: USD_BASE,
        decimals: 1,
        prefix: '$',
        icon: <DollarSign size={18} />,
        description: 'CLP por USD',
      },
      {
        id: 'eur',
        label: 'Euro',
        value: applyTick(EUR_BASE, tick, 0.008),
        prev: EUR_BASE,
        decimals: 1,
        prefix: '$',
        icon: <Activity size={18} />,
        description: 'CLP por EUR',
      },
      {
        id: 'ipc',
        label: 'IPC Anual',
        value: 4.2 + seed(tick) * 0.06 - 0.03,
        prev: 4.2,
        decimals: 1,
        suffix: '%',
        icon: <BarChart2 size={18} />,
        description: 'Inflación 12 meses',
      },
      {
        id: 'tpm',
        label: 'TPM',
        value: 5.25,
        prev: 5.25,
        decimals: 2,
        suffix: '%',
        icon: <Target size={18} />,
        description: 'Tasa política Banco Central',
      },
      {
        id: 'utm',
        label: 'UTM',
        value: applyTick(UTM_BASE, tick, 0.001),
        prev: UTM_BASE,
        decimals: 0,
        prefix: '$',
        icon: <Zap size={18} />,
        description: 'Unidad tributaria mensual',
      },
    ],
    [tick]
  );

  // ─── USD 30-Day Chart ────────────────────────────────────────────────────────

  const usdBase30 = useMemo(() => generateUsdHistory(), []);
  const usd30 = useMemo(() => {
    return usdBase30.map((v, i) => applyTick(v, tick + i, 0.004));
  }, [tick, usdBase30]);

  const chartMin = Math.min(...usd30) - 5;
  const chartMax = Math.max(...usd30) + 5;
  const chartAvg = usd30.reduce((a, b) => a + b, 0) / usd30.length;

  const SVG_W = 400;
  const SVG_H = 180;
  const PAD_L = 50;
  const PAD_R = 10;
  const PAD_T = 20;
  const PAD_B = 30;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const toX = (i: number) => PAD_L + (i / (usd30.length - 1)) * PLOT_W;
  const toY = (v: number) => PAD_T + PLOT_H - ((v - chartMin) / (chartMax - chartMin)) * PLOT_H;

  const linePoints = usd30.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPoints =
    `${toX(0)},${PAD_T + PLOT_H} ` +
    linePoints +
    ` ${toX(usd30.length - 1)},${PAD_T + PLOT_H}`;

  const varPct = ((usd30[usd30.length - 1] - usd30[0]) / usd30[0]) * 100;
  const dayLabels = ['30d', '25d', '20d', '15d', '10d', '5d', 'Hoy'];

  const handleChartMouse = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const svgX = (xPx / rect.width) * SVG_W;
    const rawIdx = Math.round(((svgX - PAD_L) / PLOT_W) * (usd30.length - 1));
    const idx = Math.max(0, Math.min(usd30.length - 1, rawIdx));
    setHoveredChartIdx(idx);
  };

  // ─── Commodities / Radar ─────────────────────────────────────────────────────

  const commodities: Commodity[] = useMemo(
    () => [
      {
        id: 'ipsa',
        label: 'IPSA',
        value: applyTick(6842, tick, 0.012),
        prev: 6842,
        unit: 'pts',
        icon: '📈',
      },
      {
        id: 'copper',
        label: 'Cobre',
        value: applyTick(4.18, tick, 0.015),
        prev: 4.18,
        unit: 'USD/lb',
        icon: '🟤',
      },
      {
        id: 'gold',
        label: 'Oro',
        value: applyTick(2347, tick, 0.01),
        prev: 2347,
        unit: 'USD/oz',
        icon: '🥇',
      },
      {
        id: 'lithium',
        label: 'Litio',
        value: applyTick(15800, tick, 0.02),
        prev: 15800,
        unit: 'USD/t',
        icon: '⚡',
      },
      {
        id: 'oil',
        label: 'Petróleo (WTI)',
        value: applyTick(78.45, tick, 0.018),
        prev: 78.45,
        unit: 'USD/bbl',
        icon: '🛢️',
      },
    ],
    [tick]
  );

  // ─── Traffic Light ───────────────────────────────────────────────────────────

  const ipcV = indicators.find((i) => i.id === 'ipc')!.value;
  const usdV = indicators.find((i) => i.id === 'usd')!.value;
  const ipsa = commodities.find((c) => c.id === 'ipsa')!;
  const ipsaDelta = ((ipsa.value - ipsa.prev) / ipsa.prev) * 100;
  const usdDelta = ((usdV - USD_BASE) / USD_BASE) * 100;

  const lights = [
    {
      label: 'Inflación',
      detail: `IPC anual ${ipcV.toFixed(1)}%`,
      color: ipcV < 4 ? 'green' : ipcV < 5 ? 'yellow' : 'red',
      icon: '📊',
    },
    {
      label: 'Dólar',
      detail: `Variación ${usdDelta >= 0 ? '+' : ''}${usdDelta.toFixed(2)}% hoy`,
      color: Math.abs(usdDelta) < 0.5 ? 'green' : Math.abs(usdDelta) < 1 ? 'yellow' : 'red',
      icon: '💵',
    },
    {
      label: 'Mercado Accionario',
      detail: `IPSA ${ipsaDelta >= 0 ? '+' : ''}${ipsaDelta.toFixed(2)}%`,
      color: ipsaDelta > 0.5 ? 'green' : ipsaDelta > -0.5 ? 'yellow' : 'red',
      icon: '📉',
    },
    {
      label: 'Tasa Política',
      detail: `TPM en 5.25%`,
      color: 'yellow',
      icon: '🏦',
    },
    {
      label: 'Commodities Chile',
      detail: `Cobre ${((commodities.find((c) => c.id === 'copper')!.value - 4.18) / 4.18 * 100).toFixed(2)}%`,
      color:
        (commodities.find((c) => c.id === 'copper')!.value - 4.18) / 4.18 > 0
          ? 'green'
          : 'red',
      icon: '🟤',
    },
    {
      label: 'Riesgo Internacional',
      detail: 'Volatilidad moderada',
      color: 'yellow',
      icon: '🌐',
    },
  ];

  const lightColors: Record<string, string> = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴',
  };
  const lightBg: Record<string, string> = {
    green: 'border-emerald-500/30 bg-emerald-500/10',
    yellow: 'border-amber-500/30 bg-amber-500/10',
    red: 'border-red-500/30 bg-red-500/10',
  };
  const lightText: Record<string, string> = {
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    red: 'text-red-400',
  };

  // ─── AI Analysis ─────────────────────────────────────────────────────────────

  const generateAI = () => {
    setAiLoading(true);
    setAiText(null);
    setTimeout(() => {
      const ipcStr = ipcV.toFixed(1);
      const usdStr = usdV.toFixed(0);
      const copperPct = ((commodities.find((c) => c.id === 'copper')!.value - 4.18) / 4.18 * 100).toFixed(2);
      const ipsaStr = ipsaDelta.toFixed(2);

      const text =
        `La economía chilena muestra una inflación de ${ipcStr}%, aún por sobre la meta del 3% del Banco Central, lo que mantiene la TPM en 5.25%. El dólar cotiza a $${usdStr} CLP, con volatilidad moderada influenciada por la incertidumbre global. El cobre —principal exportación chilena— variando ${copperPct}% en sesión, refleja presiones externas del mercado asiático. El IPSA registra ${ipsaStr}% de variación diaria. Para estudiantes, entender estas variables es clave en evaluación de costos de importación. Para el comercio exterior, el tipo de cambio actual encarece importaciones pero beneficia exportadores. Los inversionistas deben considerar la presión inflacionaria como factor de riesgo en portafolios locales.`;

      setAiText(text);
      setAiLoading(false);
    }, 1800);
  };

  const timeFmt = lastUpdated.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Panel Financiero"
        subtitle="Indicadores económicos de Chile en tiempo real"
        onBack={onBack}
      />

      {/* Status Bar */}
      <div className="bg-tradelearn-navy/80 border-b border-tradelearn-gold/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-bold">MERCADO EN VIVO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{timeFmt}</span>
          <button
            onClick={manualRefresh}
            className="text-tradelearn-gold/60 hover:text-tradelearn-gold transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">

        {/* ─── Sección 1: Indicadores ─── */}
        <section>
          <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
            Indicadores Económicos Chile
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {indicators.map((ind, i) => (
              <IndicatorCard key={ind.id} ind={ind} i={i} />
            ))}
          </div>
        </section>

        {/* ─── Sección 2: Gráfico USD ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold flex items-center gap-2">
              <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
              Evolución del Dólar en Chile
            </h3>
            <span className="text-xs text-slate-400">Últimos 30 días</span>
          </div>

          {/* Chart stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Mínimo</p>
              <p className="text-base font-bold text-red-400">${Math.min(...usd30).toFixed(0)}</p>
            </div>
            <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Promedio</p>
              <p className="text-base font-bold text-tradelearn-gold">${chartAvg.toFixed(0)}</p>
            </div>
            <div className="bg-[#0d1f3a]/80 rounded-xl p-3 border border-tradelearn-gold/20 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Máximo</p>
              <p className="text-base font-bold text-emerald-400">${Math.max(...usd30).toFixed(0)}</p>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="bg-gradient-to-b from-[#0a1628] to-[#071220] rounded-2xl p-4 border border-tradelearn-gold/20 relative">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full cursor-crosshair"
              onMouseMove={handleChartMouse}
              onMouseLeave={() => setHoveredChartIdx(null)}
            >
              <defs>
                <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC107" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = PAD_T + PLOT_H * (1 - f);
                const val = chartMin + (chartMax - chartMin) * f;
                return (
                  <g key={`gl-${f}`}>
                    <line
                      x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y}
                      stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4"
                    />
                    <text x={PAD_L - 4} y={y + 4} fontSize="9" fill="#4a6fa5" textAnchor="end">
                      {val.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Average line */}
              <line
                x1={PAD_L} y1={toY(chartAvg)} x2={SVG_W - PAD_R} y2={toY(chartAvg)}
                stroke="#FFC107" strokeWidth="1" strokeDasharray="8 4" opacity="0.4"
              />

              {/* X axis labels */}
              {dayLabels.map((label, idx) => {
                const x = PAD_L + (idx / (dayLabels.length - 1)) * PLOT_W;
                return (
                  <text key={label} x={x} y={SVG_H - 6} fontSize="9" fill="#4a6fa5" textAnchor="middle">
                    {label}
                  </text>
                );
              })}

              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#goldFill)" />

              {/* Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#FFC107"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Hover crosshair */}
              {hoveredChartIdx !== null && (
                <>
                  <line
                    x1={toX(hoveredChartIdx)} y1={PAD_T}
                    x2={toX(hoveredChartIdx)} y2={PAD_T + PLOT_H}
                    stroke="#FFC107" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
                  />
                  <circle
                    cx={toX(hoveredChartIdx)} cy={toY(usd30[hoveredChartIdx])}
                    r="5" fill="#FFC107" stroke="#fff" strokeWidth="1.5"
                  />
                  {/* Tooltip */}
                  <g>
                    <rect
                      x={Math.min(toX(hoveredChartIdx) - 40, SVG_W - 90)}
                      y={toY(usd30[hoveredChartIdx]) - 34}
                      width="80" height="26"
                      rx="5" fill="#0d1f3a" stroke="#FFC107" strokeWidth="1"
                    />
                    <text
                      x={Math.min(toX(hoveredChartIdx), SVG_W - 50)}
                      y={toY(usd30[hoveredChartIdx]) - 16}
                      fontSize="11" fill="#FFC107" textAnchor="middle" fontWeight="bold"
                    >
                      ${usd30[hoveredChartIdx].toFixed(1)}
                    </text>
                    <text
                      x={Math.min(toX(hoveredChartIdx), SVG_W - 50)}
                      y={toY(usd30[hoveredChartIdx]) - 5}
                      fontSize="9" fill="#6b8ab5" textAnchor="middle"
                    >
                      Día {hoveredChartIdx + 1}
                    </text>
                  </g>
                </>
              )}
            </svg>

            {/* Bottom text */}
            <p className="text-xs text-slate-400 text-center mt-3">
              Durante los últimos 30 días el dólar ha variado{' '}
              <span className={`font-bold ${varPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {varPct >= 0 ? '+' : ''}{varPct.toFixed(2)}%
              </span>
              , pasando de ${usd30[0].toFixed(0)} a ${usd30[29].toFixed(0)} CLP.
            </p>
          </div>
        </section>

        {/* ─── Sección 3: Radar Financiero ─── */}
        <section>
          <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
            Radar Financiero
          </h3>
          <div className="bg-gradient-to-b from-[#0d1f3a] to-[#071228] rounded-2xl p-5 border border-tradelearn-gold/20">
            {commodities.map((c) => (
              <CommodityRow key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* ─── Sección 4: Semáforo ─── */}
        <section>
          <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
            Semáforo Económico
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {lights.map((l) => (
              <div
                key={l.label}
                className={`rounded-xl p-4 border-2 flex items-center gap-4 ${lightBg[l.color]}`}
              >
                <span className="text-2xl flex-shrink-0">{lightColors[l.color]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${lightText[l.color]}`}>
                      {l.icon} {l.label}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Sección 5: AI Analysis ─── */}
        <section>
          <h3 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-tradelearn-gold rounded-full" />
            Inteligencia Artificial
          </h3>

          <button
            onClick={generateAI}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-tradelearn-gold to-yellow-500 hover:from-tradelearn-accent hover:to-yellow-600 disabled:opacity-60 text-tradelearn-navy font-bold py-4 rounded-2xl transition text-base shadow-[0_0_20px_rgba(255,193,7,0.3)]"
          >
            <Brain size={20} />
            {aiLoading ? 'Analizando mercado...' : 'Interpretar Mercado con IA'}
          </button>

          {aiLoading && (
            <div className="mt-4 bg-[#0d1f3a] rounded-2xl p-5 border border-tradelearn-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-tradelearn-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Procesando datos del mercado...</p>
              </div>
              <div className="mt-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3 bg-tradelearn-gold/10 rounded-full animate-pulse"
                    style={{ width: `${[100, 80, 60][i - 1]}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {aiText && !aiLoading && (
            <div className="mt-4 bg-gradient-to-br from-[#0d1f3a] to-[#071228] rounded-2xl p-5 border-2 border-tradelearn-gold/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-tradelearn-gold/20 flex items-center justify-center flex-shrink-0">
                  <Brain size={18} className="text-tradelearn-gold" />
                </div>
                <div>
                  <p className="text-tradelearn-gold font-bold text-sm">Análisis de Mercado</p>
                  <p className="text-xs text-slate-500">{timeFmt} — Actualizado</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{aiText}</p>
              <div className="mt-4 pt-4 border-t border-tradelearn-gold/20 grid grid-cols-4 gap-2">
                {['Estudiantes', 'Inversores', 'Importadores', 'Riesgo'].map((tag) => (
                  <span
                    key={tag}
                    className="text-center text-[10px] font-bold text-tradelearn-gold/70 bg-tradelearn-gold/10 rounded-lg py-1 px-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
