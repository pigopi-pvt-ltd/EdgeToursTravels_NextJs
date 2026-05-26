// app/driver-dashboard/active-trip/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineTruck,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiOutlineFlag,
} from 'react-icons/hi2';

// Only load Google Maps if API key exists
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface ActiveTrip {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  otp?: string;
  tripStarted: boolean;
  tripStartTime?: string;
  tripCompleted: boolean;
  vehicleId?: { cabNumber: string; modelName: string };
}

export default function ActiveTripPage() {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tripDuration, setTripDuration] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchActiveTrip();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeTrip?.tripStarted && activeTrip?.tripStartTime && !activeTrip?.tripCompleted) {
      const interval = setInterval(() => {
        const start = new Date(activeTrip.tripStartTime!);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        setTripDuration(`${diffMins}m ${diffSecs}s`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTrip?.tripStarted, activeTrip?.tripStartTime, activeTrip?.tripCompleted]);

  const fetchActiveTrip = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/driver/active-trip', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.trip) {
        setActiveTrip(data.trip);
        if (data.trip.tripStarted) {
          startLocationTracking();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        const token = getAuthToken();
        await fetch(`/api/bookings/${activeTrip?._id}/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            location: { lat: latitude, lng: longitude },
          }),
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  const startTrip = async () => {
    if (!otpInput || otpInput.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setVerifying(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/bookings/${activeTrip?._id}/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Trip started successfully!', 'success');
        setActiveTrip(prev => prev ? { ...prev, tripStarted: true, tripStartTime: new Date().toISOString() } : null);
        startLocationTracking();
      } else {
        showToast(data.error || 'Failed to start trip', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const completeTrip = async () => {
    if (!confirm('Have you reached the destination? Confirm to complete the trip.')) return;
    
    setCompleting(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/bookings/${activeTrip?._id}/complete-trip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Trip completed successfully!', 'success');
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        setTimeout(() => {
          window.location.href = '/driver-dashboard';
        }, 2000);
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to complete trip', 'error');
      }
    } catch (error) {
      showToast('Failed to complete trip', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <HiOutlineFlag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No Active Trip</h2>
          <p className="text-slate-500 mb-6">You don't have any active trips at the moment.</p>
          <div className="space-y-3">
            <Link href="/driver-dashboard" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
              Back to Dashboard
            </Link>
            <div className="text-sm text-slate-400">
              <p>To get an active trip:</p>
              <ol className="list-decimal list-inside text-left mt-2">
                <li>Admin needs to assign you to a booking</li>
                <li>Accept the trip from your dashboard</li>
                <li>Enter OTP to start the trip</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-in slide-in-from-right-8 duration-300`}>
          {toast.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiXCircle className="text-xl" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HiOutlineFlag className="text-orange-500" />
            Active Trip
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your current trip</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-6 mb-6 border-2 ${
          activeTrip.tripStarted 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Trip Status</p>
              <p className="text-2xl font-bold mt-1">
                {activeTrip.tripStarted ? 'In Progress' : 'Ready to Start'}
              </p>
              {activeTrip.tripStarted && activeTrip.tripStartTime && (
                <p className="text-sm text-slate-600 mt-1">Duration: {tripDuration || 'Calculating...'}</p>
              )}
            </div>
            {activeTrip.tripStarted ? (
              <HiCheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <HiOutlineClock className="w-12 h-12 text-orange-500" />
            )}
          </div>

          {!activeTrip.tripStarted && (
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Enter OTP to Start Trip</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-center text-2xl font-bold tracking-widest"
                />
                <button
                  onClick={startTrip}
                  disabled={verifying}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {verifying ? <HiArrowPath className="animate-spin w-5 h-5" /> : 'Start Trip'}
                </button>
              </div>
              {activeTrip.otp && (
                <p className="text-xs text-slate-400 mt-2">OTP: {activeTrip.otp}</p>
              )}
            </div>
          )}
        </div>

        {/* Trip Route */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineMapPin className="text-orange-500" />
            Trip Route
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineMapPin className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Pickup</p>
                <p className="font-semibold text-slate-800 dark:text-white">{activeTrip.from}</p>
                <p className="text-xs text-slate-500">{new Date(activeTrip.dateTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineFlag className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Destination</p>
                <p className="font-semibold text-slate-800 dark:text-white">{activeTrip.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <HiOutlineUser className="text-indigo-500" />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <HiOutlineUser className="text-slate-400 w-5 h-5" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeTrip.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <HiOutlinePhone className="text-slate-400 w-5 h-5" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeTrip.contact}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {activeTrip.vehicleId && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineTruck className="text-emerald-500" />
              Vehicle Details
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-white">{activeTrip.vehicleId.cabNumber}</p>
              <p className="text-sm text-slate-500">{activeTrip.vehicleId.modelName}</p>
            </div>
          </div>
        )}

        {/* Location Status */}
        {activeTrip.tripStarted && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <HiOutlineMapPin className="text-red-500" />
              Location Status
            </h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${watchIdRef.current ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {watchIdRef.current ? 'Location tracking active' : 'Location tracking inactive'}
              </p>
            </div>
            {currentLocation && (
              <p className="text-xs text-slate-400 mt-2">
                Current position: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Complete Trip Button */}
        {activeTrip.tripStarted && !activeTrip.tripCompleted && (
          <button
            onClick={completeTrip}
            disabled={completing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {completing ? <HiArrowPath className="animate-spin w-5 h-5" /> : <HiCheckCircle className="w-5 h-5" />}
            Complete Trip
          </button>
        )}
      </div>
    </div>
  );
}