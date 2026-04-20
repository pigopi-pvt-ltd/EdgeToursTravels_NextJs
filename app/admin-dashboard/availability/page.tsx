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
    try {
      const token = getAuthToken();
      const res = await fetch('/api/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const stats = {
    available: events.filter((e) => e.status === 'available').length,
    booked: events.filter((e) => e.status === 'booked').length,
    maintenance: events.filter((e) => e.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 animate-pulse transition-colors p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
            </div>
            <div className="h-11 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div>
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                </div>
                <div className="h-8 w-12 bg-slate-100 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
            <div className="h-[600px] bg-slate-50 dark:bg-slate-900 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 transition-colors duration-300">
      <div className="py-6 lg:py-8 space-y-6">
        {/* Toast */}
        {toast && (
          <div className="px-6 lg:px-8">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          </div>
        )}

        <div className="px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-2 transition-colors">
                <HiCalendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                Vehicle Availability
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">Monitor and manage your fleet schedule in real-time</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({ title: '', start: '', end: '', status: 'available', vehicleId: '', driverId: '', notes: '' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <HiPlus className="text-lg" /> New Slot
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Available</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform"><HiCheck className="text-xl" /></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{stats.available}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Booked</span>
                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform"><HiUserGroup className="text-xl" /></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{stats.booked}</h3>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Maintenance</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform"><HiWrench className="text-xl" /></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{stats.maintenance}</h3>
            </div>
          </div>
        </div>

        {/* Calendar Card - Chipka Hua (Full Width) */}
        <div className="bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all p-4 lg:p-10 relative">
          <style jsx global>{`
            .fc { font-family: inherit; }
            .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
            .dark .fc .fc-toolbar-title { color: #f8fafc; }
            .fc .fc-button-primary { background-color: #ffffff; border-color: #e2e8f0; color: #475569; border-radius: 10px; font-weight: 600; padding: 8px 16px; transition: all 0.2s; }
            .dark .fc .fc-button-primary { background-color: #1e293b; border-color: #334155; color: #94a3b8; }
            .fc .fc-button-primary:hover { background-color: #f8fafc; color: #1e293b; }
            .dark .fc .fc-button-primary:hover { background-color: #334155; color: #ffffff; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #4f46e5; border-color: #4f46e5; color: #ffffff; }
            .fc table { border-color: #f1f5f9 !important; }
            .dark .fc table { border-color: #334155 !important; }
            .fc .fc-daygrid-day-number { color: #64748b; font-weight: 600; padding: 8px !important; }
            .dark .fc .fc-daygrid-day-number { color: #94a3b8; }
            .fc .fc-daygrid-day.fc-day-today { background-color: #f5f3ff !important; }
            .dark .fc .fc-daygrid-day.fc-day-today { background-color: rgba(99, 102, 241, 0.1) !important; }
            .fc .fc-col-header-cell { background-color: #f8fafc; }
            .dark .fc .fc-col-header-cell { background-color: #1e293b; }
            .fc .fc-col-header-cell-cushion { color: #475569; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; padding: 12px 0 !important; }
            .dark .fc .fc-col-header-cell-cushion { color: #94a3b8; }
            .fc .fc-event { border-radius: 6px; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
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
              title: `${event.title} (${event.status})`,
              start: event.start,
              end: event.end,
              backgroundColor: event.status === 'available' ? '#10b981' : event.status === 'booked' ? '#ef4444' : '#f59e0b',
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingEvent ? 'Edit Assignment' : 'New Assignment'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><HiX className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assignment Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="e.g., Corporate Trip - Swift Dzire" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Date & Time *</label>
                  <input type="datetime-local" required value={formData.start} onChange={(e) => setFormData({ ...formData, start: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End Date & Time *</label>
                  <input type="datetime-local" required value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Assignment Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vehicle reference</label>
                  <input type="text" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="Optional ID" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                {editingEvent && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl font-semibold transition-colors"><HiTrash /> Delete</button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 cursor-pointer">
                    {editingEvent ? 'Save Changes' : 'Create Assignment'}
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