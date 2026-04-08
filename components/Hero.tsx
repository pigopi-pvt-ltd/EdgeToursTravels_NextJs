'use client';

import React, { useState, useEffect } from 'react';

const images = [
  '/images/hero_bg.png',
  '/images/car2_bg.png',
  '/images/car3_bg.png'
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative h-[650px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {images.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${index === currentIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
            style={{
              backgroundImage: `url('${img}')`,
              transition: 'opacity 2000ms ease-in-out, transform 10000ms linear'
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl w-full mt-24">
        {/* <div className="mb-12"> */}
        {/* <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl uppercase leading-tight">
            Experience the <span className="text-[#EB664E]">Edge</span> <br /> of Elite Travel
          </h1> */}
        {/* <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            Unparalleled luxury transportation and bespoke world-class travel packages tailored for global citizens.
          </p> */}
        {/* </div> */}

        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-8 w-full max-w-5xl mx-auto text-left border border-white/30 transform transition-all">
          <div className="flex justify-between border-b border-gray-100 pb-3 mb-8 px-4">
            {['Cabs', 'Luxury Cabs', 'Suvs', 'Packages'].map((tab, idx) => (
              <button
                key={tab}
                className={`flex-1 text-center py-3 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${idx === 0
                  ? 'text-[#EB664E] after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:w-full after:h-1 after:bg-[#EB664E]'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-2 items-end">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:border-[#EB664E] focus-within:ring-1 focus-within:ring-[#EB664E]/20 transition-all">
              <label className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest">Pick-up Location</label>
              <input type="text" placeholder="Enter city or airport" className="w-full bg-transparent outline-none text-sm font-bold text-[#0A1128] placeholder:text-gray-300" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:border-[#EB664E] focus-within:ring-1 focus-within:ring-[#EB664E]/20 transition-all">
              <label className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest">Drop-off Location</label>
              <input type="text" placeholder="Destination" className="w-full bg-transparent outline-none text-sm font-bold text-[#0A1128] placeholder:text-gray-300" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:border-[#EB664E] focus-within:ring-1 focus-within:ring-[#EB664E]/20 transition-all">
              <label className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest">Date & Time</label>
              <input type="text" placeholder="Select Date" className="w-full bg-transparent outline-none text-sm font-bold text-[#0A1128] placeholder:text-gray-300" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm focus-within:border-[#EB664E] focus-within:ring-1 focus-within:ring-[#EB664E]/20 transition-all">
              <label className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest">Passenger</label>
              <select className="w-full bg-transparent outline-none text-sm font-bold text-[#0A1128] appearance-none cursor-pointer">
                <option>1 Pax</option>
                <option>2 Pax</option>
                <option>3+ Pax</option>
              </select>
            </div>
            <div>
              <button className="w-full bg-[#EB664E] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-orange-500/40 hover:bg-[#d55a45] transition-all transform hover:scale-[1.02] active:scale-95 group">
                Search <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex ? 'bg-[#EB664E] w-12' : 'bg-white/30 hover:bg-white/60 w-6'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </header>
  );
}

export default Hero;