"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `transition py-1 relative group ${isActive(path) ? 'text-[#EB664E] border-b-2 border-[#EB664E]' : 'text-gray-600 hover:text-[#EB664E] hover:border-b-2 hover:border-[#EB664E]'
    }`;

  return (
    <header className="absolute top-0 w-full z-50">
      {/* Top Bar */}
      <div className="bg-[#00adef] text-white py-2 px-10 hidden sm:flex items-center justify-between text-[12px] font-semibold">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
            </svg>
            <span className="tracking-widest">1800-2121-000</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/20 pl-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="tracking-widest lowercase">info@edgetoursandtravels.com</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Add language or other top links if needed */}
          <span className="opacity-80 hover:opacity-100 cursor-pointer transition">FAQs</span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer transition">Support</span>
        </div>
      </div>


      <nav className="w-full flex items-center justify-between px-10 py-5 text-[#0A1128] bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-10 w-auto object-contain cursor-pointer" />
          </Link>
        </div>
        <div className="hidden md:flex space-x-8 text-[12px] font-black items-center tracking-widest">
          <Link href="/" className={linkClass('/')}>HOME</Link>
          <Link href="/about" className={linkClass('/about')}>ABOUT</Link>

          {/* Services dropdown unchanged */}
          <div className="relative group cursor-pointer h-full flex items-center">
            <span className={`transition flex items-center gap-1 py-1 ${pathname.includes('/services') ? 'text-[#EB664E] border-b-2 border-[#EB664E]' : 'text-gray-600 hover:text-[#EB664E] hover:border-b-2 hover:border-[#EB664E]'}`}>
              SERVICES
              <svg className="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <div className="absolute top-full left-0 w-80 bg-transparent pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[100]">
              <div className="bg-white rounded-lg shadow-2xl border border-gray-100 py-3 px-2">
                <Link href="/services/insurance" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all group/item">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#0A1128] group-hover/item:bg-[#0A1128] group-hover/item:text-white transition-all transform group-hover/item:rotate-12 duration-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm font-black text-[#0A1128] group-hover/item:text-[#EB664E] transition-colors uppercase tracking-wider">Travel Insurance</span>
                  </div>
                </Link>
                <Link href="/services/build-package" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all group/item">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#EB664E] group-hover/item:bg-[#EB664E] group-hover/item:text-white transition-all transform group-hover/item:rotate-12 duration-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-sm font-black text-[#0A1128] group-hover/item:text-[#EB664E] transition-colors uppercase tracking-wider">Build package</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/packages" className={linkClass('/packages')}>PACKAGES</Link>
          <Link href="/clients" className={linkClass('/clients')}>CLIENT</Link>
          <Link href="/contact" className={linkClass('/contact')}>CONTACT US</Link>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <Link href="/login">
            <button className="bg-[#EB664E] text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-[#d55a45] transition shadow-lg">
              Sign In
            </button>
          </Link>
        </div>
      </nav>
    </header>

  );
}