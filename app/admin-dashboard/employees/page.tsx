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
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import UserDetailsModal from './UserDetailsModal';
import CustomTable from '@/components/CustomTable';

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
        const usersArray = Array.isArray(data) ? data : data.employees || [];
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

    // Build payload for the backend (using correct field names)
    const payload = {
      fullName: newEmployee.fullName || newEmployee.name,
      mobile: newEmployee.mobileNumber,
      email: newEmployee.email,
      gender: newEmployee.gender,
      presentAddress: newEmployee.presentAddress,
      permanentAddress: newEmployee.permanentAddress,
      alternateMobile: newEmployee.alternateMobile,
      aadhar: newEmployee.aadhar,
      dob: newEmployee.dob,
      pan: newEmployee.pan,
      yearsOfExperience: parseInt(newEmployee.yearsOfExperience) || 0,
      highestQualification: newEmployee.highestQualification,
      previousExperience: newEmployee.previousExperience,
    };

    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/admin/employees/${editingUser._id}` : '/api/admin/employees';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.temporaryPassword);
        setMessage(`${editingUser ? 'User updated' : 'User created'} successfully!`);
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
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeletingUserId(userId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/employees/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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

  const employeeTableColumns = [
    {
      field: 'name',
      headerName: 'USER',
      width: 250,
      renderCell: (params: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
            {getInitials(params.row.name)}
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{formatName(params.row.name)}</div>
        </div>
      )
    },
    {
      field: 'mobileNumber',
      headerName: 'CONTACT NO',
      width: 150,
      renderCell: (params: any) => (
        <span className="font-bold uppercase tracking-tighter">{params.row.mobileNumber || '-'}</span>
      )
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      width: 220,
      renderCell: (params: any) => (
        <span className="font-bold">{params.row.email || '-'}</span>
      )
    },
    {
      field: 'role',
      headerName: 'ROLE',
      width: 140,
      renderCell: (params: any) => (
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border min-w-[100px] ${params.row.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
          params.row.role === 'employee' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
          {params.row.role}
        </span>
      )
    },
    {
      field: 'kycStatus',
      headerName: 'KYC STATUS',
      width: 150,
      renderCell: (params: any) => {
        if (params.row.role !== 'driver') return <span className="text-slate-400">—</span>;
        const status = params.row.driverDetails?.kycStatus || 'pending';
        const colorClass =
          status === 'approved' ? 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]' :
            status === 'rejected' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]' :
              status === 'submitted' ? 'bg-[#F0F9FF] text-[#0EA5E9] border-[#E0F2FE]' :
                'bg-[#FFFCF0] text-[#EAB308] border-[#FEF08A]';

        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-black border inline-block min-w-[90px] text-center uppercase tracking-widest ${colorClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 180,
      renderCell: (params: any) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setSelectedUserId(params.row._id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200" title="View Details">
            <HiOutlineEye className="text-xl" />
          </button>
          <button onClick={() => handleEditUser(params.row)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200" title="Edit User">
            <HiPencil className="text-xl" />
          </button>
          <button
            onClick={() => handleDeleteUser(params.row._id)}
            disabled={deletingUserId === params.row._id}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 disabled:opacity-50"
            title="Delete User"
          >
            {deletingUserId === params.row._id ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <HiTrash className="text-xl" />
            )}
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="flex flex-col">
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
              Employees
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
          {/* Table */}
          <CustomTable
            rows={filteredUsers}
            columns={employeeTableColumns}
            getRowId={(row) => row._id}
            height="calc(100vh - 110px)"
            title="Employees List"
            rowCount={filteredUsers.length}
            onSearch={setSearchTerm}
            extraToolbarContent={
              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-700 rounded text-[11px] dark:text-white font-bold outline-none focus:border-indigo-500"
                >
                  <option value="all">ALL ROLES</option>
                  <option value="admin">ADMIN</option>
                  <option value="employee">EMPLOYEE</option>
                  <option value="driver">DRIVER</option>
                </select>
                <select
                  value={kycFilter}
                  onChange={e => setKycFilter(e.target.value)}
                  className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-700 rounded text-[11px] dark:text-white font-bold outline-none focus:border-indigo-500"
                >
                  <option value="all">ALL KYC STATUS</option>
                  <option value="pending">PENDING</option>
                  <option value="submitted">SUBMITTED</option>
                  <option value="approved">APPROVED</option>
                  <option value="rejected">REJECTED</option>
                </select>
              </div>
            }
          />
        </div>
      </div>
    </div>
      </div >

    {/* Add User Modal */ }
  {
    isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 pt-10" onClick={() => setIsModalOpen(false)}>
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

          <form onSubmit={handleCreateUser} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Full Name <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Email Address </label>
                  <input type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Gender <span className="text-red-500 ml-1">*</span></label>
                  <select required value={newEmployee.gender} onChange={e => setNewEmployee({ ...newEmployee, gender: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Mobile Number <span className="text-red-500 ml-1">*</span></label>
                  <input type="tel" required value={newEmployee.mobileNumber} onChange={e => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Date of Birth <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" placeholder="DD-MM-YYYY" required value={newEmployee.dob} onChange={e => setNewEmployee({ ...newEmployee, dob: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Years of Experience <span className="text-red-500 ml-1">*</span></label>
                  <input type="number" required value={newEmployee.yearsOfExperience} onChange={e => setNewEmployee({ ...newEmployee, yearsOfExperience: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
              </div>
            </div>

            {/* Address & Identity */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Address & Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Aadhar Number <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.aadhar} onChange={e => setNewEmployee({ ...newEmployee, aadhar: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">PAN Number <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.pan} onChange={e => setNewEmployee({ ...newEmployee, pan: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Highest Qualification <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.highestQualification} onChange={e => setNewEmployee({ ...newEmployee, highestQualification: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Alternate Mobile</label>
                  <input type="tel" value={newEmployee.alternateMobile} onChange={e => setNewEmployee({ ...newEmployee, alternateMobile: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Present Address <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.presentAddress} onChange={e => setNewEmployee({ ...newEmployee, presentAddress: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Permanent Address <span className="text-red-500 ml-1">*</span></label>
                  <input type="text" required value={newEmployee.permanentAddress} onChange={e => setNewEmployee({ ...newEmployee, permanentAddress: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Previous Experience (optional)</label>
                  <input type="text" value={newEmployee.previousExperience} onChange={e => setNewEmployee({ ...newEmployee, previousExperience: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                </div>
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

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
              <button type="submit" disabled={creating} className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[160px] cursor-pointer">
                {creating ? 'Processing...' : editingUser ? 'Update User' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  {/* User Details Modal */ }
  {
    selectedUserId && (
      <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={fetchUsers} />
    )
  }
    </div >
  );
}