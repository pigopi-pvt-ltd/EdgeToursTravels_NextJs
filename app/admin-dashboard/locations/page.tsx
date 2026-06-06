'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiPlus, HiPencil, HiTrash, HiLocationMarker, HiCheckCircle, HiXCircle } from 'react-icons/hi';

interface Location {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLocations = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch locations');
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (location: Location | null = null) => {
    setCurrentLocation(location || { name: '', address: '', city: '', state: '', zipCode: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLocation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation?.name) return showToast('Name is required', 'error');

    setIsSubmitting(true);
    const token = getAuthToken();
    const method = currentLocation._id ? 'PUT' : 'POST';
    const url = currentLocation._id ? `/api/locations/${currentLocation._id}` : '/api/locations';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentLocation),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save location');
      }

      showToast(`Location ${currentLocation._id ? 'updated' : 'created'} successfully`, 'success');
      fetchLocations();
      handleCloseModal();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    const token = getAuthToken();
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete location');

      showToast('Location deleted successfully', 'success');
      fetchLocations();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Locations</h1>
          <p className="text-slate-500 dark:text-slate-400">Add and manage your business branches</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20"
        >
          <HiPlus /> Add Location
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc._id}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <HiLocationMarker size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenModal(loc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title="Edit"
                  >
                    <HiPencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(loc._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <HiTrash size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {loc.name}
                  {loc.isActive ? (
                    <HiCheckCircle className="text-emerald-500" size={16} title="Active" />
                  ) : (
                    <HiXCircle className="text-slate-400" size={16} title="Inactive" />
                  )}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {loc.address ? `${loc.address}, ` : ''}
                  {loc.city ? `${loc.city}, ` : ''}
                  {loc.state} {loc.zipCode}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${loc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {loc.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">ID: {loc._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No locations found. Click "Add Location" to create one.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {currentLocation?._id ? 'Update Location' : 'Add New Location'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <HiXCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location Name *</label>
                <input
                  type="text"
                  required
                  value={currentLocation?.name || ''}
                  onChange={(e) => setCurrentLocation({ ...currentLocation!, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder="e.g. Bangalore Branch"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Address</label>
                <textarea
                  value={currentLocation?.address || ''}
                  onChange={(e) => setCurrentLocation({ ...currentLocation!, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  rows={2}
                  placeholder="Street address..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    value={currentLocation?.city || ''}
                    onChange={(e) => setCurrentLocation({ ...currentLocation!, city: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">State</label>
                  <input
                    type="text"
                    value={currentLocation?.state || ''}
                    onChange={(e) => setCurrentLocation({ ...currentLocation!, state: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Zip Code</label>
                  <input
                    type="text"
                    value={currentLocation?.zipCode || ''}
                    onChange={(e) => setCurrentLocation({ ...currentLocation!, zipCode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={currentLocation?.isActive}
                    onChange={(e) => setCurrentLocation({ ...currentLocation!, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active Status
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : currentLocation?._id ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiCheckCircle className="w-5 h-5" /> : <HiXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
