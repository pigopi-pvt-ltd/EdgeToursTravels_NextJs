'use client';
import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';

export default function CustomerSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, message, priority }),
      });
      if (res.ok) {
        setSubmitted(true);
        setSubject('');
        setMessage('');
        setTimeout(() => setSubmitted(false), 3000);
      } else alert('Submission failed');
    } catch (err) { alert('Error'); }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support / Complaints</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6 space-y-4">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
        <textarea
          rows={5}
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border rounded-lg p-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Submit Ticket
        </button>
        {submitted && <p className="text-green-600">Ticket submitted! We'll get back to you soon.</p>}
      </div>
    </div>
  );
}