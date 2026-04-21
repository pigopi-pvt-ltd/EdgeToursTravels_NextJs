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
    kycDocuments?: Record<string, string>;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kycFilter, setKycFilter] = useState('all');
  const [masterDocs, setMasterDocs] = useState<any[]>([]);
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
    fetchMasterDocs();
  }, []);

  const fetchMasterDocs = async () => {
    try {
      const res = await fetch('/api/admin/master-documents?category=driver', {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMasterDocs(data.filter(d => d.isActive));
    } catch (err) {
      console.error('Error fetching master docs:', err);
    }
  };

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
      setFormData((prev: any) => ({
        ...prev,
        [field]: url,
        kycDocuments: {
          ...(prev.kycDocuments || {}),
          [field]: url
        }
      }));
      setMessage(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} uploaded successfully`);
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
      kycDocuments: {
        ...(editingDriver?.driverDetails?.kycDocuments || {}),
        ...(formData.kycDocuments || {}),
        profilePhoto: formData.profilePhoto,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack,
        panImage: formData.panImage,
        licenseImage: formData.licenseImage,
      }
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

  const DocumentUploadCard = ({ title, description, field, accept = "image/*", existingUrl }: { title: string; description: string; field: string; accept?: string; existingUrl?: string }) => {
    const fileInputId = `upload-${field}`;
    const displayUrl = existingUrl || formData[field] || formData.kycDocuments?.[field];
    return (
      <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
          <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">{title}</h3>
        <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">{description}</p>

        {displayUrl ? (
          <div className="mb-4 relative group/img">
            <img src={displayUrl} alt={title} className="max-h-32 mx-auto rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all group-hover/img:brightness-75" />
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
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="flex flex-col">
          {/* Skeleton Search Area (approx 72px) */}
          <div className="p-4 h-[72px] border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/20 dark:bg-slate-900/20 px-6">
            <div className="h-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-100 dark:border-slate-800"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
                    {[1, 2, 3, 4, 5].map((col) => (
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

        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Drivers Management <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredDrivers.length})</span>
            </h2>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <HiPlus className="text-lg" /> Add New Driver
          </button>
        </div>

        {/* Main Content */}
        <div>
          {/* Search Area */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
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
            <table className="w-full border-collapse min-w-[1100px] md:min-w-full">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Driver</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Contact No</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">License info</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Experience</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">KYC Status</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredDrivers.map((driver, idx) => (
                  <tr key={driver._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                          {getInitials(driver.name)}
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{driver.name || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                      {driver.mobileNumber || '-'}
                    </td>
                    <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {driver.email || '-'}
                    </td>
                    <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                      {driver.driverDetails?.drivingLicenseNumber || '-'}
                    </td>
                    <td className="px-6 py-1 text-sm text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center font-bold whitespace-nowrap">
                      {driver.driverDetails?.yearsOfExperience || 0} YRS
                    </td>
                    <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                      <span className={`
                        px-2 py-0.5 rounded text-sm font-bold border inline-block min-w-[100px] text-center uppercase tracking-widest
                        ${driver.driverDetails?.kycStatus === 'approved' ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' :
                          driver.driverDetails?.kycStatus === 'rejected' ? 'bg-[#FEF2F2] dark:bg-red-900/20 text-[#EF4444] border-[#FEE2E2] dark:border-red-900/30' :
                            driver.driverDetails?.kycStatus === 'submitted' ? 'bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0EA5E9] border-[#E0F2FE] dark:border-blue-900/30' :
                              'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30'}
                      `}>
                        {driver.driverDetails?.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-2">
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
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">No drivers found</p>
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
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Driving License Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.drivingLicenseNumber} onChange={e => setFormData({ ...formData, drivingLicenseNumber: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">DL Expiry Date <span className="text-red-500 ml-1">*</span></label><input type="text" placeholder="DD-MM-YYYY" required value={formData.dlExpiryDate} onChange={e => setFormData({ ...formData, dlExpiryDate: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">AADHAR NUMBER <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.aadhar} onChange={e => setFormData({ ...formData, aadhar: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                  <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">PAN Number</label><input type="text" value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
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
                  {/* Default/Core Documents */}
                  <DocumentUploadCard title="Profile Photo" description="Clear face photo" field="profilePhoto" existingUrl={formData.profilePhoto} />
                  <DocumentUploadCard title="Aadhar Card (Front)" description="Front side with photo" field="aadharFront" existingUrl={formData.aadharFront} />
                  <DocumentUploadCard title="Aadhar Card (Back)" description="Back side with address" field="aadharBack" existingUrl={formData.aadharBack} />
                  <DocumentUploadCard title="PAN Card" description="Clear PAN card image" field="panImage" existingUrl={formData.panImage} />
                  <DocumentUploadCard title="Driving License" description="Front side of license" field="licenseImage" existingUrl={formData.licenseImage} />

                  {/* Dynamic Master Documents (excluding defaults if already configured) */}
                  {masterDocs.filter(doc => !['profilePhoto', 'aadharFront', 'aadharBack', 'panImage', 'licenseImage'].includes(doc.key)).map((doc) => (
                    <DocumentUploadCard
                      key={doc.key}
                      title={doc.label}
                      description={doc.description}
                      field={doc.key}
                      existingUrl={formData[doc.key] || formData.kycDocuments?.[doc.key]}
                    />
                  ))}
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
                <button type="submit" disabled={submitting || uploading} className="px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[140px] cursor-pointer">
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