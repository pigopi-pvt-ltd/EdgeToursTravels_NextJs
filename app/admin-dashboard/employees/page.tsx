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
  HiCheck
} from 'react-icons/hi';
import UserDetailsModal from './UserDetailsModal';

interface User {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: 'admin' | 'employee' | 'driver';
  driverDetails?: { kycStatus?: string };
  profileCompleted?: boolean;
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '', mobileNumber: '', name: '',
    fullName: '', dateOfBirth: '', drivingLicenseNumber: '', dlExpiryDate: '',
    vehicleRegNumber: '', vehicleType: 'car', vehicleMake: '', vehicleModel: '', vehicleYear: '',
    accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '',
  });
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.employees) setUsers(data.employees);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage('');
    setTempPassword(null);
    setCopySuccess(false);
    const token = getAuthToken();
    const payload: any = {
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      name: newUser.name,
      role: isDriver ? 'driver' : 'employee',
    };
    if (isDriver) {
      payload.driverDetails = {
        fullName: newUser.fullName,
        dateOfBirth: newUser.dateOfBirth,
        drivingLicenseNumber: newUser.drivingLicenseNumber,
        dlExpiryDate: newUser.dlExpiryDate,
        vehicleRegNumber: newUser.vehicleRegNumber,
        vehicleType: newUser.vehicleType,
        vehicleMake: newUser.vehicleMake,
        vehicleModel: newUser.vehicleModel,
        vehicleYear: newUser.vehicleYear ? parseInt(newUser.vehicleYear) : undefined,
        accountHolderName: newUser.accountHolderName,
        bankName: newUser.bankName,
        accountNumber: newUser.accountNumber,
        ifscCode: newUser.ifscCode,
      };
    }
    try {
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.temporaryPassword);
        setMessage(`User created successfully!`);
        setNewUser({
          email: '', mobileNumber: '', name: '',
          fullName: '', dateOfBirth: '', drivingLicenseNumber: '', dlExpiryDate: '',
          vehicleRegNumber: '', vehicleType: 'car', vehicleMake: '', vehicleModel: '', vehicleYear: '',
          accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '',
        });
        setIsDriver(false);
        fetchUsers();
        setTimeout(() => { 
          setIsModalOpen(false); 
          setMessage('');
          setTempPassword(null);
        }, 4000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) { setMessage('Something went wrong. Please try again.'); }
    finally { setCreating(false); }
  };

  const copyPasswordToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';
  const formatName = (name: string) => name ? name.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobileNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 -mt-8 -mx-8 animate-pulse transition-colors">
        <div className="p-6 lg:p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            </div>
            <div className="h-11 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="h-10 w-full max-w-sm bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-3 w-28 bg-slate-50 dark:bg-slate-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-32 bg-slate-50 dark:bg-slate-800 rounded hidden md:block"></div>
                  <div className="h-6 w-20 bg-slate-100 dark:bg-slate-900 rounded-full"></div>
                  <div className="h-6 w-24 bg-slate-100 dark:bg-slate-900 rounded-full hidden md:block"></div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 -mt-8 -mx-8 animate-in fade-in duration-500 transition-colors">
      <div className="py-6 lg:py-8 space-y-8">
        {/* Header Section */}
        <div className="px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent transition-colors">
              Team Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">Manage employees, drivers, and their access</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiPlus className="text-lg" /> Add New User
          </button>
        </div>

        {/* Main Card - Chipka Hua (Full Width) */}
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-100 dark:shadow-black/20 border-y border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
          {/* Search Bar */}
          <div className="p-4 px-6 lg:px-8 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10 transition-colors">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none transition-all text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 transition-colors">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-8 lg:pl-10">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-8 lg:pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700 transition-colors">
                {filteredUsers.map((user, idx) => (
                  <tr 
                    key={user._id} 
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-150"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-6 py-4 pl-8 lg:pl-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shadow-sm">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white transition-colors">{formatName(user.name)}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono transition-colors">
                      {user.mobileNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-colors
                        ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800' : ''}
                        ${user.role === 'employee' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800' : ''}
                        ${user.role === 'driver' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'driver' ? (
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-colors
                          ${user.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800' : ''}
                          ${user.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800' : ''}
                          ${user.driverDetails?.kycStatus === 'submitted' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800' : ''}
                          ${!user.driverDetails?.kycStatus || user.driverDetails?.kycStatus === 'pending' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600' : ''}
                        `}>
                          {user.driverDetails?.kycStatus || 'pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right pr-8 lg:pr-10">
                      <button 
                        onClick={() => setSelectedUserId(user._id)} 
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 group-hover:scale-105"
                        title="View Details"
                      >
                        <HiOutlineEye className="text-xl" />
                      </button>
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
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between transition-colors px-8 lg:px-10">
            <span>Total users: {users.length}</span>
            <span>Showing {filteredUsers.length} of {users.length}</span>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20 transition-colors">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Create New User
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <HiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={newUser.mobileNumber} 
                    onChange={e => setNewUser({...newUser, mobileNumber: e.target.value})} 
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Driver Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Driver Account</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enable to add driver details, bank info, and KYC</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsDriver(!isDriver)} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDriver ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isDriver ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {isDriver && (
                <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6 animate-in slide-in-from-top-3 duration-300 transition-colors">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Driver Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name (as per DL) *</label><input type="text" required value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth *</label><input type="date" required value={newUser.dateOfBirth} onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Driving License Number *</label><input type="text" required value={newUser.drivingLicenseNumber} onChange={e => setNewUser({...newUser, drivingLicenseNumber: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">DL Expiry Date *</label><input type="date" required value={newUser.dlExpiryDate} onChange={e => setNewUser({...newUser, dlExpiryDate: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Registration Number *</label><input type="text" required value={newUser.vehicleRegNumber} onChange={e => setNewUser({...newUser, vehicleRegNumber: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Type *</label><select value={newUser.vehicleType} onChange={e => setNewUser({...newUser, vehicleType: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Make</label><input type="text" value={newUser.vehicleMake} onChange={e => setNewUser({...newUser, vehicleMake: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Vehicle Model</label><input type="text" value={newUser.vehicleModel} onChange={e => setNewUser({...newUser, vehicleModel: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Year of Manufacture</label><input type="number" value={newUser.vehicleYear} onChange={e => setNewUser({...newUser, vehicleYear: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mt-4 transition-colors">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Holder Name *</label><input type="text" required value={newUser.accountHolderName} onChange={e => setNewUser({...newUser, accountHolderName: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bank Name *</label><input type="text" required value={newUser.bankName} onChange={e => setNewUser({...newUser, bankName: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Number *</label><input type="text" required value={newUser.accountNumber} onChange={e => setNewUser({...newUser, accountNumber: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">IFSC Code *</label><input type="text" required value={newUser.ifscCode} onChange={e => setNewUser({...newUser, ifscCode: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none uppercase" /></div>
                  </div>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-4 transition-colors ${message.includes('successfully') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800'}`}>
                  <span className="flex items-center gap-2">
                    {message.includes('successfully') ? '🎉' : '⚠️'} {message}
                  </span>
                  {tempPassword && (
                    <button 
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow dark:text-white transition-all"
                    >
                      {copySuccess ? <HiCheck className="text-emerald-600 dark:text-emerald-400" /> : <HiClipboardCopy />}
                      {copySuccess ? 'Copied!' : 'Copy Password'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
          onUpdate={fetchUsers} 
        />
      )}
    </div>
  );
}