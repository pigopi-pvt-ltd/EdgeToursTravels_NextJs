
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineTruck,
  HiCheckCircle,
  HiArrowLeft,
} from 'react-icons/hi2';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

interface TripLocation {
  tripStarted: boolean;
  tripCompleted: boolean;
  currentLocation?: { lat: number; lng: number; address: string; updatedAt: string };
  driver?: { _id: string; name: string; mobileNumber: string };
  vehicle?: { _id: string; cabNumber: string; modelName: string };
  from: string;
  fromCoordinates?: { lat: number; lng: number };
  destination: string;
  toCoordinates?: { lat: number; lng: number };
  tripStartTime?: string;
  tripEndTime?: string;
  actualDuration?: number;
  distanceRemaining?: string;
  eta?: string;
}

export default function TrackTripPage() {
  const params = useParams();
  const [tripLocation, setTripLocation] = useState<TripLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchTripLocation();
    const interval = setInterval(fetchTripLocation, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTripLocation = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/trip-location/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTripLocation(data);
        if (data.currentLocation) {
          setDriverLocation({ lat: data.currentLocation.lat, lng: data.currentLocation.lng });
        }
        if (data.fromCoordinates && data.toCoordinates) {
          calculateRoute(data.fromCoordinates, data.toCoordinates);
        }
      } else {
        setError(data.error || 'Failed to fetch trip location');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !tripLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <p className="text-red-600 mb-4">{error || 'Trip not found'}</p>
        <Link href="/customer-dashboard/bookings" className="text-orange-500 hover:underline">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/customer-dashboard/bookings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <HiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Track Your Trip</h1>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-6 mb-6 border-2 ${
          tripLocation.tripCompleted 
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
            : tripLocation.tripStarted
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Trip Status</p>
              <p className="text-2xl font-bold mt-1">
                {tripLocation.tripCompleted 
                  ? 'Completed' 
                  : tripLocation.tripStarted 
                    ? 'In Progress' 
                    : 'Not Started'}
              </p>
              {tripLocation.actualDuration && (
                <p className="text-sm mt-1">Duration: {tripLocation.actualDuration} minutes</p>
              )}
            </div>
            <HiCheckCircle className={`w-12 h-12 ${
              tripLocation.tripCompleted 
                ? 'text-emerald-500' 
                : tripLocation.tripStarted 
                  ? 'text-blue-500' 
                  : 'text-yellow-500'
            }`} />
          </div>
        </div>

        {/* Live Map */}
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              Live Driver Location
            </h3>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={driverLocation || tripLocation.fromCoordinates || { lat: 19.076, lng: 72.8777 }}
              zoom={13}
            >
              {/* Pickup Marker */}
              {tripLocation.fromCoordinates && (
                <Marker
                  position={tripLocation.fromCoordinates}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                  title="Pickup Location"
                />
              )}
              
              {/* Destination Marker */}
              {tripLocation.toCoordinates && (
                <Marker
                  position={tripLocation.toCoordinates}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                  title="Destination"
                />
              )}
              
              {/* Driver Location Marker */}
              {driverLocation && tripLocation.tripStarted && !tripLocation.tripCompleted && (
                <Marker
                  position={driverLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                  }}
                  title="Driver Location"
                />
              )}
              
              {/* Route */}
              {directions && <DirectionsRenderer directions={directions} options={{ preserveViewport: true }} />}
            </GoogleMap>
            
            {tripLocation.currentLocation && tripLocation.tripStarted && !tripLocation.tripCompleted && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                Last updated: {new Date(tripLocation.currentLocation.updatedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        </LoadScript>

        {/* Route Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <HiOutlineMapPin className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Pickup</span>
            </div>
            <p className="font-semibold">{tripLocation.from}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <HiOutlineMapPin className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">Destination</span>
            </div>
            <p className="font-semibold">{tripLocation.destination}</p>
          </div>
        </div>

        {/* Driver Info */}
        {tripLocation.driver && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <HiOutlineUser className="text-indigo-500" />
              Driver Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <HiOutlineUser className="text-slate-400" />
                <span className="font-semibold">{tripLocation.driver.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlinePhone className="text-slate-400" />
                <span className="font-semibold">{tripLocation.driver.mobileNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Info */}
        {tripLocation.vehicle && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <HiOutlineTruck className="text-emerald-500" />
              Vehicle Details
            </h3>
            <p className="font-bold">{tripLocation.vehicle.cabNumber}</p>
            <p className="text-sm text-slate-500">{tripLocation.vehicle.modelName}</p>
          </div>
        )}

        {/* Completion Message */}
        {tripLocation.tripCompleted && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center border border-emerald-200 dark:border-emerald-800">
            <HiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Trip Completed!</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Thank you for choosing Edge Tours</p>
          </div>
        )}
      </div>
    </div>
  );
}