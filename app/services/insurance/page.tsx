import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const coverage = [
  {
    title: 'Emergency Medical',
    limit: '$10,000,000',
    description: 'Worldwide inpatient and outpatient emergency care covered in full.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    title: 'Trip Cancellation',
    limit: '$50,000',
    description: 'Full reimbursement for non-refundable trips due to unexpected events.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v12a2 2 0 012 2z" />
      </svg>
    )
  },
  {
    title: 'Executive Protection',
    limit: 'Unlimited',
    description: 'Exclusive 24/7 security dispatch and geopolitical threat extraction.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

export default function InsurancePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A1128] flex flex-col pt-24 font-sans antialiased text-[#0A1128] dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50 dark:bg-slate-900/50 py-24 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Ultimate Protection</h4>
          <h1 className="text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-tight text-[#0A1128]">
            Comprehensive <br /><span className="text-blue-600 dark:text-blue-400">Travel Shield.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors">
            Travel the world with absolute confidence. Our insurance plans are tailored for the global elite, offering coverage that goes beyond standard policies.
          </p>
        </div>
      </section>

      {/* Coverage Grid */}
      <section className="py-24 bg-white dark:bg-[#0A1128] relative transition-colors">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {coverage.map((item, idx) => (
               <div key={idx} className="group bg-gray-50 dark:bg-slate-800/50 p-12 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 hover:bg-[#0A1128] dark:hover:bg-slate-800 hover:scale-105 transition-all duration-500">
                  <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-[#FFB800] mb-10 shadow-sm transition-transform duration-500 group-hover:rotate-12">
                     {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[#FFB800] uppercase tracking-widest mb-2">Limit: {item.limit}</h3>
                  <h2 className="text-2xl font-bold mb-6 group-hover:text-white transition-colors dark:text-white">{item.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 group-hover:text-gray-400 transition-colors leading-relaxed">
                     {item.description}
                  </p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-[#0A1128] text-white overflow-hidden relative">
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-light italic leading-relaxed">
               "Insurance shouldn't just be a safety net; it should be an enabler of bold journeys. With Edge Shield, we ensure you stay focused on the destination, not the risks."
            </h2>
            <div className="mt-8 flex justify-center items-center gap-4">
               <div className="w-12 h-12 bg-[#FFB800] rounded-full flex items-center justify-center text-[#0A1128] font-bold">VS</div>
               <div className="text-left">
                  <p className="font-bold">Vikram Singh</p>
                  <p className="text-xs text-gray-400">Head of Global Risk Management</p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
