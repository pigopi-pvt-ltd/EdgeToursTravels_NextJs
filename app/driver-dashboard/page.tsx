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
import Link from 'next/link';

// Updated Booking interface with driverId as object
interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  driverId?: { _id: string; name: string; mobileNumber?: string } | null;
  vehicleId?: { cabNumber: string; modelName: string } | string | null;
  tripStarted?: boolean;
  tripCompleted?: boolean;
}

export default function DriverDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [startingTrip, setStartingTrip] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected'>('all');

  const { unreadCount, refresh: refreshNotifications } = useNotifications();
  const driver = getStoredUser();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail;
      if (notification?.type === 'driver_assigned') {
        fetchBookings();
      }
    };
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    return () => window.removeEventListener('new-notification', handleNewNotification as EventListener);
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
        setBookings(Array.isArray(data) ? data : []);
      } else {
        showToast(data.error || 'Failed to fetch trips', 'error');
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
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to respond', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setResponding(null);
    }
  };

  const startTrip = async (bookingId: string) => {
    if (!otpValue || otpValue.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setStartingTrip(bookingId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/bookings/${bookingId}/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Trip started successfully!', 'success');
        setShowOtpModal(null);
        setOtpValue('');
        fetchBookings();
      } else {
        showToast(data.error || 'Failed to start trip', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setStartingTrip(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter trips that belong to this driver
  const myTrips = bookings.filter(b => b.driverId && typeof b.driverId === 'object' && b.driverId._id === driver?.id);

  const stats = {
    total: myTrips.length,
    pending: myTrips.filter(b => b.status === 'pending' && !b.driverResponse).length,
    confirmed: myTrips.filter(b => b.status === 'confirmed').length,
    completed: myTrips.filter(b => b.status === 'completed').length,
    inProgress: myTrips.filter(b => b.status === 'in-progress').length,
  };

  const filteredBookings = myTrips.filter(b => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'rejected') return b.driverResponse === 'rejected';
    return b.status === filterStatus;
  });

  const getStatusConfig = (status: string, driverResponse?: string | null) => {
    if (driverResponse === 'accepted') return { label: 'Accepted', color: 'green', icon: HiCheckCircle };
    if (driverResponse === 'rejected') return { label: 'Rejected', color: 'red', icon: HiXCircle };
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'yellow', icon: HiOutlineExclamationCircle };
      case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: HiCheckCircle };
      case 'in-progress': return { label: 'In Progress', color: 'purple', icon: HiOutlineClock };
      case 'completed': return { label: 'Completed', color: 'emerald', icon: HiOutlineCheckBadge };
      case 'cancelled': return { label: 'Cancelled', color: 'rose', icon: HiXCircle };
      default: return { label: status, color: 'gray', icon: HiOutlineExclamationCircle };
    }
  };

  const getVehicleDisplay = (vehicle: any) => {
    if (!vehicle) return null;
    if (typeof vehicle === 'object' && vehicle.cabNumber) return vehicle;
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-end p-2">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
            {toast.message}
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-4">Enter OTP to Start Trip</h3>
              <p className="text-sm text-slate-500 text-center mb-4">
                Please enter the 6-digit OTP shared with the customer
              </p>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowOtpModal(null); setOtpValue(''); }} className="flex-1 py-2 border rounded-xl font-medium">
                  Cancel
                </button>
                <button onClick={() => startTrip(showOtpModal)} disabled={startingTrip === showOtpModal} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50">
                  {startingTrip === showOtpModal ? <HiArrowPath className="animate-spin w-5 h-5 mx-auto" /> : 'Start Trip'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 md:gap-2 uppercase tracking-tight truncate">
              Driver Dashboard
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Total Trips" value={stats.total} icon={<HiOutlineClipboard className="w-6 h-6" />} color="indigo" />
            <StatCard title="Pending Response" value={stats.pending} icon={<HiOutlineExclamationCircle className="w-6 h-6" />} color="amber" />
            <StatCard title="Confirmed" value={stats.confirmed} icon={<HiCheckCircle className="w-6 h-6" />} color="blue" />
            <StatCard title="In Progress" value={stats.inProgress} icon={<HiOutlineClock className="w-6 h-6" />} color="purple" />
            <StatCard title="Completed" value={stats.completed} icon={<HiOutlineCheckBadge className="w-6 h-6" />} color="emerald" />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'confirmed', 'in-progress', 'completed', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${
                    filterStatus === filter
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter === 'in-progress' ? 'Active' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Trips Grid */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <HiOutlineTruck className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No trips found</h3>
              <p className="text-sm text-slate-500">You haven't been assigned any trips yet. Admin will assign you soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status, booking.driverResponse);
                const StatusIcon = statusConfig.icon;
                const vehicle = getVehicleDisplay(booking.vehicleId);
                return (
                  <div
                    key={booking._id}
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
                          statusConfig.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                          statusConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

                      {/* Accept/Reject Buttons for Pending Trips */}
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

                      {/* Start Trip Button for Confirmed Trips */}
                      {booking.status === 'confirmed' && booking.driverResponse === 'accepted' && !booking.tripStarted && (
                        <button
                          onClick={() => setShowOtpModal(booking._id)}
                          className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                        >
                          Start Trip
                        </button>
                      )}

                      {/* Active Trip Link */}
                      {booking.status === 'in-progress' && (
                        <Link
                          href="/driver-dashboard/active-trip"
                          className="block w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-center"
                        >
                          View Active Trip
                        </Link>
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
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-5 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">{title}</p>
          <p className="text-4xl font-black tracking-tight">{value}</p>
        </div>
        <div className="p-2.5 bg-white/30 dark:bg-black/20 rounded-xl shadow-inner">{icon}</div>
      </div>
    </div>
  );
}