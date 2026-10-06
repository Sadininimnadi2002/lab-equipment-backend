import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime12h } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const StaffApprovals = () => {
  const { bookings, approveBooking, rejectBooking, bookingsLoading, fetchBookings, error } = useData();
  const { currentUser } = useAuth();

  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [selectedBookingForApprove, setSelectedBookingForApprove] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingForReject, setSelectedBookingForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch all bookings for staff queue on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingBookings = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'pending'
  );

  const handleConfirmApprove = async () => {
    if (selectedBookingForApprove) {
      setProcessing(true);
      try {
        const idToApprove = selectedBookingForApprove._id || selectedBookingForApprove.id;
        await approveBooking(idToApprove);
        setActionSuccess(`Booking request approved successfully!`);
        setTimeout(() => setActionSuccess(''), 3000);
      } catch (err) {
        console.error('Approve failed:', err);
      } finally {
        setProcessing(false);
        setSelectedBookingForApprove(null);
      }
    }
  };

  const handleOpenReject = (booking) => {
    setSelectedBookingForReject(booking);
    setRejectionReason('');
    setRejectionError('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError('Please specify the reason for rejection for the student.');
      return;
    }

    if (selectedBookingForReject) {
      setProcessing(true);
      try {
        const idToReject = selectedBookingForReject._id || selectedBookingForReject.id;
        await rejectBooking(idToReject, rejectionReason);
        setActionSuccess(`Booking request rejected.`);
        setTimeout(() => setActionSuccess(''), 3000);
        setRejectModalOpen(false);
        setSelectedBookingForReject(null);
        setRejectionReason('');
      } catch (err) {
        setRejectionError(err.message || 'Reject operation failed.');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Staff Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Booking Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Review pending student reservation requests, inspect project purposes, and approve or reject equipment allocations.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold self-start sm:self-center">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{pendingBookings.length} Pending Approval</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Note: Connecting with cached approvals ({error}).</span>
        </div>
      )}

      {/* Loading state */}
      {bookingsLoading && bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading pending requests...</p>
        </div>
      ) : pendingBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All submitted equipment reservation requests have been processed. New requests will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map((b) => {
            const bookingId = b._id || b.id;
            return (
              <div
                key={bookingId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2.5 py-0.5 rounded-md">
                      #{bookingId.length > 10 ? bookingId.slice(-6).toUpperCase() : bookingId}
                    </span>
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-slate-400 font-medium">
                      Requested on {formatDate(b.createdAt || b.date)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{b.equipmentName}</h3>
                    <p className="text-xs text-slate-500">
                      {b.laboratory} • {b.department}
                    </p>
                  </div>

                  {/* Applicant & Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <strong className="text-slate-800">{b.userName}</strong> ({b.userEmail})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatDate(b.date || b.startTime)} | {formatTime12h(b.startTime)} - {formatTime12h(b.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Purpose Preview */}
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Purpose: </span>
                    <span className="italic">{b.purpose}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end">
                  <button
                    onClick={() => setSelectedBookingForDetails(b)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Details</span>
                  </button>

                  <button
                    onClick={() => setSelectedBookingForApprove(b)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>

                  <button
                    onClick={() => handleOpenReject(b)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(selectedBookingForApprove)}
        onClose={() => setSelectedBookingForApprove(null)}
        onConfirm={handleConfirmApprove}
        title="Approve Equipment Allocation"
        message={`Confirm approval for ${selectedBookingForApprove?.userName} on ${formatDate(selectedBookingForApprove?.date || selectedBookingForApprove?.startTime)} (${formatTime12h(selectedBookingForApprove?.startTime)} - ${formatTime12h(selectedBookingForApprove?.endTime)})?`}
        confirmText={processing ? 'Approving...' : 'Confirm Approval'}
        type="success"
      />

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Booking Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please enter the official reason for rejecting reservation request #{String(selectedBookingForReject?._id || selectedBookingForReject?.id).slice(-6).toUpperCase()}. The student will be informed via automated faculty notification.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Equipment scheduled for emergency calibration; or conflict with faculty course timetable."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {rejectionError && (
            <p className="text-xs text-rose-600 font-semibold">{rejectionError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
            >
              {processing ? 'Rejecting...' : 'Reject Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <Modal
          isOpen={Boolean(selectedBookingForDetails)}
          onClose={() => setSelectedBookingForDetails(null)}
          title="Booking Application Review"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-blue-600">
                  #{String(selectedBookingForDetails._id || selectedBookingForDetails.id).slice(-6).toUpperCase()}
                </span>
                <StatusBadge status={selectedBookingForDetails.status} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{selectedBookingForDetails.equipmentName}</h4>
              <p className="text-slate-500">{selectedBookingForDetails.laboratory} • {selectedBookingForDetails.department}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block">Student Applicant:</span>
                <span className="font-semibold">{selectedBookingForDetails.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address:</span>
                <span className="font-semibold">{selectedBookingForDetails.userEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Scheduled Date:</span>
                <span className="font-semibold">{formatDate(selectedBookingForDetails.date || selectedBookingForDetails.startTime)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Duration:</span>
                <span className="font-semibold">
                  {formatTime12h(selectedBookingForDetails.startTime)} - {formatTime12h(selectedBookingForDetails.endTime)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Academic Purpose:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                {selectedBookingForDetails.purpose}
              </p>
            </div>

            {selectedBookingForDetails.notes && (
              <div>
                <span className="text-slate-400 block mb-1">Special Student Notes:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                  {selectedBookingForDetails.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StaffApprovals;
