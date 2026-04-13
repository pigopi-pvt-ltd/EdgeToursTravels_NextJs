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
        start: event.start.split('T')[0] + 'T' + (event.start.split('T')[1]?.slice(0, 5) || ''),
        end: event.end.split('T')[0] + 'T' + (event.end.split('T')[1]?.slice(0, 5) || ''),
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
        fetchEvents(); // revert
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

  // Statistics
  const stats = {
    available: events.filter((e) => e.status === 'available').length,
    booked: events.filter((e) => e.status === 'booked').length,
    maintenance: events.filter((e) => e.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 animate-pulse transition-colors">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 animate-pulse transition-colors">
          <div className="h-[600px] bg-gray-100 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-2 transition-colors">
            <HiCalendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Availability Calendar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage and track vehicle availability in real-time</p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              start: '',
              end: '',
              status: 'available',
              vehicleId: '',
              driverId: '',
              notes: '',
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl transition shadow-md hover:shadow-lg"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Slot</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <HiChip className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Booked</p>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.booked}</p>
          </div>
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
            <HiUserGroup className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.maintenance}</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <HiWrench className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 transition hover:shadow-md">
        <style jsx global>{`
          .fc {
            font-family: inherit;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }
          .dark .fc .fc-toolbar-title {
            color: white;
          }
          .fc .fc-button-primary {
            background-color: #f8fafc;
            border-color: #e2e8f0;
            color: #1e293b;
            text-transform: capitalize;
            font-weight: 500;
            box-shadow: none;
          }
          .dark .fc .fc-button-primary {
            background-color: #334155;
            border-color: #475569;
            color: white;
          }
          .fc .fc-button-primary:hover {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
            color: #0f172a;
          }
          .dark .fc .fc-button-primary:hover {
            background-color: #475569;
            border-color: #64748b;
            color: white;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            background-color: #6366f1;
            border-color: #6366f1;
            color: white;
          }
          .fc .fc-daygrid-day.fc-day-today {
            background-color: #fefce8;
          }
          .dark .fc .fc-daygrid-day.fc-day-today {
            background-color: #1e293b;
          }
          .fc .fc-daygrid-day-number {
            color: #334155;
          }
          .dark .fc .fc-daygrid-day-number {
            color: #94a3b8;
          }
          .fc .fc-col-header-cell-cushion {
            color: #475569;
            font-weight: 600;
          }
          .dark .fc .fc-col-header-cell-cushion {
            color: #cbd5e1;
          }
          .dark .fc table, .dark .fc th, .dark .fc td {
             border-color: #334155 !important;
          }
          .fc .fc-event {
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            padding: 2px 4px;
            border: none;
            transition: transform 0.1s ease;
          }
          .fc .fc-event:hover {
            transform: scale(1.02);
          }
          .fc .fc-daygrid-event {
            white-space: normal;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events.map((event) => ({
            id: event._id,
            title: `${event.title} (${event.status})`,
            start: event.start,
            end: event.end,
            backgroundColor:
              event.status === 'available'
                ? '#10b981'
                : event.status === 'booked'
                ? '#ef4444'
                : '#f59e0b',
            borderColor:
              event.status === 'available'
                ? '#10b981'
                : event.status === 'booked'
                ? '#ef4444'
                : '#f59e0b',
            textColor: '#ffffff',
          }))}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          height="auto"
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-in fade-in zoom-in duration-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingEvent ? 'Edit Availability Slot' : 'Create New Slot'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    placeholder="e.g., Cab Booking"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  >
                    <option value="available">✅ Available</option>
                    <option value="booked">🔴 Booked</option>
                    <option value="maintenance">🟡 Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle ID</label>
                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver ID</label>
                  <input
                    type="text"
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    placeholder="Additional details..."
                  />
                </div>
              </div>
              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition shadow-sm flex items-center gap-2"
                  >
                    <HiTrash className="w-4 h-4" /> Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl transition shadow-md flex items-center gap-2"
                  >
                    {editingEvent ? <HiPencil className="w-4 h-4" /> : <HiPlus className="w-4 h-4" />}
                    {editingEvent ? 'Update' : 'Create'}
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