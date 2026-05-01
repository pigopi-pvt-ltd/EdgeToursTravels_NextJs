'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiCalendar, HiClock, HiUser, HiChevronDown, HiRefresh,
  HiCheckCircle, HiXCircle, HiMinusSm, HiTrendingUp,
  HiChartBar,
} from 'react-icons/hi';

interface Employee {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const palettes = [
    'from-indigo-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-500',
  ];
  const idx = (name.charCodeAt(0) || 65) % palettes.length;
  const sz = `w-${size} h-${size}`;
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${palettes[idx]} flex items-center justify-center flex-shrink-0 shadow-md`}>
      <span className="text-white font-black text-sm">{(name || 'U').charAt(0).toUpperCase()}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config = {
    present:  { label: 'Present',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: HiCheckCircle },
    absent:   { label: 'Absent',   cls: 'bg-rose-100 text-rose-700 border-rose-200', icon: HiXCircle },
    'half-day':{ label: 'Half Day', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: HiMinusSm },
  };
  const c = config[status as keyof typeof config] || { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: HiMinusSm };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border ${c.cls}`}>
      <Icon className="text-xs" /> {c.label}
    </span>
  );
}

function StatCard({ label, value, sub, color, Icon }: {
  label: string; value: number | string; sub?: string; color: string; Icon: any;
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20 text-rose-600 dark:text-rose-400',
    amber: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-600 dark:text-amber-400',
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-3xl p-5 md:p-6 shadow-sm border border-white/20 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl duration-300`}>
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 truncate">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl md:text-5xl font-black tracking-tighter truncate">{value}</p>
            {label === 'Rate' && <span className="text-xl font-bold opacity-60">%</span>}
          </div>
          {sub && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider truncate">{sub}</p>}
        </div>
        <div className="p-3 bg-white/40 dark:bg-black/20 rounded-2xl shadow-inner backdrop-blur-md flex-shrink-0">
          <Icon className="text-xl md:text-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (selectedEmpId) fetchAttendance(); }, [selectedEmpId, selectedMonth, selectedYear]);

  async function fetchEmployees() {
    setEmpLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        const filtered = Array.isArray(data) ? data.filter((e: Employee) => e.role === 'employee') : [];
        setEmployees(filtered);
        if (filtered.length > 0) setSelectedEmpId(filtered[0]._id);
      } else setError(data.error || 'Failed to load employees');
    } catch { setError('Network error'); }
    finally { setEmpLoading(false); }
  }

  async function fetchAttendance() {
    setLoading(true); setError('');
    const token = getAuthToken();
    try {
      const res = await fetch(
        `/api/admin/attendance?employeeId=${selectedEmpId}&month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setAttendance(Array.isArray(data) ? data : []);
      else setError(data.error || 'Failed to load attendance');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }

  const selectedEmp = employees.find(e => e._id === selectedEmpId);
  const stats = {
    present: attendance.filter(r => r.status === 'present').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    halfDay: attendance.filter(r => r.status === 'half-day').length,
    total: attendance.length,
  };
  const pct = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return { day: d.getDate(), month: MONTHS[d.getMonth()].slice(0, 3), weekday: DAYS[d.getDay()] };
  };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const calCells = Array.from({ length: firstDay + daysInMonth }, (_, i) => (i < firstDay ? null : i - firstDay + 1));
  const getRecordForDay = (day: number) => attendance.find(r => new Date(r.date).getDate() === day);

  if (empLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="w-full lg:w-40 space-y-2">
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="w-full lg:w-32 space-y-2">
            <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div className="w-full lg:w-32 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl self-end"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="mx-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-slate-50 dark:border-slate-800/50 mx-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300 font-sf">
        {/* Header Toolbar matched to Bookings Page */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 flex items-center gap-1 md:gap-2 uppercase tracking-tighter md:tracking-tight truncate">
              Attendance Management
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <div className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-0.5 flex gap-0.5">
              {(['table', 'calendar'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1 rounded-md text-[10px] md:text-xs font-bold transition-all ${
                    viewMode === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {v === 'table' ? '≡ Table' : '◫ Calendar'}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-md font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HiRefresh className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-0">        {/* Filter Bar - Flush */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Employee picker */}
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Select Employee</label>
              {selectedEmp ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-inner"
                  >
                    <Avatar name={selectedEmp.name} size={8} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{selectedEmp.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{selectedEmp.email}</p>
                    </div>
                    <HiChevronDown className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto subtle-scrollbar">
                      {employees.map(emp => (
                        <button
                          key={emp._id}
                          onClick={() => { setSelectedEmpId(emp._id); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${emp._id === selectedEmpId ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                        >
                          <Avatar name={emp.name} size={7} />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{emp.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{emp.email}</p>
                          </div>
                          {emp._id === selectedEmpId && <HiCheckCircle className="text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              )}
            </div>

            {/* Month */}
            <div className="w-full lg:w-40">
              <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>

            {/* Year */}
            <div className="w-full lg:w-32">
              <label className="block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* View button */}
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'View Report'}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-400 font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <HiXCircle className="text-xl" /> {error}
          </div>
        )}

        {/* Stats Cards - Padded but flush containers */}
        {attendance.length > 0 && (
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-b border-slate-200 dark:border-slate-800">
            <StatCard label="Present" value={stats.present} Icon={HiCheckCircle} color="emerald" sub={`${stats.present}/${stats.total} Days`} />
            <StatCard label="Absent" value={stats.absent} Icon={HiXCircle} color="rose" sub={`${stats.absent}/${stats.total} Days`} />
            <StatCard label="Half Day" value={stats.halfDay} Icon={HiMinusSm} color="amber" sub="Partial Days" />
            <StatCard label="Rate" value={pct} Icon={HiTrendingUp} color="indigo" sub="Monthly Average" />
          </div>
        )}

        {selectedEmp && attendance.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex flex-wrap items-center gap-4 animate-in fade-in duration-500">
            <Avatar name={selectedEmp.name} size={10} />
            <div className="flex-1 min-w-[200px]">
              <p className="font-black text-slate-800 dark:text-white text-lg leading-tight uppercase tracking-tight">{selectedEmp.name}</p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{selectedEmp.email}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                {MONTHS[selectedMonth-1]} {selectedYear}
              </span>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                {stats.total} Records
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-6 space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
              ))}
            </div>

            {/* Content Skeleton (Table) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-16 border-b border-slate-50 dark:border-slate-800/50 mx-6 flex items-center justify-between gap-4">
                  <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-3 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                  <div className="h-3 w-24 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                  <div className="h-3 w-24 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                  <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && attendance.length === 0 && selectedEmpId && (
          <div className="m-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center animate-in zoom-in-95 duration-300 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiCalendar className="text-4xl text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-800 dark:text-white font-black text-xl mb-2">No attendance data found</p>
            <p className="text-slate-500 dark:text-slate-400 font-bold">There are no records for {MONTHS[selectedMonth-1]} {selectedYear}.</p>
          </div>
        )}

        {/* Table View - Flush */}
        {!loading && attendance.length > 0 && viewMode === 'table' && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Daily Attendance Records</p>
              <p className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg uppercase tracking-tighter">{attendance.length} Entries Loaded</p>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Date','Day','Check In','Check Out','Hours','Status'].map(h => (
                    <th key={h} className="text-left py-4 px-6 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase border-r border-slate-100 dark:border-slate-800 last:border-r-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((rec) => {
                  const { day, month, weekday } = formatDate(rec.date);
                  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
                  let hours = '—';
                  if (rec.checkIn && rec.checkOut) {
                    const diff = (new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 36e5;
                    hours = `${diff.toFixed(1)}h`;
                  }
                  return (
                    <tr key={rec._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                      <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border shadow-sm ${isWeekend ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'}`}>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${isWeekend ? 'text-slate-400' : 'text-emerald-600'}`}>{month}</span>
                            <span className={`text-base font-black ${isWeekend ? 'text-slate-600' : 'text-slate-900 dark:text-white'}`}>{day}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${isWeekend ? 'text-slate-400 bg-slate-100 dark:bg-slate-800' : 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50'}`}>{weekday}</span>
                      </td>
                      <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                        <div className="flex items-center gap-2">
                          <HiClock className="text-emerald-500 text-sm" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tighter">{formatTime(rec.checkIn)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                        {rec.checkOut ? (
                          <div className="flex items-center gap-2">
                            <HiClock className="text-rose-500 text-sm" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tighter">{formatTime(rec.checkOut)}</span>
                          </div>
                        ) : <span className="text-sm text-slate-300 dark:text-slate-600 font-bold">—</span>}
                      </td>
                      <td className="py-4 px-6 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                        <span className={`text-sm font-black font-mono tracking-tighter ${hours !== '—' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>{hours}</span>
                      </td>
                      <td className="py-4 px-6"><StatusPill status={rec.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stats.present} Present</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stats.absent} Absent</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stats.halfDay} Half Day</span>
            </div>
            <span className="ml-auto text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-[0.2em]">{pct}% Attendance Efficiency</span>
          </div>
        </div>
      )}

      {/* Calendar View - Flush */}
      {!loading && attendance.length > 0 && viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{MONTHS[selectedMonth-1]} {selectedYear} Overview</p>
            <div className="flex gap-2">
               {['Present', 'Absent', 'Half Day'].map((label, idx) => (
                 <div key={label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                   <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                   <span className="text-[9px] font-black text-slate-500 uppercase">{label}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
            {DAYS.map(d => (
              <div key={d} className={`py-3 text-center text-[10px] font-black tracking-[0.2em] uppercase ${d === 'Sun' || d === 'Sat' ? 'text-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : 'text-slate-400 dark:text-slate-500'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-l border-t border-slate-100 dark:border-slate-800">
            {calCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/30 dark:bg-slate-800/20" />;
              const rec = getRecordForDay(day);
              const today = new Date();
              const isToday = today.getDate() === day && today.getMonth()+1 === selectedMonth && today.getFullYear() === selectedYear;
              const colIdx = (firstDay + day - 1) % 7;
              const isWeekend = colIdx === 0 || colIdx === 6;
              const bgColor = rec
                ? rec.status === 'present' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : rec.status === 'absent' ? 'bg-rose-50/50 dark:bg-rose-900/10' : 'bg-amber-50/50 dark:bg-amber-900/10'
                : '';
              const dotColor = rec
                ? rec.status === 'present' ? 'bg-emerald-500' : rec.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                : '';
              return (
                <div key={day} className={`aspect-square p-2 flex flex-col group hover:z-10 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 relative ${bgColor} ${isWeekend && !rec ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isWeekend ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600'}`}>
                    {day}
                  </div>
                  {rec && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-sm animate-pulse ${dotColor}`} />
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${rec.status === 'present' ? 'text-emerald-600' : rec.status === 'absent' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {rec.status === 'present' ? 'Present' : rec.status === 'absent' ? 'Absent' : 'Half'}
                      </span>
                    </div>
                  )}
                  {isToday && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  );
}