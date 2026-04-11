'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'driver') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
      setUserName(user.name || 'Employee');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            Employee Panel
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Welcome, {userName}</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
