'use client';

import React, { useEffect, useState } from 'react';
import { HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDotsVertical } from 'react-icons/hi2';
import apiClient from '@/lib/apiClient';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ride Bookings</h2>
          <p className="text-slate-500 text-sm font-medium">Manage and track all customer ride requests</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          Refresh Data
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
          <HiOutlineXCircle className="text-xl" />
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineCalendar className="text-2xl text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No bookings found</h3>
          <p className="text-slate-500 text-sm">Ride requests will appear here once customers submit them</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                          {booking.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{booking.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <HiOutlinePhone className="text-slate-400" />
                            {booking.contact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <HiOutlineMapPin className="text-orange-500" />
                          {booking.from}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <HiOutlineMapPin className="text-blue-500" />
                          {booking.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <HiOutlineCalendar className="text-slate-400" />
                        {new Date(booking.dateTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                        <HiOutlineClock className="text-slate-400" />
                        {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all title='Confirm'"
                          >
                            <HiOutlineCheckCircle className="text-lg" />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => updateStatus(booking._id, 'completed')}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all title='Complete'"
                          >
                            <HiOutlineCheckCircle className="text-lg" />
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button 
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="bg-white border border-slate-200 text-slate-400 p-2 rounded-lg hover:text-red-500 hover:border-red-200 transition-all title='Cancel'"
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
          </div>
        </div>
      )}
    </div>
  );
}
