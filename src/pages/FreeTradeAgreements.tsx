import Header from '../components/Header';
import { ArrowUpRight, Globe2 } from 'lucide-react';

interface FreeTradeAgreementsProps {
  onBack: () => void;
}

interface Agreement {
  title: string;
  summary: string;
  url: string;
}

const AGREEMENTS: Agreement[] = [
  {
    title: 'Protocolo Comercial - Alianza Pacífico',
    summary: 'El protocolo comercial de la Alianza del Pacífico busca facilitar el intercambio comercial entre sus países miembros mediante reglas y disposiciones comunes.',
    url: 'https://www.aduana.cl/protocolo-comercial-alianza-pacifico/aduana/2016-04-27/163905.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Tailandia',
    summary: 'Acuerdo comercial entre Chile y Tailandia cuya finalidad es facilitar las relaciones comerciales entre ambos países.',
    url: 'https://www.aduana.cl/tratado-de-libre-comercio-chile-tailandia/aduana/2015-11-11/161411.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Hong Kong',
    summary: 'Marco comercial establecido entre Chile y Hong Kong para el intercambio de bienes y otras actividades comerciales contempladas por el acuerdo.',
    url: 'https://www.aduana.cl/tratado-de-libre-comercio-chile-hong-kong/aduana/2014-12-04/120610.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Vietnam',
    summary: 'Acuerdo entre Chile y Vietnam orientado a facilitar el comercio bilateral entre ambas economías.',
    url: 'https://www.aduana.cl/tratado-de-libre-comercio-chile-vietnam/aduana/2014-01-10/103726.html',
  },
  {
    title: 'Acuerdo de Libre Comercio Chile - Malasia',
    summary: 'Marco que regula y facilita el intercambio comercial entre Chile y Malasia.',
    url: 'https://www.aduana.cl/acuerdo-de-libre-comercio-chile-malasia/aduana/2012-04-25/183314.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Turquía',
    summary: 'Acuerdo entre Chile y Turquía que establece un marco para el desarrollo del comercio bilateral.',
    url: 'https://www.aduana.cl/aduana/site/artic/20110209/pags/20110209094234.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Australia',
    summary: 'Marco de relaciones comerciales entre Chile y Australia, con disposiciones para orientar su intercambio bilateral.',
    url: 'https://www.aduana.cl/aduana/site/artic/20090220/pags/20090220165036.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Panamá',
    summary: 'Acuerdo entre Chile y Panamá cuyo propósito general es facilitar las relaciones comerciales bilaterales.',
    url: 'https://www.aduana.cl/aduana/site/artic/20080307/pags/20080307121527.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - China',
    summary: 'Acuerdo comercial entre Chile y China relevante para el intercambio de bienes y las relaciones económicas entre ambos países.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070228/pags/20070228100917.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Estados Unidos',
    summary: 'Marco comercial establecido entre Chile y Estados Unidos para facilitar el comercio bilateral conforme a sus disposiciones.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070711/pags/20070711153552.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Canadá',
    summary: 'Acuerdo entre Chile y Canadá que establece reglas para las relaciones comerciales entre ambos países.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070228/pags/20070228101053.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - México',
    summary: 'Marco comercial entre Chile y México cuyo objetivo general es facilitar el intercambio bilateral conforme al acuerdo.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070228/pags/20070228101531.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Corea',
    summary: 'Acuerdo entre Chile y Corea que enmarca las relaciones comerciales entre ambas economías.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070228/pags/20070228101709.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - Centro América',
    summary: 'Marco comercial de Chile con los países centroamericanos incluidos en el acuerdo, cuyas condiciones pueden variar según su aplicación.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070228/pags/20070228101607.html',
  },
  {
    title: 'Tratado de Libre Comercio Chile - EFTA',
    summary: 'Acuerdo que regula la relación comercial entre Chile y los Estados miembros de la Asociación Europea de Libre Comercio (EFTA).',
    url: 'https://www.aduana.cl/aduana/site/artic/20070713/pags/20070713110133.html',
  },
  {
    title: 'Acuerdo de Libre Comercio Chile - Perú',
    summary: 'Marco comercial entre Chile y Perú orientado a facilitar sus relaciones económicas bilaterales.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070711/pags/20070711115113.html',
  },
  {
    title: 'Acuerdo de Libre Comercio Chile - Colombia',
    summary: 'Acuerdo entre Chile y Colombia cuyo objetivo general es facilitar el intercambio comercial entre ambos países.',
    url: 'https://www.aduana.cl/aduana/site/artic/20070711/pags/20070711110743.html',
  },
];

export default function FreeTradeAgreements({ onBack }: FreeTradeAgreementsProps) {
  return (
    <div className="min-h-screen bg-tradelearn-navy pb-24">
      <Header
        title="Tratados de Libre Comercio"
        subtitle="17 acuerdos comerciales relacionados con Chile"
        onBack={onBack}
      />

      <main className="px-4 py-6 max-w-6xl mx-auto">
        <div className="bg-tradelearn-dark rounded-2xl border border-tradelearn-gold/20 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Globe2 size={22} className="text-tradelearn-gold flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Consulta un resumen de cada acuerdo y accede a la información completa en el sitio oficial de Aduanas de Chile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGREEMENTS.map((agreement, index) => (
            <article
              key={agreement.url}
              className="flex flex-col bg-tradelearn-dark rounded-2xl p-5 border border-slate-700 hover:border-tradelearn-gold/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-tradelearn-gold/15 text-tradelearn-gold text-xs font-bold flex items-center justify-center">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Acuerdo comercial</span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug mb-3">{agreement.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-5">{agreement.summary}</p>
              <a
                href={agreement.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-tradelearn-gold text-tradelearn-navy font-bold text-sm rounded-xl px-4 py-3 hover:bg-tradelearn-accent transition-colors"
              >
                Consultar tratado completo
                <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
