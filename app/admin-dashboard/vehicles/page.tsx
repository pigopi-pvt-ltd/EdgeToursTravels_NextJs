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
    status: "active",
    aadharFront: "",
    aadharBack: "",
    panImage: "",
    rcImage: "",
    insuranceImage: "",
    pollutionImage: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
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
        const data = await res.json();
        showToast(data.error || "Update failed", "error");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8 p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-md"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0A1128] dark:via-[#0A1128] dark:to-[#0A1128] -mt-8 -mx-8">
      <div className="p-6 lg:p-8 space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800"
                : "bg-rose-50 dark:bg-rose-900/20 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <HiCheck className="w-5 h-5" />
            ) : (
              <HiX className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Cab Details + Vendor
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage vendors, cab information, and documents
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            <HiPlus className="text-lg" /> Add Vendor / Cab
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search by vendor name, mobile, cab number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Cab Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle._id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {vehicle.vendor?.vendorName || "-"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {vehicle.vendor?.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {vehicle.vendor?.mobile || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                      {vehicle.cabNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {vehicle.modelName} ({vehicle.yearOfMaking})
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              vehicle._id,
                              vehicle.vendor?.vendorName || "",
                            )
                          }
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
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
                    <div>
                      <label className="block text-sm font-medium">
                        Vendor Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vendor?.vendorName || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              vendorName: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.vendor?.mobile || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              mobile: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Gender *
                      </label>
                      <select
                        required
                        value={formData.vendor?.gender || "male"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              gender: e.target.value as
                                | "male"
                                | "female"
                                | "other",
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vendor?.address || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              address: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Aadhar Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vendor?.aadhar || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              aadhar: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.vendor?.dob?.split("T")[0] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              dob: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vendor?.pan || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              pan: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.vendor?.email || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendor: {
                              ...(prev.vendor ?? defaultVendorValues),
                              email: e.target.value,
                            },
                          }))
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Cab Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Cab Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium">
                        Cab Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cabNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cabNumber: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        RAC No.
                      </label>
                      <input
                        type="text"
                        value={formData.tacNo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, tacNo: e.target.value })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Licence Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.licenseNo || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            licenseNo: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Pollution No.
                      </label>
                      <input
                        type="text"
                        value={formData.pollutionNo || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pollutionNo: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        GST No.
                      </label>
                      <input
                        type="text"
                        value={formData.gstNo || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, gstNo: e.target.value })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Insurance No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.insuranceNo || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            insuranceNo: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.modelName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            modelName: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Expiry Date (Insurance/PUC) *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.expiryDate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryDate: e.target.value,
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Year of Making *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.yearOfMaking || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearOfMaking: parseInt(e.target.value),
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Status *
                      </label>
                      <select
                        required
                        value={formData.status || "active"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as
                              | "active"
                              | "inactive"
                              | "maintenance",
                          })
                        }
                        className="mt-1 w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
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
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        Aadhar Card (Front)
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Upload clear photo
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, aadharFront: url })
                        }
                        existingUrl={formData.aadharFront}
                      />
                    </div>
                    {/* Aadhar Back */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        Aadhar Card (Back)
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Upload clear photo
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, aadharBack: url })
                        }
                        existingUrl={formData.aadharBack}
                      />
                    </div>
                    {/* PAN Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        PAN Card
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Upload PAN image
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, panImage: url })
                        }
                        existingUrl={formData.panImage}
                      />
                    </div>
                    {/* RC Document */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        RC Document
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Registration Certificate
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, rcImage: url })
                        }
                        existingUrl={formData.rcImage}
                      />
                    </div>
                    {/* Insurance Document */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        Insurance Certificate
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Valid insurance document
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, insuranceImage: url })
                        }
                        existingUrl={formData.insuranceImage}
                      />
                    </div>
                    {/* Pollution Certificate */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center group hover:border-orange-200 transition-colors">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform mx-auto">
                        <HiOutlineCloudUpload className="text-3xl text-slate-400 group-hover:text-orange-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        Pollution Certificate
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        PUC document
                      </p>
                      <FileUpload
                        folder="vehicles"
                        label="Upload"
                        buttonClassName="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                        onUpload={(url) =>
                          setFormData({ ...formData, pollutionImage: url })
                        }
                        existingUrl={formData.pollutionImage}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all"
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

