'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiSearch,
  HiFilter,
  HiChatAlt2,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiArrowLeft,
  HiPaperAirplane,
  HiUser,
  HiMail,
  HiPhone,
  HiLightningBolt,
} from 'react-icons/hi';

interface Ticket {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: { name: string; email: string; mobileNumber: string };
  createdAt: string;
  updatedAt: string;
  responses: { message: string; userRole: string; createdAt: string }[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/support', {
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

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/support/${selectedTicket._id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyText, newStatus: 'in-progress' }),
      });
      if (res.ok) {
        setReplyText('');
        fetchTickets();
        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                responses: [
                  ...prev.responses,
                  { message: replyText, userRole: 'employee', createdAt: new Date().toISOString() },
                ],
                status: 'in-progress',
              }
            : null
        );
      } else {
        alert('Reply failed');
      }
    } catch (err) {
      alert('Error');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const token = getAuthToken();
    try {
      await fetch(`/api/support/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'Status updated', newStatus }),
      });
      fetchTickets();
      if (selectedTicket?._id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const getPriorityConfig = (p: string) => {
    switch (p) {
      case 'urgent': return { label: 'URGENT', color: 'bg-red-500/10 text-red-500 border border-red-500/20', dot: 'bg-red-500' };
      case 'high':   return { label: 'HIGH',   color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20', dot: 'bg-orange-500' };
      case 'medium': return { label: 'MED',    color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', dot: 'bg-amber-500' };
      default:       return { label: 'LOW',    color: 'bg-sky-500/10 text-sky-500 border border-sky-500/20', dot: 'bg-sky-400' };
    }
  };

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'open':        return { label: 'Open',        color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', bar: 'bg-emerald-500' };
      case 'in-progress': return { label: 'In Progress', color: 'bg-violet-500/10 text-violet-600 border border-violet-500/20', bar: 'bg-violet-500' };
      case 'resolved':    return { label: 'Resolved',    color: 'bg-green-500/10 text-green-600 border border-green-500/20', bar: 'bg-green-500' };
      default:            return { label: 'Closed',      color: 'bg-slate-200 text-slate-500 border border-slate-300', bar: 'bg-slate-400' };
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-100 dark:border-indigo-900"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
        </div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400">Loading Tickets</p>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-100px)] rounded-xl overflow-hidden flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <HiChatAlt2 className="text-white text-sm" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400 dark:text-slate-500 leading-none">Support</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Help Desk</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {['open','in-progress','resolved'].map((s) => {
            const cfg = getStatusConfig(s);
            const count = tickets.filter(t => t.status === s).length;
            return (
              <span key={s} className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.bar}`}></span>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 bg-slate-50 dark:bg-slate-950">

        {/* ── LEFT: Ticket list ── */}
        <div
          className={`
            ${mobileListOpen && selectedTicket ? 'hidden' : 'flex'}
            lg:flex flex-col
            w-full lg:w-80 xl:w-96
            bg-white dark:bg-slate-900
            border-r border-slate-200 dark:border-slate-800
          `}
        >
          {/* Search */}
          <div className="px-3 pt-3 pb-2 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search tickets…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold tracking-wide transition ${showFilters ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <HiFilter className="text-xs" />
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>

            {showFilters && (
              <div className="flex gap-2">
                {[
                  { val: statusFilter, set: setStatusFilter, opts: ['all','open','in-progress','resolved','closed'], label: 'Status' },
                  { val: priorityFilter, set: setPriorityFilter, opts: ['all','urgent','high','medium','low'], label: 'Priority' },
                ].map(({ val, set, opts, label }) => (
                  <select
                    key={label}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="flex-1 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {opts.map(o => <option key={o} value={o}>{o === 'all' ? `All ${label}` : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                ))}
              </div>
            )}
          </div>

          {/* Count */}
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
              {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <HiChatAlt2 className="text-3xl mb-2 opacity-40" />
                <p className="text-xs font-semibold">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const pCfg = getPriorityConfig(ticket.priority);
                const sCfg = getStatusConfig(ticket.status);
                const isActive = selectedTicket?._id === ticket._id;
                return (
                  <div
                    key={ticket._id}
                    onClick={() => { setSelectedTicket(ticket); setMobileListOpen(false); }}
                    className={`relative px-3 py-3 cursor-pointer transition-all border-b border-slate-100 dark:border-slate-800 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-600 rounded-r-full" />
                    )}
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className={`font-bold text-sm leading-snug truncate ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>
                        {ticket.subject}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                        {ticket.userId?.name || 'Unknown User'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pCfg.color}`}>
                        {pCfg.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCfg.color}`}>
                        {sCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Conversation ── */}
        <div className={`flex-1 flex flex-col min-w-0 ${!mobileListOpen && selectedTicket ? 'flex' : 'hidden lg:flex'}`}>
          {selectedTicket ? (
            <>
              {/* Mobile back */}
              <div className="lg:hidden flex items-center px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setMobileListOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-600"
                >
                  <HiArrowLeft /> All Tickets
                </button>
              </div>

              {/* Ticket header */}
              <div className="flex-shrink-0 px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <HiUser className="text-indigo-500 flex-shrink-0" />
                        {selectedTicket.userId?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <HiMail className="text-indigo-500 flex-shrink-0" />
                        {selectedTicket.userId?.email || '—'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <HiPhone className="text-indigo-500 flex-shrink-0" />
                        {selectedTicket.userId?.mobileNumber || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getPriorityConfig(selectedTicket.priority).color}`}>
                      {getPriorityConfig(selectedTicket.priority).label}
                    </span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                      className="text-xs font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Original message */}
              <div className="flex-shrink-0 mx-4 mt-4 mb-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">Original Message</p>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Thread label */}
              {selectedTicket.responses.length > 0 && (
                <div className="px-4 py-1">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
                    {selectedTicket.responses.length} Response{selectedTicket.responses.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Conversation thread */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                {selectedTicket.responses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                    <HiChatAlt2 className="text-4xl mb-2 opacity-30" />
                    <p className="text-xs font-bold tracking-wide">No responses yet</p>
                  </div>
                ) : (
                  selectedTicket.responses.map((resp, idx) => {
                    const isEmployee = resp.userRole === 'employee';
                    return (
                      <div key={idx} className={`flex gap-3 ${isEmployee ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          isEmployee
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {isEmployee ? 'A' : 'C'}
                        </div>
                        <div className={`max-w-[75%] ${isEmployee ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            isEmployee
                              ? 'bg-indigo-600 text-white rounded-tr-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{resp.message}</p>
                          </div>
                          <p className={`text-[10px] font-semibold mt-1 ${isEmployee ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                            {isEmployee ? 'Agent' : 'Customer'} ·{' '}
                            {new Date(resp.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply box */}
              <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2 items-end">
                  <textarea
                    rows={2}
                    placeholder="Write a reply…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(); }}
                    className="flex-1 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:ring-0 focus:border-indigo-500 outline-none transition placeholder-slate-400 bg-slate-50 dark:bg-slate-800 leading-relaxed"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all self-end shadow-sm hover:shadow-indigo-200 disabled:shadow-none"
                  >
                    <HiPaperAirplane className="text-sm" />
                    Send
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">⌘ + Enter to send</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <HiChatAlt2 className="text-3xl text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No ticket selected</p>
                <p className="text-xs text-slate-400 mt-0.5">Choose a ticket from the list to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}