// app/admin-dashboard/employees/UserDetailsModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiCheck, HiX, HiBan, HiCheckCircle, HiX as HiClose } from 'react-icons/hi';

interface User {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: 'admin' | 'employee' | 'driver';
  driverDetails?: {
    kycStatus?: string;
    rejectionReason?: string;
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
    kycDocuments?: Record<string, string>;
  };
  profileCompleted?: boolean;
}

interface Props {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserDetailsModal({ userId, onClose, onUpdate }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/employee/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setMessage('Could not load user details');
    } finally {
      setLoading(false);
    }
  };

  const updateKycStatus = async (status: 'approved' | 'rejected', rejectionReason?: string) => {
    if (!user) return;
    setUpdating(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user._id, kycStatus: status, rejectionReason }),
      });
      if (res.ok) {
        setMessage(`KYC ${status} successfully`);
        onUpdate();
        await fetchUser();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Update failed');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-2xl p-8 m-4 text-center shadow-2xl">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const driverDetails = user.driverDetails || {};
  const kycStatus = user.driverDetails?.kycStatus || 'pending';
  const kycDocuments = user.driverDetails?.kycDocuments || {};
  const isDriver = user.role === 'driver';
  const isKycFinalised = kycStatus === 'approved' || kycStatus === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-5 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header with KYC actions on the right */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3 z-10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            User Details
          </h2>
          <div className="flex items-center gap-3">
            {/* KYC Action Buttons - only for drivers with pending/submitted KYC */}
            {isDriver && !isKycFinalised && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateKycStatus('approved')}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-sm"
                >
                  <HiCheck className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    updateKycStatus('rejected', reason || undefined);
                  }}
                  disabled={updating}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-sm"
                >
                  <HiX className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <HiClose className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 animate-in fade-in duration-200">
              {message}
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-slate-50/80 rounded-xl p-5">
            <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Name:</span> <span className="text-slate-800 font-medium ml-2">{user.name || '-'}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="text-slate-800 ml-2">{user.email}</span></div>
              <div><span className="text-slate-500">Mobile:</span> <span className="text-slate-800 ml-2">{user.mobileNumber}</span></div>
              <div><span className="text-slate-500">Role:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <div><span className="text-slate-500">Profile Completed:</span> <span className="text-slate-800 ml-2">{user.profileCompleted ? 'Yes' : 'No'}</span></div>
              <div><span className="text-slate-500">KYC Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  kycStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                  kycStatus === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Driver-specific sections */}
          {isDriver && (
            <>
              {/* Driver Details */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Full Name (as per DL):</span> <span className="text-slate-800 ml-2">{driverDetails.fullName || '-'}</span></div>
                  <div><span className="text-slate-500">Date of Birth:</span> <span className="text-slate-800 ml-2">{driverDetails.dateOfBirth ? new Date(driverDetails.dateOfBirth).toLocaleDateString() : '-'}</span></div>
                  <div><span className="text-slate-500">Driving License No.:</span> <span className="text-slate-800 ml-2">{driverDetails.drivingLicenseNumber || '-'}</span></div>
                  <div><span className="text-slate-500">DL Expiry Date:</span> <span className="text-slate-800 ml-2">{driverDetails.dlExpiryDate ? new Date(driverDetails.dlExpiryDate).toLocaleDateString() : '-'}</span></div>
                  <div><span className="text-slate-500">Vehicle Reg. No.:</span> <span className="text-slate-800 ml-2">{driverDetails.vehicleRegNumber || '-'}</span></div>
                  <div><span className="text-slate-500">Vehicle Type:</span> <span className="text-slate-800 ml-2 capitalize">{driverDetails.vehicleType || '-'}</span></div>
                  <div><span className="text-slate-500">Vehicle Make/Model:</span> <span className="text-slate-800 ml-2">{driverDetails.vehicleMake} {driverDetails.vehicleModel}</span></div>
                  <div><span className="text-slate-500">Year:</span> <span className="text-slate-800 ml-2">{driverDetails.vehicleYear || '-'}</span></div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Account Holder:</span> <span className="text-slate-800 ml-2">{driverDetails.accountHolderName || '-'}</span></div>
                  <div><span className="text-slate-500">Bank Name:</span> <span className="text-slate-800 ml-2">{driverDetails.bankName || '-'}</span></div>
                  <div><span className="text-slate-500">Account Number:</span> <span className="text-slate-800 ml-2">{driverDetails.accountNumber || '-'}</span></div>
                  <div><span className="text-slate-500">IFSC Code:</span> <span className="text-slate-800 ml-2 uppercase">{driverDetails.ifscCode || '-'}</span></div>
                </div>
              </div>

              {/* KYC Documents */}
              {Object.keys(kycDocuments).length > 0 && (
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  <h3 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    KYC Documents
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(kycDocuments).map(([key, url]) => (
                      <a 
                        key={key} 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-sm bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                      >
                        📄 {key.replace(/([A-Z])/g, ' $1').trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Final KYC Status Message (when already approved/rejected) */}
              {isKycFinalised && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}>
                  {kycStatus === 'approved' ? <HiCheckCircle className="w-5 h-5" /> : <HiBan className="w-5 h-5" />}
                  <span className="text-sm font-medium">
                    KYC has been <span className="capitalize">{kycStatus}</span>.
                    {kycStatus === 'rejected' && driverDetails.rejectionReason && (
                      <span className="block text-xs mt-1 opacity-80">Reason: {driverDetails.rejectionReason}</span>
                    )}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}