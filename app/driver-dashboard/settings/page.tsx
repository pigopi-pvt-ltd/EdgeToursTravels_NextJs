'use client';

import React from 'react';
import { HiOutlineLockClosed, HiOutlineBell, HiOutlineDeviceMobile } from 'react-icons/hi';

function SettingsPage() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Account Settings
            </h2>
          </div>
        </div>

        <div className="p-0 space-y-0">
          {/* Security Section */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Security & Privacy
              </h2>
            </div>
            <div className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-colors">
                    <HiOutlineLockClosed className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Change Password</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Update your account password regularly</p>
                  </div>
                </div>
                <button className="text-orange-500 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest hover:underline transition-colors">Update</button>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-colors">
                    <HiOutlineDeviceMobile className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95">Enable</button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Preferences
              </h2>
            </div>
            <div className="p-0">
              <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-colors">
                    <HiOutlineBell className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Notification Preferences</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Manage how you receive alerts and updates</p>
                  </div>
                </div>
                <button className="text-orange-500 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest hover:underline transition-colors">Configure</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;
