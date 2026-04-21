// app/admin-dashboard/employees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiSearch,
  HiPlus,
  HiOutlineEye,
  HiX,
  HiClipboardCopy,
  HiCheck,
  HiTrash,
  HiPencil,
  HiChevronDown
} from 'react-icons/hi';
import UserDetailsModal from './UserDetailsModal';

interface User {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: 'admin' | 'employee' | 'driver';
  driverDetails?: { kycStatus?: string };
  employeeDetails?: {
    fullName: string;
    mobile: string;
    gender: string;
    presentAddress: string;
    permanentAddress: string;
    alternateMobile?: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    yearsOfExperience: number;
    highestQualification: string;
    previousExperience?: string;
  };
  profileCompleted?: boolean;
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('employee');
  const [kycFilter, setKycFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Employee fields (all required by spec)
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    mobileNumber: '',
    name: '',
    fullName: '',
    gender: '',
    presentAddress: '',
    permanentAddress: '',
    alternateMobile: '',
    aadhar: '',
    dob: '',
    pan: '',
    yearsOfExperience: '',
    highestQualification: '',
    previousExperience: '',
  });
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // API returns direct array
        const usersArray = Array.isArray(data) ? data : data.employees || [];
        // Only show users with role 'employee' as per request
        setUsers(usersArray.filter((u: any) => u.role === 'employee'));
      } else {
        setError(data.error || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      setError('Network error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    setTempPassword(null);
    setCopySuccess(false);
    const token = getAuthToken();

    let payload: any;
    let apiUrl = '/api/admin/create-employee';
    let method = 'POST';

    if (editingUser) {
      // Update operation
      apiUrl = '/api/admin/update-employee';
      method = 'PUT';
      payload = { userId: editingUser._id };
    }

    // Employee payload with all required fields
    payload = {
      ...payload,
      email: newEmployee.email,
      mobileNumber: newEmployee.mobileNumber,
      name: newEmployee.name,
      role: 'employee',
      fullName: newEmployee.fullName,
      gender: newEmployee.gender,
      presentAddress: newEmployee.presentAddress,
      permanentAddress: newEmployee.permanentAddress,
      alternateMobile: newEmployee.alternateMobile,
      aadhar: newEmployee.aadhar,
      dob: newEmployee.dob,
      pan: newEmployee.pan,
      yearsOfExperience: newEmployee.yearsOfExperience,
      highestQualification: newEmployee.highestQualification,
      previousExperience: newEmployee.previousExperience,
    };

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.temporaryPassword);
        setMessage(`${editingUser ? 'User updated' : 'User created'} successfully!`);
        // Reset forms
        resetForm();
        fetchUsers();
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage('');
          setTempPassword(null);
        }, 4000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyPasswordToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUserId(userId);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/delete-employee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setMessage('User deleted successfully');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setMessage('Network error occurred');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
    // Pre-populate the form
    setNewEmployee({
      email: user.email,
      mobileNumber: user.mobileNumber,
      name: user.name,
      fullName: user.employeeDetails?.fullName || '',
      gender: user.employeeDetails?.gender || '',
      presentAddress: user.employeeDetails?.presentAddress || '',
      permanentAddress: user.employeeDetails?.permanentAddress || '',
      alternateMobile: user.employeeDetails?.alternateMobile || '',
      aadhar: user.employeeDetails?.aadhar || '',
      dob: user.employeeDetails?.dob ? new Date(user.employeeDetails.dob).toISOString().split('T')[0] : '',
      pan: user.employeeDetails?.pan || '',
      yearsOfExperience: user.employeeDetails?.yearsOfExperience?.toString() || '',
      highestQualification: user.employeeDetails?.highestQualification || '',
      previousExperience: user.employeeDetails?.previousExperience || '',
    });
  };

  const resetForm = () => {
    setNewEmployee({
      email: '', mobileNumber: '', name: '',
      fullName: '', gender: '', presentAddress: '', permanentAddress: '',
      alternateMobile: '', aadhar: '', dob: '', pan: '',
      yearsOfExperience: '', highestQualification: '', previousExperience: '',
    });
    setEditingUser(null);
    setMessage('');
    setTempPassword(null);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNumber?.includes(searchTerm);

    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    const matchesKyc = kycFilter === 'all' ? true : (user.driverDetails?.kycStatus || 'pending') === kycFilter;

    return matchesSearch && matchesRole && matchesKyc;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="flex flex-col">
          {/* Skeleton Search Area (approx 72px) */}
          <div className="p-4 h-[72px] border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/20 dark:bg-slate-900/20 px-6 gap-4">
            <div className="h-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-100 dark:border-slate-800"></div>
            <div className="h-10 w-32 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 hidden md:block"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i} className="px-6 py-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row} className="border-b border-slate-100 dark:border-slate-800 h-[64px]">
                    <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                      </div>
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                      </td>
                    ))}
                    <td className="px-6 py-3">
                      <div className="flex justify-center gap-2">
                        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 min-h-screen transition-colors duration-300">
        {/* Header Toolbar matched to Bookings Page */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Employees <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredUsers.length})</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Add Employee
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-700 custom-scrollbar shadow-inner">
            <table className="w-full border-collapse min-w-[1000px] md:min-w-full">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Contact No</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                    <span className="uppercase text-slate-700 dark:text-slate-300">Role</span>
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                    <div className="relative inline-flex items-center gap-1 cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors">
                      <span className="uppercase">{kycFilter === 'all' ? 'KYC Status' : kycFilter}</span>
                      <HiChevronDown className="text-slate-400 text-xs" />
                      <select
                        value={kycFilter}
                        onChange={(e) => setKycFilter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      >
                        <option value="all">ALL STATUS</option>
                        <option value="pending">PENDING</option>
                        <option value="submitted">SUBMITTED</option>
                        <option value="approved">APPROVED</option>
                        <option value="rejected">REJECTED</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredUsers.map((user, idx) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{formatName(user.name)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-tighter whitespace-nowrap">
                      {user.mobileNumber || '-'}
                    </td>
                    <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border min-w-[100px] ${user.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-100' :
                        user.role === 'employee' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100' :
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                      {user.role === 'driver' ? (
                        <span className={`
                          px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px]
                          ${user.driverDetails?.kycStatus === 'approved' ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' :
                            user.driverDetails?.kycStatus === 'rejected' ? 'bg-[#FEF2F2] dark:bg-red-900/20 text-[#EF4444] border-[#FEE2E2] dark:border-red-900/30' :
                              user.driverDetails?.kycStatus === 'submitted' ? 'bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0EA5E9] border-[#E0F2FE] dark:border-blue-900/30' :
                                'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30'}
                        `}>
                          {user.driverDetails?.kycStatus || 'pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedUserId(user._id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 group-hover:scale-105" title="View Details">
                          <HiOutlineEye className="text-xl" />
                        </button>
                        <button onClick={() => handleEditUser(user)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 group-hover:scale-105" title="Edit User">
                          <HiPencil className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deletingUserId === user._id}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          {deletingUserId === user._id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <HiTrash className="text-xl" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-slate-300 dark:text-slate-700 text-5xl mb-3">👥</div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No users found</p>
                <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
          {/* Footer Stats */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Total users: {users.length}</span>
            <span>Showing {filteredUsers.length} of {users.length}</span>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl animate-in slide-in-from-bottom-10 duration-300 subtle-scrollbar" style={{ borderRadius: '0.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingUser ? 'Edit User' : 'Create Employee'}
              </h2>
              <button onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <HiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address </label>
                  <input type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender <span className="text-red-500 ml-1">*</span></label>
                  <select required value={newEmployee.gender} onChange={e => setNewEmployee({ ...newEmployee, gender: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none mt-1"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number <span className="text-red-500 ml-1">*</span></label>
                  <input type="tel" required value={newEmployee.mobileNumber} onChange={e => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" placeholder="DD-MM-YYYY" required value={newEmployee.dob} onChange={e => setNewEmployee({ ...newEmployee, dob: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none uppercase mt-1" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Years of Experience <span className="text-red-500 ml-1">*</span></label>
                  <input type="number" required value={newEmployee.yearsOfExperience} onChange={e => setNewEmployee({ ...newEmployee, yearsOfExperience: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none mt-1" />
                </div>
              </div>

              {/* Employee Form – Address & Docs */}
              <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6 animate-in slide-in-from-top-3 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Aadhar Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={newEmployee.aadhar} onChange={e => setNewEmployee({ ...newEmployee, aadhar: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">PAN Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={newEmployee.pan} onChange={e => setNewEmployee({ ...newEmployee, pan: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Highest Qualification <span className="text-red-500 ml-1">*</span></label><input type="text" required value={newEmployee.highestQualification} onChange={e => setNewEmployee({ ...newEmployee, highestQualification: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none" /></div>
                  <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alternate Mobile</label><input type="tel" value={newEmployee.alternateMobile} onChange={e => setNewEmployee({ ...newEmployee, alternateMobile: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none" /></div>
                  <div className="md:col-span-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Present Address <span className="text-red-500 ml-1">*</span></label><input type="text" required value={newEmployee.presentAddress} onChange={e => setNewEmployee({ ...newEmployee, presentAddress: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none" /></div>
                  <div className="md:col-span-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Permanent Address <span className="text-red-500 ml-1">*</span></label><input type="text" required value={newEmployee.permanentAddress} onChange={e => setNewEmployee({ ...newEmployee, permanentAddress: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none" /></div>
                  <div className="md:col-span-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Previous Experience (optional)</label><input type="text" value={newEmployee.previousExperience} onChange={e => setNewEmployee({ ...newEmployee, previousExperience: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg px-4 py-2.5 outline-none" /></div>
                </div>
              </div>



              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-4 ${message.includes('successfully') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800'}`}>
                  <span className="flex items-center gap-2">
                    {message.includes('successfully') ? '🎉' : '⚠️'} {message}
                  </span>
                  {tempPassword && (
                    <button type="button" onClick={copyPasswordToClipboard} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow">
                      {copySuccess ? <HiCheck className="text-emerald-600 dark:text-emerald-400" /> : <HiClipboardCopy />}
                      {copySuccess ? 'Copied!' : 'Copy Password'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {creating ? 'Processing...' : editingUser ? 'Update User' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={fetchUsers} />
      )}
    </div>
  );
}