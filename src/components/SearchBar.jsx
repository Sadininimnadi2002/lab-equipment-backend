import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by equipment name, ID, or lab...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
