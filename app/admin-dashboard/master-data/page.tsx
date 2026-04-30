'use client';

import Link from 'next/link';

export default function MasterDataPage() {
  return (
    <div className="-m-4 sm:-m-8">
      <div className="bg-white dark:bg-[#0A1128] min-h-[calc(100vh-64px)] border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Sticky header */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-16 z-30 min-h-[56px]">
          <h1 className="text-sm md:text-xl font-extrabold text-orange-600 uppercase tracking-tighter">
            Master Data Management <span className="text-black dark:text-white font-normal">(5)</span>
          </h1>
        </div>

        <div className="p-2 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: 'Drivers', path: '/admin-dashboard/drivers', desc: 'Secure profile management & KYC for all drivers.', icon: '🚘' },
              { title: 'Vehicles', path: '/admin-dashboard/vehicles', desc: 'Fleet registration, maintenance, location.', icon: '🚕' },
              { title: 'Employees', path: '/admin-dashboard/employees', desc: 'Administrative staff management.', icon: '👥' },
              { title: 'Documents', path: '/admin-dashboard/master-data/documents', desc: 'Global document upload requirements.', icon: '📄' },
              { title: 'Employee Modules', path: '/admin-dashboard/master-data/employee-modules', desc: 'Grant access to bookings & support per employee.', icon: '🔧' }
            ].map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className="group p-6 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] transition-all hover:-translate-y-2 flex flex-col items-center text-center outline-none ring-offset-2 focus:ring-2 focus:ring-orange-500"
              >
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-black text-base text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}