import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DEPARTMENTS as FALLBACK_DEPTS, LABORATORIES as FALLBACK_LABS } from '../utils/constants';
import { Layers, MapPin, User, Users, Box, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Laboratories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { laboratories, departments, equipment, loading, error } = useData();

  const deptParam = searchParams.get('department') || '';
  const [selectedDept, setSelectedDept] = useState(deptParam);

  const activeDepartments = departments.length > 0 ? departments : FALLBACK_DEPTS;
  const activeLaboratories = laboratories.length > 0 ? laboratories : FALLBACK_LABS;

  useEffect(() => {
    if (deptParam) {
      setSelectedDept(deptParam);
    }
  }, [deptParam]);

  const handleDeptFilter = (deptId) => {
    setSelectedDept(deptId);
    if (deptId) {
      setSearchParams({ department: deptId });
    } else {
      setSearchParams({});
    }
  };

  const filteredLabs = selectedDept
    ? activeLaboratories.filter((l) => {
        const lDeptId = l.department?._id || l.department || l.departmentId;
        const lDeptName = l.department?.name || l.departmentName;
        return (
          lDeptId === selectedDept ||
          lDeptName === selectedDept ||
          l.departmentId === selectedDept
        );
      })
    : activeLaboratories;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Faculty Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineering Laboratories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Browse through specialized laboratories across Electrical, Mechanical, Civil, Computer, and Marine Engineering.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with cached facility data ({error}).</span>
        </div>
      )}

      {/* Department Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleDeptFilter('')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            !selectedDept
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Laboratories ({activeLaboratories.length})
        </button>

        {activeDepartments.map((dept) => {
          const deptId = dept._id || dept.id;
          return (
            <button
              key={deptId}
              onClick={() => handleDeptFilter(deptId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedDept === deptId || selectedDept === dept.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dept.name}
            </button>
          );
        })}
      </div>

      {/* Laboratories Cards Grid */}
      {loading && activeLaboratories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading laboratories...</p>
        </div>
      ) : filteredLabs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No laboratories found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your department filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const labId = lab._id || lab.id;
            const deptName = lab.department?.name || lab.departmentName || 'Engineering Department';
            const labEquipment = equipment.filter((e) => {
              const eLabId = e.laboratoryId || e.laboratory?._id;
              const eLabName = typeof e.laboratory === 'string' ? e.laboratory : e.laboratory?.name;
              return eLabId === labId || eLabName === lab.name;
            });

            const availableCount = labEquipment.filter(
              (e) => (e.status || '').toLowerCase() === 'available'
            ).length;

            return (
              <div
                key={labId}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                        {deptName}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lab.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                      {lab.code || 'LAB'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-xs line-clamp-2 mb-5 leading-relaxed flex-1">
                    {lab.description || 'Specialized faculty experimental testing bench.'}
                  </p>

                  {/* Location & Supervisor */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong>Location:</strong> {lab.location || 'Engineering Complex'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong>Supervisor:</strong> {lab.supervisor || 'Faculty Laboratory Instructor'}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Status in Lab */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-slate-500 font-medium">Equipment Inventory:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{labEquipment.length} Total</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-emerald-600">{availableCount} Available</span>
                    </div>
                  </div>

                  {/* View Equipment in Lab Button */}
                  <button
                    onClick={() =>
                      navigate(
                        `/equipment?lab=${encodeURIComponent(lab.name)}&laboratory=${labId}`
                      )
                    }
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>View Lab Equipment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Laboratories;
