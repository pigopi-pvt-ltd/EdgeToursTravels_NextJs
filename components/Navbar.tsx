import React from 'react';

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-10 py-6 text-[#0A1128] bg-white shadow-md">
      <div className="flex items-center gap-2">
        <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-12 w-auto object-contain" />
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-medium">
        <a href="#" className="border-b-2 border-[#0A1128] pb-1">About</a>
        <a href="#" className="text-gray-600 hover:text-black transition">Services</a>
        <a href="#" className="text-gray-600 hover:text-black transition">Packages</a>
        <a href="#" className="text-gray-600 hover:text-black transition">Client</a>
        <a href="#" className="text-gray-600 hover:text-black transition">ContactUs</a>
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