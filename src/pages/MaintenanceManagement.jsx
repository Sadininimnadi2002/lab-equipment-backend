import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { EQUIPMENT_STATUS, DEPARTMENTS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { Wrench, AlertTriangle, CheckCircle2, Sliders, Calendar, User, ShieldAlert, Edit3 } from 'lucide-react';

const MaintenanceManagement = () => {
  const { equipment, updateMaintenanceStatus } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEqForEdit, setSelectedEqForEdit] = useState(null);

  // Form State
  const [newStatus, setNewStatus] = useState(EQUIPMENT_STATUS.AVAILABLE);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  const handleOpenEdit = (item) => {
    setSelectedEqForEdit(item);
    setNewStatus(item.status);
    setMaintenanceNotes(item.maintenanceStatus || '');
  };

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (selectedEqForEdit) {
      updateMaintenanceStatus(selectedEqForEdit.id, newStatus, maintenanceNotes);
      setSelectedEqForEdit(null);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.laboratory.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter && item.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const underMaintenanceCount = equipment.filter(
    (e) => e.status === EQUIPMENT_STATUS.MAINTENANCE
  ).length;
  const outOfServiceCount = equipment.filter(
    (e) => e.status === EQUIPMENT_STATUS.OUT_OF_SERVICE
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Facility Health & Maintenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Track calibration schedules, flag defective instruments, and transition equipment between Available, Booked, Under Maintenance, and Out of Service.
          </p>
        </div>

        {/* Quick status counter pills */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-3 py-2 text-xs font-bold">
            {underMaintenanceCount} Under Maintenance
          </div>
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3 py-2 text-xs font-bold">
            {outOfServiceCount} Out of Service
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search maintenance logs by equipment name, ID, or lab..."
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              !statusFilter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Statuses ({equipment.length})
          </button>
          {Object.values(EQUIPMENT_STATUS).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status} ({equipment.filter((e) => e.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Maintenance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Instrument ID & Name</th>
                <th className="py-3.5 px-4">Department & Lab</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Maintenance Condition Notes</th>
                <th className="py-3.5 px-4">Physical Condition</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-blue-600">{item.id}</div>
                    <div className="font-bold text-slate-800 line-clamp-1">{item.name}</div>
                    <div className="text-[11px] text-slate-400">SN: {item.serialNumber}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700">{item.laboratory}</div>
                    <div className="text-[11px] text-slate-400">{item.department}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-slate-600 line-clamp-2">
                      {item.maintenanceStatus || 'Nominal operational status.'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.condition} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedEqForEdit && (
        <Modal
          isOpen={Boolean(selectedEqForEdit)}
          onClose={() => setSelectedEqForEdit(null)}
          title="Update Operational & Maintenance Status"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-mono font-bold text-blue-600">{selectedEqForEdit.id}</span>
              <h4 className="font-bold text-slate-900 mt-0.5">{selectedEqForEdit.name}</h4>
              <p className="text-slate-500">{selectedEqForEdit.laboratory}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operational Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
              >
                {Object.values(EQUIPMENT_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maintenance Logs & Servicing Notes
              </label>
              <textarea
                rows={3}
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="e.g., Scheduled quarterly transducer recalibration; or awaiting replacement laser diode."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEqForEdit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceManagement;
