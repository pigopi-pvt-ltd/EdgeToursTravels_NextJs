// app/admin-dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // API returns a direct array, not { employees: [...] }
        setEmployees(Array.isArray(data) ? data : data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Employees</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {employees?.length ?? 0}
            </h3>
            <span className="text-xs text-green-500 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">+2 this month</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Drivers</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">24</h3>
            <span className="text-xs text-orange-400 font-semibold bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">8 on duty</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Reviews</p>
          <div className="flex justify-between items-end mt-2">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">12</h3>
            <span className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">Action required</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-3xl font-bold text-green-500 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
