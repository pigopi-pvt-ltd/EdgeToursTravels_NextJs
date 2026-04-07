import React from 'react';

export default function Hero() {
  return (
    <header className="relative h-[600px] flex flex-col items-center justify-center text-center px-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F8F9FA] to-transparent"></div>
      </div>

      <div className="relative z-10 mt-16 max-w-4xl">
        {/* <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Travel with <span className="text-[#FFB800]">Edge Travels</span> Authority.
        </h1>
        <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto">
          The world's most refined booking engine for global elites. Seamless transitions from tarmac to penthouse.
        </p> */}

        <div className="bg-white rounded-3xl shadow-2xl p-4 w-full max-w-4xl mx-auto text-left">
          <div className="flex justify-between border-b border-gray-100 pb-2 mb-4 px-4">
            {['Cabs', 'Luxury Cabs', 'Buses', 'Packages'].map((tab, idx) => (
              <button key={tab} className={`flex-1 text-center py-2 text-sm font-semibold ${idx === 0 ? 'text-[#0A1128] border-b-2 border-[#0A1128]' : 'text-gray-400'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2 items-end">
            <div className="bg-gray-50 p-3 rounded-xl">
              <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Pick-up Location</label>
              <input type="text" placeholder="Enter city or airport" className="w-full bg-transparent outline-none text-sm font-medium text-gray-800" />
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Date & Time</label>
              <input type="text" placeholder="Select Date" className="w-full bg-transparent outline-none text-sm font-medium text-gray-800" />
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Passenger Type</label>
              <select className="w-full bg-transparent outline-none text-sm font-medium text-gray-800 appearance-none">
                <option>1 Passenger</option>
                <option>2 Passengers</option>
              </select>
            </div>
            <div>
              <button className="w-full bg-[#0A1128] text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:bg-blue-950 transition">
                Search →
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}