'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverId?: { name: string; mobileNumber?: string };
  vehicleId?: { cabNumber: string; modelName: string };
}

export default function EmployeeBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(Array.isArray(data) ? data : []);
      else showToast(data.error || 'Failed', 'error');
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        showToast(`Booking ${newStatus}`, 'success');
        fetchBookings();
      } else {
        const data = await res.json();
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredBookings = bookings
    .filter(b => filter === 'all' ? true : b.status === filter)
    .filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contact.includes(searchTerm) ||
      b.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-1.5 rounded-lg text-white text-sm font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Manage Bookings</h1>
        <button onClick={fetchBookings} className="flex items-center gap-1 text-sm border rounded-lg px-3 py-1.5">
          <HiArrowPath className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatCard label="Total" value={stats.total} color="slate" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Confirmed" value={stats.confirmed} color="blue" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition ${filter === tab ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-7 pr-2 py-1 border rounded-lg text-xs w-40 focus:w-56 transition-all"
          />
          <HiMagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Bookings Table – compact */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="px-3 py-2 text-left">DateTime</th>
                <th className="px-3 py-2 text-left">Contact</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBookings.map(booking => (
                <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-3 py-2 font-medium">{booking.name}</td>
                  <td className="px-3 py-2 text-xs">{booking.from} → {booking.destination}</td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(booking.dateTime).toLocaleDateString()}<br />
                    {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-3 py-2 text-xs">{booking.contact}</td>
                  <td className="px-3 py-2 text-xs font-bold text-emerald-600">{booking.price ? `₹${booking.price}` : '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'confirmed')}
                          disabled={updatingId === booking._id}
                          className="px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(booking._id, 'completed')}
                          disabled={updatingId === booking._id}
                          className="px-2 py-0.5 bg-green-600 text-white text-[10px] rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => updateStatus(booking._id, 'cancelled')}
                          disabled={updatingId === booking._id}
                          className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const statColorClasses = {
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
} as const;

type StatColor = keyof typeof statColorClasses;

function StatCard({ label, value, color }: { label: string; value: number; color: StatColor }) {
  return (
    <div className={`rounded-lg p-1.5 text-center text-xs font-bold ${statColorClasses[color]}`}>
      <span className="text-lg font-black">{value}</span>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}