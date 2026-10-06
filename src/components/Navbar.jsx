import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ROLES } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import {
  Bell,
  Menu,
  User,
  LogOut,
  ChevronDown,
  CheckCheck,
  Shield,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setNotifOpen(false);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case ROLES.STAFF:
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Brand Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31"/>
                <path d="M14 9.3V1.99"/>
                <path d="M8.5 2h7"/>
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
                <path d="M5.52 16h12.96"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-blue-600 transition-colors">
                  UniLab
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Faculty of Engineering
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Equipment Booking & Availability System
              </p>
            </div>
          </Link>
        </div>

        {/* Right Side: Demo Role Switcher, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Interactive Role Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
              title="Switch role for demonstration"
            >
              <span className="hidden md:inline text-slate-500 font-normal">Role:</span>
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                {getRoleIcon(currentRole)}
                <span>{currentRole}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Demo Role Switcher
                </div>
                {Object.values(ROLES).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      currentRole === role
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      <span>{role}</span>
                    </span>
                    {currentRole === role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email / In-App Notification UI (Feature #20) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className={`font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {formatDateTime(notif.timestamp)}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Saman Kumara'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {currentUser?.studentOrStaffId || 'EG/2022/4890'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">
                    {currentUser?.department}
                  </p>
                </div>

                <div className="p-1">
                  <Link
                    to="/my-bookings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Bookings</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
