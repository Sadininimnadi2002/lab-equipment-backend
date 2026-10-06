import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Info } from 'lucide-react';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="py-6 px-8 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
              <p>
                © 2026 Faculty of Engineering • University Lab Equipment Booking and Availability System.
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Marine</span> • <span>Electrical</span> • <span>Mechanical</span> • <span>Civil</span> • <span>Computer</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
