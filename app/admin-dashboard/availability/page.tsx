'use client';

import { useEffect, useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  HiCheckCircle,
  HiCalendar,
  HiUserGroup,
  HiWrench,
  HiPlus,
  HiTrash,
  HiXMark,
  HiCheck,
  HiArrowPath,
  HiArrowDownTray,
  HiArrowUpTray,
  HiFunnel,
} from 'react-icons/hi2';

interface Event {
  _id: string;
  title: string;
  start: string;
  end: string;
  status: 'available' | 'booked' | 'maintenance';
  vehicleId?: string;
  driverId?: string;
  notes?: string;
}

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
}

interface Driver {
  _id: string;
  name: string;
  mobileNumber: string;
}

export default function AvailabilityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dashboardView, setDashboardView] = useState<'month' | 'week' | 'day'>('month');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    status: 'available',
    vehicleId: '',
    driverId: '',
    notes: '',
  });
  const [bulkData, setBulkData] = useState({
    start: '',
    end: '',
    vehicleId: '',
    repeats: 'none',
  });

  useEffect(() => {
    fetchEvents();
    fetchVehicles();
    fetchDrivers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVehicles = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/vehicles', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVehicles(await res.json());
    } catch (err) {
      console.error('Failed to fetch vehicles');
    }
  };

  const fetchDrivers = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees?role=driver', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDrivers(await res.json());
    } catch (err) {
      console.error('Failed to fetch drivers');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const token = getAuthToken();
    const params = new URLSearchParams();
    params.append('start', dateRange.start.toISOString());
    params.append('end', dateRange.end.toISOString());
    if (filterVehicle !== 'all') params.append('vehicleId', filterVehicle);
    try {
      const res = await fetch(`/api/availability?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setEvents(data);
      else showToast(data.error || 'Failed to fetch', 'error');
    } catch (error) {
      showToast('Error fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      status: 'available',
      vehicleId: '',
      driverId: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find((e) => e._id === clickInfo.event.id);
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        start: event.start,
        end: event.end,
        status: event.status,
        vehicleId: event.vehicleId || '',
        driverId: event.driverId || '',
        notes: event.notes || '',
      });
      setIsModalOpen(true);
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const updatedEvent = { start: dropInfo.event.startStr, end: dropInfo.event.endStr };
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/availability/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedEvent),
      });
      if (res.ok) {
        showToast('Event updated', 'success');
        fetchEvents();
      } else {
        showToast('Update failed', 'error');
        fetchEvents();
      }
    } catch (err) {
      showToast('Update failed', 'error');
      fetchEvents();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const payload = {
      title: formData.title,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      status: formData.status,
      vehicleId: formData.vehicleId,
      driverId: formData.driverId || null,
      notes: formData.notes,
    };
    try {
      let res;
      if (editingEvent) {
        res = await fetch(`/api/availability/${editingEvent._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        showToast(editingEvent ? 'Event updated' : 'Event created', 'success');
        fetchEvents();
        closeModal();
      } else {
        const data = await res.json();
        showToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm('Delete this event?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/availability/${editingEvent._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Event deleted', 'success');
        fetchEvents();
        closeModal();
      } else {
        showToast('Delete failed', 'error');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = getAuthToken();
    try {
      const res = await fetch(
        `/api/availability/export?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}&vehicleId=${filterVehicle}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `availability_${dateRange.start.toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Export successful', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/availability/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showToast('Import successful', 'success');
        fetchEvents();
      } else {
        showToast('Import failed', 'error');
      }
    } catch (err) {
      showToast('Import failed', 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkData.start || !bulkData.end || !bulkData.vehicleId) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const eventsToCreate = [];
    if (bulkData.repeats === 'none') {
      eventsToCreate.push({
        title: `Bulk - ${bulkData.vehicleId}`,
        start: new Date(bulkData.start).toISOString(),
        end: new Date(bulkData.end).toISOString(),
        status: 'available',
        vehicleId: bulkData.vehicleId,
        driverId: null,
        notes: '',
      });
    } else {
      // weekly for 4 weeks
      let currentStart = new Date(bulkData.start);
      let currentEnd = new Date(bulkData.end);
      for (let i = 0; i < 4; i++) {
        eventsToCreate.push({
          title: `Bulk - ${bulkData.vehicleId}`,
          start: currentStart.toISOString(),
          end: currentEnd.toISOString(),
          status: 'available',
          vehicleId: bulkData.vehicleId,
          driverId: null,
          notes: '',
        });
        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      }
    }
    const token = getAuthToken();
    try {
      await Promise.all(
        eventsToCreate.map((event) =>
          fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(event),
          })
        )
      );
      showToast('Bulk slots created', 'success');
      setIsBulkModalOpen(false);
      fetchEvents();
    } catch (err) {
      showToast('Bulk creation failed', 'error');
    }
  };

  const stats = {
    total: events.length,
    available: events.filter((e) => e.status === 'available').length,
    booked: events.filter((e) => e.status === 'booked').length,
    maintenance: events.filter((e) => e.status === 'maintenance').length,
  };

  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (dashboardView === 'month') api.changeView('dayGridMonth');
      else if (dashboardView === 'week') api.changeView('timeGridWeek');
      else if (dashboardView === 'day') api.changeView('timeGridDay');
    }
  }, [dashboardView]);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-14 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b">
          <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-[600px] bg-slate-50 dark:bg-slate-800/30 rounded-3xl m-6"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiXMark className="w-5 h-5" />}
            <span className="font-bold text-sm uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sticky Header Toolbar */}
      <div className="sticky top-16 z-30 bg-[#f8f9fa] dark:bg-[#0A1128]/80 backdrop-blur-md py-3 md:py-2 px-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h2 className="text-base md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Vehicle Availability <span className="text-black dark:text-white font-normal sm:inline">({events.length})</span>
          </h2>
          <button
            onClick={fetchEvents}
            className="sm:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <HiArrowPath className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={fetchEvents}
            className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <HiArrowPath className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 min-w-max">
            {['Month', 'Week', 'Day'].map((label) => {
              const v = label.toLowerCase();
              const isActive = dashboardView === v;
              return (
                <button
                  key={v}
                  onClick={() => setDashboardView(v as any)}
                  className={`px-3 md:px-5 h-9 md:h-10 rounded-lg font-bold text-[11px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#064e3b] text-white ring-1 ring-[#064e3b]' 
                      : 'bg-[#10b981] text-white hover:bg-[#059669]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 md:px-5 h-9 md:h-10 bg-indigo-600 text-white rounded-lg text-[11px] md:text-sm font-bold hover:bg-indigo-700 transition flex items-center justify-center whitespace-nowrap"
            >
              Bulk
            </button>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({ title: '', start: '', end: '', status: 'available', vehicleId: '', driverId: '', notes: '' });
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 md:px-5 h-9 md:h-10 rounded-lg text-[11px] md:text-sm font-bold transition whitespace-nowrap"
            >
              <HiPlus className="text-lg" /> New Slot
            </button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <HiCalendar className="text-slate-400" />
          <input
            type="date"
            value={dateRange.start.toISOString().slice(0, 10)}
            onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-700"
          />
          <span>—</span>
          <input
            type="date"
            value={dateRange.end.toISOString().slice(0, 10)}
            onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-700"
          />
          <button
            onClick={fetchEvents}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
          >
            Apply
          </button>
        </div>
        <div className="flex items-center gap-2">
          <HiFunnel className="text-slate-400" />
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm dark:bg-slate-800 dark:border-slate-700"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.cabNumber} - {v.modelName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="cursor-pointer px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-sm flex items-center gap-1">
            <HiArrowUpTray /> Import CSV
            <input type="file" accept=".csv" hidden onChange={handleImport} disabled={isImporting} />
          </label>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-sm flex items-center gap-1"
          >
            <HiArrowDownTray /> {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 group flex justify-between items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Total Slots</p>
            <h3 className="text-4xl font-black tracking-tight">{stats.total}</h3>
          </div>
          <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl transition">
            <HiCalendar className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 group flex justify-between items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Available</p>
            <h3 className="text-4xl font-black tracking-tight">{stats.available}</h3>
          </div>
          <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl transition">
            <HiCheckCircle className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 group flex justify-between items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Booked</p>
            <h3 className="text-4xl font-black tracking-tight">{stats.booked}</h3>
          </div>
          <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl transition">
            <HiUserGroup className="text-blue-600 dark:text-blue-400 w-6 h-6" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-6 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-105 group flex justify-between items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Maintenance</p>
            <h3 className="text-4xl font-black tracking-tight">{stats.maintenance}</h3>
          </div>
          <div className="p-2 bg-white/30 dark:bg-black/20 rounded-xl transition">
            <HiWrench className="text-amber-600 dark:text-amber-400 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4 md:p-6">
        <style dangerouslySetInnerHTML={{ __html: `
          .fc .fc-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem !important;
          }
          .fc .fc-toolbar-chunk {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 12px !important;
            flex-wrap: nowrap !important;
          }
          .fc .fc-toolbar-title {
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            color: #059669 !important;
            font-family: inherit;
            margin: 0 15px !important;
            white-space: nowrap !important;
          }
          .fc .fc-button {
            margin: 0 !important;
            background-color: transparent !important;
            border: none !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            text-transform: capitalize !important;
            padding: 8px 16px !important;
            transition: all 0.2s ease !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #059669 !important;
            box-shadow: none !important;
          }
          .fc .fc-button:hover {
            background-color: rgba(5, 150, 105, 0.1) !important;
            transform: translateY(-1px);
          }
          .fc .fc-button:active {
            transform: translateY(0);
          }
          .fc .fc-today-button {
            background-color: #34d399 !important;
            opacity: 1 !important;
            color: #064e3b !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          }
          .fc .fc-today-button:hover {
            background-color: #10b981 !important;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            background-color: #064e3b !important;
            color: white !important;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2) !important;
          }
          .fc .fc-button-group {
            gap: 6px;
            align-items: center;
          }
          .fc .fc-button-group .fc-button {
            border-radius: 8px !important;
            margin-left: 0 !important;
          }
          .dark .fc .fc-toolbar-title {
            color: #34d399 !important;
          }
          .dark .fc .fc-button {
            color: #34d399 !important;
          }
          .dark .fc .fc-button:hover {
            background-color: rgba(52, 211, 153, 0.1) !important;
          }
          .dark .fc .fc-today-button {
            background-color: #059669 !important;
            color: white !important;
          }
          
          /* Grid & Cell Styling */
          .fc {
            --fc-border-color: #e2e8f0 !important;
            --fc-daygrid-event-dot-width: 8px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            background: transparent !important;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid #e2e8f0 !important;
          }
          .fc .fc-scrollgrid {
            border: none !important;
          }
          .fc .fc-col-header-cell {
            background: #f8fafc !important;
            padding: 14px 0 !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            color: #475569 !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .fc .fc-daygrid-day-number {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #475569 !important;
            padding: 8px 12px !important;
          }
          .fc .fc-day-today {
            background-color: #ecfdf5 !important; /* Soft Emerald highlight */
          }
          .fc .fc-day-today .fc-daygrid-day-number {
            color: #059669 !important;
            font-weight: 800 !important;
          }
          
          /* Event Styling */
          .fc-v-event, .fc-h-event {
            border: none !important;
            border-radius: 6px !important;
            padding: 2px 4px !important;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
            margin-bottom: 2px !important;
            cursor: pointer !important;
            transition: transform 0.1s ease !important;
          }
          .fc-v-event:hover, .fc-h-event:hover {
            transform: scale(1.02) !important;
            z-index: 5 !important;
          }
          .fc-event-title {
            font-weight: 600 !important;
            font-size: 11px !important;
            padding: 2px 4px !important;
          }
          .fc-daygrid-event-harness {
            margin: 1px 4px !important;
          }
 
          /* Dark Mode Grid */
          .dark .fc {
            --fc-border-color: #1e293b !important;
          }
          .dark .fc-theme-standard td, .dark .fc-theme-standard th {
            border: 1px solid #1e293b !important;
          }
          .dark .fc .fc-col-header-cell {
            background: #0f172a !important;
            color: #94a3b8 !important;
            border-bottom: 2px solid #1e293b !important;
          }
          .dark .fc .fc-day-today {
            background-color: rgba(5, 150, 105, 0.1) !important;
          }
          .dark .fc .fc-daygrid-day-number {
            color: #94a3b8 !important;
          }
          .dark .fc .fc-day-today .fc-daygrid-day-number {
            color: #34d399 !important;
          }
        `}} />
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ 
            left: 'prev title next today', 
            center: '', 
            right: '' 
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          events={events.map((event) => ({
            id: event._id,
            title: `${event.title}`,
            start: event.start,
            end: event.end,
            backgroundColor: event.status === 'available' ? '#10b981' : event.status === 'booked' ? '#6366f1' : '#f59e0b',
            borderColor: 'transparent',
            textColor: '#ffffff',
          }))}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          height="auto"
        />
      </div>


      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-20" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 subtle-scrollbar" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingEvent ? 'Edit Availability Slot' : 'Create New Availability'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <HiXMark className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Slot Title / Vehicle Info <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                    className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" 
                    placeholder="e.g., DL 1PA 1234 - Available" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Start Time <span className="text-red-500">*</span></label>
                  <input
                    type={formData.start ? "datetime-local" : "text"}
                    placeholder="DD-MM-YYYY"
                    required
                    value={formData.start}
                    onFocus={(e) => (e.target.type = "datetime-local")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">End Time <span className="text-red-500">*</span></label>
                  <input
                    type={formData.end ? "datetime-local" : "text"}
                    placeholder="DD-MM-YYYY"
                    required
                    value={formData.end}
                    onFocus={(e) => (e.target.type = "datetime-local")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Availability Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} 
                    className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Internal Notes</label>
                  <input 
                    type="text" 
                    value={formData.notes} 
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                    className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" 
                    placeholder="Add optional details..." 
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-6 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95">
                    <HiTrash className="text-lg" /> Delete Slot
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 min-w-[160px] active:scale-95 cursor-pointer text-xs uppercase tracking-widest">
                    {editingEvent ? 'Update Slot' : 'Save Slot'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-20" onClick={() => setIsBulkModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-5 duration-200 subtle-scrollbar" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Bulk Create Slots
              </h2>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <HiXMark className="text-2xl" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Vehicle *</label>
                <select 
                  value={bulkData.vehicleId} 
                  onChange={(e) => setBulkData({ ...bulkData, vehicleId: e.target.value })} 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.cabNumber} - {v.modelName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Start Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={bulkData.start} 
                  onChange={(e) => setBulkData({ ...bulkData, start: e.target.value })} 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">End Date & Time *</label>
                <input 
                  type="datetime-local" 
                  value={bulkData.end} 
                  onChange={(e) => setBulkData({ ...bulkData, end: e.target.value })} 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Repeat</label>
                <select 
                  value={bulkData.repeats} 
                  onChange={(e) => setBulkData({ ...bulkData, repeats: e.target.value })} 
                  className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none"
                >
                  <option value="none">No repeat</option>
                  <option value="weekly">Weekly (4 weeks)</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsBulkModalOpen(false)} 
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkCreate} 
                className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 min-w-[120px] active:scale-95 cursor-pointer text-xs uppercase tracking-widest"
              >
                Create Slots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}