"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import FileUpload from "@/components/FileUpload";
import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiArrowPath,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineUserCircle,
  HiXMark
} from "react-icons/hi2";
import { HiOutlineCloudUpload } from "react-icons/hi";
import CustomTable from "@/components/CustomTable";
import { GridColDef } from "@mui/x-data-grid";
import apiClient from "@/lib/apiClient";

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
  const [statusFilter, setStatusFilter] = useState("all");
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
    status: "active",
    aadharFront: "",
    aadharBack: "",
    panImage: "",
    rcImage: "",
    insuranceImage: "",
    pollutionImage: "",
    kycDocuments: {}
  });
  const [masterDocs, setMasterDocs] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAllData();
    fetchMasterDocs();
  }, []);

  const fetchMasterDocs = async () => {
    try {
      const data = await apiClient('/api/admin/master-documents?category=vehicle', { method: 'GET' });
      if (Array.isArray(data)) setMasterDocs(data.filter(d => d.isActive));
    } catch (err) {
      console.error('Error fetching master docs:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const data = await apiClient("/api/admin/vehicles", { method: 'GET' });
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showToast("Error fetching vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiClient("/api/admin/vehicles", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      showToast(data.message || "Vehicle created successfully", "success");
      fetchAllData();
      closeModal();
    } catch (err: any) {
      showToast(err.message || "Creation failed", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiClient(`/api/admin/vehicles/${editingVehicle?._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      showToast(data.message || "Vehicle updated successfully", "success");
      fetchAllData();
      closeModal();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await apiClient(`/api/admin/vehicles/${id}`, { method: "DELETE" });
      showToast("Deleted successfully", "success");
      fetchAllData();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
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
      status: "active",
      aadharFront: "",
      aadharBack: "",
      panImage: "",
      rcImage: "",
      insuranceImage: "",
      pollutionImage: "",
      kycDocuments: {}
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
    (v) => {
      const matchesStatus = statusFilter === 'all' ? true : v.status === statusFilter;
      const matchesSearch =
        v.vendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vendor?.mobile?.includes(searchTerm) ||
        v.cabNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const vehicleColumns: GridColDef[] = [
    {
      field: 'vendorName',
      headerName: 'VENDOR NAME',
      width: 180,
      valueGetter: (value, row) => row.vendor?.vendorName,
      renderCell: (params: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-[10px] ring-1 ring-slate-100 dark:ring-slate-600">
            {getInitials(params.value || 'V')}
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{params.value || '-'}</span>
        </div>
      )
    },
    {
      field: 'mobile',
      headerName: 'CONTACT NO',
      width: 130,
      valueGetter: (value, row) => row.vendor?.mobile,
      renderCell: (params: any) => <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{params.value || '-'}</span>
    },
    {
      field: 'email',
      headerName: 'EMAIL ADDRESS',
      width: 180,
      valueGetter: (value, row) => row.vendor?.email,
      renderCell: (params: any) => <span className="text-xs font-medium text-slate-500 lowercase">{params.value || '-'}</span>
    },
    {
      field: 'cabNumber',
      headerName: 'CAB NUMBER',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => <span className="text-sm font-black uppercase tracking-tighter text-indigo-600 dark:text-indigo-400">{params.value}</span>
    },
    {
      field: 'modelName',
      headerName: 'MODEL',
      width: 150,
      renderCell: (params: any) => (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">{params.value}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">YEAR: {params.row.yearOfMaking}</span>
        </div>
      )
    },
    {
      field: 'tacNo',
      headerName: 'TAC NO',
      width: 110,
      renderCell: (params: any) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{params.value || '-'}</span>
    },
    {
      field: 'gstNo',
      headerName: 'GST NO',
      width: 140,
      renderCell: (params: any) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{params.value || '-'}</span>
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => {
        const status = params.value;
        const colorClass = status === 'active' ? 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]' :
          status === 'inactive' ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]' :
            'bg-[#FFFCF0] text-[#EAB308] border-[#FEF08A]';
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold border inline-block min-w-[90px] text-center uppercase tracking-widest ${colorClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => openEditModal(params.row)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
            <HiPencil className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(params.row._id, params.row.cabNumber)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all">
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        <div className="sticky top-0 h-[56px] z-40 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300 flex flex-col">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2 md:py-1.5 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-black text-emerald-600 uppercase tracking-tighter truncate flex items-center gap-1.5">
              Vehicles & Vendors <span className="text-black dark:text-white font-normal font-bold pl-1 pr-1 hidden sm:inline">({filteredVehicles.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchAllData}
              className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-lg" />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold text-[10px] md:text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <HiPlus className="text-lg" />
              <span>Add Vehicle / Vendor</span>
            </button>
          </div>
        </div>

        {/* Main Content using CustomTable */}
        <CustomTable
          rows={filteredVehicles}
          columns={vehicleColumns}
          getRowId={(row) => row._id}
          height="calc(100vh - 110px)"
          title="Vehicles List"
          rowCount={filteredVehicles.length}
          onSearch={setSearchTerm}
          extraToolbarContent={
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-700 rounded text-[11px] dark:text-white font-bold outline-none focus:border-indigo-500"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
              <option value="maintenance">MAINTENANCE</option>
            </select>
          }
        />

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10 overflow-y-auto subtle-scrollbar" onClick={closeModal}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl my-8" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  {editingVehicle ? "Edit Vendor & Cab" : "Add New Vendor & Cab"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <HiXMark className="text-2xl" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">Email Address</label>
                      <input type="email" value={formData.vendor?.email || ''} onChange={e => setFormData(prev => ({ ...prev, vendor: { ...(prev.vendor ?? defaultVendorValues), email: e.target.value } }))} className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* Cab Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Cab Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
