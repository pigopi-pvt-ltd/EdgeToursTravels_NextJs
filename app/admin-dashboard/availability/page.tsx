'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HiWrench } from 'react-icons/hi2';
import {
  HiPlus,
  HiTrash,
  HiPencil,
  HiX,
  HiCheck,
  HiCalendar,
  HiChip,
  HiUserGroup,
} from 'react-icons/hi';

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

export default function AvailabilityPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    status: 'available',
    vehicleId: '',
    driverId: '',
    notes: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Artificial delay for professional skeleton feel
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      start: selectInfo.startStr.includes('T') ? selectInfo.startStr.slice(0, 16) : selectInfo.startStr + 'T00:00',
      end: selectInfo.endStr.includes('T') ? selectInfo.endStr.slice(0, 16) : selectInfo.endStr + 'T23:59',
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
        start: event.start.split('T')[0] + 'T' + (event.start.split('T')[1]?.slice(0, 5) || '00:00'),
        end: event.end.split('T')[0] + 'T' + (event.end.split('T')[1]?.slice(0, 5) || '00:00'),
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
    const updatedEvent = {
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
    };
    try {
      const token = getAuthToken();
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
      driverId: formData.driverId,
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

  const statsCount = {
    available: events.filter((e) => e.status === 'available').length,
    booked: events.filter((e) => e.status === 'booked').length,
    maintenance: events.filter((e) => e.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors shadow-inner">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Precise Stats Grid Skeleton (214px height) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-10 h-[214px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-5"></div>
              <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3"></div>
              <div className="h-3 w-36 bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>
            </div>
          ))}
        </div>

        {/* Precise Calendar Skeleton */}
        <div className="p-12 lg:p-20 space-y-10">
          <div className="flex justify-between items-center px-4">
            <div className="h-10 w-56 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-10 w-80 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-[700px] w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-inner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors duration-300 animate-in fade-in duration-500">
      {/* Sticky Header Toolbar - Standardized */}
      <div className="sticky top-16 z-30 bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md min-h-[56px]">
        <div className="min-w-0">
          <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
            Fleet Availability <span className="text-black dark:text-white font-normal hidden sm:inline">({events.length})</span>
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({ title: '', start: '', end: '', status: 'available', vehicleId: '', driverId: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-50 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[11px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <HiPlus className="text-lg" /> Add Availability
        </button>
      </div>

      <div className="flex flex-col min-h-[calc(100vh-120px)] border-t border-slate-50 dark:border-slate-800">
        {/* Toast Notification Container */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
              <span className="font-bold text-sm uppercase tracking-widest">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Stats Section - Premium High-Density Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative group overflow-hidden border-r border-slate-100 dark:border-slate-800/50">
            <div className="p-8 flex items-center gap-6 transition-all duration-300 group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-900/10">
              <div className="relative">
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
                  <HiCheck className="text-2xl" />
                </div>
                <div className="absolute -inset-2 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">{statsCount.available}</span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Active & Ready</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>

          <div className="relative group overflow-hidden border-r border-slate-100 dark:border-slate-800/50">
            <div className="p-8 flex items-center gap-6 transition-all duration-300 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10">
              <div className="relative">
                <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
                  <HiUserGroup className="text-2xl" />
                </div>
                <div className="absolute -inset-2 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">{statsCount.booked}</span>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Mission Assigned</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>

          <div className="relative group overflow-hidden">
            <div className="p-8 flex items-center gap-6 transition-all duration-300 group-hover:bg-amber-50/30 dark:group-hover:bg-amber-900/10">
              <div className="relative">
                <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
                  <HiWrench className="text-2xl" />
                </div>
                <div className="absolute -inset-2 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">{statsCount.maintenance}</span>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Service Queue</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
        </div>

        {/* Calendar Section - Full Width Sticky Sides */}
        <div className="p-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-700 px-1 md:px-0">
            <style jsx global>{`
              .fc { font-family: 'Outfit', sans-serif; border: none !important; }
              .fc .fc-toolbar { padding: 1rem 1.5rem; margin-bottom: 0 !important; display: flex; flex-wrap: nowrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
              .fc .fc-toolbar-chunk { display: flex; align-items: center; flex-wrap: nowrap; }
              .fc .fc-toolbar-title { font-size: 1rem !important; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: -0.025em; margin: 0 1rem !important; white-space: nowrap; min-width: 140px; text-align: center; }
              .dark .fc .fc-toolbar-title { color: #f8fafc; }
              
              /* Pill Buttons Styling - Emerald Refinement */
              .fc .fc-button-primary { 
                background-color: #ffffff !important; 
                color: #1e293b !important;
                border: 1px solid #e2e8f0 !important; 
                padding: 0.6rem 1.4rem !important; 
                font-size: 0.75rem !important; 
                font-weight: 800 !important; 
                border-radius: 9999px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                transition: all 0.2s ease !important;
                white-space: nowrap;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
              }
              
              .dark .fc .fc-button-primary:not(.fc-button-active) {
                background-color: #1e293b !important;
                color: #f1f5f9 !important;
                border-color: #334155 !important;
              }
              
              .fc .fc-button-primary:hover { 
                border-color: #cbd5e1 !important;
                background-color: #f8fafc !important;
                transform: translateY(-1px); 
              }

              .dark .fc .fc-button-primary:hover {
                background-color: #334155 !important;
                border-color: #475569 !important;
              }
              
              /* THEME OVERRIDE - MAX PRIORITY GREEN */
              .fc-button-active, 
              button.fc-button-active, 
              .fc .fc-button-active,
              .fc .fc-button-primary.fc-button-active,
              .fc-button-active:hover,
              .fc-button-active:focus,
              .fc-button-active:active {
                background: #22c55e !important;
                background-color: #22c55e !important;
                background-image: none !important;
                color: #ffffff !important;
                border: none !important;
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4) !important;
                opacity: 1 !important;
              }

              .fc-today-button,
              .fc .fc-button-primary.fc-today-button {
                background-color: #22c55e !important;
                color: #ffffff !important;
                border: none !important;
              }
              
              /* Transparent Nav Arrows */
              .fc .fc-prev-button, .fc .fc-next-button {
                background: transparent !important;
                color: #334155 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .dark .fc .fc-prev-button, .dark .fc .fc-next-button { color: #cbd5e1 !important; }
              .fc .fc-prev-button:hover, .fc .fc-next-button:hover { background: #f1f5f9 !important; color: #0f172a !important; }
              .dark .fc .fc-prev-button:hover, .dark .fc .fc-next-button:hover { background: #1e293b !important; color: #ffffff !important; }
              .fc .fc-button-primary:active { transform: translateY(0); }
              .fc .fc-button-primary:disabled { opacity: 0.5 !important; }
              
              /* View Switcher Group */
              .fc .fc-button-group { gap: 4px; }
              .fc .fc-button-group > .fc-button { border-radius: 9999px !important; margin: 0 !important; }
              
              /* Active State */
              .fc .fc-button-primary:not(:disabled).fc-button-active,
              .fc .fc-button-primary:not(:disabled):active {
                background-color: #0f172a !important;
                color: #ffffff !important;
                box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) !important;
              }

              /* Calendar Grid Refinement */
              .fc-theme-standard td, .fc-theme-standard th { border: 1px solid #f1f5f9 !important; }
              .dark .fc-theme-standard td, .dark .fc-theme-standard th { border: 1px solid #1e293b !important; }
              .fc .fc-daygrid-day-number { font-weight: 600; padding: 8px !important; color: #64748b; }
              .fc .fc-col-header-cell-cushion { padding: 12px 4px !important; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
              
              @media (max-width: 768px) {
                .fc .fc-toolbar { padding: 0.75rem; overflow-x: auto; -ms-overflow-style: none; scrollbar-width: none; }
                .fc .fc-toolbar::-webkit-scrollbar { display: none; }
                .fc .fc-toolbar-title { font-size: 0.8rem !important; margin: 0 0.5rem !important; min-width: 100px; }
                .fc .fc-button-primary { padding: 0.35rem 0.6rem !important; font-size: 0.6rem !important; }
              }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev title next',
                center: '',
                right: 'today dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
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
        </div>
      </div>

      {/* Standardized Administrative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 overflow-y-auto subtle-scrollbar animate-in fade-in duration-300" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl animate-in slide-in-from-top-10 duration-300 overflow-hidden" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingEvent ? 'Edit Availability Slot' : 'Create Availability Slot'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><HiX className="text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Slot Title / Vehicle Info <span className="text-red-600">*</span></label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white" placeholder="e.g., DL 1PA 1234 - Available" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Start Time <span className="text-red-600">*</span></label>
                  <input 
                    type={formData.start ? "datetime-local" : "text"}
                    placeholder="DD-MM-YYYY" 
                    required 
                    value={formData.start} 
                    onFocus={(e) => (e.target.type = "datetime-local")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })} 
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">End Time <span className="text-red-600">*</span></label>
                  <input 
                    type={formData.end ? "datetime-local" : "text"}
                    placeholder="DD-MM-YYYY" 
                    required 
                    value={formData.end} 
                    onFocus={(e) => (e.target.type = "datetime-local")}
                    onBlur={(e) => !e.target.value && (e.target.type = "text")}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })} 
                    className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Availability Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white cursor-pointer">
                    <option value="available">Available</option>
                    <option value="booked">Booked / Assigned</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Internal Notes</label>
                  <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-100 dark:text-white" placeholder="Add optional details..." />
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-bold text-xs uppercase transition-all"><HiTrash className="text-lg" /> Delete Slot</button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95">
                    {editingEvent ? 'Update Availability' : 'Save Availability'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}