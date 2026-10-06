import React, { useState } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CONDITION_OPTIONS } from '../utils/constants';
import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

const ConditionReportModal = ({ isOpen, onClose, equipment, onSuccess }) => {
  const { addConditionReport } = useData();
  const { currentUser } = useAuth();

  const [condition, setCondition] = useState('Minor Issue');
  const [severity, setSeverity] = useState('Low');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    addConditionReport({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      reportedBy: currentUser?.name || 'Lab User',
      condition,
      severity,
      description,
    });

    setSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  if (!equipment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Equipment Condition Report"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-800">{equipment.name}</p>
          <p className="text-slate-500 font-mono mt-0.5">{equipment.id} • {equipment.laboratory}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observed Condition <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  condition === opt.value
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Severity Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Low', 'Medium', 'Critical / Urgent'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  severity === s
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the physical condition, error code, abnormal vibration, or calibration drift..."
            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Submit Report</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConditionReportModal;
