'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import EmployeesPage from '@/app/admin-dashboard/employees/page';

export default function EmployeeEmployeesWrapper() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'employee' || !user.modules?.includes('employees')) {
      router.replace('/employee-dashboard');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return <div className="p-8 text-center">Checking permissions...</div>;

  return <EmployeesPage />;
}