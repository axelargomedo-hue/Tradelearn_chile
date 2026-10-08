import { useState } from 'react';
import Header from '../components/Header';

interface Document {
  code: string;
  fullName: string;
  type: 'export' | 'import' | 'both';
  description: string;
  requirements: string[];
  color: string;
}

const DOCUMENTS: Document[] = [
  {
    code: 'DUS',
    fullName: 'Declaración Única de Salida',
    type: 'export',
    description: 'Documento principal para exportar desde Chile. Emitido ante el SNA a través del SICEX. Acredita legalmente la salida de mercancías.',
    requirements: ['RUT del exportador', 'Descripción de mercancías', 'Cantidad y peso', 'Incoterm', 'País destino'],
    color: '#3B7FD1',
  },
  {
    code: 'DIN',
    fullName: 'Declaración de Ingreso',
    type: 'import',
    description: 'Documento presentado al importar mercancías a Chile. Contiene clasificación arancelaria, valor aduanero e impuestos aplicables.',
    requirements: ['RUT importador', 'Fracción arancelaria', 'Valor CIF', 'Procedencia', 'Factura comercial'],
    color: '#1C7293',
  },
  {
    code: 'B/L',
    fullName: 'Bill of Lading (Conocimiento de Embarque)',
    type: 'both',
    description: 'Contrato entre exportador y naviero. Acredita que la mercancía fue embarcada y es título de propiedad transferible.',
    requirements: ['Datos del buque', 'Puerto carga/descarga', 'Peso y volumen', 'Número de contenedores'],
    color: '#0D9488',
  },
  {
    code: 'C/O',
    fullName: 'Certificado de Origen',
    type: 'export',
    description: 'Certifica el país de fabricación. Necesario para acceder a tasas preferenciales de TLCs. Emitido por ProChile o SNA.',
    requirements: ['Descripción productos', 'Valor FOB', 'Fabricante/productor', 'País origen'],
    color: '#FFC107',
  },
  {
    code: 'INV',
    fullName: 'Factura Comercial',
    type: 'both',
    description: 'Emitida por el vendedor. Indica precio, cantidad y descripción. Requisito obligatorio para liquidación aduanera.',
    requirements: ['Datos vendedor/comprador', 'Descripción detallada', 'Precios unitarios', 'Términos pago'],
    color: '#6366F1',
  },
  {
    code: 'PL',
    fullName: 'Packing List (Lista de Empaque)',
    type: 'both',
    description: 'Detalla contenido de cada bulto: cantidades, pesos y dimensiones. Complementa factura y facilita inspección aduanera.',
    requirements: ['Número de bultos', 'Peso bruto/neto', 'Dimensiones', 'Marcas identificación'],
    color: '#7C3AED',
  },
  {
    code: 'MAN',
    fullName: 'Manifiesto de Carga',
    type: 'import',
    description: 'Presentado por transportista. Detalle de todas mercancías a bordo. Debe presentarse antes del arribo a Chile.',
    requirements: ['Número viaje', 'Puertos carga/descarga', 'Lista mercancías', 'Nombre navío'],
    color: '#DC2626',
  },
  {
    code: 'CERT-SEG',
    fullName: 'Póliza de Seguro',
    type: 'import',
    description: 'Certifica cobertura de seguro durante transporte. Obligatorio en términos CIF y CIP. Cubre pérdidas por daño o robo.',
    requirements: ['Póliza número', 'Valor asegurado', 'Período cobertura', 'Riesgos cubiertos'],
    color: '#B45309',
  },
  {
    code: 'CERT-CALIDAD',
    fullName: 'Certificados de Calidad/Sanidad',
    type: 'both',
    description: 'Según tipo de producto. Algunos requieren certificación de organismos especializados (sanitaria, fitosanitaria, etc).',
    requirements: ['Descripción producto', 'Normas aplicables', 'Resultados análisis', 'Firma autoridad'],
    color: '#059669',
  },
  {
    code: 'CERT-ORIGEN-PREF',
    fullName: 'Certificado de Origen Preferencial',
    type: 'export',
    description: 'Para acceder a beneficios arancelarios bajo TLCs. Acredita que el producto cumple reglas de origen específicas.',
    requirements: ['Datos producto', 'Fabricantes componentes', 'Porcentaje contenido local', 'Cálculos reglas origen'],
    color: '#02C39A',
  },
];

interface DocumentGuideProps {
  onBack: () => void;
}

export default function DocumentGuide({ onBack }: DocumentGuideProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'export' | 'import' | 'both'>('all');

  const filtered = filterType === 'all'
    ? DOCUMENTS
    : DOCUMENTS.filter(d => d.type === filterType || (filterType === 'both' && d.type === 'both'));

  const getTypeLabel = (type: 'export' | 'import' | 'both') => {
    switch (type) {
      case 'export':
        return '📤 Exportación';
      case 'import':
        return '📥 Importación';
      case 'both':
        return '🔄 Ambos';
    }
  };

  const getTypeColor = (type: 'export' | 'import' | 'both') => {
    switch (type) {
      case 'export':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'import':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'both':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Guía de Documentos"
        subtitle="Documentación necesaria para importación y exportación"
        onBack={onBack}
      />

      {/* Filter Tabs */}
      <div className="sticky top-0 bg-tradelearn-navy/95 backdrop-blur border-b-2 border-tradelearn-gold/20 px-4 py-3 flex gap-2 overflow-x-auto">
        {[
          { label: 'Todos', value: 'all' as const },
          { label: 'Exportación', value: 'export' as const },
          { label: 'Importación', value: 'import' as const },
          { label: 'Ambos', value: 'both' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold text-sm transition ${
              filterType === tab.value
                ? 'bg-tradelearn-gold text-tradelearn-navy'
                : 'bg-tradelearn-navy/50 text-tradelearn-gold border-2 border-tradelearn-gold/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((doc) => (
            <button
              key={doc.code}
              onClick={() => setSelectedDoc(doc)}
              className="text-left bg-tradelearn-navy/80 rounded-2xl p-5 border-2 border-tradelearn-gold/20 hover:border-tradelearn-gold hover:bg-slate-800 transition group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: doc.color }}
                >
                  {doc.code}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-tradelearn-gold mb-1">
                    {doc.fullName}
                  </h3>
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getTypeColor(doc.type)}`}
                    >
                      {getTypeLabel(doc.type)}
                    </span>
                  </div>
                </div>
                <div className="text-2xl group-hover:translate-x-1 transition">›</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-tradelearn-navy w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto border-t-4 border-tradelearn-gold">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: selectedDoc.color }}
                  >
                    {selectedDoc.code}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-tradelearn-gold">
                      {selectedDoc.fullName}
                    </h2>
                    <p
                      className={`text-xs font-bold mt-1 px-3 py-1 rounded-full border inline-block ${getTypeColor(selectedDoc.type)}`}
                    >
                      {getTypeLabel(selectedDoc.type)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-tradelearn-gold text-3xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm uppercase font-bold text-tradelearn-gold mb-3">
                  Descripción
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {selectedDoc.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-sm uppercase font-bold text-tradelearn-gold mb-3">
                  Requisitos y Contenido
                </h3>
                <ul className="space-y-2">
                  {selectedDoc.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <span className="text-tradelearn-gold font-bold mt-1">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Info */}
              <div className="bg-tradelearn-navy/80 rounded-xl p-4 border border-tradelearn-gold/20">
                <p className="text-xs text-slate-400">
                  💡 <strong className="text-tradelearn-gold">Consejo:</strong> Consulta con tu agente aduanal para asegurar que cumples con todos los requisitos específicos de tu operación.
                </p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
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
