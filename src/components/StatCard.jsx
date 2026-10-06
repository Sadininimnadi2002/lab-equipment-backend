import React from 'react';

const StatCard = ({ title, value, icon: Icon, changeText, color = 'blue', subtitle, onClick }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(changeText || subtitle) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {changeText && <span className="text-emerald-600 font-semibold">{changeText}</span>}
          {subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
