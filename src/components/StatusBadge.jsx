import React from 'react';
import { getStatusBadgeStyle } from '../utils/formatters';

const StatusBadge = ({ status, className = '' }) => {
  const { bg, dot, label } = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0 animate-pulse`} />
      <span className="truncate">{label}</span>
    </span>
  );
};

export default StatusBadge;
