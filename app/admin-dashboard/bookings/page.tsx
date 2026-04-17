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
    case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed': return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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
      <div className="-mt-8 -mx-8 animate-pulse">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-screen">
          <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-4 px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded ml-4"></div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded mr-4"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
                    <th key={i} className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded mx-auto"></div></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {[1, 2, 3, 4, 5].map(row => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(cell => (
                      <td key={cell} className="px-6 py-4"><div className="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
                    ))}
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
    <div className="-mt-8 -mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-4 h-4" /> : <HiOutlineXCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-hidden min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-3.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-[14px] md:text-xl font-extrabold md:font-bold text-slate-800 dark:text-white flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight whitespace-nowrap">
            RIDE BOOKINGS <span className="text-slate-400 dark:text-slate-500 font-normal">({filteredBookings.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[11px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm whitespace-nowrap active:scale-95"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 p-4 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
            <HiOutlineXCircle className="text-xl" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Mobile No.</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Pickup</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Dropoff</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Assign Driver/Vehicles</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-wider">
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
                  <th className="px-4 py-3 text-center text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center">
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
                      <td className="px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        {booking.name}
                      </td>
                      {/* Mobile Number */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                        {booking.contact}
                      </td>
                      {/* Pickup */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                          {booking.from}
                        </div>
                      </td>
                      {/* Dropoff */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          {booking.destination}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <HiOutlineCalendar className="text-slate-300 dark:text-slate-600" />
                          {new Date(booking.dateTime).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      {/* Time */}
                     <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
  <div className="flex items-center gap-1.5">
    <HiOutlineClock className="text-slate-300 dark:text-slate-600" />
    {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
  </div>
</td>
                      {/* Price */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
                          {booking.price || 'Not Specified'}
                        </p>
                      </td>
                      {/* Driver */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center">
                        {booking.driverId ? (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{booking.driverId.name}</span>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignModal({ isOpen: true, bookingId: booking._id });
                              setSelectedDriver('');
                              setSelectedVehicle('');
                            }}
                            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
                          >
                            + Assign
                          </button>
                        )}
                      </td>
                      {/* Vehicle */}
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {booking.vehicleId?.cabNumber || '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px] ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setAssignModal({ isOpen: false, bookingId: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
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
    </div>
  );
}