'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiArrowPath,
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
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
import { useNotifications } from '@/hooks/useNotifications';
import NotificationBell from '@/components/NotificationBell';

interface SupportTicket {
  _id: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  title?: string;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'half-day';
}

interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

interface DailyCount {
  date: string;
  day: string;
  present: number;
  absent: number;
  tickets: number;
}

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [ticketStats, setTicketStats] = useState<TicketStats>({ open: 0, inProgress: 0, resolved: 0, total: 0 });
  const [dailyData, setDailyData] = useState<DailyCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Real‑time notifications
  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  // Auto‑refresh ticket data when a new notification arrives
  useEffect(() => {
    // Listen for new notifications via custom event (optional)
    const handleNewNotification = (event: CustomEvent) => {
      const { notification } = event.detail;
      // If it's a support ticket notification, refresh
      if (notification?.type === 'new_ticket' || notification?.type === 'ticket_updated') {
        fetchSupportTickets();
      }
    };
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    return () => window.removeEventListener('new-notification', handleNewNotification as EventListener);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSupportTickets(), fetchAttendanceRecords()]);
    setLoading(false);
  };

  const fetchSupportTickets = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTickets(data);
        const open = data.filter((t: SupportTicket) => t.status === 'open').length;
        const inProgress = data.filter((t: SupportTicket) => t.status === 'in-progress').length;
        const resolved = data.filter((t: SupportTicket) => t.status === 'resolved').length;
        setTicketStats({ open, inProgress, resolved, total: data.length });
        computeDailyData(data, attendance);
      }
    } catch (error) {
      console.error('Support fetch error', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    const token = getAuthToken();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    try {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAttendance(data);
        computeDailyData(tickets, data);
      }
    } catch (error) {
      console.error('Attendance fetch error', error);
    }
  };

  const computeDailyData = (ticketList: SupportTicket[], attendanceList: AttendanceRecord[]) => {
    const last7Days: DailyCount[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push({
        date: dateStr,
        day: dayName,
        present: 0,
        absent: 0,
        tickets: 0,
      });
    }

    attendanceList.forEach(rec => {
      const recDate = new Date(rec.date).toISOString().split('T')[0];
      const day = last7Days.find(d => d.date === recDate);
      if (day) {
        if (rec.status === 'present') day.present += 1;
        else if (rec.status === 'absent') day.absent += 1;
      }
    });

    ticketList.forEach(ticket => {
      const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      const day = last7Days.find(d => d.date === createdDate);
      if (day) day.tickets += 1;
    });

    setDailyData(last7Days);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-end p-2">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
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
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HiArrowPath className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
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