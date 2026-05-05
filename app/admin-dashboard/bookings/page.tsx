'use client';

import React, { useEffect, useState } from 'react';
import {
  HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiArrowPath,
  HiXMark
} from 'react-icons/hi2';
import apiClient from '@/lib/apiClient';
import CustomTable from '@/components/CustomTable';
import { GridColDef } from '@mui/x-data-grid';
import { IconButton, FormControl, Select, MenuItem } from '@mui/material';

// --- types -----------------
interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime?: string;         
  startDate?: string;      
  endDate?: string;           
  durationDays?: number;      
  name: string;
  contact: string;
  price?: string | number;
  status: 'pending' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';
  createdAt: string;
  driverResponse?: 'accepted' | 'rejected' | null;
  driverId?: { _id: string; name: string } | null;
  vehicleId?: { _id: string; cabNumber: string; modelName: string } | null;
  userId?: { _id: string; name: string; email: string } | null;
  type: 'oneTime' | 'longTerm';
  notes?: string;
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

//  format date & time 
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB');
};

const formatTime = (dateTimeStr?: string) => {
  if (!dateTimeStr) return '—';
  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'assigned':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'completed':
      return 'bg-green-50 text-green-600 border-green-100';
    case 'cancelled':
      return 'bg-red-50 text-red-600 border-red-100';
    default:
      return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  }
};

// --- Main Component -----------------------------------------
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverResponseFilter, setDriverResponseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    bookingType?: 'oneTime' | 'longTerm';
  }>({ isOpen: false, bookingId: null });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    from: '', destination: '', dateTime: '', name: '', contact: '', price: 'Start from ₹12/km'
  });

  // --- API Calls --------------------------------------------
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const oneTimeData = await apiClient('/api/bookings', { method: 'GET' });
      const oneTimeBookings = (Array.isArray(oneTimeData) ? oneTimeData : []).map((b: any) => ({
        ...b,
        type: 'oneTime',
        status: b.status || 'pending',
      }));

      const longTermData = await apiClient('/api/long-term-rentals', { method: 'GET' });
      const longTermBookings = (Array.isArray(longTermData) ? longTermData : []).map((r: any) => ({
        _id: r._id,
        from: r.from,
        destination: r.destination,
        name: r.name,
        contact: r.contact,
        price: r.price,
        status: r.status || 'pending',
        createdAt: r.createdAt,
        driverId: r.driverId,
        vehicleId: r.vehicleId,
        userId: r.userId,
        startDate: r.startDate,
        endDate: r.endDate,
        durationDays: r.durationDays,
        notes: r.notes,
        type: 'longTerm',
        driverResponse: null,
      }));

      const merged = [...oneTimeBookings, ...longTermBookings].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookings(merged);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiClient('/api/admin/drivers?role=driver', { method: 'GET' });
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
      const endpoint = assignModal.bookingType === 'longTerm'
        ? `/api/long-term-rentals/${assignModal.bookingId}/assign`
        : `/api/admin/bookings/${assignModal.bookingId}/assign`;

      await apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          driverId: selectedDriver,
          vehicleId: selectedVehicle || undefined,
        }),
      });
      showToast('Assigned successfully', 'success');
      fetchBookings();
      setAssignModal({ isOpen: false, bookingId: null });
      setSelectedDriver('');
      setSelectedVehicle('');
    } catch (err: any) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  };

  // --- Status Update ----------------------------------------
  const updateStatus = async (booking: Booking, newStatus: string) => {
    setUpdatingId(booking._id);
    try {
      if (booking.type === 'longTerm') {
        await apiClient(`/api/long-term-rentals/${booking._id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
      } else {
        await apiClient('/api/bookings', {
          method: 'PATCH',
          body: JSON.stringify({ id: booking._id, status: newStatus }),
        });
      }
      showToast(`Booking ${newStatus}`, 'success');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Add one‑time booking --------------------------------
  const handleAddBooking = async () => {
    if (!newBooking.from || !newBooking.destination || !newBooking.dateTime || !newBooking.name || !newBooking.contact) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (!/^\d{10}$/.test(newBooking.contact)) {
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
        from: '', destination: '', dateTime: '', name: '', contact: '', price: 'Start from ₹12/km'
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
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;
    const matchesDriverResp = driverResponseFilter === 'all' ? true : booking.driverResponse === driverResponseFilter;
    const matchesType = typeFilter === 'all' ? true : booking.type === typeFilter;
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contact.includes(searchTerm) ||
      booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDriverResp && matchesType && matchesSearch;
  });

  // --- DataGrid Columns  ---
  const dataGridColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'CUSTOMER NAME',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">{params.value}</span>
      ),
    },
    {
      field: 'contact',
      headerName: 'CONTACT NO',
      width: 120,
    },
    {
      field: 'from',
      headerName: 'PICKUP',
      width: 160,
      renderCell: (params) => (
        <div className="flex items-center gap-1.5 h-full">
          <HiOutlineMapPin className="text-orange-400 text-lg" />
          <span className="truncate">{params.value}</span>
        </div>
      ),
    },
    {
      field: 'destination',
      headerName: 'DROP OFF',
      width: 160,
      renderCell: (params) => (
        <div className="flex items-center gap-1.5 h-full">
          <HiOutlineMapPin className="text-blue-400 text-lg" />
          <span className="truncate">{params.value}</span>
        </div>
      ),
    },
    // PICKUP DATE column
    {
      field: 'pickupDate',
      headerName: 'PICKUP DATE',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const booking = params.row;
        let dateStr = null;
        if (booking.type === 'oneTime') dateStr = booking.dateTime;
        else dateStr = booking.startDate;
        return (
          <div className="flex items-center gap-2 justify-center">
            <HiOutlineCalendar className="text-orange-500 text-[16px]" />
            <span className="font-medium text-sm">{formatDate(dateStr)}</span>
          </div>
        );
      },
    },
    // DROP OFF DATE column
    {
      field: 'dropoffDate',
      headerName: 'DROP OFF DATE',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const booking = params.row;
        if (booking.type === 'oneTime') return <span className="text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-2 justify-center">
            <HiOutlineCalendar className="text-orange-500 text-[16px]" />
            <span className="font-medium text-sm">{formatDate(booking.endDate)}</span>
          </div>
        );
      },
    },
    // DAYS column
    {
      field: 'days',
      headerName: 'DAYS',
      width: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const booking = params.row;
        if (booking.type === 'oneTime') return <span className="text-slate-400">—</span>;
        const days = booking.durationDays ||
          Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 3600 * 24));
        return <span className="font-medium">{days}</span>;
      },
    },
    // TIME column
    {
      field: 'time',
      headerName: 'TIME',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const booking = params.row;
        if (booking.type === 'longTerm') return <span className="text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-2 justify-center">
            <HiOutlineClock className="text-blue-500 text-[16px]" />
            <span className="font-medium text-sm">{formatTime(booking.dateTime)}</span>
          </div>
        );
      },
    },
    {
      field: 'price',
      headerName: 'PRICE',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
          {typeof params.value === 'number' ? `₹${params.value.toLocaleString()}` : (params.value || 'Not Specified')}
        </p>
      ),
    },
    {
      field: 'driverId',
      headerName: 'DRIVER',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => params.value ? (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{params.value.name}</span>
      ) : (
        <button
          onClick={() => {
            setAssignModal({ isOpen: true, bookingId: params.row._id, bookingType: params.row.type });
            setSelectedDriver('');
            setSelectedVehicle('');
          }}
          className="text-indigo-600 dark:text-indigo-400 text-sm font-black hover:underline underline-offset-4"
        >
          + Assign
        </button>
      ),
    },
    {
      field: 'vehicleId',
      headerName: 'VEHICLE',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {params.value?.cabNumber || '—'}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            variant="standard"
            disableUnderline
            renderValue={(selected) => {
              if (selected === 'all') return <span className="font-extrabold text-slate-500 dark:text-slate-400 text-[14px] uppercase tracking-wider">Status</span>;
              return <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-[14px] uppercase tracking-wider">{selected}</span>;
            }}
            sx={{
              height: 30,
              ".MuiSelect-select": {
                padding: '0 !important',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 800
              },
              "& .MuiSelect-icon": {
                right: -4,
                color: 'currentColor'
              }
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    mt: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    '& .MuiMenuItem-root': {
                      fontSize: '11px',
                      fontWeight: 'bold',
                      py: 1
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="all">ALL STATUS</MenuItem>
            <MenuItem value="pending">PENDING</MenuItem>
            <MenuItem value="confirmed">CONFIRMED</MenuItem>
            <MenuItem value="assigned">ASSIGNED</MenuItem>
            <MenuItem value="completed">COMPLETED</MenuItem>
            <MenuItem value="cancelled">CANCELLED</MenuItem>
          </Select>
        </FormControl>
      ),
      renderCell: (params) => {
        const status = params.value;
        const colorClass = getStatusColor(status);
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold border inline-block min-w-[90px] text-center uppercase tracking-widest ${colorClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'driverResponse',
      headerName: 'DRIVER RESP.',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderHeader: () => (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={driverResponseFilter}
            onChange={(e) => setDriverResponseFilter(e.target.value)}
            displayEmpty
            variant="standard"
            disableUnderline
            renderValue={(selected) => {
              if (selected === 'all') return <span className="font-extrabold text-slate-500 dark:text-slate-400 text-[14px] uppercase tracking-wider">Driver Resp</span>;
              return <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-[14px] uppercase tracking-wider">{selected}</span>;
            }}
            sx={{
              height: 30,
              ".MuiSelect-select": {
                padding: '0 !important',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 800
              },
              "& .MuiSelect-icon": {
                right: -4,
                color: 'currentColor'
              }
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    mt: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    '& .MuiMenuItem-root': {
                      fontSize: '11px',
                      fontWeight: 'bold',
                      py: 1
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="all">ALL RESPONSES</MenuItem>
            <MenuItem value="accepted">ACCEPTED</MenuItem>
            <MenuItem value="rejected">REJECTED</MenuItem>
          </Select>
        </FormControl>
      ),
      renderCell: (params) => {
        const value = params.value;
        if (!value) return <span className="text-xs text-slate-400">—</span>;
        const colorClass = value === 'accepted'
          ? 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]'
          : 'bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]';
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold border inline-block min-w-[100px] text-center uppercase tracking-widest ${colorClass}`}>
            {value}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 h-full">
          {(params.row.status === 'pending' || params.row.status === 'confirmed' || params.row.status === 'assigned') && (
            <IconButton
              size="small"
              onClick={() => updateStatus(params.row, params.row.status === 'pending' ? 'confirmed' : 'completed')}
              disabled={updatingId === params.row._id}
              className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              title="Update Status"
            >
              {updatingId === params.row._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
            </IconButton>
          )}
          {params.row.status !== 'cancelled' && params.row.status !== 'completed' && (
            <IconButton
              size="small"
              onClick={() => updateStatus(params.row, 'cancelled')}
              disabled={updatingId === params.row._id}
              className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
              title="Cancel Booking"
            >
              <HiOutlineXCircle className="text-lg" />
            </IconButton>
          )}
        </div>
      )
    }
  ];

  // --- Loading skeleton  ----------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <div className="bg-white dark:bg-[#0A1128] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
            <div className="h-[56px] border-b border-slate-100 dark:border-slate-800 flex items-center px-6">
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
            </div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/30 flex items-center gap-6">
                <div className="h-4 w-12 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                <div className="h-4 flex-1 bg-slate-100/50 dark:bg-slate-800/20 rounded"></div>
                <div className="h-4 w-24 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                <div className="h-4 w-40 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Main render ------------------------------------------
  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-[#0A1128]/80 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md transition-colors">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Ride Bookings<span className="text-black dark:text-white font-normal font-bold pl-1 pr-1 hidden sm:inline">({filteredBookings.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
          className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <option value="all">All types</option>
              <option value="oneTime">One‑time</option>
              <option value="longTerm">Long‑term</option>
            </select>
            <button
              onClick={fetchAllData}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <HiOutlineCalendar className="text-lg md:hidden" />
              <span className="hidden md:inline">Add Booking</span>
              <span className="md:hidden">Add</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 p-4 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3">
            <HiOutlineXCircle className="text-xl" />
            {error}
          </div>
        ) : (
          <CustomTable
            rows={filteredBookings}
            columns={dataGridColumns}
            getRowId={(row) => row._id}
            height="calc(100vh - 110px)"
            rowCount={filteredBookings.length}
            onSearch={setSearchTerm}
          />
        )}
      </div>

      {/* Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-10 overflow-y-auto subtle-scrollbar" onClick={() => setAssignModal({ isOpen: false, bookingId: null })}>
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md shadow-xl" style={{ borderRadius: '0.5rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-slate-700">
              <h3 className="text-base font-bold text-black">Assign Driver & Vehicle</h3>
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="text-black hover:text-gray-600">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">Driver *</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-black bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select driver</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.mobileNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">Vehicle (optional)</label>
                <select
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-black bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.cabNumber} – {v.modelName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl">
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md text-black hover:bg-gray-100">Cancel</button>
              <button onClick={assignDriverAndVehicle} className="px-3 py-1.5 text-sm font-bold bg-indigo-600 text-black rounded-md hover:bg-indigo-700">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 overflow-y-auto subtle-scrollbar animate-in fade-in duration-300" onClick={() => setAddModalOpen(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative mx-auto"
            style={{ borderRadius: '0.5rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-8 py-6 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Book Your Ride
              </h2>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <HiXMark size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields  */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    From (City / Airport) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-lg" />
                    <input
                      type="text"
                      placeholder="Enter pick-up location"
                      value={newBooking.from}
                      onChange={e => setNewBooking({ ...newBooking, from: e.target.value })}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg" />
                    <input
                      type="text"
                      placeholder="Enter drop-off location"
                      value={newBooking.destination}
                      onChange={e => setNewBooking({ ...newBooking, destination: e.target.value })}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    Travel Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg" />
                    <input
                      type="datetime-local"
                      value={newBooking.dateTime}
                      onChange={e => setNewBooking({ ...newBooking, dateTime: e.target.value })}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg" />
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={newBooking.name}
                      onChange={e => setNewBooking({ ...newBooking, name: e.target.value })}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 text-lg" />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      value={newBooking.contact}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNewBooking({ ...newBooking, contact: val });
                      }}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                    Price Estimate <span className="text-slate-400 font-normal normal-case ml-1">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                    <input
                      type="text"
                      placeholder="Start from ₹12/km"
                      value={newBooking.price}
                      onChange={e => setNewBooking({ ...newBooking, price: e.target.value })}
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBooking}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-w-[180px]"
                >
                  Add Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}