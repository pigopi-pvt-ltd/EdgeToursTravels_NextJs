'use client';

import React, { useEffect, useState } from 'react';
import {
  HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle,
  HiArrowPath, HiMagnifyingGlass
} from 'react-icons/hi2';
import { getAuthToken } from '@/lib/auth';

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
  driverId?: { name: string } | null;
  vehicleId?: { cabNumber: string } | null;
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
export default function EmployeeBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Column Drag & Drop state
  const [columns, setColumns] = useState<string[]>([
    'customer', 'contact', 'pickup', 'dropoff', 'date', 'time', 'price', 'driver', 'vehicle', 'status', 'actions'
  ]);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    customer: 180, contact: 140, pickup: 200, dropoff: 200, date: 120, time: 100, price: 100, driver: 140, vehicle: 120, status: 120, actions: 100
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // --- Data fetching -----------------------------------------
  const fetchBookings = async () => {
    const token = getAuthToken();
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(Array.isArray(data) ? data : []);
      else setError(data.error || 'Failed to fetch');
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Status update (only allowed action) ------------------
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Filtering --------------------------------------------
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contact.includes(searchTerm) ||
      booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- Column Reordering Handlers ---------------------------
  const handleDragStart = (index: number) => setDraggedColumnIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedColumnIndex === null) return;
    const newColumns = [...columns];
    const draggedItem = newColumns.splice(draggedColumnIndex, 1)[0];
    newColumns.splice(index, 0, draggedItem);
    setColumns(newColumns);
    setDraggedColumnIndex(null);
  };

  // --- Column Resizing Handlers -----------------------------
  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(id);
    setStartX(e.pageX);
    setStartWidth(columnWidths[id]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const diff = e.pageX - startX;
      setColumnWidths(prev => ({
        ...prev,
        [isResizing]: Math.max(80, startWidth + diff)
      }));
    };
    const handleMouseUp = () => setIsResizing(null);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);

  // --- Column definitions (no assignment, no driver response) -
  const getColumnConfig = (id: string) => {
    const configs: Record<string, any> = {
      customer: { label: 'Customer Name', render: (b: Booking) => b.name, className: 'font-bold' },
      contact: { label: 'Contact No', render: (b: Booking) => b.contact },
      pickup: {
        label: 'Pickup', render: (b: Booking) => (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            {b.from}
          </div>
        )
      },
      dropoff: {
        label: 'Drop Off', render: (b: Booking) => (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            {b.destination}
          </div>
        )
      },
      date: {
        label: 'Date', render: (b: Booking) => (
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="text-orange-500 text-[16px]" />
            <span className="font-medium">{new Date(b.dateTime).toLocaleDateString('en-GB')}</span>
          </div>
        )
      },
      time: {
        label: 'Time', render: (b: Booking) => (
          <div className="flex items-center gap-2">
            <HiOutlineClock className="text-blue-500 text-[16px]" />
            <span className="font-medium">{new Date(b.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        )
      },
      price: {
        label: 'Price', render: (b: Booking) => (
          <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
            {b.price || 'Not Specified'}
          </p>
        )
      },
      driver: {
        label: 'Driver', render: (b: Booking) => (
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {b.driverId?.name || '—'}
          </span>
        )
      },
      vehicle: {
        label: 'Vehicle', render: (b: Booking) => (
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {b.vehicleId?.cabNumber || '—'}
          </span>
        )
      },
      status: {
        label: 'Status', render: (b: Booking) => (
          <span className={`
            px-2 py-0.5 rounded text-sm font-bold border inline-block min-w-[100px] text-center uppercase tracking-widest
            ${b.status === 'confirmed' ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' :
              b.status === 'cancelled' ? 'bg-[#FEF2F2] dark:bg-red-900/20 text-[#EF4444] border-[#FEE2E2] dark:border-red-900/30' :
                b.status === 'completed' ? 'bg-[#F0F9FF] dark:bg-blue-900/20 text-[#0EA5E9] border-[#E0F2FE] dark:border-blue-900/30' :
                  'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30'}
            `}>
            {b.status}
          </span>
        )
      },
      actions: {
        label: 'Actions', render: (b: Booking) => (
          <div className="flex items-center justify-center gap-2">
            {b.status === 'pending' && (
              <button
                onClick={() => updateStatus(b._id, 'confirmed')}
                disabled={updatingId === b._id}
                className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                title="Confirm Booking"
              >
                {updatingId === b._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
              </button>
            )}
            {b.status === 'confirmed' && (
              <button
                onClick={() => updateStatus(b._id, 'completed')}
                disabled={updatingId === b._id}
                className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                title="Complete Booking"
              >
                {updatingId === b._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
              </button>
            )}
            {(b.status === 'pending' || b.status === 'confirmed') && (
              <button
                onClick={() => updateStatus(b._id, 'cancelled')}
                disabled={updatingId === b._id}
                className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                title="Cancel Booking"
              >
                <HiOutlineXCircle className="text-lg" />
              </button>
            )}
          </div>
        )
      }
    };
    return configs[id];
  };

  // --- Loading & Error States -------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <th key={i} className="px-4 py-3"><div className="h-3 w-20 bg-slate-200 rounded mx-auto"></div></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map(row => (
                <tr key={row} className="border-b h-[72px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
                    <td key={col} className="px-4 py-3"><div className="h-3 w-full max-w-[100px] bg-slate-100 rounded mx-auto"></div></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 text-sm font-bold">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)]">
        {/* Header Toolbar – no Add Booking button */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Manage Bookings <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredBookings.length})</span>
            </h2>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <HiArrowPath className="text-sm" /> Refresh
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, contact or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none text-sm dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto custom-scrollbar shadow-inner border-t border-slate-100 dark:border-slate-700/50">
          <table className="w-full border-collapse min-w-[1200px] md:min-w-full">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {columns.map((colId, index) => {
                  const config = getColumnConfig(colId);
                  return (
                    <th
                      key={colId}
                      draggable={!isResizing}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      style={{ width: `${columnWidths[colId]}px`, minWidth: `${columnWidths[colId]}px` }}
                      className={`px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest relative group ${draggedColumnIndex === index ? 'opacity-30' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-1 cursor-move">
                        <span className="truncate">{config.label}</span>
                        <svg className="w-2.5 h-2.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2z" />
                        </svg>
                      </div>
                      <div
                        onMouseDown={(e) => handleResizeStart(e, colId)}
                        className={`absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${isResizing === colId ? 'bg-indigo-600' : ''}`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-20 text-center">
                    <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HiOutlineCalendar className="text-2xl text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white italic">No bookings found</h3>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {columns.map(colId => {
                      const config = getColumnConfig(colId);
                      return (
                        <td
                          key={colId}
                          style={{ width: `${columnWidths[colId]}px`, minWidth: `${columnWidths[colId]}px` }}
                          className={`px-6 py-1.5 text-sm text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap truncate ${config.className || ''} ${['status', 'actions', 'price', 'vehicle', 'driver', 'time', 'date'].includes(colId) ? 'text-center' : ''
                            }`}
                        >
                          {config.render(booking)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 flex justify-between font-bold">
            <span>Total bookings: {bookings.length}</span>
            <span>Showing {filteredBookings.length} of {bookings.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}