'use client';

import { getStoredUser } from '@/lib/auth';
import { HiOutlineUser } from 'react-icons/hi2';

export default function EmployeeDashboard() {
  const user = getStoredUser();
  const userName = user?.name || 'Employee';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          Employee Dashboard
        </h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative group transition-all hover:shadow-2xl">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <HiOutlineUser className="text-9xl text-indigo-600" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            Welcome, <span className="text-indigo-600">{userName}!</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl leading-relaxed font-medium">
            This is your employee dashboard. Here you can view tasks, updates, etc.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100">
              Active Session
            </div>
            <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-xs font-black text-indigo-600 uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-900/30 transition-colors hover:bg-indigo-100">
              Employee Panel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}