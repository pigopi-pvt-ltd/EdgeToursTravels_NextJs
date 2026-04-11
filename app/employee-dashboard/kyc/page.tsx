// app/employee/kyc/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser, submitKYC } from '@/lib/auth';
import { HiOutlineCloudUpload } from 'react-icons/hi';

export default function KycPage() {
  const [driverDetails, setDriverDetails] = useState<any>({});
  const [kycStatus, setKycStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    fetchDriverDetails();
  }, []);

  const fetchDriverDetails = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/user/driver-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDriverDetails(data);
        setKycStatus(data.kycStatus || 'pending');
      } else if (res.status === 403) {
        setMessage('Your account is not yet registered as a driver. Please contact admin to upgrade your role.');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
    }
  };

  const handleDriverUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/user/driver-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(driverDetails),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Driver details saved');
      } else {
        setMessage(data.error || 'Save failed. If you are not a driver, please contact admin.');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleKYCUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const fields = [
      'aadhaarFront', 'aadhaarBack', 'drivingLicenseImage',
      'vehicleRCImage', 'insuranceImage', 'pucImage'
    ];
    for (const field of fields) {
      const file = (document.getElementById(field) as HTMLInputElement)?.files?.[0];
      if (file) formData.append(field, file);
      else {
        setMessage(`Missing file: ${field}`);
        return;
      }
    }
    setLoading(true);
    try {
      const result = await submitKYC(formData);
      if (result.success) {
        setMessage('KYC documents submitted for approval');
        setKycStatus('submitted');
        fetchDriverDetails();
      } else {
        setMessage(result.error || 'Submission failed. Ensure your account is a driver role.');
      }
    } catch (err) {
      setMessage('Upload failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Allow employees (drivers) to access KYC
  if ( user?.role !== 'driver') {
    return <div className="p-8 text-center">KYC is only for employees/drivers.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
          KYC & Driver Details
        </h2>
        <p className="text-slate-500 mb-6">Complete your profile and upload required documents.</p>

        <div className="mb-4 p-3 bg-blue-50 rounded">
          <strong>KYC Status:</strong> <span className="capitalize">{kycStatus}</span>
        </div>
        {message && <div className="mb-4 p-2 bg-green-50 text-green-600 rounded">{message}</div>}

        {/* Driver Details Form */}
        <form onSubmit={handleDriverUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Full Name (as per DL) *</label><input type="text" required value={driverDetails.fullName || ''} onChange={e => setDriverDetails({...driverDetails, fullName: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Date of Birth *</label><input type="date" required value={driverDetails.dateOfBirth?.split('T')[0] || ''} onChange={e => setDriverDetails({...driverDetails, dateOfBirth: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Driving License Number *</label><input type="text" required value={driverDetails.drivingLicenseNumber || ''} onChange={e => setDriverDetails({...driverDetails, drivingLicenseNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">DL Expiry Date *</label><input type="date" required value={driverDetails.dlExpiryDate?.split('T')[0] || ''} onChange={e => setDriverDetails({...driverDetails, dlExpiryDate: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Vehicle Registration Number *</label><input type="text" required value={driverDetails.vehicleRegNumber || ''} onChange={e => setDriverDetails({...driverDetails, vehicleRegNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Vehicle Type *</label><select required value={driverDetails.vehicleType || 'car'} onChange={e => setDriverDetails({...driverDetails, vehicleType: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
            <div><label className="block text-sm font-medium">Vehicle Make</label><input type="text" value={driverDetails.vehicleMake || ''} onChange={e => setDriverDetails({...driverDetails, vehicleMake: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Vehicle Model</label><input type="text" value={driverDetails.vehicleModel || ''} onChange={e => setDriverDetails({...driverDetails, vehicleModel: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium">Year of Manufacture</label><input type="number" value={driverDetails.vehicleYear || ''} onChange={e => setDriverDetails({...driverDetails, vehicleYear: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium">Account Holder Name *</label><input type="text" required value={driverDetails.accountHolderName || ''} onChange={e => setDriverDetails({...driverDetails, accountHolderName: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium">Bank Name *</label><input type="text" required value={driverDetails.bankName || ''} onChange={e => setDriverDetails({...driverDetails, bankName: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium">Account Number *</label><input type="text" required value={driverDetails.accountNumber || ''} onChange={e => setDriverDetails({...driverDetails, accountNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium">IFSC Code *</label><input type="text" required value={driverDetails.ifscCode || ''} onChange={e => setDriverDetails({...driverDetails, ifscCode: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Save Driver Details
            </button>
          </div>
        </form>

        <hr className="my-6" />

        {/* KYC Documents Upload Section – Card Style */}
        <form onSubmit={handleKYCUpload}>
          <h3 className="text-lg font-semibold mb-4">Upload KYC Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aadhaar Front */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Aadhaar Card (Front)</h3>
              <p className="text-sm text-slate-500 mb-4">Upload clear photo (Front side)</p>
              <input type="file" id="aadhaarFront" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('aadhaarFront')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Aadhaar Back */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Aadhaar Card (Back)</h3>
              <p className="text-sm text-slate-500 mb-4">Upload clear photo (Back side)</p>
              <input type="file" id="aadhaarBack" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('aadhaarBack')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Driving License Image */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Driving License</h3>
              <p className="text-sm text-slate-500 mb-4">Front side of your license</p>
              <input type="file" id="drivingLicenseImage" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('drivingLicenseImage')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Vehicle RC Image */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Vehicle RC</h3>
              <p className="text-sm text-slate-500 mb-4">Registration Certificate</p>
              <input type="file" id="vehicleRCImage" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('vehicleRCImage')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Insurance Certificate */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Insurance Certificate</h3>
              <p className="text-sm text-slate-500 mb-4">Valid insurance document</p>
              <input type="file" id="insuranceImage" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('insuranceImage')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* PUC Certificate */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">PUC Certificate</h3>
              <p className="text-sm text-slate-500 mb-4">Pollution Under Control</p>
              <input type="file" id="pucImage" accept="image/*" required className="hidden" />
              <button type="button" onClick={() => document.getElementById('pucImage')?.click()} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-sm text-orange-700 font-medium">
              <span className="font-bold">Note:</span> Max file size 5MB. Supported formats: JPG, PNG, PDF.
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={loading} className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors">
              {loading ? 'Submitting...' : 'Submit KYC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}