import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import QrCodeModal from '../components/QrCodeModal';
import ConditionReportModal from '../components/ConditionReportModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  User,
  QrCode,
  Wrench,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatTime12h } from '../utils/formatters';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { equipment, bookings, checkConflict, checkAvailability, createBooking, loading, equipmentLoading } = useData();
  const { currentUser } = useAuth();

  const item = equipment.find(
    (e) => e.id === id || e._id === id || e.equipmentCode === id
  );

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  // Conflict Checking State
  const [conflictResult, setConflictResult] = useState({
    hasConflict: false,
    message: '',
    conflictingBooking: null,
  });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Real-time conflict checking when date or times change
  useEffect(() => {
    if (item && bookingDate && startTime && endTime) {
      const localResult = checkConflict(item._id || item.id, bookingDate, startTime, endTime);
      setConflictResult(localResult);
      setSubmitError('');

      // Also query backend API
      const eqId = item._id || item.id;
      checkAvailability(eqId, bookingDate, startTime, endTime)
        .then((res) => {
          if (res && res.available === false) {
            setConflictResult({
              hasConflict: true,
              message: res.message || 'This equipment is already reserved during the selected time period.',
              conflictingBooking: res.conflictingBooking || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [item, bookingDate, startTime, endTime]);

  const handleManualCheck = async () => {
    if (!item) return;
    setCheckingAvailability(true);
    const eqId = item._id || item.id;
    try {
      const res = await checkAvailability(eqId, bookingDate, startTime, endTime);
      setConflictResult({
        hasConflict: res?.available === false,
        message:
          res?.message ||
          (res?.available ? 'Equipment is available during selected time period.' : 'Slot is occupied.'),
        conflictingBooking: res?.conflictingBooking || null,
      });
    } catch (err) {
      setConflictResult({
        hasConflict: true,
        message: err.message,
        conflictingBooking: null,
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  if ((loading || equipmentLoading) && !item) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading equipment specifications...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        <h3 className="text-lg font-bold text-slate-800">Equipment Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested equipment ID "{id}" does not exist in the faculty directory.
        </p>
        <button
          onClick={() => navigate('/equipment')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Back to Equipment Catalog
        </button>
      </div>
    );
  }

  const itemId = item._id || item.id;
  const itemCode = item.equipmentCode || item.id;
  const itemName = item.equipmentName || item.name;

  // Active bookings for this specific equipment on the selected date
  const bookingsForSelectedDate = bookings.filter((b) => {
    const bEqId = b.equipmentId || b.equipment?._id || b.equipment;
    const bStatus = (b.status || '').toLowerCase();
    return (
      (bEqId === itemId || bEqId === itemCode) &&
      b.date === bookingDate &&
      bStatus !== 'rejected' &&
      bStatus !== 'cancelled'
    );
  });

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!purpose.trim()) {
      setSubmitError('Please specify the academic or experimental purpose.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Backend availability verification
      const avail = await checkAvailability(itemId, bookingDate, startTime, endTime);
      if (avail && avail.available === false) {
        setConflictResult({
          hasConflict: true,
          message: avail.message || 'This equipment is already reserved during the selected time period.',
          conflictingBooking: avail.conflictingBooking || null,
        });
        setSubmitting(false);
        return;
      }

      await createBooking({
        equipmentId: itemId,
        date: bookingDate,
        startTime,
        endTime,
        purpose: purpose.trim(),
        notes: notes ? notes.trim() : '',
      });

      setBookingSuccess(true);
      setPurpose('');
      setNotes('');
      setTimeout(() => {
        setBookingSuccess(false);
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>
      </div>

      {/* Main Grid: Details Left, Availability & Booking Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Equipment Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="relative h-72 sm:h-84 bg-slate-900 overflow-hidden">
              <img
                src={item.image}
                alt={itemName}
                className="w-full h-full object-cover opacity-95"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusBadge status={item.status} className="shadow-md" />
                <StatusBadge status={item.condition} className="shadow-md" />
              </div>

              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-lg font-bold">
                {itemCode}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  {item.laboratory} ({item.department})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                {itemName}
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Location & Supervisor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-6">
                <div>
                  <span className="text-slate-400 block mb-0.5">Physical Location:</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Laboratory Bench:</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {item.laboratory}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Asset Code:</span>
                  <span className="font-semibold font-mono text-blue-600">{itemCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Serial Number:</span>
                  <span className="font-semibold font-mono">{item.serialNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons: QR Code Modal & Condition Report */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>View QR Asset Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConditionModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100/50 font-semibold text-xs transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Report Condition / Defect</span>
                </button>
              </div>
            </div>
          </div>

          {/* Specifications Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Technical Specifications & Operating Limits</span>
            </h3>

            {item.specifications && item.specifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-100">
                    {item.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-semibold text-slate-700 w-1/3">
                          {spec.key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-mono">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Standard faculty equipment specifications apply.</p>
            )}
          </div>
        </div>

        {/* Right Column: Availability Checking & Booking Request (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Reservation Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Book This Equipment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your timeslot and verify instant slot availability.
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            {bookingSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Booking Request Submitted!</p>
                  <p className="text-emerald-700">Redirecting to your bookings dashboard...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reservation Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Availability Checking Indicator */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={handleManualCheck}
                    disabled={checkingAvailability}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    {checkingAvailability ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{checkingAvailability ? 'Checking...' : 'Check Availability'}</span>
                  </button>
                </div>

                {conflictResult.hasConflict ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Reservation Conflict Detected</p>
                      <p className="mt-0.5 text-rose-700">
                        {conflictResult.message ||
                          'This equipment is already reserved during the selected time period.'}
                      </p>
                      <p className="mt-1 text-[11px] text-rose-600">
                        Button disabled to prevent double-booking.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      Equipment is available during {startTime} - {endTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of Booking <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Senior Design Project - Microwave Antenna Testing"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Accessories or power cords needed..."
                  className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={conflictResult.hasConflict || bookingSuccess || submitting}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  conflictResult.hasConflict || bookingSuccess || submitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-blue-500/20'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Reservation...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>
                      {conflictResult.hasConflict
                        ? 'Unavailable During This Slot'
                        : 'Submit Booking Request'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Other Bookings for the Day */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Existing Bookings on {bookingDate}
              </h4>
              {bookingsForSelectedDate.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No other active reservations registered for this date.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {bookingsForSelectedDate.map((b) => (
                    <div
                      key={b.id || b._id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {formatTime12h(b.startTime)} - {formatTime12h(b.endTime)}
                        </span>
                        <p className="text-[11px] text-slate-500">{b.userName}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        equipment={item}
      />

      {/* Condition Report Modal */}
      <ConditionReportModal
        isOpen={conditionModalOpen}
        onClose={() => setConditionModalOpen(false)}
        equipment={item}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default EquipmentDetails;
