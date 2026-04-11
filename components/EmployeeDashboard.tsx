'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuthData } from '@/lib/auth';

export default function EmployeeDashboard() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'driver') {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl mb-4">Welcome, {getStoredUser()?.name || 'Employee'}!</h2>
        <p>This is your employee dashboard. Here you can view tasks, updates, etc.</p>
      </div>
    </div>
  );
}