'use client';

import { useEffect, useState } from 'react';
import { HiPlus, HiTrash, HiPencil, HiX, HiCheck } from 'react-icons/hi';
import { getAuthToken } from '@/lib/auth';

interface MasterDocument {
  _id: string;
  key: string;
  label: string;
  description: string;
  isRequired: boolean;
  isActive: boolean;
  category: string;
}

export default function DocumentConfigPage() {
  const [documents, setDocuments] = useState<MasterDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<MasterDocument | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    isRequired: true,
    isActive: true,
    category: 'driver'
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/master-documents', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        console.error('API Error:', data.error || 'Unknown error');
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const method = editingDoc ? 'PATCH' : 'POST';
    const url = editingDoc ? `/api/admin/master-documents/${editingDoc._id}` : '/api/admin/master-documents';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setEditingDoc(null);
        setFormData({ key: '', label: '', description: '', isRequired: true, isActive: true, category: 'driver' });
        setMessage({ type: 'success', text: `Document type ${editingDoc ? 'updated' : 'created'} successfully!` });
        fetchDocuments();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const initiateDelete = (id: string) => {
    setDocToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      const res = await fetch(`/api/admin/master-documents/${docToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuration deleted successfully' });
        fetchDocuments();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
    }
  };

  const openEditModal = (doc: MasterDocument) => {
    setEditingDoc(doc);
    setFormData({
      key: doc.key,
      label: doc.label,
      description: doc.description,
      isRequired: doc.isRequired,
      isActive: doc.isActive,
      category: doc.category
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-60 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-44 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row} className="border-b border-slate-50 dark:border-slate-800 h-[64px]">
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                        <div className="h-3 w-5/6 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-2.5 w-2.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-white dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-opacity-90 min-h-[56px]">
          <h2 className="text-sm md:text-xl font-extrabold text-slate-800 dark:text-white uppercase tracking-tighter">
            Document Configurations
          </h2>
          <button
            onClick={() => { setEditingDoc(null); setFormData({ key: '', label: '', description: '', isRequired: true, isActive: true, category: 'driver' }); setIsModalOpen(true); setMessage(null); }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
          >
            <HiPlus className="text-lg" /> Add Document Type
          </button>
        </div>

        {message && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] animate-in slide-in-from-top-8 duration-500 transition-all">
            <div className={`px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 flex items-center gap-3 backdrop-blur-md ${message.type === 'success'
              ? 'bg-emerald-500/90 border-emerald-400 text-white'
              : 'bg-rose-500/90 border-rose-400 text-white'
              }`}>
              <div className="bg-white/20 p-1.5 rounded-full">
                {message.type === 'success' ? <HiCheck className="text-xl" /> : <HiX className="text-xl" />}
              </div>
              <span className="font-black uppercase tracking-widest text-[11px]">{message.text}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Document Label</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Unique Key</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Required</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {documents.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">No document types configured</td></tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-sm text-black dark:text-white uppercase tracking-tight">{doc.label}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-black text-black dark:text-white uppercase tracking-tighter">
                        {doc.key}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[300px]">
                      <p className="text-[12px] text-black dark:text-slate-300 line-clamp-2 font-bold leading-relaxed">{doc.description}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {doc.isRequired ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                            <HiCheck className="text-emerald-600 text-base" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                            <HiX className="text-slate-400 text-base" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${doc.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${doc.isActive ? 'text-black dark:text-white' : 'text-slate-500'}`}>
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(doc)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all border border-transparent hover:border-blue-100 cursor-pointer">
                          <HiPencil className="text-lg" />
                        </button>
                        <button onClick={() => initiateDelete(doc._id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-100 cursor-pointer">
                          <HiTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-lg border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-tighter text-xl">{editingDoc ? 'Edit' : 'Create'} Document Type</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1 text-center sm:text-left">Category</label>
                  <div className="relative group">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm appearance-none cursor-pointer text-slate-700 dark:text-slate-200 shadow-sm"
                    >
                      <option value="driver">🚘 Driver Management</option>
                      <option value="vehicle">🚕 Vehicle Fleet</option>
                      <option value="employee">👥 Staff & Employees</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Label</label>
                    <input
                      type="text"
                      required
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="e.g. Aadhar Card"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Unique Key</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingDoc}
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g. aadhar_card"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide clear instructions for users..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 h-20 resize-none shadow-sm leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 py-1 px-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-5 rounded-lg shadow-inner transition-all duration-300 ${formData.isRequired ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-lg shadow-md transition-all duration-300 ${formData.isRequired ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Required</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-11 h-5 rounded-lg shadow-inner transition-all duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-lg shadow-md transition-all duration-300 ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest text-[10px] shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 px-6 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-lg font-black transition-all uppercase tracking-widest text-[10px] shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)] dark:shadow-none disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95"
                >
                  {submitting ? 'Applying Changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Confirm Delete</h3>
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium mb-8 whitespace-nowrap">
                Are you sure you want to delete this configuration?
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-10 py-3 rounded-full border border-slate-200 dark:border-slate-700 text-emerald-500 font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-10 py-3 bg-[#f24434] hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all hover:scale-105 hover:shadow-rose-400/50 active:scale-95 uppercase tracking-widest text-[11px] cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
