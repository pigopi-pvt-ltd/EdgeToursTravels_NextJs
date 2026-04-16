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
  HiOutlineCloudUpload
} from 'react-icons/hi';
import UserDetailsModal from '../employees/UserDetailsModal';

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
    yearsOfExperience?: number;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<any>({
    fullName: '',
    email: '',
    mobile: '',
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
    gender: '',
    presentAddress: '',
    permanentAddress: '',
    alternateMobile: '',
    aadhar: '',
    pan: '',
    yearsOfExperience: '',
    highestQualification: '',
    profilePhoto: '',
    aadharFront: '',
    aadharBack: '',
    panImage: '',
    licenseImage: '',
  });

  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/drivers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDrivers(Array.isArray(data) ? data : []);
      } else {
        setMessage(data.error || 'Failed to fetch drivers');
      }
    } catch (error) {
      setMessage('Error fetching drivers');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const token = getAuthToken();
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleFileUpload = async (field: string, file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, 'drivers');
      setFormData((prev: any) => ({ ...prev, [field]: url }));
      setMessage(`${field} uploaded successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Failed to upload ${field}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setTempPassword(null);
    const token = getAuthToken();

    const payload = {
      driverId: editingDriver?._id,
      email: formData.email,
      mobileNumber: formData.mobile,
      name: formData.fullName,
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
      // Add other detail fields if required by API
      gender: formData.gender,
      presentAddress: formData.presentAddress,
      permanentAddress: formData.permanentAddress,
      alternateMobile: formData.alternateMobile,
      aadhar: formData.aadhar,
      pan: formData.pan,
      yearsOfExperience: formData.yearsOfExperience,
      highestQualification: formData.highestQualification,
      profilePhoto: formData.profilePhoto,
      aadharFront: formData.aadharFront,
      aadharBack: formData.aadharBack,
      panImage: formData.panImage,
      licenseImage: formData.licenseImage,
    };

    const apiUrl = editingDriver ? '/api/admin/update-driver' : '/api/admin/drivers';
    const method = editingDriver ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.temporaryPassword);
        setMessage(`Driver ${editingDriver ? 'updated' : 'created'} successfully!`);
        fetchDrivers();
        if (!data.temporaryPassword) {
          setTimeout(() => {
            setIsModalOpen(false);
            resetForm();
          }, 2000);
        }
      } else {
        setMessage(data.error || 'Operation failed');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    setDeletingUserId(id);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/delete-driver', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId: id }),
      });
      if (res.ok) {
        setMessage('Driver deleted successfully');
        fetchDrivers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Delete failed');
      }
    } catch (err) {
      setMessage('Delete failed');
    } finally {
      setDeletingUserId(null);
    }
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    const details = driver.driverDetails || {};
    setFormData({
      fullName: driver.name || '',
      email: driver.email || '',
      mobile: driver.mobileNumber || '',
      dateOfBirth: details.dateOfBirth ? new Date(details.dateOfBirth).toISOString().split('T')[0] : '',
      drivingLicenseNumber: details.drivingLicenseNumber || '',
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
      yearsOfExperience: details.yearsOfExperience?.toString() || '',
      // Note: add other fields if they exist in driver object
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '', email: '', mobile: '', dateOfBirth: '', drivingLicenseNumber: '',
      dlExpiryDate: '', vehicleRegNumber: '', vehicleType: 'car', vehicleMake: '',
      vehicleModel: '', vehicleYear: '', accountHolderName: '', bankName: '',
      accountNumber: '', ifscCode: '', gender: '', presentAddress: '',
      permanentAddress: '', alternateMobile: '', aadhar: '', pan: '',
      yearsOfExperience: '', highestQualification: '', profilePhoto: '',
      aadharFront: '', aadharBack: '', panImage: '', licenseImage: '',
    });
    setTempPassword(null);
    setMessage('');
  };

  const copyPasswordToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mobileNumber?.includes(searchTerm)
  );

  const DocumentUploadCard = ({ title, description, field, accept = "image/*" }: { title: string; description: string; field: string; accept?: string }) => {
    const fileInputId = `upload-${field}`;
    const existingUrl = formData[field];
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
          <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">{title}</h3>
        <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">{description}</p>
        
        {existingUrl ? (
          <div className="mb-4 relative group/img">
            <img src={existingUrl} alt={title} className="max-h-32 mx-auto rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all group-hover/img:brightness-75" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
              <span className="bg-white/90 dark:bg-slate-800/90 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Change File</span>
            </div>
          </div>
        ) : (
          <div className="mb-6 text-slate-400 font-semibold tracking-wide uppercase text-[10px]">Upload</div>
        )}

        <input type="file" id={fileInputId} accept={accept} className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(field, file);
        }} />
        
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => document.getElementById(fileInputId)?.click()}
            disabled={uploading}
            className="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : 'Choose File'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="flex gap-3">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="h-96 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 -mt-8 -mx-8 animate-in fade-in duration-500">
      <div className="p-6 lg:p-8">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 ${message.includes('successfully') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
            }`}>
            <span className="flex items-center gap-2">
              {message.includes('successfully') ? '✅' : '⚠️'} {message}
            </span>
            <button onClick={() => setMessage('')} className="text-current hover:opacity-70">
              <HiX className="text-lg" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-6 lg:px-8 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Manage Drivers
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage driver profiles, vehicles, and KYC records</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiPlus className="text-lg" /> Add New Driver
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Search */}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pr-8 lg:pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredDrivers.map((driver, idx) => (
                  <tr key={driver._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-150" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shadow-sm">
                          {getInitials(driver.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white">{driver.name || '-'}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{driver.mobileNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div className="font-medium text-slate-700 dark:text-slate-200">{driver.driverDetails?.drivingLicenseNumber || '-'}</div>
                        <div className="text-slate-400 dark:text-slate-500">Exp: {driver.driverDetails?.yearsOfExperience || 0} yrs</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${driver.driverDetails?.kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800' :
                        driver.driverDetails?.kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800' :
                          driver.driverDetails?.kycStatus === 'submitted' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800' :
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600'
                        }`}>
                        {driver.driverDetails?.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedUserId(driver._id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200 group-hover:scale-105" title="View Details">
                          <HiOutlineEye className="text-xl" />
                        </button>
                        <button onClick={() => openEditModal(driver)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 group-hover:scale-105" title="Edit Driver">
                          <HiPencil className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver._id)}
                          disabled={deletingUserId === driver._id}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Driver"
                        >
                          {deletingUserId === driver._id ? (
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
            {filteredDrivers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-slate-300 dark:text-slate-700 text-5xl mb-3">🚗</div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No drivers found</p>
                <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Total drivers: {drivers.length}</span>
            <span>Showing {filteredDrivers.length} of {drivers.length}</span>
          </div>
        </div>
      </div>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 subtle-scrollbar" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <HiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address </label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender <span className="text-red-500 ml-1">*</span></label><select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none text-sm dark:text-white"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number <span className="text-red-500 ml-1">*</span></label><input type="tel" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500 ml-1">*</span></label><input type="text" placeholder="DD-MM-YYYY" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Years of Experience <span className="text-red-500 ml-1">*</span></label><input type="number" required value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Identity & Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Driving License Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.drivingLicenseNumber} onChange={e => setFormData({ ...formData, drivingLicenseNumber: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">DL Expiry Date <span className="text-red-500 ml-1">*</span></label><input type="text" placeholder="DD-MM-YYYY" required value={formData.dlExpiryDate} onChange={e => setFormData({ ...formData, dlExpiryDate: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">AADHAR NUMBER <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.aadhar} onChange={e => setFormData({ ...formData, aadhar: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">PAN Number</label><input type="text" value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Bank Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-2"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Account Holder Name <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.accountHolderName} onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div className="lg:col-span-2"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Bank Name <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div className="lg:col-span-2"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Account Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  <div className="lg:col-span-2"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">IFSC Code <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.ifscCode} onChange={e => setFormData({ ...formData, ifscCode: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Document Uploads
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DocumentUploadCard title="Profile Photo" description="Clear face photo" field="profilePhoto" />
                  <DocumentUploadCard title="Aadhar Card (Front)" description="Front side with photo" field="aadharFront" />
                  <DocumentUploadCard title="Aadhar Card (Back)" description="Back side with address" field="aadharBack" />
                  <DocumentUploadCard title="PAN Card" description="Clear PAN card image" field="panImage" />
                  <DocumentUploadCard title="Driving License" description="Front side of license" field="licenseImage" />
                </div>
              </div>

              {/* Status Display */}
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

              {/* Submitting Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={submitting || uploading} className="px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[140px]">
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} onUpdate={fetchDrivers} />
      )}
    </div>
  );
}