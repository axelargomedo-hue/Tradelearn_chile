import { useState } from 'react';
import Header from '../components/Header';
import { Download, Upload, Ship, Plane, FileText } from 'lucide-react';

type Mode = 'import' | 'export';

interface ImportState {
  fob: string;
  country: string;
  tariffCode: string;
  freight: string;
  insurance: string;
}

interface ExportState {
  fob: string;
  destination: string;
  freight: string;
  insurance: string;
  exportCosts: string;
  transportMode: string;
}

interface ImportResult {
  fob: number;
  freight: number;
  insurance: number;
  cif: number;
  tariff: number;
  tariffRate: number;
  iva: number;
  total: number;
  tariffType: string;
}

interface ExportResult {
  fob: number;
  freight: number;
  insurance: number;
  exportCosts: number;
  cif: number;
  totalCost: number;
  netRevenue: number;
}

interface ImportCalculatorProps {
  onBack: () => void;
}

export default function ImportCalculator({ onBack }: ImportCalculatorProps) {
  const [mode, setMode] = useState<Mode>('import');

  const [importValues, setImportValues] = useState<ImportState>({
    fob: '5000',
    country: 'china',
    tariffCode: '8471.30.00',
    freight: '500',
    insurance: '',
  });

  const [exportValues, setExportValues] = useState<ExportState>({
    fob: '10000',
    destination: 'usa',
    freight: '800',
    insurance: '',
    exportCosts: '150',
    transportMode: 'sea',
  });

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const importCountries: Record<string, { tlc: boolean; name: string }> = {
    china: { tlc: true, name: '🇨🇳 China (TLC — 0%)' },
    usa: { tlc: true, name: '🇺🇸 Estados Unidos (TLC — 0%)' },
    ue: { tlc: true, name: '🇪🇺 Unión Europea (TLC — 0%)' },
    brasil: { tlc: false, name: '🇧🇷 Brasil / Mercosur (6%)' },
    otro: { tlc: false, name: '🌍 Otro país (NMF — 6%)' },
  };

  const exportDestinations: Record<string, { tlc: boolean; name: string }> = {
    usa: { tlc: true, name: '🇺🇸 Estados Unidos (TLC vigente)' },
    china: { tlc: true, name: '🇨🇳 China (TLC vigente)' },
    ue: { tlc: true, name: '🇪🇺 Unión Europea (TLC vigente)' },
    brasil: { tlc: false, name: '🇧🇷 Brasil / Mercosur (sin TLC bilateral)' },
    otro: { tlc: false, name: '🌍 Otro destino' },
  };

  const handleImportChange = (field: keyof ImportState, value: string) => {
    setImportValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportChange = (field: keyof ExportState, value: string) => {
    setExportValues((prev) => ({ ...prev, [field]: value }));
  };

  const calculateImport = () => {
    const fob = parseFloat(importValues.fob) || 0;
    const freight = parseFloat(importValues.freight) || 0;
    const insuranceVal = parseFloat(importValues.insurance) || fob * 0.01;
    const cif = fob + freight + insuranceVal;

    const country = importCountries[importValues.country];
    const tariffRate = country.tlc || importValues.tariffCode === '8471.30.00' ? 0 : 0.06;
    const tariff = cif * tariffRate;
    const iva = (cif + tariff) * 0.19;
    const total = cif + tariff + iva;

    setImportResult({
      fob,
      freight,
      insurance: insuranceVal,
      cif,
      tariff,
      tariffRate,
      iva,
      total,
      tariffType: tariffRate === 0 ? 'TLC — 0%' : 'NMF — 6%',
    });
  };

  const calculateExport = () => {
    const fob = parseFloat(exportValues.fob) || 0;
    const freight = parseFloat(exportValues.freight) || 0;
    const insuranceVal = parseFloat(exportValues.insurance) || fob * 0.01;
    const exportCostsVal = parseFloat(exportValues.exportCosts) || 0;
    const cif = fob + freight + insuranceVal;
    const totalCost = cif + exportCostsVal;
    const netRevenue = fob - exportCostsVal;

    setExportResult({
      fob,
      freight,
      insurance: insuranceVal,
      exportCosts: exportCostsVal,
      cif,
      totalCost,
      netRevenue,
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const inputClass =
    'w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition';
  const labelClass =
    'text-xs uppercase tracking-widest font-bold text-tradelearn-gold mb-2 block';

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Calculadora Comex"
        subtitle="Calcula costos de importación y exportación"
        onBack={onBack}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-tradelearn-dark rounded-xl p-1.5 border border-slate-700">
          <button
            onClick={() => setMode('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
              mode === 'import'
                ? 'bg-tradelearn-blue text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download size={18} />
            Importación
          </button>
          <button
            onClick={() => setMode('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
              mode === 'export'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={18} />
            Exportación
          </button>
        </div>

        {/* Import Mode */}
        {mode === 'import' && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Valor FOB (USD)</label>
                <input
                  type="number"
                  value={importValues.fob}
                  onChange={(e) => handleImportChange('fob', e.target.value)}
                  placeholder="Ej: 5000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>País de Origen</label>
                <select
                  value={importValues.country}
                  onChange={(e) => handleImportChange('country', e.target.value)}
                  className={inputClass}
                >
                  {Object.entries(importCountries).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Fracción Arancelaria</label>
                <input
                  type="text"
                  value={importValues.tariffCode}
                  onChange={(e) => handleImportChange('tariffCode', e.target.value)}
                  placeholder="Ej: 8471.30.00"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Flete (USD)</label>
                  <input
                    type="number"
                    value={importValues.freight}
                    onChange={(e) => handleImportChange('freight', e.target.value)}
                    placeholder="Ej: 500"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Seguro (USD)</label>
                  <input
                    type="number"
                    value={importValues.insurance}
                    onChange={(e) => handleImportChange('insurance', e.target.value)}
                    placeholder="Auto: 1% FOB"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                onClick={calculateImport}
                className="w-full bg-gradient-to-r from-tradelearn-blue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-lg transition text-lg"
              >
                Calcular Costo Total →
              </button>
            </div>

            {importResult && (
              <div className="bg-gradient-to-br from-tradelearn-navy to-tradelearn-dark rounded-2xl p-6 text-white animate-fadeIn border-2 border-tradelearn-blue/40">
                <h3 className="text-sm uppercase font-bold mb-6 opacity-90 text-tradelearn-blue flex items-center gap-2">
                  <Download size={16} /> Resultado Importación
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Valor FOB</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(importResult.fob)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Flete</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(importResult.freight)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Seguro</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(importResult.insurance)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Valor CIF</span>
                    <span className="font-bold text-tradelearn-blue">{formatCurrency(importResult.cif)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Arancel ({importResult.tariffType})</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(importResult.tariff)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                    <span className="opacity-80">IVA (19%)</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(importResult.iva)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Costo Total Estimado</span>
                    <span className="text-3xl font-bold text-tradelearn-gold">
                      {formatCurrency(importResult.total)}
                    </span>
                  </div>
                </div>

                <div className="bg-tradelearn-navy/80 rounded-lg p-4 mt-6 border border-slate-700">
                  <p className="text-xs uppercase font-bold mb-3 opacity-75 text-tradelearn-gold">Desglose Porcentual</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Costo base (CIF):</span>
                      <span>{((importResult.cif / importResult.total) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arancel:</span>
                      <span>{((importResult.tariff / importResult.total) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA:</span>
                      <span>{((importResult.iva / importResult.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Export Mode */}
        {mode === 'export' && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Valor FOB de la mercancía (USD)</label>
                <input
                  type="number"
                  value={exportValues.fob}
                  onChange={(e) => handleExportChange('fob', e.target.value)}
                  placeholder="Ej: 10000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>País de Destino</label>
                <select
                  value={exportValues.destination}
                  onChange={(e) => handleExportChange('destination', e.target.value)}
                  className={inputClass}
                >
                  {Object.entries(exportDestinations).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Medio de Transporte</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleExportChange('transportMode', 'sea')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                      exportValues.transportMode === 'sea'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-tradelearn-navy border-slate-600 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Ship size={18} /> Marítimo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportChange('transportMode', 'air')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                      exportValues.transportMode === 'air'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-tradelearn-navy border-slate-600 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Plane size={18} /> Aéreo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Flete (USD)</label>
                  <input
                    type="number"
                    value={exportValues.freight}
                    onChange={(e) => handleExportChange('freight', e.target.value)}
                    placeholder="Ej: 800"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Seguro (USD)</label>
                  <input
                    type="number"
                    value={exportValues.insurance}
                    onChange={(e) => handleExportChange('insurance', e.target.value)}
                    placeholder="Auto: 1% FOB"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Costos de Exportación (USD)</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    value={exportValues.exportCosts}
                    onChange={(e) => handleExportChange('exportCosts', e.target.value)}
                    placeholder="DUSD, legalized docs, etc. Ej: 150"
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 pl-1">
                  Documentación, legalize, tramitación aduanera, manejo portuario
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-2">
                <span className="text-emerald-400 text-xs font-bold mt-0.5">INFO</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Las exportaciones desde Chile están exentas de IVA y no pagan arancel de salida.
                  El comprador en el país destino asume los impuestos de importación locales.
                </p>
              </div>

              <button
                onClick={calculateExport}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition text-lg"
              >
                Calcular Exportación →
              </button>
            </div>

            {exportResult && (
              <div className="bg-gradient-to-br from-tradelearn-navy to-tradelearn-dark rounded-2xl p-6 text-white animate-fadeIn border-2 border-emerald-500/40">
                <h3 className="text-sm uppercase font-bold mb-6 opacity-90 text-emerald-400 flex items-center gap-2">
                  <Upload size={16} /> Resultado Exportación
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Valor FOB</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(exportResult.fob)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Flete</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(exportResult.freight)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Seguro</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(exportResult.insurance)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Valor CIF</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(exportResult.cif)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Costos de Exportación</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(exportResult.exportCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">IVA</span>
                    <span className="font-bold text-emerald-400">Exento (0%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="opacity-80">Arancel de Salida</span>
                    <span className="font-bold text-emerald-400">No aplica</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                    <span className="opacity-80">Costo Total de Exportación</span>
                    <span className="font-bold text-tradelearn-gold">{formatCurrency(exportResult.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Ingreso Neto al Exportador</span>
                    <span className={`text-3xl font-bold ${exportResult.netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(exportResult.netRevenue)}
                    </span>
                  </div>
                </div>

                <div className="bg-tradelearn-navy/80 rounded-lg p-4 mt-6 border border-slate-700">
                  <p className="text-xs uppercase font-bold mb-3 opacity-75 text-tradelearn-gold">Desglose Porcentual</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>FOB (mercancía):</span>
                      <span>{((exportResult.fob / exportResult.totalCost) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flete:</span>
                      <span>{((exportResult.freight / exportResult.totalCost) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seguro:</span>
                      <span>{((exportResult.insurance / exportResult.totalCost) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costos de exportación:</span>
                      <span>{((exportResult.exportCosts / exportResult.totalCost) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
