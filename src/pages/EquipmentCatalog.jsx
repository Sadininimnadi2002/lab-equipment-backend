import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../utils/constants';
import EquipmentCard from '../components/EquipmentCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import BookingModal from '../components/BookingModal';
import { Box, LayoutGrid, List, Eye, Calendar, Loader2, AlertCircle } from 'lucide-react';

const EquipmentCatalog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { equipment, categories, departments, laboratories, equipmentLoading, error } = useData();

  // URL query params syncing
  const initialDept = searchParams.get('department') || '';
  const initialLab = searchParams.get('lab') || searchParams.get('laboratory') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialStatus = searchParams.get('status') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedLab, setSelectedLab] = useState(initialLab);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEqForBooking, setSelectedEqForBooking] = useState(null);

  const activeCategories =
    categories.length > 0
      ? categories.map((c) => (typeof c === 'object' ? c.name : c))
      : FALLBACK_CATEGORIES;

  useEffect(() => {
    if (initialDept) setSelectedDept(initialDept);
    if (initialLab) setSelectedLab(initialLab);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialStatus) setSelectedStatus(initialStatus);
  }, [initialDept, initialLab, initialCategory, initialStatus]);

  // Handle Category Quick Pill Click
  const handleCategoryPill = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(cat);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedLab('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchParams({});
  };

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Search term matching: name, id, equipmentCode, laboratory, department, description
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          (item.name || '').toLowerCase().includes(query) ||
          (item.equipmentName || '').toLowerCase().includes(query) ||
          (item.equipmentCode || '').toLowerCase().includes(query) ||
          (item.id || '').toLowerCase().includes(query) ||
          (item.laboratory || '').toLowerCase().includes(query) ||
          (item.department || '').toLowerCase().includes(query) ||
          (item.description || '').toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Department filter
      if (selectedDept) {
        const deptId = item.departmentId || item.department?._id;
        const deptName = typeof item.department === 'string' ? item.department : item.department?.name;
        if (deptId !== selectedDept && deptName !== selectedDept) {
          return false;
        }
      }

      // Laboratory filter
      if (selectedLab) {
        const labId = item.laboratoryId || item.laboratory?._id;
        const labName = typeof item.laboratory === 'string' ? item.laboratory : item.laboratory?.name;
        if (labId !== selectedLab && labName !== selectedLab) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory) {
        const catId = item.categoryId || item.category?._id;
        const catName = typeof item.category === 'string' ? item.category : item.category?.name;
        if (catId !== selectedCategory && catName !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus) {
        const itemStatus = (item.status || '').toLowerCase();
        const filterStatus = selectedStatus.toLowerCase();
        if (itemStatus !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [equipment, searchTerm, selectedDept, selectedLab, selectedCategory, selectedStatus]);

  const handleBookNow = (item) => {
    setSelectedEqForBooking(item);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Box className="w-4 h-4" />
            <span>Faculty Laboratory Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time status, specifications, and scheduling for engineering instruments, testing benches, and machinery.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with cached inventory records ({error}).</span>
        </div>
      )}

      {/* Category Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Categories:
        </span>
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
            !selectedCategory
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryPill(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar & Multi-filter Panel */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search by equipment name, asset code (e.g. EQ-EE-001), laboratory, or department..."
        />

        <FilterPanel
          selectedDepartment={selectedDept}
          onDepartmentChange={setSelectedDept}
          selectedLab={selectedLab}
          onLabChange={setSelectedLab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onReset={handleResetFilters}
          departments={departments}
          laboratories={laboratories}
          categories={categories}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800 font-bold">{filteredEquipment.length}</strong> instruments
        </span>
        {(selectedDept || selectedLab || selectedCategory || selectedStatus || searchTerm) && (
          <span className="text-blue-600 font-medium">Filtered results</span>
        )}
      </div>

      {/* Loading State */}
      {equipmentLoading && equipment.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading equipment inventory...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No equipment matches your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another laboratory, or clearing active filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item._id || item.id}
              equipment={item}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Asset Code / Category</th>
                  <th className="py-3.5 px-4">Department & Laboratory</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEquipment.map((item) => {
                  const itemId = item._id || item.id;
                  const itemCode = item.equipmentCode || item.id;
                  const itemName = item.equipmentName || item.name;
                  const statusLower = (item.status || '').toLowerCase();
                  const isBookable = statusLower === 'available' || statusLower === 'booked';

                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Equipment with thumbnail */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={itemName}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{itemName}</h4>
                            <p className="text-[11px] text-slate-500 font-mono">
                              SN: {item.serialNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ID & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-600">{itemCode}</div>
                        <div className="text-[11px] text-slate-500">{item.category}</div>
                      </td>

                      {/* Department & Laboratory */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{item.laboratory}</div>
                        <div className="text-[11px] text-slate-400">{item.department}</div>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.condition} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/equipment/${itemId}`)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleBookNow(item)}
                            disabled={!isBookable}
                            className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer ${
                              isBookable
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedEqForBooking && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          equipment={selectedEqForBooking}
          onSuccess={() => navigate('/my-bookings')}
        />
      )}
    </div>
  );
};

export default EquipmentCatalog;
