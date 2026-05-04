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
import { BookingDetailSkeleton } from '@/components/CustomerSkeletons';
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
    return <BookingDetailSkeleton />;
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
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500 font-sf">
      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0 flex items-center gap-2 md:gap-4">
            <Link
              href="/customer-dashboard/bookings"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <HiArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <h2 className="text-sm md:text-xl font-black text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tight truncate">
              Trip Details
            </h2>
          </div>
        </div>

        <div className="flex-1">
          <div className="w-full">
            {/* Main Details Card (Matches Image Design) */}
            <div className="bg-white dark:bg-slate-900 shadow-xl border-b border-slate-200 dark:border-slate-700 overflow-hidden min-h-[calc(100vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
                
                {/* Left Section: Status & Journey */}
                <div className="p-8 space-y-8 relative">
                  {/* Status Section */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Status</p>
                      <div className="flex items-center gap-3">
                        <HiOutlineClock className="text-2xl text-slate-800 dark:text-white" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none capitalize">{booking.status}</h3>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-amber-100 text-amber-700`}>
                      {booking.status}
                    </div>
                  </div>

                  {/* Journey Section */}
                  <div className="space-y-6 pt-2">
                    <div className="relative pl-8">
                      {/* Vertical line with dots */}
                      <div className="absolute left-[3px] top-[10px] bottom-[10px] w-[1.5px] bg-slate-200 dark:bg-slate-700"></div>
                      <div className="absolute left-0 top-[2px] w-2 h-2 rounded-full bg-[#FF6B00]"></div>
                      <div className="absolute left-0 bottom-[2px] w-2 h-2 rounded-full bg-[#007AFF]"></div>
                      
                      <div className="space-y-8">
                        <div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup</p>
                          <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{booking.from}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Dropoff</p>
                          <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{booking.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <HiOutlineCalendar className="text-xl text-orange-500" />
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {new Date(booking.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <HiOutlineClock className="text-xl text-blue-500" />
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Details */}
                <div className="p-8 space-y-8">
                  {/* Driver Details */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <HiOutlineUser className="text-base" /> Driver Details
                    </h4>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      {booking.driverId ? (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#00C2A0] rounded-full flex items-center justify-center text-white shadow-md">
                            <HiOutlineUser className="text-2xl" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800 dark:text-white leading-none mb-1.5">{booking.driverId.name}</p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <HiOutlinePhone className="text-sm" /> {booking.driverId.mobileNumber}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-400 italic py-2">No driver assigned yet</p>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <HiOutlineTruck className="text-base" /> Vehicle Details
                    </h4>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      {booking.vehicleId ? (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#4A72FF] rounded-full flex items-center justify-center text-white shadow-md">
                            <HiOutlineTruck className="text-2xl" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-800 dark:text-white leading-none mb-1.5">{booking.vehicleId.cabNumber}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.vehicleId.modelName}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-400 italic py-2">No vehicle assigned yet</p>
                      )}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Booking Info</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Booking ID</span>
                        <span className="font-mono font-black text-slate-800 dark:text-white opacity-80">{booking._id.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Customer Name</span>
                        <span className="font-black text-slate-800 dark:text-white uppercase">{booking.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Contact</span>
                        <span className="font-black text-slate-800 dark:text-white">{booking.contact}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Created On</span>
                        <span className="font-black text-slate-800 dark:text-white">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Help Link */}
                  <div className="text-center pt-4">
                    <p className="text-[11px] font-bold text-slate-400">
                      Need help? <button className="text-[#FF6B00] hover:underline">Contact Support</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}