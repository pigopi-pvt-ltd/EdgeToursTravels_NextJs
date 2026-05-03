'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTruck,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
} from 'react-icons/hi2';

interface Rental {
  _id: string;
  from: string;
  destination: string;
  startDate: string;
  endDate: string;
  name: string;
  contact: string;
  price: number;
  status: 'pending' | 'assigned' | 'completed';
  driverId?: { _id: string; name: string };
  vehicleId?: { _id: string; cabNumber: string; modelName: string };
  userId?: { _id: string; name: string };
  notes?: string;
}

interface Driver {
  _id: string;
  name: string;
  mobileNumber: string;
  driverDetails?: { availabilityStatus?: string };
}

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
}

export default function AdminLongTermRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchRentals = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/long-term-rentals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRentals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrivers = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees?role=driver', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  const fetchVehicles = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {}
  };

  useEffect(() => {
    Promise.all([fetchRentals(), fetchDrivers(), fetchVehicles()]).finally(() => setLoading(false));
  }, []);

  const assignDriverAndVehicle = async () => {
    if (!selectedRental) return;
    if (!assignDriverId) {
      showToast('Please select a driver', 'error');
      return;
    }
    setSubmitting(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/long-term-rentals/${selectedRental._id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId: assignDriverId, vehicleId: assignVehicleId || undefined }),
      });
      if (res.ok) {
        showToast('Assigned successfully', 'success');
        fetchRentals();
        setModalOpen(false);
        setSelectedRental(null);
        setAssignDriverId('');
        setAssignVehicleId('');
      } else {
        showToast('Assignment failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)]">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
          <h1 className="text-sm md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Long‑term Rental Requests
          </h1>
        </div>

        <div className="p-4 md:p-6">
          {toast && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {toast.message}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rentals.map((rental) => {
                  const days = Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 3600 * 24));
                  return (
                    <tr key={rental._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{rental.name}</div>
                        <div className="text-xs text-slate-500">{rental.contact}</div>
                       </td>
                      <td className="px-4 py-3 text-sm">{rental.from} → {rental.destination}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(rental.startDate).toLocaleDateString()} – {new Date(rental.endDate).toLocaleDateString()}<br/>
                        <span className="text-xs text-slate-400">{days} days</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹{rental.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${rental.status === 'assigned' ? 'bg-blue-100 text-blue-700' : rental.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rental.status === 'pending' && (
                          <button
                            onClick={() => { setSelectedRental(rental); setModalOpen(true); }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-bold"
                          >
                            Assign
                          </button>
                        )}
                        {rental.driverId && <div className="text-xs">Driver: {rental.driverId.name}</div>}
                      </td>
                    </tr>
                  );
                })}
                {rentals.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400">No rental requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {modalOpen && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Assign Driver & Vehicle</h3>
              <button onClick={() => setModalOpen(false)}><HiXCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Driver</label>
                <select value={assignDriverId} onChange={e => setAssignDriverId(e.target.value)} className="w-full border rounded-md px-3 py-2">
                  <option value="">Select driver</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} – {d.driverDetails?.availabilityStatus === 'available' ? 'Available' : 'Unavailable'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Vehicle (optional)</label>
                <select value={assignVehicleId} onChange={e => setAssignVehicleId(e.target.value)} className="w-full border rounded-md px-3 py-2">
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.cabNumber} – {v.modelName}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 border rounded-md">Cancel</button>
              <button onClick={assignDriverAndVehicle} disabled={submitting} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md font-bold">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}