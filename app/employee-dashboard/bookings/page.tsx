'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  HiOutlineCalendar, HiOutlineMapPin, HiOutlineUser, HiOutlinePhone,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle,
  HiArrowPath, HiMagnifyingGlass, HiFunnel
} from 'react-icons/hi2';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import apiClient from '@/lib/apiClient';
import CustomTable from '@/components/CustomTable';
import { GridColDef } from '@mui/x-data-grid';
import { IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import NotificationBell from '@/components/NotificationBell';

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
  driverResponse?: 'accepted' | 'rejected' | null;
}

// --- Main Component -----------------------------------------
export default function EmployeeBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const user = getStoredUser();
  const userName = user?.name || 'Employee';
  const userInitial = userName.charAt(0).toUpperCase();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Data fetching -----------------------------------------
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

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Status update ----------------------------------------
  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await apiClient('/api/bookings', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: newStatus }),
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

  // --- Helpers ----------------------------------------------
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'B';
  };

  // --- Table Columns ----------------------------------------
  const bookingColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'CUSTOMER',
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-3 h-full">
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-[11px] ring-1 ring-slate-100 dark:ring-slate-700 flex-shrink-0">
            {getInitials(params.value)}
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{params.value}</span>
        </div>
      )
    },
    {
      field: 'contact',
      headerName: 'CONTACT',
      width: 130,
      renderCell: (params) => <span className="text-sm font-bold text-slate-900 dark:text-white">{params.value}</span>
    },
    {
      field: 'from',
      headerName: 'PICKUP',
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-1.5 h-full">
          <HiOutlineMapPin className="text-orange-400 text-lg" />
          <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-300">{params.value}</span>
        </div>
      )
    },
    {
      field: 'destination',
      headerName: 'DROP OFF',
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-1.5 h-full">
          <HiOutlineMapPin className="text-blue-400 text-lg" />
          <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-300">{params.value}</span>
        </div>
      )
    },
    {
      field: 'dateTime',
      headerName: 'DATE',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full justify-center">
          <HiOutlineCalendar className="text-orange-500 dark:text-orange-400 text-[16px]" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(params.value).toLocaleDateString('en-GB')}</span>
        </div>
      )
    },
    {
      field: 'time',
      headerName: 'TIME',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value, row) => row.dateTime,
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full justify-center">
          <HiOutlineClock className="text-blue-500 dark:text-blue-400 text-[16px]" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
      )
    },
    {
      field: 'driverId',
      headerName: 'DRIVER',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {params.value?.name || '—'}
        </span>
      )
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
      )
    },
    {
      field: 'price',
      headerName: 'PRICE',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <p className="text-[11px] font-black text-[#EB664E] uppercase tracking-wider">
          {params.value || 'Not Specified'}
        </p>
      )
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const status = params.value;
        const colorClass =
          status === 'confirmed' ? 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]' :
            status === 'cancelled' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]' :
              status === 'completed' ? 'bg-[#F0F9FF] text-[#0EA5E9] border-[#E0F2FE]' :
                'bg-[#FFFCF0] text-[#EAB308] border-[#FEF08A]';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-black border inline-block min-w-[90px] text-center uppercase tracking-widest ${colorClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 h-full">
          {params.row.status === 'pending' && (
            <Tooltip title="Confirm Booking">
              <IconButton
                size="small"
                onClick={() => updateStatus(params.row._id, 'confirmed')}
                disabled={updatingId === params.row._id}
                className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                {updatingId === params.row._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'confirmed' && (
            <Tooltip title="Complete Booking">
              <IconButton
                size="small"
                onClick={() => updateStatus(params.row._id, 'completed')}
                disabled={updatingId === params.row._id}
                className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"
              >
                {updatingId === params.row._id ? <HiArrowPath className="text-lg animate-spin" /> : <HiOutlineCheckCircle className="text-lg" />}
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === 'pending' || params.row.status === 'confirmed') && (
            <Tooltip title="Cancel Booking">
              <IconButton
                size="small"
                onClick={() => updateStatus(params.row._id, 'cancelled')}
                disabled={updatingId === params.row._id}
                className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <HiOutlineXCircle className="text-lg" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  // --- Filtering --------------------------------------------
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;
      const matchesSearch =
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contact.includes(searchTerm) ||
        booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, searchTerm]);

  // --- Loading & Error States -------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="p-4 md:p-8">
          <div className="bg-white dark:bg-[#0A1128] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[500px]"></div>
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
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-[#0A1128]/80 py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[64px] sticky top-16 z-30 backdrop-blur-md transition-colors">
          <div className="min-w-0">
            <h2 className="text-[12px] md:text-lg font-black text-emerald-600 uppercase tracking-widest truncate">
              Manage Bookings <span className="text-slate-400 font-bold ml-1">({filteredBookings.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Welcome, {userName}
              </span>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-700 shrink-0">
                {userInitial}
              </div>
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <HiArrowPath className="text-sm" /> <span className="hidden xs:inline">Refresh</span>
            </button>
            <NotificationBell />
          </div>
        </div>

        {/* Main Content */}
        <div>
          <CustomTable
            rows={filteredBookings}
            columns={bookingColumns}
            getRowId={(row) => row._id}
            onSearch={setSearchTerm}
            extraToolbarContent={
              <div className="flex items-center gap-2">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="status-filter-label" sx={{ fontSize: '12px', fontWeight: 'bold' }}>Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      height: '36px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <MenuItem value="all" sx={{ fontSize: '13px', fontWeight: 'bold' }}>All Status</MenuItem>
                    <MenuItem value="pending" sx={{ fontSize: '13px', fontWeight: 'bold' }}>Pending</MenuItem>
                    <MenuItem value="confirmed" sx={{ fontSize: '13px', fontWeight: 'bold' }}>Confirmed</MenuItem>
                    <MenuItem value="completed" sx={{ fontSize: '13px', fontWeight: 'bold' }}>Completed</MenuItem>
                    <MenuItem value="cancelled" sx={{ fontSize: '13px', fontWeight: 'bold' }}>Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}