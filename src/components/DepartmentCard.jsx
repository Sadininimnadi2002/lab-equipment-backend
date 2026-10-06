import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Zap, Cog, Building2, Cpu, ArrowRight, Layers, Box } from 'lucide-react';

const iconMap = {
  Anchor: Anchor,
  Zap: Zap,
  Cog: Cog,
  Building2: Building2,
  Cpu: Cpu,
};

const getDeptAesthetics = (dept) => {
  const code = (dept.code || '').toUpperCase();
  const name = (dept.name || '').toLowerCase();

  if (code.includes('MRN') || name.includes('marine')) {
    return {
      color: 'from-cyan-600 to-blue-700',
      icon: Anchor,
      building: 'Block E - Maritime Wing',
      headOfDept: 'Prof. Anura Jayasundara',
    };
  }
  if (code.includes('ELE') || name.includes('electrical')) {
    return {
      color: 'from-amber-500 to-yellow-600',
      icon: Zap,
      building: 'Block A - Tesla Complex',
      headOfDept: 'Dr. Senaka Ranasinghe',
    };
  }
  if (code.includes('MEC') || name.includes('mechanical')) {
    return {
      color: 'from-orange-500 to-red-600',
      icon: Cog,
      building: 'Block B - Engineering Workshop',
      headOfDept: 'Prof. Nalaka Bandara',
    };
  }
  if (code.includes('CIV') || name.includes('civil')) {
    return {
      color: 'from-emerald-600 to-teal-700',
      icon: Building2,
      building: 'Block C - Structural Lab Complex',
      headOfDept: 'Dr. Priyantha Dissanayake',
    };
  }
  if (code.includes('COM') || name.includes('computer')) {
    return {
      color: 'from-indigo-600 to-violet-700',
      icon: Cpu,
      building: 'Block D - Turing Computing Center',
      headOfDept: 'Prof. Chaminda Senaratne',
    };
  }

  return {
    color: 'from-blue-600 to-indigo-700',
    icon: Building2,
    building: 'Main Engineering Complex',
    headOfDept: 'Faculty Dean',
  };
};

const DepartmentCard = ({ department, equipmentCount, labsCount }) => {
  const navigate = useNavigate();
  const deptId = department._id || department.id;
  const aesthetics = getDeptAesthetics(department);
  const IconComponent = department.icon && iconMap[department.icon] ? iconMap[department.icon] : aesthetics.icon;
  const color = department.color || aesthetics.color;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
      {/* Top Banner Gradient */}
      <div className={`h-3 bg-gradient-to-r ${color}`} />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                {department.code}
              </span>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {department.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-5 line-clamp-2 flex-1 leading-relaxed">
          {department.description}
        </p>

        {/* Department Info & Stats */}
        <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100 flex items-center justify-around text-center text-xs">
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 font-bold text-slate-800 text-base">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              {labsCount !== undefined ? labsCount : 2}
            </span>
            <span className="text-slate-500 text-[11px]">Laboratories</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 font-bold text-slate-800 text-base">
              <Box className="w-3.5 h-3.5 text-emerald-500" />
              {equipmentCount !== undefined ? equipmentCount : 4}
            </span>
            <span className="text-slate-500 text-[11px]">Equipment</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 space-y-1 mb-5">
          <p className="truncate">
            <strong className="text-slate-700">Location:</strong> {department.building || aesthetics.building}
          </p>
          <p className="truncate">
            <strong className="text-slate-700">HoD:</strong> {department.headOfDept || aesthetics.headOfDept}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate(`/laboratories?department=${deptId}`)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center cursor-pointer"
          >
            View Laboratories
          </button>
          <button
            onClick={() => navigate(`/equipment?department=${deptId}`)}
            className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
          >
            <span>View Equipment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
