'use client';

import { useEffect, useState } from 'react';
import {
  HiCheck,
  HiXMark as HiX,
  HiStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineMagnifyingGlass as HiOutlineSearch,
  HiOutlineFunnel as HiOutlineFilter
} from 'react-icons/hi2';
import { getAuthToken } from '@/lib/auth';

interface Review {
  _id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Artificial delay for professional skeleton feel
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (res.ok) setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage(`Review ${status} successfully`);
        fetchReviews();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800';
      case 'rejected': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-100 dark:border-rose-800';
      default: return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse shadow-inner">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-60 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Precise Border Grid Skeleton (approx 440px height per item) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-10 h-[440px] flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-3">
                  <div className="h-6 w-44 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                  <div className="h-3 w-32 bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>
                </div>
                <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              </div>
              <div className="flex gap-1.5 mb-8">
                {[1, 2, 3, 4, 5].map(j => <div key={j} className="w-5 h-5 bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>)}
              </div>
              <div className="space-y-3 flex-grow">
                <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>
                <div className="h-4 w-11/12 bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>
                <div className="h-4 w-4/5 bg-slate-50 dark:bg-slate-800/40 rounded-md"></div>
              </div>
              <div className="flex gap-4 pt-10 border-t border-slate-50 dark:border-slate-800 mt-auto">
                <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500 transition-colors">
      {/* Sticky Header Toolbar - Edge-to-Edge */}
      <div className="sticky top-0 z-40 bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 backdrop-blur-md min-h-[56px]">
        <div className="flex items-center gap-4">
          <h2 className="text-[14px] md:text-xl font-extrabold md:font-bold text-emerald-600 uppercase tracking-tighter md:tracking-tight whitespace-nowrap">
            CUSTOMER REVIEWS <span className="text-black dark:text-white font-normal">({reviews.length})</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer shadow-sm border-r-8 border-transparent">
            <option value="all">System: All Reviews</option>
            <option value="pending">🟡 Action Required</option>
            <option value="approved">🟢 Publicly Visible</option>
            <option value="rejected">🔴 Moderated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col min-h-[calc(100vh-120px)] border-t border-slate-100 dark:border-slate-800">
        {message && (
          <div className="px-6 py-4 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 border-b border-emerald-100 dark:border-emerald-800/50 transition-colors flex items-center gap-2 animate-in slide-in-from-top-2">
            <HiOutlineCheckCircle className="text-xl" />
            <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center py-32 text-center px-4 bg-slate-50/20 dark:bg-slate-900/20">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 flex items-center justify-center rounded-3xl mb-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in zoom-in duration-500">
              <HiOutlineChatBubbleLeftRight className="text-5xl text-slate-200 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">No Feedback Recorded</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-3 max-w-xs leading-relaxed capitalize">We couldn't find any reviews matching your current modulation status.</p>
          </div>
        ) : (
          /* Grid View - Edge-to-Edge border structure (approx 440px height) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 transition-all duration-500">
            {reviews.map((review) => (
              <div key={review._id} className="p-10 h-[440px] bg-slate-50 dark:bg-[#0A1128] hover:bg-white dark:hover:bg-slate-800/40 transition-all group flex flex-col relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-lg group-hover:text-emerald-600 transition-colors">{review.customerName}</h3>
                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">{review.customerEmail}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(review.status)}`}>
                    {review.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className={`w-4 h-4 transition-all duration-300 ${i < review.rating ? 'text-amber-400 scale-110 drop-shadow-sm' : 'text-slate-100 dark:text-slate-800'}`} />
                  ))}
                  <span className="ml-3 text-xs font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{review.rating}.0</span>
                </div>

                <div className="relative mb-8 flex-grow">
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-bold italic quote line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                    "{review.comment}"
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-6">
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"><HiOutlineClock className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Timestamp: {new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex gap-3 w-full">
                    {review.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(review._id, 'approved')} className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-200/50 dark:shadow-none">
                          <HiCheck className="text-xl" /> Approve
                        </button>
                        <button onClick={() => updateStatus(review._id, 'rejected')} className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-rose-600 border border-rose-100 dark:border-rose-900/50 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95">
                          <HiX className="text-xl" /> Moderated
                        </button>
                      </>
                    )}
                    {(review.status === 'approved' || review.status === 'rejected') && (
                      <button onClick={() => updateStatus(review._id, 'pending')} className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-100">
                        <HiOutlineClock className="text-xl" /> Restore to Queue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedReview(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-xl shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
            <div className="p-10 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Modulation Feedback</h3>
                <button onClick={() => setSelectedReview(null)} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"><HiX className="text-2xl text-slate-400" /></button>
              </div>

              <div className="mb-10 p-7 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 relative italic text-slate-600 dark:text-slate-300">
                <p className="text-base font-bold relative z-10 antialiased leading-relaxed">{selectedReview.comment}</p>
              </div>

              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your response..."
                className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-8 focus:ring-emerald-500/5 h-40 text-slate-700 dark:text-white mb-10 transition-all font-bold text-sm outline-none shadow-inner resize-none"
              />

              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-5 rounded-[28px] transition-all active:scale-95 shadow-3xl shadow-emerald-200 dark:shadow-none tracking-[0.2em] text-[11px]">
                Dispatch Modulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}