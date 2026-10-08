interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  variant?: 'primary' | 'success' | 'warning' | 'accent';
}

export default function KPICard({
  label,
  value,
  unit,
  icon,
  variant = 'primary',
}: KPICardProps) {
  const variants = {
    primary: 'bg-gradient-to-br from-tradelearn-blue to-blue-600',
    success: 'bg-gradient-to-br from-tradelearn-gold to-yellow-500',
    warning: 'bg-gradient-to-br from-orange-500 to-red-600',
    accent: 'bg-gradient-to-br from-tradelearn-blue to-cyan-600',
  };

  return (
    <div className={`${variants[variant]} text-white rounded-2xl p-6 shadow-lg`}>
      {icon && <span className="text-3xl mb-3 block">{icon}</span>}
      <p className="text-sm opacity-90 font-medium">{label}</p>
      <p className="text-2xl font-bold mt-2">
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </p>
    </div>
  );
}
