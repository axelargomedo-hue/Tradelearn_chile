import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Tariff {
  code: string;
  description: string;
  rate: string;
  tlcs: string;
  umeasure: string;
}

const FALLBACK_TARIFFS: Tariff[] = [
  { code: '0101.21.00', description: 'Caballos vivos reproductores de pura raza', rate: '6%', tlcs: '0% (UE, USA, China)', umeasure: 'Unidad' },
  { code: '0201.10.00', description: 'Carne de bovino en canales, fresca o refrigerada', rate: '6%', tlcs: '0% (UE, USA)', umeasure: 'Kg' },
  { code: '0302.11.00', description: 'Truchas frescas o refrigeradas', rate: '0%', tlcs: '0% (todos)', umeasure: 'Kg' },
  { code: '0803.90.00', description: 'Bananas y plátanos frescos', rate: '6%', tlcs: '0% (China, UE, USA)', umeasure: 'Kg' },
  { code: '0901.11.00', description: 'Café sin tostar ni descafeinar', rate: '6%', tlcs: '0% (Colombia, UE)', umeasure: 'Kg' },
  { code: '1507.10.00', description: 'Aceite de soja en bruto, sin modificar', rate: '6%', tlcs: '0% (USA)', umeasure: 'Kg' },
  { code: '2204.21.00', description: 'Vino de uvas frescas, en recipientes ≤2L', rate: '6%', tlcs: '0% (UE, USA)', umeasure: 'Litro' },
  { code: '2710.12.00', description: 'Gasolinas y demás preparaciones para motor', rate: '6%', tlcs: '0% (USA, UE)', umeasure: 'Litro' },
  { code: '3004.20.00', description: 'Medicamentos con antibióticos para uso humano', rate: '6%', tlcs: '0% (UE, USA, China)', umeasure: 'Kg' },
  { code: '3923.30.00', description: 'Garrafas, botellas, frascos de plástico', rate: '6%', tlcs: '0% (China, UE)', umeasure: 'Kg' },
  { code: '6109.10.00', description: 'Camisetas de algodón, de punto', rate: '6%', tlcs: '0% (China, UE)', umeasure: 'Unidad' },
  { code: '6203.42.00', description: 'Pantalones de algodón para hombres', rate: '6%', tlcs: '0% (UE, USA, China)', umeasure: 'Unidad' },
  { code: '7108.12.00', description: 'Oro en bruto para uso no monetario', rate: '0%', tlcs: '0% (todos)', umeasure: 'Kg' },
  { code: '8414.51.00', description: 'Ventiladores de mesa, pared o techo con motor', rate: '0%', tlcs: '0% (China, UE)', umeasure: 'Unidad' },
  { code: '8471.30.00', description: 'Computadoras portátiles de peso ≤10 kg', rate: '0%', tlcs: '0% (todos los TLCs)', umeasure: 'Unidad' },
  { code: '8517.12.00', description: 'Teléfonos celulares o de redes inalámbricas', rate: '0%', tlcs: '0% (todos los TLCs)', umeasure: 'Unidad' },
  { code: '8703.23.00', description: 'Automóviles con motor de émbolo 1500–3000cc', rate: '6%', tlcs: '0% (UE, USA)', umeasure: 'Unidad' },
];

function rateToLabel(rate: number): string {
  const formatted = Number.isInteger(rate) ? String(rate) : rate.toFixed(1);
  return `${formatted}%`;
}

export async function logSearch(term: string, resultsCount: number) {
  const clean = term.trim().slice(0, 120);
  if (!clean) return;
  await supabase.from('search_history').insert({
    term: clean,
    results_count: resultsCount,
  });
}

interface TariffSearchProps {
  onBack: () => void;
}

export default function TariffSearch({ onBack }: TariffSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [tariffs, setTariffs] = useState<Tariff[]>(FALLBACK_TARIFFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('tariff_items')
        .select('code, description, rate, tlcs, unit_measure')
        .order('code', { ascending: true });

      if (cancelled) return;

      if (!error && data && data.length > 0) {
        setTariffs(
          data.map((row) => ({
            code: row.code,
            description: row.description,
            rate: rateToLabel(Number(row.rate)),
            tlcs: row.tlcs,
            umeasure: row.unit_measure,
          })),
        );
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = searchTerm.trim() === ''
    ? tariffs
    : tariffs.filter(
        (t) =>
          t.code.includes(searchTerm) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const trimmed = value.trim();
    if (trimmed.length >= 3) {
      logSearch(trimmed, tariffs.filter(
        (t) =>
          t.code.includes(trimmed) ||
          t.description.toLowerCase().includes(trimmed.toLowerCase())
      ).length);
    }
  };

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header title="Buscador Arancelario" subtitle="Consulta 8,551 fracciones arancelarias" onBack={onBack} />

      {/* Search Bar */}
      <div className="bg-tradelearn-navy px-4 py-4 border-b-4 border-tradelearn-gold">
        <input
          type="text"
          placeholder="Código (ej: 2204) o palabra clave…"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-tradelearn-navy text-white placeholder-slate-400 rounded-lg px-4 py-3 border-2 border-tradelearn-gold/30 focus:border-tradelearn-gold focus:outline-none transition"
        />
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin text-tradelearn-gold" />
          </div>
        )}
        {!loading && filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-slate-300">Sin resultados para "{searchTerm}"</p>
            <p className="text-slate-400 text-sm mt-2">Intenta con otro término o código</p>
          </div>
        ) : (
          !loading && (
            <div className="space-y-3">
              {filtered.map((tariff) => (
                <button
                  key={tariff.code}
                  onClick={() => setSelectedTariff(tariff)}
                  className="w-full text-left bg-tradelearn-navy border-l-4 border-tradelearn-gold rounded-lg p-4 hover:bg-slate-800 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-tradelearn-gold">{tariff.code}</p>
                      <p className="text-sm text-slate-300 mt-1">{tariff.description}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-xs bg-tradelearn-gold/20 text-tradelearn-gold px-2 py-1 rounded">
                          Arancel: {tariff.rate}
                        </span>
                        <span className="text-xs bg-tradelearn-blue/20 text-tradelearn-blue px-2 py-1 rounded">
                          TLC: {tariff.tlcs}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Detail Modal */}
      {selectedTariff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-tradelearn-navy w-full rounded-t-3xl p-6 max-h-96 overflow-y-auto border-t-4 border-tradelearn-gold">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-tradelearn-gold">{selectedTariff.code}</h2>
              <button
                onClick={() => setSelectedTariff(null)}
                className="text-slate-400 hover:text-tradelearn-gold text-2xl"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 mb-6">{selectedTariff.description}</p>
            <div className="space-y-4">
              <div className="bg-tradelearn-navy/80 rounded-lg p-4 border-2 border-tradelearn-gold/30">
                <p className="text-tradelearn-gold text-sm uppercase font-bold mb-1">Arancel NMF</p>
                <p className="text-2xl font-bold text-tradelearn-gold">{selectedTariff.rate}</p>
              </div>
              <div className="bg-tradelearn-navy/80 rounded-lg p-4 border-2 border-tradelearn-blue/30">
                <p className="text-tradelearn-blue text-sm uppercase font-bold mb-1">Tasas TLC</p>
                <p className="text-lg text-tradelearn-blue">{selectedTariff.tlcs}</p>
              </div>
              <div className="bg-tradelearn-navy/80 rounded-lg p-4 border-2 border-tradelearn-gold/30">
                <p className="text-tradelearn-gold text-sm uppercase font-bold mb-1">Unidad de Medida</p>
                <p className="text-lg font-semibold text-tradelearn-gold">{selectedTariff.umeasure}</p>
              </div>
              <div className="bg-tradelearn-navy/80 rounded-lg p-4 border-2 border-tradelearn-blue/30">
                <p className="text-tradelearn-blue text-sm uppercase font-bold mb-1">IVA Adicional</p>
                <p className="text-lg font-semibold text-white">19%</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTariff(null)}
              className="w-full mt-6 bg-gradient-to-r from-tradelearn-gold to-yellow-500 hover:from-tradelearn-accent hover:to-yellow-600 text-tradelearn-navy font-bold py-3 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
