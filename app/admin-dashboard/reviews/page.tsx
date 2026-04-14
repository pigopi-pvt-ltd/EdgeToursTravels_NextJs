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

  if (loading) return <div className="p-8 text-center">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {message && <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded border border-blue-100 dark:border-blue-800 transition-colors">{message}</div>}

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold dark:text-white transition-colors">Customer Reviews</h1>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded px-3 py-2 transition-colors">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 dark:text-white rounded transition-colors" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 transition-colors">
        <table className="min-w-full divide-y dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-slate-400 tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-slate-400 tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-slate-400 tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-slate-400 tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-slate-400 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {reviews.map(review => (
              <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium dark:text-white">{review.customerName}</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">{review.customerEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {Array(review.rating).fill(0).map((_,i) => <HiStar key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium dark:text-white">{review.title}</div>
                  <div className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{review.comment}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full inline-block font-semibold transition-colors ${
                    review.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 
                    review.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => openResponseModal(review)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300" title="Respond">
                    <HiEye className="w-5 h-5 inline" />
                  </button>
                  {review.status !== 'approved' && <button onClick={() => updateReview(review._id, 'approved')} className="text-green-600 dark:text-green-400 hover:text-green-900 transition-colors"><HiCheck className="w-5 h-5 inline" /></button>}
                  {review.status !== 'rejected' && <button onClick={() => updateReview(review._id, 'rejected')} className="text-red-600 dark:text-red-400 hover:text-red-900 transition-colors"><HiX className="w-5 h-5 inline" /></button>}
                  <button onClick={() => deleteReview(review._id)} className="text-gray-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><HiTrash className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && <tr><td colSpan={5} className="text-center py-12 dark:text-slate-400">No reviews found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all" onClick={() => setSelectedReview(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in duration-200 transition-colors" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 dark:text-white">Review Details & Response</h2>
            <div className="space-y-3 dark:text-slate-300">
              <div className="flex gap-2"><strong>Customer:</strong> <span className="text-slate-600 dark:text-slate-400">{selectedReview.customerName} ({selectedReview.customerEmail})</span></div>
              <div className="flex gap-2"><strong>Rating:</strong> <span className="text-slate-600 dark:text-slate-400">{selectedReview.rating} stars</span></div>
              <div className="flex gap-2"><strong>Title:</strong> <span className="text-slate-600 dark:text-slate-400">{selectedReview.title}</span></div>
              <div className="flex gap-2"><strong>Comment:</strong> <p className="text-slate-600 dark:text-slate-400">{selectedReview.comment}</p></div>
              <div className="flex gap-2"><strong>Status:</strong> <span className="capitalize text-slate-600 dark:text-slate-400">{selectedReview.status}</span></div>
              <div className="pt-2"><strong>Admin Response:</strong></div>
              <textarea 
                value={responseText} 
                onChange={e => setResponseText(e.target.value)} 
                rows={4} 
                className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded p-3 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                placeholder="Write your response here..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-6 border-t dark:border-slate-800 pt-4">
              <button 
                onClick={() => setSelectedReview(null)} 
                className="px-6 py-2 border dark:border-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitResponse} 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md active:scale-95"
              >
                Save Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}