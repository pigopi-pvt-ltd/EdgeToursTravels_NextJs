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

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="flex gap-3">
            <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-96 bg-gradient-to-b from-slate-50 to-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 -mt-8 -mx-8 animate-in fade-in duration-500">
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Manage employees, drivers, and their access</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiPlus className="text-lg" /> Add New User
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden transition-all duration-300">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, idx) => (
                  <tr 
                    key={user._id} 
                    className="group hover:bg-indigo-50/30 transition-colors duration-150"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center shadow-sm">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{formatName(user.name)}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {user.mobileNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' : ''}
                        ${user.role === 'employee' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : ''}
                        ${user.role === 'driver' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'driver' ? (
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                          ${user.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : ''}
                          ${user.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : ''}
                          ${user.driverDetails?.kycStatus === 'submitted' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : ''}
                          ${!user.driverDetails?.kycStatus || user.driverDetails?.kycStatus === 'pending' ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' : ''}
                        `}>
                          {user.driverDetails?.kycStatus || 'pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedUserId(user._id)} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group-hover:scale-105"
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
                <div className="text-slate-300 text-5xl mb-3">👥</div>
                <p className="text-slate-500 font-medium">No users found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
          {/* Footer Stats */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 flex justify-between">
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
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Create New User
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <HiX className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Mobile Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={newUser.mobileNumber} 
                    onChange={e => setNewUser({...newUser, mobileNumber: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Driver Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Driver Account</p>
                  <p className="text-sm text-slate-500">Enable to add driver details, bank info, and KYC</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsDriver(!isDriver)} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDriver ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isDriver ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {isDriver && (
                <div className="space-y-6 border-t border-slate-100 pt-6 animate-in slide-in-from-top-3 duration-300">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Driver Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-semibold text-slate-700">Full Name (as per DL) *</label><input type="text" required value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Date of Birth *</label><input type="date" required value={newUser.dateOfBirth} onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Driving License Number *</label><input type="text" required value={newUser.drivingLicenseNumber} onChange={e => setNewUser({...newUser, drivingLicenseNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">DL Expiry Date *</label><input type="date" required value={newUser.dlExpiryDate} onChange={e => setNewUser({...newUser, dlExpiryDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Vehicle Registration Number *</label><input type="text" required value={newUser.vehicleRegNumber} onChange={e => setNewUser({...newUser, vehicleRegNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Vehicle Type *</label><select value={newUser.vehicleType} onChange={e => setNewUser({...newUser, vehicleType: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
                    <div><label className="text-sm font-semibold text-slate-700">Vehicle Make</label><input type="text" value={newUser.vehicleMake} onChange={e => setNewUser({...newUser, vehicleMake: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Vehicle Model</label><input type="text" value={newUser.vehicleModel} onChange={e => setNewUser({...newUser, vehicleModel: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Year of Manufacture</label><input type="number" value={newUser.vehicleYear} onChange={e => setNewUser({...newUser, vehicleYear: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-4">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-semibold text-slate-700">Account Holder Name *</label><input type="text" required value={newUser.accountHolderName} onChange={e => setNewUser({...newUser, accountHolderName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Bank Name *</label><input type="text" required value={newUser.bankName} onChange={e => setNewUser({...newUser, bankName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">Account Number *</label><input type="text" required value={newUser.accountNumber} onChange={e => setNewUser({...newUser, accountNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none" /></div>
                    <div><label className="text-sm font-semibold text-slate-700">IFSC Code *</label><input type="text" required value={newUser.ifscCode} onChange={e => setNewUser({...newUser, ifscCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none uppercase" /></div>
                  </div>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-xl text-sm flex items-center justify-between gap-4 ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                  <span className="flex items-center gap-2">
                    {message.includes('successfully') ? '🎉' : '⚠️'} {message}
                  </span>
                  {tempPassword && (
                    <button 
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                    >
                      {copySuccess ? <HiCheck className="text-emerald-600" /> : <HiClipboardCopy />}
                      {copySuccess ? 'Copied!' : 'Copy Password'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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