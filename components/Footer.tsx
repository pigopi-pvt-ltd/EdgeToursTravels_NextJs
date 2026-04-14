import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0A1128] border-t border-gray-100 dark:border-slate-800 py-12 px-6 md:px-10 mt-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-8 md:h-10 w-auto object-contain mb-6" />
          <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 leading-relaxed transition-colors max-w-xs">
            Elevating global travel through impeccable service and technological precision since 2014.
          </p>
        </div>
        <div className="space-y-4">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-[#EB664E]">Company</h4>
           <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About Us</a></li>
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Fleet Gallery</a></li>
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Travel Insurance</a></li>
           </ul>
        </div>
        <div className="space-y-4">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-[#EB664E]">Support</h4>
           <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact Support</a></li>
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</a></li>
             <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
           </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#EB664E]">Newsletter</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 transition-colors">Subscribe for curated itineraries.</p>
          <div className="flex max-w-xs">
            <input type="email" placeholder="Email Address" className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-l-lg outline-none text-sm w-full dark:text-white transition-all focus:border-[#EB664E]" />
            <button className="bg-[#0A1128] dark:bg-orange-500 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors hover:bg-black dark:hover:bg-orange-600">Join</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 dark:text-gray-400 transition-colors">
        <p className="text-center md:text-left">© 2026 Edge Tours and Travels. All rights reserved.</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</a>
          <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
          <p className="uppercase tracking-wide text-[10px] text-gray-400 dark:text-gray-600">
            Powered by{" "}
            <a href="https://pigo-pi.com/" target="_blank" rel="noopener noreferrer" className="font-extrabold text-violet-500 hover:text-violet-400 transition-colors normal-case">
              PigoPi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}