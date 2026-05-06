'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { 
  HiOutlineCog, 
  HiArrowPath, 
  HiOutlineUser, 
  HiOutlineBell, 
  HiOutlineShieldCheck, 
  HiOutlineMoon,
  HiOutlineChevronRight,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiXMark,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';
import { SettingsSkeleton } from '@/components/CustomerSkeletons';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  
  useEffect(() => {
    // Simulate initial load for smooth transition
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      showToast('Password changed successfully!', 'success');
      setIsPasswordModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-24 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-in slide-in-from-right-8 duration-300`}>
            {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
            {toast.message}
          </div>
        )}

        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-indigo-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Settings
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <HiArrowPath className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-0">
          <div className="bg-white dark:bg-slate-900 py-6 md:py-12 transition-colors min-h-[calc(100vh-112px)]">

            <div className="space-y-6">
              {/* Change Password */}
              <div className="flex items-center justify-between p-6 bg-[#f8fafc] dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    <HiOutlineShieldCheck className="text-2xl text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">Change Password</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password regularly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-sm font-bold text-orange-500 hover:underline px-4 py-2"
                >
                  Update
                </button>
              </div>

              {/* Notification Preferences */}
              <div className="flex items-center justify-between p-6 bg-[#f8fafc] dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    <HiOutlineBell className="text-2xl text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">Notification Preferences</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage how you receive alerts and updates</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-orange-500 hover:underline px-4 py-2">Configure</button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-6 bg-[#f8fafc] dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    <HiOutlineShieldCheck className="text-2xl text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-lg">Enable</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineLockClosed className="text-3xl text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Change Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-black">Secure Your Account</p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-bold pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrentPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-bold pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold">Minimum 6 characters required</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-black uppercase text-xs transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>

            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors">
              <HiXMark className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;