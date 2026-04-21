
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { HiArrowPath, HiUserGroup, HiTruck, HiCalendar, HiCurrencyDollar } from 'react-icons/hi2';

// Types with proper union handling
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
  drivers: Employee[];
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

// Helper to extract driver name safely
const getDriverName = (driver: DriverInfo): string => {
  if (!driver) return '—';
  if (typeof driver === 'object') return driver.name;
  return `Driver ${driver}`; // fallback for string ID
};

// Helper to extract vehicle cab number safely
const getVehicleCab = (vehicle: VehicleInfo): string => {
  if (!vehicle) return '—';
  if (typeof vehicle === 'object') return vehicle.cabNumber;
  return `Vehicle ${vehicle}`;
};

// Helper to get vehicle ID safely
const getVehicleId = (vehicle: VehicleInfo): string | undefined => {
  if (!vehicle) return undefined;
  if (typeof vehicle === 'object') return vehicle._id;
  return vehicle;
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    employees: [],
    drivers: [],
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
      const [employeesRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/employees', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/book-form', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!employeesRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch employees or bookings');
      }

      const employeesData = await employeesRes.json();
      const bookingsData = await bookingsRes.json();

      const employees = Array.isArray(employeesData) ? employeesData : employeesData.employees || [];
      const drivers = employees.filter((emp: Employee) => emp.role === 'driver');

      let bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
      bookings = bookings.map((b: any) => ({
        ...b,
        price: typeof b.price === 'number' ? b.price : (b.price ? parseFloat(b.price) : 0),
        // Keep driverId and vehicleId as they are (could be string or object)
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

  if (loading) {
    return (
      <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse bg-white dark:bg-slate-900 min-h-screen">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 h-[56px] border-b border-slate-100 dark:border-slate-800 flex items-center px-6 mb-8">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
        <div className="px-6 space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-600 rounded"></div>
                  </div>
                  <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                </div>
                <div className="h-3 w-32 bg-slate-50 dark:bg-slate-800/50 rounded mt-4"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[380px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
              <div className="h-[250px] w-full bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="h-[380px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-8 self-start"></div>
              <div className="h-48 w-48 rounded-full border-8 border-slate-100 dark:border-slate-700/50 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-800/40"></div>
              </div>
              <div className="mt-8 flex gap-4">
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-[60px] px-6 flex items-center border-b border-slate-100 dark:border-slate-700">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="p-0">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 px-6 flex items-center gap-4 border-b border-slate-50 dark:border-slate-700 last:border-0">
                  <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-1/3 bg-slate-50 dark:bg-slate-900/50 rounded"></div>
                  <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium hover:bg-red-200 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { employees, drivers, bookings, revenue, dailyBookings, statusCounts } = dashboard;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const unassignedBookings = bookings.filter(b => !b.driverId).length;

  // Safely count unique vehicles (only if vehicleId is an object with _id)
  const vehiclesInUse = new Set(
    bookings
      .map(b => b.vehicleId)
      .filter(v => v && typeof v === 'object')
      .map(v => (v as { _id: string })._id)
  ).size;
  const totalVehiclesPlaceholder = Math.max(vehiclesInUse, 5);
  const activeVehicles = vehiclesInUse;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Flush Dashboard Header matched to Bookings toolbar height */}
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
          <StatCard
            title="Total Employees"
            value={employees.length}
            subtext={`${drivers.length} drivers`}
            icon={<HiUserGroup className="w-6 h-6 text-orange-500" />}
            trend="+2 this month"
            trendUp
          />
          <StatCard
            title="Active Vehicles"
            value={activeVehicles}
            subtext={`${totalVehiclesPlaceholder} total (estimated)`}
            icon={<HiTruck className="w-6 h-6 text-blue-500" />}
            trend="from assigned bookings"
            trendUp={false}
          />
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            subtext={`${pendingBookings} pending`}
            icon={<HiCalendar className="w-6 h-6 text-emerald-500" />}
            trend={`${unassignedBookings} unassigned`}
            trendUp={false}
          />
          <StatCard
            title="Revenue"
            value={`₹${revenue.toLocaleString()}`}
            subtext="from confirmed/completed"
            icon={<HiCurrencyDollar className="w-6 h-6 text-amber-500" />}
            trend="+12% vs last month"
            trendUp
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">📈 Bookings (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">📊 Booking Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">🕒 Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[1000px] md:min-w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-left font-medium">Route</th>
                  <th className="px-5 py-3 text-left font-medium">Date & Time</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No bookings found</td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{booking.name}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {booking.from} → {booking.destination}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(booking.dateTime).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize
                          ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : ''}
                          ${booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {getDriverName(booking.driverId ?? null)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl p-5 border border-orange-100 dark:border-orange-900/30">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">🚦 Driver Assignment</h4>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {bookings.filter(b => b.driverId).length} / {totalBookings}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">bookings have a driver assigned</p>
            <div className="w-full bg-orange-200 dark:bg-orange-900/40 rounded-full h-2 mt-3">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${totalBookings ? (bookings.filter(b => b.driverId).length / totalBookings) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">🚖 Vehicle Utilization</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {bookings.filter(b => b.vehicleId).length} / {totalBookings}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">bookings have a vehicle assigned</p>
            <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2 mt-3">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalBookings ? (bookings.filter(b => b.vehicleId).length / totalBookings) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function StatCard({ title, value, subtext, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</h3>
            {subtext && <span className="text-xs text-slate-400 dark:text-slate-500">{subtext}</span>}
          </div>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition">
          {icon}
        </div>
      </div>
      {trend && (
        <p className={`text-xs font-medium mt-3 flex items-center gap-1 ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  );
}