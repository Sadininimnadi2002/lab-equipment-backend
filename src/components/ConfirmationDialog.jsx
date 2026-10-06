import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning | danger | success | info
  loading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-10 h-10 text-emerald-600" />;
      default:
        return <Info className="w-10 h-10 text-blue-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="p-3 bg-slate-100 rounded-full mb-4">{getIcon()}</div>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${getConfirmButtonClass()} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
