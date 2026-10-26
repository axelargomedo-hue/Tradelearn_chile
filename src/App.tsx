import { useEffect, useState } from 'react';
import Home from './pages/Home';
import TariffSearch from './pages/TariffSearch';
import ImportCalculator from './pages/ImportCalculator';
import BreakEvenCalculator from './pages/BreakEvenCalculator';
import FinancialIndicators from './pages/FinancialIndicators';
import DocumentGuide from './pages/DocumentGuide';
import Incoterms from './pages/Incoterms';
import Registration from './pages/Registration';
import AdminPortal from './pages/AdminPortal';
import FreeTradeAgreements from './pages/FreeTradeAgreements';
import Navigation from './components/Navigation';

const PAGE_TYPES = [
  'home',
  'tariff',
  'calculator',
  'breakeven',
  'indicators',
  'documents',
  'incoterms',
  'registration',
  'admin',
  'agreements',
] as const;

type PageType = (typeof PAGE_TYPES)[number];

function isPageType(value: string | null): value is PageType {
  return value !== null && PAGE_TYPES.includes(value as PageType);
}

function getPageFromLocation(): PageType {
  const hashPage = window.location.hash.replace(/^#\/?/, '');
  if (isPageType(hashPage)) return hashPage;

  const savedPage = window.sessionStorage.getItem('tradelearn-current-page');
  return isPageType(savedPage) ? savedPage : 'home';
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(getPageFromLocation);

  useEffect(() => {
    const handleBrowserNavigation = () => setCurrentPage(getPageFromLocation());
    window.addEventListener('popstate', handleBrowserNavigation);
    window.addEventListener('hashchange', handleBrowserNavigation);

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#home');
    }

    return () => {
      window.removeEventListener('popstate', handleBrowserNavigation);
      window.removeEventListener('hashchange', handleBrowserNavigation);
    };
  }, []);

  const navigate = (page: string) => {
    if (!isPageType(page)) return;
    setCurrentPage(page);
    window.sessionStorage.setItem('tradelearn-current-page', page);
    window.history.pushState(null, '', `#${page}`);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'tariff':
        return <TariffSearch onBack={() => navigate('home')} />;
      case 'calculator':
        return <ImportCalculator onBack={() => navigate('home')} />;
      case 'breakeven':
        return <BreakEvenCalculator onBack={() => navigate('home')} />;
      case 'indicators':
        return <FinancialIndicators onBack={() => navigate('home')} />;
      case 'documents':
        return <DocumentGuide onBack={() => navigate('home')} />;
      case 'incoterms':
        return <Incoterms onBack={() => navigate('home')} />;
      case 'registration':
        return <Registration onBack={() => navigate('home')} />;
      case 'admin':
        return <AdminPortal onBack={() => navigate('home')} />;
      case 'agreements':
        return <FreeTradeAgreements onBack={() => navigate('home')} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-tradelearn-navy">
      {renderPage()}
      {currentPage === 'home' && <Navigation onNavigate={navigate} />}
    </div>
  );
}

export default App;
