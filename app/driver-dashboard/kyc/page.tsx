'use client';

import { useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiOutlineCloudUpload, HiX } from 'react-icons/hi';

type DriverDetails = {
  fullName: string;
  dateOfBirth: string;
  drivingLicenseNumber: string;
  dlExpiryDate: string;
  vehicleRegNumber: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  presentAddress: string;
  permanentAddress: string;
};

type KycDocuments = {
  aadhaarFront: string;
  aadhaarBack: string;
  drivingLicenseImage: string;
  vehicleRCImage: string;
  insuranceImage: string;
  pucImage: string;
};

function getMissingFields<T extends Record<string, any>>(obj: T, requiredKeys: (keyof T)[]): (keyof T)[] {
  return requiredKeys.filter(key => !obj[key]);
}

function KycPage() {
  const [driverDetails, setDriverDetails] = useState<DriverDetails>({
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
    presentAddress: '',
    permanentAddress: '',
  });

  const [kycDocuments, setKycDocuments] = useState<KycDocuments>({
    aadhaarFront: '',
    aadhaarBack: '',
    drivingLicenseImage: '',
    vehicleRCImage: '',
    insuranceImage: '',
    pucImage: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');

  // Refs for file inputs
  const fileInputs = {
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
    drivingLicenseImage: useRef<HTMLInputElement>(null),
    vehicleRCImage: useRef<HTMLInputElement>(null),
    insuranceImage: useRef<HTMLInputElement>(null),
    pucImage: useRef<HTMLInputElement>(null),
  };

  const requiredDriverFields: (keyof DriverDetails)[] = [
    'fullName', 'dateOfBirth', 'drivingLicenseNumber', 'dlExpiryDate',
    'vehicleRegNumber', 'vehicleType', 'accountHolderName', 'bankName',
    'accountNumber', 'ifscCode', 'presentAddress', 'permanentAddress'
  ];

  const requiredDocFields: (keyof KycDocuments)[] = [
    'aadhaarFront', 'aadhaarBack', 'drivingLicenseImage',
    'vehicleRCImage', 'insuranceImage', 'pucImage'
  ];

  const uploadFile = async (field: keyof KycDocuments, file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'kyc');
    const token = getAuthToken();
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setKycDocuments(prev => ({ ...prev, [field]: data.url }));
      setMessage(`${field} uploaded successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Failed to upload ${field}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (field: keyof KycDocuments, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(field, file);
  };

  const clearFile = (field: keyof KycDocuments) => {
    setKycDocuments(prev => ({ ...prev, [field]: '' }));
    if (fileInputs[field].current) fileInputs[field].current!.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const missingDriver = getMissingFields(driverDetails, requiredDriverFields);
    if (missingDriver.length) {
      setMessage(`Missing driver details: ${missingDriver.join(', ')}`);
      setLoading(false);
      return;
    }

    const missingDocs = getMissingFields(kycDocuments, requiredDocFields);
    if (missingDocs.length) {
      setMessage(`Please upload all documents: ${missingDocs.join(', ')}`);
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    const payload = {
      ...driverDetails,
      kycDocuments,
      kycStatus: 'submitted'
    };

    try {
      const res = await fetch('/api/user/driver-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Driver details & KYC submitted successfully!');
        setKycStatus('submitted');
      } else {
        setMessage(data.error || 'Submission failed');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updateDriverField = (field: keyof DriverDetails, value: string) => {
    setDriverDetails(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const driverOk = requiredDriverFields.every(field => driverDetails[field]);
    const docsOk = requiredDocFields.every(field => kycDocuments[field]);
    return driverOk && docsOk;
  };

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar - Styled like Bookings Page */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              KYC & Driver Profile
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save & Submit KYC'}
            </button>
          </div>
        </div>

        <div className="p-0 space-y-0">

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex justify-between items-center text-base ${message.includes('✅')
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 border border-red-200'
              }`}>
              <span>{message}</span>
              <button onClick={() => setMessage('')}>✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Personal & Vehicle */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Personal & Vehicle Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter full name" value={driverDetails.fullName} onChange={e => updateDriverField('fullName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                      type={driverDetails.dateOfBirth ? "date" : "text"}
                      placeholder="DD-MM-YYYY"
                      value={driverDetails.dateOfBirth}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => !e.target.value && (e.target.type = "text")}
                      onChange={e => updateDriverField('dateOfBirth', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Driving License No <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="DL-0000000000000" value={driverDetails.drivingLicenseNumber} onChange={e => updateDriverField('drivingLicenseNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">DL Expiry Date <span className="text-red-500">*</span></label>
                    <input
                      type={driverDetails.dlExpiryDate ? "date" : "text"}
                      placeholder="DD-MM-YYYY"
                      value={driverDetails.dlExpiryDate}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => !e.target.value && (e.target.type = "text")}
                      onChange={e => updateDriverField('dlExpiryDate', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Vehicle Reg Number <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="MH-01-AB-1234" value={driverDetails.vehicleRegNumber} onChange={e => updateDriverField('vehicleRegNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Vehicle Type <span className="text-red-500">*</span></label>
                    <select value={driverDetails.vehicleType} onChange={e => updateDriverField('vehicleType', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Vehicle Make</label>
                    <input type="text" placeholder="e.g. Toyota" value={driverDetails.vehicleMake} onChange={e => updateDriverField('vehicleMake', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Vehicle Model</label>
                    <input type="text" placeholder="e.g. Innova" value={driverDetails.vehicleModel} onChange={e => updateDriverField('vehicleModel', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Year of Manufacture</label>
                    <input type="number" placeholder="2024" value={driverDetails.vehicleYear} onChange={e => updateDriverField('vehicleYear', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Address Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Present Address <span className="text-red-500">*</span></label>
                    <textarea rows={2} placeholder="Enter your current address" value={driverDetails.presentAddress} onChange={e => updateDriverField('presentAddress', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Permanent Address <span className="text-red-500">*</span></label>
                    <textarea rows={2} placeholder="Enter your permanent address" value={driverDetails.permanentAddress} onChange={e => updateDriverField('permanentAddress', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Bank Account Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Account Holder Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="As per bank passbook" value={driverDetails.accountHolderName} onChange={e => updateDriverField('accountHolderName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Bank Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="e.g. State Bank of India" value={driverDetails.bankName} onChange={e => updateDriverField('bankName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Account Number <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter account number" value={driverDetails.accountNumber} onChange={e => updateDriverField('accountNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">IFSC Code <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="SBIN0000000" value={driverDetails.ifscCode} onChange={e => updateDriverField('ifscCode', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium uppercase" />
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Documents Upload */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Upload KYC Documents
                </h2>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">All 6 documents are mandatory. Max 5MB each (JPG, PNG, PDF).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhaar Front */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Aadhaar Card (Front)</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload clear photo (Front side)</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.aadhaarFront} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('aadhaarFront', e)} />
                    {kycDocuments.aadhaarFront ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.aadhaarFront} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('aadhaarFront')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.aadhaarFront.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>

                  {/* Aadhaar Back */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Aadhaar Card (Back)</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload clear photo (Back side)</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.aadhaarBack} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('aadhaarBack', e)} />
                    {kycDocuments.aadhaarBack ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.aadhaarBack} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('aadhaarBack')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.aadhaarBack.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>

                  {/* Driving License */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Driving License</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Front side of your license</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.drivingLicenseImage} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('drivingLicenseImage', e)} />
                    {kycDocuments.drivingLicenseImage ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.drivingLicenseImage} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('drivingLicenseImage')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.drivingLicenseImage.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>

                  {/* Vehicle RC */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Vehicle RC</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Registration Certificate</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.vehicleRCImage} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('vehicleRCImage', e)} />
                    {kycDocuments.vehicleRCImage ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.vehicleRCImage} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('vehicleRCImage')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.vehicleRCImage.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>

                  {/* Insurance */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Insurance Certificate</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Valid insurance document</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.insuranceImage} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('insuranceImage', e)} />
                    {kycDocuments.insuranceImage ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.insuranceImage} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('insuranceImage')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.insuranceImage.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>

                  {/* PUC */}
                  <div className="bg-[#f8faff] dark:bg-slate-800/20 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-lg p-8 text-center group hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none mb-6 group-hover:scale-110 transition-transform mx-auto">
                      <HiOutlineCloudUpload className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">PUC Certificate</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Pollution Under Control</p>
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload</p>
                    </div>
                    <input type="file" ref={fileInputs.pucImage} accept="image/*" className="hidden" onChange={(e) => handleFileSelect('pucImage', e)} />
                    {kycDocuments.pucImage ? (
                      <div className="relative inline-block">
                        <img src={kycDocuments.pucImage} className="max-h-24 mx-auto rounded-lg border shadow-sm" alt="preview" />
                        <button type="button" onClick={() => clearFile('pucImage')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                          <HiX className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputs.pucImage.current?.click()} disabled={uploading} className="px-8 py-3 bg-[#ff4d00] text-white rounded-lg font-bold hover:bg-[#e64500] transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 text-sm">
                        Choose File
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                    <span className="font-bold">Note:</span> Max file size 5MB. Supported formats: JPG, PNG, PDF.
                  </p>
                </div>
                {!isFormValid() && (
                  <p className="text-center text-amber-600 dark:text-amber-400 text-sm mt-5 font-bold">
                    Please fill all required fields and upload all 6 documents.
                  </p>
                )}
              </div>
            </div>

            <button type="submit" style={{ display: 'none' }} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default KycPage;