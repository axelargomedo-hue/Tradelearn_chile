import { useState, useEffect } from 'react';
import ModuleCard from '../components/ModuleCard';
import { TrendingUp, TrendingDown, UserRound, Shield } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

function useLiveIndicators() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const noise = (base: number, pct: number) =>
    base + base * (Math.random() - 0.5) * pct * 0.3;

  return {
    usd: noise(936.5, 0.01),
    uf: noise(37842.15, 0.002),
    ipc: 4.2,
    tpm: 5.25,
    copper: noise(4.18, 0.015),
    tick,
  };
}

export default function Home({ onNavigate }: HomeProps) {
  const indicators = useLiveIndicators();

  const fmt = (v: number, dec = 0) =>
    new Intl.NumberFormat('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const usdDelta = (indicators.usd - 936.5) / 9.365;
  const ufDelta = (indicators.uf - 37842.15) / 378.4215;

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
        {/* Featured Financial Panel */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-3">
            Panel Financiero Chile
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
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">En Vivo</span>
                </div>
                <span className="text-xs text-tradelearn-gold/60 font-semibold bg-tradelearn-gold/10 px-3 py-1 rounded-full">
                  Dashboard Completo →
                </span>
              </div>

              {/* Indicators Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* USD */}
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">USD/CLP</p>
                  <p className="text-lg font-bold text-tradelearn-gold">${fmt(indicators.usd)}</p>
                  <div className={`flex items-center gap-1 mt-1 ${usdDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {usdDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span className="text-[10px] font-bold">
                      {usdDelta >= 0 ? '+' : ''}{usdDelta.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* UF */}
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">UF</p>
                  <p className="text-lg font-bold text-tradelearn-gold">{fmt(indicators.uf)}</p>
                  <div className={`flex items-center gap-1 mt-1 ${ufDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ufDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span className="text-[10px] font-bold">
                      {ufDelta >= 0 ? '+' : ''}{ufDelta.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Copper */}
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">COBRE</p>
                  <p className="text-lg font-bold text-tradelearn-gold">{fmt(indicators.copper, 2)}</p>
                  <div className="flex items-center gap-1 mt-1 text-slate-400">
                    <span className="text-[10px] font-bold">USD/lb</span>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">IPC anual</p>
                  <p className="text-base font-bold text-amber-400">{indicators.ipc}%</p>
                </div>
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">TPM</p>
                  <p className="text-base font-bold text-tradelearn-blue">{indicators.tpm}%</p>
                </div>
                <div className="bg-tradelearn-navy/60 rounded-xl p-3 border border-tradelearn-gold/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[10px] text-tradelearn-gold uppercase font-bold">Ver Todo</p>
                    <p className="text-2xl">→</p>
                  </div>
                </div>
              </div>
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
          <div className="space-y-3">
            <div className="bg-tradelearn-navy rounded-lg p-4 border-l-4 border-tradelearn-gold hover:bg-slate-800 transition cursor-pointer">
              <p className="font-bold text-tradelearn-gold">2204.21.00</p>
              <p className="text-sm text-slate-300">Vino de uvas frescas, ≤2L</p>
              <p className="text-xs text-tradelearn-blue mt-2">Arancel: 6% • TLC: 0% (UE, USA)</p>
            </div>
            <div className="bg-tradelearn-navy rounded-lg p-4 border-l-4 border-tradelearn-blue hover:bg-slate-800 transition cursor-pointer">
              <p className="font-bold text-tradelearn-gold">8471.30.00</p>
              <p className="text-sm text-slate-300">Computadoras portátiles &lt;10kg</p>
              <p className="text-xs text-tradelearn-blue mt-2">Arancel: 0% • TLC: 0% (todos)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
