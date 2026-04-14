// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ email: '', mobileNumber: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchEmployees().finally(() => setLoading(false));
  }, []);

  const fetchEmployees = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEmployees(data.employees);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 h-32 flex flex-col justify-between">
            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
            <div className="flex justify-between items-end">
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 w-20 bg-slate-50 dark:bg-slate-900 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = getAuthToken();
    const res = await fetch('/api/admin/create-employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEmployee),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Employee created! Temporary password: ${data.temporaryPassword}`);
      setNewEmployee({ email: '', mobileNumber: '', name: '' });
      fetchEmployees();
    } else {
      setMessage(`Error: ${data.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 transition-colors duration-300">
      <div className="py-6 lg:py-8 space-y-8 px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white transition-colors">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">System overview and key performance metrics</p>
          </div>
        </div>

        {/* Stats Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500/50 transition-all group hover:shadow-lg hover:shadow-orange-500/10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total Employees</p>
            <div className="flex justify-between items-end mt-4">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{employees.length}</h3>
              <span className="text-xs text-green-500 font-bold bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">+2 new</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group hover:shadow-lg hover:shadow-indigo-500/10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Active Drivers</p>
            <div className="flex justify-between items-end mt-4">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">24</h3>
              <span className="text-xs text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">8 on duty</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500/50 transition-all group hover:shadow-lg hover:shadow-rose-500/10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Pending Reviews</p>
            <div className="flex justify-between items-end mt-4">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">12</h3>
              <span className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full">Urgent</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all group hover:shadow-lg hover:shadow-emerald-500/10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">System Status</p>
            <div className="flex items-center gap-3 mt-4">
              <h3 className="text-3xl font-bold text-emerald-500 tracking-tight flex items-center gap-3">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500"></span>
                ONLINE
              </h3>
            </div>
          </div>
        </div>

        {/* Placeholder for more content */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 h-96 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
           <div className="text-4xl mb-4">🚀</div>
           <p className="font-bold text-lg">Detailed Analytics Coming Soon</p>
           <p className="text-sm">We're building advanced reporting tools for your dashboard.</p>
        </div>
      </div>
    </div>

  );
}