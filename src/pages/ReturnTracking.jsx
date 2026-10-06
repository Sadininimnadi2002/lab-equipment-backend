import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, formatDateTime, formatTime12h } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import {
  RotateCcw,
  CheckCircle,
  PackageCheck,
  CheckCircle2,
  FileCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const ReturnTracking = () => {
  const { bookings, markAsCollected, markAsReturned, bookingsLoading, fetchBookings, error } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [returnStatusFilter, setReturnStatusFilter] = useState('');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState(null);
  const [returnNotes, setReturnNotes] = useState('All accessories and power cables returned in clean working order.');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Approved and active bookings that are subject to check-out / check-in
  const trackableBookings = bookings.filter((b) => {
    const s = (b.status || '').toLowerCase();
    return s === 'approved' || s === 'completed';
  });

  const filteredBookings = trackableBookings.filter((b) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const bId = (b._id || b.id || '').toLowerCase();
      const match =
        bId.includes(q) ||
        (b.equipmentName || '').toLowerCase().includes(q) ||
        (b.userName || '').toLowerCase().includes(q) ||
        (b.laboratory || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    if (returnStatusFilter) {
      const bRetStatus = (b.returnStatus || 'not-collected').toLowerCase();
      if (bRetStatus !== returnStatusFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const handleMarkCollected = async (booking) => {
    setProcessing(true);
    try {
      const id = booking._id || booking.id;
      await markAsCollected(id);
      setActionSuccess(`Equipment marked as collected by ${booking.userName}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Mark collected error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenReturnModal = (booking) => {
    setSelectedBookingForReturn(booking);
    setReturnNotes('All accessories and power cables returned in clean working order.');
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (selectedBookingForReturn) {
      setProcessing(true);
      try {
        const id = selectedBookingForReturn._id || selectedBookingForReturn.id;
        await markAsReturned(id);
        setActionSuccess(`Equipment successfully checked in and session completed.`);
        setTimeout(() => setActionSuccess(''), 3000);
        setReturnModalOpen(false);
        setSelectedBookingForReturn(null);
      } catch (err) {
        console.error('Mark returned error:', err);
      } finally {
        setProcessing(false);
      }
    }
  };

  const collectedCount = trackableBookings.filter(
    (b) => (b.returnStatus || '').toLowerCase() === 'collected'
  ).length;

  const returnedCount = trackableBookings.filter(
    (b) => (b.returnStatus || '').toLowerCase() === 'returned'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <RotateCcw className="w-4 h-4" />
            <span>Hardware Custody Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Equipment Return & Loan Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Record physical checkout / collection of instruments and log check-in returns with post-session condition inspection.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-3 py-2 text-xs font-bold">
            {collectedCount} In Student Custody
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3 py-2 text-xs font-bold">
            {returnedCount} Returned & Inspected
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with cached loan records ({error}).</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search by student name, booking ID, equipment name..."
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setReturnStatusFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              !returnStatusFilter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Loans ({trackableBookings.length})
          </button>
          <button
            onClick={() => setReturnStatusFilter('not-collected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              returnStatusFilter === 'not-collected'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Not Collected ({trackableBookings.filter((b) => (b.returnStatus || '').toLowerCase() === 'not-collected').length})
          </button>
          <button
            onClick={() => setReturnStatusFilter('collected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              returnStatusFilter === 'collected'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Collected ({collectedCount})
          </button>
          <button
            onClick={() => setReturnStatusFilter('returned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              returnStatusFilter === 'returned'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* Loan & Return Records Table */}
      {bookingsLoading && trackableBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading loan records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">No loan records found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Approved bookings will appear here for checkout custody tracking.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Equipment & Location</th>
                  <th className="py-3.5 px-4">Student / Borrower</th>
                  <th className="py-3.5 px-4">Scheduled Slot</th>
                  <th className="py-3.5 px-4">Return Status</th>
                  <th className="py-3.5 px-4 text-right">Custodian Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map((b) => {
                  const bookingId = b._id || b.id;
                  const retStatus = (b.returnStatus || 'not-collected').toLowerCase();

                  return (
                    <tr key={bookingId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        #{bookingId.length > 10 ? bookingId.slice(-6).toUpperCase() : bookingId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{b.equipmentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.laboratory} • {b.department}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{b.userName}</div>
                        <div className="text-[11px] text-slate-400">{b.userEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">
                          {formatDate(b.date || b.startTime)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatTime12h(b.startTime)} - {formatTime12h(b.endTime)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.returnStatus || 'not-collected'} />
                        {b.collectedAt && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Issued: {formatDateTime(b.collectedAt)}
                          </div>
                        )}
                        {b.returnedAt && (
                          <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                            Returned: {formatDateTime(b.returnedAt)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* If Not Collected yet, show Mark Collected */}
                          {(!b.returnStatus || retStatus === 'not-collected') && (
                            <button
                              onClick={() => handleMarkCollected(b)}
                              disabled={processing}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Mark Collected</span>
                            </button>
                          )}

                          {/* If Collected, show Mark Returned */}
                          {retStatus === 'collected' && (
                            <button
                              onClick={() => handleOpenReturnModal(b)}
                              disabled={processing}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Returned</span>
                            </button>
                          )}

                          {/* If Returned, show Completed check */}
                          {retStatus === 'returned' && (
                            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
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

      {/* Return Inspection Modal */}
      {selectedBookingForReturn && (
        <Modal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          title="Equipment Check-in & Return Inspection"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-mono font-bold text-blue-600">
                #{String(selectedBookingForReturn._id || selectedBookingForReturn.id).slice(-6).toUpperCase()}
              </span>
              <p className="font-bold text-slate-900">{selectedBookingForReturn.equipmentName}</p>
              <p className="text-slate-500">Borrower: {selectedBookingForReturn.userName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Post-Session Condition & Inspection Notes
              </label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                placeholder="Verify probe tips, power adapters, physical casing..."
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>Marking this equipment returned will unlock it for subsequent reservations.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
              >
                {processing ? 'Processing Return...' : 'Confirm Return & Close Loan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ReturnTracking;
