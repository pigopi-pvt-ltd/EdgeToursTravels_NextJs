'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';
import {
  HiOutlinePaperAirplane,
  HiOutlineGift,
  HiOutlineBell,
  HiArrowPath,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUserCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineChatBubbleLeftEllipsis,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface AttendanceRecord {
  _id?: string;
  date: string;
  status: 'present' | 'absent' | 'half-day';
  checkInTime?: string;
  checkOutTime?: string;
}
interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'public' | 'optional' | 'company';
}
interface MonthlyStats {
  totalDays: number;
  present: number;
  absent: number;
  halfDay: number;
  percentage: number;
}
interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function computeStats(records: AttendanceRecord[]): MonthlyStats {
  const totalDays = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const halfDay = records.filter(r => r.status === 'half-day').length;
  const percentage = totalDays ? Math.round(((present + halfDay * 0.5) / totalDays) * 100) : 0;
  return { totalDays, present, absent, halfDay, percentage };
}

function buildWeekData(records: AttendanceRecord[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const rec = records.find(r => r.date === dateStr);
    return {
      day: dayName,
      present: rec?.status === 'present' ? 1 : 0,
      absent: rec?.status === 'absent' ? 1 : 0,
      half: rec?.status === 'half-day' ? 1 : 0,
    };
  });
}

//  calendar grid for the current month
function buildCalendarGrid(records: AttendanceRecord[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();

  const startOffset = startWeekday === 0 ? 6 : startWeekday - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const cells: { day: number; status: string; isToday: boolean; isWeekend: boolean }[] = [];

  // Empty cells before month starts
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: 0, status: 'empty', isToday: false, isWeekend: false });
  }

  // Actual days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rec = records.find(r => r.date === dateStr);
    let status = 'none';
    if (rec) {
      if (rec.status === 'present') status = 'present';
      else if (rec.status === 'absent') status = 'absent';
      else if (rec.status === 'half-day') status = 'half';
    } else if (d < today) {
      status = 'missed';
    } else if (d === today) {
      status = 'today';
    } else {
      status = 'future';
    }
    cells.push({
      day: d,
      status,
      isToday: d === today,
      isWeekend,
    });
  }

  // Fill remaining cells to complete the grid 
  const totalCells = Math.ceil(cells.length / 7) * 7;
  while (cells.length < totalCells) {
    cells.push({ day: 0, status: 'empty', isToday: false, isWeekend: false });
  }

  return cells;
}

/* ─── Sub-components  ─────────────────────── */


function AttendanceBarChart({ data }: { data: ReturnType<typeof buildWeekData> }) {
  const maxVal = 1;
  const hasData = data.some(d => d.present > 0 || d.absent > 0 || d.half > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 font-bold text-sm">
        No attendance records for the last 7 days
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end gap-2 flex-1 pb-5 relative">
        <div className="absolute bottom-5 left-0 right-0 h-px bg-gray-200 dark:bg-slate-700" />
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full">
            <div className="flex flex-col justify-end gap-px w-full flex-1">
              {d.present > 0 && (
                <div
                  className="rounded-t-sm bg-emerald-500 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${(d.present / maxVal) * 80}%`, minHeight: 4 }}
                  title="Present"
                />
              )}
              {d.half > 0 && (
                <div
                  className="rounded-t-sm bg-amber-500 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${(d.half / maxVal) * 50}%`, minHeight: 4 }}
                  title="Half Day"
                />
              )}
              {d.absent > 0 && (
                <div
                  className="rounded-t-sm bg-red-500 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${(d.absent / maxVal) * 80}%`, minHeight: 4 }}
                  title="Absent"
                />
              )}
              {d.present === 0 && d.half === 0 && d.absent === 0 && (
                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-sm" style={{ height: '20%' }} />
              )}
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-1">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {[
          ['#10b981', 'Present'],
          ['#ef4444', 'Absent'],
          ['#f59e0b', 'Half Day'],
        ].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarHeatmap({ cells }: { cells: ReturnType<typeof buildCalendarGrid> }) {
  // Group cells into weeks (rows)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const getStatusStyle = (status: string, isWeekend: boolean) => {
    if (status === 'present') return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold';
    if (status === 'absent') return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 font-bold';
    if (status === 'half') return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold';
    if (status === 'today') return 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold ring-2 ring-indigo-400';
    if (status === 'missed' && !isWeekend) return 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 font-medium';
    if (isWeekend && status !== 'empty' && status !== 'future') return 'bg-gray-100 dark:bg-slate-800/60 text-gray-500 font-medium';
    if (status === 'future') return 'bg-white dark:bg-slate-800/20 border border-gray-200 dark:border-slate-700 text-gray-400';
    return 'bg-transparent';
  };

  return (
    <div className="space-y-1">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-1">
          {week.map((cell, idx) => {
            if (cell.day === 0) {
              return <div key={idx} className="aspect-square rounded-lg bg-transparent" />;
            }
            const style = getStatusStyle(cell.status, cell.isWeekend);
            let title = `${cell.day}`;
            if (cell.status === 'present') title += ' – Present';
            else if (cell.status === 'absent') title += ' – Absent';
            else if (cell.status === 'half') title += ' – Half Day';
            else if (cell.status === 'today') title += ' – Today';
            else if (cell.status === 'missed') title += ' – No record';
            else if (cell.status === 'future') title += ' – Upcoming';
            if (cell.isWeekend) title += ' (Weekend)';
            return (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors hover:opacity-80 cursor-help ${style}`}
                title={title}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
export default function EmployeeDashboard() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardView, setDashboardView] = useState<'month' | 'week' | 'day'>('month');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { refresh: refreshNotifications } = useNotifications();

  const stats = useMemo(() => computeStats(attendance), [attendance]);
  const weekData = useMemo(() => buildWeekData(attendance), [attendance]);
  const calendarCells = useMemo(() => buildCalendarGrid(attendance), [attendance]);
  const unread = notifications.filter(n => !n.read).length;

  const ticketStats = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  };

  const dailyData = useMemo(() => weekData.map(d => ({
    ...d,
    tickets: 0
  })), [weekData]);

  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const fetchAllData = async () => {
    const token = getAuthToken();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    setRefreshing(true);

    try {
      const [attRes, holRes, notifRes] = await Promise.all([
        fetch(`/api/attendance?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/holidays', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [attData, holData, notifData] = await Promise.all([
        attRes.json(), holRes.json(), notifRes.json(),
      ]);

      if (attRes.ok && Array.isArray(attData)) setAttendance(attData);
      else setMessage({ text: attData.error || 'Failed to load attendance', type: 'error' });

      if (holRes.ok && Array.isArray(holData)) setHolidays(holData);
      if (notifRes.ok && Array.isArray(notifData)) setNotifications(notifData);
      refreshNotifications();
    } catch {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b">
          <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl"></div>)}
          </div>
          <div className="h-96 bg-slate-100 rounded-2xl"></div>
          <div className="h-80 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Header Toolbar matched to Admin Dashboard */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Employee Dashboard Overview
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchAllData}
              className="w-[34px] md:w-10 h-[34px] md:h-10 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 gap-1.5"
            >
              <HiArrowPath className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
            <div className="flex items-center gap-1 md:gap-1.5 ml-1">
              {['Month', 'Week', 'Day'].map((label) => {
                const v = label.toLowerCase();
                const isActive = dashboardView === v;
                return (
                  <button
                    key={v}
                    onClick={() => setDashboardView(v as any)}
                    className={`px-3 md:px-5 h-[34px] md:h-10 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center ${
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
            <NotificationBell />
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Ticket Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Open Tickets" value={ticketStats.open} icon={<HiOutlineExclamationCircle className="w-6 h-6" />} color="amber" />
            <StatCard title="In Progress" value={ticketStats.inProgress} icon={<HiOutlineClock className="w-6 h-6" />} color="violet" />
            <StatCard title="Resolved" value={ticketStats.resolved} icon={<HiOutlineCheckCircle className="w-6 h-6" />} color="emerald" />
            <StatCard title="Total Tickets" value={ticketStats.total} icon={<HiOutlineChatBubbleLeftEllipsis className="w-6 h-6" />} color="indigo" />
          </div>

          {/* Two Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attendance Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Attendance Trend</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Last 7 days – Present vs Absent</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <HiOutlineClock className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Bar dataKey="present" name="Present" radius={[6, 6, 0, 0]} fill="#10b981" barSize={30} />
                    <Bar dataKey="absent" name="Absent" radius={[6, 6, 0, 0]} fill="#ef4444" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ticket Creation Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ticket Creation Trend</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Last 7 days activity</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <HiOutlineChatBubbleLeftEllipsis className="text-violet-600 dark:text-violet-400 text-xl" />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Bar dataKey="tickets" name="Tickets Created" radius={[6, 6, 0, 0]} fill="#8b5cf6" barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    violet: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 text-violet-600 dark:text-violet-400',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-3xl p-6 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{title}</p>
          <p className="text-4xl md:text-5xl font-black tracking-tighter">{value}</p>
        </div>
        <div className="p-3 bg-white/40 dark:bg-black/20 rounded-2xl shadow-inner backdrop-blur-md">{icon}</div>
      </div>
    </div>
  );
}