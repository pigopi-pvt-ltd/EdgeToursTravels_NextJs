import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const values = [
  {
    title: 'Excellence',
    description: 'We strive for perfection in every booking and every mile traveled.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
      </svg>
    )
  },
  {
    title: 'Security',
    description: "Your safety and privacy are our highest priorities, always.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: 'Precision',
    description: 'Real-time logistics and meticulous planning for total peace of mind.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col pt-24 font-sans antialiased text-[#0A1128]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50 py-32 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#0A1128]/5 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4 italic">Defining the Standard</h4>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 tracking-tighter leading-tight">
            Journey Beyond <br /><span className="text-[#0A1128]">Expectations.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Edge Tours & Travels was founded on a simple principle: to provide unparalleled travel management services for the global elite.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
                 <img src="/images/hero_bg.png" className="w-full h-full object-cover" alt="Elite Fleet" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#0A1128] rounded-[2rem] p-8 text-white hidden md:flex flex-col justify-end shadow-2xl">
                 <h3 className="text-4xl font-bold mb-2">10+</h3>
                 <p className="text-sm font-medium text-gray-400">Years of redefining global travel standards.</p>
              </div>
           </div>
           <div>
              <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Our Story</h4>
              <h2 className="text-4xl font-bold mb-8 leading-tight">Founded on Precision and Powered by Passion.</h2>
              <div className="space-y-6 text-gray-500 leading-relaxed">
                 <p>
                    Started in 2014, Edge Tours & Travels began as a boutique concierge service for corporate executives in New Delhi. Over the decade, we've expanded our horizons to become a global leader in VIP travel and fleet management.
                 </p>
                 <p>
                    Today, we manage a diverse portfolio of services ranging from government-grade security transfers to bespoke luxury island retreats. Our commitment to discretion, safety, and comfort remains unchanged.
                 </p>
                 <div className="pt-8 grid grid-cols-2 gap-8 border-t border-gray-100">
                    <div>
                       <h5 className="font-bold text-[#0A1128] mb-1">Global Network</h5>
                       <p className="text-sm">50+ Major Cities Covered</p>
                    </div>
                    <div>
                       <h5 className="font-bold text-[#0A1128] mb-1">Executive Fleet</h5>
                       <p className="text-sm">Managed & Maintained Daily</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[#0A1128] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Our DNA</h4>
             <h2 className="text-4xl font-bold mb-4">Values that Drive Us</h2>
             <p className="text-gray-400 max-w-xl mx-auto">The principles that guide every decision we make and every journey we plan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-lg p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 bg-[#FFB800] rounded-2xl flex items-center justify-center text-[#0A1128] mb-8 shadow-lg shadow-yellow-500/10">
                   {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Vision */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                 <h2 className="text-4xl font-bold mb-8">Vision for the 21st Century</h2>
                 <p className="text-gray-500 text-lg mb-10 leading-relaxed italic">
                    "We don't just move people; we move expectations. Our vision is to become the invisible hand that makes travel perfectly seamless for the world's decision-makers."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-1 bg-[#FFB800]"></div>
                    <span className="font-bold text-[#0A1128] uppercase tracking-widest text-sm">The Edge Leadership</span>
                 </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 gap-4">
                 {[
                    { year: '2014', event: 'Founded in New Delhi' },
                    { year: '2017', event: 'Inaugural Executive Fleet Launch' },
                    { year: '2020', event: 'Global Hub Expansion' },
                    { year: '2024', event: 'Digital Concierge Integration' }
                 ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl flex items-center gap-8 border border-gray-100 group hover:border-[#FFB800] transition-colors">
                       <span className="text-2xl font-black text-[#0A1128]/10 group-hover:text-[#FFB800] transition-colors">{item.year}</span>
                       <span className="font-bold text-gray-700">{item.event}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="bg-[#FFB800] rounded-[3rem] p-12 lg:p-24 text-[#0A1128] text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A1128] rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                 <h2 className="text-4xl lg:text-5xl font-bold mb-8 italic">Ready to experience the Edge?</h2>
                 <p className="text-[#0A1128]/70 max-w-xl mx-auto mb-10 text-lg font-medium">
                    Let us handle the details while you focus on what matters most. Your journey of a thousand miles begins with a single, flawless booking.
                 </p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="w-full sm:w-auto bg-[#0A1128] text-white px-12 py-5 rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1">
                       Get Started
                    </button>
                    <button className="w-full sm:w-auto bg-white/20 border-2 border-[#0A1128]/10 text-[#0A1128] px-12 py-5 rounded-2xl font-bold hover:bg-white transition-all">
                       View Fleet
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
