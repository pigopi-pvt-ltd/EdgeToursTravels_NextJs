'use client';
import { useState } from 'react';

export default function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleCheckIn = () => {
    setCheckedIn(true);
    setLastAction(`Checked in at ${new Date().toLocaleTimeString()}`);
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setLastAction(`Checked out at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 text-center">
        <div className="text-6xl mb-4">{checkedIn ? '✅' : '⭕'}</div>
        <p className="text-lg font-medium mb-4">Status: {checkedIn ? 'Checked In' : 'Checked Out'}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn}
            className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!checkedIn}
            className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            Check Out
          </button>
        </div>
        {lastAction && <p className="mt-4 text-sm text-slate-500">{lastAction}</p>}
      </div>
    </div>
  );
}