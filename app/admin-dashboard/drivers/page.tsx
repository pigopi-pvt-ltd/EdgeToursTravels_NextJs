
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiPencil, HiTrash, HiPlus, HiSearch, HiX, HiCheck, HiClipboardCopy } from 'react-icons/hi';

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role?: string;
  driverDetails?: {
    fullName?: string;
    dateOfBirth?: string;
    drivingLicenseNumber?: string;
    dlExpiryDate?: string;
    vehicleRegNumber?: string;
    vehicleType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    kycStatus?: string;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; tempPassword?: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error', tempPassword?: string) => {
    setToast({ message, type, tempPassword });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDrivers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.employees) {
        const driverList = data.employees.filter((emp: any) => 
          emp.role === 'driver' || (emp.driverDetails && Object.keys(emp.driverDetails).length > 0)
        );
        setDrivers(driverList);
      } else {
        showToast(data.error || 'Failed to fetch drivers', 'error');
      }
    } catch (error) {
      showToast('Error fetching drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const payload = {
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      name: formData.name,
      role: 'driver',
      driverDetails: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        dlExpiryDate: formData.dlExpiryDate,
        vehicleRegNumber: formData.vehicleRegNumber,
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
    };
    try {
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Driver created successfully!', 'success', data.temporaryPassword);
        fetchDrivers();
        closeModal();
      } else {
        showToast(data.error || 'Creation failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const payload = {
      userId: editingDriver?._id,
      driverDetails: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        dlExpiryDate: formData.dlExpiryDate,
        vehicleRegNumber: formData.vehicleRegNumber,
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
    };
    try {
      const res = await fetch('/api/admin/update-driver', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('Driver updated successfully', 'success');
        fetchDrivers();
        closeModal();
      } else {
        const data = await res.json();
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (!confirm(`Delete driver "${name}"?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/delete-employee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: id }),
      });
      if (res.ok) {
        showToast('Driver deleted', 'success');
        fetchDrivers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      email: '',
      mobileNumber: '',
      name: '',
      fullName: '',
      dateOfBirth: '',
      drivingLicenseNumber: '',
      dlExpiryDate: '',
      vehicleRegNumber: '',
      vehicleType: 'car',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      mobileNumber: driver.mobileNumber,
      name: driver.name,
      fullName: driver.driverDetails?.fullName || '',
      dateOfBirth: driver.driverDetails?.dateOfBirth?.split('T')[0] || '',
      drivingLicenseNumber: driver.driverDetails?.drivingLicenseNumber || '',
      dlExpiryDate: driver.driverDetails?.dlExpiryDate?.split('T')[0] || '',
      vehicleRegNumber: driver.driverDetails?.vehicleRegNumber || '',
      vehicleType: driver.driverDetails?.vehicleType || 'car',
      vehicleMake: driver.driverDetails?.vehicleMake || '',
      vehicleModel: driver.driverDetails?.vehicleModel || '',
      vehicleYear: driver.driverDetails?.vehicleYear?.toString() || '',
      accountHolderName: driver.driverDetails?.accountHolderName || '',
      bankName: driver.driverDetails?.bankName || '',
      accountNumber: driver.driverDetails?.accountNumber || '',
      ifscCode: driver.driverDetails?.ifscCode || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mobileNumber?.includes(searchTerm) ||
    d.driverDetails?.drivingLicenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 transition-colors duration-300">
        <div className="p-6 lg:p-8 space-y-6 animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            </div>
            <div className="h-11 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-11 w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-xl mb-8"></div>
          
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="h-16 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"></div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      <div className="h-3 w-24 bg-slate-50 dark:bg-slate-800 pr-4 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded hidden md:block"></div>
                  <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded hidden md:block"></div>
                  <div className="h-6 w-20 bg-slate-50 dark:bg-slate-800/80 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800"></div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 transition-colors duration-300">
      <div className="py-6 lg:py-8 space-y-6">
        {/* Toast */}
        {toast && (
          <div className="px-6 lg:px-8">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-5 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}>
              {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
              <span className="text-sm font-medium">{toast.message}</span>
              {toast.tempPassword && (
                <button
                  onClick={() => copyPassword(toast.tempPassword!)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow dark:text-white transition"
                >
                  {copySuccess ? <HiCheck className="text-3.5 h-3.5" /> : <HiClipboardCopy className="w-3.5 h-3.5" />}
                  {copySuccess ? 'Copied!' : 'Copy Password'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Drivers Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage driver profiles, KYC, and vehicle details</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <HiPlus className="text-lg" /> Add Driver
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, mobile or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:text-white outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Table - Chipka Hua (Full Width) */}
        <div className="bg-white dark:bg-slate-900/50 shadow-xl shadow-slate-100 dark:shadow-none border-y border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License No.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Reg.</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredDrivers.map((driver, idx) => (
                  <tr key={driver._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-150" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shadow-sm">
                          {driver.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white transition-colors">{driver.name || '-'}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono transition-colors">{driver.mobileNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono transition-colors">{driver.driverDetails?.drivingLicenseNumber || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">{driver.driverDetails?.vehicleRegNumber || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                        driver.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800' :
                        driver.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800' :
                        driver.driverDetails?.kycStatus === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800'
                      }`}>
                        {driver.driverDetails?.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(driver)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 group-hover:scale-105">
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteDriver(driver._id, driver.name)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all duration-200 group-hover:scale-105">
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Chipka Hua on sides */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDrivers.map((driver) => (
              <div key={driver._id} className="p-6 bg-white dark:bg-slate-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shadow-sm">
                      {driver.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white transition-colors">{driver.name || '-'}</h3>
                      <p className="text-xs text-slate-500 transition-colors">{driver.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    driver.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    driver.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {driver.driverDetails?.kycStatus || 'pending'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact</label>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">{driver.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">License</label>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors truncate">{driver.driverDetails?.drivingLicenseNumber || '-'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                  <button onClick={() => openEditModal(driver)} className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg transition-colors">
                    <HiPencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDeleteDriver(driver._id, driver.name)} className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 rounded-lg transition-colors">
                    <HiTrash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-xs text-slate-500 dark:text-slate-400 flex justify-between transition-colors">
            <span>Total drivers: {drivers.length}</span>
            <span>Showing {filteredDrivers.length} of {drivers.length}</span>
          </div>
        </div>

        {/* Modal - Enhanced Design */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 transition-colors" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10 transition-colors">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <HiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver} className="p-6 space-y-6">
                {/* Driver Information Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Driver Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Full Name (as per DL) *</label><input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white dark:placeholder-slate-500 focus:border-indigo-400 outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Date of Birth *</label><input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Driving License Number *</label><input type="text" required value={formData.drivingLicenseNumber} onChange={e => setFormData({...formData, drivingLicenseNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">DL Expiry Date *</label><input type="date" required value={formData.dlExpiryDate} onChange={e => setFormData({...formData, dlExpiryDate: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Vehicle Registration Number *</label><input type="text" required value={formData.vehicleRegNumber} onChange={e => setFormData({...formData, vehicleRegNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Vehicle Type *</label><select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Vehicle Make</label><input type="text" value={formData.vehicleMake} onChange={e => setFormData({...formData, vehicleMake: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Vehicle Model</label><input type="text" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Year of Manufacture</label><input type="number" value={formData.vehicleYear} onChange={e => setFormData({...formData, vehicleYear: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Account Holder Name *</label><input type="text" required value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Bank Name *</label><input type="text" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Account Number *</label><input type="text" required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">IFSC Code *</label><input type="text" required value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all uppercase" /></div>
                  </div>
                </div>

                {/* Login Credentials Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Login Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" disabled={!!editingDriver} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Mobile Number *</label><input type="tel" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" disabled={!!editingDriver} /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-400 transition-colors">Display Name *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none transition-all" /></div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-200">
                    {editingDriver ? 'Update Driver' : 'Create Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}