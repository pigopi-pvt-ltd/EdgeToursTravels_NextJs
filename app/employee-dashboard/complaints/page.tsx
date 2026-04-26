'use client';
import { useState } from 'react';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([
    { id: 1, subject: 'Internet issue', status: 'Resolved', date: '2025-04-20' },
    { id: 2, subject: 'Key missing', status: 'Pending', date: '2025-04-25' },
  ]);
  const [newSubject, setNewSubject] = useState('');

  const submitComplaint = () => {
    if (!newSubject) return;
    setComplaints([...complaints, { id: Date.now(), subject: newSubject, status: 'Pending', date: new Date().toISOString().split('T')[0] }]);
    setNewSubject('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Complaints</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">Submit New Complaint</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Brief description"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button onClick={submitComplaint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Submit</button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">Your Complaints</h2>
        {complaints.length === 0 ? (
          <p className="text-slate-500">No complaints yet.</p>
        ) : (
          <table className="w-full">
            <thead className="border-b"><tr><th className="text-left py-2">Subject</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.subject}</td>
                  <td className="py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                  <td className="py-2 text-center">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}