
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiArrowPath,
  HiOutlineTruck,
  HiOutlineIdentification,
} from 'react-icons/hi2';
import Link from 'next/link';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverId?: { _id: string; name: string; mobileNumber?: string } | null;
  vehicleId?: { _id: string; cabNumber: string; modelName: string } | null;
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const user = getStoredUser();

  const fetchBookings = async () => {
    try {
      const data = await apiClient('/api/bookings', { method: 'GET' });
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const upcomingBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            My Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back, {user?.name || 'Customer'}!
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
        >
          <HiArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-6 border border-indigo-100 dark:border-slate-700">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <HiOutlineUser className="w-4 h-4" /> {user.email}
                </span>
              )}
              {user?.mobileNumber && (
                <span className="flex items-center gap-1">
                  <HiOutlinePhone className="w-4 h-4" /> {user.mobileNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={bookings.length} icon={<HiOutlineCalendar className="w-5 h-5" />} color="indigo" />
        <StatCard label="Upcoming" value={upcomingBookings.length} icon={<HiOutlineClock className="w-5 h-5" />} color="orange" />
        <StatCard label="Completed" value={pastBookings.filter(b => b.status === 'completed').length} icon={<HiOutlineCheckCircle className="w-5 h-5" />} color="green" />
        <StatCard label="Cancelled" value={pastBookings.filter(b => b.status === 'cancelled').length} icon={<HiOutlineXCircle className="w-5 h-5" />} color="red" />
      </div>

      {/* Upcoming Bookings Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlineCalendar className="text-orange-500" /> Upcoming Trips
        </h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400">
            No upcoming trips. Book a ride to get started!
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} formatDate={formatDate} formatTime={formatTime} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <HiOutlineCheckCircle className="text-green-500" /> Past Trips
        </h2>
        {pastBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400">
            No past trips yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} formatDate={formatDate} formatTime={formatTime} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="flex justify-center pt-4">
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          + Book a New Ride
        </Link>
      </div>
    </div>
  );
}

// --- Helper Components ---
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>{icon}</div>
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{label}</p>
    </div>
  );
}

function BookingCard({ booking, formatDate, formatTime, getStatusBadge }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <HiOutlineMapPin className="text-orange-500" />
            <span className="font-medium">{booking.from}</span>
            <span>→</span>
            <HiOutlineMapPin className="text-blue-500" />
            <span className="font-medium">{booking.destination}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-4 h-4" /> {formatDate(booking.dateTime)}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" /> {formatTime(booking.dateTime)}
            </span>
          </div>
          {booking.driverId && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <HiOutlineUser className="w-4 h-4" /> Driver: {booking.driverId.name}
              </span>
              {booking.vehicleId && (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <HiOutlineTruck className="w-4 h-4" /> {booking.vehicleId.cabNumber} ({booking.vehicleId.modelName})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadge(booking.status)}`}>
            {booking.status}
          </span>
          {booking.price && (
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{booking.price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}