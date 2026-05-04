'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiCheck, HiX, HiBan, HiCheckCircle, HiX as HiClose, HiTrash, HiDocumentSearch, HiDocumentText } from 'react-icons/hi';

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
  employeeDetails?: {
    fullName: string;
    mobile: string;
    gender: string;
    presentAddress: string;
    permanentAddress: string;
    alternateMobile?: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    yearsOfExperience: number;
    highestQualification: string;
    previousExperience?: string;
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
      const res = await fetch(`/api/admin/employees/${userId}`, {
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
      const res = await fetch('/api/admin/update-kyc', {
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

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete this ${user.role}? This action cannot be undone.`)) return;

    setUpdating(true);
    const token = getAuthToken();
    try {
      const url = user.role === 'driver' ? '/api/admin/delete-driver' : `/api/admin/employees/${user._id}`;
      const method = 'DELETE';
      // Drivers API expects { driverId }, Employees API expects ID in URL
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
      if (user.role === 'driver') {
        options.body = JSON.stringify({ driverId: user._id });
      }

      const res = await fetch(url, options);

      if (res.ok) {
        setMessage(`${user.role} deleted successfully`);
        onUpdate();
        setTimeout(() => onClose(), 1000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Delete failed');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-10" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-8 m-4 text-center shadow-2xl">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full"></div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 m-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiX className="text-3xl text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Error Loading Details</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{message || 'The user information could not be retrieved.'}</p>
          <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Use optional chaining with fallback values
  const driverDetails = user.driverDetails;
  const kycStatus = user.driverDetails?.kycStatus || 'pending';
  const kycDocuments = user.driverDetails?.kycDocuments || {};
  const isDriver = user.role === 'driver';
  const isEmployee = user.role === 'employee';
  const isKycFinalised = kycStatus === 'approved' || kycStatus === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-10 rounded-t-lg">
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            User Details
          </h2>
          <div className="flex items-center gap-2">
            {isDriver && (
              <div className="flex gap-2">
                {!isKycFinalised ? (
                  <>
                    <button onClick={() => updateKycStatus('approved')} disabled={updating} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm">
                      <HiCheck className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { const reason = prompt('Rejection reason (optional):'); updateKycStatus('rejected', reason || undefined); }} disabled={updating} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm">
                      <HiX className="w-4 h-4" /> Reject
                    </button>
                  </>
                ) : (
                  <button onClick={() => {
                    if (confirm(`Currently ${kycStatus}. Do you want to change it?`)) {
                      const newStatus = kycStatus === 'approved' ? 'rejected' : 'approved';
                      updateKycStatus(newStatus);
                    }
                  }} disabled={updating} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                    <HiDocumentText className="w-4 h-4" /> Re-Review KYC
                  </button>
                )}
              </div>
            )}
            <button onClick={handleDelete} disabled={updating} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all" title="Delete User">
              <HiTrash className="text-xl" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <HiClose className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 subtle-scrollbar">
          {message && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30">
              {message}
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 dark:text-slate-400">Name:</span> <span className="text-slate-800 dark:text-white font-medium ml-2">{user.name || '-'}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="text-slate-800 dark:text-white ml-2">{user.email}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">Mobile:</span> <span className="text-slate-800 dark:text-white ml-2">{user.mobileNumber}</span></div>
              <div><span className="text-slate-500 dark:text-slate-400">Role:</span> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                  user.role === 'driver' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <div><span className="text-slate-500 dark:text-slate-400">Profile Completed:</span> <span className="text-slate-800 dark:text-white ml-2">{user.profileCompleted ? 'Yes' : 'No'}</span></div>
              {isDriver && (
                <div><span className="text-slate-500 dark:text-slate-400">KYC Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    kycStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    kycStatus === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                    kycStatus === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {kycStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Driver Details */}
          {isDriver && (
            <>
              <div className="bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 dark:text-slate-400">Full Name (as per DL):</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.fullName || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Date of Birth:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.dateOfBirth ? new Date(driverDetails.dateOfBirth).toLocaleDateString() : '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Driving License No.:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.drivingLicenseNumber || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">DL Expiry Date:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.dlExpiryDate ? new Date(driverDetails.dlExpiryDate).toLocaleDateString() : '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Vehicle Reg. No.:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.vehicleRegNumber || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Vehicle Type:</span> <span className="text-slate-800 dark:text-white ml-2 capitalize">{driverDetails?.vehicleType || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Vehicle Make/Model:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.vehicleMake} {driverDetails?.vehicleModel}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Year:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.vehicleYear || '-'}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 dark:text-slate-400">Account Holder:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.accountHolderName || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Bank Name:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.bankName || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">Account Number:</span> <span className="text-slate-800 dark:text-white ml-2">{driverDetails?.accountNumber || '-'}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400">IFSC Code:</span> <span className="text-slate-800 dark:text-white ml-2 uppercase">{driverDetails?.ifscCode || '-'}</span></div>
                </div>
              </div>

              {Object.keys(kycDocuments).length > 0 && (
                <div className="bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    KYC Documents
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(kycDocuments).map(([key, url]) => (
                      <a key={key} href={url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all font-medium">
                        📄 {key.replace(/([A-Z])/g, ' $1').trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isKycFinalised && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${kycStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'}`}>
                  {kycStatus === 'approved' ? <HiCheckCircle className="w-5 h-5" /> : <HiBan className="w-5 h-5" />}
                  <span className="text-sm font-medium">
                    KYC has been <span className="capitalize">{kycStatus}</span>.
                    {kycStatus === 'rejected' && driverDetails?.rejectionReason && (
                      <span className="block text-xs mt-1 opacity-80">Reason: {driverDetails.rejectionReason}</span>
                    )}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Employee Details - using optional chaining */}
          {isEmployee && (
            <div className="bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                Employee Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 dark:text-slate-400">Full Name:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.fullName || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Gender:</span> <span className="text-slate-800 dark:text-white ml-2 capitalize">{user.employeeDetails?.gender || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Present Address:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.presentAddress || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Permanent Address:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.permanentAddress || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Alternate Mobile:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.alternateMobile || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Aadhar:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.aadhar || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Date of Birth:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.dob ? new Date(user.employeeDetails.dob).toLocaleDateString() : '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">PAN:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.pan || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Email:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.email || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Years of Experience:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.yearsOfExperience || 0}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Highest Qualification:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.highestQualification || '-'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Previous Experience:</span> <span className="text-slate-800 dark:text-white ml-2">{user.employeeDetails?.previousExperience || '-'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}