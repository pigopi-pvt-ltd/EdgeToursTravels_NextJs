'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineCog,
  HiOutlineX
} from 'react-icons/hi';
import { clearAuthData, getStoredUser } from '@/lib/auth';

const adminItems = [
  { name: 'Dashboard', icon: HiOutlineViewGrid, href: '/admin-dashboard' },
  { name: 'Drivers', icon: HiOutlineUsers, href: '/admin-dashboard/drivers' },
  { name: 'Availability', icon: HiOutlineCalendar, href: '/admin-dashboard/availability' },
  { name: 'Manage Employee', icon: HiOutlineUserGroup, href: '/admin-dashboard/employees' },
  { name: 'Review', icon: HiOutlineStar, href: '/admin-dashboard/reviews' },
  { name: 'Price', icon: HiOutlineCurrencyDollar, href: '/admin-dashboard/price' },
  { name: 'Government/Private', icon: HiOutlineBriefcase, href: '/admin-dashboard/type' },
  { name: 'Bookings', icon: HiOutlineCalendar, href: '/admin-dashboard/bookings' },
];

const employeeItems = [
  { name: 'Dashboard', icon: HiOutlineViewGrid, href: '/employee-dashboard' },
  { name: 'Profile', icon: HiOutlineUser, href: '/employee-dashboard/profile' },
  { name: 'Kyc', icon: HiOutlineIdentification, href: '/employee-dashboard/kyc' },
  { name: 'Settings', icon: HiOutlineCog, href: '/employee-dashboard/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = React.useState(adminItems);

  React.useEffect(() => {
    const user = getStoredUser();
    if (user?.role === 'driver') {
      setItems(employeeItems);
    } else {
      setItems(adminItems);
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0A1128] text-slate-600 dark:text-white 
        flex flex-col shadow-xl z-50 transition-all duration-300 border-r border-slate-200 dark:border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-10 w-auto object-contain cursor-pointer transition-transform hover:scale-110" />
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 group ${isActive
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-r-4 border-orange-500'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <item.icon className={`text-xl ${isActive ? 'text-orange-600 dark:text-orange-400' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                    <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


      </aside>
    </>
  );
}