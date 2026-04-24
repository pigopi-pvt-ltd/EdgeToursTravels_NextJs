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
  manufacturingNo?: string;
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
    manufacturingNo: "",
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
      manufacturingNo: "",
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
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Precise Header Skeleton (56px) */}
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        <div className="flex flex-col">
          {/* Skeleton Search Area (approx 72px) */}
          <div className="p-4 h-[72px] border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/20 dark:bg-slate-900/20 px-6 gap-4">
            <div className="h-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-100 dark:border-slate-800"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row} className="border-b border-slate-100 dark:border-slate-800 h-[72px]">
                    <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                          <div className="h-2 w-16 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                        </div>
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((col) => (
                      <td key={col} className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/50 rounded"></div>
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
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 min-h-screen transition-colors duration-300">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Vehicles & Vendors <span className="text-black dark:text-white font-normal hidden sm:inline">({filteredVehicles.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchVehicles}
              className="hidden md:inline-flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Add Vendor / Cab
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Search Area */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="relative w-full md:max-w-md">
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
          <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-700 custom-scrollbar shadow-inner">
            <table className="w-full border-collapse min-w-[1100px] md:min-w-full">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Vendor</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Contact No</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Cab Number</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Model</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
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
                      <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                            {getInitials(vehicle.vendor?.vendorName || 'V')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate">{vehicle.vendor?.vendorName || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-tighter">
                        {vehicle.vendor?.mobile || '-'}
                      </td>
                      <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                        {vehicle.vendor?.email || '-'}
                      </td>
                      <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-tighter">
                        {vehicle.cabNumber}
                      </td>
                      <td className="px-6 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <p className="uppercase tracking-tighter">{vehicle.modelName}</p>
                          {vehicle.manufacturingNo && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 rounded border border-emerald-100 dark:border-emerald-800">
                              {vehicle.manufacturingNo}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                        <span className={`
                        px-2 py-0.5 rounded text-sm font-bold uppercase tracking-widest border inline-block min-w-[95px]
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
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10" onClick={closeModal}>
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
                className="p-6 space-y-8"
              >
                {/* Vendor Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Vendor Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Vendor Name <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.vendor?.vendorName || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), vendorName: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Mobile <span className="text-red-500 ml-1">*</span></label>
                      <input type="tel" required value={formData.vendor?.mobile || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), mobile: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Gender <span className="text-red-500 ml-1">*</span></label>
                      <select required value={formData.vendor?.gender || 'male'} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), gender: e.target.value as 'male' | 'female' | 'other' } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Address <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.vendor?.address || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), address: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">AADHAR NUMBER <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.vendor?.aadhar || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), aadhar: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Date of Birth <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" placeholder="DD-MM-YYYY" required value={formData.vendor?.dob || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), dob: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">PAN Number <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.vendor?.pan || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), pan: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Email</label>
                      <input type="email" required value={formData.vendor?.email || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), email: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* Cab Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Cab Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Cab Number <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.cabNumber || ''} onChange={e => setFormData({ ...formData, cabNumber: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">RAC No.</label>
                      <input type="text" value={formData.tacNo || ''} onChange={e => setFormData({ ...formData, tacNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Licence Number <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.licenseNo || ''} onChange={e => setFormData({ ...formData, licenseNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Pollution No.</label>
                      <input type="text" value={formData.pollutionNo || ''} onChange={e => setFormData({ ...formData, pollutionNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">GST No.</label>
                      <input type="text" value={formData.gstNo || ''} onChange={e => setFormData({ ...formData, gstNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Insurance No. <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.insuranceNo || ''} onChange={e => setFormData({ ...formData, insuranceNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Model Name <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" required value={formData.modelName || ''} onChange={e => setFormData({ ...formData, modelName: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Manufacturing No.</label>
                      <input type="text" value={formData.manufacturingNo || ''} onChange={e => setFormData({ ...formData, manufacturingNo: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Expiry Date (Insurance/PUC) <span className="text-red-500 ml-1">*</span></label>
                      <input type="text" placeholder="DD-MM-YYYY" required value={formData.expiryDate || ''} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Year of Making <span className="text-red-500 ml-1">*</span></label>
                      <input type="number" required value={formData.yearOfMaking || ''} onChange={e => setFormData({ ...formData, yearOfMaking: parseInt(e.target.value) })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Status <span className="text-red-500 ml-1">*</span></label>
                      <select required value={formData.status || 'active'} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Document Uploads
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Aadhar Front */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">Aadhar Card (Front)</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Upload clear photo</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, aadharFront: url })} existingUrl={formData.aadharFront} />
                    </div>
                    {/* Aadhar Back */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">Aadhar Card (Back)</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Upload clear photo</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, aadharBack: url })} existingUrl={formData.aadharBack} />
                    </div>
                    {/* PAN Card */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">PAN Card</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Upload PAN image</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, panImage: url })} existingUrl={formData.panImage} />
                    </div>
                    {/* RC Document */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">RC Document</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Registration Certificate</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, rcImage: url })} existingUrl={formData.rcImage} />
                    </div>
                    {/* Insurance Document */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">Insurance Certificate</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">Valid insurance document</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, insuranceImage: url })} existingUrl={formData.insuranceImage} />
                    </div>
                    {/* Pollution Certificate */}
                    <div className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                        <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1.5 leading-tight">Pollution Certificate</h3>
                      <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">PUC document</p>
                      <FileUpload folder="vehicles" label="Upload" buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95" onUpload={(url) => setFormData({ ...formData, pollutionImage: url })} existingUrl={formData.pollutionImage} />
                    </div>

                    {/* Dynamic Master Documents */}
                    {masterDocs.filter(doc => !['rcImage', 'insuranceImage', 'pollutionImage'].includes(doc.key)).map((doc) => (
                      <div key={doc.key} className="bg-[#f8fafc] dark:bg-slate-800/50 border-2 border-dashed border-[#e2e8f0] dark:border-slate-700 rounded-3xl p-8 text-center group hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-black/20 mb-6 group-hover:scale-110 transition-transform mx-auto border border-slate-50 dark:border-slate-800">
                          <HiOutlineCloudUpload className="text-4xl text-[#94a3b8] group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e293b] dark:text-white mb-1">{doc.label}</h3>
                        <p className="text-sm text-[#64748b] dark:text-slate-400 mb-6 font-medium">{doc.description || 'Upload document'}</p>
                        <FileUpload
                          folder="vehicles"
                          label="Upload"
                          buttonClassName="px-5 py-3 bg-[#ff4d00] hover:bg-[#e64500] text-white text-xs rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-200 active:scale-95"
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

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 transition-all duration-200 min-w-[160px] cursor-pointer"
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

