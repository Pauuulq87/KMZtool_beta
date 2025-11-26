import React from 'react';
import { LucideIcon, Info } from 'lucide-react';

interface SettingCardProps {
  label: string;
  value: number | string | boolean;
  onChange: (val: any) => void;
  icon: LucideIcon;
  description: string;
  type?: 'number' | 'select' | 'toggle';
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  label,
  value,
  onChange,
  icon: Icon,
  description,
  type = 'number',
  options = [],
  unit,
  min,
  max,
  step
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md group">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-slate-800">{label}</h4>
            <div className="group/info relative">
              <Info className="w-4 h-4 text-slate-300 cursor-help" />
              <div className="absolute right-0 w-48 bg-slate-800 text-white text-xs p-2 rounded hidden group-hover/info:block z-10 top-6">
                {description}
              </div>
            </div>
          </div>
          
          <div className="relative">
            {type === 'number' && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={Number(value)}
                  onChange={(e) => onChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center min-w-[80px]">
                   <input
                    type="number"
                    value={value as number}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-16 p-1 text-right text-sm border border-slate-200 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                   <span className="text-xs text-slate-500 ml-1">{unit}</span>
                </div>
              </div>
            )}

            {type === 'select' && (
              <select
                value={value as string}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {type === 'toggle' && (
              <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  value ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`${
                    value ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};