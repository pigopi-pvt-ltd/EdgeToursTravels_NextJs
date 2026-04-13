"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BuildPackagePage() {
  const [step, setStep] = useState(1);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A1128] flex flex-col pt-24 font-sans antialiased text-[#0A1128] dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50 dark:bg-slate-900/50 py-32 border-b border-gray-100 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#0A1128]/5 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Besopke Journeys</h4>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 tracking-tighter leading-tight">
            Architect Your <br /><span className="text-[#0A1128] dark:text-white transition-colors">Perfect Journey.</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors">
            Your journey should be as unique as you are. Use our architect to build a custom travel experience that fits your exact needs.
          </p>
        </div>
      </section>

      {/* Interactive Builder Container */}
      <section className="max-w-7xl mx-auto px-6 py-24 -mt-20 relative z-20 transition-colors">
         <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl shadow-[#0A1128]/10 dark:shadow-none overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
               <div className="bg-[#0A1128] p-12 text-white flex flex-col justify-between">
                  <div>
                     <h3 className="text-2xl font-bold mb-8">Architect Steps</h3>
                     <div className="space-y-8">
                        <div className={`flex items-center gap-6 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                           <span className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center font-bold">01</span>
                           <div>
                              <p className="font-bold">Destination</p>
                              <p className="text-[10px] uppercase tracking-widest text-[#FFB800]">Global Coverage</p>
                           </div>
                        </div>
                        <div className={`flex items-center gap-6 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>
                           <span className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center font-bold">02</span>
                           <div>
                              <p className="font-bold">The Fleet</p>
                              <p className="text-[10px] uppercase tracking-widest text-[#FFB800]">Unmatched Variety</p>
                           </div>
                        </div>
                        <div className={`flex items-center gap-6 transition-opacity ${step === 3 ? 'opacity-100' : 'opacity-30'}`}>
                           <span className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center font-bold">03</span>
                           <div>
                              <p className="font-bold">Experience</p>
                              <p className="text-[10px] uppercase tracking-widest text-[#FFB800]">Endless Options</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="pt-8 border-t border-white/10">
                     <p className="text-xs text-gray-400 italic">"Design a journey that reflects your stature and requirements."</p>
                  </div>
               </div>
               
               <div className="col-span-2 p-12 lg:px-20 lg:py-16 bg-white dark:bg-slate-800 overflow-hidden transition-colors">
                  {step === 1 && (
                      <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                        <h2 className="text-3xl font-bold mb-4 dark:text-white transition-colors">Start with the Destination</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Where should your journey begin?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                           {['Manali', 'Kashmir', 'Amalfi Coast', 'New Delhi (NCR)', 'Global'].map((city, idx) => (
                              <button key={idx} onClick={() => setStep(2)} className="w-full bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl hover:bg-[#0A1128] dark:hover:bg-[#FFB800] hover:text-white dark:hover:text-[#0A1128] transition-all text-left font-bold flex justify-between items-center group">
                                 {city}
                                 <svg className="w-4 h-4 text-transparent group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                   {step === 2 && (
                     <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                        <h2 className="text-3xl font-bold mb-4 dark:text-white transition-colors">Choose Your Fleet</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Select the mode of transport that suits your style.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {['Executive Sedan', 'SUV Fleet', 'Private Jet Charter', 'Luxury Yacht'].map((fleet, idx) => (
                              <button key={idx} onClick={() => setStep(3)} className="w-full bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl hover:bg-[#0A1128] dark:hover:bg-[#FFB800] hover:text-white dark:hover:text-[#0A1128] transition-all text-left font-bold flex justify-between items-center group">
                                 {fleet}
                                 <svg className="w-4 h-4 text-transparent group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                              </button>
                           ))}
                        </div>
                         <button onClick={() => setStep(1)} className="mt-10 text-[#0A1128] dark:text-[#FFB800] font-bold text-sm underline underline-offset-4 decoration-[#FFB800] transition-colors">← Go back</button>
                     </div>
                  )}

                    {step === 3 && (
                     <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                        <h2 className="text-3xl font-bold mb-4 dark:text-white transition-colors">Finalizing the Experience</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors">Provide your details to receive your custom quote.</p>
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                                  <input type="text" placeholder="John Doe" className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Phone Number</label>
                                  <input type="tel" placeholder="+91 98XXX XXXXX" className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none" />
                               </div>
                           </div>
                            <button onClick={() => alert('Architect Submission Successful')} className="w-full bg-[#0A1128] dark:bg-[#FFB800] text-white dark:text-[#0A1128] py-6 rounded-2xl font-black shadow-xl shadow-blue-900/10 dark:shadow-orange-500/10 hover:bg-black dark:hover:bg-orange-400 transition-all active:scale-95">
                               Generate Proposal
                            </button>
                        </div>
                         <button onClick={() => setStep(2)} className="mt-10 text-[#0A1128] dark:text-[#FFB800] font-bold text-sm underline underline-offset-4 decoration-[#FFB800] transition-colors">← Go back</button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
