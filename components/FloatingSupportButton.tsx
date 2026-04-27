'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuthToken, getStoredUser } from '@/lib/auth';
import { HiChat, HiX, HiPaperAirplane, HiChevronLeft } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  responses: { message: string; userRole: string; createdAt: string }[];
}

const issueCategories = [
  { label: 'Booking Issue', value: 'Booking Issue', emoji: '🚗' },
  { label: 'Payment Problem', value: 'Payment Problem', emoji: '💰' },
  { label: 'Driver Complaint', value: 'Driver Complaint', emoji: '👨‍✈️' },
  { label: 'Cancellation/Refund', value: 'Cancellation/Refund', emoji: '🔄' },
  { label: 'Technical Issue', value: 'Technical Issue', emoji: '📱' },
  { label: 'Other', value: 'Other', emoji: '📝' },
];

export default function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getStoredUser();

  if (!user || (user.role !== 'customer' && user.role !== 'driver')) return null;

  const fetchTickets = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/support/my-tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchTickets();
  }, [isOpen]);

  useEffect(() => {
    if (selectedTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket]);

  const createTicket = async () => {
    if (!selectedCategory || !newTicketMessage.trim()) return;
    setSending(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: selectedCategory, message: newTicketMessage, priority: 'medium' }),
      });
      if (res.ok) {
        setSelectedCategory('');
        setNewTicketMessage('');
        fetchTickets();
      } else {
        alert('Failed to create ticket');
      }
    } catch (err) {
      alert('Error');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/support/${selectedTicket._id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchTickets();
        const updatedTicket = tickets.find(t => t._id === selectedTicket._id);
        if (updatedTicket) {
          setSelectedTicket({
            ...updatedTicket,
            responses: [...updatedTicket.responses, { message: newMessage, userRole: user.role, createdAt: new Date().toISOString() }],
          });
        }
      } else {
        alert('Failed to send');
      }
    } catch (err) {
      alert('Error');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-colors"
      >
        <HiChat className="text-2xl" />
      </motion.button>

      {/* Chat widget – slightly larger */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                {selectedTicket && (
                  <button onClick={() => setSelectedTicket(null)} className="hover:text-indigo-200">
                    <HiChevronLeft className="text-lg" />
                  </button>
                )}
                <span className="font-semibold text-sm">Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-indigo-200">
                <HiX className="text-lg" />
              </button>
            </div>

            {/* Body – scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
              {loading ? (
                <div className="text-center py-6 text-slate-400 text-sm">Loading...</div>
              ) : selectedTicket ? (
                // Chat view
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{selectedTicket.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        selectedTicket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                        selectedTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selectedTicket.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>

                  {selectedTicket.responses.map((resp, idx) => (
                    <div key={idx} className={`flex ${resp.userRole === user.role ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-2 text-sm ${
                        resp.userRole === user.role
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      }`}>
                        <p>{resp.message}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{resp.userRole} · {formatTime(resp.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />

                  {/* Reply input */}
                  <div className="flex gap-2 mt-2 bg-white dark:bg-slate-700 rounded-lg p-2 shadow-sm">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                      className="flex-1 border-0 bg-transparent text-sm focus:outline-none px-2 py-2"
                    />
                    <button onClick={sendReply} disabled={sending || !newMessage.trim()} className="text-indigo-600 disabled:opacity-50 px-2">
                      <HiPaperAirplane className="text-lg" />
                    </button>
                  </div>
                </div>
              ) : (
                // Home view: category selector + message input
                <div className="space-y-4">
                  {/* Existing tickets */}
                  {tickets.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Previous conversations</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tickets.map((t) => (
                          <div
                            key={t._id}
                            onClick={() => setSelectedTicket(t)}
                            className="bg-white dark:bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm truncate">{t.subject}</p>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                                t.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                                t.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Category selector */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">What's the issue?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {issueCategories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`text-sm px-3 py-2 rounded-lg border transition ${
                            selectedCategory === cat.value
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="mr-1">{cat.emoji}</span> {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message input */}
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Describe your issue..."
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm resize-none bg-white dark:bg-slate-700"
                    />
                    <button
                      onClick={createTicket}
                      disabled={sending || !selectedCategory || !newTicketMessage.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}