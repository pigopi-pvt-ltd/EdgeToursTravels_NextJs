'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { HiArrowPath, HiUserGroup, HiTruck, HiCalendar, HiCurrencyDollar } from 'react-icons/hi2';

// Types
interface Employee {
  _id: string;
  name: string;
  role: string;
  email: string;
  mobileNumber: string;
}

type DriverInfo = { _id: string; name: string } | string | null;
type VehicleInfo = { _id: string; cabNumber: string } | string | null;

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: number | string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverId?: DriverInfo;
  vehicleId?: VehicleInfo;
  createdAt?: string;
}

interface DashboardData {
  employees: Employee[];
  drivers: any[];
  vehicles: any[];
  bookings: Booking[];
  revenue: number;
  dailyBookings: { date: string; count: number }[];
  statusCounts: { name: string; value: number }[];
}

const COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

// Helper to extract driver ID only
const getDriverId = (driver: DriverInfo): string => {
  if (!driver) return '—';
  if (typeof driver === 'object') return driver._id;
  return driver; // already a string ID
};

// Helper to format date for X-axis
const formatChartDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    employees: [],
    drivers: [],
    vehicles: [],
    bookings: [],
    revenue: 0,
    dailyBookings: [],
    statusCounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication token missing');
      setLoading(false);
      return;
    }

    try {
      const [employeesRes, driversRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/employees', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/drivers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/book-form', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!employeesRes.ok || !driversRes.ok || !vehiclesRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const employeesData = await employeesRes.json();
      const driversData = await driversRes.json();
      const vehiclesData = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();

      const employees = Array.isArray(employeesData) ? employeesData : employeesData.employees || [];
      const drivers = Array.isArray(driversData) ? driversData : driversData.drivers || [];
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.data || [];

      let bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
      bookings = bookings.map((b: any) => ({
        ...b,
        price: typeof b.price === 'number' ? b.price : (b.price ? parseFloat(b.price) : 0),
        driverId: b.driverId || null,
        vehicleId: b.vehicleId || null,
      }));

      const revenue = bookings.reduce((sum: number, b: Booking) => {
        if ((b.status === 'confirmed' || b.status === 'completed') && typeof b.price === 'number') {
          return sum + b.price;
        }
        return sum;
      }, 0);

      // Daily bookings (last 7 days)
      const dailyMap = new Map<string, number>();
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, 0);
      }
      bookings.forEach((b: Booking) => {
        const dateStr = new Date(b.dateTime).toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, dailyMap.get(dateStr)! + 1);
        }
      });
      const dailyBookings = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

      const statusCounts = [
        { name: 'Pending', value: bookings.filter((b: Booking) => b.status === 'pending').length },
        { name: 'Confirmed', value: bookings.filter((b: Booking) => b.status === 'confirmed').length },
        { name: 'Completed', value: bookings.filter((b: Booking) => b.status === 'completed').length },
        { name: 'Cancelled', value: bookings.filter((b: Booking) => b.status === 'cancelled').length },
      ].filter(s => s.value > 0);

      setDashboard({
        employees,
        drivers,
        vehicles,
        bookings,
        revenue,
        dailyBookings,
        statusCounts,
      });
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} onRetry={handleRefresh} />;

  const { employees, drivers, vehicles, bookings, dailyBookings, statusCounts } = dashboard;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const unassignedBookings = bookings.filter(b => !b.driverId).length;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500 bg-slate-50 dark:bg-[#0A1128] min-h-screen transition-colors duration-300 font-sf">
      {/* Header */}
      <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
        <div className="min-w-0">
          <h1 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">Dashboard Overview</h1>
        </div>
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-1.5 md:gap-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={refreshing}
        >
          <HiArrowPath className={`w-3 h-3 md:w-4 md:h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="p-4 md:p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Drivers" value={drivers.length} icon={<HiUserGroup className="w-6 h-6" />} color="indigo" />
          <StatCard title="Total Vehicles" value={vehicles.length} icon={<HiTruck className="w-6 h-6" />} color="blue" />
          <StatCard title="Total Bookings" value={totalBookings} subtext={`${pendingBookings} pending`} icon={<HiCalendar className="w-6 h-6" />} color="emerald" />
          <StatCard title="Total Employees" value={employees.length} icon={<HiUserGroup className="w-6 h-6" />} color="amber" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0A1128]/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Bookings (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={formatChartDate}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => (Number.isInteger(value) ? value.toString() : '')}
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value) => [`${value} bookings`, 'Count']}
                  labelFormatter={(label) => formatChartDate(label)}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Booking Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => {
                    const pct = percent ?? 0;
                    return `${name} ${(pct * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
              {statusCounts.map(s => (
                <div key={s.name} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[s.name.toLowerCase() as keyof typeof COLORS] || '#94a3b8' }}></span>
                  <span className="text-slate-600 dark:text-slate-400">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Recent Bookings
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[1000px] md:min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Route</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Driver ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No bookings found</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => {
                    const dt = new Date(booking.dateTime);
                    const dateStr = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    return (
                      <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{booking.name}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                          {booking.from} → {booking.destination}
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{dateStr}</td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{timeStr}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                            ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : ''}
                            ${booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                          `}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {getDriverId(booking.driverId ?? null)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard component 
function StatCard({ title, value, subtext, icon, color = 'indigo' }: any) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 group`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">{title}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-4xl font-black tracking-tight">{value}</h3>
            {subtext && <span className="text-sm font-bold text-slate-400">{subtext}</span>}
          </div>
        </div>
        <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl transition">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton 
function LoadingSkeleton() {
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse bg-white dark:bg-slate-900 min-h-screen">
      <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-100 dark:border-slate-800 flex items-center px-6 mb-8">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
      <div className="px-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div><div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i=>(
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between"><div className="space-y-3 flex-1"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div><div className="h-8 w-16 bg-slate-200 dark:bg-slate-600 rounded"></div></div><div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-lg"></div></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[380px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"><div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div><div className="h-[250px] w-full bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700"></div></div>
          <div className="h-[380px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col"><div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div><div className="h-48 w-48 rounded-full border-8 border-slate-100 dark:border-slate-700/50 mx-auto"></div></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="h-[60px] px-6 flex items-center border-b"><div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div></div><div>{[1,2,3,4,5].map(i=><div key={i} className="h-16 px-6 flex items-center gap-4 border-b"><div className="h-4 w-1/4 bg-slate-100 rounded"></div><div className="h-4 w-1/3 bg-slate-50 rounded"></div><div className="h-4 w-1/4 bg-slate-100 rounded"></div><div className="h-6 w-20 bg-slate-100 rounded-full"></div></div>)}</div></div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
      <button onClick={onRetry} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium hover:bg-red-200 transition">Try Again</button>
    </div>
  );
}