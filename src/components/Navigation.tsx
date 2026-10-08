interface NavigationProps {
  onNavigate: (page: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tradelearn-navy border-t-4 border-tradelearn-gold px-2 py-3 flex overflow-x-auto gap-1 max-w-2xl mx-auto">
      <button
        onClick={() => onNavigate('home')}
        className="flex flex-col items-center gap-1 text-tradelearn-gold hover:text-tradelearn-accent transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">🏠</span>
        <span className="text-xs font-semibold whitespace-nowrap">Inicio</span>
      </button>
      <button
        onClick={() => onNavigate('tariff')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">📋</span>
        <span className="text-xs font-semibold whitespace-nowrap">Arancel</span>
      </button>
      <button
        onClick={() => onNavigate('calculator')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">🧮</span>
        <span className="text-xs font-semibold whitespace-nowrap">Calcular</span>
      </button>
      <button
        onClick={() => onNavigate('breakeven')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">📈</span>
        <span className="text-xs font-semibold whitespace-nowrap">Equilibrio</span>
      </button>
      <button
        onClick={() => onNavigate('indicators')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">📊</span>
        <span className="text-xs font-semibold whitespace-nowrap">Indicadores</span>
      </button>
      <button
        onClick={() => onNavigate('documents')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">📄</span>
        <span className="text-xs font-semibold whitespace-nowrap">Docs</span>
      </button>
      <button
        onClick={() => onNavigate('incoterms')}
        className="flex flex-col items-center gap-1 text-tradelearn-blue hover:text-blue-300 transition px-3 py-1 flex-shrink-0"
      >
        <span className="text-xl">🌐</span>
        <span className="text-xs font-semibold whitespace-nowrap">Incoterms</span>
      </button>
    </nav>
  );
}
