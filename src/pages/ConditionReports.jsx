import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import ConditionReportModal from '../components/ConditionReportModal';
import { ClipboardCheck, PlusCircle, Wrench, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

const ConditionReports = () => {
  const { conditionReports, equipment } = useData();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedEqForReport, setSelectedEqForReport] = useState(null);

  const handleOpenReportModal = () => {
    // Choose first equipment by default for launching report modal
    setSelectedEqForReport(equipment[0]);
    setReportModalOpen(true);
  };

  const filteredReports = conditionReports.filter((r) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        r.equipmentName.toLowerCase().includes(q) ||
        r.equipmentId.toLowerCase().includes(q) ||
        r.reportedBy.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (conditionFilter && r.condition !== conditionFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>Hardware Diagnostics & QA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Condition Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Faculty incident log and defect registry. File wear-and-tear observations, minor anomalies, or urgent breakdown reports.
          </p>
        </div>

        <button
          onClick={handleOpenReportModal}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Condition Issue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports by keyword or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
          >
            <option value="">All Observed Conditions</option>
            <option value="Good">Good</option>
            <option value="Minor Issue">Minor Issue</option>
            <option value="Damaged">Damaged</option>
            <option value="Requires Maintenance">Requires Maintenance</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {report.id} • {report.equipmentId}
                </span>
                <StatusBadge status={report.condition} />
              </div>

              <h4 className="font-bold text-slate-900 text-sm mb-1">{report.equipmentName}</h4>
              <p className="text-slate-600 text-xs leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                "{report.description}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span>Reported by: </span>
                <strong className="text-slate-700">{report.reportedBy}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 text-[10px]">
                  Severity: {report.severity || 'Normal'}
                </span>
                <span>{formatDate(report.reportedDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Condition Report Modal */}
      {selectedEqForReport && (
        <ConditionReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          equipment={selectedEqForReport}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default ConditionReports;
