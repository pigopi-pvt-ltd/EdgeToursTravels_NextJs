"use client";

import Image from "next/image";
import BookingWidget from "./BookingWidget";

export default function Hero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero_bg.png"
          alt="Luxury Forest Background"
          fill
          className="object-cover scale-105 animate-slow-zoom"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/40 via-transparent to-bg-light/90" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center flex flex-col items-center gap-12">
        <div className="flex flex-col gap-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Travel with <span className="text-brand-secondary drop-shadow-xl">Absolute Authority.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed drop-shadow-md">
            The world&apos;s most refined booking engine for global elites. 
            Seamless transitions from tarmac to penthouse.
          </p>
        </div>

        <BookingWidget />
      </div>
    </section>
  );
}
