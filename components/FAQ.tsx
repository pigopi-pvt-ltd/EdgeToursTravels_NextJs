import React from 'react';
import { HiPlus } from 'react-icons/hi2';

const FAQS = [
  "How do I get in contact with customer service?",
  "What do I do in the unlikely event the vehicle breaks down during the trip?",
  "How do you make sure that the driver is on time?",
  "What do I do if I want to cancel or reschedule the booking?",
  "What do I really get for the rental price? Is there any hidden costs?"
];

export default function FAQ() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#0A1128] dark:text-white uppercase tracking-tight">Frequently asked questions</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-snug pr-8 whitespace-normal">{faq}</p>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                  <HiPlus />
                </div>
              </div>
            ))}
          </div>

          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[400px] lg:h-full min-h-[400px]">
            <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=2071" alt="Company Bus and Staff" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
