'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import FileUpload from '@/components/FileUpload'; // adjust path as needed

export default function KycPage() {
  const [driverDetails, setDriverDetails] = useState<any>({});
  const [kycStatus, setKycStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();

  // Store uploaded document URLs
  const [kycDocuments, setKycDocuments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDriverDetails();
  }, []);

  const fetchDriverDetails = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/user/driver-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDriverDetails(data);
        setKycStatus(data.kycStatus || 'pending');
        if (data.kycDocuments) setKycDocuments(data.kycDocuments);
      } else if (res.status === 403) {
        setMessage('Your account is not yet registered as a driver. Please contact admin to upgrade your role.');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCombinedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate required driver fields
    const requiredFields = [
      'fullName', 'dateOfBirth', 'drivingLicenseNumber', 'dlExpiryDate',
      'vehicleRegNumber', 'vehicleType', 'accountHolderName', 'bankName',
      'accountNumber', 'ifscCode'
    ];
    const missing = requiredFields.filter(f => !driverDetails[f]);
    if (missing.length) {
      setMessage(`Missing: ${missing.join(', ')}`);
      setLoading(false);
      return;
    }

    // Validate all 6 KYC documents are uploaded
    const requiredDocs = [
      'aadhaarFront', 'aadhaarBack', 'drivingLicenseImage',
      'vehicleRCImage', 'insuranceImage', 'pucImage'
    ];
    const missingDocs = requiredDocs.filter(doc => !kycDocuments[doc]);
    if (missingDocs.length) {
      setMessage(`Please upload all documents: ${missingDocs.join(', ')}`);
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    // Merge KYC documents into driverDetails
    const payload = {
      ...driverDetails,
      kycDocuments,
      kycStatus: 'submitted'   // mark as submitted
    };

    try {
      const res = await fetch('/api/user/driver-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Driver details & KYC documents submitted for approval!');
        setKycStatus('submitted');
        fetchDriverDetails(); // refresh
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

  const isFormValid = () => {
    const requiredFields = [
      'fullName', 'dateOfBirth', 'drivingLicenseNumber', 'dlExpiryDate',
      'vehicleRegNumber', 'vehicleType', 'accountHolderName', 'bankName',
      'accountNumber', 'ifscCode'
    ];
    const driverOk = requiredFields.every(f => driverDetails[f]);
    const docsOk = ['aadhaarFront', 'aadhaarBack', 'drivingLicenseImage', 'vehicleRCImage', 'insuranceImage', 'pucImage']
      .every(doc => kycDocuments[doc]);
    return driverOk && docsOk;
  };

  if (loading && !driverDetails.fullName) {
    return <div className="p-8 text-center">Loading your profile...</div>;
  }

  if (user?.role !== 'driver') {
    return <div className="p-8 text-center text-slate-500">KYC is only for employees/drivers.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with KYC status & submit button */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              KYC & Driver Profile
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
              Complete your verification to start earning
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${
              kycStatus === 'approved' ? 'bg-green-100 dark:bg-green-900/40 text-green-700' :
              kycStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/40 text-red-700' :
              kycStatus === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700' :
              'bg-amber-100 dark:bg-amber-900/40 text-amber-700'
            }`}>
              KYC: {kycStatus}
            </div>
            <button
              type="button"
              onClick={handleCombinedSubmit}
              disabled={loading || !isFormValid()}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-base transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Processing...' : '💾 Save & Submit KYC'}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-base">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal & Vehicle Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border p-6">
            <h2 className="text-xl font-bold mb-5">Personal & Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div><label className="block text-sm font-semibold mb-1.5">Full Name <span className="text-red-500">*</span></label><input type="text" value={driverDetails.fullName || ''} onChange={e => setDriverDetails({...driverDetails, fullName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Date of Birth <span className="text-red-500">*</span></label><input type="date" value={driverDetails.dateOfBirth?.split('T')[0] || ''} onChange={e => setDriverDetails({...driverDetails, dateOfBirth: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Driving License No <span className="text-red-500">*</span></label><input type="text" value={driverDetails.drivingLicenseNumber || ''} onChange={e => setDriverDetails({...driverDetails, drivingLicenseNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base uppercase" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">DL Expiry Date <span className="text-red-500">*</span></label><input type="date" value={driverDetails.dlExpiryDate?.split('T')[0] || ''} onChange={e => setDriverDetails({...driverDetails, dlExpiryDate: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Vehicle Reg No <span className="text-red-500">*</span></label><input type="text" value={driverDetails.vehicleRegNumber || ''} onChange={e => setDriverDetails({...driverDetails, vehicleRegNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base uppercase" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Vehicle Type <span className="text-red-500">*</span></label><select value={driverDetails.vehicleType || 'car'} onChange={e => setDriverDetails({...driverDetails, vehicleType: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
              <div><label className="block text-sm font-semibold mb-1.5">Vehicle Make</label><input type="text" value={driverDetails.vehicleMake || ''} onChange={e => setDriverDetails({...driverDetails, vehicleMake: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Vehicle Model</label><input type="text" value={driverDetails.vehicleModel || ''} onChange={e => setDriverDetails({...driverDetails, vehicleModel: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Year of Manufacture</label><input type="number" value={driverDetails.vehicleYear || ''} onChange={e => setDriverDetails({...driverDetails, vehicleYear: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border p-6">
            <h2 className="text-xl font-bold mb-5">Bank Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-sm font-semibold mb-1.5">Account Holder Name <span className="text-red-500">*</span></label><input type="text" value={driverDetails.accountHolderName || ''} onChange={e => setDriverDetails({...driverDetails, accountHolderName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Bank Name <span className="text-red-500">*</span></label><input type="text" value={driverDetails.bankName || ''} onChange={e => setDriverDetails({...driverDetails, bankName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Account Number <span className="text-red-500">*</span></label><input type="text" value={driverDetails.accountNumber || ''} onChange={e => setDriverDetails({...driverDetails, accountNumber: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base" /></div>
              <div><label className="block text-sm font-semibold mb-1.5">IFSC Code <span className="text-red-500">*</span></label><input type="text" value={driverDetails.ifscCode || ''} onChange={e => setDriverDetails({...driverDetails, ifscCode: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-base uppercase" /></div>
            </div>
          </div>

          {/* KYC Documents Upload with FileUpload component */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border p-6">
            <h2 className="text-xl font-bold mb-2">Upload KYC Documents</h2>
            <p className="text-sm text-slate-500 mb-5">All 6 documents are mandatory. Max 10MB each (JPG, PNG, PDF).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FileUpload
                label="Aadhaar Card (Front)"
                folder="kyc"
                existingUrl={kycDocuments.aadhaarFront}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, aadhaarFront: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
              <FileUpload
                label="Aadhaar Card (Back)"
                folder="kyc"
                existingUrl={kycDocuments.aadhaarBack}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, aadhaarBack: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
              <FileUpload
                label="Driving License"
                folder="kyc"
                existingUrl={kycDocuments.drivingLicenseImage}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, drivingLicenseImage: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
              <FileUpload
                label="Vehicle RC"
                folder="kyc"
                existingUrl={kycDocuments.vehicleRCImage}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, vehicleRCImage: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
              <FileUpload
                label="Insurance Certificate"
                folder="kyc"
                existingUrl={kycDocuments.insuranceImage}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, insuranceImage: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
              <FileUpload
                label="PUC Certificate"
                folder="kyc"
                existingUrl={kycDocuments.pucImage}
                onUpload={(url) => setKycDocuments(prev => ({ ...prev, pucImage: url }))}
                buttonClassName="bg-orange-600 hover:bg-orange-700"
              />
            </div>
            {!isFormValid() && (
              <p className="text-center text-amber-600 dark:text-amber-400 text-sm mt-5">
                ⚠️ Please fill all required fields and upload all 6 documents.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}