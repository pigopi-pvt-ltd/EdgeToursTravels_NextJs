'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VEHICLE_DATA } from '@/lib/fleetData';
import { HiChevronRight, HiStar } from 'react-icons/hi2';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = use(params);
    const category = resolvedParams.category;

    // Filter vehicles by category
    const vehicles = Object.entries(VEHICLE_DATA)
        .filter(([_, data]) => data.category === category)
        .map(([slug, data]) => ({ slug, ...data }));

    const categoryTitles: Record<string, string> = {
        'sedans': 'Comfortable Sedans',
        'suv-muvs': 'SUV & MUV Fleet',
        'luxury-cars': 'Luxury & Premium Cars',
        'van': 'Tempo Travellers & Urbania',
        'ev-cars': 'Electric Vehicle Fleet',
        'luxury-buses': 'Luxury Coaches & Buses'
    };

    const title = categoryTitles[category] || 'Our Fleet';

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 bg-[#0A1128] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#EB664E] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                        {title.split(' ')[0]} <span className="text-[#EB664E]">{title.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Explore our premium range of vehicles in the {category.replace('-', ' ')} category. 
                        Safe, reliable, and comfortable rides for every journey.
                    </p>
                </div>
            </section>

            {/* Vehicle Grid */}
            <section className="py-24 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                            <Link 
                                href={`/fleet/${category}/${vehicle.slug}`} 
                                key={vehicle.slug}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
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
                                        {[...Array(5)].map((_, i) => <HiStar key={i} className="w-3.5 h-3.5 fill-current" />)}
                                        <span className="text-gray-400 text-[10px] font-bold ml-1 uppercase">Top Rated</span>
                                    </div>
                                    
                                    <h3 className="text-2xl font-black text-[#0A1128] uppercase tracking-tight mb-2 group-hover:text-[#EB664E] transition-colors">{vehicle.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2">{vehicle.tagline}</p>
                                    
                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate Starts</span>
                                            <span className="text-[#0A1128] font-black text-lg">{vehicle.price}</span>
                                        </div>
                                        
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0A1128] group-hover:bg-[#EB664E] group-hover:text-white transition-all transform group-hover:rotate-45">
                                            <HiChevronRight className="text-xl" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <h3 className="text-2xl font-black text-gray-300 uppercase">Coming Soon</h3>
                            <p className="text-gray-400 mt-2">We are adding more vehicles to this category. Please check back later.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
