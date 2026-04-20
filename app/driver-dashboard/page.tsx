'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { HiCheckCircle, HiXCircle, HiArrowPath, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi2';

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

export default function DriverDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTrips = async () => {
    try {
      const data = await apiClient('/api/driver/bookings', { method: 'GET' });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const respondToTrip = async (bookingId: string, response: 'accepted' | 'rejected') => {
    setResponding(bookingId);
    try {
      await apiClient(`/api/driver/bookings/${bookingId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
      showToast(`Trip ${response} successfully`, 'success');
      fetchTrips();
    } catch (err: any) {
      showToast(err.message || 'Failed to respond', 'error');
    } finally {
      setResponding(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const pendingResponses = bookings.filter(b => !b.driverResponse && b.status === 'pending');

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-bold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Assigned Trips</h1>
        <button onClick={fetchTrips} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-sm">
          <HiArrowPath className="w-4 h-4" /> Refresh
        </button>
      </div>

      {pendingResponses.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-4">
          <h2 className="font-bold text-amber-800 dark:text-amber-300">⚠️ Pending Your Response</h2>
          <p className="text-sm text-amber-700 dark:text-amber-400">You have {pendingResponses.length} trip(s) waiting for acceptance.</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No trips assigned yet.</div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="font-bold text-slate-800 dark:text-white">
                    {booking.from} → {booking.destination}
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><HiOutlineCalendar /> {new Date(booking.dateTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><HiOutlineClock /> {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Customer:</span> {booking.name} ({booking.contact})
                  </div>
                  {booking.vehicleId && (
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">
                      🚖 Vehicle: {booking.vehicleId.cabNumber} – {booking.vehicleId.modelName}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                    ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                    ${booking.status === 'pending' && !booking.driverResponse ? 'bg-yellow-100 text-yellow-700' : ''}
                  `}>
                    {booking.driverResponse ? `${booking.driverResponse} • ` : ''}{booking.status}
                  </span>
                  {!booking.driverResponse && booking.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => respondToTrip(booking._id, 'accepted')}
                        disabled={responding === booking._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                      >
                        <HiCheckCircle /> Accept
                      </button>
                      <button
                        onClick={() => respondToTrip(booking._id, 'rejected')}
                        disabled={responding === booking._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold"
                      >
                        <HiXCircle /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}