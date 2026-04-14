'use client';

import React, { useEffect, useState } from 'react';
import { HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiEllipsisVertical, HiChevronLeft, HiChevronRight, HiChevronDown } from 'react-icons/hi2';
import apiClient from '@/lib/apiClient';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/api/admin/book-form', { method: 'GET' });
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking =>
    statusFilter === 'all' ? true : booking.status === statusFilter
  );

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient('/api/admin/book-form', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
      });
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="-mt-8 -mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-hidden min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar matched to Employees Page */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2 px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
            Ride Bookings <span className="text-slate-400 dark:text-slate-500 font-normal">({filteredBookings.length})</span>
          </h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchBookings}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 p-4 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 transition-colors">
            <HiOutlineXCircle className="text-xl" />
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-24 text-center transition-colors">
            <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <HiOutlineCalendar className="text-2xl text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No {statusFilter !== 'all' ? statusFilter : ''} bookings found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Try changing the status filter or refreshing data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Route</th>
                   <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Schedule</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Price Estimate</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                    <div className="relative inline-flex items-center gap-1 cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors">
                      <span>Status</span>
                      <HiChevronDown className="text-slate-400 text-xs" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      >
                        <option value="all">ALL</option>
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                          {getInitials(booking.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{booking.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{booking.contact}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-tighter truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> {booking.from}
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-tighter truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {booking.destination}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                        <HiOutlineCalendar className="text-slate-300 dark:text-slate-600" /> {new Date(booking.dateTime).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <HiOutlineClock className="text-slate-300 dark:text-slate-600" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </td>
                    <td className="px-6 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
                        {booking.price || 'Not Specified'}
                      </p>
                    </td>
                    <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                      <span className={`
                        px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px]
                        ${booking.status === 'pending' ? 'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30' : 
                          booking.status === 'cancelled' ? 'bg-[#FEF2F2] dark:bg-red-900/20 text-[#EF4444] border-[#FEE2E2] dark:border-red-900/30' :
                          booking.status === 'confirmed' ? 'bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0EA5E9] border-[#E0F2FE] dark:border-blue-900/30' :
                          'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30'}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button 
                            onClick={() => updateStatus(booking._id, booking.status === 'pending' ? 'confirmed' : 'completed')}
                            className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            title="Update Status"
                          >
                            <HiOutlineCheckCircle className="text-lg" />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button 
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-full hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Cancel Booking"
                          >
                            <HiOutlineXCircle className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer - Image Style */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-end gap-8 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rows per page:</span>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">100</span>
                  <HiChevronDown className="text-sm text-slate-400 dark:text-slate-600" />
                </div>
              </div>
              
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                1-{filteredBookings.length} of {filteredBookings.length}
              </span>

              <div className="flex items-center gap-4">
                <button className="text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <HiChevronLeft className="text-xl" />
                </button>
                <button className="text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <HiChevronRight className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
