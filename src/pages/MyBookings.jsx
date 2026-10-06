import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import BookingTable from '../components/BookingTable';
import ConfirmationDialog from '../components/ConfirmationDialog';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTime12h } from '../utils/formatters';
import { CalendarDays, PlusCircle, Printer, Loader2, AlertCircle } from 'lucide-react';

const MyBookings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { bookings, cancelBooking, bookingsLoading, fetchBookings, error } = useData();

  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [selectedBookingForSlip, setSelectedBookingForSlip] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  // Re-fetch bookings on mount to ensure fresh status
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // For students, /api/bookings/my returns their bookings.
  // We match against current user identifiers, or fallback to all received bookings
  const userBookings = bookings.filter((b) => {
    if (!currentUser) return true;
    const currentId = currentUser._id || currentUser.id;
    return (
      b.userId === currentId ||
      b.userEmail === currentUser.email ||
      b.user?._id === currentId ||
      b.user?._id?.toString() === currentId?.toString()
    );
  });

  const effectiveBookings = userBookings.length > 0 ? userBookings : bookings;

  const tabs = [
    { key: 'ALL', label: 'All Bookings', count: effectiveBookings.length },
    {
      key: 'pending',
      label: 'Pending',
      count: effectiveBookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length,
    },
    {
      key: 'approved',
      label: 'Approved',
      count: effectiveBookings.filter((b) => (b.status || '').toLowerCase() === 'approved').length,
    },
    {
      key: 'completed',
      label: 'Completed',
      count: effectiveBookings.filter((b) => (b.status || '').toLowerCase() === 'completed').length,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      count: effectiveBookings.filter((b) => (b.status || '').toLowerCase() === 'rejected').length,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: effectiveBookings.filter((b) => (b.status || '').toLowerCase() === 'cancelled').length,
    },
  ];

  const displayedBookings =
    activeTab === 'ALL'
      ? effectiveBookings
      : effectiveBookings.filter(
          (b) => (b.status || '').toLowerCase() === activeTab.toLowerCase()
        );

  const handleConfirmCancel = async () => {
    if (selectedBookingForCancel) {
      setCancelling(true);
      try {
        const idToCancel = selectedBookingForCancel._id || selectedBookingForCancel.id;
        await cancelBooking(idToCancel);
        setCancelMessage('Booking cancelled successfully.');
        setTimeout(() => setCancelMessage(''), 3000);
      } catch (err) {
        console.error('Cancellation failed:', err);
      } finally {
        setCancelling(false);
        setSelectedBookingForCancel(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Reservation Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Equipment Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Track your laboratory reservations, approval statuses, check-in schedules, and equipment loan receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/equipment')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {cancelMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <span>{cancelMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with localized cached records ({error}).</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {bookingsLoading && effectiveBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading your reservations...</p>
        </div>
      ) : (
        /* Bookings Table View */
        <BookingTable
          bookings={displayedBookings}
          showUser={false}
          showActions={true}
          onViewDetails={(b) => setSelectedBookingForSlip(b)}
          onCancel={(b) => setSelectedBookingForCancel(b)}
          itemsPerPage={6}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(selectedBookingForCancel)}
        onClose={() => setSelectedBookingForCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Lab Reservation"
        message={`Are you sure you want to cancel booking for "${selectedBookingForCancel?.equipmentName}"? The reserved slot will be freed in the laboratory system.`}
        confirmText={cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
        type="danger"
      />

      {/* Lab Entry Pass / Booking Receipt Modal */}
      {selectedBookingForSlip && (
        <Modal
          isOpen={Boolean(selectedBookingForSlip)}
          onClose={() => setSelectedBookingForSlip(null)}
          title="Laboratory Entry & Authorization Slip"
          maxWidth="max-w-lg"
        >
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  Faculty of Engineering
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  Lab Equipment Booking Slip
                </h4>
              </div>
              <StatusBadge status={selectedBookingForSlip.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Booking Reference:</span>
                <span className="font-mono font-bold text-blue-600">
                  #{String(selectedBookingForSlip._id || selectedBookingForSlip.id).slice(-6).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Applicant:</span>
                <span className="font-semibold">{selectedBookingForSlip.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reserved Date:</span>
                <span className="font-semibold">{formatDate(selectedBookingForSlip.date || selectedBookingForSlip.startTime)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time Slot:</span>
                <span className="font-semibold">
                  {formatTime12h(selectedBookingForSlip.startTime)} - {formatTime12h(selectedBookingForSlip.endTime)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-[11px]">Equipment:</span>
              <p className="font-bold text-slate-800 text-sm">{selectedBookingForSlip.equipmentName}</p>
              <p className="text-slate-500 mt-0.5">
                {selectedBookingForSlip.laboratory} • {selectedBookingForSlip.department}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-[11px]">Approved Purpose:</span>
              <p className="text-slate-700 italic mt-0.5">{selectedBookingForSlip.purpose}</p>
            </div>

            {selectedBookingForSlip.rejectionReason && (
              <div className="pt-2 border-t border-rose-200 text-rose-700">
                <span className="font-semibold block text-[11px]">Rejection Reason:</span>
                <p className="mt-0.5">{selectedBookingForSlip.rejectionReason}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px]">
              <p>• Please present this slip and university student/staff ID to the laboratory instructor upon entry.</p>
              <p>• Strictly adhere to faculty laboratory safety goggles & attire protocols.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setSelectedBookingForSlip(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;
