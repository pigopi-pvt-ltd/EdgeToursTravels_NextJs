'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineTruck,
  HiOutlineArrowPath,
  HiXMark,
  HiOutlinePhone,
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

  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: user?.name || '',
    contact: user?.mobileNumber || '',
    price: 'Start from ₹12/km',
  });

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
    // ✅ FIX: use 'id' instead of '_id'
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
          userId: currentUser.id,          // ✅ FIX: use 'id'
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
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">My Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete history of all your rides</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-md">
          <HiOutlinePlus className="w-5 h-5" />
          <span className="font-semibold">New Booking</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={stats.total} color="slate" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Confirmed" value={stats.confirmed} color="blue" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab as any)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${filter === tab ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {tab}
            </button>
          ))}
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <HiOutlineArrowPath className="w-4 h-4" /> Refresh
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <HiOutlineCalendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">No {filter !== 'all' ? filter : ''} bookings found.</p>
          <button onClick={openModal} className="inline-block mt-4 text-orange-500 hover:underline">Book your first ride →</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
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
                    <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4" /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><HiOutlineUser className="w-4 h-4" /> {booking.name}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">{booking.contact}</span>
                  </div>
                  {booking.driverId && (
                    <div className="flex flex-wrap gap-4 text-sm bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><HiOutlineUser className="w-4 h-4" /> Driver: {booking.driverId.name}</span>
                      {booking.vehicleId && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><HiOutlineTruck className="w-4 h-4" /> {booking.vehicleId.cabNumber} ({booking.vehicleId.modelName})</span>}
                    </div>
                  )}
                  {booking.price && <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{booking.price.toLocaleString()}</p>}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                  <Link href={`/customer-dashboard/bookings/${booking._id}`} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors">
                    <HiOutlineEye className="w-5 h-5" /><span className="text-sm font-medium">View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Booking Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden border relative mx-auto" onClick={e => e.stopPropagation()}>
            <div className="pt-8 pb-4 text-center">
              <h3 className="text-2xl font-black tracking-widest uppercase text-slate-800 dark:text-white">Book Your Ride</h3>
              <div className="h-0.5 w-16 bg-[#EB664E] mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="p-8 pt-2 space-y-6">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineMapPin className="text-[#EB664E] text-sm" /> From</label>
                <input type="text" placeholder="Enter pick-up location" value={newBooking.from} onChange={e => setNewBooking({ ...newBooking, from: e.target.value })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineMapPin className="text-[#3b82f6] text-sm" /> Destination</label>
                <input type="text" placeholder="Enter drop-off location" value={newBooking.destination} onChange={e => setNewBooking({ ...newBooking, destination: e.target.value })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#3b82f6]/50" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineCalendar className="text-[#EB664E] text-sm" /> Travel Date & Time</label>
                <input type="datetime-local" value={newBooking.dateTime} onChange={e => setNewBooking({ ...newBooking, dateTime: e.target.value })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlineUser className="text-[#EB664E] text-sm" /> Name</label>
                  <input type="text" placeholder="Your name" value={newBooking.name} onChange={e => setNewBooking({ ...newBooking, name: e.target.value })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HiOutlinePhone className="text-[#3b82f6] text-sm" /> Contact</label>
                  <input type="tel" placeholder="Phone number" maxLength={10} value={newBooking.contact} onChange={e => setNewBooking({ ...newBooking, contact: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="text-[#EB664E] text-sm font-bold">₹</span> Price Estimate</label>
                <input type="text" placeholder="Start from ₹12/km" value={newBooking.price} onChange={e => setNewBooking({ ...newBooking, price: e.target.value })} className="w-full bg-slate-50 border rounded-lg px-4 py-3.5 text-sm font-bold text-[#EB664E]" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <button onClick={() => setAddModalOpen(false)} className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase text-xs">Cancel</button>
                <button onClick={handleAddBooking} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-black uppercase text-sm transition-all transform active:scale-[0.98] shadow-lg">Add Booking</button>
              </div>
            </div>
            <button onClick={() => setAddModalOpen(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors"><HiXMark className="w-6 h-6" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

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