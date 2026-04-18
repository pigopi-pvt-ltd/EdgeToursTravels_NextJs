"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, clearAuthData } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import {
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlinePencilSquare,
  HiOutlineLockClosed,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineArrowRightOnRectangle,
  HiBars3BottomLeft,
} from "react-icons/hi2";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (!isAuthorized) {
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
      />

      <main className="flex-1 lg:ml-64 min-h-screen w-full transition-all duration-300">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <HiBars3BottomLeft className="text-2xl" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white capitalize truncate max-w-[150px] sm:max-w-none">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 sm:p-2 rounded-lg transition-all"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:inline">
                  Welcome, Administrator
                </span>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200 ring-2 ring-white dark:ring-slate-700">
                  A
                </div>
              </div>

              {/* Professional Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700/50 mb-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Account Details
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/admin-dashboard/profile")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                  >
                    <HiOutlineUser className="text-lg text-slate-400 group-hover:text-orange-500" />
                    <span className="font-semibold">About</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                    <HiOutlineCog6Tooth className="text-lg text-slate-400 group-hover:text-orange-500" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                    <HiOutlineLockClosed className="text-lg text-slate-400 group-hover:text-orange-500" />
                    <span className="font-semibold">Change Password</span>
                  </button>

                  <div
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    onClick={toggleTheme}
                  >
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? (
                        <HiOutlineSun className="text-lg text-orange-500" />
                      ) : (
                        <HiOutlineMoon className="text-lg text-slate-400 group-hover:text-blue-500" />
                      )}
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                      </span>
                    </div>
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${theme === "dark" ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${theme === "dark" ? "left-6" : "left-1"}`}
                      ></div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 dark:bg-slate-700/50 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group cursor-pointer"
                  >
                    <HiOutlineArrowRightOnRectangle className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="font-black uppercase tracking-wider text-[11px]">
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
