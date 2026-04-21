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
      {/* Sticky Header Toolbar - Edge-to-Edge */}
      <div className="sticky top-16 z-30 bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md min-h-[56px]">
        <div className="min-w-0">
          <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
            Vehicle Availability <span className="text-black dark:text-white font-normal hidden sm:inline">({events.length})</span>
          </h2>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({ title: '', start: '', end: '', status: 'available', vehicleId: '', driverId: '', notes: '' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[11px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <HiPlus className="text-lg" /> New Slot
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

        {/* Stats Section - Flush Edge-to-Edge Grid (Adaptive Height) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10">
          <div className="p-10 flex flex-col items-center justify-center group cursor-default hover:bg-white dark:hover:bg-slate-800/40 transition-all">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-sm border border-emerald-100 dark:border-emerald-800"><HiCheck className="text-3xl" /></div>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{statsCount.available}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Active Logistics</p>
          </div>
          <div className="p-10 flex flex-col items-center justify-center group cursor-default hover:bg-white dark:hover:bg-slate-800/40 transition-all">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-rose-100 dark:border-rose-800"><HiUserGroup className="text-3xl" /></div>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{statsCount.booked}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Engaged Fleet</p>
          </div>
          <div className="p-10 flex flex-col items-center justify-center group cursor-default hover:bg-white dark:hover:bg-slate-800/40 transition-all">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-amber-100 dark:border-amber-800"><HiWrench className="text-3xl" /></div>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{statsCount.maintenance}</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Service Queue</p>
          </div>
        </div>

        {/* Calendar Section - Wide View Edge-to-Edge Padding */}
        <div className="p-4 md:p-12 lg:p-16 bg-white dark:bg-slate-900">
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-700">
            <style jsx global>{`
              .fc { font-family: inherit; }
              .fc .fc-toolbar-title { font-size: 1rem !important; md:font-size: 1.5rem !important; }
              .fc .fc-button-primary { padding: 8px 12px; font-size: 0.55rem; border-radius: 12px; }
              @media (max-width: 768px) {
                .fc .fc-toolbar { flex-direction: column; gap: 10px; }
                .fc .fc-toolbar-chunk { display: flex; justify-content: center; width: 100%; }
              }
            `}</style>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 md:px-12 py-6 md:py-8 flex justify-between items-center z-10">
              <h2 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Event Parameters</h2>
              <button onClick={closeModal} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-[20px] md:rounded-[24px] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"><HiX className="w-6 h-6 md:w-8 md:h-8" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-8 md:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Mission Subject *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-base shadow-inner outline-none transition-all placeholder:text-slate-200" placeholder="e.g., EXECUTIVE TRANSIT - DL 1PA 1234" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Arrival (Start) *</label>
                  <input type="datetime-local" required value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-sm shadow-inner outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Departure (End) *</label>
                  <input type="datetime-local" required value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-sm shadow-inner outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Logistic Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-sm cursor-pointer shadow-inner outline-none transition-all border-r-[24px] border-transparent">
                    <option value="available">🟢 Ready for Duty</option>
                    <option value="booked">🎟️ Mission Assigned</option>
                    <option value="maintenance">🛠️ Under Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Asset Vector ID</label>
                  <input type="text" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-[28px] px-8 py-5 focus:ring-8 focus:ring-emerald-500/5 dark:text-white font-black text-sm shadow-inner outline-none transition-all" placeholder="OPTIONAL VECTOR ID" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-12 border-t border-slate-50 dark:border-slate-800/50">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-3 px-8 py-4 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] transition-all"><HiTrash className="text-xl" /> Terminate</button>
                )}
                <div className="flex gap-5 ml-auto">
                  <button type="button" onClick={closeModal} className="px-10 py-4 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[28px] transition-all">Abort</button>
                  <button type="submit" className="px-16 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] shadow-3xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95 tracking-widest">
                    {editingEvent ? 'Commit Changes' : 'Execute Mission'}
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