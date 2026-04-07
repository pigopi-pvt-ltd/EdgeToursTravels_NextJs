import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const clients = [
  { name: 'Global Tech Solutions', industry: 'Logistics', year: '2022' },
  { name: 'Elite Realty', industry: 'Real Estate', year: '2021' },
  { name: 'Prime Healthcare', industry: 'Medical', year: '2023' },
  { name: 'Visionary Media', industry: 'Marketing', year: '2020' },
  { name: 'Zenith Finance', industry: 'Banking', year: '2022' },
  { name: 'Horizon Hospitality', industry: 'Tourism', year: '2021' },
];

const testimonials = [
  {
    quote: "The fleet management service by Edge Tours & Travels has been exceptional. Their attention to detail and punctuality is unmatched.",
    author: "James Anderson",
    role: "Director, Global Tech Solutions"
  },
  {
    quote: "Edge Tours & Travels handles our VIP delegates with the utmost professionalism. We've never had a reason to complain.",
    author: "Sarah Mitchell",
    role: "Operations Head, Elite Realty"
  }
];

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col pt-24 font-sans antialiased text-[#0A1128]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gray-50 py-24 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#0A1128]/5 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-4">Our Partnerships</h4>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-8 tracking-tighter leading-tight">
            Trust Built on <br /><span className="text-[#0A1128]">Excellence.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We take pride in serving some of the world's most prestigious organizations, delivering seamless travel and logistics solutions since 2010.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center">
            <div className="text-center border-r border-gray-100 last:border-0">
              <h3 className="text-4xl font-bold text-[#0A1128] mb-1">500+</h3>
              <p className="text-gray-500 text-sm font-medium">Global Clients</p>
            </div>
            <div className="text-center border-r border-gray-100 last:border-0 md:block hidden">
              <h3 className="text-4xl font-bold text-[#0A1128] mb-1">98%</h3>
              <p className="text-gray-500 text-sm font-medium">Client Retention</p>
            </div>
            <div className="text-center border-r border-gray-100 last:border-0">
              <h3 className="text-4xl font-bold text-[#0A1128] mb-1">15k</h3>
              <p className="text-gray-500 text-sm font-medium">Trips Delivered</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-[#0A1128] mb-1">10+</h3>
              <p className="text-gray-500 text-sm font-medium">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Recognized by the Best</h2>
              <p className="text-gray-500">
                While we maintain confidentiality for our government-grade contracts, we are proud to display some of our corporate partners who trust us every day.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-[#0A1128] transition-colors">
                    <svg className="w-6 h-6 text-[#0A1128] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover:text-[#FFB800] transition-colors">{client.year}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#0A1128]">{client.name}</h3>
                <p className="text-gray-400 text-sm">{client.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Voice of Experience</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Hear what our long-standing partners have to say about our commitment to excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="relative bg-gray-50 p-12 rounded-[2.5rem]">
                <div className="absolute top-8 left-8 text-[#FFB800] opacity-20">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8v8H6c0 4.417 3.583 8 8 8V28c-6.617 0-12-5.383-12-12V8h8zm14 0v8h-4c0 4.417 3.583 8 8 8V28c-6.617 0-12-5.383-12-12V8h8z" />
                  </svg>
                </div>
                <p className="text-xl text-[#0A1128] italic font-medium leading-relaxed mb-8 relative z-10">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0A1128] rounded-full flex items-center justify-center text-[#FFB800] font-bold text-lg uppercase">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#0A1128] rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB800] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to join our elite <br />client list?</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
              Partner with the leading tour and travel partner for premium business and corporate fleet management globally.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-[#FFB800] text-[#0A1128] px-10 py-5 rounded-2xl font-bold hover:bg-white transition-all transform hover:-translate-y-1">
                Contact Sales
              </button>
              <button className="w-full sm:w-auto bg-transparent border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
