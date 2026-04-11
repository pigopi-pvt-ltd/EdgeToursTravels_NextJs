'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { HiPencil, HiTrash, HiPlus, HiSearch, HiX, HiCheck } from 'react-icons/hi';

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role?: string;
  driverDetails?: {
    fullName?: string;
    dateOfBirth?: string;
    drivingLicenseNumber?: string;
    dlExpiryDate?: string;
    vehicleRegNumber?: string;
    vehicleType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    kycStatus?: string;
  };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDrivers = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.employees) {
        const driverList = data.employees.filter((emp: any) => 
          emp.role === 'driver' || (emp.driverDetails && Object.keys(emp.driverDetails).length > 0)
        );
        setDrivers(driverList);
      } else {
        showToast(data.error || 'Failed to fetch drivers', 'error');
      }
    } catch (error) {
      showToast('Error fetching drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const payload = {
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      name: formData.name,
      role: 'driver',
      driverDetails: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        dlExpiryDate: formData.dlExpiryDate,
        vehicleRegNumber: formData.vehicleRegNumber,
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
    };
    try {
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Driver created! Temporary password: ${data.temporaryPassword}`, 'success');
        fetchDrivers();
        closeModal();
      } else {
        showToast(data.error || 'Creation failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const payload = {
      userId: editingDriver?._id,
      driverDetails: {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        dlExpiryDate: formData.dlExpiryDate,
        vehicleRegNumber: formData.vehicleRegNumber,
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      },
    };
    try {
      const res = await fetch('/api/admin/update-driver', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('Driver updated successfully', 'success');
        fetchDrivers();
        closeModal();
      } else {
        const data = await res.json();
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Something went wrong', 'error');
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (!confirm(`Delete driver "${name}"?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/delete-employee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: id }),
      });
      if (res.ok) {
        showToast('Driver deleted', 'success');
        fetchDrivers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      email: '',
      mobileNumber: '',
      name: '',
      fullName: '',
      dateOfBirth: '',
      drivingLicenseNumber: '',
      dlExpiryDate: '',
      vehicleRegNumber: '',
      vehicleType: 'car',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      mobileNumber: driver.mobileNumber,
      name: driver.name,
      fullName: driver.driverDetails?.fullName || '',
      dateOfBirth: driver.driverDetails?.dateOfBirth?.split('T')[0] || '',
      drivingLicenseNumber: driver.driverDetails?.drivingLicenseNumber || '',
      dlExpiryDate: driver.driverDetails?.dlExpiryDate?.split('T')[0] || '',
      vehicleRegNumber: driver.driverDetails?.vehicleRegNumber || '',
      vehicleType: driver.driverDetails?.vehicleType || 'car',
      vehicleMake: driver.driverDetails?.vehicleMake || '',
      vehicleModel: driver.driverDetails?.vehicleModel || '',
      vehicleYear: driver.driverDetails?.vehicleYear || '',
      accountHolderName: driver.driverDetails?.accountHolderName || '',
      bankName: driver.driverDetails?.bankName || '',
      accountNumber: driver.driverDetails?.accountNumber || '',
      ifscCode: driver.driverDetails?.ifscCode || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const filteredDrivers = drivers.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mobileNumber?.includes(searchTerm) ||
    d.driverDetails?.drivingLicenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? <HiCheck className="w-5 h-5" /> : <HiX className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Drivers Management</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <HiPlus className="w-5 h-5" /> Add Driver
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, mobile, or license number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Reg.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredDrivers.map((driver) => (
              <tr key={driver._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.mobileNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.driverDetails?.drivingLicenseNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.driverDetails?.vehicleRegNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    driver.driverDetails?.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    driver.driverDetails?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    driver.driverDetails?.kycStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {driver.driverDetails?.kycStatus || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEditModal(driver)} className="text-indigo-600 hover:text-indigo-900 transition">
                      <HiPencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteDriver(driver._id, driver.name)} className="text-red-600 hover:text-red-900 transition">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">No drivers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredDrivers.map((driver) => (
          <div key={driver._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{driver.name || '-'}</p>
                <p className="text-sm text-gray-600">{driver.email}</p>
                <p className="text-sm text-gray-600">{driver.mobileNumber}</p>
                <p className="text-xs text-gray-500 mt-1">License: {driver.driverDetails?.drivingLicenseNumber || '-'}</p>
                <p className="text-xs text-gray-500">Vehicle: {driver.driverDetails?.vehicleRegNumber || '-'}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    driver.driverDetails?.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    driver.driverDetails?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    driver.driverDetails?.kycStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {driver.driverDetails?.kycStatus || 'pending'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEditModal(driver)} className="text-indigo-600">
                  <HiPencil className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteDriver(driver._id, driver.name)} className="text-red-600">
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredDrivers.length === 0 && <div className="text-center py-12 text-gray-500">No drivers found</div>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Driver Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Full Name (as per DL) *</label><input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Date of Birth *</label><input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Driving License Number *</label><input type="text" required value={formData.drivingLicenseNumber} onChange={e => setFormData({...formData, drivingLicenseNumber: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">DL Expiry Date *</label><input type="date" required value={formData.dlExpiryDate} onChange={e => setFormData({...formData, dlExpiryDate: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Vehicle Registration Number *</label><input type="text" required value={formData.vehicleRegNumber} onChange={e => setFormData({...formData, vehicleRegNumber: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Vehicle Type *</label><select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2"><option value="auto">Auto</option><option value="bike">Bike</option><option value="car">Car</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700">Vehicle Make</label><input type="text" value={formData.vehicleMake} onChange={e => setFormData({...formData, vehicleMake: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Vehicle Model</label><input type="text" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Year of Manufacture</label><input type="number" value={formData.vehicleYear} onChange={e => setFormData({...formData, vehicleYear: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Bank Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Account Holder Name *</label><input type="text" required value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Bank Name *</label><input type="text" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Account Number *</label><input type="text" required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium text-gray-700">IFSC Code *</label><input type="text" required value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Login Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700">Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50" disabled={!!editingDriver} /></div>
                  <div><label className="block text-sm font-medium text-gray-700">Mobile Number *</label><input type="tel" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50" disabled={!!editingDriver} /></div>
                  <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700">Display Name *</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border rounded-lg px-3 py-2" /></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm">
                  {editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}