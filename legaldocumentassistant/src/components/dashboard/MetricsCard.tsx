import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  period?: string;
  icon: React.ReactNode;
}
export function MetricsCard({
  title,
  value,
  change,
  period,
  icon
}: MetricsCardProps) {
  return <div className="glass-card p-5 border border-white/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white drop-shadow-lg">
            {value}
          </p>
          {change && <div className="mt-2 flex items-center">
              {change.type === 'increase' ? <ArrowUpIcon size={14} className="text-green-400 mr-1" /> : <ArrowDownIcon size={14} className="text-red-400 mr-1" />}
              <span className={`text-xs font-medium ${change.type === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {change.value}%
              </span>
              {period && <span className="text-xs text-white/70 ml-1">vs {period}</span>}
            </div>}
        </div>
        <div className="p-3 rounded-lg bg-white/10">{icon}</div>
      </div>
    </div>;
}