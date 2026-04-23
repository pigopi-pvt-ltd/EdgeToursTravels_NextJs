
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    role: '',
    profileCompleted: false,
    kycStatus: '',
  });
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditName(data.name);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const token = getAuthToken();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setProfile({ ...profile, name: editName, profileCompleted: true });
        setEditing(false);
        setMessage('Profile updated successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Update failed');
      }
    } catch (err) {
      setMessage('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
          {/* Header Toolbar Skeleton */}
          <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 flex items-center justify-between px-6">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>

          <div className="p-0">
            {/* Section Header Skeleton */}
            <div className="bg-slate-50 dark:bg-slate-800/50 h-11 border-b border-slate-200 dark:border-slate-700 flex items-center px-6">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Skeleton */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-inner flex-shrink-0"></div>
              
              {/* Form Fields Skeleton */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-6 w-full max-w-xs bg-slate-100 dark:bg-slate-800/50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              My Profile
            </h2>
          </div>
          {!editing && (
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="p-0 space-y-0">
          {message && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800 font-medium text-sm flex justify-between items-center">
              <span>{message}</span>
              <button onClick={() => setMessage('')}>✕</button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Personal Information
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl md:text-4xl font-black text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 uppercase transition-colors shadow-inner">
                  {profile.name?.charAt(0) || 'U'}
                </div>

                <div className="flex-1 w-full space-y-6">
                  {editing ? (
                    <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200 font-medium"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm active:scale-95">Save Changes</button>
                        <button type="button" onClick={() => setEditing(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                        <p className="text-base font-bold text-slate-800 dark:text-white">{profile.name || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                        <p className="text-base font-bold text-slate-800 dark:text-white">{profile.email || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Mobile Number</label>
                        <p className="text-base font-bold text-slate-800 dark:text-white">{profile.mobileNumber || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Role</label>
                        <div>
                          <span className="px-2.5 py-1 bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-400 rounded text-[10px] font-black border border-green-100 dark:border-emerald-800 uppercase tracking-wider">
                            {profile.role}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">KYC Status</label>
                        <div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${profile.kycStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                              profile.kycStatus === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800' :
                                profile.kycStatus === 'submitted' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' :
                                  'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                            }`}>
                            {profile.kycStatus || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfilePage;