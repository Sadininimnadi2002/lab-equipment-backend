import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { MapPin, Tag, Calendar, ChevronRight } from 'lucide-react';

const EquipmentCard = ({ equipment, onBookNow }) => {
  const navigate = useNavigate();
  const eqId = equipment._id || equipment.id;
  const eqCode = equipment.equipmentCode || equipment.id;
  const eqName = equipment.equipmentName || equipment.name;

  const statusLower = (equipment.status || '').toLowerCase();
  const isBookable = statusLower === 'available' || statusLower === 'booked';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
      {/* Image & Status Overlay */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={equipment.image}
          alt={eqName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={equipment.status} />
        </div>
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold">
          {eqCode}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            <Tag className="w-3 h-3" />
            {equipment.category}
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {eqName}
        </h4>

        <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
          {equipment.description}
        </p>

        {/* Location & Lab Metadata */}
        <div className="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{equipment.laboratory}</span>
            <span className="text-slate-400">({equipment.department})</span>
          </div>
          <div className="text-[11px] text-slate-400 pl-5 truncate">
            {equipment.location}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={() => navigate(`/equipment/${eqId}`)}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() =>
              onBookNow
                ? onBookNow(equipment)
                : navigate(`/equipment/${eqId}?action=book`)
            }
            disabled={!isBookable}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isBookable
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isBookable ? 'Book Now' : 'Unavailable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
