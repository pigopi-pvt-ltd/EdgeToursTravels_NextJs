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
  HiOutlineCurrencyDollar,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineCog,
  HiOutlineX,
  HiOutlineTruck,
  HiOutlineDatabase,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLogout,
} from "react-icons/hi";
import { clearAuthData, getStoredUser } from "@/lib/auth";

// Admin menu items
const adminItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/admin-dashboard" },
  { name: "Master Data", icon: HiOutlineDatabase, href: "/admin-dashboard/master-data" },
  { name: "Drivers", icon: HiOutlineUsers, href: "/admin-dashboard/drivers" },
  { name: "Vehicles", icon: HiOutlineTruck, href: "/admin-dashboard/vehicles" },
  { name: "Availability", icon: HiOutlineCalendar, href: "/admin-dashboard/availability" },
  { name: "Manage Employee", icon: HiOutlineUserGroup, href: "/admin-dashboard/employees" },
  { name: "Review", icon: HiOutlineStar, href: "/admin-dashboard/reviews" },
  { name: "Price", icon: HiOutlineCurrencyDollar, href: "/admin-dashboard/price" },
  { name: "Customer", icon: HiOutlineBriefcase, href: "/admin-dashboard/type" },
  { name: "Bookings", icon: HiOutlineCalendar, href: "/admin-dashboard/bookings" },
  { name: "Settings", icon: HiOutlineCog, href: "/admin-dashboard/settings" },
];

// Driver menu items
const driverItems = [
  { name: "My Trips", icon: HiOutlineTruck, href: "/driver-dashboard/my-trips" },
  { name: "KYC", icon: HiOutlineIdentification, href: "/driver-dashboard/kyc" },
  { name: "Profile", icon: HiOutlineUser, href: "/driver-dashboard/profile" },
  { name: "Settings", icon: HiOutlineCog, href: "/driver-dashboard/settings" },
];

// Employee menu items 
const employeeItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/employee-dashboard" },
  { name: "Profile", icon: HiOutlineUser, href: "/employee-dashboard/profile" },
  { name: "Settings", icon: HiOutlineCog, href: "/employee-dashboard/settings" },
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
  const [userRole, setUserRole] = React.useState<string>("");

  React.useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserRole(user.role);
      if (user.role === "admin") {
        setItems(adminItems);
      } else if (user.role === "driver") {
        setItems(driverItems);
      } else if (user.role === "employee") {
        setItems(employeeItems);
      } else {
        // customer or others – sidebar should not be used, but fallback to empty
        setItems([]);
      }
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  // If no items (e.g., customer), don't render sidebar
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
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-200/50">
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

        {/* Role Badge */}
        {/* {!isCollapsed && userRole && (
          <div className="mx-4 mt-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role: <span className="text-orange-600 dark:text-orange-400">{userRole}</span>
            </span>
          </div>
        )} */}

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
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-r-4 border-orange-500"
                        : "text-black dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <item.icon
                      className={`text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-orange-600 dark:text-orange-400" : "text-black dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-[15px] tracking-tight whitespace-nowrap overflow-hidden">
                          {item.name}
                        </span>
                        {item.name === "Dashboard" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCollapsed(true);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md transition-all active:scale-95"
                          >
                            <HiOutlineChevronLeft className="text-slate-400 hover:text-orange-500" />
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

        {/* Logout Button at bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-black dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <HiOutlineLogout className="text-xl" />
            {!isCollapsed && <span className="font-bold text-[15px]">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}