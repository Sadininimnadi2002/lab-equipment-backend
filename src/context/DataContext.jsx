import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { equipmentService } from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import { normalizeEquipment, normalizeBooking, normalizeUser, hasTimeConflict } from '../utils/formatters';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_CONDITION_REPORTS,
} from '../utils/mockData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { currentUser, isStaff, isAdmin } = useAuth();

  // Primary Data States
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // Notifications & Condition Reports (Local supplementary states)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('unilab_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [conditionReports, setConditionReports] = useState(() => {
    const saved = localStorage.getItem('unilab_condition_reports');
    return saved ? JSON.parse(saved) : INITIAL_CONDITION_REPORTS;
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('unilab_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('unilab_condition_reports', JSON.stringify(conditionReports));
  }, [conditionReports]);

  /**
   * Fetch All Equipment from Backend API
   */
  const fetchEquipment = useCallback(async (filters = {}) => {
    setEquipmentLoading(true);
    try {
      const res = await equipmentService.getAllEquipment(filters);
      if (res?.data) {
        const normalized = res.data.map(normalizeEquipment);
        setEquipment(normalized);
        setError(null);
        return normalized;
      }
    } catch (err) {
      console.warn('Could not fetch equipment from API, using fallback data:', err.message);
      // Fallback to initial mock if API is down
      const fallback = INITIAL_EQUIPMENT.map(normalizeEquipment);
      setEquipment(fallback);
      setError(err.message);
      return fallback;
    } finally {
      setEquipmentLoading(false);
    }
  }, []);

  /**
   * Fetch Bookings from Backend API
   * Students get their own bookings (/api/bookings/my)
   * Staff and Admin get all bookings (/api/bookings)
   */
  const fetchBookings = useCallback(async (filters = {}) => {
    const token =
      localStorage.getItem('unilab_auth_token') || localStorage.getItem('token');
    if (!token) {
      setBookings([]);
      setBookingsLoading(false);
      return [];
    }

    setBookingsLoading(true);
    try {
      let res;
      if (isStaff || isAdmin) {
        res = await bookingService.getAllBookings(filters);
      } else {
        res = await bookingService.getMyBookings(filters);
      }

      if (res?.data) {
        const normalized = res.data.map(normalizeBooking);
        setBookings(normalized);
        setError(null);
        return normalized;
      }
    } catch (err) {
      console.warn('Could not fetch bookings from API:', err.message);
      setError(err.message);
    } finally {
      setBookingsLoading(false);
    }
  }, [isStaff, isAdmin]);

  /**
   * Fetch Departments, Laboratories, and Categories from Backend API
   */
  const fetchMetadata = useCallback(async () => {
    try {
      const [deptRes, labRes, catRes] = await Promise.allSettled([
        departmentService.getDepartments(),
        departmentService.getLaboratories(),
        departmentService.getCategories(),
      ]);

      if (deptRes.status === 'fulfilled' && deptRes.value?.data) {
        setDepartments(deptRes.value.data);
      }
      if (labRes.status === 'fulfilled' && labRes.value?.data) {
        setLaboratories(labRes.value.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        setCategories(catRes.value.data);
      }
    } catch (err) {
      console.warn('Metadata fetch error:', err);
    }
  }, []);

  /**
   * Fetch All Users (for Staff and Admin)
   */
  const fetchUsers = useCallback(async () => {
    if (!isStaff && !isAdmin) return;
    try {
      const res = await userService.getAllUsers();
      if (res?.data) {
        setUsers(res.data.map(normalizeUser));
      }
    } catch (err) {
      console.warn('Failed to fetch faculty users:', err);
    }
  }, [isStaff, isAdmin]);

  // Initial Load on mount and when authentication role changes
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEquipment(), fetchMetadata(), fetchBookings(), fetchUsers()]).finally(() => {
      setLoading(false);
    });
  }, [fetchEquipment, fetchMetadata, fetchBookings, fetchUsers]);

  /**
   * Conflict Checking Engine
   * 1. Checks local state immediately for fast validation
   * 2. Also provides asynchronous availability check directly against backend
   */
  const checkConflict = (equipmentId, date, startTime, endTime, excludeBookingId = null) => {
    const targetEq = equipment.find(
      (e) => e.id === equipmentId || e._id === equipmentId
    );
    if (!targetEq) {
      return { hasConflict: true, message: 'Equipment not found in system.' };
    }

    // Check maintenance / out of service
    const eqStatus = (targetEq.status || '').toLowerCase();
    if (eqStatus === 'maintenance' || eqStatus === 'under maintenance') {
      return {
        hasConflict: true,
        message: 'Cannot book equipment: Currently under maintenance',
        conflictingBooking: null,
      };
    }

    if (eqStatus === 'out-of-service' || eqStatus === 'out of service') {
      return {
        hasConflict: true,
        message: 'Cannot book equipment: Out of service',
        conflictingBooking: null,
      };
    }

    if (!date || !startTime || !endTime) {
      return { hasConflict: false };
    }

    if (startTime >= endTime) {
      return {
        hasConflict: true,
        message: 'End time must be after start time.',
      };
    }

    // Check for conflicting active bookings (Pending or Approved)
    const conflict = bookings.find((b) => {
      const bEqId = b.equipmentId || b.equipment?._id || b.equipment;
      if (bEqId !== equipmentId && bEqId !== targetEq._id && bEqId !== targetEq.id) {
        return false;
      }
      if (excludeBookingId && (b.id === excludeBookingId || b._id === excludeBookingId)) {
        return false;
      }

      const bStatus = (b.status || '').toLowerCase();
      if (bStatus !== 'pending' && bStatus !== 'approved') return false;
      if (b.date !== date) return false;

      return hasTimeConflict(startTime, endTime, b.startTime, b.endTime);
    });

    if (conflict) {
      return {
        hasConflict: true,
        message: `This equipment is already reserved during the selected time period (${conflict.startTime} - ${conflict.endTime} by ${conflict.userName}).`,
        conflictingBooking: conflict,
      };
    }

    return { hasConflict: false };
  };

  /**
   * Real-time backend availability check
   */
  const checkAvailability = async (equipmentId, date, startTime, endTime) => {
    if (!equipmentId || !date || !startTime || !endTime) {
      return { available: true };
    }
    try {
      const startISO = new Date(`${date}T${startTime}:00`).toISOString();
      const endISO = new Date(`${date}T${endTime}:00`).toISOString();

      const res = await equipmentService.checkAvailability(equipmentId, {
        startTime: startISO,
        endTime: endISO,
      });
      return res;
    } catch (err) {
      return { available: false, message: err.message };
    }
  };

  /**
   * Create Booking Request (POST /api/bookings)
   */
  const createBooking = async (bookingData) => {
    // Look up target equipment's Mongo _id
    const targetEq = equipment.find(
      (e) => e.id === bookingData.equipmentId || e._id === bookingData.equipmentId
    );
    const eqId = targetEq?._id || bookingData.equipmentId;

    const startISO = new Date(`${bookingData.date}T${bookingData.startTime}:00`).toISOString();
    const endISO = new Date(`${bookingData.date}T${bookingData.endTime}:00`).toISOString();

    const payload = {
      equipment: eqId,
      startTime: startISO,
      endTime: endISO,
      purpose: bookingData.purpose,
      notes: bookingData.notes || '',
    };

    const res = await bookingService.createBooking(payload);
    const newBooking = normalizeBooking(res.data);

    // Update state
    setBookings((prev) => [newBooking, ...prev]);

    // Add local notification
    const staffNotif = {
      id: `notif-${Date.now()}`,
      title: 'New Booking Request',
      message: `New booking request for ${newBooking.equipmentName} by ${currentUser?.name || 'Student'}.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      link: '/staff-approvals',
    };
    setNotifications((prev) => [staffNotif, ...prev]);

    return newBooking;
  };

  /**
   * Staff/Admin Approve Booking (PATCH /api/bookings/:id/approve)
   */
  const approveBooking = async (bookingId) => {
    const res = await bookingService.approveBooking(bookingId);
    const updated = normalizeBooking(res.data);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId || b._id === bookingId ? { ...b, ...updated, status: 'approved' } : b))
    );

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Booking Request Approved',
      message: `Booking request #${bookingId} has been approved.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      link: '/my-bookings',
    };
    setNotifications((prev) => [notif, ...prev]);

    return updated;
  };

  /**
   * Staff/Admin Reject Booking (PATCH /api/bookings/:id/reject)
   */
  const rejectBooking = async (bookingId, reason) => {
    const res = await bookingService.rejectBooking(bookingId, reason);
    const updated = normalizeBooking(res.data);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId || b._id === bookingId
          ? { ...b, ...updated, status: 'rejected', rejectionReason: reason }
          : b
      )
    );

    const notif = {
      id: `notif-${Date.now()}`,
      title: 'Booking Request Rejected',
      message: `Booking request #${bookingId} was rejected. Reason: ${reason}`,
      type: 'error',
      timestamp: new Date().toISOString(),
      read: false,
      link: '/my-bookings',
    };
    setNotifications((prev) => [notif, ...prev]);

    return updated;
  };

  /**
   * Cancel Booking (PATCH /api/bookings/:id/cancel)
   */
  const cancelBooking = async (bookingId) => {
    const res = await bookingService.cancelBooking(bookingId);
    const updated = normalizeBooking(res.data);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId || b._id === bookingId
          ? { ...b, ...updated, status: 'cancelled' }
          : b
      )
    );
    return updated;
  };

  /**
   * Return Tracking: Mark Equipment Collected (PATCH /api/bookings/:id/collect)
   */
  const markAsCollected = async (bookingId) => {
    const res = await bookingService.markEquipmentCollected(bookingId);
    const updated = normalizeBooking(res.data);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId || b._id === bookingId
          ? {
              ...b,
              ...updated,
              returnStatus: 'collected',
              collectedAt: new Date().toISOString(),
            }
          : b
      )
    );
    return updated;
  };

  /**
   * Return Tracking: Mark Equipment Returned (PATCH /api/bookings/:id/return)
   */
  const markAsReturned = async (bookingId) => {
    const res = await bookingService.markEquipmentReturned(bookingId);
    const updated = normalizeBooking(res.data);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId || b._id === bookingId
          ? {
              ...b,
              ...updated,
              status: 'completed',
              returnStatus: 'returned',
              returnedAt: new Date().toISOString(),
            }
          : b
      )
    );
    return updated;
  };

  /**
   * Admin / Staff Equipment CRUD (Connected to Backend APIs)
   */
  const addEquipment = async (equipmentData) => {
    const res = await equipmentService.createEquipment(equipmentData);
    const newEq = normalizeEquipment(res.data);
    setEquipment((prev) => [newEq, ...prev]);
    return newEq;
  };

  const updateEquipment = async (id, updatedFields) => {
    const res = await equipmentService.updateEquipment(id, updatedFields);
    const updated = normalizeEquipment(res.data);
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id || eq._id === id ? { ...eq, ...updated } : eq))
    );
    return updated;
  };

  const deleteEquipment = async (id) => {
    await equipmentService.deleteEquipment(id);
    setEquipment((prev) => prev.filter((eq) => eq.id !== id && eq._id !== id));
  };

  const updateMaintenanceStatus = async (id, newStatus, maintenanceNotes) => {
    const payload = {
      status: newStatus.toLowerCase(),
      description: maintenanceNotes,
    };
    await updateEquipment(id, payload);
  };

  /**
   * Condition Reports & Notifications
   */
  const addConditionReport = (reportData) => {
    const newReport = {
      id: `CR-${Date.now().toString().slice(-4)}`,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      ...reportData,
    };

    setConditionReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  /**
   * User Governance Methods (Staff / Admin)
   */
  const updateUserRole = async (userId, newRole) => {
    const res = await userService.updateUser(userId, { role: newRole });
    const normalized = normalizeUser(res.data);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u._id === userId ? { ...u, ...normalized } : u))
    );
    return normalized;
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find((u) => u.id === userId || u._id === userId);
    if (!user) return;
    const nextActive = !user.isActive;
    const res = await userService.updateUser(userId, { isActive: nextActive });
    const normalized = normalizeUser(res.data);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u._id === userId ? { ...u, ...normalized } : u))
    );
    return normalized;
  };

  const resetAllData = async () => {
    await Promise.all([fetchEquipment(), fetchMetadata(), fetchBookings(), fetchUsers()]);
  };

  return (
    <DataContext.Provider
      value={{
        equipment,
        bookings,
        departments,
        laboratories,
        categories,
        loading,
        equipmentLoading,
        bookingsLoading,
        error,
        fetchEquipment,
        fetchBookings,
        checkConflict,
        checkAvailability,
        createBooking,
        approveBooking,
        rejectBooking,
        cancelBooking,
        markAsCollected,
        markAsReturned,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        updateMaintenanceStatus,
        addConditionReport,
        conditionReports,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        users,
        fetchUsers,
        updateUserRole,
        toggleUserStatus,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
