import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, formatTime12h } from '../utils/formatters';
import { Calendar, Clock, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, Ban } from 'lucide-react';

const BookingTable = ({
  bookings = [],
  showUser = false,
  showActions = true,
  onViewDetails,
  onApprove,
  onReject,
  onCancel,
  itemsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!bookings.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700">No bookings found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No records match the current filter criteria or tab selection.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Booking Ref</th>
              <th className="py-3.5 px-4">Equipment & Laboratory</th>
              {showUser && <th className="py-3.5 px-4">Applicant</th>}
              <th className="py-3.5 px-4">Reservation Schedule</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Return Tracking</th>
              {showActions && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {currentBookings.map((booking) => {
              const bookingId = booking.id || booking._id;
              const statusLower = (booking.status || '').toLowerCase();

              return (
                <tr key={bookingId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Booking ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {bookingId.length > 10 ? `#${bookingId.slice(-6).toUpperCase()}` : bookingId}
                  </td>

                  {/* Equipment & Lab */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {booking.equipmentName}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {booking.laboratory} • {booking.department}
                    </div>
                  </td>

                  {/* User Info (when staff/admin view) */}
                  {showUser && (
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700">{booking.userName}</div>
                      <div className="text-[11px] text-slate-400">{booking.userEmail}</div>
                    </td>
                  )}

                  {/* Date & Time */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(booking.date || booking.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={booking.status} />
                    {booking.rejectionReason && (
                      <div
                        className="text-[10px] text-rose-600 mt-1 max-w-[140px] truncate"
                        title={booking.rejectionReason}
                      >
                        Reason: {booking.rejectionReason}
                      </div>
                    )}
                  </td>

                  {/* Return Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={booking.returnStatus || 'not-collected'} />
                  </td>

                  {/* Actions */}
                  {showActions && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(booking)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {onApprove && statusLower === 'pending' && (
                          <button
                            onClick={() => onApprove(booking)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Approve Booking"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {onReject && statusLower === 'pending' && (
                          <button
                            onClick={() => onReject(booking)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Reject Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {onCancel && (statusLower === 'pending' || statusLower === 'approved') && (
                          <button
                            onClick={() => onCancel(booking)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + itemsPerPage, bookings.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{bookings.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
