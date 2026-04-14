import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const travelPackages = [
  {
    title: 'Amalfi Coast Executive Retreat',
    duration: '7 Days / 6 Nights',
    price: '$4,999',
    image: '/images/amalfi.png',
    features: ['Private Villa Stay', 'Luxury Yacht Charter', 'Personal Concierge', 'VIP Transfers'],
    type: 'Corporate'
  },
  {
    title: 'Urban High-Performance Logistics',
    duration: 'Custom Duration',
    price: 'Contact for Quote',
    image: '/images/car.png',
    features: ['Bulletproof Fleet', 'Trained Security Drivers', '24/7 Dispatch', 'Real-time Tracking'],
    type: 'Security'
  },
  {
    title: 'Transcontinental Jet Experience',
    duration: 'Single Trip',
    price: 'Starts $15k',
    image: '/images/jet.png',
    features: ['Private Jet Charter', 'Seamless Tarmac Access', 'In-flight Catering', 'Helicopter Connection'],
    type: 'VIP'
  }
];

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0A1128] flex flex-col pt-24 font-sans antialiased text-[#0A1128] dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#0A1128] py-32 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800] via-transparent to-[#0A1128]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Curated Experiences</h4>
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 tracking-tighter leading-tight">
            Premium <span className="text-[#FFB800]">Packages.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From seamless corporate logistics to luxurious island escapes, our curated packages are designed for those who demand nothing less than perfection.
          </p>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-4 dark:text-white transition-colors">Select Your Experience</h2>
              <p className="text-gray-500 dark:text-gray-400 transition-colors">
                Choose from our pre-designed elite travel solutions or contact us for a bespoke journey tailored to your specific requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {travelPackages.map((pkg, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-[#0A1128]/10 dark:hover:shadow-none transition-all duration-500 flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md text-[#0A1128] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                      {pkg.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{pkg.duration}</span>
                    <span className="text-lg font-extrabold text-[#0A1128] dark:text-[#FFB800] transition-colors">{pkg.price}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6 group-hover:text-[#0A1128] dark:group-hover:text-[#FFB800] dark:text-white leading-tight transition-colors">{pkg.title}</h3>
                  
                  <ul className="space-y-4 mb-10 flex-1">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3 transition-colors">
                        <svg className="w-5 h-5 text-[#FFB800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button className="w-full bg-gray-50 dark:bg-slate-900 text-[#0A1128] dark:text-white group-hover:bg-[#0A1128] dark:group-hover:bg-[#FFB800] group-hover:text-white dark:group-hover:text-[#0A1128] py-5 rounded-2xl font-bold transition-all duration-300">
                    Discover More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white dark:bg-[#0A1128] transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0A1128] rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
               <img src="/images/hero_bg.png" className="w-full h-full object-cover" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Bespoke Journeys</h4>
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">Can't find a perfect package?</h2>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                  Our specialists are ready to curate a custom itinerary that aligns with your specific travel goals, whether it's global fleet management for a corporation or a private family vacation in total isolation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-[#FFB800] text-[#0A1128] px-10 py-5 rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-900/50 transition-all transform hover:-translate-y-1">
                    Book a Consultation
                  </button>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                  <h3 className="text-3xl font-bold text-[#FFB800] mb-2">24/7</h3>
                  <p className="text-sm font-medium text-gray-400">Concierge Support</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                  <h3 className="text-3xl font-bold text-[#FFB800] mb-2">Global</h3>
                  <p className="text-sm font-medium text-gray-400">Fleet Coverage</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                  <h3 className="text-3xl font-bold text-[#FFB800] mb-2">VIP</h3>
                  <p className="text-sm font-medium text-gray-400">Clearance Access</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center">
                  <h3 className="text-3xl font-bold text-[#FFB800] mb-2">Secure</h3>
                  <p className="text-sm font-medium text-gray-400">Transaction Privacy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Simple Text Section */}
      <section className="py-24 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8 italic dark:text-white transition-colors">"Experience the world without compromise."</h2>
          <p className="text-gray-500 dark:text-gray-400 italic transition-colors">
            Each Edge Tours & Travels package is more than just a trip; it is an orchestrated sequence of events aimed at providing absolute comfort and security. Our fleet of luxury vehicles, private jets, and elite concierge services are at your disposal, globally.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
