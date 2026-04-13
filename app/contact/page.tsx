import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0A1128] flex flex-col pt-24 font-sans antialiased text-[#0A1128] dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-[#0A1128] py-20 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mb-3">Connect With Us</h4>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight dark:text-white transition-colors">How can we help?</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors">
            Whether you're planning a government fleet or an executive VIP transfer, our team is ready to assist you 24/7.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800/50 p-10 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-transparent dark:border-slate-800 transition-colors">
          <h2 className="text-3xl font-bold mb-8 dark:text-white">Send us a Message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Subject</label>
              <select className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none appearance-none">
                <option className="bg-white dark:bg-slate-800">General Inquiry</option>
                <option className="bg-white dark:bg-slate-800">Booking Support</option>
                <option className="bg-white dark:bg-slate-800">Corporate Partnership</option>
                <option className="bg-white dark:bg-slate-800">Fleet Management</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Message</label>
              <textarea rows={5} placeholder="How can we assist you today?" className="w-full bg-gray-50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0A1128] dark:focus:ring-[#FFB800] dark:text-white transition-all outline-none resize-none"></textarea>
            </div>

            <button className="w-full bg-[#0A1128] dark:bg-[#FFB800] text-white dark:text-[#0A1128] py-5 rounded-2xl font-bold shadow-lg shadow-blue-900/10 dark:shadow-orange-500/10 hover:bg-black dark:hover:bg-orange-400 transition-all active:scale-95">
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center text-[#FFB800] transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 dark:text-white">HQ Address</h4>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">Suite 405, Executive Towers, <br />NCR Central, New Delhi, India</p>
                </div>
              </div>

               <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center text-[#FFB800] transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 dark:text-white">Direct Line</h4>
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">+91 98765 43210 (VIP Relations)</p>
                  <p className="text-gray-500 dark:text-gray-400 transition-colors">+91 11 2345 6789 (Support)</p>
                </div>
              </div>

               <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center text-[#FFB800] transition-colors">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v10a2 2 0 012 2z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 dark:text-white">Email Support</h4>
                  <p className="text-gray-500 dark:text-gray-400 transition-colors underline underline-offset-4 decoration-[#FFB800]">concierge@edgetravels.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A1128] p-10 rounded-[2rem] text-white">
            <h4 className="text-sm font-bold text-[#FFB800] uppercase tracking-widest mb-3">Office Hours</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-gray-300">Mon - Fri</span>
                <span className="font-bold">24 Hours / 7 Days</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-gray-300">VIP Emergency</span>
                <span className="font-bold">Priority Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
