import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, Calendar, ShieldAlert, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const BookingModal = ({ isOpen, onClose, equipment, initialDate = '', onSuccess }) => {
  const { checkConflict, checkAvailability, createBooking } = useData();
  const { currentUser } = useAuth();

  // Form State
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  // Conflict & Validation State
  const [conflictState, setConflictState] = useState({
    checked: false,
    hasConflict: false,
    message: '',
    conflictingBooking: null,
  });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Automatically check conflict whenever equipment, date, startTime, or endTime changes
  useEffect(() => {
    if (equipment && date && startTime && endTime) {
      const localCheck = checkConflict(equipment._id || equipment.id, date, startTime, endTime);
      setConflictState({
        checked: true,
        hasConflict: localCheck.hasConflict,
        message: localCheck.message || '',
        conflictingBooking: localCheck.conflictingBooking || null,
      });
      setSubmitError('');

      // Also trigger background backend API check
      const eqId = equipment._id || equipment.id;
      checkAvailability(eqId, date, startTime, endTime)
        .then((res) => {
          if (res && res.available === false) {
            setConflictState({
              checked: true,
              hasConflict: true,
              message: res.message || 'This equipment is already reserved during the selected time period.',
              conflictingBooking: res.conflictingBooking || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [equipment, date, startTime, endTime]);

  const handleManualCheck = async () => {
    if (!equipment) return;
    setCheckingAvailability(true);
    const eqId = equipment._id || equipment.id;
    try {
      const res = await checkAvailability(eqId, date, startTime, endTime);
      setConflictState({
        checked: true,
        hasConflict: res?.available === false,
        message:
          res?.message ||
          (res?.available ? 'Equipment is available for this time period!' : 'Slot is occupied'),
        conflictingBooking: res?.conflictingBooking || null,
      });
    } catch (err) {
      setConflictState({
        checked: true,
        hasConflict: true,
        message: err.message,
        conflictingBooking: null,
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipment) return;

    if (!purpose.trim()) {
      setSubmitError('Please enter the academic or research purpose for this booking.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const eqId = equipment._id || equipment.id;

      // Backend availability verification
      const avail = await checkAvailability(eqId, date, startTime, endTime);
      if (avail && avail.available === false) {
        setConflictState({
          checked: true,
          hasConflict: true,
          message: avail.message || 'This equipment is already reserved during the selected time period.',
          conflictingBooking: avail.conflictingBooking || null,
        });
        setSubmitting(false);
        return;
      }

      await createBooking({
        equipmentId: eqId,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
        notes: notes ? notes.trim() : '',
      });

      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to submit booking request.');
    }
  };

  if (!equipment) return null;

  const eqName = equipment.equipmentName || equipment.name;
  const eqCode = equipment.equipmentCode || equipment.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Lab Equipment Booking Request"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selected Equipment Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <img
            src={equipment.image}
            alt={eqName}
            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {eqCode}
              </span>
              <StatusBadge status={equipment.status} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {eqName}
            </h4>
            <p className="text-xs text-slate-500">
              {equipment.laboratory} • {equipment.department}
            </p>
          </div>
        </div>

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Booking Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Time <span className="text-rose-500">*</span>
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

        {/* Availability Checking Button & Conflict Status Indicator */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checkingAvailability}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {checkingAvailability ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{checkingAvailability ? 'Checking Availability...' : 'Re-check Availability'}</span>
            </button>

            {conflictState.checked && !conflictState.hasConflict && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Slot is Available
              </span>
            )}
          </div>

          {/* Booking Conflict Warning Banner */}
          {conflictState.hasConflict && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Booking Conflict Detected</p>
                <p className="mt-0.5 text-rose-700">
                  {conflictState.message ||
                    'This equipment is already reserved during the selected time period.'}
                </p>
                <p className="mt-1 text-[11px] text-rose-600">
                  Please adjust your date or timeslot to continue.
                </p>
              </div>
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
            placeholder="e.g., Final Year Capstone Project - Signal Processing Testing on Inverter"
            className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Special Requirements / Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Requires differential probes and high-voltage attenuator"
            className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{submitError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={conflictState.hasConflict || submitting}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
              conflictState.hasConflict || submitting
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>Submit Booking Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
