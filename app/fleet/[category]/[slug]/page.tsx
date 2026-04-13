'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiMapPin, HiCalendarDays, HiUser, HiPhone, HiChevronRight, HiCheckCircle, HiShieldCheck, HiCurrencyDollar, HiClock, HiSparkles, HiXMark, HiCheck } from 'react-icons/hi2';
import { submitBooking, BookingFormData } from '@/lib/bookForm';

import { VEHICLE_DATA } from '@/lib/fleetData';
import DateTimePicker from '@/components/DateTimePicker';


export default function VehicleDetailPage({ params }: { params: Promise<{ category: string, slug: string }> }) {
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
        price: vehicle.price || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.from) newErrors.from = 'Pick-up location is required';
        if (!formData.destination) newErrors.destination = 'Destination is required';

        if (!formData.dateTime) {
            newErrors.dateTime = 'Date and time is required';
        } else {
            const selectedDate = new Date(formData.dateTime);
            if (selectedDate < new Date()) {
                newErrors.dateTime = 'Cannot select a past date';
            }
        }

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Please enter your full name';
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.contact || !phoneRegex.test(formData.contact)) {
            newErrors.contact = 'Enter a valid 10-digit number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setStatus({ type: 'error', message: 'Please correct the highlighted errors.' });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            const result = await submitBooking(formData);
            if (result.success) {
                setStatus({ type: 'success', message: result.message });
                setFormData({ from: '', destination: '', dateTime: '', name: '', contact: '', price: vehicle.price || '' });
                // Redirect or show success
                // router.push('/admin-dashboard/bookings');
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-dismiss notification
    React.useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => {
                setStatus({ type: null, message: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status.message]);

    const categoryDisplayNames: Record<string, string> = {
        'sedans': 'SEDANS',
        'suv-muvs': 'SUV/MUVS',
        'luxury-cars': 'LUXURY CARS',
        'van': 'VAN',
        'ev-cars': 'EV CARS',
        'luxury-buses': 'LUXURY BUSES'
    };

    const categoryName = categoryDisplayNames[resolvedParams.category] || resolvedParams.category.toUpperCase();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0A1128] transition-colors duration-300">
            <Navbar />

            <section className="pt-32 pb-12 bg-white dark:bg-[#0A1128] border-b border-gray-100 dark:border-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-[#0A1128] dark:text-white tracking-tight uppercase transition-colors">
                        {vehicle.name.split(' ')[0]} <span className="text-[#EB664E]">{vehicle.name.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] transition-colors">
                        <span className="hover:text-[#EB664E] cursor-pointer transition-colors" onClick={() => router.push(`/fleet/${resolvedParams.category}`)}>{categoryName}</span>
                        <HiChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-700" />
                        <span className="text-gray-400 dark:text-gray-500">{vehicle.tagline}</span>
                    </div>
                </div>
            </section>

            <section className="py-16 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[16/9] bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-2xl group transition-colors">
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
                                    className={`relative w-24 md:w-32 aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#EB664E] shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
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
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${errors.from ? 'text-red-400' : 'text-white/50'}`}>
                                        <HiMapPin className={errors.from ? 'text-red-400' : 'text-[#EB664E]'} /> From (City / Airport)
                                    </label>
                                    <input
                                        type="text"
                                        name="from"
                                        value={formData.from}
                                        onChange={handleChange}
                                        onBlur={() => validateForm()}
                                        placeholder="Enter pick-up location"
                                        className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-300 ${errors.from ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10'}`}
                                    />
                                    {errors.from && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-left-2">{errors.from}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${errors.destination ? 'text-red-400' : 'text-white/50'}`}>
                                        <HiMapPin className={errors.destination ? 'text-red-400' : 'text-blue-400'} /> Destination
                                    </label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={formData.destination}
                                        onChange={handleChange}
                                        onBlur={() => validateForm()}
                                        placeholder="Enter drop-off location"
                                        className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-300 ${errors.destination ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10'}`}
                                    />
                                    {errors.destination && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-left-2">{errors.destination}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${errors.dateTime ? 'text-red-400' : 'text-white/50'}`}>
                                        <HiCalendarDays className={errors.dateTime ? 'text-red-400' : 'text-[#EB664E]'} /> Travel Date & Time
                                    </label>
                                    <div className="relative group/date">
                                        <input
                                            type="datetime-local"
                                            name="dateTime"
                                            value={formData.dateTime}
                                            onChange={handleChange}
                                            onBlur={() => validateForm()}
                                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all appearance-none relative z-10 ${errors.dateTime ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10'}`}
                                        />
                                        
                                        {formData.dateTime && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 animate-in zoom-in duration-300">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        (document.activeElement as HTMLElement)?.blur();
                                                        validateForm();
                                                    }}
                                                    className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
                                                >
                                                    OK <HiCheck className="text-sm" />
                                                </button>
                                            </div>
                                        )}

                                        {!formData.dateTime && (
                                            <HiClock className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-hover/date:text-[#EB664E] transition-colors z-0" />
                                        )}
                                    </div>
                                    {errors.dateTime && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-left-2">{errors.dateTime}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${errors.name ? 'text-red-400' : 'text-white/50'}`}>
                                            <HiUser className={errors.name ? 'text-red-400' : 'text-[#EB664E]'} /> Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={() => validateForm()}
                                            placeholder="Your name"
                                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-300 ${errors.name ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10'}`}
                                        />
                                        {errors.name && <p className="text-[9px] font-black text-red-400 uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-left-2">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${errors.contact ? 'text-red-400' : 'text-white/50'}`}>
                                            <HiPhone className={errors.contact ? 'text-red-400' : 'text-[#EB664E]'} /> Contact
                                        </label>
                                        <input
                                            type="tel"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            onBlur={() => validateForm()}
                                            placeholder="Phone number"
                                            maxLength={10}
                                            className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-300 ${errors.contact ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10'}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white/50">
                                        <HiCurrencyDollar className="text-[#EB664E]" /> Price Estimate
                                    </label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Price details"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all duration-300 focus:border-[#EB664E] focus:ring-4 focus:ring-[#EB664E]/10"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[#EB664E] hover:bg-[#d55a45] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-orange-500/30 transition-all transform hover:scale-[1.02] active:scale-95 group flex items-center justify-center gap-3 mt-4 disabled:opacity-70"
                                >
                                    <span>{isSubmitting ? 'Sending...' : 'Submit Request'}</span>
                                    {!isSubmitting && <HiChevronRight className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Professional Top Bar Notification */}
            {status.message && (
                <div className="fixed top-0 left-0 w-full z-[300] animate-in fade-in slide-in-from-top-full duration-700 px-4 pt-4">
                    <div className={`
                        relative overflow-hidden mx-auto max-w-lg
                        backdrop-blur-2xl border p-0.5 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]
                        ${status.type === 'success'
                            ? 'bg-white/90 border-white/50'
                            : 'bg-red-50/90 border-red-100'}
                    `}>
                        <div className="relative flex items-center gap-3 p-2 pr-4">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                                ${status.type === 'success' ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}
                            `}>
                                {status.type === 'success' ? <HiCheckCircle className="text-lg" /> : <HiXMark className="text-lg" />}
                            </div>

                            <div className="flex-1">
                                <h4 className="text-[11px] font-black text-[#0A1128] tracking-widest uppercase truncate">
                                    {status.message}
                                </h4>
                            </div>

                            <button
                                onClick={() => setStatus({ type: null, message: '' })}
                                className="w-6 h-6 flex items-center justify-center hover:bg-[#0A1128] rounded-full transition-all group"
                            >
                                <HiXMark className="text-gray-400 group-hover:text-white text-xs" />
                            </button>
                        </div>

                        <div className={`
                            absolute bottom-0 left-0 h-0.5 transition-all duration-[5000ms] ease-linear
                            ${status.type === 'success' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}
                        `} style={{ width: '0%', animation: 'progress-timer 5s linear forwards' }}></div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes progress-timer {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>

            <section className="py-20 bg-white dark:bg-[#0A1128] transition-colors">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex border-b border-gray-100 dark:border-slate-800 mb-12 transition-colors">
                        <button onClick={() => setActiveTab('rental')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'rental' ? 'text-[#EB664E]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>Rental Details {activeTab === 'rental' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB664E]" />}</button>
                        <button onClick={() => setActiveTab('vehicle')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'vehicle' ? 'text-[#EB664E]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>Vehicle Details {activeTab === 'vehicle' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB664E]" />}</button>
                    </div>

                    <div className="space-y-12">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-black text-[#0A1128] dark:text-white uppercase tracking-tight mb-6 transition-colors">{vehicle.name} Rental Service</h2>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium transition-colors">{vehicle.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/20 hover:shadow-xl transition-all group">
                                <HiCheckCircle className="text-3xl text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] dark:text-white uppercase tracking-wider mb-4 transition-colors">Travel Inclusions</h4>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-bold transition-colors">
                                    <li className="flex items-center gap-2"> Clean & Sanitized Vehicle</li>
                                    <li className="flex items-center gap-2"> Experienced Chauffeur</li>
                                    <li className="flex items-center gap-2"> Fuel & Maintenance</li>
                                    <li className="flex items-center gap-2"> All Tolls & State Taxes</li>
                                </ul>
                            </div>

                            <div className="bg-orange-50/50 dark:bg-orange-900/10 p-8 rounded-[2rem] border border-orange-100/50 dark:border-orange-900/20 hover:shadow-xl transition-all group">
                                <HiSparkles className="text-3xl text-[#EB664E] mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] dark:text-white uppercase tracking-wider mb-4 transition-colors">Amenities</h4>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-bold transition-colors">
                                    <li className="flex items-center gap-2"> Air Conditioning</li>
                                    <li className="flex items-center gap-2"> Music System (BT/Aux)</li>
                                    <li className="flex items-center gap-2"> Mobile Charging Points</li>
                                    <li className="flex items-center gap-2"> Newspaper & Water</li>
                                </ul>
                            </div>

                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/20 hover:shadow-xl transition-all group">
                                <HiShieldCheck className="text-3xl text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-black text-[#0A1128] dark:text-white uppercase tracking-wider mb-4 transition-colors">Features</h4>
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 font-bold transition-colors">
                                    {vehicle.features.map((f: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2"> {f}</li>
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
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Why Ride with Edge Tours & Travels?</h2>
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
