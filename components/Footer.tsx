import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <img src="/images/logo.png" alt="Edge Tours & Travels" className="h-10 w-auto object-contain mb-4" />
          <p className="text-xs text-gray-400 leading-relaxed">
            Elevating global travel through impeccable service and technological precision since 2014.
          </p>
        </div>
        <div>
           <ul className="space-y-3 text-sm text-gray-500 font-medium">
             <li><a href="#" className="hover:text-black">About Us</a></li>
             <li><a href="#" className="hover:text-black">Fleet Gallery</a></li>
             <li><a href="#" className="hover:text-black">Travel Insurance</a></li>
           </ul>
        </div>
        <div>
           <ul className="space-y-3 text-sm text-gray-500 font-medium">
             <li><a href="#" className="hover:text-black">Contact Support</a></li>
             <li><a href="#" className="hover:text-black">Careers</a></li>
             <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
           </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0A1128] mb-4">Newsletter</h4>
          <p className="text-xs text-gray-400 mb-3">Subscribe for curated itineraries.</p>
          <div className="flex">
            <input type="email" placeholder="Email Address" className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-l-lg outline-none text-sm w-full" />
            <button className="bg-[#0A1128] text-white px-4 py-2 rounded-r-lg text-sm font-medium">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <p>© 2026 Edge Tours and Travels. All rights reserved.</p>
        <div className="flex space-x-4">
           <a href="#" className="hover:text-black">IG</a>
           <a href="#" className="hover:text-black">TW</a>
           <a href="#" className="hover:text-black">IN</a>
        </div>
      </div>
    </footer>
  );
}