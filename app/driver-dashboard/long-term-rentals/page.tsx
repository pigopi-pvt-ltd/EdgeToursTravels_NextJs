'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import {
  HiOutlineCalendar,
  HiOutlineMapPin,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
} from 'react-icons/hi2';

interface Rental {
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

export default function DriverLongTermRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const driver = getStoredUser();

  const fetchRentals = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/long-term-rentals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRentals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const respondToRental = async (rentalId: string, response: 'accepted' | 'rejected') => {
    setResponding(rentalId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/long-term-rentals/${rentalId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response }),
      });
      if (res.ok) {
        showToast(`Rental ${response}`, 'success');
        fetchRentals();
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)]">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
          <h1 className="text-sm md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Long‑term Rental Assignments
          </h1>
        </div>

        <div className="p-4 md:p-6">
          {toast && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {toast.message}
            </div>
          )}

          {rentals.filter(r => r.driverId?._id === driver?.id).length === 0 ? (
            <div className="text-center py-12 text-slate-400">No assignments yet</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rentals.filter(r => r.driverId?._id === driver?.id).map((rental) => {
                const days = Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 3600 * 24));
                return (
                  <div key={rental._id} className="bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <HiOutlineMapPin className="text-orange-500" />
                          <span className="font-bold">{rental.from} → {rental.destination}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          <HiOutlineCalendar className="inline mr-1" /> {new Date(rental.startDate).toLocaleDateString()} – {new Date(rental.endDate).toLocaleDateString()} ({days} days)
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium">Customer:</span> {rental.name} ({rental.contact})
                        </div>
                        {rental.vehicleId && (
                          <div className="mt-1 text-sm text-emerald-600">
                            Vehicle: {rental.vehicleId.cabNumber} ({rental.vehicleId.modelName})
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">₹{rental.price.toLocaleString()}</div>
                        <div className="text-xs text-slate-400 mt-1">Total</div>
                      </div>
                    </div>

                    {rental.status === 'assigned' && !rental.driverId?.name ? (
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => respondToRental(rental._id, 'accepted')}
                          disabled={responding === rental._id}
                          className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRental(rental._id, 'rejected')}
                          disabled={responding === rental._id}
                          className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : rental.status === 'assigned' ? (
                      <div className="mt-3 text-center text-emerald-600 font-bold">Accepted ✓</div>
                    ) : rental.status === 'completed' ? (
                      <div className="mt-3 text-center text-blue-600 font-bold">Completed</div>
                    ) : null}
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