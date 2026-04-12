'use client';

import React from 'react';
import Link from 'next/link';
import { HiArrowRight, HiStar, HiChevronRight } from 'react-icons/hi2';
import { getAllVehicles } from '@/lib/fleetData';

export default function FleetShowcase() {
    // Select a few premium vehicles for showcase
    const showcaseVehicles = getAllVehicles().filter(v => 
        ['swift-dzire', 'fortuner', 'innova-crysta', 'e-class', 'tempo-traveller', 'ioniq-5'].includes(v.slug)
    );

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-[#EB664E] font-black uppercase tracking-[0.3em] text-[10px]">Premium Selection</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#0A1128] uppercase tracking-tighter">Explore Our <span className="text-[#EB664E]">Verified</span> Fleet</h2>
                    </div>
                    <a href="/fleet/sedans" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#EB664E] transition-colors">
                        View Full Fleet <HiArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {showcaseVehicles.map((vehicle) => (
                        <a 
                            href={`/fleet/${vehicle.category}/${vehicle.slug}`} 
                            key={vehicle.slug}
                            className="group bg-gray-50 rounded-[2.5rem] overflow-hidden border border-transparent hover:border-[#EB664E]/20 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img 
                                    src={vehicle.images[0]} 
                                    alt={vehicle.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#0A1128] shadow-sm">
                                    {vehicle.type}
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-1 mb-3 text-orange-400">
                                    {[...Array(5)].map((_, i) => <HiStar key={i} className="w-3 h-3 fill-current" />)}
                                </div>
                                
                                <h3 className="text-xl font-black text-[#0A1128] uppercase tracking-tight mb-2 group-hover:text-[#EB664E] transition-colors">{vehicle.name}</h3>
                                <p className="text-gray-500 text-xs font-medium mb-6 line-clamp-2">{vehicle.tagline}</p>
                                
                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rate Starts</span>
                                        <span className="text-[#0A1128] font-black text-base">{vehicle.price}</span>
                                    </div>
                                    
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0A1128] group-hover:bg-[#EB664E] group-hover:text-white transition-all transform group-hover:rotate-45 shadow-sm">
                                        <HiChevronRight className="text-lg" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}