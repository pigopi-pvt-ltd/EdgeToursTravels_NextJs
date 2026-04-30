"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineSupport,
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineIdentification,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineDatabase,
  HiOutlineChevronLeft,
  HiOutlineLogout,
  HiOutlineClock,
  HiOutlinePaperAirplane, 
} from "react-icons/hi";
import { clearAuthData, getStoredUser } from "@/lib/auth";

const adminItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/admin-dashboard" },
  { name: "Bookings", icon: HiOutlineCalendar, href: "/admin-dashboard/bookings" },
  { name: "Drivers", icon: HiOutlineUsers, href: "/admin-dashboard/drivers" },
  { name: "Vehicles", icon: HiOutlineTruck, href: "/admin-dashboard/vehicles" },
  { name: "Availability", icon: HiOutlineCalendar, href: "/admin-dashboard/availability" },
  { name: "Manage Employee", icon: HiOutlineUserGroup, href: "/admin-dashboard/employees" },
  { name: "Review", icon: HiOutlineStar, href: "/admin-dashboard/reviews" },
  { name: "Price", icon: HiOutlineCurrencyDollar, href: "/admin-dashboard/price" },
  { name: "Customer", icon: HiOutlineBriefcase, href: "/admin-dashboard/type" },
  { name: "Attendance", icon: HiOutlineCalendar, href: "/admin-dashboard/attendance" },
  { name: "Salary", icon: HiOutlineUserGroup, href: "/admin-dashboard/salary" },
  { name: "Leave & Holidays", icon: HiOutlineCalendar, href: "/admin-dashboard/attendance-leaves-holidays" },
  { name: "Master Data", icon: HiOutlineDatabase, href: "/admin-dashboard/master-data" },
];

const driverItems = [
  { name: "My Trips", icon: HiOutlineTruck, href: "/driver-dashboard/my-trips" },
  { name: "KYC", icon: HiOutlineIdentification, href: "/driver-dashboard/kyc" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = React.useState(adminItems);

  React.useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.role === "admin") {
        setItems(adminItems);
      } else if (user.role === "driver") {
        setItems(driverItems);
      } else if (user.role === "employee") {
        const modules = user.modules || [];
        const employeeBase: { name: string; icon: any; href: string }[] = [
          { name: "Dashboard", icon: HiOutlineViewGrid, href: "/employee-dashboard" },
        ];
        if (modules.includes('bookings')) {
          employeeBase.push({ name: "Manage Bookings", icon: HiOutlineCalendar, href: "/employee-dashboard/bookings" });
        }
        employeeBase.push({ name: "Attendance", icon: HiOutlineClock, href: "/employee-dashboard/attendance" });
        employeeBase.push({ name: "Leave Request", icon: HiOutlinePaperAirplane, href: "/employee-dashboard/leave" }); 
        employeeBase.push({ name: "Salary", icon: HiOutlineCurrencyDollar, href: "/employee-dashboard/salary" });
        if (modules.includes('support')) {
          employeeBase.push({ name: "Support", icon: HiOutlineSupport, href: "/employee-dashboard/support" });
        }
        setItems(employeeBase);
      } else {
        setItems([]);
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (items.length === 0) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-[#0A1128] text-black dark:text-white 
        flex flex-col shadow-xl z-50 transition-all duration-300 border-r border-slate-200 dark:border-slate-800
        ${isCollapsed ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className={`h-16 px-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/">
              <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <img
                  src="/images/logo.png"
                  alt="Edge Tours & Travels"
                  className="h-10 w-auto object-contain cursor-pointer"
                />
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <HiOutlineViewGrid className="text-white text-xl" />
            </div>
          )}
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
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
                    onClick={(e) => {
                      if (window.innerWidth < 1024) onClose();
                      if (isCollapsed && item.name === "Dashboard") {
                        setIsCollapsed(false);
                        e.preventDefault();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-200 group relative ${
                      isActive
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-r-4 border-orange-500"
                        : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className={`text-2xl shrink-0 ${isActive ? "text-orange-600" : "text-black dark:text-slate-400"}`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-[15px] tracking-tight">{item.name}</span>
                        {item.name === "Dashboard" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCollapsed(true);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md"
                          >
                            <HiOutlineChevronLeft className="text-slate-400 hover:text-orange-500" />
                          </button>
                        )}
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all"
          >
            <HiOutlineLogout className="text-xl" />
            {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}