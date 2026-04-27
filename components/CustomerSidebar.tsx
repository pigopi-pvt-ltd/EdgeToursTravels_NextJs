"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlinePlusCircle,
} from "react-icons/hi";
import { clearAuthData, getStoredUser } from "@/lib/auth";

const customerItems = [
  { name: "Dashboard", icon: HiOutlineViewGrid, href: "/customer-dashboard" },
  { name: "My Bookings", icon: HiOutlineCalendar, href: "/customer-dashboard/bookings" },
  { name: "Available Vehicles", icon: HiOutlineTruck, href: "/customer-dashboard/vehicles" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function CustomerSidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
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

      <aside
        className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-[#0A1128] text-slate-600 dark:text-white 
        flex flex-col shadow-xl z-50 transition-all duration-300 border-r border-slate-200 dark:border-slate-800 font-roboto
        ${isCollapsed ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className={`h-16 px-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/customer-dashboard">
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
        {/* {!isCollapsed && user && (
          <div className="mx-4 mt-4 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role: <span className="text-orange-600 dark:text-orange-400">Customer</span>
            </span>
          </div>
        )} */}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {customerItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
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
                      <span className="font-bold text-[15px] tracking-tight whitespace-nowrap overflow-hidden">
                        {item.name}
                      </span>
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

        {/* Collapse toggle button */}
        {/* <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HiOutlineChevronLeft className={`text-xl transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span className="font-bold text-sm">Collapse</span>}
          </button>
        </div> */}


      </aside>
    </>
  );
}