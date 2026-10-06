import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BOOKING_STATUS, DEPARTMENTS } from '../utils/constants';
import BookingTable from '../components/BookingTable';
import SearchBar from '../components/SearchBar';
import { History, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';

const BookingHistory = () => {
  const { bookings } = useData();
  const { isStudent, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Base list: students see their history, staff/admin see full faculty history
  const baseBookings = isStudent
    ? bookings.filter(
        (b) =>
          b.userId === currentUser?._id ||
          b.userId === currentUser?.id ||
          b.userEmail === currentUser?.email
      )
    : bookings;

  const filteredHistory = useMemo(() => {
    return baseBookings.filter((b) => {
      const bId = String(b.id || b._id || '').toLowerCase();
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          bId.includes(q) ||
          (b.equipmentName || '').toLowerCase().includes(q) ||
          (b.userName || '').toLowerCase().includes(q) ||
          (b.laboratory || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter && (b.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (deptFilter && b.department !== deptFilter) {
        return false;
      }

      if (dateFilter && b.date !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [baseBookings, searchTerm, statusFilter, deptFilter, dateFilter]);

  const handleExportCSV = () => {
    const headers = ['Booking ID,Equipment,Department,Laboratory,Applicant,Date,Start,End,Status\n'];
    const rows = filteredHistory.map((b) =>
      `"${b.id}","${b.equipmentName}","${b.department}","${b.laboratory}","${b.userName}","${b.date}","${b.startTime}","${b.endTime}","${b.status}"\n`
    );
    const blob = new Blob([headers.concat(rows)], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-lab-booking-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit & Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laboratory Booking History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Comprehensive audit log of all equipment reservations, approvals, and usage timelines across the engineering faculty.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search history by booking ID, equipment name, applicant, or laboratory..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Statuses</option>
              {Object.values(BOOKING_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filter by Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filter by Specific Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <BookingTable
        bookings={filteredHistory}
        showUser={!isStudent}
        showActions={false}
        itemsPerPage={8}
      />
    </div>
  );
};

export default BookingHistory;
