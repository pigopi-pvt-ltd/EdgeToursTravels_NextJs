"use client";

import { CheckCircle, Shield, Clock, Globe } from "lucide-react";
import Image from "next/image";

export default function Reliability() {
  return (
    <section className="py-32 px-8 max-w-7xl mx-auto bg-[#fafafa]">
      <div className="text-center mb-24">
        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.4em] mb-4 block">The Voyager Standard</span>
        <h2 className="text-5xl font-bold text-brand-primary">Redefining Reliability</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Large Precision Card */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-[40px] p-12 shadow-sm border border-black/5 flex flex-col justify-between hover:shadow-xl transition-all h-[520px]">
          <div className="flex flex-col gap-6">
            <div className="w-14 h-14 bg-blue-100/50 rounded-2xl flex items-center justify-center text-brand-primary">
              <Shield size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-brand-primary mb-4 tracking-tight">Unmatched Precision</h3>
              <p className="text-brand-primary/60 text-lg leading-relaxed max-w-md italic">
                &ldquo;Our logistics engine tracks every flight and traffic pattern in real-time. Whether it&apos;s a 3 AM arrival or a last-minute schedule shift, your Voyager concierge is already two steps ahead.&rdquo;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-10 border-t border-black/5">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                   <div className="absolute inset-0 bg-blue-400 opacity-20" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-brand-primary/40 tracking-tight">Joined by 10,000+ Frequent Travelers</span>
          </div>
        </div>

        {/* Small Elite Card */}
        <div className="bg-brand-primary rounded-[40px] p-10 flex flex-col justify-between gap-12 group hover:scale-[1.02] transition-transform relative overflow-hidden">
           <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Elite Fleet Options</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  From zero-emission luxury sedans to heavy-lift private jets, our global inventory is the widest in the industry.
                </p>
              </div>
           </div>
           <div className="relative z-10 w-full h-24 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl flex items-center justify-center text-white/40">
              <span className="text-4xl">✈️</span>
           </div>
           {/* Abstract Circle Grid in bg */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Small Human Only Card */}
        <div className="flex flex-col gap-8">
            <div className="bg-brand-secondary rounded-[40px] p-10 flex-1 flex flex-col items-center justify-center text-center gap-4 hover:bg-brand-secondary/90 transition-colors cursor-pointer group">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <Shield size={24} />
               </div>
               <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-brand-primary whitespace-nowrap">Human-Only</h4>
                  <p className="text-brand-primary/60 text-xs">24/7 dedicated personal agents.</p>
               </div>
            </div>
            
            <div className="bg-gray-200/50 rounded-[40px] p-10 flex-1 flex flex-col items-center justify-center text-center gap-4 hover:bg-gray-200/80 transition-colors cursor-pointer group">
               <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-brand-primary group-hover:rotate-12 transition-transform">
                  <Clock size={24} />
               </div>
               <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-brand-primary whitespace-nowrap">120+ Cities</h4>
                  <p className="text-brand-primary/60 text-xs">Localized expertise everywhere.</p>
               </div>
            </div>
        </div>
      </div>
    </section>
  );
}
