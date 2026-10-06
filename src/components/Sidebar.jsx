import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Box,
  CalendarDays,
  History,
  CheckSquare,
  Wrench,
  RotateCcw,
  ClipboardCheck,
  ShieldCheck,
  Users,
  Settings,
  HelpCircle,
  X,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isStudent, isStaff, isAdmin, currentRole } = useAuth();
  const { bookings } = useData();

  // Pending bookings count for staff/admin badge
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'Pending').length;

  const navLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header on mobile */}
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              UL
            </div>
            <span className="font-bold text-slate-800 text-sm">UniLab Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Core Links */}
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Core Overview
            </p>
            <nav className="space-y-1">
              <NavLink to="/dashboard" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Main Dashboard</span>
                </div>
              </NavLink>

              <NavLink to="/departments" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Faculty Departments</span>
                </div>
              </NavLink>

              <NavLink to="/laboratories" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Laboratories</span>
                </div>
              </NavLink>

              <NavLink to="/equipment" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4" />
                  <span>Equipment Catalog</span>
                </div>
              </NavLink>
            </nav>
          </div>

          {/* Student & General Booking Activities */}
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Bookings & Activity
            </p>
            <nav className="space-y-1">
              <NavLink to="/my-bookings" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>My Bookings</span>
                </div>
              </NavLink>

              <NavLink to="/booking-history" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4" />
                  <span>Booking History</span>
                </div>
              </NavLink>

              <NavLink to="/condition-reports" onClick={onClose} className={navLinkClass}>
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Condition Reports</span>
                </div>
              </NavLink>
            </nav>
          </div>

          {/* Lab Staff & Lecturer Operations */}
          {isStaff && (
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Staff Operations
              </p>
              <nav className="space-y-1">
                <NavLink to="/staff-approvals" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Staff Approvals</span>
                  </div>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/maintenance" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4" />
                    <span>Maintenance Status</span>
                  </div>
                </NavLink>

                <NavLink to="/return-tracking" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>Return Tracking</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Administrator Panel */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Admin Center
              </p>
              <nav className="space-y-1">
                <NavLink to="/admin" end onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/equipment" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <Box className="w-4 h-4" />
                    <span>Equipment Mgmt</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/users" onClick={onClose} className={navLinkClass}>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>User Management</span>
                  </div>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Footer Info Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Current Role</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                {currentRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Faculty of Engineering System v2.4 (DevOps Project)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
