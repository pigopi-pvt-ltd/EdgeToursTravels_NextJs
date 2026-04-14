'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import FileUpload from '@/components/FileUpload';
import {
  HiPencil, HiTrash, HiPlus, HiSearch, HiX, HiCheck, HiClipboardCopy,
} from 'react-icons/hi';

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role?: string;
  driverDetails?: {
    // Basic info
    fullName?: string;
    mobile?: string;
    gender?: string;
    presentAddress?: string;
    permanentAddress?: string;
    alternateMobile?: string;
    aadhar?: string;
    dob?: string;
    pan?: string;
    email?: string;
    drivingLicense?: string;
    yearsOfExperience?: number;
    highestQualification?: string;
    // Vehicle & bank (already existed)
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
    // Image URLs
    profilePhoto?: string;
    aadharFront?: string;
    aadharBack?: string;
    panImage?: string;
    licenseImage?: string;
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
      if (res.ok) {
        // API returns direct array of users; filter drivers
        const usersArray = Array.isArray(data) ? data : data.employees || [];
        const driverList = usersArray.filter((emp: any) => emp.role === 'driver');
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
      mobileNumber: formData.mobile,
      name: formData.fullName, // display name
      role: 'driver',
      driverDetails: {
        // New fields from screenshot
        fullName: formData.fullName,
        mobile: formData.mobile,
        gender: formData.gender,
        presentAddress: formData.presentAddress,
        permanentAddress: formData.permanentAddress,
        alternateMobile: formData.alternateMobile,
        aadhar: formData.aadhar,
        dob: formData.dob,
        pan: formData.pan,
        email: formData.email,
        drivingLicense: formData.drivingLicense,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        highestQualification: formData.highestQualification,
        // Existing vehicle/bank fields (keep for compatibility)
        dateOfBirth: formData.dob,
        drivingLicenseNumber: formData.drivingLicense,
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
        // Image uploads
        profilePhoto: formData.profilePhoto,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack,
        panImage: formData.panImage,
        licenseImage: formData.licenseImage,
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
        // New fields
        fullName: formData.fullName,
        mobile: formData.mobile,
        gender: formData.gender,
        presentAddress: formData.presentAddress,
        permanentAddress: formData.permanentAddress,
        alternateMobile: formData.alternateMobile,
        aadhar: formData.aadhar,
        dob: formData.dob,
        pan: formData.pan,
        email: formData.email,
        drivingLicense: formData.drivingLicense,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        highestQualification: formData.highestQualification,
        // Existing fields
        dateOfBirth: formData.dob,
        drivingLicenseNumber: formData.drivingLicense,
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
        // Images
        profilePhoto: formData.profilePhoto,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack,
        panImage: formData.panImage,
        licenseImage: formData.licenseImage,
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
      // Basic driver info
      fullName: '',
      mobile: '',
      gender: '',
      presentAddress: '',
      permanentAddress: '',
      alternateMobile: '',
      aadhar: '',
      dob: '',
      pan: '',
      email: '',
      drivingLicense: '',
      yearsOfExperience: '',
      highestQualification: '',
      // Vehicle/bank
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
      // Image URLs
      profilePhoto: '',
      aadharFront: '',
      aadharBack: '',
      panImage: '',
      licenseImage: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    const details = driver.driverDetails || {};
    setFormData({
      fullName: details.fullName || '',
      mobile: details.mobile || '',
      gender: details.gender || '',
      presentAddress: details.presentAddress || '',
      permanentAddress: details.permanentAddress || '',
      alternateMobile: details.alternateMobile || '',
      aadhar: details.aadhar || '',
      dob: details.dob ? new Date(details.dob).toISOString().split('T')[0] : '',
      pan: details.pan || '',
      email: details.email || '',
      drivingLicense: details.drivingLicense || '',
      yearsOfExperience: details.yearsOfExperience?.toString() || '',
      highestQualification: details.highestQualification || '',
      dlExpiryDate: details.dlExpiryDate ? new Date(details.dlExpiryDate).toISOString().split('T')[0] : '',
      vehicleRegNumber: details.vehicleRegNumber || '',
      vehicleType: details.vehicleType || 'car',
      vehicleMake: details.vehicleMake || '',
      vehicleModel: details.vehicleModel || '',
      vehicleYear: details.vehicleYear?.toString() || '',
      accountHolderName: details.accountHolderName || '',
      bankName: details.bankName || '',
      accountNumber: details.accountNumber || '',
      ifscCode: details.ifscCode || '',
      profilePhoto: details.profilePhoto || '',
      aadharFront: details.aadharFront || '',
      aadharBack: details.aadharBack || '',
      panImage: details.panImage || '',
      licenseImage: details.licenseImage || '',
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
    d.driverDetails?.drivingLicense?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-md"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-5 duration-300 ${
            toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}>
            {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
            {toast.tempPassword && (
              <button onClick={() => copyPassword(toast.tempPassword!)} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow">
                {copySuccess ? <HiCheck className="w-3.5 h-3.5" /> : <HiClipboardCopy className="w-3.5 h-3.5" />}
                {copySuccess ? 'Copied!' : 'Copy Password'}
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Drivers Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage driver profiles, KYC, and vehicle details</p>
          </div>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 hover:scale-105 active:scale-95">
            <HiPlus className="text-lg" /> Add Driver
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name, email, mobile or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:text-white outline-none text-sm shadow-sm"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white dark:bg-slate-900/50 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
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
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shadow-sm">
                          {driver.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white">{driver.name || '-'}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{driver.mobileNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{driver.driverDetails?.drivingLicense || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{driver.driverDetails?.vehicleRegNumber || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
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
                {filteredDrivers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500">No drivers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Total drivers: {drivers.length}</span>
            <span>Showing {filteredDrivers.length} of {drivers.length}</span>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredDrivers.map((driver) => (
            <div key={driver._id} className="bg-white dark:bg-slate-900/50 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white">{driver.name || '-'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{driver.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{driver.mobileNumber}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>License: {driver.driverDetails?.drivingLicense || '-'}</span>
                    <span>Vehicle: {driver.driverDetails?.vehicleRegNumber || '-'}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      driver.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      driver.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                      driver.driverDetails?.kycStatus === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {driver.driverDetails?.kycStatus || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(driver)} className="p-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteDriver(driver._id, driver.name)} className="p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg">
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredDrivers.length === 0 && <div className="text-center py-12 text-slate-500">No drivers found</div>}
        </div>

        {/* Modal – Full driver form with all fields from screenshot */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <HiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver} className="p-6 space-y-6">
                {/* Personal Information (from screenshot) */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Full Name *</label><input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Mobile Number *</label><input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Gender *</label><select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Present Address *</label><input type="text" required value={formData.presentAddress} onChange={e => setFormData({...formData, presentAddress: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Permanent Address *</label><input type="text" required value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Alternate Mobile (optional)</label><input type="tel" value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Aadhar Number *</label><input type="text" required value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Date of Birth *</label><input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">PAN Number *</label><input type="text" required value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Driving License Number *</label><input type="text" required value={formData.drivingLicense} onChange={e => setFormData({...formData, drivingLicense: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Years of Experience *</label><input type="number" required value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Highest Qualification *</label><input type="text" required value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Document Uploads
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FileUpload folder="drivers" label="Profile Photo" onUpload={url => setFormData({...formData, profilePhoto: url})} existingUrl={formData.profilePhoto} />
                    <FileUpload folder="drivers" label="Aadhar Front" onUpload={url => setFormData({...formData, aadharFront: url})} existingUrl={formData.aadharFront} />
                    <FileUpload folder="drivers" label="Aadhar Back" onUpload={url => setFormData({...formData, aadharBack: url})} existingUrl={formData.aadharBack} />
                    <FileUpload folder="drivers" label="PAN Image" onUpload={url => setFormData({...formData, panImage: url})} existingUrl={formData.panImage} />
                    <FileUpload folder="drivers" label="License Image" onUpload={url => setFormData({...formData, licenseImage: url})} existingUrl={formData.licenseImage} />
                  </div>
                </div>

                {/* Vehicle & Bank Details (optional, keep for full functionality) */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    Vehicle & Bank Details (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">DL Expiry Date</label><input type="date" value={formData.dlExpiryDate} onChange={e => setFormData({...formData, dlExpiryDate: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Vehicle Registration Number</label><input type="text" value={formData.vehicleRegNumber} onChange={e => setFormData({...formData, vehicleRegNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Vehicle Type</label><select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Vehicle Make</label><input type="text" value={formData.vehicleMake} onChange={e => setFormData({...formData, vehicleMake: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Vehicle Model</label><input type="text" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Year of Manufacture</label><input type="number" value={formData.vehicleYear} onChange={e => setFormData({...formData, vehicleYear: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Account Holder Name</label><input type="text" value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Bank Name</label><input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Account Number</label><input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-400">IFSC Code</label><input type="text" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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