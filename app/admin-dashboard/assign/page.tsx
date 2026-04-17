'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiMagnifyingGlass, HiArrowPath, HiXMark, HiCheck, HiTrash, HiPencil, HiChevronUp, HiChevronDown
} from 'react-icons/hi2';

interface Booking {
  _id: string;
  from: string;
  destination: string;
  dateTime: string;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

type SortCol = 'name' | 'from' | 'destination' | 'dateTime' | 'contact' | 'status' | null;

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const RESP_BADGE: Record<string, string> = {
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected:  'bg-rose-100 text-rose-800',
};

export default function AssignPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    let rows = [...bookings];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      rows = rows.filter(b =>
        (b.userId?.name || b.name).toLowerCase().includes(t) ||
        b.from.toLowerCase().includes(t) ||
        b.destination.toLowerCase().includes(t) ||
        b.contact.includes(t)
      );
    }
    if (statusFilter !== 'all') rows = rows.filter(b => b.status === statusFilter);
    if (sortCol) {
      rows.sort((a, b) => {
        let av = '', bv = '';
        if (sortCol === 'name') { av = a.userId?.name || a.name; bv = b.userId?.name || b.name; }
        else if (sortCol === 'from') { av = a.from; bv = b.from; }
        else if (sortCol === 'destination') { av = a.destination; bv = b.destination; }
        else if (sortCol === 'dateTime') { av = a.dateTime; bv = b.dateTime; }
        else if (sortCol === 'contact') { av = a.contact; bv = b.contact; }
        else if (sortCol === 'status') { av = a.status; bv = b.status; }
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    setFiltered(rows);
  }, [searchTerm, statusFilter, bookings, sortCol, sortAsc]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchDrivers(), fetchVehicles()]);
    setLoading(false);
  };

  const fetchBookings = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBookings(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchDrivers = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees?role=driver', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setDrivers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchVehicles = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setVehicles(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortAsc(p => !p);
    else { setSortCol(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <span className="text-gray-400 ml-1 text-xs">↕</span>;
    return sortAsc
      ? <HiChevronUp className="inline w-3.5 h-3.5 ml-0.5 text-indigo-500" />
      : <HiChevronDown className="inline w-3.5 h-3.5 ml-0.5 text-indigo-500" />;
  };

  const assignDriverAndVehicle = async () => {
    if (!assignModal.bookingId) return;
    if (!selectedDriver) { showToast('Please select a driver', 'error'); return; }
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/bookings/${assignModal.bookingId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId: selectedDriver, vehicleId: selectedVehicle || undefined }),
      });
      if (res.ok) {
        showToast('Driver & vehicle assigned successfully', 'success');
        fetchBookings();
        setAssignModal({ isOpen: false, bookingId: null });
        setSelectedDriver(''); setSelectedVehicle('');
      } else { showToast('Assignment failed', 'error'); }
    } catch { showToast('Error', 'error'); }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: bookingId, status }),
      });
      if (res.ok) { showToast(`Booking ${status}`, 'success'); fetchBookings(); }
      else showToast('Update failed', 'error');
    } catch { showToast('Error', 'error'); }
    finally { setUpdatingId(null); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN');
  const fmtT = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="bg-white min-h-screen p-6 animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-10 bg-gray-100 rounded" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
    </div>
  );

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    unassigned: bookings.filter(b => !b.driverId).length,
  };

  return (
    <div className="bg-white min-h-screen p-4 md:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {toast.type === 'success' ? <HiCheck className="w-4 h-4" /> : <HiXMark className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Assign Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Assign drivers and vehicles to trips</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Bookings', value: stats.total, bg: 'bg-gray-50', text: 'text-gray-800' },
            { label: 'Pending',        value: stats.pending, bg: 'bg-amber-50', text: 'text-amber-700' },
            { label: 'Confirmed',      value: stats.confirmed, bg: 'bg-indigo-50', text: 'text-indigo-700' },
            { label: 'Unassigned',     value: stats.unassigned, bg: 'bg-rose-50', text: 'text-rose-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-gray-100`}>
              <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-2 border-b border-gray-200">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer, route, contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-64"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md p-1">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all
                  ${statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => { setAssignModal({ isOpen: true, bookingId: null }); setSelectedDriver(''); setSelectedVehicle(''); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            + New Assignment
          </button>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Simple table */}
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('name')}>Customer <SortIcon col="name" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('from')}>Pickup <SortIcon col="from" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('destination')}>Dropoff <SortIcon col="destination" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('dateTime')}>Date <SortIcon col="dateTime" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('contact')}>Contact <SortIcon col="contact" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer select-none" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Driver Resp.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">No bookings match your filters</td>
                </tr>
              ) : (
                filtered.map((b, idx) => (
                  <tr key={b._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-800">{b.userId?.name || b.name}</div>
                      {b.userId?.email && <div className="text-xs text-gray-400">{b.userId.email}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 truncate max-w-[150px]" title={b.from}>{b.from}</td>
                    <td className="px-4 py-2.5 text-gray-700 truncate max-w-[150px]" title={b.destination}>{b.destination}</td>
                    <td className="px-4 py-2.5 text-gray-600">{fmt(b.dateTime)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{fmtT(b.dateTime)}</td>
                    <td className="px-4 py-2.5 text-gray-700">{b.contact}</td>
                    <td className="px-4 py-2.5">
                      {b.driverId ? (
                        b.driverId.name
                      ) : (
                        <button
                          onClick={() => { setAssignModal({ isOpen: true, bookingId: b._id }); setSelectedDriver(''); setSelectedVehicle(''); }}
                          className="text-indigo-600 text-xs font-medium hover:underline"
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{b.vehicleId?.cabNumber || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {b.driverResponse ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RESP_BADGE[b.driverResponse]}`}>
                          {b.driverResponse}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => { setAssignModal({ isOpen: true, bookingId: b._id }); setSelectedDriver(b.driverId?._id || ''); setSelectedVehicle(b.vehicleId?._id || ''); }}
                          className="text-orange-600 hover:text-orange-800 transition"
                          title="Edit assignment"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(b._id, 'cancelled')}
                          disabled={updatingId === b._id}
                          className="text-red-600 hover:text-red-800 transition disabled:opacity-40"
                          title="Cancel booking"
                        >
                          {updatingId === b._id ? <HiArrowPath className="w-4 h-4 animate-spin" /> : <HiTrash className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setAssignModal({ isOpen: false, bookingId: null })}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-gray-800">Assign Driver & Vehicle</h3>
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="text-gray-400 hover:text-gray-600">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Driver *</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select driver</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.mobileNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Vehicle (optional)</label>
                <select
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.cabNumber} – {v.modelName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setAssignModal({ isOpen: false, bookingId: null })} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={assignDriverAndVehicle} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}