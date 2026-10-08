import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export default function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-tradelearn-navy to-tradelearn-dark text-white p-6 flex items-center gap-4 border-b-4 border-tradelearn-gold">
      <button
        onClick={onBack}
        className="hover:bg-tradelearn-gold/20 p-2 rounded-lg transition"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-tradelearn-gold">{title}</h1>
        {subtitle && <p className="text-sm opacity-90 mt-1 text-slate-200">{subtitle}</p>}
      </div>
    </div>
  );
}
