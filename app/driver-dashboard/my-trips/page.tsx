'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
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
  HiOutlineClipboard,
  HiOutlineCheckBadge,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBell from '@/components/NotificationBell';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  vehicleId?: { cabNumber: string; modelName: string } | string | null;
}

interface LongTermRental {
  _id: string;
  from: string;
  destination: string;
  startDate: string;
  endDate: string;
  name: string;
  contact: string;
  price: number;
  status: 'pending' | 'assigned' | 'completed';
  driverId?: { _id: string; name: string };
  vehicleId?: { _id: string; cabNumber: string; modelName: string };
}

type TripItem = {
  type: 'booking' | 'longterm';
  data: Booking | LongTermRental;
};

export default function MyTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [longTermRentals, setLongTermRentals] = useState<LongTermRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'assigned'>('all');

  const { unreadCount } = useNotifications();
  const driver = getStoredUser();

  useEffect(() => {
    fetchAllTrips();
  }, []);

  // Auto‑refresh when a new trip assignment or status update arrives
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail;
      if (notification?.type === 'driver_assigned' ||
          notification?.type === 'trip_accepted' ||
          notification?.type === 'trip_rejected' ||
          notification?.type === 'trip_completed' ||
          notification?.type === 'trip_cancelled') {
        fetchAllTrips();
      }
    };
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    return () => window.removeEventListener('new-notification', handleNewNotification as EventListener);
  }, []);

  const fetchAllTrips = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      // Fetch regular bookings
      const bookingsRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok) {
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }

      // Fetch long-term rentals
      const rentalsRes = await fetch('/api/long-term-rentals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rentalsData = await rentalsRes.json();
      if (rentalsRes.ok) {
        setLongTermRentals(Array.isArray(rentalsData) ? rentalsData : []);
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const respondToTrip = async (bookingId: string, response: 'accepted' | 'rejected') => {
    setResponding(bookingId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/bookings/${bookingId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Trip ${response} successfully`, 'success');
        fetchAllTrips();
      } else {
        showToast(data.error || 'Failed to respond', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setResponding(null);
    }
  };

  const respondToLongTermRental = async (rentalId: string, response: 'accepted' | 'rejected') => {
    setResponding(rentalId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/long-term-rentals/${rentalId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response }),
      });
      if (res.ok) {
        showToast(`Rental ${response} successfully`, 'success');
        fetchAllTrips();
      } else {
        showToast('Failed to respond', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setResponding(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get all trips (bookings + long-term rentals assigned to this driver)
  const allTrips: TripItem[] = [
    ...bookings.map(b => ({ type: 'booking' as const, data: b })),
    ...longTermRentals
      .filter(r => r.driverId?._id === driver?.id)
      .map(r => ({ type: 'longterm' as const, data: r })),
  ];

  const getTripStatus = (trip: TripItem): string => {
    if (trip.type === 'booking') {
      const booking = trip.data as Booking;
      if (booking.driverResponse === 'accepted') return 'accepted';
      if (booking.driverResponse === 'rejected') return 'rejected';
      return booking.status;
    } else {
      const rental = trip.data as LongTermRental;
      return rental.status;
    }
  };

  const stats = {
    total: allTrips.length,
    pending: allTrips.filter(t => {
      if (t.type === 'booking') {
        const booking = t.data as Booking;
        return booking.status === 'pending' && !booking.driverResponse;
      }
      const rental = t.data as LongTermRental;
      return rental.status === 'pending';
    }).length,
    confirmed: allTrips.filter(t => {
      if (t.type === 'booking') {
        const booking = t.data as Booking;
        return booking.status === 'confirmed';
      }
      return false;
    }).length,
    assigned: allTrips.filter(t => {
      if (t.type === 'longterm') {
        const rental = t.data as LongTermRental;
        return rental.status === 'assigned';
      }
      return false;
    }).length,
    completed: allTrips.filter(t => {
      if (t.type === 'booking') {
        const booking = t.data as Booking;
        return booking.status === 'completed';
      }
      const rental = t.data as LongTermRental;
      return rental.status === 'completed';
    }).length,
  };

  const filteredTrips = allTrips.filter(trip => {
    if (filterStatus === 'all') return true;
    const status = getTripStatus(trip);
    return status === filterStatus;
  });

  const getStatusConfig = (trip: TripItem): { label: string; color: string; icon: any } => {
    const status = getTripStatus(trip);
    if (trip.type === 'booking') {
      const booking = trip.data as Booking;
      if (booking.driverResponse === 'accepted') {
        return { label: 'Accepted', color: 'green', icon: HiCheckCircle };
      }
      if (booking.driverResponse === 'rejected') {
        return { label: 'Rejected', color: 'red', icon: HiXCircle };
      }
      switch (status) {
        case 'pending': return { label: 'Pending', color: 'yellow', icon: HiOutlineExclamationCircle };
        case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: HiCheckCircle };
        case 'completed': return { label: 'Completed', color: 'emerald', icon: HiOutlineCheckBadge };
        case 'cancelled': return { label: 'Cancelled', color: 'rose', icon: HiXCircle };
        default: return { label: status, color: 'gray', icon: HiOutlineExclamationCircle };
      }
    } else {
      switch (status) {
        case 'pending': return { label: 'Pending Response', color: 'yellow', icon: HiOutlineExclamationCircle };
        case 'assigned': return { label: 'Assigned', color: 'blue', icon: HiCheckCircle };
        case 'completed': return { label: 'Completed', color: 'emerald', icon: HiOutlineCheckBadge };
        default: return { label: status, color: 'gray', icon: HiOutlineExclamationCircle };
      }
    }
  };

  const getVehicleDisplay = (vehicle: any) => {
    if (!vehicle) return null;
    if (typeof vehicle === 'object' && vehicle.cabNumber) return vehicle;
    return null;
  };

  const formatDate = (dateStr: string, type: 'booking' | 'longterm') => {
    if (type === 'booking') {
      return new Date(dateStr).toLocaleDateString(undefined, { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return new Date(dateStr).toLocaleDateString();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-end p-2">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
          {toast.message}
        </div>
      )}

      {/* Header with title and notification bell */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Trips</h1>
          <p className="text-sm text-slate-500">Manage your assigned trips & long-term rentals</p>
        </div>
        <NotificationBell />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Trips" value={stats.total} icon={<HiOutlineClipboard className="w-6 h-6" />} color="indigo" />
        <StatCard title="Pending Response" value={stats.pending} icon={<HiOutlineExclamationCircle className="w-6 h-6" />} color="amber" />
        <StatCard title="Confirmed" value={stats.confirmed} icon={<HiCheckCircle className="w-6 h-6" />} color="blue" />
        <StatCard title="Long-term Assigned" value={stats.assigned} icon={<HiOutlineCalendar className="w-6 h-6" />} color="purple" />
        <StatCard title="Completed" value={stats.completed} icon={<HiOutlineCheckBadge className="w-6 h-6" />} color="emerald" />
      </div>

      {/* Filter Tabs + Refresh Button */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'assigned', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all capitalize ${
                filterStatus === filter
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {filter === 'assigned' ? 'Long-term' : filter}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAllTrips}
          className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow transition text-sm"
        >
          <HiArrowPath className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <HiOutlineTruck className="text-3xl text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No trips found</h3>
          <p className="text-sm text-slate-500">You haven't been assigned any trips yet. Admin will assign you soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => {
            const statusConfig = getStatusConfig(trip);
            const StatusIcon = statusConfig.icon;
            
            if (trip.type === 'booking') {
              const booking = trip.data as Booking;
              const vehicle = getVehicleDisplay(booking.vehicleId);
              return (
                <div
                  key={`booking-${booking._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <div className="p-5">
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
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {formatDate(booking.dateTime, 'booking')}</span>
                      <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {formatTime(booking.dateTime)}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineUser className="text-slate-400" />
                        <span className="font-medium">{booking.name}</span>
                        <span className="text-slate-400">•</span>
                        <HiOutlinePhone className="text-slate-400" />
                        <span>{booking.contact}</span>
                      </div>
                    </div>
                    {vehicle && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                        <HiOutlineTruck className="w-4 h-4" />
                        <span className="font-medium">{vehicle.cabNumber}</span>
                        <span className="text-xs">({vehicle.modelName})</span>
                      </div>
                    )}
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
            } else {
              const rental = trip.data as LongTermRental;
              const days = Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 3600 * 24));
              return (
                <div
                  key={`longterm-${rental._id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <HiOutlineMapPin className="text-orange-500 shrink-0" />
                          <span className="font-bold text-base">{rental.from}</span>
                          <span>→</span>
                          <HiOutlineMapPin className="text-blue-500 shrink-0" />
                          <span className="font-bold text-base">{rental.destination}</span>
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
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {formatDate(rental.startDate, 'longterm')} – {formatDate(rental.endDate, 'longterm')}</span>
                      <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {days} days</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineUser className="text-slate-400" />
                        <span className="font-medium">{rental.name}</span>
                        <span className="text-slate-400">•</span>
                        <HiOutlinePhone className="text-slate-400" />
                        <span>{rental.contact}</span>
                      </div>
                    </div>
                    {rental.vehicleId && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                        <HiOutlineTruck className="w-4 h-4" />
                        <span className="font-medium">{rental.vehicleId.cabNumber}</span>
                        <span className="text-xs">({rental.vehicleId.modelName})</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-lg font-bold text-emerald-600">₹{rental.price.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Total for {days} days</div>
                    </div>
                    {rental.status === 'pending' && !rental.driverId?.name && (
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => respondToLongTermRental(rental._id, 'accepted')}
                          disabled={responding === rental._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
                        >
                          {responding === rental._id ? <HiArrowPath className="animate-spin" /> : <HiCheckCircle className="w-5 h-5" />}
                          Accept
                        </button>
                        <button
                          onClick={() => respondToLongTermRental(rental._id, 'rejected')}
                          disabled={responding === rental._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition transform active:scale-95 disabled:opacity-50"
                        >
                          {responding === rental._id ? <HiArrowPath className="animate-spin" /> : <HiXCircle className="w-5 h-5" />}
                          Reject
                        </button>
                      </div>
                    )}
                    {rental.status === 'assigned' && rental.driverId?.name && (
                      <div className="mt-3 text-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-lg">
                        ✓ Assigned to You
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 text-purple-600 dark:text-purple-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
          <p className="text-3xl font-black mt-1">{value}</p>
        </div>
        <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}