'use client';
import { useState } from 'react';

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message) return;
    // In a real app, you'd send to backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setMessage('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Support</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Need help? Send a message to the admin or HR team.
        </p>
        <textarea
          rows={4}
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />
        <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Send Message</button>
        {submitted && <p className="mt-3 text-green-600 text-sm">Message sent! We'll get back to you soon.</p>}
      </div>
    </div>
  );
}