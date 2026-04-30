'use client';

import React, { useState, useEffect } from 'react';
import {
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChartBar
} from 'react-icons/hi';

// Mock data based on the Price model
const initialPrices = [
  {
    _id: '1',
    vehicleType: 'Swift Dzire',
    category: 'sedan',
    baseFare: 2500,
    baseKm: 80,
    pricePerKm: 12,
    pricePerHour: 150,
    driverAllowance: 300,
    isActive: true,
  },
  {
    _id: '2',
    vehicleType: 'Toyota Innova Crysta',
    category: 'suv',
    baseFare: 4500,
    baseKm: 80,
    pricePerKm: 18,
    pricePerHour: 250,
    driverAllowance: 500,
    isActive: true,
  },
  {
    _id: '3',
    vehicleType: 'Toyota Fortuner',
    category: 'suv',
    baseFare: 7500,
    baseKm: 80,
    pricePerKm: 25,
    pricePerHour: 400,
    driverAllowance: 600,
    isActive: true,
  },
  {
    _id: '4',
    vehicleType: 'Luxury Tempo Traveller',
    category: 'tempo',
    baseFare: 12000,
    baseKm: 250,
    pricePerKm: 28,
    pricePerHour: 500,
    driverAllowance: 800,
    isActive: true,
  }
];

export default function PricePage() {
  const [prices, setPrices] = useState(initialPrices);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || price.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sedan': return 'bg-blue-100/50 text-blue-600';
      case 'suv': return 'bg-emerald-100/50 text-emerald-600';
      case 'luxury': return 'bg-purple-100/50 text-purple-600';
      case 'tempo': return 'bg-amber-100/50 text-amber-600';
      default: return 'bg-slate-100/50 text-slate-600';
    }
  };

  const stats = [
    { label: 'Avg. Sedan Rate', value: '₹12/km', icon: HiOutlineTruck },
    { label: 'Avg. SUV Rate', value: '₹18/km', icon: HiOutlineChartBar },
    { label: 'Total Categories', value: '5', icon: HiOutlineFilter },
    { label: 'Active Fleets', value: '4/5', icon: HiOutlineCheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 animate-pulse">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="flex flex-col">
          {/* Precise Stats Skeleton (approx 174px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-8 h-[174px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 animate-pulse flex flex-col justify-between">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-3 w-32 bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Precise Toolbar Skeleton (88px) */}
          <div className="p-6 h-[88px] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between animate-pulse bg-slate-50/30 dark:bg-slate-900/30">
            <div className="h-11 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-inner"></div>
            <div className="flex gap-2">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-11 w-24 bg-white dark:bg-slate-800 rounded-2xl hidden md:block border border-slate-100 dark:border-slate-800"></div>
              ))}
            </div>
          </div>

          {/* Precise Table Row Skeleton (106px) */}
          <div className="flex-grow">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="px-8 py-6 h-[106px] border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                    <div className="h-3 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                  </div>
                </div>
                <div className="space-y-2 hidden md:block">
                  <div className="h-4 w-28 bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                  <div className="h-2 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                </div>
                <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors duration-300 animate-in fade-in duration-500">
      {/* Sticky Header Toolbar - Edge-to-Edge */}
      <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
        <div className="min-w-0">
          <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
            Pricing Management <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredPrices.length})</span>
          </h2>
        </div>
        <button className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap">
          <HiOutlinePlus className="text-lg" /> Add New Rate
        </button>
      </div>

      <div className="flex flex-col min-h-[calc(100vh-120px)]">
        {/* Quick Stats Grid - Precise Height approx 174px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-8 h-[174px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className="text-2xl md:text-3xl" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white transition-colors tracking-tight">{stat.value}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Global Search & Filters Toolbar - Precise Height approx 88px */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-100 dark:border-slate-800 h-auto md:h-[88px]">
          <div className="relative w-full md:max-w-md">
            <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl" />
            <input
              type="text"
              placeholder="Search vehicle type or category..."
              className="w-full pl-14 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-slate-700 dark:text-white font-bold text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {['all', 'sedan', 'suv', 'luxury', 'tempo'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200/50 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Data Table - Precise Row Height approx 106px */}
        <div className="flex-grow overflow-x-auto custom-scrollbar shadow-inner border-t border-slate-100 dark:border-slate-800">
          <table className="w-full border-collapse text-left min-w-[1100px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 last:border-r-0">Vehicle Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 last:border-r-0">Base (Km/Time)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 last:border-r-0 text-center">Allowances</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPrices.map((price) => (
                <tr key={price._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors group h-[106px]">
                  <td className="px-8 py-6 border-r border-slate-50 dark:border-slate-800 last:border-r-0">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">{price.vehicleType}</span>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit border ${getCategoryColor(price.category)}`}>
                        {price.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 border-r border-slate-50 dark:border-slate-800 last:border-r-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-black text-slate-800 dark:text-white italic">₹{price.baseFare.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Included {price.baseKm} Km</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center border-r border-slate-50 dark:border-slate-800 last:border-r-0">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-base font-black text-slate-800 dark:text-white tracking-widest">₹{price.driverAllowance}</span>
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg mt-1.5 border border-emerald-100 dark:border-emerald-800">Daily Batta</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center border-r border-slate-50 dark:border-slate-800 last:border-r-0">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${price.isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${price.isActive ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                      {price.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button title="Edit Rate" className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100">
                        <HiOutlinePencil className="text-xl" />
                      </button>
                      <button title="Delete Rate" className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100">
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - Standardized Sticky Bottom approx 76px */}
        <div className="h-[76px] sticky bottom-0 bg-[#f8f9fa] dark:bg-slate-800/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 transition-colors uppercase tracking-widest">
            Showing <span className="text-slate-800 dark:text-white">{filteredPrices.length}</span> of <span className="text-slate-800 dark:text-white font-bold">{prices.length}</span> entries found
          </p>
          <div className="flex gap-2">
            <button disabled className="px-6 py-2.5 rounded-2xl text-[10px] font-black border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed uppercase tracking-widest bg-white dark:bg-transparent">Prev</button>
            <button className="px-6 py-2.5 rounded-2xl text-[10px] font-black bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none uppercase tracking-widest active:scale-95">Next Page</button>
          </div>
        </div>
      </div>
    </div>
  );
}
