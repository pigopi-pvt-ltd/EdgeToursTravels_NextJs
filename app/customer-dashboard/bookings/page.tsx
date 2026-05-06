'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { BookingsSkeleton } from '@/components/CustomerSkeletons';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineTruck,
  HiArrowPath,
  HiXMark,
  HiOutlinePhone,
  HiCheckCircle,
  HiXCircle,
  HiOutlineClipboard,
  HiOutlineCheckBadge,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBell from '@/components/NotificationBell';

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const user = getStoredUser();

  const { unreadCount } = useNotifications();

  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: user?.name || '',
    contact: user?.mobileNumber || '',
    price: 'Start from ₹12/km',
  });

  // Auto‑refresh when a relevant notification arrives
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail;
      if (notification?.type === 'booking_created' ||
          notification?.type === 'driver_assigned' ||
          notification?.type === 'trip_accepted' ||
          notification?.type === 'trip_rejected' ||
          notification?.type === 'trip_completed' ||
          notification?.type === 'trip_cancelled') {
        fetchBookings();
      }
    };
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    return () => window.removeEventListener('new-notification', handleNewNotification as EventListener);
  }, []);

  const openModal = () => {
    const currentUser = getStoredUser();
    setNewBooking(prev => ({
      ...prev,
      name: currentUser?.name || '',
      contact: currentUser?.mobileNumber || '',
    }));
    setAddModalOpen(true);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/api/bookings', { method: 'GET' });
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAddBooking = async () => {
    if (!newBooking.from || !newBooking.destination || !newBooking.dateTime || !newBooking.name || !newBooking.contact) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(newBooking.contact)) {
      showToast('Contact number must be exactly 10 digits', 'error');
      return;
    }

    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      showToast('You must be logged in to book a ride', 'error');
      return;
    }

    try {
      await apiClient('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          from: newBooking.from,
          destination: newBooking.destination,
          dateTime: new Date(newBooking.dateTime).toISOString(),
          name: newBooking.name,
          contact: newBooking.contact,
          price: newBooking.price !== 'Start from ₹12/km' ? parseFloat(newBooking.price) : undefined,
          userId: currentUser.id,
        }),
      });
      showToast('Booking added successfully', 'success');
      setAddModalOpen(false);
      setNewBooking({
        from: '',
        destination: '',
        dateTime: '',
        name: currentUser.name || '',
        contact: currentUser.mobileNumber || '',
        price: 'Start from ₹12/km',
      });
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to add booking', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredBookings = bookings.filter((b) => (filter === 'all' ? true : b.status === filter));

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'yellow', icon: HiOutlineExclamationCircle };
      case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: HiCheckCircle };
      case 'completed': return { label: 'Completed', color: 'emerald', icon: HiOutlineCheckBadge };
      case 'cancelled': return { label: 'Cancelled', color: 'rose', icon: HiXCircle };
      default: return { label: status, color: 'gray', icon: HiOutlineExclamationCircle };
    }
  };

  if (loading) return <BookingsSkeleton />;

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-in slide-in-from-right-8 duration-300`}>
          {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
          {toast.message}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              My Bookings
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
            <button
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <HiOutlinePlus className="text-sm" />
              New Booking
            </button>
            <NotificationBell />
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Total" value={stats.total} icon={<HiOutlineClipboard className="w-5 h-5 md:w-6 md:h-6" />} color="indigo" />
            <StatCard title="Pending" value={stats.pending} icon={<HiOutlineExclamationCircle className="w-5 h-5 md:w-6 md:h-6" />} color="amber" />
            <StatCard title="Confirmed" value={stats.confirmed} icon={<HiCheckCircle className="w-5 h-5 md:w-6 md:h-6" />} color="blue" />
            <StatCard title="Completed" value={stats.completed} icon={<HiOutlineCheckBadge className="w-5 h-5 md:w-6 md:h-6" />} color="emerald" />
            <StatCard title="Cancelled" value={stats.cancelled} icon={<HiXCircle className="w-5 h-5 md:w-6 md:h-6" />} color="rose" />
          </div>

          {/* Filter Tabs  */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider transition-all ${filter === tab
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Bookings Grid  */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineCalendar className="text-2xl text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No bookings found</h3>
                <p className="text-sm text-slate-500">You don't have any {filter !== 'all' ? filter : ''} bookings.</p>
                <button onClick={openModal} className="mt-4 px-6 py-2 bg-orange-100 text-orange-600 rounded-full font-bold text-sm hover:bg-orange-200 transition-colors">Book your first ride</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={booking._id}
                      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-3 flex-1">
                            {/* Route */}
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <HiOutlineMapPin className="text-orange-500 shrink-0" />
                              <span className="font-bold text-sm md:text-base">{booking.from}</span>
                              <span className="text-slate-400">→</span>
                              <HiOutlineMapPin className="text-blue-500 shrink-0" />
                              <span className="font-bold text-sm md:text-base">{booking.destination}</span>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center gap-4 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5">
                                <HiOutlineCalendar className="w-4 h-4" />
                                {new Date(booking.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HiOutlineClock className="w-4 h-4" />
                                {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                              <HiOutlineUser className="w-4 h-4" />
                              <span>{booking.name}</span>
                              <span className="text-slate-300">|</span>
                              <span>{booking.contact}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                              statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                  statusConfig.color === 'rose' ? 'bg-rose-100 text-rose-700' :
                                    'bg-slate-100 text-slate-700'
                              }`}>
                              <span>{statusConfig.label}</span>
                            </div>
                            <Link href={`/customer-dashboard/bookings/${booking._id}`} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors">
                              <HiOutlineEye className="w-4 h-4" />
                              View Details
                            </Link>
                          </div>
                        </div>

                        {/* Driver & Vehicle Box */}
                        {booking.driverId && (
                          <div className="mt-4 flex flex-wrap items-center gap-6 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <HiOutlineUser className="w-4 h-4" />
                              <span className="tracking-wider">Driver: {booking.driverId.name}</span>
                            </div>
                            {booking.vehicleId && (
                              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <HiOutlineTruck className="w-4 h-4" />
                                <span className="tracking-wider">{booking.vehicleId.cabNumber} ({booking.vehicleId.modelName})</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Booking Modal  */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 relative mx-auto animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="pt-8 pb-4 text-center">
              <h3 className="text-2xl font-black tracking-widest uppercase text-slate-800 dark:text-white">Book Your Ride</h3>
              <div className="h-0.5 w-16 bg-orange-500 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="p-8 pt-2 space-y-6">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineMapPin className="text-orange-500 text-sm" /> From</label>
                <input type="text" placeholder="Enter pick-up location" value={newBooking.from} onChange={e => setNewBooking({ ...newBooking, from: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineMapPin className="text-blue-500 text-sm" /> Destination</label>
                <input type="text" placeholder="Enter drop-off location" value={newBooking.destination} onChange={e => setNewBooking({ ...newBooking, destination: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineCalendar className="text-orange-500 text-sm" /> Travel Date & Time</label>
                <input type="datetime-local" value={newBooking.dateTime} onChange={e => setNewBooking({ ...newBooking, dateTime: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineUser className="text-orange-500 text-sm" /> Name</label>
                  <input type="text" placeholder="Your name" value={newBooking.name} onChange={e => setNewBooking({ ...newBooking, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlinePhone className="text-blue-500 text-sm" /> Contact</label>
                  <input type="tel" placeholder="Phone number" maxLength={10} value={newBooking.contact} onChange={e => setNewBooking({ ...newBooking, contact: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="text-orange-500 text-sm font-bold">₹</span> Price Estimate</label>
                <input type="text" placeholder="Start from ₹12/km" value={newBooking.price} onChange={e => setNewBooking({ ...newBooking, price: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-black text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button onClick={() => setAddModalOpen(false)} className="px-6 py-3 rounded-xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-xs">Cancel</button>
                <button onClick={handleAddBooking} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black uppercase text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-orange-500/20">Add Booking</button>
              </div>
            </div>
            <button onClick={() => setAddModalOpen(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors"><HiXMark className="w-6 h-6" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-5 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
          <p className="text-2xl md:text-3xl font-black mt-1">{value}</p>
        </div>
        <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}