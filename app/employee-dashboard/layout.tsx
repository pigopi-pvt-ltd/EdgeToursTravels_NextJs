'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import Header from '@/components/Header';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== 'employee') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
      setUser(stored);
    }
  }, [router]);

  if (!isAuthorized || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] flex transition-colors duration-300">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen relative overflow-hidden backdrop-blur-3xl`}>
        <Header user={user} role="employee" onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
