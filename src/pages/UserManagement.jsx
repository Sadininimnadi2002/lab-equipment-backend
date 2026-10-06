import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ROLES, DEPARTMENTS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { Users, UserCheck, UserX, Shield, Edit, GraduationCap, Briefcase } from 'lucide-react';

const UserManagement = () => {
  const { users, updateUserRole, toggleUserStatus } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState(ROLES.STUDENT);

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (selectedUser) {
      updateUserRole(selectedUser.id, newRole);
      setRoleModalOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (u.studentOrStaffId && u.studentOrStaffId.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (roleFilter && u.role !== roleFilter) {
      return false;
    }

    return true;
  });

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Identity & Access Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage university student registrations, assign lecturer and lab staff privileges, and audit active authorization statuses.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-center">
          Total Faculty Accounts: <span className="text-blue-600">{users.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Search by student name, email, student ID, or department..."
        />

        <div className="w-full sm:w-56 shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
          >
            <option value="">All Roles</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table (Feature #19) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Student / Staff ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name and avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {u.studentOrStaffId || 'N/A'}
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {u.department}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
                      {getRoleIcon(u.role)}
                      <span>{u.role}</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={u.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenRoleModal(u)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                        title="Change User Role"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                        <span>Change Role</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 ${
                          u.status === 'Active'
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                        title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.status === 'Active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {selectedUser && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title="Change Account Authorization Role"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500">Target User:</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedUser.name}</p>
              <p className="text-slate-500">{selectedUser.email} • {selectedUser.department}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New Access Level
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
              Assigning <strong>Lecturer / Lab Staff</strong> or <strong>Administrator</strong> grants access to booking approvals, equipment maintenance, and custody logs.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Update Role
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
