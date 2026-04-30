'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import CustomerSidebar from '@/components/CustomerSidebar';
import Header from '@/components/Header';
import FloatingSupportButton from '@/components/FloatingSupportButton';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== 'customer') {
      router.push('/login');
    } else {
      setUser(stored);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] flex font-sf">
      <CustomerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen`}>
        <Header user={user} role="customer" onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 sm:p-8">{children}</div>
      </main>
      {/* Floating support button */}
      <FloatingSupportButton />
    </div>
  );
}