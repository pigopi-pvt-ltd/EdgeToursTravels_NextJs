'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import Link from 'next/link';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiCheckCircle,
} from 'react-icons/hi2';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  tripStarted?: boolean;
  tripCompleted?: boolean;
}

export default function TrackTripListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const customerBookings = Array.isArray(data) 
          ? data.filter((b: any) => b.contact === user?.mobileNumber || b.userId?._id === user?.id)
          : [];
        setBookings(customerBookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
      case 'confirmed': return { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' };
      case 'in-progress': return { label: 'In Progress', color: 'bg-purple-100 text-purple-700' };
      case 'completed': return { label: 'Completed', color: 'bg-green-100 text-green-700' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const activeTrips = bookings.filter(b => b.status === 'in-progress' || (b.status === 'confirmed' && !b.tripCompleted));
  const completedTrips = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HiOutlineMapPin className="text-orange-500" />
            Track Your Trips
          </h1>
          <p className="text-slate-500 text-sm mt-1">Live tracking for your active trips</p>
        </div>

        {/* Active Trips Section */}
        {activeTrips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Active Trips
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {activeTrips.map((trip) => {
                const status = getStatusLabel(trip.status);
                return (
                  <Link key={trip._id} href={`/customer-dashboard/track-trip/${trip._id}`}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <HiOutlineMapPin className="text-orange-500" />
                          <span className="font-bold">{trip.from}</span>
                          <span>→</span>
                          <HiOutlineMapPin className="text-blue-500" />
                          <span className="font-bold">{trip.destination}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(trip.dateTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(trip.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <HiOutlineUser className="text-slate-400" />
                        <span>{trip.name}</span>
                        <HiOutlinePhone className="text-slate-400 ml-2" />
                        <span>{trip.contact}</span>
                      </div>
                      {trip.status === 'in-progress' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          Driver is on the way
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Trips Section */}
        {completedTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">Past Trips</h2>
            <div className="grid grid-cols-1 gap-4">
              {completedTrips.map((trip) => {
                const status = getStatusLabel(trip.status);
                return (
                  <div key={trip._id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 opacity-75">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <HiOutlineMapPin className="text-orange-500" />
                        <span className="font-bold">{trip.from}</span>
                        <span>→</span>
                        <HiOutlineMapPin className="text-blue-500" />
                        <span className="font-bold">{trip.destination}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(trip.dateTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(trip.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTrips.length === 0 && completedTrips.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <HiOutlineMapPin className="text-3xl text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No trips to track</h3>
            <p className="text-sm text-slate-500">You don't have any active or past trips.</p>
            <Link href="/customer-dashboard/bookings" className="mt-4 inline-block px-6 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm">
              Book a Ride
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}