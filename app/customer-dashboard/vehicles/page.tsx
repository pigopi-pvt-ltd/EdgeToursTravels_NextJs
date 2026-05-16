"use client";

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

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
  HiOutlineTag,
} from 'react-icons/hi2';
import { VehiclesSkeleton } from '@/components/CustomerSkeletons';

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
  capacity?: number;
  type?: string;
  pricePerDay?: number;
  ac?: boolean;
  status?: string;
  vehicleImages?: string[];
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
  const images = vehicle.vehicleImages || [];
  const hasImages = images.length > 0;
  
  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 ${isMaint ? 'opacity-50' : 'hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}`}>
      {/* Status Badge */}
      <span className={`absolute top-2 right-2 z-10 text-[9px] font-medium px-2 py-0.5 rounded-full ${isMaint ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
        {isMaint ? 'Maintenance' : 'Available'}
      </span>
      
      {/* Vehicle Image - Full width */}
      {hasImages && (
        <div className="w-full h-32 overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img 
            src={images[0]} 
            alt={vehicle.modelName} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* No Image Placeholder */}
      {!hasImages && (
        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <span className="text-4xl opacity-30">{typeIcon(vehicle.type)}</span>
        </div>
      )}
      
      {/* Vehicle Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">{vehicle.modelName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{vehicle.cabNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Rate</p>
            <p className="text-sm font-bold text-orange-500">₹{(vehicle.pricePerDay ?? 1000).toLocaleString()}<span className="text-[9px]">/day</span></p>
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] mb-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">🚗 Seats:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{vehicle.capacity ?? '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">📋 Type:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{vehicle.type ?? '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">❄️ AC:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{vehicle.ac ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        <button 
          disabled={isMaint} 
          onClick={() => onBook(vehicle)} 
          className="w-full py-2 rounded-lg text-[11px] font-medium bg-[#0f4c35] hover:bg-[#16a066] text-white disabled:opacity-50 transition-all"
        >
          Book This Vehicle
        </button>
      </div>
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
  const [form, setForm] = useState({ from: '', destination: '', dateTime: '', name: user?.name ?? '', contact: user?.mobileNumber ?? '', price: vehicle.pricePerDay ? `Start from ₹${vehicle.pricePerDay}` : 'Start from ₹12/km' });
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

  const labelCls = "text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1 block";
  const inpInrCls = "w-full bg-[#f8f9fa] border border-slate-200 rounded-lg px-4 py-2.5 pl-12 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-400 dark:text-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 font-bold">{err}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-1">
          <label className={labelCls}>From (City / Airport) <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter pick-up location" value={form.from} onChange={set('from')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Destination <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter drop-off location" value={form.destination} onChange={set('destination')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Travel Date & Time <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg" />
            <input type="datetime-local" className={inpInrCls} value={form.dateTime} onChange={set('dateTime')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Customer Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter customer name" value={form.name} onChange={set('name')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Contact Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter 10-digit number" maxLength={10} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Price Estimate <span className="text-slate-400 normal-case">(Optional)</span></label>
          <div className="relative">
            <HiOutlineTag className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg" />
            <input className={inpInrCls} placeholder="Start from ₹12/km" value={form.price} onChange={set('price')} />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-50">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={submitting} className="bg-[#5542f6] hover:bg-[#4431e5] text-white px-8 py-2.5 rounded-lg font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70">
          {submitting ? '...' : 'Add Booking'}
        </button>
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

  const labelCls = "text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1 block";
  const inpInrCls = "w-full bg-[#f8f9fa] border border-slate-200 rounded-lg px-4 py-2.5 pl-12 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-400 dark:text-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 font-bold">{err}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-1">
          <label className={labelCls}>From (City / Airport) <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter pick-up location" value={form.from} onChange={set('from')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Destination <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter drop-off location" value={form.destination} onChange={set('destination')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 text-lg" />
            <input type="date" className={inpInrCls} value={form.startDate} onChange={set('startDate')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Duration</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {DURATION_OPTIONS.map(opt => (
              <button key={opt.days} type="button" onClick={() => setForm(p => ({ ...p, durationDays: opt.days }))} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${form.durationDays === opt.days ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Your Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter name" value={form.name} onChange={set('name')} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Contact Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 text-lg" />
            <input className={inpInrCls} placeholder="Enter 10-digit number" maxLength={10} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Special Requests</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📝</span>
            <input className={inpInrCls} placeholder="Any requests..." value={form.notes} onChange={set('notes')} />
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 py-2.5 flex justify-between items-center border border-emerald-100/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Total</span>
            <span className="text-base font-black text-orange-600">₹{estimated.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-50">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={submitting} className="bg-[#5542f6] hover:bg-[#4431e5] text-white px-8 py-2 rounded-lg font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 min-w-[140px]">
          {submitting ? '...' : 'Add Booking'}
        </button>
      </div>
    </form>
  );
}

function BookingModal({ vehicle, onClose, onSuccess }: { vehicle: Vehicle; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [tab, setTab] = useState<BookingType>('oneTime');
  const images = vehicle.vehicleImages || [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative mx-auto animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Book Your Ride</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <HiXMark size={22} />
          </button>
        </div>
        
        <div className="p-6 pt-4 space-y-4">
          <div className="flex justify-start gap-3">
            <button onClick={() => setTab('oneTime')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'oneTime' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>One‑time trip</button>
            <button onClick={() => setTab('longTerm')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'longTerm' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>Long‑term rental</button>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {images.length > 0 && (
                <img 
                  src={images[0]} 
                  alt={vehicle.modelName} 
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              {images.length === 0 && (
                <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-3xl">
                  {typeIcon(vehicle.type)}
                </div>
              )}
              <div className="flex-1">
                <p className="font-black text-[15px] text-slate-800 dark:text-white">{vehicle.modelName}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{vehicle.cabNumber}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400">Seats:</span>
                    <span className="text-[10px] font-bold text-slate-700">{vehicle.capacity ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400">Type:</span>
                    <span className="text-[10px] font-bold text-slate-700 capitalize">{vehicle.type ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400">Rate:</span>
                    <span className="text-[11px] font-black text-orange-600">₹{(vehicle.pricePerDay ?? 1000).toLocaleString()}/day</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional images preview */}
            {images.length > 1 && (
              <div className="flex gap-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {images.slice(1, 4).map((url, idx) => (
                  <img key={idx} src={url} alt="" className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-700" />
                ))}
                {images.length > 4 && <span className="text-[9px] text-slate-400 self-center">+{images.length - 4}</span>}
              </div>
            )}
          </div>

          {tab === 'oneTime' ? <OneTimeForm vehicle={vehicle} onSuccess={() => onSuccess('Ride request sent!')} onCancel={onClose} /> : <LongTermForm vehicle={vehicle} onSuccess={() => onSuccess('Rental request submitted!')} onCancel={onClose} />}
        </div>
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
        <div className="sticky top-16 z-30 bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <p className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">Available Vehicles</p>
            <span className="text-sm md:text-xl font-black text-slate-900 dark:text-slate-100">({filtered.length})</span>
          </div>
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