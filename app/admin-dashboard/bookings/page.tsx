'use client';

import React, { useEffect, useState } from 'react';
import {
  HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiChevronLeft,
  HiChevronRight, HiChevronDown, HiArrowPath, HiXMark
} from 'react-icons/hi2';
import apiClient from '@/lib/apiClient';

// --- Types -------------------------------------------------
interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  driverResponse?: 'accepted' | 'rejected' | null;
  driverId?: { _id: string; name: string } | null;
  vehicleId?: { _id: string; cabNumber: string; modelName: string } | null;
  userId?: { _id: string; name: string; email: string } | null;
}

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
}

// --- Helper: status badge colours ---------------------------
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'completed': return 'bg-green-50 text-green-600 border-green-100';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  }
};

// --- Main Component -----------------------------------------
export default function BookingsPage() {
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Assignment modal state
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
  }>({ isOpen: false, bookingId: null });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add Booking modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: '',
    contact: '',
    price: 'Start from ₹12/km'
  });

  // --- API Calls --------------------------------------------
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/api/bookings', { method: 'GET' });
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiClient('/api/admin/employees?role=driver', { method: 'GET' });
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchVehicles = async () => {
    try {
      const data = await apiClient('/api/admin/vehicles', { method: 'GET' });
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchBookings(), fetchDrivers(), fetchVehicles()]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Assignment Logic -------------------------------------
  const assignDriverAndVehicle = async () => {
    if (!assignModal.bookingId) return;
    if (!selectedDriver) {
      showToast('Please select a driver', 'error');
      return;
    }
    try {
      await apiClient(`/api/admin/bookings/${assignModal.bookingId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          driverId: selectedDriver,
          vehicleId: selectedVehicle || undefined,
        }),
      });
      showToast('Driver & vehicle assigned successfully', 'success');
      fetchBookings();
      setAssignModal({ isOpen: false, bookingId: null });
      setSelectedDriver('');
      setSelectedVehicle('');
    } catch (err: any) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  };

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await apiClient('/api/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      showToast(`Booking ${newStatus}`, 'success');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddBooking = async () => {
    if (!newBooking.from || !newBooking.destination || !newBooking.dateTime || !newBooking.name || !newBooking.contact) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    // Contact number validation (10 digits)
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(newBooking.contact)) {
      showToast('Contact number must be exactly 10 digits', 'error');
      return;
    }
    try {
      await apiClient('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking),
      });
      showToast('Booking added successfully', 'success');
      setAddModalOpen(false);
      setNewBooking({
        from: '',
        destination: '',
        dateTime: '',
        name: '',
        contact: '',
        price: 'Start from ₹12/km'
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

  // --- Filtering --------------------------------------------
  const filteredBookings = bookings.filter(booking =>
    statusFilter === 'all' ? true : booking.status === statusFilter
  );

  // --- Loading & Error States -------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <th key={i} className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((row) => (
                  <tr key={row} className="border-b border-slate-50 dark:border-slate-800 h-[72px]">
                    <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                      <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mx-auto"></div>
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                      <td key={col} className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="h-3 w-full max-w-[100px] bg-slate-50 dark:bg-slate-800/40 rounded mx-auto"></div>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Ride Bookings <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredBookings.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchAllData}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              Add Booking
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 p-4 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
            <HiOutlineXCircle className="text-xl" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar shadow-inner border-t border-slate-100 dark:border-slate-700/50">
            <table className="w-full border-collapse min-w-[1200px] md:min-w-full">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Customer Name</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Contact Number</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Pickup</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Drop Off</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Time</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Price</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Driver</th>
                  <th className="px-4 py-2 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Vehicle</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">
                    <div className="relative inline-flex items-center gap-1 cursor-pointer group hover:text-slate-900 dark:hover:text-white transition-colors">
                      <span className="uppercase">{statusFilter === 'all' ? 'Status' : statusFilter}</span>
                      <HiChevronDown className="text-slate-400 text-xs" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      >
                        <option value="all">ALL</option>
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">Driver Resp.</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-20 text-center">
                      <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineCalendar className="text-2xl text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white italic">No {statusFilter !== 'all' ? statusFilter : ''} bookings found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Try changing the status filter or refreshing data</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      {/* Customer Name */}
                      <td className="px-4 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {booking.name}
                      </td>
                      {/* Mobile Number */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {booking.contact}
                      </td>
                      {/* Pickup */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                          {booking.from}
                        </div>
                      </td>
                      {/* Dropoff */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          {booking.destination}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-1.5 text-sm text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <HiOutlineCalendar className="text-orange-500 dark:text-orange-400 text-[16px]" />
                          <span className="font-medium">{new Date(booking.dateTime).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>
                      {/* Time */}
                      <td className="px-4 py-1.5 text-sm text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <HiOutlineClock className="text-blue-500 dark:text-blue-400 text-[16px]" />
                          <span className="font-medium">{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                        <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
                          {booking.price || 'Not Specified'}
                        </p>
                      </td>
                      {/* Driver */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                        {booking.driverId ? (
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{booking.driverId.name}</span>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignModal({ isOpen: true, bookingId: booking._id });
                              setSelectedDriver('');
                              setSelectedVehicle('');
                            }}
                            className="text-indigo-600 dark:text-indigo-400 text-sm font-black hover:underline underline-offset-4"
                          >
                            + Assign
                          </button>
                        )}
                      </td>
                      {/* Vehicle */}
                      <td className="px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {booking.vehicleId?.cabNumber || '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-widest border inline-block min-w-[90px] ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      {/* Driver Response */}
                      <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center whitespace-nowrap">
                        {booking.driverResponse ? (
                          <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-bold uppercase
                            ${booking.driverResponse === 'accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {booking.driverResponse}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => updateStatus(booking._id, booking.status === 'pending' ? 'confirmed' : 'completed')}
                              disabled={updatingId === booking._id}
                              className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                              title="Update Status"
                            >
                              {updatingId === booking._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
                            </button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(booking._id, 'cancelled')}
                              disabled={updatingId === booking._id}
                              className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                              title="Cancel Booking"
                            >
                              <HiOutlineXCircle className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-end gap-8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rows per page:</span>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">100</span>
                  <HiChevronDown className="text-sm text-slate-400 dark:text-slate-600" />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                1-{filteredBookings.length} of {filteredBookings.length}
              </span>
              <div className="flex items-center gap-4">
                <button className="text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <HiChevronLeft className="text-xl" />
                </button>
                <button className="text-slate-300 dark:text-slate-700 cursor-not-allowed">
                  <HiChevronRight className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-10 overflow-y-auto subtle-scrollbar" onClick={() => setAssignModal({ isOpen: false, bookingId: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md shadow-xl" style={{ borderRadius: '0.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Assign Driver & Vehicle</h3>
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Driver *</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select driver</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.mobileNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Vehicle (optional)</label>
                <select
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.cabNumber} – {v.modelName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl">
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600">Cancel</button>
              <button onClick={assignDriverAndVehicle} className="px-3 py-1.5 text-sm font-bold bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal - Image Inspired Design */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto subtle-scrollbar animate-in fade-in duration-300" onClick={() => setAddModalOpen(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative mx-auto"
            style={{ borderRadius: '0.5rem' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pt-8 pb-4 text-center">
              <h3 className="text-2xl font-black tracking-widest uppercase text-slate-800 dark:text-white">Book Your Ride</h3>
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
                  onChange={e => setNewBooking({ ...newBooking, from: e.target.value })}
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
                  onChange={e => setNewBooking({ ...newBooking, destination: e.target.value })}
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
                  onChange={e => setNewBooking({ ...newBooking, dateTime: e.target.value })}
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
                    onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
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
                    onChange={e => {
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
                  onChange={e => setNewBooking({ ...newBooking, price: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#EB664E]/50 transition-all placeholder:text-slate-400 font-bold text-[#EB664E]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBooking}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Add Booking

                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setAddModalOpen(false)}
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