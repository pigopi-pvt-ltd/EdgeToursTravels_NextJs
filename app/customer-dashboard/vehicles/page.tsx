'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { VehiclesSkeleton } from '@/components/CustomerSkeletons';
import { getStoredUser } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { label: '15 days', days: 15 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

const TYPE_ICONS: Record<string, string> = {
  SUV: '🚙',
  MPV: '🚐',
  Sedan: '🚗',
  Bus: '🚌',
  Hatchback: '🚗',
  Truck: '🚛',
};

const typeIcon = (t?: string) => TYPE_ICONS[t ?? ''] ?? '🚗';

function calcEstimate(pricePerDay = 1000, days: number): number {
  let total = pricePerDay * days;
  if (days >= 365) total *= 0.8;
  else if (days >= 30) total *= 0.9;
  return Math.round(total);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: ToastType }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-6 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl
        text-white text-sm font-medium shadow-xl
        animate-in slide-in-from-right-8 duration-300
        ${toast.kind === 'success' ? 'bg-[#0f4c35]' : 'bg-[#a32d2d]'}`}
    >
      <span>{toast.kind === 'success' ? '✓' : '✕'}</span>
      {toast.message}
    </div>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────
function FilterPills({
  types,
  active,
  onChange,
}: {
  types: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {['All', ...types].map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border
            ${active === t
              ? 'bg-[#0f4c35] border-[#0f4c35] text-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400'
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  onBook,
}: {
  vehicle: Vehicle;
  onBook: (v: Vehicle, type: BookingType) => void;
}) {
  const isMaint = vehicle.status === 'maintenance';
  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
        p-5 flex flex-col gap-4 transition-all duration-200
        ${isMaint ? 'opacity-50' : 'hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'}`}
    >
      <span
        className={`absolute top-3.5 right-3.5 text-[10px] font-medium px-2.5 py-0.5 rounded-full
          ${isMaint
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}
      >
        {isMaint ? 'Maintenance' : 'Available'}
      </span>
      <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl">
        {typeIcon(vehicle.type)}
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-white text-[15px] leading-tight pr-8">
          {vehicle.modelName}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 tracking-wide">{vehicle.cabNumber}</p>
      </div>
      <hr className="border-slate-100 dark:border-slate-700" />
      <div className="flex gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Seats</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{vehicle.capacity ?? '–'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Type</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{vehicle.type ?? '–'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Rate</p>
          <p className="text-sm font-semibold text-orange-500">
            ₹{(vehicle.pricePerDay ?? 1000).toLocaleString()}/day
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          disabled={isMaint}
          onClick={() => onBook(vehicle, 'oneTime')}
          className="py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300
            hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
            dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          One-time
        </button>
        <button
          disabled={isMaint}
          onClick={() => onBook(vehicle, 'longTerm')}
          className="py-2.5 rounded-xl text-xs font-medium
            bg-[#0f4c35] hover:bg-[#16a066] text-white
            disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Long-term
        </button>
      </div>
    </div>
  );
}

// ─── Compact Form Helpers ───────────────────────────────
const inputCls =
  'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ' +
  'rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors';

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        <span>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

function FormFooter({
  submitting,
  label,
  onCancel,
}: {
  submitting: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-1.5 rounded-xl text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : label}
      </button>
    </div>
  );
}

// ─── One‑time Form  ──────────────────────────────────────────────────
function OneTimeForm({
  vehicle,
  onSuccess,
  onCancel,
}: {
  vehicle: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const user = getStoredUser();
  const [form, setForm] = useState({
    from: '',
    destination: '',
    dateTime: '',
    name: user?.name ?? '',
    contact: user?.mobileNumber ?? '',
    price: vehicle.pricePerDay ? `From ₹${vehicle.pricePerDay}/day` : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.from || !form.destination || !form.dateTime || !form.name || !form.contact) {
      setErr('All fields required.');
      return;
    }
    if (!/^\d{10}$/.test(form.contact)) {
      setErr('Contact must be 10 digits.');
      return;
    }
    const currentUser = getStoredUser();
    if (!currentUser) { setErr('Please login to book.'); return; }
    setSubmitting(true);
    try {
      const payload: any = {
        from: form.from,
        destination: form.destination,
        dateTime: new Date(form.dateTime).toISOString(),
        name: form.name,
        contact: form.contact,
        userId: currentUser.id,
        vehicleId: vehicle._id,
      };
      const priceNum = parseFloat(form.price);
      if (!isNaN(priceNum)) payload.price = priceNum;
      await apiClient('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
      onSuccess();
    } catch (ex: any) {
      setErr(ex.message ?? 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {err && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded">{err}</p>}
      <FormField label="From" icon="📍"><input className={inputCls} placeholder="Pick-up" value={form.from} onChange={set('from')} required /></FormField>
      <FormField label="Destination" icon="🏁"><input className={inputCls} placeholder="Drop-off" value={form.destination} onChange={set('destination')} required /></FormField>
      <FormField label="Date & Time" icon="📅"><input type="datetime-local" className={inputCls} value={form.dateTime} onChange={set('dateTime')} required /></FormField>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Name" icon="👤"><input className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} required /></FormField>
        <FormField label="Contact" icon="📞"><input className={inputCls} placeholder="10 digits" maxLength={10} value={form.contact} onChange={(e) => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required /></FormField>
      </div>
      <FormField label="Price Estimate" icon="₹"><input className={inputCls + ' text-orange-600 font-semibold'} value={form.price} onChange={set('price')} placeholder="Optional" /></FormField>
      <FormFooter submitting={submitting} label="Request ride" onCancel={onCancel} />
    </form>
  );
}

// ─── Long‑term Form ─────────────────────────────────────────────────
function LongTermForm({
  vehicle,
  onSuccess,
  onCancel,
}: {
  vehicle: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const user = getStoredUser();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [form, setForm] = useState({
    from: '',
    destination: '',
    startDate: tomorrow.toISOString().split('T')[0],
    durationDays: 30,
    name: user?.name ?? '',
    contact: user?.mobileNumber ?? '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const estimated = calcEstimate(vehicle.pricePerDay, form.durationDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.from || !form.destination || !form.startDate || !form.name || !form.contact) {
      setErr('All fields required.');
      return;
    }
    if (!/^\d{10}$/.test(form.contact)) {
      setErr('Contact must be 10 digits.');
      return;
    }
    const currentUser = getStoredUser();
    if (!currentUser) { setErr('Please login to continue.'); return; }
    setSubmitting(true);
    try {
      const startDateObj = new Date(form.startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + form.durationDays);
      await fetch('/api/long-term-rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          userId: currentUser.id,
          vehicleId: vehicle._id,
          from: form.from,
          destination: form.destination,
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString(),
          name: form.name,
          contact: form.contact,
          price: estimated,
          notes: form.notes,
        }),
      });
      onSuccess();
    } catch (ex: any) {
      setErr(ex.message ?? 'Rental request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {err && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded">{err}</p>}
      <FormField label="From" icon="📍"><input className={inputCls} placeholder="Pick-up" value={form.from} onChange={set('from')} required /></FormField>
      <FormField label="Destination" icon="🏁"><input className={inputCls} placeholder="Drop-off" value={form.destination} onChange={set('destination')} required /></FormField>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Start Date" icon="📅"><input type="date" className={inputCls} value={form.startDate} onChange={set('startDate')} required /></FormField>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Duration</label>
          <div className="flex flex-wrap gap-1">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setForm((p) => ({ ...p, durationDays: opt.days }))}
                className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all border
                  ${form.durationDays === opt.days
                    ? 'bg-orange-600 border-orange-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Est. total</span>
        <span className="text-base font-bold text-orange-600">₹{estimated.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Name" icon="👤"><input className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} required /></FormField>
        <FormField label="Contact" icon="📞"><input className={inputCls} placeholder="10 digits" maxLength={10} value={form.contact} onChange={(e) => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '') }))} required /></FormField>
      </div>
      <FormField label="Notes" icon="📝"><textarea className={inputCls + ' resize-none'} rows={2} placeholder="Special requests..." value={form.notes} onChange={set('notes')} /></FormField>
      <FormFooter submitting={submitting} label="Request rental" onCancel={onCancel} />
    </form>
  );
}

// ─── Modal  ─────────────────
function BookingModal({
  vehicle,
  initialType,
  onClose,
  onSuccess,
}: {
  vehicle: Vehicle;
  initialType: BookingType;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [tab, setTab] = useState<BookingType>(initialType);

  const handleSuccess = (msg: string) => {
    onSuccess(msg);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with vehicle name and close */}
        <div className="relative px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-lg">
              {typeIcon(vehicle.type)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{vehicle.modelName}</p>
              <p className="text-[10px] text-slate-400">{vehicle.cabNumber} · {vehicle.type}</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setTab('oneTime')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border
                ${tab === 'oneTime'
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              One‑time trip
            </button>
            <button
              onClick={() => setTab('longTerm')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border
                ${tab === 'longTerm'
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Long‑term rental
            </button>
          </div>
        </div>

        {/* Form  */}
        <div className="p-4">
          {tab === 'oneTime' ? (
            <OneTimeForm
              key="oneTime"
              vehicle={vehicle}
              onSuccess={() => handleSuccess('Ride request sent successfully!')}
              onCancel={onClose}
            />
          ) : (
            <LongTermForm
              key="longTerm"
              vehicle={vehicle}
              onSuccess={() => handleSuccess('Rental request submitted!')}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvailableVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [modal, setModal] = useState<{ vehicle: Vehicle; type: BookingType } | null>(null);
  const [toast, setToast] = useState<ToastType>(null);

  const showToast = useCallback((message: string, kind: 'success' | 'error') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient('/api/vehicles');
      setVehicles(data);
    } catch (err: any) {
      setError(err.message ?? 'Unable to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const vehicleTypes = [...new Set(vehicles.map((v) => v.type).filter(Boolean))] as string[];
  const filtered = activeFilter === 'All' ? vehicles : vehicles.filter((v) => v.type === activeFilter);

  if (loading) return <VehiclesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-2xl">⚠️</div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white">Failed to load vehicles</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchVehicles}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <Toast toast={toast} />

      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Top bar  */}
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                Available Vehicles
              </p>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} shown
              </p>
            </div>
          </div>
          <button
            onClick={fetchVehicles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <span>↻</span> Refresh
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {vehicleTypes.length > 0 && (
            <FilterPills
              types={vehicleTypes}
              active={activeFilter}
              onChange={setActiveFilter}
            />
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <span className="text-4xl">🚗</span>
              <p className="text-sm">No vehicles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((v) => (
                <VehicleCard
                  key={v._id}
                  vehicle={v}
                  onBook={(vehicle, type) => setModal({ vehicle, type })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <BookingModal
          vehicle={modal.vehicle}
          initialType={modal.type}
          onClose={() => setModal(null)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}
    </div>
  );
}