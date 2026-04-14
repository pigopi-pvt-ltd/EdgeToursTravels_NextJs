// app/admin/reviews/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiSearch, HiCheck, HiX, HiTrash, HiEye, HiStar } from 'react-icons/hi';
import Link from 'next/link';

interface Review {
  _id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, searchTerm]);

  const fetchReviews = async () => {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, status: string, adminResponse?: string) => {
    const token = getAuthToken();
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, adminResponse }),
    });
    if (res.ok) {
      setMessage(`Review ${status} successfully`);
      fetchReviews();
      setSelectedReview(null);
      setResponseText('');
    } else {
      setMessage('Update failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    const token = getAuthToken();
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage('Review deleted');
      fetchReviews();
    } else {
      setMessage('Delete failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.adminResponse || '');
  };

  const submitResponse = async () => {
    if (!selectedReview) return;
    await updateReview(selectedReview._id, selectedReview.status, responseText);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
          <div className="h-12 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700"></div>
          <div className="divide-y dark:divide-slate-700">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-40 bg-slate-50 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-6 w-20 bg-slate-50 dark:bg-slate-900 rounded-full"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded"></div>
                  <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 animate-in fade-in duration-500 transition-colors">
      <div className="py-6 lg:py-8 space-y-6">
        {message && (
          <div className="px-6 lg:px-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors shadow-sm">{message}</div>
          </div>
        )}

        <div className="px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent transition-colors">Customer Reviews</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">Manage and respond to customer feedback</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm">
              <option value="all">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input type="text" placeholder="Search customer or comment..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
            </div>
          </div>
        </div>

        {/* Content Table - Chipka Hua (Full Width) */}
        <div className="bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Title & feedback</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {reviews.map((review, idx) => (
                  <tr key={review._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-150" style={{ animationDelay: `${idx * 40}ms` }}>
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 dark:text-white transition-colors">{review.customerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 transition-colors">{review.customerEmail}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-md">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 transition-colors text-sm">{review.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{review.comment}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] rounded-full inline-block font-bold uppercase tracking-wider transition-colors ${
                        review.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                        review.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => openResponseModal(review)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all" title="View & Respond">
                        <HiEye className="w-5 h-5" />
                      </button>
                      {review.status !== 'approved' && (
                        <button onClick={() => updateReview(review._id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-lg transition-all" title="Approve">
                          <HiCheck className="w-5 h-5" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button onClick={() => updateReview(review._id, 'rejected')} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg transition-all" title="Reject">
                          <HiX className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => deleteReview(review._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg transition-all" title="Delete">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <div className="text-4xl mb-3 opacity-20">💬</div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">No reviews found matching your criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedReview(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Review Feedback</h2>
              <button onClick={() => setSelectedReview(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"><HiX className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Customer info</span>
                    <p className="font-bold text-slate-800 dark:text-white">{selectedReview.customerName}</p>
                    <p className="text-sm text-slate-500">{selectedReview.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 text-right">Rating</span>
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <HiStar key={i} className={`w-4 h-4 ${i < selectedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">{selectedReview.title || 'Review comment'}</span>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">"{selectedReview.comment}"</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Respond to customer</label>
                <textarea 
                  value={responseText} 
                  onChange={e => setResponseText(e.target.value)} 
                  rows={4} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                  placeholder="Thank you for your feedback! We're glad you enjoyed your ride..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setSelectedReview(null)} 
                className="px-6 py-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitResponse} 
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all duration-200 active:scale-95"
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}