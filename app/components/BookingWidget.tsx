"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";

const tabs = ["Cabs", "Flights", "Hotels", "Packages"];

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("Cabs");

  return (
    <div className="w-full max-w-4xl mx-auto glass rounded-3xl shadow-2xl p-2 md:p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex bg-gray-100/50 rounded-2xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium text-sm ${
              activeTab === tab
                ? "bg-white text-brand-primary shadow-sm"
                : "text-brand-primary/60 hover:text-brand-primary"
            }`}
          >
            {tab === "Cabs" && <span className="text-lg">🚕</span>}
            {tab === "Flights" && <span className="text-lg">✈️</span>}
            {tab === "Hotels" && <span className="text-lg">🏨</span>}
            {tab === "Packages" && <span className="text-lg">📦</span>}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 px-4 py-4">
        <div className="flex-1 w-full bg-white/40 border border-brand-primary/5 rounded-2xl p-4 flex items-center gap-3">
          <MapPin className="text-brand-primary/40 size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest">Pick-up Location</span>
            <input 
               type="text" 
               placeholder="Enter city or airport" 
               className="bg-transparent border-none outline-none text-sm font-medium text-brand-primary placeholder:text-brand-primary/30 w-full"
            />
          </div>
        </div>

        <div className="flex-1 w-full bg-white/40 border border-brand-primary/5 rounded-2xl p-4 flex items-center gap-3">
          <Calendar className="text-brand-primary/40 size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest">Date & Time</span>
            <span className="text-sm font-medium text-brand-primary">Select Date</span>
          </div>
        </div>

        <div className="flex-1 w-full bg-white/40 border border-brand-primary/5 rounded-2xl p-4 flex items-center gap-3">
          <Users className="text-brand-primary/40 size-5 shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest whitespace-nowrap">Passengers Type</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-brand-primary">1 Passenger</span>
              <span className="text-xs text-brand-primary/40 text-right">⌄</span>
            </div>
          </div>
        </div>

        <button className="w-full md:w-auto bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
          Search
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
