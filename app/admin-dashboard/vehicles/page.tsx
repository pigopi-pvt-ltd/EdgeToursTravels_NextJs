"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import FileUpload from "@/components/FileUpload";
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiSearch,
  HiX,
  HiCheck,
} from "react-icons/hi";
import { HiOutlineCloudUpload } from "react-icons/hi"; // for document cards

interface VehicleVendor {
  vendorName: string;
  mobile: string;
  gender: "male" | "female" | "other";
  address: string;
  aadhar: string;
  dob: string;
  pan: string;
  email: string;
  vendorProfilePhoto?: string;
  vendorAadharFront?: string;
  vendorAadharBack?: string;
  vendorPanImage?: string;
}

interface Vehicle {
  _id: string;
  cabNumber: string;
  tacNo: string;
  licenseNo: string;
  pollutionNo: string;
  gstNo: string;
  insuranceNo: string;
  modelName: string;
  expiryDate: string;
  yearOfMaking: number;
  status: "active" | "inactive" | "maintenance";
  vendor: VehicleVendor;
  // Document URLs
  aadharFront?: string;
  aadharBack?: string;
  panImage?: string;
  rcImage?: string;
  insuranceImage?: string;
  pollutionImage?: string;
  kycDocuments?: Record<string, string>;
}

type VehicleFormData = Partial<Omit<Vehicle, "vendor">> & {
  vendor?: Partial<VehicleVendor>;
};

const defaultVendorValues: VehicleVendor = {
  vendorName: "",
  mobile: "",
  gender: "male",
  address: "",
  aadhar: "",
  dob: "",
  pan: "",
  email: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    vendor: { ...defaultVendorValues },
    cabNumber: "",
    tacNo: "",
    licenseNo: "",
    pollutionNo: "",
    gstNo: "",
    insuranceNo: "",
    modelName: "",
    expiryDate: "",
    yearOfMaking: new Date().getFullYear(),
    status: 'active',
    aadharFront: '',
    aadharBack: '',
    panImage: '',
    rcImage: '',
    insuranceImage: '',
    pollutionImage: '',
    kycDocuments: {}
  });
  const [masterDocs, setMasterDocs] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchMasterDocs();
  }, []);

  const fetchMasterDocs = async () => {
    try {
      const res = await fetch('/api/admin/master-documents?category=vehicle', {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMasterDocs(data.filter(d => d.isActive));
    } catch (err) {
      console.error('Error fetching master docs:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchVehicles = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch("/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(Array.isArray(data) ? data : []);
      } else {
        showToast(data.error || "Failed to fetch vehicles", "error");
      }
    } catch (error) {
      showToast("Error fetching vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          data.message || "Vehicle/vendor created successfully",
          "success",
        );
        fetchVehicles();
        closeModal();
      } else {
        const errorMessage =
          data.error ||
          (data.missing
            ? `Missing: ${Object.values(data.missing).flat().join(", ")}`
            : "Creation failed");
        showToast(errorMessage, "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/vehicles/${editingVehicle?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          data.message || "Vehicle/vendor updated successfully",
          "success",
        );
        fetchVehicles();
        closeModal();
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Deleted successfully", "success");
        fetchVehicles();
      } else {
        const data = await res.json();
        showToast(data.error || "Delete failed", "error");
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      vendor: {
        vendorName: "",
        mobile: "",
        gender: "male",
        address: "",
        aadhar: "",
        dob: "",
        pan: "",
        email: "",
      },
      cabNumber: "",
      tacNo: "",
      licenseNo: "",
      pollutionNo: "",
      gstNo: "",
      insuranceNo: "",
      modelName: "",
      expiryDate: "",
      yearOfMaking: new Date().getFullYear(),
      status: "active",
      aadharFront: "",
      aadharBack: "",
      panImage: "",
      rcImage: "",
      insuranceImage: "",
      pollutionImage: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendor?.mobile?.includes(searchTerm) ||
      v.cabNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="-mt-8 -mx-8 animate-pulse bg-white dark:bg-slate-800 min-h-screen">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-4 px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded ml-4"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded mr-4"></div>
        </div>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="h-10 w-full max-w-md bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <th key={i} className="px-6 py-4 border-r border-slate-200 dark:border-slate-700">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <tr key={row} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                      <div>
                        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded mb-1"></div>
                        <div className="h-2 w-32 bg-slate-50 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map((col) => (
                    <td key={col} className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="h-3 w-full bg-slate-50 dark:bg-slate-800 rounded"></div>
                    </td>
                  ))}
                  <td className="px-6 py-3">
                    <div className="flex justify-center gap-2">
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-8 -mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 min-h-screen transition-colors duration-300">
        {/* Header toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-3.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-[14px] md:text-xl font-extrabold md:font-bold text-slate-800 dark:text-white uppercase tracking-tighter md:tracking-tight whitespace-nowrap">
              VEHICLES & VENDORS <span className="text-slate-400 dark:text-slate-500 font-normal">({filteredVehicles.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVehicles}
              className="hidden md:inline-flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[11px] md:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Add Vendor / Cab
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Search Area */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
              <input
                type="text"
                placeholder="Search vendor, mobile or cab number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Vendor</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Contact No</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Cab Number</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Model</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center uppercase font-black italic text-slate-400">No vehicles found</td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700">
                      <td className="px-6 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                            {getInitials(vehicle.vendor?.vendorName || 'V')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{vehicle.vendor?.vendorName || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-tighter">
                        {vehicle.vendor?.mobile || '-'}
                      </td>
                      <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                        {vehicle.vendor?.email || '-'}
                      </td>
                      <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-widest font-mono">
                        {vehicle.cabNumber}
                      </td>
                      <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center">
                        <p className="uppercase tracking-tighter">{vehicle.modelName}</p>
                        <p className="text-[10px] text-slate-400">YOM: {vehicle.yearOfMaking}</p>
                      </td>
                      <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                        <span className={`
                        px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px]
                        ${vehicle.status === 'active' ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' :
                            'bg-[#FEF2F2] dark:bg-red-900/20 text-[#EF4444] border-[#FEE2E2] dark:border-red-900/30'}
                      `}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-1.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEditModal(vehicle)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all active:scale-95">
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(vehicle._id, vehicle.cabNumber)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-95">
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-xs text-slate-500 flex justify-between">
            <span>Total: {vehicles.length}</span>
            <span>Showing {filteredVehicles.length}</span>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto subtle-scrollbar" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingVehicle
                    ? "Edit Vendor & Cab"
                    : "Add New Vendor & Cab"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <HiX className="text-2xl" />
                </button>
              </div>

              <form
                onSubmit={editingVehicle ? handleUpdate : handleCreate}
                className="p-6 space-y-6"
              >
                {/* Vendor Information */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Vendor Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium">Vendor Name <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.vendor?.vendorName || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), vendorName: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Mobile <span className="text-red-500 ml-1">*</span></label><input type="tel" required value={formData.vendor?.mobile || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), mobile: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Gender <span className="text-red-500 ml-1">*</span></label><select required value={formData.vendor?.gender || 'male'} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), gender: e.target.value as 'male' | 'female' | 'other' } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                    <div><label className="block text-sm font-medium">Address <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.vendor?.address || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), address: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">AADHAR NUMBER <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.vendor?.aadhar || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), aadhar: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Date of Birth <span className="text-red-500 ml-1">*</span></label><input type="text" placeholder="DD-MM-YYYY" required value={formData.vendor?.dob || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), dob: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                    <div><label className="block text-sm font-medium">PAN Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.vendor?.pan || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), pan: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Email</label><input type="email" required value={formData.vendor?.email || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), email: e.target.value } }))} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                  </div>
                </div>

                {/* Cab Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Cab Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium">Cab Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.cabNumber || ''} onChange={e => setFormData({ ...formData, cabNumber: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">RAC No.</label><input type="text" value={formData.tacNo || ''} onChange={e => setFormData({ ...formData, tacNo: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Licence Number <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.licenseNo || ''} onChange={e => setFormData({ ...formData, licenseNo: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Pollution No.</label><input type="text" value={formData.pollutionNo || ''} onChange={e => setFormData({ ...formData, pollutionNo: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">GST No.</label><input type="text" value={formData.gstNo || ''} onChange={e => setFormData({ ...formData, gstNo: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Insurance No. <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.insuranceNo || ''} onChange={e => setFormData({ ...formData, insuranceNo: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Model Name <span className="text-red-500 ml-1">*</span></label><input type="text" required value={formData.modelName || ''} onChange={e => setFormData({ ...formData, modelName: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Expiry Date (Insurance/PUC) <span className="text-red-500 ml-1">*</span></label><input type="text" placeholder="DD-MM-YYYY" required value={formData.expiryDate || ''} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none uppercase" /></div>
                    <div><label className="block text-sm font-medium">Year of Making <span className="text-red-500 ml-1">*</span></label><input type="number" required value={formData.yearOfMaking || ''} onChange={e => setFormData({ ...formData, yearOfMaking: parseInt(e.target.value) })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none" /></div>
                    <div><label className="block text-sm font-medium">Status <span className="text-red-500 ml-1">*</span></label><select required value={formData.status || 'active'} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })} className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option></select></div>
                  </div>
                </div>

                {/* Document Uploads – Card style (like KYC form) */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Document Uploads
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhar Front */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Aadhar Card (Front)</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload clear photo</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, aadharFront: url })} existingUrl={formData.aadharFront} />
                    </div>
                    {/* Aadhar Back */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Aadhar Card (Back)</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload clear photo</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, aadharBack: url })} existingUrl={formData.aadharBack} />
                    </div>
                    {/* PAN Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">PAN Card</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload PAN image</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, panImage: url })} existingUrl={formData.panImage} />
                    </div>
                    {/* RC Document */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">RC Document</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Registration Certificate</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, rcImage: url })} existingUrl={formData.rcImage} />
                    </div>
                    {/* Insurance Document */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Insurance Certificate</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Valid insurance document</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, insuranceImage: url })} existingUrl={formData.insuranceImage} />
                    </div>
                    {/* Pollution Certificate */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Pollution Certificate</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">PUC document</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" onUpload={(url) => setFormData({ ...formData, pollutionImage: url })} existingUrl={formData.pollutionImage} />
                    </div>

                    {/* Dynamic Master Documents */}
                    {masterDocs.filter(doc => !['rcImage', 'insuranceImage', 'pollutionImage'].includes(doc.key)).map((doc) => (
                      <div key={doc.key} className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                          <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{doc.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{doc.description || 'Upload document'}</p>
                        <FileUpload
                          folder="vehicles"
                          label="Upload"
                          buttonClassName="bg-orange-600 hover:bg-orange-700 font-bold uppercase text-[10px]"
                          onUpload={(url) => setFormData(prev => ({
                            ...prev,
                            kycDocuments: { ...(prev.kycDocuments || {}), [doc.key]: url }
                          }))}
                          existingUrl={formData.kycDocuments?.[doc.key]}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingVehicle ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

