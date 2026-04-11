'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiMapPin, HiCalendarDays, HiUser, HiPhone, HiChevronRight, HiCheckCircle, HiShieldCheck, HiCurrencyDollar, HiClock, HiSparkles, HiXMark } from 'react-icons/hi2';
import { submitBooking, BookingFormData } from '@/lib/bookForm';

const VEHICLE_DATA: Record<string, any> = {
    'swift-dzire': {
        name: 'Swift Dzire',
        category: 'Sedan',
        tagline: 'Reliable. Comfortable. Efficient.',
        description: 'Experience comfort and reliability with our Swift Dzire rental service. Perfect for city tours, airport transfers, and long-distance travel, this premium sedan combines fuel efficiency with a spacious interior.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            '/images/hero_bg.png',
            '/images/car2_bg.png'
        ],
        features: ['Spacious Boot Space', 'Reliable Safety (Airbags)', 'Comfortable Legroom', 'Anti-lock Braking (ABS)']
    },
    'hyundai-aura': {
        name: 'Hyundai Aura',
        category: 'Sedan',
        tagline: 'Sophistication meets Performance.',
        description: 'The Hyundai Aura stands out with its modern design and premium features. It offers a smooth, quiet ride with advanced safety technology and a high-tech cabin perfect for business and family travel.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop',
            '/images/car3_bg.png'
        ],
        features: ['Smart Infotainment', 'Cruise Control', 'Wireless Charging', 'LED Daytime Running Lights']
    },
    'honda-amaze': {
        name: 'Honda Amaze',
        category: 'Sedan',
        tagline: 'Spacious & Smart Choice.',
        description: 'The Honda Amaze offers a perfect balance of performance and space. Its compact dimensions make it ideal for city driving, while the surprisingly large cabin provides unmatched comfort for passengers.',
        images: [
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            '/images/hero_bg.png'
        ],
        features: ['Best-in-class Boot', 'Paddle Shifters (CVT)', 'Push Button Start', 'Reverse Parking Sensors']
    },
    'honda-city': {
        name: 'Honda City',
        category: 'Premium Sedan',
        tagline: 'The Legend of Luxury.',
        description: 'The Honda City is the gold standard for premium sedans. With its refined engine, plush leather interiors, and advanced safety features, it provides a level of luxury and status that is unparalleled in its segment.',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop',
            '/images/car2_bg.png'
        ],
        features: ['Sunroof', 'Leather Upholstery', '6 Airbags', 'LaneWatch Camera']
    },
    'maruti-suzuki-ciaz': {
        name: 'Maruti Suzuki Ciaz',
        category: 'Executive Sedan',
        tagline: 'Experience Granduer & Efficiency.',
        description: 'The Ciaz offers massive rear-seat legroom and an executive look that commands respect. Its hybrid technology ensures great efficiency without compromising on performance or comfort, making it perfect for corporate travel.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            '/images/car3_bg.png'
        ],
        features: ['Massive Rear Legroom', 'Smart Hybrid Tech', 'Rear AC Vents', 'Cruise Control']
    }
};

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const vehicle = VEHICLE_DATA[slug] || VEHICLE_DATA['swift-dzire']; // Default to swift-dzire if not found

    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('rental');

    // Booking Form State
    const [formData, setFormData] = useState<BookingFormData>({
        from: '',
        destination: '',
        dateTime: '',
        name: '',
        contact: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            const result = await submitBooking(formData);
            if (result.success) {
                setStatus({ type: 'success', message: result.message });
                setFormData({ from: '', destination: '', dateTime: '', name: '', contact: '' });
                // Redirect to admin bookings page
                router.push('/admin-dashboard/bookings');
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            <section className="pt-32 pb-12 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-[#0A1128] tracking-tight uppercase">
                        {vehicle.name.split(' ')[0]} <span className="text-[#EB664E]">{vehicle.name.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
                        <span>{vehicle.category}</span>
                        <HiChevronRight />
                        <span>{vehicle.tagline}</span>
                    </div>
                </div>
            </section>

            <section className="py-16 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[16/9] bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl group">
                            <img 
                                src={vehicle.images[activeImage]} 
                                alt={vehicle.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {vehicle.images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative w-24 md:w-32 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                                        activeImage === idx ? 'border-[#EB664E] shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="bg-[#0A1128] rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(10,17,40,0.4)] text-white border border-white/5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                            
                            <h3 className="text-2xl font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Book Your Ride</h3>
                            
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                        <HiMapPin className="text-[#EB664E]" /> From (City / Airport)
                                    </label>
                                    <input 
                                        type="text" 
                                        name="from"
                                        value={formData.from}
                                        onChange={handleChange}
                                        placeholder="Enter pick-up location" 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10 outline-none transition-all" 
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                        <HiMapPin className="text-blue-400" /> Destination
                                    </label>
                                    <input 
                                        type="text" 
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        placeholder="Enter drop-off location" 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10 outline-none transition-all" 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                        <HiCalendarDays className="text-[#EB664E]" /> Date & Time
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        name="dateTime"
                                        value={formData.dateTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10 outline-none transition-all appearance-none" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                            <HiUser className="text-[#EB664E]" /> Name
                                        </label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10 outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                            <HiPhone className="text-[#EB664E]" /> Contact
                                        </label>
                                        <input 
                                            type="tel" 
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            placeholder="Phone number" 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10 outline-none transition-all" 
                                        />
                                    </div>
                                </div>

                                {status.message && (
                                    <div className={`text-xs font-bold text-center p-3 rounded-xl ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {status.message}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[#EB664E] hover:bg-[#d55a45] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-95 group flex items-center justify-center gap-3 mt-4 disabled:opacity-70"
                                >
                                    <span>{isSubmitting ? 'Sending...' : 'Submit Request'}</span>
                                    {!isSubmitting && <HiChevronRight className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex border-b border-gray-100 mb-12">
                        <button onClick={() => setActiveTab('rental')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'rental' ? 'text-[#EB664E]' : 'text-gray-400 hover:text-gray-600'}`}>Rental Details {activeTab === 'rental' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB664E]" />}</button>
                        <button onClick={() => setActiveTab('vehicle')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'vehicle' ? 'text-[#EB664E]' : 'text-gray-400 hover:text-gray-600'}`}>Vehicle Details {activeTab === 'vehicle' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB664E]" />}</button>
                    </div>

                    <div className="space-y-12">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-black text-[#0A1128] uppercase tracking-tight mb-6">{vehicle.name} Rental Service</h2>
                            <p className="text-gray-500 leading-relaxed font-medium">{vehicle.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 hover:shadow-xl transition-all group">
                                <HiCheckCircle className="text-3xl text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] uppercase tracking-wider mb-4">Travel Inclusions</h4>
                                <ul className="space-y-3 text-sm text-gray-600 font-bold">
                                    <li className="flex items-center gap-2">• Clean & Sanitized Vehicle</li>
                                    <li className="flex items-center gap-2">• Experienced Chauffeur</li>
                                    <li className="flex items-center gap-2">• Fuel & Maintenance</li>
                                    <li className="flex items-center gap-2">• All Tolls & State Taxes</li>
                                </ul>
                            </div>
                            
                            <div className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100/50 hover:shadow-xl transition-all group">
                                <HiSparkles className="text-3xl text-[#EB664E] mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] uppercase tracking-wider mb-4">Amenities</h4>
                                <ul className="space-y-3 text-sm text-gray-600 font-bold">
                                    <li className="flex items-center gap-2">• Air Conditioning</li>
                                    <li className="flex items-center gap-2">• Music System (BT/Aux)</li>
                                    <li className="flex items-center gap-2">• Mobile Charging Points</li>
                                    <li className="flex items-center gap-2">• Newspaper & Water</li>
                                </ul>
                            </div>

                            <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50 hover:shadow-xl transition-all group">
                                <HiShieldCheck className="text-3xl text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] uppercase tracking-wider mb-4">Features</h4>
                                <ul className="space-y-3 text-sm text-gray-600 font-bold">
                                    {vehicle.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2">• {f}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#0A1128] text-white">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Why Ride with Vivek Travels?</h2>
                        <div className="w-24 h-1 bg-[#EB664E] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: HiShieldCheck, title: 'Safety First', desc: 'Verified drivers and GPS tracked vehicles for your total peace of mind.' },
                            { icon: HiCurrencyDollar, title: 'Transparent Pricing', desc: 'No hidden costs. What you see during booking is what you pay.' },
                            { icon: HiClock, title: 'Customer Support', desc: 'Our dedicated team is available 24/7 to assist with your travel needs.' },
                            { icon: HiCheckCircle, title: 'Flexible Packages', desc: 'Customizable travel plans to fit your schedule and budget.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all cursor-default group hover:-translate-y-2">
                                <item.icon className="text-4xl text-[#EB664E] mb-6 group-hover:scale-110 transition-all" />
                                <h4 className="text-lg font-black uppercase tracking-wider mb-3">{item.title}</h4>
                                <p className="text-white/60 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
