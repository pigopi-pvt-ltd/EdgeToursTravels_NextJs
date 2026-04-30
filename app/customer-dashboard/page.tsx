'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { DashboardSkeleton } from '@/components/CustomerSkeletons';
import { getStoredUser } from '@/lib/auth';
import Link from 'next/link';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineArrowRight,
  HiArrowPath,
  HiOutlineClipboard,
  HiOutlineExclamationCircle,
  HiCheckCircle,
  HiOutlineCheckBadge,
  HiXCircle,
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
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBell from '@/components/NotificationBell';

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
  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto‑refresh when a booking status changes (new notification arrives)
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail;
      if (notification?.type === 'booking_created' ||
          notification?.type === 'trip_accepted' ||
          notification?.type === 'trip_rejected' ||
          notification?.type === 'trip_completed' ||
          notification?.type === 'trip_cancelled' ||
          notification?.type === 'driver_assigned') {
        fetchBookings();
      }
    };
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    return () => window.removeEventListener('new-notification', handleNewNotification as EventListener);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
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
      pending: 'bg-yellow-100 text-yellow-700 font-bold',
      confirmed: 'bg-blue-100 text-blue-700 font-bold',
      completed: 'bg-emerald-100 text-emerald-700 font-bold',
      cancelled: 'bg-red-100 text-red-700 font-bold',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-end p-2">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-sm md:text-xl font-black text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tight truncate">
              Dashboard Overview
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchBookings}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
            <NotificationBell />
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Trips" value={bookings.length} icon={<HiOutlineClipboard className="w-5 h-5 md:w-6 md:h-6" />} color="indigo" />
            <StatCard title="Pending" value={bookings.filter(b => b.status === 'pending').length} icon={<HiOutlineExclamationCircle className="w-5 h-5 md:w-6 md:h-6" />} color="amber" />
            <StatCard title="Confirmed" value={bookings.filter(b => b.status === 'confirmed').length} icon={<HiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />} color="blue" />
            <StatCard title="Completed" value={bookings.filter(b => b.status === 'completed').length} icon={<HiOutlineCheckBadge className="w-5 h-5 md:w-6 md:h-6" />} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">Trips Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="trips" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Recent Bookings</h2>
                <Link
                  href="/customer-dashboard/bookings"
                  className="text-orange-500 hover:text-orange-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  View all <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm font-medium">No bookings yet.</p>
                  <Link href="/customer-dashboard/bookings" className="text-orange-500 text-xs font-bold hover:underline mt-2 inline-block">Book your first ride →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <HiOutlineMapPin className="text-orange-500 shrink-0" />
                            <span className="font-bold text-xs truncate">{booking.from}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold text-xs truncate">{booking.destination}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3.5 h-3.5" /> {new Date(booking.dateTime).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-5 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">{title}</p>
          <p className="text-2xl md:text-4xl font-black tracking-tight">{value}</p>
        </div>
        <div className="p-2 md:p-2.5 bg-white/30 dark:bg-black/20 rounded-xl shadow-inner">{icon}</div>
      </div>
    </div>
  );
}