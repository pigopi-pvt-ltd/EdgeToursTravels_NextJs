'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getWorkdayProgress(): number {
  const now = new Date();
  const start = 9 * 60;
  const end = 18 * 60;
  const cur = now.getHours() * 60 + now.getMinutes();
  return Math.min(100, Math.max(0, Math.round(((cur - start) / (end - start)) * 100)));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
function StatTile({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-700/60 rounded-lg p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ state }: { state: 'idle' | 'active' | 'done' }) {
  const base = 'w-3 h-3 rounded-full flex-shrink-0';
  if (state === 'active')
    return <span className={`${base} bg-emerald-500 animate-pulse ring-4 ring-emerald-500/30`} />;
  if (state === 'done')
    return <span className={`${base} bg-blue-500`} />;
  return <span className={`${base} bg-slate-300 dark:bg-slate-600`} />;
}

// ─── Calendar Grid ───────────────────────────────────────────────────────────
function CalendarGrid({
  month,
  year,
  records,
  holidays,
}: {
  month: number;
  year: number;
  records: AttendanceRecord[];
  holidays: Holiday[];
}) {
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidaySet = new Set(holidays.map((h) => new Date(h.date).toDateString()));
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const cells: React.ReactNode[] = [];

  weekDays.forEach((day) => {
    cells.push(
      <div key={`header-${day}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center py-1 tracking-wide">
        {day[0]}
      </div>
    );
  });

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${year}-${month}-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday = today.toDateString() === date.toDateString();
    const isFuture = date > today;
    const isHoliday = holidaySet.has(date.toDateString());
    const rec = records.find((r) => new Date(r.date).toDateString() === date.toDateString());

    let cls =
      'aspect-square flex items-center justify-center text-sm font-medium rounded cursor-default select-none';

    if (isHoliday) cls += ' bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    else if (isFuture) cls += ' text-slate-300 dark:text-slate-600';
    else if (rec?.status === 'present')
      cls += ' bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold';
    else if (rec?.status === 'absent')
      cls += ' bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
    else cls += ' text-slate-400 dark:text-slate-500';

    if (isToday) cls += ' ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-800';

    cells.push(
      <div key={`day-${year}-${month}-${d}`} className={cls}>
        {d}
      </div>
    );
  }

  return <div className="grid grid-cols-7 gap-1">{cells}</div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [progress, setProgress] = useState(getWorkdayProgress());

  useEffect(() => {
    const t = setInterval(() => setProgress(getWorkdayProgress()), 60_000);
    return () => clearInterval(t);
  }, []);

  const fetchTodayStatus = useCallback(async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/attendance?date=today', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.checkIn) {
        setCheckedIn(true);
        setCheckInTime(new Date(data.checkIn));
      }
      if (data?.checkOut) {
        setCheckedOut(true);
        setCheckOutTime(new Date(data.checkOut));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    const token = getAuthToken();
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?month=${currentMonth}&year=${currentYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  const fetchHolidays = useCallback(async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/holidays', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTodayStatus();
    fetchHolidays();
  }, [fetchTodayStatus, fetchHolidays]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCheckIn = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'checkin' }),
      });
      if (res.ok) {
        const now = new Date();
        setCheckedIn(true);
        setCheckInTime(now);
        fetchHistory();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch {
      alert('Check‑in failed');
    }
  };

  const handleCheckOut = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'checkout' }),
      });
      if (res.ok) {
        const now = new Date();
        setCheckedOut(true);
        setCheckOutTime(now);
        fetchHistory();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch {
      alert('Check‑out failed');
    }
  };

  const dotState = checkedIn ? (checkedOut ? 'done' : 'active') : 'idle';
  const statusLabel = checkedIn ? (checkedOut ? 'Completed' : 'Active') : 'Not started';
  const statusSub = checkedIn
    ? checkedOut
      ? `Checked out at ${checkOutTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `Checked in at ${checkInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Ready to clock in';

  const presentDays = history.filter((r) => r.status === 'present').length;
  const absentDays = history.filter((r) => r.status === 'absent').length;

  const upcomingHolidays = holidays.filter((h) => new Date(h.date) >= new Date()).slice(0, 4);

  const statusBadge: Record<string, string> = {
    present: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    absent: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
    'half-day': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    holiday: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Dashboard</p>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800 whitespace-nowrap mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="This month" value={presentDays} sub="days present" />
        <StatTile label="Absences" value={absentDays} sub="days missed" />
        <StatTile label="Avg. hours" value="8.4" sub="per day" />
      </div>

      {/* Check‑in Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <StatusDot state={dotState} />
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-white">{statusLabel}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{statusSub}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckIn}
              disabled={checkedIn}
              className="px-5 py-2 text-sm font-semibold tracking-wide bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!checkedIn || checkedOut}
              className="px-5 py-2 text-sm font-semibold tracking-wide bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Check Out
            </button>
          </div>
        </div>

        {/* Workday progress */}
        <div className="mt-5 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">09:00</span>
          <div className="flex-1">
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${checkedOut ? 'bg-blue-500' : 'bg-emerald-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
              <span>Start</span>
              <span>Lunch</span>
              <span>End</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">18:00</span>
        </div>
      </div>

      {/* Calendar + Holidays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Calendar</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  let m = calMonth - 1, y = calYear;
                  if (m < 0) { m = 11; y--; }
                  setCalMonth(m); setCalYear(y);
                }}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-600 rounded text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition"
              >‹</button>
              <span className="text-sm font-semibold text-slate-800 dark:text-white min-w-[100px] text-center">
                {MONTHS[calMonth]} {calYear}
              </span>
              <button
                onClick={() => {
                  let m = calMonth + 1, y = calYear;
                  if (m > 11) { m = 0; y++; }
                  setCalMonth(m); setCalYear(y);
                }}
                className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-600 rounded text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition"
              >›</button>
            </div>
          </div>
          <CalendarGrid month={calMonth} year={calYear} records={history} holidays={holidays} />
          <div className="flex gap-4 mt-4 flex-wrap">
            {[
              { cls: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Present' },
              { cls: 'bg-rose-100 dark:bg-rose-900/30', label: 'Absent' },
              { cls: 'bg-amber-100 dark:bg-amber-900/30', label: 'Holiday' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
                <span className="text-xs font-medium text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Upcoming holidays</p>
          {upcomingHolidays.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No upcoming holidays</p>
          ) : (
            <div className="space-y-3">
              {upcomingHolidays.map((h) => {
                const d = new Date(h.date);
                return (
                  <div key={h._id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-slate-800 dark:text-white leading-none">{d.getDate()}</span>
                      <span className="text-xs font-medium text-slate-400 uppercase">{MONTHS[d.getMonth()].slice(0, 3)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{h.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{h.type}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance history</p>
          <div className="flex gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="text-sm border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 font-medium"
            >
              {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="text-sm border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 font-medium"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <p className="text-center py-8 text-sm text-slate-400">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">No records this month</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Check in</th>
                  <th className="text-left py-2 px-3">Check out</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec) => (
                  <tr key={rec._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-200">{formatShortDate(rec.date)}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{formatTime(rec.checkIn)}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{rec.checkOut ? formatTime(rec.checkOut) : '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[rec.status] ?? ''}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}