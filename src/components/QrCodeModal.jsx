import React from 'react';
import Modal from './Modal';
import { QrCode, Printer, Download, Check, ShieldCheck } from 'lucide-react';

const QrCodeModal = ({ isOpen, onClose, equipment }) => {
  if (!equipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Identification & QR Code Tag"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Printable Asset Tag Badge */}
        <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl w-full flex flex-col items-center mb-6">
          <div className="text-[10px] tracking-widest font-extrabold uppercase text-slate-400 mb-1">
            Faculty of Engineering • Laboratory Asset Tag
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-1">{equipment.name}</h4>
          <p className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md mb-4">
            {equipment.id}
          </p>

          {/* Procedural High-Res Vector QR Code Placeholder */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 mb-4 inline-block">
            <svg
              className="w-44 h-44 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner Position Detection Patterns */}
              <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="9" y="9" width="20" height="20" fill="white" />
              <rect x="13" y="13" width="12" height="12" fill="#0f172a" />

              <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="71" y="9" width="20" height="20" fill="white" />
              <rect x="75" y="13" width="12" height="12" fill="#0f172a" />

              <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="2" />
              <rect x="9" y="71" width="20" height="20" fill="white" />
              <rect x="13" y="75" width="12" height="12" fill="#0f172a" />

              {/* Data Matrix Dots Representation */}
              <rect x="38" y="10" width="5" height="5" />
              <rect x="48" y="10" width="5" height="5" />
              <rect x="58" y="10" width="5" height="5" />
              <rect x="38" y="20" width="5" height="5" />
              <rect x="44" y="26" width="5" height="5" />
              <rect x="54" y="22" width="5" height="5" />

              <rect x="10" y="38" width="5" height="5" />
              <rect x="22" y="42" width="5" height="5" />
              <rect x="14" y="52" width="5" height="5" />

              {/* Center Tech Shield Emblem */}
              <rect x="38" y="38" width="24" height="24" rx="4" fill="#2563eb" />
              <path
                d="M50 43 L57 46 L57 52 Q57 58 50 61 Q43 58 43 52 L43 46 Z"
                fill="white"
              />

              <rect x="68" y="38" width="5" height="5" />
              <rect x="78" y="44" width="5" height="5" />
              <rect x="86" y="52" width="5" height="5" />

              <rect x="38" y="68" width="5" height="5" />
              <rect x="48" y="74" width="5" height="5" />
              <rect x="44" y="84" width="5" height="5" />
              <rect x="56" y="80" width="5" height="5" />
              <rect x="68" y="68" width="5" height="5" />
              <rect x="80" y="72" width="5" height="5" />
              <rect x="74" y="84" width="5" height="5" />
              <rect x="88" y="86" width="5" height="5" />
            </svg>
          </div>

          <div className="text-xs text-slate-500 space-y-0.5 font-medium">
            <p><strong>Department:</strong> {equipment.department}</p>
            <p><strong>Laboratory:</strong> {equipment.laboratory}</p>
            <p className="font-mono text-[11px] text-slate-400">SN: {equipment.serialNumber}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
          Scan using the Faculty mobile app for instant check-in, real-time telemetry, or rapid inventory auditing.
        </p>

        {/* Modal Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Asset Tag</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QrCodeModal;
