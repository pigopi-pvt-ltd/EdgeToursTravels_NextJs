'use client';

import { useState } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiOutlineTruck,
  HiOutlineClipboard,        // ✅ correct name
  HiOutlineCheckBadge,
  HiOutlineExclamationCircle, // ✅ instead of HiOutlineStatusOnline
} from 'react-icons/hi2';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  vehicleId?: { cabNumber: string; modelName: string };
}

// Sample trip data (static)
const sampleTrips: Booking[] = [
  {
    _id: 'trip1',
    from: 'Mumbai Airport',
    destination: 'Andheri East',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    name: 'Rahul Sharma',
    contact: '9876543210',
    status: 'pending',
    driverResponse: null,
    vehicleId: { cabNumber: 'MH01AB1234', modelName: 'Toyota Innova' },
  },
  {
    _id: 'trip2',
    from: 'Churchgate',
    destination: 'Nariman Point',
    dateTime: new Date(Date.now() + 172800000).toISOString(),
    name: 'Priya Mehta',
    contact: '9988776655',
    status: 'confirmed',
    driverResponse: 'accepted',
    vehicleId: { cabNumber: 'MH02CD5678', modelName: 'Hyundai Creta' },
  },
  {
    _id: 'trip3',
    from: 'Bandra West',
    destination: 'Juhu Beach',
    dateTime: new Date(Date.now() - 86400000).toISOString(),
    name: 'Amit Patel',
    contact: '8877665544',
    status: 'completed',
    driverResponse: 'accepted',
    vehicleId: { cabNumber: 'MH03EF9012', modelName: 'Mahindra XUV500' },
  },
  {
    _id: 'trip4',
    from: 'Powai',
    destination: 'BKC',
    dateTime: new Date(Date.now() + 259200000).toISOString(),
    name: 'Sneha Reddy',
    contact: '7766554433',
    status: 'pending',
    driverResponse: null,
    vehicleId: { cabNumber: 'MH04GH3456', modelName: 'Kia Seltos' },
  },
  {
    _id: 'trip5',
    from: 'Thane',
    destination: 'Navi Mumbai',
    dateTime: new Date(Date.now() + 345600000).toISOString(),
    name: 'Vikram Singh',
    contact: '6655443322',
    status: 'pending',
    driverResponse: null,
    vehicleId: { cabNumber: 'MH05IJ7890', modelName: 'Maruti Swift' },
  },
  {
    _id: 'trip6',
    from: 'Lonavala',
    destination: 'Pune',
    dateTime: new Date(Date.now() + 432000000).toISOString(),
    name: 'Neha Gupta',
    contact: '9988771122',
    status: 'confirmed',
    driverResponse: 'accepted',
    vehicleId: { cabNumber: 'MH06KL1234', modelName: 'Tata Nexon EV' },
  },
];

export default function MyTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>(sampleTrips);
  const [responding, setResponding] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const refreshTrips = () => {
    setBookings(sampleTrips);
    showToast('Trips refreshed', 'success');
  };

  const respondToTrip = (bookingId: string, response: 'accepted' | 'rejected') => {
    setResponding(bookingId);
    setTimeout(() => {
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId
            ? {
                ...booking,
                driverResponse: response,
                status: response === 'accepted' ? 'confirmed' : 'pending',
              }
            : booking
        )
      );
      showToast(`Trip ${response} successfully`, 'success');
      setResponding(null);
    }, 500);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' && !b.driverResponse).length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const filteredBookings = bookings.filter(b => filterStatus === 'all' ? true : b.status === filterStatus);

  const getStatusConfig = (status: string, driverResponse?: string | null) => {
    if (driverResponse === 'accepted') return { label: 'Accepted', color: 'green', icon: HiCheckCircle };
    if (driverResponse === 'rejected') return { label: 'Rejected', color: 'red', icon: HiXCircle };
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'yellow', icon: HiOutlineExclamationCircle };
      case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: HiCheckCircle };
      case 'completed': return { label: 'Completed', color: 'emerald', icon: HiOutlineCheckBadge };
      case 'cancelled': return { label: 'Cancelled', color: 'rose', icon: HiXCircle };
      default: return { label: status, color: 'gray', icon: HiOutlineExclamationCircle };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">My Trips</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your assigned rides</p>
        </div>
        <button
          onClick={refreshTrips}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow transition"
        >
          <HiArrowPath className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Trips" value={stats.total} icon={<HiOutlineClipboard className="w-6 h-6" />} color="indigo" />
        <StatCard title="Pending Response" value={stats.pending} icon={<HiOutlineExclamationCircle className="w-6 h-6" />} color="amber" />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<HiCheckCircle className="w-6 h-6" />} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={<HiOutlineCheckBadge className="w-6 h-6" />} color="emerald" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterStatus(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all capitalize ${
              filterStatus === filter
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <HiOutlineTruck className="text-3xl text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No trips found</h3>
          <p className="text-sm text-slate-500">You don't have any {filterStatus !== 'all' ? filterStatus : ''} trips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking, idx) => {
            const statusConfig = getStatusConfig(booking.status, booking.driverResponse);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={booking._id}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                <div className="p-5">
                  {/* Header with route and status */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <HiOutlineMapPin className="text-orange-500 shrink-0" />
                        <span className="font-bold text-base">{booking.from}</span>
                        <span>→</span>
                        <HiOutlineMapPin className="text-blue-500 shrink-0" />
                        <span className="font-bold text-base">{booking.destination}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      statusConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                      statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      statusConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>

                  {/* Customer info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm">
                      <HiOutlineUser className="text-slate-400" />
                      <span className="font-medium">{booking.name}</span>
                      <span className="text-slate-400">•</span>
                      <HiOutlinePhone className="text-slate-400" />
                      <span>{booking.contact}</span>
                    </div>
                  </div>

                  {/* Vehicle details if assigned */}
                  {booking.vehicleId && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                      <HiOutlineTruck className="w-4 h-4" />
                      <span className="font-medium">{booking.vehicleId.cabNumber}</span>
                      <span className="text-xs">({booking.vehicleId.modelName})</span>
                    </div>
                  )}

                  {/* Action buttons for pending trips */}
                  {!booking.driverResponse && booking.status === 'pending' && (
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => respondToTrip(booking._id, 'accepted')}
                        disabled={responding === booking._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
                      >
                        {responding === booking._id ? <HiArrowPath className="animate-spin" /> : <HiCheckCircle className="w-5 h-5" />}
                        Accept
                      </button>
                      <button
                        onClick={() => respondToTrip(booking._id, 'rejected')}
                        disabled={responding === booking._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
                      >
                        {responding === booking._id ? <HiArrowPath className="animate-spin" /> : <HiXCircle className="w-5 h-5" />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Stat Card Component
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
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
          <p className="text-3xl font-black mt-1">{value}</p>
        </div>
        <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}