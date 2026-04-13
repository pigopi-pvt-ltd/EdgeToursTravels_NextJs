import React from 'react';

const OFFERS = [
  {
    title: 'Chauffeured Vehicle Rentals',
    desc: 'Chauffeured sedans and SUVs for every travel requirement.',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'Luxury & Corporate Bus Rentals',
    desc: 'Comfortable buses for group travel, tours and charter events.',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Wedding Transportation Solutions',
    desc: 'A range of elegant options for a seamless and memorable day.',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'VIP & Delegate Travel Services',
    desc: 'Luxury vehicles for stylish and on-time arrivals.',
    img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'MICE Transport',
    desc: 'Reliable transport for groups attending meetings, conferences, and exhibitions.',
    img: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1926&auto=format&fit=crop'
  }
];

export default function WhatWeOffer() {
  return (
    <section className="py-24 bg-white dark:bg-[#0A1128] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-[#0A1128] dark:text-white uppercase tracking-tight">What We Offer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {OFFERS.map((offer, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="relative aspect-video w-full mb-6 rounded-2xl overflow-hidden shadow-lg group">
                <img src={offer.img} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="bg-[#F8F9FA] dark:bg-slate-800/50 p-6 rounded-2xl text-center flex-grow flex flex-col justify-center min-h-[160px] border border-gray-100 dark:border-slate-800 transition-colors">
                <h3 className="text-sm font-black text-blue-900 dark:text-orange-400 uppercase tracking-widest mb-3 leading-tight transition-colors">{offer.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed transition-colors">{offer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
