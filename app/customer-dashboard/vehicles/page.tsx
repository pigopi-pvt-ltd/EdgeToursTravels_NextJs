'use client';

import { useState } from 'react';
import {
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineWrench,
  HiXMark,
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

// Static sample vehicles (no API)
const sampleVehicles: Vehicle[] = [
  {
    _id: 'sample1',
    cabNumber: 'MH01AB1234',
    modelName: 'Toyota Innova',
    capacity: 7,
    type: 'SUV',
    pricePerKm: 18,
    ac: true,
    status: 'available',
  },
  {
    _id: 'sample2',
    cabNumber: 'MH02CD5678',
    modelName: 'Hyundai Creta',
    capacity: 5,
    type: 'SUV',
    pricePerKm: 15,
    ac: true,
    status: 'available',
  },
  {
    _id: 'sample3',
    cabNumber: 'MH03EF9012',
    modelName: 'Mahindra XUV500',
    capacity: 7,
    type: 'SUV',
    pricePerKm: 20,
    ac: true,
    status: 'maintenance',
  },
  {
    _id: 'sample4',
    cabNumber: 'MH04GH3456',
    modelName: 'Kia Seltos',
    capacity: 5,
    type: 'SUV',
    pricePerKm: 14,
    ac: true,
    status: 'available',
  },
  {
    _id: 'sample5',
    cabNumber: 'MH05IJ7890',
    modelName: 'Maruti Swift',
    capacity: 4,
    type: 'Hatchback',
    pricePerKm: 12,
    ac: true,
    status: 'available',
  },
  {
    _id: 'sample6',
    cabNumber: 'MH06KL1234',
    modelName: 'Tata Nexon EV',
    capacity: 5,
    type: 'Electric SUV',
    pricePerKm: 10,
    ac: true,
    status: 'available',
  },
];

export default function AvailableVehicles() {
  const [vehicles] = useState<Vehicle[]>(sampleVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Booking form state
  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: '',
    contact: '',
    price: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const openBookingModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
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

    // Simulate API call (replace with actual API if needed)
    try {
      // Optional: call your real booking API
      // await apiClient('/api/bookings', { method: 'POST', body: JSON.stringify({ ... }) });
      
      // For demo, just show success
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

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Request a Ride {selectedVehicle && `with ${selectedVehicle.modelName}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={createBooking} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter pickup address"
                  value={newBooking.from}
                  onChange={e => setNewBooking({ ...newBooking, from: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Dropoff Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter destination"
                  value={newBooking.destination}
                  onChange={e => setNewBooking({ ...newBooking, destination: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newBooking.dateTime}
                  onChange={e => setNewBooking({ ...newBooking, dateTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={newBooking.name}
                  onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={newBooking.contact}
                  onChange={e => setNewBooking({ ...newBooking, contact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price (optional)</label>
                <input
                  type="number"
                  placeholder="Estimated fare"
                  value={newBooking.price}
                  onChange={e => setNewBooking({ ...newBooking, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none dark:bg-slate-700 dark:border-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Request Ride'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}