"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchForm from "./SearchForm";
import {
  HiXMark,
  HiMagnifyingGlass,
  HiOutlineSun,
  HiOutlineMoon,
  HiBars3,
  HiChevronDown,
} from "react-icons/hi2";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const toggleExpanded = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `transition py-1 relative group ${
      isActive(path)
        ? "text-[#EB664E] border-b-2 border-[#EB664E]"
        : "text-gray-600 dark:text-gray-400 hover:text-[#EB664E] hover:border-b-2 hover:border-[#EB664E]"
    }`;

  const fleetData = [
    {
      name: "Sedans",
      path: "/fleet/sedans",
      subItems: [
        { name: "Swift Dzire", path: "/fleet/sedans/swift-dzire" },
        { name: "Hyundai Aura", path: "/fleet/sedans/hyundai-aura" },
        { name: "Honda Amaze", path: "/fleet/sedans/honda-amaze" },
        { name: "Honda City", path: "/fleet/sedans/honda-city" },
        { name: "Ciaz", path: "/fleet/sedans/maruti-suzuki-ciaz" },
      ],
    },
    {
      name: "SUV/MUVs",
      path: "/fleet/suv-muvs",
      subItems: [
        { name: "Ertiga", path: "/fleet/suv-muvs/ertiga" },
        { name: "Rumion", path: "/fleet/suv-muvs/rumion" },
        { name: "Innova Crysta", path: "/fleet/suv-muvs/innova-crysta" },
        { name: "Innova Hycross", path: "/fleet/suv-muvs/innova-hycross" },
        { name: "Invicto", path: "/fleet/suv-muvs/invicto" },
        { name: "Fortuner", path: "/fleet/suv-muvs/fortuner" },
        { name: "Carnival", path: "/fleet/suv-muvs/carnival" },
        { name: "Carens", path: "/fleet/suv-muvs/carens" },
      ],
    },
    {
      name: "Luxury Cars",
      path: "/fleet/luxury-cars",
      subItems: [
        { name: "Camry", path: "/fleet/luxury-cars/camry" },
        { name: "E-Class", path: "/fleet/luxury-cars/e-class" },
        { name: "Mercedes S-Class", path: "/fleet/luxury-cars/s-class" },
        { name: "BMW 7 Series", path: "/fleet/luxury-cars/bmw-7" },
        { name: "Jaguar XF", path: "/fleet/luxury-cars/jaguar-xf" },
        { name: "Mercedes Viano", path: "/fleet/luxury-cars/viano" },
        { name: "Land Rover Defender", path: "/fleet/luxury-cars/defender" },
        { name: "Vellfire", path: "/fleet/luxury-cars/vellfire" },
      ],
    },
    {
      name: "Van",
      path: "/fleet/van",
      subItems: [
        { name: "Tempo Traveller", path: "/fleet/van/tempo-traveller" },
        { name: "Tempo Traveller 15 Seater", path: "/fleet/van/tempo-15" },
        { name: "Urbania", path: "/fleet/van/urbania" },
        { name: "Urbania 15 Seater", path: "/fleet/van/urbania-15" },
      ],
    },
    {
      name: "EV Cars",
      path: "/fleet/ev-cars",
      subItems: [
        { name: "Tata Tigor", path: "/fleet/ev-cars/tigor" },
        { name: "Tata Nexon", path: "/fleet/ev-cars/nexon" },
        { name: "MG ZS EV", path: "/fleet/ev-cars/mg-zs" },
        { name: "Ioniq 5", path: "/fleet/ev-cars/ioniq-5" },
      ],
    },
    {
      name: "Luxury Buses",
      path: "/fleet/luxury-buses",
      subItems: [
        { name: "Mini Bus Coach", path: "/fleet/luxury-buses/mini-coach" },
        { name: "Luxury Coach", path: "/fleet/luxury-buses/luxury-coach" },
        { name: "Scania/Volvo Bus", path: "/fleet/luxury-buses/scania-volvo" },
      ],
    },
  ];

  return (
    <header className="absolute top-0 w-full z-50">
      {/* Top Bar - Hidden on small mobile */}
      <div className="bg-[#00adef] text-white py-2 px-4 md:px-10 hidden sm:flex items-center justify-between text-[11px] md:text-[12px] font-semibold transition-all">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 md:w-3.5 h-3 md:h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
            </svg>
            <span className="tracking-widest">1800-2121-000</span>
          </div>
          <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-6">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="tracking-widest lowercase">
              info@edgetours.com
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80 hover:opacity-100 cursor-pointer transition">
            FAQs
          </span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer transition">
            Support
          </span>
        </div>
      </div>

      <nav className="w-full flex items-center justify-between px-4 md:px-10 py-4 md:py-5 text-[#0A1128] dark:text-white bg-white dark:bg-[#0A1128] shadow-sm dark:shadow-slate-900/50 transition-all duration-300">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-[#EB664E] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <HiBars3 className="text-2xl" />
          </button>

          <Link href="/">
            <img
              src="/images/logo.png"
              alt="Edge Tours & Travels"
              className="h-8 md:h-10 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 lg:space-x-8 text-[11px] lg:text-[12px] font-black items-center tracking-widest">
          <Link href="/" className={linkClass("/")}>
            HOME
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            ABOUT
          </Link>

          <div className="relative group cursor-pointer h-full flex items-center">
            <span
              className={`transition flex items-center gap-1 py-1 ${pathname.includes("/fleet") ? "text-[#EB664E] border-b-2 border-[#EB664E]" : "text-gray-600 dark:text-gray-400 hover:text-[#EB664E] hover:border-b-2 hover:border-[#EB664E]"}`}
            >
              OUR FLEET
              <svg
                className="w-3 h-3 group-hover:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
            <div className="absolute top-full left-0 w-64 bg-transparent pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[100]">
              <div className="bg-white dark:bg-[#0F172A] rounded-lg shadow-2xl border border-gray-100 dark:border-slate-800 py-2">
                {fleetData.map((item) => (
                  <div key={item.name} className="relative group/sub">
                    <Link
                      href={item.path}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 group-hover/item:text-[#EB664E] uppercase tracking-wider">
                        {item.name}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-blue-800 group-hover/item:translate-x-1 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10,17L15,12L10,7V17Z" />
                      </svg>
                    </Link>
                    <div className="absolute left-full top-0 w-64 bg-transparent pl-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible translate-x-2 group-hover/sub:translate-x-0 transition-all duration-300 z-[110]">
                      <div className="bg-white dark:bg-[#0F172A] rounded-lg shadow-2xl border border-gray-100 dark:border-slate-800 py-2">
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className="block px-6 py-3 text-[12px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#EB664E] hover:bg-gray-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group cursor-pointer h-full flex items-center">
            <span
              className={`transition flex items-center gap-1 py-1 ${pathname.includes("/services") ? "text-[#EB664E] border-b-2 border-[#EB664E]" : "text-gray-600 dark:text-gray-400 hover:text-[#EB664E] hover:border-b-2 hover:border-[#EB664E]"}`}
            >
              SERVICES
              <svg
                className="w-3 h-3 group-hover:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
            <div className="absolute top-full left-0 w-80 bg-transparent pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[100]">
              <div className="bg-white dark:bg-[#0F172A] rounded-lg shadow-2xl border border-gray-100 dark:border-slate-800 py-3 px-2">
                <Link
                  href="/services/insurance"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group/item"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-[#0A1128] dark:text-white group-hover/item:bg-[#0A1128] group-hover/item:text-white transition-all transform group-hover/item:rotate-12 duration-500 flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-[#0A1128] dark:text-white group-hover/item:text-[#EB664E] transition-colors uppercase tracking-wider">
                    Travel Insurance
                  </span>
                </Link>
                <Link
                  href="/services/build-package"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group/item"
                >
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-[#EB664E] group-hover/item:bg-[#EB664E] group-hover/item:text-white transition-all transform group-hover/item:rotate-12 duration-500 flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-[#0A1128] dark:text-white group-hover/item:text-[#EB664E] transition-colors uppercase tracking-wider">
                    Build package
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/contact" className={linkClass("/contact")}>
            CONTACT US
          </Link>

          <button
            onClick={() => setIsBookingOpen(true)}
            className="group cursor-pointer ml-4"
          >
            <div className="bg-[#EB664E] text-white px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] hover:shadow-[0_10px_25px_-5px_rgba(235,102,78,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 border border-white/20">
              Book Now <HiMagnifyingGlass className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-gray-300"
          >
            {theme === "light" ? (
              <HiOutlineMoon className="text-xl" />
            ) : (
              <HiOutlineSun className="text-xl text-yellow-500" />
            )}
          </button>
          <Link href="/login" className="hidden sm:block">
            <button className="bg-[#EB664E] text-white px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-[0_10px_25px_-5px_rgba(235,102,78,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 border border-white/20 cursor-pointer">
              Sign In
            </button>
          </Link>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="md:hidden p-2 text-[#EB664E]"
          >
            <HiMagnifyingGlass className="text-2xl" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-[280px] h-full bg-white dark:bg-[#0A1128] shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <img
                src="/images/logo.png"
                alt="Edge Tours & Travels"
                className="h-8 w-auto"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <HiXMark className="text-2xl" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-4">
              <Link
                href="/"
                className="block text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                HOME
              </Link>
              <Link
                href="/about"
                className="block text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                ABOUT
              </Link>

              <div className="space-y-2">
                <button
                  onClick={() => toggleExpanded("fleet")}
                  className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200"
                >
                  OUR FLEET{" "}
                  <HiChevronDown
                    className={`transition-transform ${expandedItems.includes("fleet") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedItems.includes("fleet") && (
                  <div className="pl-4 space-y-3 mt-2">
                    {fleetData.map((item) => (
                      <div key={item.name}>
                        <Link
                          href={item.path}
                          className="text-xs font-bold text-[#EB664E] block mb-1"
                        >
                          {item.name}
                        </Link>
                        <div className="pl-3 space-y-1">
                          {item.subItems.slice(0, 3).map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.path}
                              className="block text-xs text-slate-500 dark:text-slate-400 py-1"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => toggleExpanded("services")}
                  className="w-full flex items-center justify-between text-sm font-bold text-gray-800 dark:text-gray-200"
                >
                  SERVICES{" "}
                  <HiChevronDown
                    className={`transition-transform ${expandedItems.includes("services") ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedItems.includes("services") && (
                  <div className="pl-4 space-y-3 mt-2">
                    <Link
                      href="/services/insurance"
                      className="block text-xs font-bold text-gray-600 dark:text-gray-400"
                    >
                      TRAVEL INSURANCE
                    </Link>
                    <Link
                      href="/services/build-package"
                      className="block text-xs font-bold text-gray-600 dark:text-gray-400"
                    >
                      BUILD PACKAGE
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                className="block text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                CONTACT US
              </Link>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/login"
                className="block w-full bg-[#EB664E] text-white py-3.5 rounded-xl font-black text-center text-[10px] tracking-[0.2em] uppercase hover:shadow-[0_10px_25px_-5px_rgba(235,102,78,0.5)] transition-all duration-300 transform active:scale-95"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal - Responsive improvements */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsBookingOpen(false)}
          ></div>
          <div className="relative w-full max-w-6xl transform transition-all duration-500 scale-100 opacity-100 max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="fixed top-4 right-4 sm:-top-16 sm:right-0 text-white/90 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-[0.3em] text-[10px] sm:text-[12px] font-black group z-10 bg-black/20 p-2 rounded-full sm:bg-transparent"
            >
              <span className="hidden sm:inline">Close</span>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <HiXMark className="text-xl" />
              </div>
            </button>
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-0 rounded-2xl">
              <SearchForm />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

