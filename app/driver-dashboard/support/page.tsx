'use client';

import { useState } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import { motion } from 'framer-motion';
import { HiMail, HiChat, HiOutlineFlag, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

export default function CustomerSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const user = getStoredUser();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
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
        setError('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError('Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">We're here to help</h1>
            <p className="text-indigo-100 mt-1">Submit a support request or complaint</p>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                <HiExclamationCircle className="text-lg" /> {error}
              </div>
            )}
            {submitted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
                <HiCheckCircle className="text-lg" /> Your ticket has been submitted. Our team will respond shortly.
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                rows={5}
                placeholder="Please describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="low">Low – General inquiry</option>
                <option value="medium">Medium – Non-urgent issue</option>
                <option value="high">High – Important matter</option>
                <option value="urgent">Urgent – Requires immediate attention</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <HiMail /> Submit Ticket
            </button>

            <p className="text-xs text-center text-slate-400 mt-4">
              Our support team typically responds within 12 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}