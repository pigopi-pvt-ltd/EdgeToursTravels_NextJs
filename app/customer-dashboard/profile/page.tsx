'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { ProfileSkeleton } from '@/components/CustomerSkeletons';
import { HiArrowPath } from 'react-icons/hi2';

export default function ProfilePage() {
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
    setLoading(true);
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
    return <ProfileSkeleton />;
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              My Profile
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchProfile}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-0">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-10 transition-colors">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-10 flex items-center gap-3">

              My Profile
            </h2>

            {message && (
              <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800 text-sm font-bold animate-in fade-in">
                {message}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Avatar */}
              <div className="w-40 h-40 rounded-full bg-[#f0f4f8] dark:bg-slate-800 flex items-center justify-center text-5xl font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 uppercase">
                {profile.name?.charAt(0) || 'U'}
              </div>

              {/* Profile Details Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  {editing ? (
                    <form onSubmit={handleUpdateName} className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded px-3 py-1.5 text-sm font-bold outline-none focus:border-orange-500/50"
                        autoFocus
                      />
                      <button type="submit" className="text-xs font-bold text-emerald-600">Save</button>
                      <button type="button" onClick={() => setEditing(false)} className="text-xs font-bold text-slate-400">Cancel</button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-end group">
                      <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{profile.name || '-'}</p>
                      <button onClick={() => setEditing(true)} className="text-sm font-bold text-orange-500 hover:underline">Edit</button>
                    </div>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{profile.email || '-'}</p>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                  <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{profile.mobileNumber || '-'}</p>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <div className="pt-0.5">
                    <span className="px-3 py-1 inline-flex bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                      {profile.role || 'Customer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}