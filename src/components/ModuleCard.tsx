interface ModuleCardProps {
  icon: string;
  number: string;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}

export default function ModuleCard({
  icon,
  number,
  title,
  description,
  onClick,
  gradient,
}: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${gradient} text-white rounded-3xl p-6 text-left transition-all hover:shadow-lg hover:scale-105 active:scale-95`}
    >
      <span className="text-4xl block mb-3">{icon}</span>
      <p className="text-xs font-bold opacity-75 mb-1 uppercase tracking-wider">
        {number}
      </p>
      <h3 className="font-bold text-base leading-tight">{title}</h3>
      <p className="text-sm opacity-90 mt-2">{description}</p>
    </button>
  );
}
