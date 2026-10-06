import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DEPARTMENTS as FALLBACK_DEPTS } from '../utils/constants';
import DepartmentCard from '../components/DepartmentCard';
import { Building2, Layers, Box, Loader2, AlertCircle } from 'lucide-react';

const Departments = () => {
  const navigate = useNavigate();
  const { departments, laboratories, equipment, loading, error } = useData();

  const activeDepartments = departments.length > 0 ? departments : FALLBACK_DEPTS;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Faculty of Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Select an engineering department to browse specialized laboratories, inspect equipment inventory, and reserve experimental apparatus.
          </p>
        </div>

        {/* Global Summary Pill */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center gap-4 text-xs font-semibold text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>{laboratories.length || 10} Laboratories</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Box className="w-4 h-4 text-emerald-500" />
            <span>{equipment.length} Active Instruments</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with localized cached data ({error}).</span>
        </div>
      )}

      {loading && activeDepartments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading academic departments...</p>
        </div>
      ) : activeDepartments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No departments found</h3>
          <p className="text-xs text-slate-500 mt-1">Please contact the faculty administrator.</p>
        </div>
      ) : (
        /* Department Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDepartments.map((dept) => {
            const deptId = dept._id || dept.id;
            const deptEqCount = equipment.filter((e) => {
              const eDeptId = e.departmentId || e.department?._id;
              const eDeptName = typeof e.department === 'string' ? e.department : e.department?.name;
              return eDeptId === deptId || eDeptName === dept.name;
            }).length;

            const deptLabsCount = laboratories.filter((l) => {
              const lDeptId = l.department?._id || l.department;
              return lDeptId === deptId || lDeptId === dept.id;
            }).length;

            return (
              <DepartmentCard
                key={deptId}
                department={dept}
                equipmentCount={deptEqCount}
                labsCount={deptLabsCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Departments;
