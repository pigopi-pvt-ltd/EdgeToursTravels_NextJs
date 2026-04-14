'use client';

import React, { useState } from 'react';
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
  },
  {
    _id: '5',
    vehicleType: 'BMW 5 Series',
    category: 'luxury',
    baseFare: 15000,
    baseKm: 80,
    pricePerKm: 65,
    pricePerHour: 1200,
    driverAllowance: 1000,
    isActive: false,
  }
];

export default function PricePage() {
  const [prices, setPrices] = useState(initialPrices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredPrices = prices.filter(price => {
    const matchesSearch = price.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || price.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sedan': return 'bg-blue-100 text-blue-600';
      case 'suv': return 'bg-emerald-100 text-emerald-600';
      case 'luxury': return 'bg-purple-100 text-purple-600';
      case 'tempo': return 'bg-amber-100 text-amber-600';
      case 'bus': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const stats = [
    { label: 'Avg. Sedan Rate', value: '₹12/km', icon: HiOutlineTruck, color: 'blue' },
    { label: 'Avg. SUV Rate', value: '₹18/km', icon: HiOutlineChartBar, color: 'emerald' },
    { label: 'Total Categories', value: '5', icon: HiOutlineFilter, color: 'purple' },
    { label: 'Active Fleets', value: '4/5', icon: HiOutlineCheckCircle, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 transition-colors duration-300">
      <div className="py-6 lg:py-8 space-y-8">
        {/* Header Section */}
        <div className="px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Pricing Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">Configure vehicle rates, base fares, and driver allowances.</p>
          </div>
          <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all font-semibold active:scale-95">
            <HiOutlinePlus className="text-xl" />
            <span>Add New Rate</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="text-2xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">{stat.value}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar Section */}
        <div className="px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center transition-colors">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl transition-colors" />
              <input
                type="text"
                placeholder="Search vehicle type..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-slate-700 dark:text-white font-medium shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2 transition-colors uppercase tracking-widest">
                <HiOutlineFilter /> Filter:
              </span>
              <div className="flex gap-2">
                {['all', 'sedan', 'suv', 'luxury', 'tempo'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      filterCategory === cat 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section - Chipka Hua (Full Width) */}
        <div className="bg-white dark:bg-[#0A1128] border-y border-slate-100 dark:border-slate-800 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vehicle Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Fare</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rate / KM</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rate / Hr</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Driver Allow.</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredPrices.map((price) => (
                  <tr key={price._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                          price.category === 'sedan' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          price.category === 'suv' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          price.category === 'luxury' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          price.category === 'tempo' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
                        }`}>
                          {price.category.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white transition-colors">{price.vehicleType}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">{price.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">₹{price.baseFare.toLocaleString()}</span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">MIN {price.baseKm} KM</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">₹{price.pricePerKm} / km</td>
                    <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">₹{price.pricePerHour} / hr</td>
                    <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">₹{price.driverAllowance}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          price.isActive 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          {price.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all" title="Edit">
                          <HiOutlinePencil className="text-lg" />
                        </button>
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Delete">
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Info */}
          <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors uppercase tracking-widest">
              Showing <span className="text-slate-800 dark:text-white">{filteredPrices.length}</span> of <span className="text-slate-800 dark:text-white">{prices.length}</span> entries
            </p>
            <div className="flex gap-2">
              <button disabled className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed">PREV</button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">NEXT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
