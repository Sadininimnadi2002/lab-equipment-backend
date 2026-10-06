import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { DEPARTMENTS, LABORATORIES, CATEGORIES, EQUIPMENT_STATUS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Box, Plus, Edit, Trash2, Sliders, ExternalLink, Image } from 'lucide-react';

const AdminEquipment = () => {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    departmentId: 'electrical',
    department: 'Electrical Engineering',
    laboratory: 'Electronics Lab',
    category: 'Measurement Equipment',
    status: EQUIPMENT_STATUS.AVAILABLE,
    condition: 'Good',
    model: '',
    serialNumber: '',
    location: '',
    supervisor: 'Dr. Senaka Ranasinghe',
    description: '',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Handle Department Change in Form (updates available labs automatically)
  const handleDepartmentChange = (deptId) => {
    const deptObj = DEPARTMENTS.find((d) => d.id === deptId);
    const labsForDept = LABORATORIES.filter((l) => l.departmentId === deptId);

    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      department: deptObj ? deptObj.name : prev.department,
      laboratory: labsForDept.length > 0 ? labsForDept[0].name : prev.laboratory,
    }));
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      name: item.name,
      departmentId: item.departmentId || 'electrical',
      department: item.department,
      laboratory: item.laboratory,
      category: item.category,
      status: item.status,
      condition: item.condition || 'Good',
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      location: item.location || '',
      supervisor: item.supervisor || '',
      description: item.description || '',
      image: item.image || initialFormState.image,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing && editingId) {
      updateEquipment(editingId, formData);
    } else {
      addEquipment(formData);
    }

    setIsModalOpen(false);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteEquipment(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
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

    if (selectedDeptFilter && item.departmentId !== selectedDeptFilter) {
      return false;
    }

    return true;
  });

  const currentDeptLabs = LABORATORIES.filter(
    (l) => l.departmentId === formData.departmentId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Box className="w-4 h-4" />
            <span>Inventory Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Management (CRUD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Create new laboratory instruments, modify operational configurations, assign lab locations, and manage asset lifecycles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search by ID, equipment name, lab, or department..."
        />

        <div className="w-full sm:w-64 shrink-0">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
          >
            <option value="">All 5 Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Equipment</th>
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Department & Laboratory</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-400">SN: {item.serialNumber}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {item.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700">{item.laboratory}</div>
                    <div className="text-[11px] text-slate-400">{item.department}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-slate-600">{item.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Equipment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Equipment Modal (Feature #18) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Equipment Specifications' : 'Register New Faculty Equipment'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Tektronix 4-Channel Digital Storage Oscilloscope"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Laboratory <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.laboratory}
                onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {currentDeptLabs.map((lab) => (
                  <option key={lab.id} value={lab.name}>
                    {lab.name} ({lab.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {Object.values(EQUIPMENT_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="TBS2204B"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="SN-10992-ENG"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bench Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Room A-201, Bench 3"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical summary and intended academic usage..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              {isEditing ? 'Save Changes' : 'Create Equipment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Equipment Deletion"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}" (${itemToDelete?.id})? This will remove the asset from laboratory catalog.`}
        confirmText="Permanently Delete"
        type="danger"
      />
    </div>
  );
};

export default AdminEquipment;
