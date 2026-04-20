'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverId?: { _id: string; name: string; mobileNumber?: string };
  vehicleId?: { _id: string; cabNumber: string; modelName: string };
}

// Sample data for demonstration
const sampleBookings: Booking[] = [
  {
    _id: 'sample1',
    from: 'Mumbai Airport',
    destination: 'Andheri East',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    name: 'Rahul Sharma',
    contact: '9876543210',
    price: 850,
    status: 'confirmed',
    driverId: { _id: 'd1', name: 'Sachin Bodare', mobileNumber: '9551234567' },
    vehicleId: { _id: 'v1', cabNumber: 'MH01AB1234', modelName: 'Toyota Innova' },
  },
  {
    _id: 'sample2',
    from: 'Churchgate',
    destination: 'Nariman Point',
    dateTime: new Date(Date.now() + 172800000).toISOString(),
    name: 'Priya Mehta',
    contact: '9988776655',
    price: 450,
    status: 'pending',
    // driverId: null,
    // vehicleId: null,
  },
  {
    _id: 'sample3',
    from: 'Bandra West',
    destination: 'Juhu Beach',
    dateTime: new Date(Date.now() - 86400000).toISOString(),
    name: 'Amit Patel',
    contact: '8877665544',
    price: 600,
    status: 'completed',
    driverId: { _id: 'd2', name: 'Rajesh Kumar', mobileNumber: '9988776655' },
    vehicleId: { _id: 'v2', cabNumber: 'MH02CD5678', modelName: 'Hyundai Creta' },
  },
  {
    _id: 'sample4',
    from: 'Powai',
    destination: 'BKC',
    dateTime: new Date(Date.now() + 259200000).toISOString(),
    name: 'Sneha Reddy',
    contact: '7766554433',
    price: 720,
    status: 'cancelled',
    // driverId: null,
    // vehicleId: null,
  },
  {
    _id: 'sample5',
    from: 'Ludhyana',
    destination: 'Panjab',
    dateTime: new Date(Date.now() + 345600000).toISOString(),
    name: 'Anik Rawat',
    contact: '8262652684',
    price: 1200,
    status: 'pending',
    // driverId: null,
    // vehicleId: null,
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [useSampleData, setUseSampleData] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/api/bookings', { method: 'GET' });
      if (Array.isArray(data) && data.length > 0) {
        setBookings(data);
        setUseSampleData(false);
      } else {
        // No real data, show sample
        setBookings(sampleBookings);
        setUseSampleData(true);
      }
    } catch (error) {
      console.error(error);
      setBookings(sampleBookings);
      setUseSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => filter === 'all' ? true : b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">My Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your ride bookings</p>
        </div>
        <Link
          href="/customer-dashboard/bookings/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span className="font-semibold">New Booking</span>
        </Link>
      </div>

      {/* Sample data notice */}
      {/* {useSampleData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
          ℹ️ Showing sample booking data. Your real bookings will appear here once you create them.
        </div>
      )} */}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} color="slate" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Confirmed" value={stats.confirmed} color="blue" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
              filter === tab
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <HiOutlineCalendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">No {filter !== 'all' ? filter : ''} bookings found.</p>
          <Link href="/customer-dashboard/bookings/new" className="inline-block mt-4 text-orange-500 hover:underline">
            Book your first ride →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Route */}
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <HiOutlineMapPin className="text-orange-500" />
                    <span className="font-medium">{booking.from}</span>
                    <span>→</span>
                    <HiOutlineMapPin className="text-blue-500" />
                    <span className="font-medium">{booking.destination}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <HiOutlineCalendar className="w-4 h-4" />
                      {new Date(booking.dateTime).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-4 h-4" />
                      {new Date(booking.dateTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <HiOutlineUser className="w-4 h-4" /> {booking.name}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{booking.contact}</span>
                  </div>

                  {/* Driver & Vehicle details if assigned */}
                  {booking.driverId && (
                    <div className="flex flex-wrap gap-4 text-sm bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <HiOutlineUser className="w-4 h-4" /> Driver: {booking.driverId.name}
                      </span>
                      {booking.vehicleId && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <HiOutlineTruck className="w-4 h-4" /> {booking.vehicleId.cabNumber} ({booking.vehicleId.modelName})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {booking.price && (
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{booking.price.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Right side - Status & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadge(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                  <Link
                    href={`/customer-dashboard/bookings/${booking._id}`}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <HiOutlineEye className="w-5 h-5" />
                    <span className="text-sm font-medium">View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
          Refresh Bookings
        </button>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  };
  return (
    <div className={`rounded-xl p-3 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}