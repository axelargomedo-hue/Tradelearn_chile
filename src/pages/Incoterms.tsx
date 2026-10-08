import { useState } from 'react';
import Header from '../components/Header';

interface Incoterm {
  code: string;
  name: string;
  multimodal: boolean;
  sellerResponsibilities: string;
  buyerResponsibilities: string;
  riskTransfer: string;
  useCase: string;
  color: string;
  icon: string;
}

const INCOTERMS_2020: Incoterm[] = [
  {
    code: 'EXW',
    name: 'Ex Works',
    multimodal: true,
    sellerResponsibilities: 'Solo pone la mercancía disponible en su local/fábrica. Sin responsabilidad en carga ni transporte.',
    buyerResponsibilities: 'Asume TODO: carga, transporte, seguro, aduanas exportación e importación, descarga.',
    riskTransfer: 'En la fábrica del vendedor',
    useCase: 'Operaciones locales. Poco recomendado para exportaciones internacionales largas.',
    color: '#6366F1',
    icon: '🏭',
  },
  {
    code: 'FCA',
    name: 'Free Carrier',
    multimodal: true,
    sellerResponsibilities: 'Entrega al transportista designado por el comprador. Incluye aduana de exportación. Carga en el medio de transporte.',
    buyerResponsibilities: 'Flete, seguro, aduanas de importación desde primer transportista.',
    riskTransfer: 'Al entregar al transportista',
    useCase: 'Muy común en comercio moderno. Recomendado para contenedores y transporte aéreo.',
    color: '#2563EB',
    icon: '🚚',
  },
  {
    code: 'FOB',
    name: 'Free On Board',
    multimodal: false,
    sellerResponsibilities: 'Coloca la mercancía a bordo del buque. Cubre costos y riesgos hasta que la mercancía atraviesa la borda.',
    buyerResponsibilities: 'Flete, seguro, aduanas de importación, descarga, distribución interna.',
    riskTransfer: 'A bordo del buque en puerto de origen',
    useCase: 'Muy usado en exportaciones chilenas de commodities (cobre, fruta, vino). SOLO transporte marítimo.',
    color: '#0891B2',
    icon: '⛴️',
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance & Freight',
    multimodal: false,
    sellerResponsibilities: 'Paga flete y seguro mínimo hasta puerto destino. Coloca mercancía a bordo en origen.',
    buyerResponsibilities: 'Descarga, aduana de importación, impuestos, distribución interna.',
    riskTransfer: 'En puerto de destino',
    useCase: 'Muy habitual en importaciones desde Asia (China). Vendedor controla transporte.',
    color: '#028090',
    icon: '🌊',
  },
  {
    code: 'CFR',
    name: 'Cost and Freight',
    multimodal: false,
    sellerResponsibilities: 'Paga flete hasta puerto destino. SIN obligación de seguro. Coloca a bordo.',
    buyerResponsibilities: 'Seguro (si desea), aduanas de importación, descarga, impuestos.',
    riskTransfer: 'A bordo del buque en origen',
    useCase: 'Materia prima a granel por vía marítima. Similar a CIF pero sin seguro obligatorio.',
    color: '#1C7293',
    icon: '📦',
  },
  {
    code: 'CPT',
    name: 'Carriage Paid To',
    multimodal: true,
    sellerResponsibilities: 'Paga transporte hasta destino. Carga la mercancía en el primer transporte. Incluye aduana export.',
    buyerResponsibilities: 'Seguro (si desea), aduanas de importación, descarga, impuestos.',
    riskTransfer: 'Al primer transportista',
    useCase: 'Ideal para transporte multimodal. Muy usado en carga aérea. Recomendado por ICC.',
    color: '#7C3AED',
    icon: '✈️',
  },
  {
    code: 'CIP',
    name: 'Carriage and Insurance Paid',
    multimodal: true,
    sellerResponsibilities: 'Paga transporte Y SEGURO AMPLIO hasta destino. Carga en primer transporte. Aduana export.',
    buyerResponsibilities: 'Aduanas de importación, descarga, impuestos, distribución interna.',
    riskTransfer: 'Al primer transportista',
    useCase: 'Altamente recomendado para bienes manufacturados en contenedor. Seguro completo incluido.',
    color: '#4338CA',
    icon: '🛡️',
  },
  {
    code: 'DAP',
    name: 'Delivered at Place',
    multimodal: true,
    sellerResponsibilities: 'Entrega en el lugar convenido en país del comprador. SIN desaduanar. Incluye transporte, aduana export.',
    buyerResponsibilities: 'Aduana de importación, descarga, impuestos, recepción final.',
    riskTransfer: 'En lugar de destino acordado',
    useCase: 'E-commerce internacional, entregas puerta a puerta. Vendedor controla hasta destino.',
    color: '#059669',
    icon: '🚛',
  },
  {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    multimodal: true,
    sellerResponsibilities: 'DESCARGA la mercancía en destino. Máxima responsabilidad. Transporte completo y descarga.',
    buyerResponsibilities: 'Aduana de importación, impuestos, recepción.',
    riskTransfer: 'Después de descarga en destino',
    useCase: 'Cuando vendedor controla transporte hasta almacén comprador. Menos común.',
    color: '#B45309',
    icon: '⬇️',
  },
  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    multimodal: true,
    sellerResponsibilities: 'MÁXIMA responsabilidad: entrega DESADUANADA y CON IMPUESTOS PAGADOS. Control total del vendedor.',
    buyerResponsibilities: 'Solo recibe la mercancía en destino. Mínimo riesgo y responsabilidad.',
    riskTransfer: 'En domicilio del comprador',
    useCase: 'Ventas online a consumidores finales. Mejor servicio. Vendedor absorbe todos costos y riesgos.',
    color: '#0D9488',
    icon: '🎁',
  },
  {
    code: 'FAS',
    name: 'Free Alongside Ship',
    multimodal: false,
    sellerResponsibilities: 'Deja mercancía al COSTADO del buque en puerto origen. Incluye aduana exportación. SIN cargar.',
    buyerResponsibilities: 'Carga en buque, flete, seguro, aduana importación, descarga.',
    riskTransfer: 'Al costado del buque',
    useCase: 'Carga especial: granel, productos pesqueros, minería. Poco común en comercio general.',
    color: '#0F766E',
    icon: '🪨',
  },
];

interface IncotermsProps {
  onBack: () => void;
}

export default function Incoterms({ onBack }: IncotermsProps) {
  const [selectedInco, setSelectedInco] = useState<Incoterm | null>(null);
  const [filterMultimodal, setFilterMultimodal] = useState<'all' | 'multimodal' | 'maritime'>('all');

  const filtered =
    filterMultimodal === 'all'
      ? INCOTERMS_2020
      : filterMultimodal === 'multimodal'
      ? INCOTERMS_2020.filter((i) => i.multimodal)
      : INCOTERMS_2020.filter((i) => !i.multimodal);

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Incoterms 2020"
        subtitle="11 términos comerciales internacionales explicados"
        onBack={onBack}
      />

      {/* Filter Tabs */}
      <div className="sticky top-0 bg-tradelearn-navy/95 backdrop-blur border-b-2 border-tradelearn-gold/20 px-4 py-3 flex gap-2">
        {[
          { label: 'Todos', value: 'all' as const },
          { label: 'Multimodal', value: 'multimodal' as const },
          { label: 'Marítimo', value: 'maritime' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterMultimodal(tab.value)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              filterMultimodal === tab.value
                ? 'bg-tradelearn-gold text-tradelearn-navy'
                : 'bg-tradelearn-navy/50 text-tradelearn-gold border-2 border-tradelearn-gold/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incoterms Grid */}
      <div className="px-4 py-6 space-y-3">
        {filtered.map((inco) => (
          <button
            key={inco.code}
            onClick={() => setSelectedInco(inco)}
            className="w-full text-left bg-tradelearn-navy/80 rounded-2xl p-5 border-2 border-tradelearn-gold/20 hover:border-tradelearn-gold hover:bg-slate-800 transition group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-2xl"
                style={{ backgroundColor: inco.color, color: 'white' }}
              >
                {inco.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-xl font-bold text-tradelearn-gold">{inco.code}</h3>
                  <p className="text-sm text-slate-400">{inco.name}</p>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                  {inco.sellerResponsibilities}
                </p>
                <div className="flex gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-tradelearn-gold/20 text-tradelearn-gold border border-tradelearn-gold/30">
                    {inco.multimodal ? '🔄 Multimodal' : '🌊 Marítimo'}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {inco.riskTransfer}
                  </span>
                </div>
              </div>
              <div className="text-2xl group-hover:translate-x-1 transition">›</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedInco && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-tradelearn-navy w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-t-4 border-tradelearn-gold">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-2xl"
                    style={{ backgroundColor: selectedInco.color, color: 'white' }}
                  >
                    {selectedInco.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-tradelearn-gold">{selectedInco.code}</h2>
                    <p className="text-lg text-slate-300">{selectedInco.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-tradelearn-gold/20 text-tradelearn-gold border border-tradelearn-gold/30">
                    {selectedInco.multimodal ? '🔄 Multimodal' : '🌊 Marítimo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInco(null)}
                className="text-slate-400 hover:text-tradelearn-gold text-3xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Risk Transfer */}
              <div className="bg-tradelearn-navy/80 rounded-xl p-4 border-2 border-blue-500/30">
                <p className="text-sm uppercase font-bold text-blue-400 mb-2">Transferencia de Riesgo</p>
                <p className="text-lg font-bold text-white">{selectedInco.riskTransfer}</p>
              </div>

              {/* Seller */}
              <div>
                <h3 className="text-sm uppercase font-bold text-tradelearn-gold mb-3">
                  📤 Responsabilidades del Vendedor
                </h3>
                <div className="bg-tradelearn-navy/50 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-slate-300 leading-relaxed">
                    {selectedInco.sellerResponsibilities}
                  </p>
                </div>
              </div>

              {/* Buyer */}
              <div>
                <h3 className="text-sm uppercase font-bold text-tradelearn-gold mb-3">
                  📥 Responsabilidades del Comprador
                </h3>
                <div className="bg-tradelearn-navy/50 rounded-xl p-4 border border-blue-500/30">
                  <p className="text-slate-300 leading-relaxed">
                    {selectedInco.buyerResponsibilities}
                  </p>
                </div>
              </div>

              {/* Use Case */}
              <div>
                <h3 className="text-sm uppercase font-bold text-tradelearn-gold mb-3">
                  💡 Caso de Uso
                </h3>
                <div className="bg-tradelearn-navy/80 rounded-xl p-4 border border-tradelearn-gold/30">
                  <p className="text-slate-300">{selectedInco.useCase}</p>
                </div>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-tradelearn-navy/80 rounded-lg p-3 border border-tradelearn-gold/20">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Tipo de Transporte</p>
                  <p className="text-sm font-bold text-tradelearn-gold">
                    {selectedInco.multimodal ? '🔄 Multimodal' : '🌊 Solo Marítimo'}
                  </p>
                </div>
                <div className="bg-tradelearn-navy/80 rounded-lg p-3 border border-tradelearn-gold/20">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Control Transporte</p>
                  <p className="text-sm font-bold text-tradelearn-gold">
                    {selectedInco.code === 'DDP' || selectedInco.code === 'DPU'
                      ? 'Vendedor'
                      : selectedInco.code === 'EXW'
                      ? 'Comprador'
                      : 'Compartido'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInco(null)}
                className="w-full bg-gradient-to-r from-tradelearn-gold to-yellow-500 hover:from-tradelearn-accent hover:to-yellow-600 text-tradelearn-navy font-bold py-3 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
