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
  HiOutlineClock,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
import { clearAuthData, getStoredUser } from "@/lib/auth";

// Admin menu items 
const adminItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/admin-dashboard" },
  { name: "Bookings", icon: HiOutlineCalendar, href: "/admin-dashboard/bookings" },
  // { name: "Long‑term Rentals", icon: HiOutlineCalendar, href: "/admin-dashboard/long-term-rentals" },
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

// Driver menu items
const driverItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/driver-dashboard" },
  { name: "KYC", icon: HiOutlineIdentification, href: "/driver-dashboard/kyc" },
  // { name: "Long‑term Rentals", icon: HiOutlineCalendar, href: "/driver-dashboard/long-term-rentals" },
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
        if (modules.includes('drivers')) {
          employeeBase.push({ name: "Drivers", icon: HiOutlineUsers, href: "/employee-dashboard/drivers" });
        }
        if (modules.includes('employees')) {
          employeeBase.push({ name: "Manage Employee", icon: HiOutlineUserGroup, href: "/employee-dashboard/employees" });
        }
        if (modules.includes('customer')) {
          employeeBase.push({ name: "Customer", icon: HiOutlineBriefcase, href: "/employee-dashboard/customer-types" });
        }
        if (modules.includes('vehicles')) {
          employeeBase.push({ name: "Vehicles", icon: HiOutlineTruck, href: "/employee-dashboard/vehicles" });
        }
        // Always show these
        employeeBase.push(
          { name: "Attendance", icon: HiOutlineClock, href: "/employee-dashboard/attendance" },
          { name: "Leave Request", icon: HiOutlinePaperAirplane, href: "/employee-dashboard/leave" },
          { name: "Salary", icon: HiOutlineCurrencyDollar, href: "/employee-dashboard/salary" }
        );
        if (modules.includes('support')) {
          employeeBase.push({ name: "Support", icon: HiOutlineSupport, href: "/employee-dashboard/support" });
        }
        setItems(employeeBase);
      } else {
        setItems([]);
      }
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
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
        {/* Header with logo & collapse toggle */}
        <div className={`h-16 px-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/">
              <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <img
                  src="/images/logo.png"
                  alt="Edge Tours & Travels"
                  className="h-10 w-auto object-contain cursor-pointer transition-transform hover:scale-110"
                />
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 bg-[#1ABC9C] rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
              <HiOutlineViewGrid className="text-white text-xl" />
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 subtle-scrollbar">
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
                    className={`flex items-center gap-4 px-6 py-3.5 transition-all duration-200 group relative ${isActive
                        ? "bg-[#1ABC9C] text-white shadow-lg shadow-teal-500/20"
                        : "text-black dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-[#1ABC9C] dark:hover:text-[#1ABC9C]"
                      }`}
                  >
                    <item.icon
                      className={`text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive
                          ? "text-white"
                          : "text-black dark:text-slate-400 group-hover:text-[#1ABC9C]"
                        }`}
                    />
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
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md transition-all active:scale-95"
                          >
                            <HiOutlineChevronLeft className="text-slate-400 hover:text-[#1ABC9C]" />
                          </button>
                        )}
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl">
                        {item.name}
                      </div>
                    )}
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