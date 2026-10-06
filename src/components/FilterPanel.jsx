import React from 'react';
import {
  DEPARTMENTS as FALLBACK_DEPTS,
  LABORATORIES as FALLBACK_LABS,
  CATEGORIES as FALLBACK_CATS,
  EQUIPMENT_STATUS,
} from '../utils/constants';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({
  selectedDepartment,
  onDepartmentChange,
  selectedLab,
  onLabChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onReset,
  departments = [],
  laboratories = [],
  categories = [],
}) => {
  const activeDepts = departments.length > 0 ? departments : FALLBACK_DEPTS;
  const activeLabs = laboratories.length > 0 ? laboratories : FALLBACK_LABS;
  const activeCats = categories.length > 0 ? categories : FALLBACK_CATS;

  // Laboratories filtered by selected department if any
  const availableLabs = selectedDepartment
    ? activeLabs.filter((l) => {
        const dId = l.department?._id || l.department || l.departmentId;
        const dName = l.department?.name || l.departmentName;
        return dId === selectedDepartment || dName === selectedDepartment;
      })
    : activeLabs;

  const hasActiveFilters =
    Boolean(selectedDepartment) ||
    Boolean(selectedLab) ||
    Boolean(selectedCategory) ||
    Boolean(selectedStatus);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters & Categories</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              onDepartmentChange(e.target.value);
              // Clear selected lab when department changes
              if (onLabChange) onLabChange('');
            }}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {activeDepts.map((dept) => {
              const deptId = dept._id || dept.id;
              return (
                <option key={deptId} value={deptId}>
                  {dept.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Laboratory Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Laboratory
          </label>
          <select
            value={selectedLab}
            onChange={(e) => onLabChange(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Laboratories</option>
            {availableLabs.map((lab) => {
              const labId = lab._id || lab.id;
              return (
                <option key={labId} value={lab.name}>
                  {lab.name} {lab.code ? `(${lab.code})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {activeCats.map((cat) => {
              const catName = typeof cat === 'object' ? cat.name : cat;
              const catId = typeof cat === 'object' ? cat._id : cat;
              return (
                <option key={catId || catName} value={catName}>
                  {catName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Availability Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="out-of-service">Out of Service</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
