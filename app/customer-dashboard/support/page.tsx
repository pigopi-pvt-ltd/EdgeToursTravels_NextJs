'use client';
import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { SupportSkeleton } from '@/components/CustomerSkeletons';

export default function CustomerSupportPage() {
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) return <SupportSkeleton />;

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500 font-sf">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md mb-8">
          <h1 className="text-[13px] md:text-xl font-extrabold text-indigo-600 uppercase tracking-tighter">Support / Complaints</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
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
      </div>
    </div>
  );
}