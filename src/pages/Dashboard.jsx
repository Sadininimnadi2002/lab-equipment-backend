import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DEPARTMENTS, EQUIPMENT_STATUS, BOOKING_STATUS } from '../utils/constants';
import StatCard from '../components/StatCard';
import BookingTable from '../components/BookingTable';
import BookingModal from '../components/BookingModal';
import {
  Box,
  CheckCircle2,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Layers,
  ClipboardList,
  Sparkles,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, isStudent, isStaff, isAdmin } = useAuth();
  const { equipment, bookings } = useData();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEqForBooking, setSelectedEqForBooking] = useState(null);

  // Compute live metrics
  const totalEquipment = equipment.length;
  const availableEquipment = equipment.filter(
    (e) => (e.status || '').toLowerCase() === 'available'
  ).length;
  const activeBookings = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'approved'
  ).length;
  const pendingRequests = bookings.filter(
    (b) => (b.status || '').toLowerCase() === 'pending'
  ).length;
  const maintenanceEquipment = equipment.filter((e) => {
    const s = (e.status || '').toLowerCase();
    return s === 'maintenance' || s === 'under maintenance' || s === 'out-of-service' || s === 'out of service';
  }).length;

  // Filter recent bookings
  const recentBookings = isStudent
    ? bookings.filter(
        (b) =>
          b.userId === currentUser?._id ||
          b.userId === currentUser?.id ||
          b.userEmail === currentUser?.email
      )
    : bookings;

  // Department-wise booking stats calculation
  const deptBookingCounts = DEPARTMENTS.map((dept) => {
    const count = bookings.filter((b) => b.department === dept.name).length;
    const eqCount = equipment.filter((e) => e.department === dept.name).length;
    return {
      name: dept.name,
      code: dept.code,
      bookings: count,
      equipment: eqCount,
    };
  });

  const maxBookings = Math.max(...deptBookingCounts.map((d) => d.bookings), 1);

  const handleOpenBooking = () => {
    // Pick the first available equipment for quick modal launch
    const available = equipment.find((e) => e.status === EQUIPMENT_STATUS.AVAILABLE) || equipment[0];
    setSelectedEqForBooking(available);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Faculty of Engineering • Laboratory Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Engineer'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              Logged in as <strong className="text-white font-semibold">{currentRole}</strong> ({currentUser?.department}).
              Monitor instrument availability, schedule lab sessions, and prevent timetable conflicts across all 5 departments.
            </p>
          </div>

          {/* Quick Action Group */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/equipment')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-blue-300" />
              <span>Browse Equipment</span>
            </button>

            <button
              onClick={handleOpenBooking}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Equipment</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Summary Cards (Feature #3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Equipment"
          value={totalEquipment}
          icon={Box}
          color="blue"
          subtitle="Across 15 Labs"
          onClick={() => navigate('/equipment')}
        />
        <StatCard
          title="Available Now"
          value={availableEquipment}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${Math.round((availableEquipment / totalEquipment) * 100)}% Ready`}
          onClick={() => navigate('/equipment?status=Available')}
        />
        <StatCard
          title="Active Bookings"
          value={activeBookings}
          icon={Calendar}
          color="purple"
          subtitle="Approved Sessions"
          onClick={() => navigate('/my-bookings')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          subtitle={isStaff ? 'Requires Approval' : 'Under Review'}
          onClick={() => navigate(isStaff ? '/staff-approvals' : '/my-bookings')}
        />
        <StatCard
          title="Under Maintenance"
          value={maintenanceEquipment}
          icon={Wrench}
          color="orange"
          subtitle="In Servicing / OOS"
          onClick={() => navigate('/maintenance')}
        />
      </div>

      {/* 3. Quick Action Buttons Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <ClipboardList className="w-4 h-4 text-blue-600" />
          <span>Quick Actions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/departments')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            5 Engineering Departments
          </button>
          <button
            onClick={() => navigate('/laboratories')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            15 Laboratories
          </button>
          <button
            onClick={() => navigate('/condition-reports')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            Report Equipment Condition
          </button>
          {isStaff && (
            <button
              onClick={() => navigate('/return-tracking')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              Return & Loan Tracking
            </button>
          )}
        </div>
      </div>

      {/* 4. Dashboard Analytics (Feature #23) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings & Equipment by Department Bar Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Departmental Equipment & Booking Utilization</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Relative reservation frequency across the 5 engineering departments
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Live Faculty Telemetry
            </span>
          </div>

          <div className="space-y-4">
            {deptBookingCounts.map((dept) => {
              const percentage = Math.round((dept.bookings / maxBookings) * 100);
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.name}</span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{dept.equipment} Instruments</span>
                      <span className="font-bold text-slate-900">{dept.bookings} Bookings</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment Status Donut Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Equipment Readiness Ratio</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Real-time operational status across all faculty laboratories
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Available for Booking</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-900">{availableEquipment}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Currently Booked</span>
                </div>
                <span className="text-sm font-extrabold text-blue-900">
                  {equipment.filter((e) => e.status === EQUIPMENT_STATUS.BOOKED).length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/80 border border-orange-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>Under Maintenance</span>
                </div>
                <span className="text-sm font-extrabold text-orange-900">
                  {equipment.filter((e) => e.status === EQUIPMENT_STATUS.MAINTENANCE).length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/80 border border-rose-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Out of Service / Repair</span>
                </div>
                <span className="text-sm font-extrabold text-rose-900">
                  {equipment.filter((e) => e.status === EQUIPMENT_STATUS.OUT_OF_SERVICE).length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/maintenance')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View full maintenance logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Bookings Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isStudent ? 'My Recent Bookings' : 'Recent Faculty Lab Bookings'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest reservation requests, approval statuses, and schedule tracking
            </p>
          </div>
          <button
            onClick={() => navigate(isStudent ? '/my-bookings' : '/booking-history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <BookingTable
          bookings={recentBookings.slice(0, 5)}
          showUser={!isStudent}
          showActions={true}
          onViewDetails={(b) => navigate(`/equipment/${b.equipmentId}`)}
          itemsPerPage={5}
        />
      </div>

      {/* Booking Modal */}
      {selectedEqForBooking && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          equipment={selectedEqForBooking}
          onSuccess={() => navigate('/my-bookings')}
        />
      )}
    </div>
  );
};

export default Dashboard;
