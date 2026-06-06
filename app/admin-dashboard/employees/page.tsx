'use client';

import { useState } from 'react';
import { HiUserGroup, HiTruck } from 'react-icons/hi';
import EmployeeManagement from '@/components/admin/EmployeeManagement';
import DriverManagement from '@/components/admin/DriverManagement';

export default function UnifiedEmployeesPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'drivers'>('staff');

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      {/* Sticky Tabs Header */}
      <div className="bg-white dark:bg-[#0A1128]/80 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-2 flex items-center gap-2 border-b-2 transition-all font-black uppercase tracking-widest text-xs ${
                activeTab === 'staff'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              <HiUserGroup size={18} />
              Office Staff
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-2 flex items-center gap-2 border-b-2 transition-all font-black uppercase tracking-widest text-xs ${
                activeTab === 'drivers'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
              }`}
            >
              <HiTruck size={18} />
              Field Drivers
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-8">
        {activeTab === 'staff' ? (
          <EmployeeManagement />
        ) : (
          <DriverManagement />
        )}
      </div>
    </div>
  );
}
