'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineTruck,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiOutlineCheckBadge,
  HiCurrencyRupee,
} from 'react-icons/hi2';
import Link from 'next/link';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  driverId?: { _id: string; name: string; mobileNumber?: string; email?: string };
  vehicleId?: { _id: string; cabNumber: string; modelName: string };
  userId?: { _id: string; name: string; email: string };
  createdAt?: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const data = await apiClient(`/api/bookings/${params.id}`, { method: 'GET' });
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!booking) return { label: 'Unknown', color: 'gray', icon: null, bg: 'bg-gray-100 text-gray-700' };
    if (booking.driverResponse === 'accepted')
      return { label: 'Accepted', icon: HiCheckCircle, bg: 'bg-green-100 text-green-700' };
    if (booking.driverResponse === 'rejected')
      return { label: 'Rejected', icon: HiXCircle, bg: 'bg-red-100 text-red-700' };
    switch (booking.status) {
      case 'pending':
        return { label: 'Pending', icon: HiOutlineClock, bg: 'bg-yellow-100 text-yellow-700' };
      case 'confirmed':
        return { label: 'Confirmed', icon: HiCheckCircle, bg: 'bg-blue-100 text-blue-700' };
      case 'completed':
        return { label: 'Completed', icon: HiOutlineCheckBadge, bg: 'bg-green-100 text-green-700' };
      case 'cancelled':
        return { label: 'Cancelled', icon: HiXCircle, bg: 'bg-red-100 text-red-700' };
      default:
        return { label: booking.status, icon: null, bg: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
        <Link href="/customer-dashboard/bookings" className="text-orange-500 hover:underline">
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back button & title */}
        <div className="flex items-center gap-4 mb-5">
          <Link
            href="/customer-dashboard/bookings"
            className="flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition"
          >
            <HiArrowLeft className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Back</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Trip Details
          </h1>
        </div>

        {/* Main card – two columns on desktop */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
            {/* Left column: Journey & Status */}
            <div className="p-6 space-y-5">
              {/* Status chip */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {StatusIcon && <StatusIcon className="text-xl" />}
                    <span className="text-xl font-bold text-slate-800 dark:text-white">
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${statusConfig.bg}`}>
                  {statusConfig.label}
                </div>
              </div>

              {/* Journey path */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200"></div>
                    <div className="w-0.5 h-10 bg-gradient-to-b from-orange-300 to-blue-300 my-1"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-white">{booking.from}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dropoff</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-white">{booking.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time & Price */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                  <HiOutlineCalendar className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    {new Date(booking.dateTime).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                  <HiOutlineClock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {new Date(booking.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>

              {booking.price && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Total Fare</span>
                  <span className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                    <HiCurrencyRupee className="w-5 h-5" /> {booking.price.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Driver response badge (if exists) */}
              {booking.driverResponse && (
                <div className={`mt-2 text-center py-2 rounded-xl text-sm font-bold ${
                  booking.driverResponse === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {booking.driverResponse === 'accepted' ? '✅ Driver accepted the trip' : '❌ Driver rejected the trip'}
                </div>
              )}
            </div>

            {/* Right column: Driver & Booking Info */}
            <div className="p-6 space-y-5">
              {/* Driver Info (if assigned) */}
              {booking.driverId && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <HiOutlineUser className="w-4 h-4" /> Driver Details
                  </h3>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <HiOutlineUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{booking.driverId.name}</p>
                      {booking.driverId.mobileNumber && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <HiOutlinePhone className="w-3 h-3" />
                          <span>{booking.driverId.mobileNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Info (if assigned) */}
              {booking.vehicleId && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <HiOutlineTruck className="w-4 h-4" /> Vehicle Details
                  </h3>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <HiOutlineTruck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{booking.vehicleId.cabNumber}</p>
                      <p className="text-xs text-slate-500">{booking.vehicleId.modelName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Metadata */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Booking Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking ID</span>
                    <span className="font-mono text-slate-800 dark:text-white">{booking._id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Name</span>
                    <span className="font-medium text-slate-800 dark:text-white">{booking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact</span>
                    <span className="font-medium text-slate-800 dark:text-white">{booking.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created On</span>
                    <span className="text-slate-800 dark:text-white">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action suggestion (optional) */}
              <div className="text-center text-xs text-slate-400 pt-2">
                Need help? <button className="text-orange-500 hover:underline">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}