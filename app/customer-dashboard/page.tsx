'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import Link from 'next/link';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await apiClient('/api/bookings', { method: 'GET' });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data: trips per month (last 6 months)
  const getMonthlyData = () => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      months[key] = 0;
    }
    bookings.forEach((b) => {
      const date = new Date(b.dateTime);
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, trips: count }));
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 4);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name || 'Guest'}! 👋</h1>
        <p className="text-orange-100 mt-1">Track your rides and book new trips easily.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Trips" value={bookings.length} color="indigo" />
        <StatCard label="Pending" value={bookings.filter(b => b.status === 'pending').length} color="yellow" />
        <StatCard label="Confirmed" value={bookings.filter(b => b.status === 'confirmed').length} color="blue" />
        <StatCard label="Completed" value={bookings.filter(b => b.status === 'completed').length} color="green" />
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Trips Overview (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getMonthlyData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="trips" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Bookings</h2>
          <Link
            href="/customer-dashboard/bookings"
            className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
          >
            View all <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No bookings yet. <Link href="/customer-dashboard/bookings" className="text-orange-500">Book your first ride →</Link></p>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <HiOutlineMapPin className="text-orange-500" />
                      <span className="font-medium">{booking.from}</span>
                      <span>→</span>
                      <HiOutlineMapPin className="text-blue-500" />
                      <span className="font-medium">{booking.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {booking.price && <p className="text-sm font-bold text-emerald-600 mt-1">₹{booking.price}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
  };
  return (
    <div className={`rounded-xl p-4 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}