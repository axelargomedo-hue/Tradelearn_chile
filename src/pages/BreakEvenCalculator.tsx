import { useState, useMemo } from 'react';
import Header from '../components/Header';

interface BreakEvenCalculatorProps {
  onBack: () => void;
}

export default function BreakEvenCalculator({ onBack }: BreakEvenCalculatorProps) {
  const [initialInvestment, setInitialInvestment] = useState(50000);
  const [monthlyFixed, setMonthlyFixed] = useState(5000);
  const [sellingPrice, setSellingPrice] = useState(45);
  const [monthlyUnits, setMonthlyUnits] = useState(2000);
  const [variableCostSlider, setVariableCostSlider] = useState(15);
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);

  const maxVarCost = sellingPrice > 0 ? Math.floor(sellingPrice * 0.95) : 100;

  const result = useMemo(() => {
    const vc = variableCostSlider;
    const cm = sellingPrice - vc;
    if (cm <= 0) {
      return {
        contributionMargin: 0,
        breakEvenUnits: Infinity,
        breakEvenSales: Infinity,
        monthlyProfit: -monthlyFixed,
        recoveryMonths: Infinity,
        monthlyRevenue: monthlyUnits * sellingPrice,
        monthlyVariable: monthlyUnits * vc,
        monthlyContribution: 0,
        isViable: false,
      };
    }
    const breakEvenUnits = Math.ceil(monthlyFixed / cm);
    const breakEvenSales = breakEvenUnits * sellingPrice;
    const monthlyRevenue = monthlyUnits * sellingPrice;
    const monthlyVariable = monthlyUnits * vc;
    const monthlyContribution = monthlyUnits * cm;
    const monthlyProfit = monthlyContribution - monthlyFixed;
    const recoveryMonths =
      monthlyProfit > 0 ? Math.ceil(initialInvestment / monthlyProfit) : Infinity;

    return {
      contributionMargin: cm,
      breakEvenUnits,
      breakEvenSales,
      monthlyProfit,
      recoveryMonths,
      monthlyRevenue,
      monthlyVariable,
      monthlyContribution,
      isViable: true,
    };
  }, [initialInvestment, monthlyFixed, variableCostSlider, sellingPrice, monthlyUnits]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(v);

  const fmtShort = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };

  // Chart data generation
  const chartMaxUnits = result.isViable
    ? Math.max(result.breakEvenUnits * 1.8, monthlyUnits * 1.3)
    : monthlyUnits * 1.5;

  const chartPoints = 50;
  const chartData = useMemo(() => {
    const pts: { units: number; costs: number; revenue: number }[] = [];
    for (let i = 0; i <= chartPoints; i++) {
      const u = (i / chartPoints) * chartMaxUnits;
      pts.push({
        units: Math.round(u),
        costs: monthlyFixed + u * variableCostSlider,
        revenue: u * sellingPrice,
      });
    }
    return pts;
  }, [chartMaxUnits, monthlyFixed, variableCostSlider, sellingPrice]);

  const chartMaxValue = Math.max(
    ...chartData.map((d) => Math.max(d.costs, d.revenue)),
    1
  );

  const svgW = 400;
  const svgH = 260;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const toX = (units: number) => padL + (units / chartMaxUnits) * plotW;
  const toY = (val: number) => padT + plotH - (val / chartMaxValue) * plotH;

  // Break-even marker position
  const beX = result.isViable ? toX(result.breakEvenUnits) : 0;
  const beY = result.isViable ? toY(result.breakEvenSales) : 0;

  // Hovered point data
  const hoveredData = hoveredUnit !== null
    ? {
        units: hoveredUnit,
        costs: monthlyFixed + hoveredUnit * variableCostSlider,
        revenue: hoveredUnit * sellingPrice,
        profit: hoveredUnit * (sellingPrice - variableCostSlider) - monthlyFixed,
      }
    : null;

  const hoveredX = hoveredUnit !== null ? toX(hoveredUnit) : 0;
  const hoveredY = hoveredUnit !== null ? toY(Math.max(hoveredData!.costs, hoveredData!.revenue)) : 0;

  // Scenario projections
  const scenarios = useMemo(() => {
    if (!result.isViable) return null;
    const conservative = Math.round(monthlyUnits * 0.6);
    const realistic = monthlyUnits;
    const optimistic = Math.round(monthlyUnits * 1.4);
    const calc = (units: number) => {
      const profit = units * result.contributionMargin - monthlyFixed;
      const recovery = profit > 0 ? Math.ceil(initialInvestment / profit) : Infinity;
      const roi = profit > 0 ? ((profit * 12) / initialInvestment) * 100 : 0;
      return { units, profit, recovery, roi };
    };
    return {
      conservative: calc(conservative),
      realistic: calc(realistic),
      optimistic: calc(optimistic),
    };
  }, [result, monthlyUnits, initialInvestment, monthlyFixed]);

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Punto de Equilibrio"
        subtitle="Analisis de rentabilidad e inversion"
        onBack={onBack}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Input Form */}
        <section className="mb-8">
          <h3 className="text-sm uppercase tracking-widest font-bold text-tradelearn-gold mb-4">
            Parametros de Negocio
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-2 block">
                Inversion Inicial (CLP)
              </label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)}
                placeholder="Inventario, aduanas, transporte"
                className="w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-2 block">
                Costos Fijos Mensuales (CLP)
              </label>
              <input
                type="number"
                value={monthlyFixed}
                onChange={(e) => setMonthlyFixed(parseFloat(e.target.value) || 0)}
                placeholder="Arriendo, sueldos, servicios"
                className="w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-2 block">
                  Precio Venta/Unidad
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setSellingPrice(v);
                    if (variableCostSlider >= v * 0.95) {
                      setVariableCostSlider(Math.floor(v * 0.6));
                    }
                  }}
                  placeholder="Precio unitario"
                  className="w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-2 block">
                  Ventas Mensuales (Unids)
                </label>
                <input
                  type="number"
                  value={monthlyUnits}
                  onChange={(e) => setMonthlyUnits(parseFloat(e.target.value) || 0)}
                  placeholder="Proyeccion de ventas"
                  className="w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition"
                />
              </div>
            </div>

            {/* Interactive Variable Cost Slider */}
            <div className="bg-tradelearn-navy/80 rounded-2xl p-5 border-2 border-tradelearn-gold/30">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold">
                  Costo Variable por Unidad
                </label>
                <span className="text-lg font-bold text-tradelearn-gold">
                  ${variableCostSlider.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={maxVarCost}
                step="0.5"
                value={variableCostSlider}
                onChange={(e) => setVariableCostSlider(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>$0</span>
                <span className="text-slate-400">
                  Margen: ${result.contributionMargin.toLocaleString()}/unid
                </span>
                <span>${maxVarCost.toLocaleString()}</span>
              </div>

              {/* Visual margin bar */}
              <div className="mt-4 h-6 bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: `${sellingPrice > 0 ? (result.contributionMargin / sellingPrice) * 100 : 0}%`,
                  }}
                >
                  {result.contributionMargin / sellingPrice > 0.15 && (
                    <span className="text-[10px] font-bold text-white">
                      {((result.contributionMargin / sellingPrice) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: `${sellingPrice > 0 ? (variableCostSlider / sellingPrice) * 100 : 0}%`,
                  }}
                >
                  {variableCostSlider / sellingPrice > 0.15 && (
                    <span className="text-[10px] font-bold text-white">
      Costo {(variableCostSlider / sellingPrice * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-emerald-400 font-semibold">Ganancia</span>
                <span className="text-red-400 font-semibold">Costo</span>
              </div>

              {!result.isViable && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-xs font-bold">
                    Costo variable igual o mayor al precio de venta. Sin margen de contribucion.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results — always visible, updates in real-time */}
        <section className="mb-8">
          <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
            Indicadores Clave
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
              <span className="text-3xl mb-2 block">📊</span>
              <p className="text-sm opacity-90 font-medium">Unidades en Equilibrio</p>
              <p className="text-2xl font-bold mt-1">
                {result.isViable ? result.breakEvenUnits.toLocaleString() : '—'}
                <span className="text-sm ml-1">unids</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-lg">
              <span className="text-3xl mb-2 block">💰</span>
              <p className="text-sm opacity-90 font-medium">Margen por Unidad</p>
              <p className="text-2xl font-bold mt-1">
                ${result.contributionMargin.toLocaleString()}
                <span className="text-sm ml-1">CLP</span>
              </p>
            </div>

            <div
              className={`${
                result.monthlyProfit > 0
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
              } text-white rounded-2xl p-5 shadow-lg`}
            >
              <span className="text-3xl mb-2 block">
                {result.monthlyProfit > 0 ? '📈' : '📉'}
              </span>
              <p className="text-sm opacity-90 font-medium">Beneficio Mensual</p>
              <p className="text-2xl font-bold mt-1">
                {result.monthlyProfit > 0 ? '+' : ''}
                {fmt(result.monthlyProfit)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
              <span className="text-3xl mb-2 block">⏱️</span>
              <p className="text-sm opacity-90 font-medium">Meses Recuperacion</p>
              <p className="text-2xl font-bold mt-1">
                {result.recoveryMonths === Infinity
                  ? '—'
                  : result.recoveryMonths.toLocaleString()}
                <span className="text-sm ml-1">meses</span>
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Chart */}
        <section className="mb-8">
          <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
            Analisis Grafico
          </h3>
          <div
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative"
            onMouseLeave={() => setHoveredUnit(null)}
          >
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const y = padT + plotH * (1 - frac);
                return (
                  <g key={`g-${frac}`}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text x={padL - 8} y={y + 4} fontSize="10" fill="#64748b" textAnchor="end">
                      {fmtShort(chartMaxValue * frac)}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                const x = padL + plotW * frac;
                return (
                  <text
                    key={`xl-${frac}`}
                    x={x}
                    y={svgH - padB + 16}
                    fontSize="10"
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {Math.round(chartMaxUnits * frac).toLocaleString()}
                  </text>
                );
              })}

              {/* Axes */}
              <line
                x1={padL}
                y1={padT + plotH}
                x2={svgW - padR}
                y2={padT + plotH}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              <line
                x1={padL}
                y1={padT}
                x2={padL}
                y2={padT + plotH}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />

              {/* Axis titles */}
              <text x={svgW / 2} y={svgH - 2} fontSize="11" fill="#94a3b8" textAnchor="middle">
                Unidades Vendidas
              </text>
              <text
                x={12}
                y={svgH / 2}
                fontSize="11"
                fill="#94a3b8"
                textAnchor="middle"
                transform={`rotate(-90, 12, ${svgH / 2})`}
              >
                Monto (CLP)
              </text>

              {/* Cost line area fill */}
              <polygon
                points={chartData
                  .map((d) => `${toX(d.units)},${toY(d.costs)}`)
                  .join(' ')}
                fill="rgba(248,113,113,0.08)"
              />

              {/* Revenue line area fill */}
              <polygon
                points={chartData
                  .map((d) => `${toX(d.units)},${toY(d.revenue)}`)
                  .join(' ')}
                fill="rgba(16,185,129,0.08)"
              />

              {/* Cost line */}
              <polyline
                points={chartData
                  .map((d) => `${toX(d.units)},${toY(d.costs)}`)
                  .join(' ')}
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Revenue line */}
              <polyline
                points={chartData
                  .map((d) => `${toX(d.units)},${toY(d.revenue)}`)
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Break-even guide lines */}
              {result.isViable && (
                <>
                  <line
                    x1={beX}
                    y1={beY}
                    x2={beX}
                    y2={padT + plotH}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <line
                    x1={padL}
                    y1={beY}
                    x2={beX}
                    y2={beY}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                </>
              )}

              {/* Break-even marker */}
              {result.isViable && (
                <g>
                  <circle cx={beX} cy={beY} r="8" fill="#06b6d4" opacity="0.25" />
                  <circle cx={beX} cy={beY} r="5" fill="#06b6d4" stroke="#fff" strokeWidth="2" />
                  <text
                    x={beX}
                    y={beY - 14}
                    fontSize="11"
                    fill="#06b6d4"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    PE: {result.breakEvenUnits.toLocaleString()} unids
                  </text>
                </g>
              )}

              {/* Hover crosshair */}
              {hoveredData && (
                <>
                  <line
                    x1={hoveredX}
                    y1={padT}
                    x2={hoveredX}
                    y2={padT + plotH}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                  <circle
                    cx={hoveredX}
                    cy={toY(hoveredData!.costs)}
                    r="4"
                    fill="#f87171"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={hoveredX}
                    cy={toY(hoveredData!.revenue)}
                    r="4"
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </svg>

            {/* Hover tooltip */}
            {hoveredData && (
              <div
                className="absolute bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-xs shadow-xl pointer-events-none z-10"
                style={{
                  left: `${Math.min((hoveredX / svgW) * 100, 70)}%`,
                  top: `${Math.min((hoveredY / svgH) * 100, 60)}%`,
                }}
              >
                <p className="font-bold text-white mb-1">
                  {hoveredData.units.toLocaleString()} unidades
                </p>
                <p className="text-emerald-400">
                  Ingresos: {fmt(hoveredData.revenue)}
                </p>
                <p className="text-red-400">
                  Costos: {fmt(hoveredData.costs)}
                </p>
                <p
                  className={`font-bold ${
                    hoveredData.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  Utilidad: {hoveredData.profit >= 0 ? '+' : ''}
                  {fmt(hoveredData.profit)}
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-1 bg-red-400 rounded"></span>
                <span className="text-slate-400">Costos</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-1 bg-emerald-500 rounded"></span>
                <span className="text-slate-400">Ingresos</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 bg-cyan-400 rounded-full"></span>
                <span className="text-slate-400">Equilibrio</span>
              </div>
            </div>

            {/* Invisible overlay for mouse tracking */}
            <div
              className="absolute inset-0 cursor-crosshair"
              style={{ zIndex: 5 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const xPct = (e.clientX - rect.left) / rect.width;
                const yPct = (e.clientY - rect.top) / rect.height;
                const units = Math.round(
                  ((xPct * svgW - padL) / plotW) * chartMaxUnits
                );
                if (units >= 0 && units <= chartMaxUnits && yPct > 0 && yPct < 1) {
                  setHoveredUnit(units);
                } else {
                  setHoveredUnit(null);
                }
              }}
            />
          </div>
        </section>

        {/* Financial Breakdown */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8">
          <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
            Desglose Financiero
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Punto Equilibrio (Unidades)</span>
              <span className="font-bold text-cyan-400">
                {result.isViable ? result.breakEvenUnits.toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Punto Equilibrio (Ventas)</span>
              <span className="font-bold text-cyan-400">
                {result.isViable ? fmt(result.breakEvenSales) : '—'}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Ingresos Mensuales</span>
              <span className="font-bold text-emerald-400">
                +{fmt(result.monthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Costos Variables Mensuales</span>
              <span className="font-bold text-red-400">
                -{fmt(result.monthlyVariable)}
              </span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Costos Fijos Mensuales</span>
              <span className="font-bold text-red-400">
                -{fmt(monthlyFixed)}
              </span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-lg font-bold text-slate-300">Utilidad Mensual</span>
              <span
                className={`text-2xl font-bold ${
                  result.monthlyProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.monthlyProfit > 0 ? '+' : ''}
                {fmt(result.monthlyProfit)}
              </span>
            </div>
          </div>
        </section>

        {/* Scenario Simulator */}
        {scenarios && (
          <section className="mb-8">
            <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
              Simulador de Escenarios
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Conservative */}
              <div className="bg-slate-800 rounded-xl p-4 border border-amber-500/30">
                <p className="text-xs font-bold text-amber-400 uppercase mb-2">Conservador</p>
                <p className="text-lg font-bold text-white">
                  {scenarios.conservative.units.toLocaleString()}
                  <span className="text-xs text-slate-400 ml-1">unids/mes</span>
                </p>
                <p
                  className={`text-sm font-bold mt-2 ${
                    scenarios.conservative.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {scenarios.conservative.profit >= 0 ? '+' : ''}
                  {fmt(scenarios.conservative.profit)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {scenarios.conservative.recovery === Infinity
                    ? 'Sin recuperacion'
                    : `${scenarios.conservative.recovery} meses`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ROI: {scenarios.conservative.roi.toFixed(1)}% anual
                </p>
              </div>

              {/* Realistic */}
              <div className="bg-slate-800 rounded-xl p-4 border border-cyan-500/30">
                <p className="text-xs font-bold text-cyan-400 uppercase mb-2">Realista</p>
                <p className="text-lg font-bold text-white">
                  {scenarios.realistic.units.toLocaleString()}
                  <span className="text-xs text-slate-400 ml-1">unids/mes</span>
                </p>
                <p
                  className={`text-sm font-bold mt-2 ${
                    scenarios.realistic.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {scenarios.realistic.profit >= 0 ? '+' : ''}
                  {fmt(scenarios.realistic.profit)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {scenarios.realistic.recovery === Infinity
                    ? 'Sin recuperacion'
                    : `${scenarios.realistic.recovery} meses`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ROI: {scenarios.realistic.roi.toFixed(1)}% anual
                </p>
              </div>

              {/* Optimistic */}
              <div className="bg-slate-800 rounded-xl p-4 border border-emerald-500/30">
                <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Optimista</p>
                <p className="text-lg font-bold text-white">
                  {scenarios.optimistic.units.toLocaleString()}
                  <span className="text-xs text-slate-400 ml-1">unids/mes</span>
                </p>
                <p
                  className={`text-sm font-bold mt-2 ${
                    scenarios.optimistic.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {scenarios.optimistic.profit >= 0 ? '+' : ''}
                  {fmt(scenarios.optimistic.profit)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {scenarios.optimistic.recovery === Infinity
                    ? 'Sin recuperacion'
                    : `${scenarios.optimistic.recovery} meses`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ROI: {scenarios.optimistic.roi.toFixed(1)}% anual
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Investment Recovery Detail */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-4">
            Recuperacion de Inversion
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Inversion Inicial</span>
              <span className="font-bold text-white">{fmt(initialInvestment)}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-slate-700">
              <span className="text-slate-300">Utilidad Mensual</span>
              <span
                className={`font-bold ${
                  result.monthlyProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.monthlyProfit > 0 ? '+' : ''}
                {fmt(result.monthlyProfit)}
              </span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-slate-300">Tiempo de Recuperacion</span>
              <span className="font-bold text-cyan-400 text-lg">
                {result.recoveryMonths === Infinity
                  ? 'Sin recuperacion'
                  : `${result.recoveryMonths} meses`}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
