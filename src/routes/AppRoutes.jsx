import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../utils/constants';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Departments from '../pages/Departments';
import Laboratories from '../pages/Laboratories';
import EquipmentCatalog from '../pages/EquipmentCatalog';
import EquipmentDetails from '../pages/EquipmentDetails';
import MyBookings from '../pages/MyBookings';
import BookingHistory from '../pages/BookingHistory';
import StaffApprovals from '../pages/StaffApprovals';
import MaintenanceManagement from '../pages/MaintenanceManagement';
import ReturnTracking from '../pages/ReturnTracking';
import ConditionReports from '../pages/ConditionReports';
import AdminDashboard from '../pages/AdminDashboard';
import AdminEquipment from '../pages/AdminEquipment';
import UserManagement from '../pages/UserManagement';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected University Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="departments" element={<Departments />} />
        <Route path="laboratories" element={<Laboratories />} />
        <Route path="equipment" element={<EquipmentCatalog />} />
        <Route path="equipment/:id" element={<EquipmentDetails />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="booking-history" element={<BookingHistory />} />
        <Route path="condition-reports" element={<ConditionReports />} />

        {/* Staff & Admin Only Routes */}
        <Route
          path="staff-approvals"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
              <StaffApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="maintenance"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
              <MaintenanceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="return-tracking"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
              <ReturnTracking />
            </ProtectedRoute>
          }
        />

        {/* Administrator Exclusive Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/equipment"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Global Catch All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
