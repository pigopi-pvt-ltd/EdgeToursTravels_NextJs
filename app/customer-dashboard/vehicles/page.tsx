'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { VehiclesSkeleton } from '@/components/CustomerSkeletons';
import { getStoredUser } from '@/lib/auth';
import {
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiXMark,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi2';

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
  capacity?: number;
  type?: string;
  pricePerDay?: number;
  ac?: boolean;
  status?: string;
}

type BookingType = 'oneTime' | 'longTerm';
type ToastType = { message: string; kind: 'success' | 'error' } | null;

const DURATION_OPTIONS = [
  { label: '15 days', days: 15 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

const TYPE_ICONS: Record<string, string> = {
  SUV: '🚙', MPV: '🚐', Sedan: '🚗', Bus: '🚌', Hatchback: '🚗', Truck: '🚛',
};
const typeIcon = (t?: string) => TYPE_ICONS[t ?? ''] ?? '🚗';

function calcEstimate(pricePerDay = 1000, days: number): number {
  let total = pricePerDay * days;
  if (days >= 365) total *= 0.8;
  else if (days >= 30) total *= 0.9;
  return Math.round(total);
}

function Toast({ toast }: { toast: ToastType }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-24 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-white text-xs font-bold animate-in slide-in-from-right-8 duration-300 ${toast.kind === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {toast.kind === 'success' ? <HiCheckCircle className="text-lg" /> : <HiXCircle className="text-lg" />}
      {toast.message}
    </div>
  );
}

function FilterPills({ types, active, onChange }: { types: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {['All', ...types].map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${active === t ? 'bg-[#0f4c35] border-[#0f4c35] text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function VehicleCard({ vehicle, onBook }: { vehicle: Vehicle; onBook: (v: Vehicle) => void }) {
  const isMaint = vehicle.status === 'maintenance';
  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3 transition-all duration-200 ${isMaint ? 'opacity-50' : 'hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}`}>
      <span className={`absolute top-2 right-2 text-[9px] font-medium px-2 py-0.5 rounded-full ${isMaint ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
        {isMaint ? 'Maintenance' : 'Available'}
      </span>
      <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xl">{typeIcon(vehicle.type)}</div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight pr-6">{vehicle.modelName}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{vehicle.cabNumber}</p>
      </div>
      <hr className="border-slate-100 dark:border-slate-700" />
      <div className="flex justify-between text-[10px]">
        <div><p className="uppercase text-slate-400">Seats</p><p className="font-medium">{vehicle.capacity ?? '–'}</p></div>
        <div><p className="uppercase text-slate-400">Type</p><p className="font-medium">{vehicle.type ?? '–'}</p></div>
        <div><p className="uppercase text-slate-400">Rate</p><p className="font-semibold text-orange-500">₹{(vehicle.pricePerDay ?? 1000).toLocaleString()}/day</p></div>
      </div>
      <button disabled={isMaint} onClick={() => onBook(vehicle)} className="w-full py-2 rounded-lg text-[11px] font-medium bg-[#0f4c35] hover:bg-[#16a066] text-white disabled:opacity-50 transition-all">
        Book This Vehicle
      </button>
    </div>
  );
}

const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500/50 font-bold';
function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">{icon} {label}</label>
      {children}
    </div>
  );
}

function OneTimeForm({ vehicle, onSuccess, onCancel }: { vehicle: Vehicle; onSuccess: () => void; onCancel: () => void }) {
  const user = getStoredUser();
  const [form, setForm] = useState({ from: '', destination: '', dateTime: '', name: user?.name ?? '', contact: user?.mobileNumber ?? '', price: vehicle.pricePerDay ? `From ₹${vehicle.pricePerDay}/day` : '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.from || !form.destination || !form.dateTime || !form.name || !form.contact) { setErr('All fields required.'); return; }
    if (!/^\d{10}$/.test(form.contact)) { setErr('Contact must be 10 digits.'); return; }
    const currentUser = getStoredUser();
    if (!currentUser) { setErr('Please login to book.'); return; }
    setSubmitting(true);
    try {
      await apiClient('/api/bookings', { method: 'POST', body: JSON.stringify({ from: form.from, destination: form.destination, dateTime: new Date(form.dateTime).toISOString(), name: form.name, contact: form.contact, userId: currentUser.id, vehicleId: vehicle._id, price: parseFloat(form.price) || undefined }) });
      onSuccess();
    } catch (ex: any) { setErr(ex.message ?? 'Booking failed.'); } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{err}</p>}
      <FormField label="From" icon={<HiOutlineMapPin className="text-orange-400 text-sm" />}>
        <input className={inputCls} placeholder="Pick-up" value={form.from} onChange={set('from')} required />
      </FormField>
      <FormField label="Destination" icon={<HiOutlineMapPin className="text-blue-400 text-sm" />}>
        <input className={inputCls} placeholder="Drop-off" value={form.destination} onChange={set('destination')} required />
      </FormField>
      <FormField label="Date & Time" icon={<HiOutlineCalendar className="text-orange-400 text-sm" />}>
        <input type="datetime-local" className={inputCls} value={form.dateTime} onChange={set('dateTime')} required />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name" icon={<HiOutlineUser className="text-orange-400 text-sm" />}>
          <input className={inputCls} placeholder="Name" value={form.name} onChange={set('name')} required />
        </FormField>
        <FormField label="Contact" icon={<HiOutlinePhone className="text-blue-400 text-sm" />}>
          <input className={inputCls} placeholder="10 digits" maxLength={10} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required />
        </FormField>
      </div>
      <FormField label="Price Estimate" icon={<span className="text-orange-500 text-sm font-bold">₹</span>}>
        <input className={inputCls + ' text-orange-600'} placeholder="Optional" value={form.price} onChange={set('price')} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
        <button type="submit" disabled={submitting} className="px-5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-md">{submitting ? '...' : 'Request ride'}</button>
      </div>
    </form>
  );
}

function LongTermForm({ vehicle, onSuccess, onCancel }: { vehicle: Vehicle; onSuccess: () => void; onCancel: () => void }) {
  const user = getStoredUser();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const [form, setForm] = useState({ from: '', destination: '', startDate: tomorrow.toISOString().split('T')[0], durationDays: 30, name: user?.name ?? '', contact: user?.mobileNumber ?? '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const estimated = calcEstimate(vehicle.pricePerDay, form.durationDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.from || !form.destination || !form.startDate || !form.name || !form.contact) { setErr('All fields required.'); return; }
    if (!/^\d{10}$/.test(form.contact)) { setErr('Contact must be 10 digits.'); return; }
    const currentUser = getStoredUser();
    if (!currentUser) { setErr('Please login.'); return; }
    setSubmitting(true);
    try {
      const start = new Date(form.startDate);
      const end = new Date(start); end.setDate(start.getDate() + form.durationDays);
      await fetch('/api/long-term-rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ userId: currentUser.id, vehicleId: vehicle._id, from: form.from, destination: form.destination, startDate: start.toISOString(), endDate: end.toISOString(), name: form.name, contact: form.contact, price: estimated, notes: form.notes }),
      });
      onSuccess();
    } catch (ex: any) { setErr(ex.message ?? 'Rental failed.'); } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{err}</p>}
      <FormField label="From" icon={<HiOutlineMapPin className="text-orange-400 text-sm" />}><input className={inputCls} placeholder="Pick-up" value={form.from} onChange={set('from')} required /></FormField>
      <FormField label="Destination" icon={<HiOutlineMapPin className="text-blue-400 text-sm" />}><input className={inputCls} placeholder="Drop-off" value={form.destination} onChange={set('destination')} required /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Date" icon={<HiOutlineCalendar className="text-orange-400 text-sm" />}><input type="date" className={inputCls} value={form.startDate} onChange={set('startDate')} required /></FormField>
        <div>
          <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1"><HiOutlineClock className="text-blue-400 text-sm" /> Duration</label>
          <div className="flex flex-wrap gap-1">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.days} type="button" onClick={() => setForm(p => ({ ...p, durationDays: opt.days }))} className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${form.durationDays === opt.days ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 dark:bg-slate-700 border-slate-200'}`}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between bg-emerald-50 rounded-lg px-3 py-1.5 text-xs"><span className="font-bold">Est. total</span><span className="font-bold text-orange-600">₹{estimated.toLocaleString()}</span></div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Name" icon={<HiOutlineUser className="text-orange-400 text-sm" />}><input className={inputCls} placeholder="Name" value={form.name} onChange={set('name')} required /></FormField>
        <FormField label="Contact" icon={<HiOutlinePhone className="text-blue-400 text-sm" />}><input className={inputCls} placeholder="10 digits" maxLength={10} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required /></FormField>
      </div>
      <FormField label="Notes" icon={<span className="text-slate-500 text-sm">📝</span>}><textarea className={inputCls + ' resize-none'} rows={2} placeholder="Special requests..." value={form.notes} onChange={set('notes')} /></FormField>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100">Cancel</button>
        <button type="submit" disabled={submitting} className="px-5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-md">{submitting ? '...' : 'Request rental'}</button>
      </div>
    </form>
  );
}

function BookingModal({ vehicle, onClose, onSuccess }: { vehicle: Vehicle; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [tab, setTab] = useState<BookingType>('oneTime');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="pt-5 pb-2 text-center">
          <h3 className="text-xl font-black tracking-wider uppercase">Book Your Ride</h3>
          <div className="h-0.5 w-12 bg-orange-500 mx-auto mt-1.5 rounded-full"></div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex justify-center gap-3 mb-5">
            <button onClick={() => setTab('oneTime')} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${tab === 'oneTime' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>One‑time trip</button>
            <button onClick={() => setTab('longTerm')} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${tab === 'longTerm' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>Long‑term rental</button>
          </div>
          {tab === 'oneTime' ? <OneTimeForm vehicle={vehicle} onSuccess={() => onSuccess('Ride request sent!')} onCancel={onClose} /> : <LongTermForm vehicle={vehicle} onSuccess={() => onSuccess('Rental request submitted!')} onCancel={onClose} />}
        </div>
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-400 hover:text-slate-600"><HiXMark className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

export default function AvailableVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [toast, setToast] = useState<ToastType>(null);
  const showToast = useCallback((msg: string, kind: 'success' | 'error') => { setToast({ message: msg, kind }); setTimeout(() => setToast(null), 3000); }, []);
  const fetchVehicles = useCallback(async () => { setLoading(true); try { setVehicles(await apiClient('/api/vehicles')); } catch (err: any) { setError(err.message); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

 
  const vehicleTypes = [...new Set(vehicles.map(v => v.type).filter((t): t is string => Boolean(t)))];
  const filtered = activeFilter === 'All' ? vehicles : vehicles.filter(v => v.type === activeFilter);
  if (loading) return <VehiclesSkeleton />;
  if (error) return <div className="text-center py-10">Error: {error}</div>;

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <Toast toast={toast} />
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)]">
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b px-4 py-2 flex justify-between items-center">
          <div><p className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">Available Vehicles</p><p className="text-[10px] text-slate-400 hidden sm:block">{filtered.length} vehicles</p></div>
          <button onClick={fetchVehicles} className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"><span>↻</span> Refresh</button>
        </div>
        <div className="p-4">
          {vehicleTypes.length > 0 && <FilterPills types={vehicleTypes} active={activeFilter} onChange={setActiveFilter} />}
          {filtered.length === 0 ? <div className="text-center py-16">No vehicles found</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(v => <VehicleCard key={v._id} vehicle={v} onBook={setSelectedVehicle} />)}</div>}
        </div>
      </div>
      {selectedVehicle && <BookingModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onSuccess={msg => showToast(msg, 'success')} />}
    </div>
  );
}