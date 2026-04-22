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
    if (!booking) return { label: 'Unknown', color: 'gray', icon: null, bg: 'bg-gray-100' };
    if (booking.driverResponse === 'accepted') return { label: 'Accepted', color: 'green', icon: HiCheckCircle, bg: 'bg-green-100 text-green-700' };
    if (booking.driverResponse === 'rejected') return { label: 'Rejected', color: 'red', icon: HiXCircle, bg: 'bg-red-100 text-red-700' };
    switch (booking.status) {
      case 'pending': return { label: 'Pending', color: 'yellow', icon: HiOutlineClock, bg: 'bg-yellow-100 text-yellow-700' };
      case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: HiCheckCircle, bg: 'bg-blue-100 text-blue-700' };
      case 'completed': return { label: 'Completed', color: 'green', icon: HiOutlineCheckBadge, bg: 'bg-green-100 text-green-700' };
      case 'cancelled': return { label: 'Cancelled', color: 'red', icon: HiXCircle, bg: 'bg-red-100 text-red-700' };
      default: return { label: booking.status, color: 'gray', icon: null, bg: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error || 'Booking not found'}</p>
        <Link href="/customer-dashboard/bookings" className="text-orange-500 mt-4 inline-block">← Back to My Bookings</Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/customer-dashboard/bookings"
            className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <HiArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Back</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Trip Details
          </h1>
        </div>

        {/* Status Card - 3D Glassmorphism */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 transform transition-all duration-500 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</p>
              <div className="flex items-center gap-2 mt-1">
                {StatusIcon && <StatusIcon className="text-2xl" style={{ color: statusConfig.color === 'green' ? '#22c55e' : statusConfig.color === 'yellow' ? '#eab308' : statusConfig.color === 'blue' ? '#3b82f6' : '#ef4444' }} />}
                <span className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{statusConfig.label}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-md ${statusConfig.bg}`}>
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Journey Details Card - 3D */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <HiOutlineMapPin className="w-5 h-5" /> Journey Details
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-orange-500 shadow-md"></div>
                <div className="w-0.5 h-12 bg-gradient-to-b from-orange-300 to-blue-300 my-1"></div>
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pickup Location</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white mt-1">{booking.from}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dropoff Location</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white mt-1">{booking.destination}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <HiOutlineCalendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium text-slate-800 dark:text-white">{new Date(booking.dateTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <HiOutlineClock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="font-medium text-slate-800 dark:text-white">{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>
            </div>

            {booking.price && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">Total Price</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{booking.price.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Driver & Vehicle Card */}
        {(booking.driverId || booking.vehicleId) && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <HiOutlineTruck className="w-5 h-5" /> Driver & Vehicle Information
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {booking.driverId && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <HiOutlineUser className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Driver Name</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{booking.driverId.name}</p>
                    {booking.driverId.mobileNumber && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <HiOutlinePhone className="w-4 h-4" />
                        <span>{booking.driverId.mobileNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {booking.vehicleId && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <HiOutlineTruck className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{booking.vehicleId.cabNumber}</p>
                    <p className="text-sm text-slate-500">{booking.vehicleId.modelName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Information Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <HiOutlineCheckBadge className="w-5 h-5" /> Booking Information
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Booking ID</span>
              <span className="font-mono text-sm text-slate-800 dark:text-white">{booking._id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Customer Name</span>
              <span className="font-medium text-slate-800 dark:text-white">{booking.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Contact Number</span>
              <span className="font-medium text-slate-800 dark:text-white">{booking.contact}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Created On</span>
              <span className="font-medium text-slate-800 dark:text-white">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Driver Response Badge (if exists) */}
        {booking.driverResponse && (
          <div className="mt-6 flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-lg text-sm font-bold uppercase tracking-wider ${
              booking.driverResponse === 'accepted' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {booking.driverResponse === 'accepted' ? <HiCheckCircle className="w-5 h-5" /> : <HiXCircle className="w-5 h-5" />}
              Driver {booking.driverResponse} this trip
            </div>
          </div>
        )}
      </div>
    </div>
  );
}