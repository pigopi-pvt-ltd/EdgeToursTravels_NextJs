'use client';

import { useEffect, useState } from 'react';
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

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
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
    <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors">
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
      <div className="sticky top-16 z-30 bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
          Vehicle Availability <span className="text-black dark:text-white font-normal hidden sm:inline">({events.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <HiArrowPath className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
          >
            Bulk
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setFormData({ title: '', start: '', end: '', status: 'available', vehicleId: '', driverId: '', notes: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition"
          >
            <HiPlus className="text-lg" /> New Slot
          </button>
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
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-600">Total Slots</p>
            <p className="text-3xl font-black mt-1">{stats.total}</p>
          </div>
          <HiCalendar className="text-emerald-500 text-3xl" />
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase text-green-600">Available</p>
            <p className="text-3xl font-black mt-1">{stats.available}</p>
          </div>
          <HiCheckCircle className="text-green-500 text-3xl" />
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase text-blue-600">Booked</p>
            <p className="text-3xl font-black mt-1">{stats.booked}</p>
          </div>
          <HiUserGroup className="text-blue-500 text-3xl" />
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase text-amber-600">Maintenance</p>
            <p className="text-3xl font-black mt-1">{stats.maintenance}</p>
          </div>
          <HiWrench className="text-amber-500 text-3xl" />
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4 md:p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingEvent ? 'Edit Slot' : 'New Slot'}</h2>
              <button onClick={closeModal}><HiXMark className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Slot Title / Vehicle Info <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" placeholder="e.g., DL 1PA 1234 - Available" />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none">
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Internal Notes</label>
                  <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" placeholder="Add optional details..." />
                </div>
              </div>
              <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-6 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"><HiTrash className="text-lg" /> Delete Slot</button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                  <button type="submit" className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 min-w-[160px] active:scale-95 cursor-pointer">
                    {editingEvent ? 'Update Availability' : 'Save Availability'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsBulkModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Bulk Create Slots</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle *</label>
                <select value={bulkData.vehicleId} onChange={(e) => setBulkData({ ...bulkData, vehicleId: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.cabNumber} - {v.modelName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
                <input type="datetime-local" value={bulkData.start} onChange={(e) => setBulkData({ ...bulkData, start: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date & Time *</label>
                <input type="datetime-local" value={bulkData.end} onChange={(e) => setBulkData({ ...bulkData, end: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repeat</label>
                <select value={bulkData.repeats} onChange={(e) => setBulkData({ ...bulkData, repeats: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option value="none">No repeat</option>
                  <option value="weekly">Weekly (4 weeks)</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleBulkCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}