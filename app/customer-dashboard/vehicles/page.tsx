'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { VehiclesSkeleton } from '@/components/CustomerSkeletons';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiXMark,
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlinePhone,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
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

  const user = getStoredUser();

  // Booking form state
  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: user?.name || '',
    contact: user?.mobileNumber || '',
    price: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/api/vehicles');
      setVehicles(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch vehicles:', err);
      setError(err.message || 'Unable to load vehicles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openBookingModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    const currentUser = getStoredUser();
    setNewBooking({
      from: '',
      destination: '',
      dateTime: '',
      name: currentUser?.name || '',
      contact: currentUser?.mobileNumber || '',
      price: vehicle.pricePerKm ? `Start from ₹${vehicle.pricePerKm}/km` : '',
    });
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

    const currentUser = getStoredUser();
    if (!currentUser) {
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
        userId: currentUser.id,
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
    const currentUser = getStoredUser();
    setNewBooking({
      from: '',
      destination: '',
      dateTime: '',
      name: currentUser?.name || '',
      contact: currentUser?.mobileNumber || '',
      price: '',
    });
    setSelectedVehicle(null);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <VehiclesSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/30">
        <HiXCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Failed to load vehicles</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchVehicles}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-in slide-in-from-right-8 duration-300`}>
          {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Available Vehicles
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchVehicles}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-all hover:shadow-md ${
                  vehicle.status === 'maintenance' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <HiOutlineTruck className="text-2xl text-orange-500 shrink-0" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                    {vehicle.modelName}
                  </h3>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Reg No: <span className="text-slate-700 dark:text-slate-300 ml-1">{vehicle.cabNumber}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <HiOutlineUserGroup className="text-slate-400 w-4 h-4" />
                    <p>Capacity: <span className="text-slate-700 dark:text-slate-300 ml-1">{vehicle.capacity || 'N/A'} seats</span></p>
                  </div>
                </div>

                <button
                  onClick={() => openBookingModal(vehicle)}
                  disabled={vehicle.status === 'maintenance'}
                  className={`w-full py-3 rounded-xl font-bold transition-all transform active:scale-[0.98] ${
                    vehicle.status === 'maintenance'
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                  }`}
                >
                  {vehicle.status === 'maintenance' ? 'Not Available' : 'Book This Vehicle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/20 relative mx-auto animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="pt-8 pb-4 text-center">
              <h3 className="text-2xl font-black tracking-widest uppercase text-slate-800 dark:text-white">Book Your Ride</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedVehicle?.modelName} • {selectedVehicle?.cabNumber}</p>
              <div className="h-0.5 w-16 bg-orange-500 mx-auto mt-3 rounded-full"></div>
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
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase text-xs">Cancel</button>
                <button onClick={createBooking} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black uppercase text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                  {submitting ? 'Requesting...' : 'Request Ride'}
                </button>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors"><HiXMark className="w-6 h-6" /></button>
          </div>
        </div>
      )}
    </div>
  );
}