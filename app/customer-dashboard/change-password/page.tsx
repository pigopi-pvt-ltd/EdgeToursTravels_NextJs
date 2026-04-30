'use client';

import { useState } from 'react';
import apiClient from '@/lib/apiClient';
import {
  HiOutlineLockClosed,
  HiArrowPath,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';

function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-b-2xl shadow-2xl text-white font-extrabold flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600 shadow-green-500/20' : 'bg-red-600 shadow-red-500/20'} animate-in slide-in-from-top-full fade-in duration-500 whitespace-nowrap`}>
            {toast.type === 'success' ? <HiCheckCircle className="text-2xl" /> : <HiXCircle className="text-2xl" />}
            {toast.message}
          </div>
        )}

        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-indigo-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Change Password
            </h2>
          </div>
        </div>

        <div className="p-0">
          <div className="bg-white dark:bg-slate-900 py-1 transition-colors min-h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800/50 p-4 md:p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl mx-4 animate-in zoom-in-95 duration-500">
              <div className="text-center mb-2">
                <h3 className="text-lg font-extrabold text-black dark:text-white uppercase tracking-tight">Security Update</h3>
                <p className="text-[9px] text-slate-700 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-extrabold">Protect Your Account with a Strong Password</p>
                <div className="h-1 w-8 bg-orange-500 mx-auto mt-2 rounded-full"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-1.5">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-black dark:text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative group">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/5 transition-all font-semibold pr-10 text-black dark:text-white"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showCurrentPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-black dark:text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/5 transition-all font-semibold pr-10 text-black dark:text-white"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showNewPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 ml-1">
                    <div className={`h-1 flex-1 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Min 6 chars</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-extrabold text-black dark:text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/5 transition-all font-semibold pr-10 text-black dark:text-white"
                      placeholder="Repeat your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-extrabold uppercase text-xs tracking-widest transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <HiArrowPath className="animate-spin text-lg" />
                        Updating Security...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
