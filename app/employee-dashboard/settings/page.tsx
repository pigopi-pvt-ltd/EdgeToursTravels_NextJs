'use client';

import React from 'react';
import { HiOutlineLockClosed, HiOutlineBell, HiOutlineDeviceMobile } from 'react-icons/hi';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
          <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
          Account Settings
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm transition-colors">
                <HiOutlineLockClosed className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Change Password</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Update your account password regularly</p>
              </div>
            </div>
            <button className="text-orange-500 dark:text-orange-400 font-bold text-sm transition-colors">Update</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm transition-colors">
                <HiOutlineBell className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Notification Preferences</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Manage how you receive alerts and updates</p>
              </div>
            </div>
            <button className="text-orange-500 dark:text-orange-400 font-bold text-sm transition-colors">Configure</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm transition-colors">
                <HiOutlineDeviceMobile className="text-2xl text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white transition-colors">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );
}
