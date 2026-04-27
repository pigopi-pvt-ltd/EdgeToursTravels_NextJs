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

function StatCard({ label, value, sub, gradient, Icon }: {
  label: string; value: number; sub?: string; gradient: string; Icon: any;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-3 md:p-4 bg-gradient-to-br ${gradient} shadow-md`}>
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border-4 border-white/20" />
      <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full border-4 border-white/10" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-white/80">{label}</p>
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="text-white text-sm" />
          </div>
        </div>
        <p className="text-4xl md:text-5xl font-black text-white leading-none">{value}</p>
        {sub && <p className="text-[11px] text-white/70 font-bold mt-1">{sub}</p>}
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
      <div className="flex justify-center items-center min-h-[60vh] bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
              <HiCalendar className="text-white text-base" />
            </div>
            <p className="text-xs font-black tracking-wider text-indigo-600">ATTENDANCE</p>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 font-semibold mt-1">Track employee Attendance and performance</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
            {(['table', 'calendar'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === v ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {v === 'table' ? '≡ Table' : '◫ Calendar'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAttendance}
            disabled={loading}
            className={`p-2 rounded-xl bg-gray-100 text-indigo-600 hover:bg-indigo-50 transition ${loading ? 'animate-spin' : ''}`}
          >
            <HiRefresh className="text-base" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Employee picker */}
          <div className="flex-1">
            <label className="block text-[10px] font-black tracking-wider text-indigo-600 mb-1.5">EMPLOYEE</label>
            {selectedEmp ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100"
                >
                  <Avatar name={selectedEmp.name} size={7} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{selectedEmp.name}</p>
                    <p className="text-[10px] font-mono text-gray-500 truncate">{selectedEmp.email}</p>
                  </div>
                  <HiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                    {employees.map(emp => (
                      <button
                        key={emp._id}
                        onClick={() => { setSelectedEmpId(emp._id); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition ${emp._id === selectedEmpId ? 'bg-indigo-50' : ''}`}
                      >
                        <Avatar name={emp.name} size={7} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-900 truncate">{emp.name}</p>
                          <p className="text-[10px] font-mono text-gray-500 truncate">{emp.email}</p>
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900"
              >
                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            )}
          </div>

          {/* Month */}
          <div>
            <label className="block text-[10px] font-black tracking-wider text-indigo-600 mb-1.5">MONTH</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900"
            >
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[10px] font-black tracking-wider text-indigo-600 mb-1.5">YEAR</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900"
            >
              {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* View button */}
          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'View Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 font-bold text-sm flex items-center gap-2">
          <HiXCircle className="text-lg" /> {error}
        </div>
      )}

      {/* Stats Cards – same bold gradients on white background */}
      {attendance.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Present" value={stats.present} Icon={HiCheckCircle} gradient="from-emerald-600 to-teal-600" sub={`of ${stats.total} days`} />
          <StatCard label="Absent" value={stats.absent} Icon={HiXCircle} gradient="from-rose-600 to-pink-600" sub={`of ${stats.total} days`} />
          <StatCard label="Half Day" value={stats.halfDay} Icon={HiMinusSm} gradient="from-amber-500 to-orange-600" sub="partial days" />
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black tracking-wider text-indigo-600">ATTENDANCE RATE</p>
              <HiTrendingUp className="text-indigo-600 text-base" />
            </div>
            <p className="text-4xl md:text-5xl font-black text-gray-900">{pct}<span className="text-2xl">%</span></p>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] font-bold text-gray-500 mt-2">{stats.present}/{stats.total} days present</p>
          </div>
        </div>
      )}

      {selectedEmp && attendance.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
          <Avatar name={selectedEmp.name} size={9} />
          <div>
            <p className="font-black text-gray-900 text-sm">{selectedEmp.name}</p>
            <p className="text-[11px] font-mono text-gray-500">{selectedEmp.email}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              {MONTHS[selectedMonth-1]} {selectedYear}
            </span>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {stats.total} Records
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && attendance.length === 0 && selectedEmpId && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
          <HiCalendar className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-900 font-bold">No records found</p>
          <p className="text-gray-500 text-sm mt-1">No attendance data for {MONTHS[selectedMonth-1]} {selectedYear}</p>
        </div>
      )}

      {/* Table View */}
      {!loading && attendance.length > 0 && viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <p className="text-xs font-black tracking-wider text-indigo-600">DAILY RECORDS</p>
            <p className="text-[10px] font-mono text-gray-500">{attendance.length} entries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Date','Day','Check In','Check Out','Hours','Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-black tracking-wider text-indigo-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec, i) => {
                  const { day, month, weekday } = formatDate(rec.date);
                  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
                  let hours = '—';
                  if (rec.checkIn && rec.checkOut) {
                    const diff = (new Date(rec.checkOut).getTime() - new Date(rec.checkIn).getTime()) / 36e5;
                    hours = `${diff.toFixed(1)}h`;
                  }
                  return (
                    <tr key={rec._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center ${isWeekend ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                            <span className={`text-[10px] font-black ${isWeekend ? 'text-gray-500' : 'text-indigo-600'}`}>{month}</span>
                            <span className={`text-base font-black ${isWeekend ? 'text-gray-600' : 'text-gray-900'}`}>{day}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isWeekend ? 'text-gray-500 bg-gray-100' : 'text-cyan-700 bg-cyan-50'}`}>{weekday}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <HiClock className="text-emerald-600 text-xs" />
                          <span className="text-sm font-black text-emerald-700 font-mono">{formatTime(rec.checkIn)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rec.checkOut ? (
                          <div className="flex items-center gap-1.5">
                            <HiClock className="text-rose-600 text-xs" />
                            <span className="text-sm font-black text-rose-700 font-mono">{formatTime(rec.checkOut)}</span>
                          </div>
                        ) : <span className="text-sm text-gray-400 font-bold">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-black font-mono ${hours !== '—' ? 'text-amber-700' : 'text-gray-400'}`}>{hours}</span>
                      </td>
                      <td className="py-3 px-4"><StatusPill status={rec.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs font-bold text-gray-700"><span className="text-emerald-600">{stats.present}</span> Present</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-xs font-bold text-gray-700"><span className="text-rose-600">{stats.absent}</span> Absent</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs font-bold text-gray-700"><span className="text-amber-600">{stats.halfDay}</span> Half Day</span></div>
            <span className="ml-auto text-[10px] font-bold text-gray-500 font-mono">{pct}% attendance rate</span>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {!loading && attendance.length > 0 && viewMode === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs font-black tracking-wider text-indigo-600">{MONTHS[selectedMonth-1]} {selectedYear} — Calendar View</p>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DAYS.map(d => (
              <div key={d} className={`py-2 text-center text-[10px] font-black tracking-wider ${d === 'Sun' || d === 'Sat' ? 'text-rose-600' : 'text-indigo-600'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square border-b border-r border-gray-200" />;
              const rec = getRecordForDay(day);
              const today = new Date();
              const isToday = today.getDate() === day && today.getMonth()+1 === selectedMonth && today.getFullYear() === selectedYear;
              const colIdx = (firstDay + day - 1) % 7;
              const isWeekend = colIdx === 0 || colIdx === 6;
              const bgColor = rec
                ? rec.status === 'present' ? 'bg-emerald-50' : rec.status === 'absent' ? 'bg-rose-50' : 'bg-amber-50'
                : '';
              const dotColor = rec
                ? rec.status === 'present' ? 'bg-emerald-500' : rec.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                : '';
              return (
                <div key={day} className={`aspect-square border-b border-r border-gray-200 p-1.5 flex flex-col ${bgColor}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-indigo-600' : ''}`}>
                    <span className={`text-xs font-black ${isToday ? 'text-white' : isWeekend ? 'text-rose-600' : 'text-gray-700'}`}>{day}</span>
                  </div>
                  {rec && (
                    <div className="flex-1 flex items-end justify-end">
                      <span className="hidden md:block text-[9px] font-black px-1.5 py-0.5 rounded-md bg-opacity-20 text-emerald-700 bg-emerald-100">
                        {rec.status === 'present' ? '✓ IN' : rec.status === 'absent' ? '✗ ABS' : '½ HD'}
                      </span>
                      <span className={`md:hidden w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[11px] font-bold text-gray-700">Present</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[11px] font-bold text-gray-700">Absent</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-[11px] font-bold text-gray-700">Half Day</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600" /><span className="text-[11px] font-bold text-gray-700">Today</span></div>
          </div>
        </div>
      )}
    </div>
  );
}