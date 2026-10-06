import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DEPARTMENTS, EQUIPMENT_STATUS, BOOKING_STATUS } from '../utils/constants';
import StatCard from '../components/StatCard';
import {
  ShieldCheck,
  Users,
  Box,
  Calendar,
  Clock,
  Wrench,
  BarChart3,
  TrendingUp,
  PieChart,
  RotateCcw,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { equipment, bookings, users, resetAllData } = useData();

  // Metrics (Feature #17)
  const totalUsers = users.length;
  const totalEquipment = equipment.length;
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((b) => (b.status || '').toLowerCase() === 'pending').length;
  const underMaintenance = equipment.filter((e) => {
    const s = (e.status || '').toLowerCase();
    return s === 'maintenance' || s === 'under maintenance' || s === 'out-of-service' || s === 'out of service';
  }).length;

  // Department-wise stats
  const deptStats = DEPARTMENTS.map((dept) => {
    const eqList = equipment.filter((e) => e.departmentId === dept.id || e.department === dept.name);
    const bList = bookings.filter((b) => b.department === dept.name);
    const available = eqList.filter((e) => (e.status || '').toLowerCase() === 'available').length;

    return {
      name: dept.name,
      code: dept.code,
      color: dept.color,
      totalEq: eqList.length,
      availableEq: available,
      totalBookings: bList.length,
      utilizationRate: eqList.length > 0 ? Math.round((bList.length / eqList.length) * 100) : 0,
    };
  });

  const maxBookings = Math.max(...deptStats.map((d) => d.totalBookings), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold mb-3 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Faculty Administrator Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Engineering Faculty System Analytics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Consolidated real-time operational statistics across all 5 departments, instrument inventory maintenance, and faculty accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/equipment')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-blue-300" />
              <span>Manage Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards (Feature #17) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="purple"
          subtitle="Students & Staff"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Total Equipment"
          value={totalEquipment}
          icon={Box}
          color="blue"
          subtitle="In 15 Laboratories"
          onClick={() => navigate('/admin/equipment')}
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={Calendar}
          color="emerald"
          subtitle="Cumulative Sessions"
          onClick={() => navigate('/booking-history')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          subtitle="Awaiting Staff Decision"
          onClick={() => navigate('/staff-approvals')}
        />
        <StatCard
          title="Under Maintenance"
          value={underMaintenance}
          icon={Wrench}
          color="orange"
          subtitle="Servicing or OOS"
          onClick={() => navigate('/maintenance')}
        />
      </div>

      {/* Department-wise Statistics Charts & Grid (Feature #17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department-wise Booking & Equipment Statistics Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Department-Wise Laboratory Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of physical assets and reservation traffic by engineering discipline
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              5 DEPARTMENTS
            </span>
          </div>

          <div className="space-y-5">
            {deptStats.map((dept) => {
              const barPercent = Math.round((dept.totalBookings / maxBookings) * 100);

              return (
                <div key={dept.name} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 font-mono mr-2">{dept.code}</span>
                      <strong className="text-slate-800 text-sm">{dept.name}</strong>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-600 font-medium">
                        <strong>{dept.totalEq}</strong> Instruments ({dept.availableEq} Ready)
                      </span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        {dept.totalBookings} Bookings
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${Math.max(barPercent, 12)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Administration & Demo Reset Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Presentation Utilities</span>
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Reset or initialize the demonstration environment with pristine university mock data.
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Spring Boot REST API Target:</span>
                  <p className="font-mono text-slate-500 text-[11px]">http://localhost:8080/api/v1</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Security Architecture:</span>
                  <p className="text-slate-500 text-[11px]">JWT Bearer Tokens with Role-Based RBAC</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all lab equipment, bookings, and users to initial presentation mock data?')) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Mock Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
