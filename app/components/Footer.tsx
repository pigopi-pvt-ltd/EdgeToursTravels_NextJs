"use client";

import { Send, Camera, Share2, Users } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white pt-24 pb-12 px-8 border-t border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-24">
        <div className="flex flex-col gap-6 max-w-xs transition-all hover:scale-105 duration-300">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-brand-primary">
            Voyager
          </Link>
          <p className="text-brand-primary/60 text-sm leading-relaxed">
            Elevating global travel through impeccable service and technological precision since 2014.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-12 flex-1">
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">About Us</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Fleet Gallery</Link>
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Travel Insurance</Link>
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Elite Membership</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Contact Support</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Careers</Link>
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Privacy Policy</Link>
              <Link href="#" className="text-brand-primary/60 hover:text-brand-secondary transition-colors text-sm">Terms of Service</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <h4 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em]">Newsletter</h4>
            <div className="flex flex-col gap-4">
              <p className="text-brand-primary/60 text-xs">Subscribe for curated itineraries.</p>
              <div className="flex items-center gap-2 p-1 pl-3 bg-gray-100 rounded-full border border-black/5 focus-within:ring-2 ring-brand-secondary transition-all">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-transparent border-none outline-none text-xs text-brand-primary placeholder:text-brand-primary/30 flex-1 min-w-0"
                />
                <button className="p-2 bg-brand-primary text-white rounded-full hover:bg-brand-secondary transition-all">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-xs text-brand-primary/40 font-medium">© 2026 Voyager Concierge. All rights reserved.</span>
        
        <div className="flex items-center gap-6">
          <Link href="#" className="text-brand-primary/40 hover:text-brand-primary transition-colors">
            <Camera size={18} />
          </Link>
          <Link href="#" className="text-brand-primary/40 hover:text-brand-primary transition-colors">
            <Share2 size={18} />
          </Link>
          <Link href="#" className="text-brand-primary/40 hover:text-brand-primary transition-colors">
            <Users size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
