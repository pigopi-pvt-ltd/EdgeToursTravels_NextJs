"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-8 transition-all duration-300">
      <div className="flex-1">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-white italic">
          Voyager
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-center gap-10 flex-1">
        <Link href="#" className="text-sm font-bold text-white hover:text-brand-secondary transition-all uppercase tracking-widest px-2">Cabs</Link>
        <Link href="#" className="text-sm font-bold text-white hover:text-brand-secondary transition-all uppercase tracking-widest px-2">Flights</Link>
        <Link href="#" className="text-sm font-bold text-white hover:text-brand-secondary transition-all uppercase tracking-widest px-2">Hotels</Link>
        <Link href="#" className="text-sm font-bold text-white hover:text-brand-secondary transition-all uppercase tracking-widest px-2">Insurance</Link>
        <Link href="#" className="text-sm font-bold text-white hover:text-brand-secondary transition-all uppercase tracking-widest px-2">Fleet</Link>
      </div>

      <div className="flex-1 flex items-center justify-end gap-8">
        <Link href="#" className="text-sm font-bold text-white/80 hover:text-white transition-colors">
          Support
        </Link>
        <button className="px-8 py-3 bg-white text-brand-primary rounded-full text-sm font-bold hover:bg-brand-secondary hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95">
          Sign In
        </button>
      </div>
    </nav>
  );
}
