import React from 'react';
import { HiMapPin, HiCalendarDays, HiShieldCheck, HiCreditCard } from 'react-icons/hi2';

const TIPS = [
  {
    icon: HiMapPin,
    title: 'Plan your Travels',
    desc: 'We provide you the tour package as per your dream plan which is only one step far from your amazing voyages because we sell memories.'
  },
  {
    icon: HiCalendarDays,
    title: 'Check Availability',
    desc: 'Travels Mantra refine the best hotels, flights, Cruise tours for your favorite destination. We provide you the tour packages to our customers demands.'
  },
  {
    icon: HiShieldCheck,
    title: 'Get Insurance',
    desc: 'We are the best travel insurance plan for your next trip. If you still can\'t find the right plan? Give us a call on 1800-2121-225 - we\'ll help you out.'
  },
  {
    icon: HiCreditCard,
    title: 'Secure your Bookings',
    desc: 'After making the payments we will proceed your booking accordingly & will send your all vouchers as soon as possible on your mail id.'
  }
];

export default function TravelGuide() {
  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/3] group">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2070" 
            alt="Edge Luxury Bus" 
            loading="eager"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        </div>

        <div>
          <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 block">Get to Know Us</span>
          <h2 className="text-4xl font-black text-[#0A1128] uppercase tracking-tight mb-12">Travel Guide and Tips</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {TIPS.map((tip, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#EB664E] shadow-sm">
                  <tip.icon className="text-2xl" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-[#0A1128] uppercase tracking-wider">{tip.title}</h3>
                  <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
