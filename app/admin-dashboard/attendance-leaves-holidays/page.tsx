'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiPlus,
  HiTrash,
  HiArrowPath,
} from 'react-icons/hi2';

// ---------- Types ----------
interface Leave {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  createdAt: string;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: string;
}

export default function AdminAttendanceLeavesHolidaysPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'leaves' | 'holidays'>('leaves');

  // Leaves state
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', type: 'public' });
  const [submittingHoliday, setSubmittingHoliday] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==================== LEAVES ====================
  const fetchLeaves = async () => {
    const token = getAuthToken();
    setLeavesLoading(true);
    try {
      const res = await fetch(`/api/leaves?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        setMessage({ text: data.error || 'Failed to load leaves', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleLeaveAction = async () => {
    if (!selectedLeave || !action) return;
    setSubmitting(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/leaves/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action, comment }),
      });
      if (res.ok) {
        setMessage({ text: `Leave ${action}d successfully`, type: 'success' });
        fetchLeaves();
        setModalOpen(false);
        setSelectedLeave(null);
        setComment('');
        setAction(null);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const openModal = (leave: Leave, act: 'approve' | 'reject') => {
    setSelectedLeave(leave);
    setAction(act);
    setComment('');
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>;
    }
  };

  // ==================== HOLIDAYS ====================
  const fetchHolidays = async () => {
    const token = getAuthToken();
    setHolidaysLoading(true);
    try {
      const res = await fetch('/api/holidays', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHolidays(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHolidaysLoading(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name || !holidayForm.date) {
      setMessage({ text: 'Name and date are required', type: 'error' });
      return;
    }
    setSubmittingHoliday(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(holidayForm),
      });
      if (res.ok) {
        setMessage({ text: 'Holiday added successfully', type: 'success' });
        setHolidayForm({ name: '', date: '', type: 'public' });
        setShowHolidayForm(false);
        fetchHolidays();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to add', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setSubmittingHoliday(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    setDeletingId(id);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchHolidays();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      alert('Error');
    } finally {
      setDeletingId(null);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaves();
    fetchHolidays();
  }, []);

  // Re-fetch leaves when filter changes
  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
          <h1 className="text-sm md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Attendance & Leave Management
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-4 md:px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('leaves')}
              className={`py-3 px-1 font-bold text-sm transition-all ${
                activeTab === 'leaves'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`py-3 px-1 font-bold text-sm transition-all ${
                activeTab === 'holidays'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Holidays
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* ==================== LEAVES TAB ==================== */}
          {activeTab === 'leaves' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={fetchLeaves} className="p-2 text-slate-500 hover:text-indigo-600">
                  <HiArrowPath className="w-5 h-5" />
                </button>
              </div>

              {leavesLoading ? (
                <div className="text-center py-12">Loading leaves...</div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No leave requests found</div>
              ) : (
                <div className="grid gap-4">
                  {leaves.map((leave) => (
                    <div key={leave._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <HiOutlineUser className="text-slate-400" />
                            <span className="font-bold text-slate-800 dark:text-white">{leave.employeeName}</span>
                            <span className="text-xs text-slate-400">{leave.employeeEmail}</span>
                            {getStatusBadge(leave.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <HiOutlineCalendar className="text-indigo-400" />
                              <span>{new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="capitalize">
                              <span className="text-slate-500">Type:</span> {leave.type}
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500">Reason:</span> {leave.reason}
                            </div>
                            {leave.comment && (
                              <div className="col-span-2">
                                <span className="text-slate-500">Admin comment:</span> {leave.comment}
                              </div>
                            )}
                          </div>
                        </div>
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(leave, 'approve')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition"
                            >
                              <HiOutlineCheckCircle className="inline mr-1 w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => openModal(leave, 'reject')}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition"
                            >
                              <HiOutlineXCircle className="inline mr-1 w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== HOLIDAYS TAB ==================== */}
          {activeTab === 'holidays' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowHolidayForm(!showHolidayForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <HiPlus className="w-4 h-4" /> Add Holiday
                </button>
              </div>

              {showHolidayForm && (
                <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <form onSubmit={handleAddHoliday} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Holiday Name</label>
                      <input
                        type="text"
                        required
                        value={holidayForm.name}
                        onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={holidayForm.date}
                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                      <select
                        value={holidayForm.type}
                        onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="optional">Optional</option>
                        <option value="company">Company</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setShowHolidayForm(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                      <button type="submit" disabled={submittingHoliday} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50">
                        {submittingHoliday ? 'Adding...' : 'Add Holiday'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {holidaysLoading ? (
                <div className="text-center py-12">Loading holidays...</div>
              ) : holidays.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No holidays added yet</div>
              ) : (
                <div className="grid gap-3">
                  {holidays.map((holiday) => (
                    <div key={holiday._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{holiday.name}</h3>
                        <p className="text-sm text-slate-500">{new Date(holiday.date).toLocaleDateString()} • {holiday.type}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday._id)}
                        disabled={deletingId === holiday._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        {deletingId === holiday._id ? <HiArrowPath className="w-5 h-5 animate-spin" /> : <HiTrash className="w-5 h-5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for approve/reject comment */}
      {modalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Employee:</strong> {selectedLeave.employeeName}<br />
                <strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
              </p>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Comment (optional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={action === 'reject' ? 'Reason for rejection...' : 'Any remarks...'}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleLeaveAction} disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-50">
                {submitting ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}