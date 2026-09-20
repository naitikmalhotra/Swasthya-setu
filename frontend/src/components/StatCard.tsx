import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'teal' | 'blue' | 'purple' | 'amber' | 'emerald' | 'rose';
  alert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'teal',
  alert = false
}) => {
  const variantStyles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-white border ${alert ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${variantStyles[variant]}`}>
          {icon}
        </div>
      </div>
      {alert && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl"></div>
      )}
    </div>
  );
};
