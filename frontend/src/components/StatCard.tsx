interface StatCardProps {
  label: string;
  value: number | string;
  borderColor?: string;
  icon?: string;
  iconColor?: string;
}

export default function StatCard({ label, value, borderColor = 'border-primary', icon, iconColor }: StatCardProps) {
  return (
    <div className={`bg-surface rounded-xl p-4 md:p-6 shadow-level-1 ${borderColor} border-l-2 hover:shadow-md transition-shadow flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        {icon && (
          <span className={`material-symbols-outlined ${iconColor || 'text-outline'} opacity-50`}>{icon}</span>
        )}
      </div>
      <p className="text-display-lg text-primary">{value}</p>
    </div>
  );
}
