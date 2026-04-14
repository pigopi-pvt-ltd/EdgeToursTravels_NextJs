// app/driver/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';

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

  if (loading) return <div className="p-8 text-center dark:text-gray-400">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
          <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
          My Profile
        </h2>

        {message && <div className="mb-4 p-2 bg-green-50 dark:bg-emerald-900/20 text-green-700 dark:text-emerald-400 rounded border dark:border-emerald-800 transition-colors">{message}</div>}

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 uppercase transition-colors">
            {profile.name?.charAt(0) || 'U'}
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 transition-colors">Full Name</label>
                {editing ? (
                  <form onSubmit={handleUpdateName} className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded px-2 py-1 flex-1 outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all"
                      autoFocus
                    />
                    <button type="submit" className="bg-green-600 dark:bg-emerald-600 text-white px-3 py-1 rounded hover:bg-green-700 dark:hover:bg-emerald-500 transition-colors">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="bg-gray-300 dark:bg-slate-700 dark:text-white px-3 py-1 rounded hover:bg-gray-400 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-slate-800 dark:text-white transition-colors">{profile.name || '-'}</p>
                    <button onClick={() => setEditing(true)} className="text-sm text-orange-500 dark:text-orange-400 hover:underline transition-colors">Edit</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 transition-colors">Email Address</label>
                <p className="text-lg font-semibold text-slate-800 dark:text-white transition-colors">{profile.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 transition-colors">Mobile Number</label>
                <p className="text-lg font-semibold text-slate-800 dark:text-white transition-colors">{profile.mobileNumber || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 transition-colors">Role</label>
                <span className="px-3 py-1 inline-flex bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-green-100 dark:border-emerald-800 uppercase transition-colors">
                  {profile.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 transition-colors">KYC Status</label>
                <span className={`px-3 py-1 inline-flex rounded-full text-xs font-bold transition-colors ${
                  profile.kycStatus === 'approved' ? 'bg-green-100 dark:bg-emerald-900/30 text-green-800 dark:text-emerald-400 border border-green-200 dark:border-emerald-800' :
                  profile.kycStatus === 'rejected' ? 'bg-red-100 dark:bg-rose-900/30 text-red-800 dark:text-rose-400 border border-red-200 dark:border-rose-800' :
                  profile.kycStatus === 'submitted' ? 'bg-blue-100 dark:bg-indigo-900/30 text-blue-800 dark:text-indigo-300 border border-blue-200 dark:border-indigo-800' :
                  'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-400 border border-yellow-200 dark:border-amber-800'
                }`}>
                  {profile.kycStatus || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}