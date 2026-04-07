"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return ` transition py-1 ${active
      ? 'text-[#0A1128]'
      : 'text-gray-600 hover:text-black'
      }`;
  };

  return (
    <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-10 py-6 text-[#0A1128] bg-white">
      <div className="flex items-center gap-2">
        <Link href="/">
          <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-12 w-auto object-contain cursor-pointer" />
        </Link>
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-bold items-center">
        <Link href="/" className={linkClass('/')}>Home</Link>
        <Link href="/about" className={linkClass('/about')}>About</Link>

        <div className="relative group cursor-pointer h-full flex items-center">
          <span className={`transition flex items-center gap-1 py-1 ${pathname.includes('/services') ? 'text-[#0A1128]' : 'text-gray-600 hover:text-black'}`}>
            Services
            <svg className="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
          <div className="absolute top-full left-0 w-56 bg-transparent pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[100]">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 px-2">
              <Link href="/services/insurance" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/item">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#0A1128] group-hover/item:bg-[#0A1128] group-hover/item:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#0A1128]">Travel Insurance</span>
                  <span className="block text-[10px] text-gray-400">Secure your journey</span>
                </div>
              </Link>
              <Link href="/services/build-package" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/item">
                <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-[#FFB800] group-hover/item:bg-[#FFB800] group-hover/item:text-[#0A1128] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#0A1128]">Build your package</span>
                  <span className="block text-[10px] text-gray-400">Customized experiences</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Link href="/packages" className={linkClass('/packages')}>Packages</Link>
        <Link href="/clients" className={linkClass('/clients')}>Client</Link>
        <Link href="/contact" className={linkClass('/contact')}>ContactUs</Link>
      </div>
      <div className="flex items-center space-x-6 text-sm">
        {/* <a href="#" className="hover:text-gray-200">Support</a> */}
        <button className="bg-[#0A1128] text-white px-6 py-2 rounded-full font-medium hover:bg-blue-900 transition">
          Sign In
        </button>
      </div>
    </nav>
  );
}