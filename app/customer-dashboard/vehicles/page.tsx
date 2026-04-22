'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineWrench,
  HiXMark,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlinePhone,
} from 'react-icons/hi2';

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
  capacity?: number;
  type?: string;
  pricePerKm?: number;
  ac?: boolean;
  status?: string;
}

export default function AvailableVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Booking form state
  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: '',
    contact: '',
    price: '',
  });

  // Fetch vehicles from API on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await apiClient('/api/vehicles'); // adjust endpoint if needed
        setVehicles(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch vehicles:', err);
        setError(err.message || 'Unable to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const openBookingModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    if (vehicle.pricePerKm) {
      setNewBooking(prev => ({ ...prev, price: `Start from ₹${vehicle.pricePerKm}/km` }));
    }
    setIsModalOpen(true);
  };

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!newBooking.from || !newBooking.destination || !newBooking.dateTime || !newBooking.name || !newBooking.contact) {
      showToast('Please fill all required fields', 'error');
      setSubmitting(false);
      return;
    }
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(newBooking.contact)) {
      showToast('Contact number must be exactly 10 digits', 'error');
      setSubmitting(false);
      return;
    }

    const user = getStoredUser();
    if (!user) {
      showToast('Please login to book a ride', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        from: newBooking.from,
        destination: newBooking.destination,
        dateTime: new Date(newBooking.dateTime).toISOString(),
        name: newBooking.name,
        contact: newBooking.contact,
      };
      if (newBooking.price && newBooking.price !== `Start from ₹${selectedVehicle?.pricePerKm}/km`) {
        const priceNum = parseFloat(newBooking.price);
        if (!isNaN(priceNum)) payload.price = priceNum;
      }
      if (selectedVehicle) {
        payload.vehicleId = selectedVehicle._id;
      }

      await apiClient('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast('Booking request sent successfully!', 'success');
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to create booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewBooking({
      from: '',
      destination: '',
      dateTime: '',
      name: '',
      contact: '',
      price: '',
    });
    setSelectedVehicle(null);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Available Vehicles</h1>
          <p className="text-sm text-slate-500 mt-1">Choose your ride and book instantly</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className={`bg-white dark:bg-slate-800 rounded-xl border p-5 hover:shadow-lg transition ${
              vehicle.status === 'maintenance' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <HiOutlineTruck className="text-2xl text-orange-500" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{vehicle.modelName}</h3>
              </div>
              {vehicle.status === 'maintenance' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Maintenance</span>
              )}
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <span className="font-medium">Reg No:</span> {vehicle.cabNumber}
              </p>
              <p className="flex items-center gap-2">
                <HiOutlineUserGroup className="text-slate-400" />
                <span>Capacity: {vehicle.capacity || 'N/A'} seats</span>
              </p>
              {vehicle.type && (
                <p className="flex items-center gap-2">
                  <HiOutlineWrench className="text-slate-400" />
                  <span>Type: {vehicle.type}</span>
                </p>
              )}
              {vehicle.pricePerKm && (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ₹{vehicle.pricePerKm}/km
                </p>
              )}
              {vehicle.ac !== undefined && (
                <p className="text-xs text-slate-400">{vehicle.ac ? '❄️ AC' : '🌬️ Non-AC'}</p>
              )}
            </div>

            <button
              onClick={() => openBookingModal(vehicle)}
              disabled={vehicle.status === 'maintenance'}
              className={`mt-4 w-full py-2 rounded-lg font-bold transition ${
                vehicle.status === 'maintenance'
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {vehicle.status === 'maintenance' ? 'Not Available' : 'Book This Vehicle'}
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal – Same design as "Add Booking" modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pt-8 pb-4 text-center">
              <h3 className="text-2xl font-black tracking-widest uppercase text-slate-800 dark:text-white">
                Book Your Ride {selectedVehicle && `with ${selectedVehicle.modelName}`}
              </h3>
              <div className="h-0.5 w-16 bg-[#EB664E] mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="p-8 pt-2 space-y-6">
              {/* Pickup */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <HiOutlineMapPin className="text-[#EB664E] text-sm" /> From (City / Airport)
                </label>
                <input
                  type="text"
                  placeholder="Enter pick-up location"
                  value={newBooking.from}
                  onChange={(e) => setNewBooking({ ...newBooking, from: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50 focus:ring-1 focus:ring-[#EB664E]/30 transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <HiOutlineMapPin className="text-[#3b82f6] text-sm" /> Destination
                </label>
                <input
                  type="text"
                  placeholder="Enter drop-off location"
                  value={newBooking.destination}
                  onChange={(e) => setNewBooking({ ...newBooking, destination: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <HiOutlineCalendar className="text-[#EB664E] text-sm" /> Travel Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newBooking.dateTime}
                  onChange={(e) => setNewBooking({ ...newBooking, dateTime: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50 transition-all placeholder:text-slate-400 font-medium text-slate-800 dark:text-white"
                />
              </div>

              {/* Name & Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <HiOutlineUser className="text-[#EB664E] text-sm" /> Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50 transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <HiOutlinePhone className="text-[#3b82f6] text-sm" /> Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    maxLength={10}
                    value={newBooking.contact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewBooking({ ...newBooking, contact: val });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Price Estimate */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="text-[#EB664E] text-sm font-bold">₹</span> Price Estimate
                </label>
                <input
                  type="text"
                  placeholder="Start from ₹12/km"
                  value={newBooking.price}
                  onChange={(e) => setNewBooking({ ...newBooking, price: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50 transition-all placeholder:text-slate-400 font-bold text-[#EB664E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={createBooking}
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Request Ride'}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}