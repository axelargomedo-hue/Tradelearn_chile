import { useState } from 'react';
import Home from './pages/Home';
import TariffSearch from './pages/TariffSearch';
import ImportCalculator from './pages/ImportCalculator';
import BreakEvenCalculator from './pages/BreakEvenCalculator';
import FinancialIndicators from './pages/FinancialIndicators';
import DocumentGuide from './pages/DocumentGuide';
import Incoterms from './pages/Incoterms';
import Registration from './pages/Registration';
import AdminPortal from './pages/AdminPortal';
import Navigation from './components/Navigation';

type PageType = 'home' | 'tariff' | 'calculator' | 'breakeven' | 'indicators' | 'documents' | 'incoterms' | 'registration' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'tariff':
        return <TariffSearch onBack={() => setCurrentPage('home')} />;
      case 'calculator':
        return <ImportCalculator onBack={() => setCurrentPage('home')} />;
      case 'breakeven':
        return <BreakEvenCalculator onBack={() => setCurrentPage('home')} />;
      case 'indicators':
        return <FinancialIndicators onBack={() => setCurrentPage('home')} />;
      case 'documents':
        return <DocumentGuide onBack={() => setCurrentPage('home')} />;
      case 'incoterms':
        return <Incoterms onBack={() => setCurrentPage('home')} />;
      case 'registration':
        return <Registration onBack={() => setCurrentPage('home')} />;
      case 'admin':
        return <AdminPortal onBack={() => setCurrentPage('home')} />;
      default:
        return <Home onNavigate={(p) => setCurrentPage(p as PageType)} />;
    }
  };

  return (
    <div className="min-h-screen bg-tradelearn-navy">
      {renderPage()}
      {currentPage === 'home' && <Navigation onNavigate={(p) => setCurrentPage(p as PageType)} />}
    </div>
  );
}

export default App;
