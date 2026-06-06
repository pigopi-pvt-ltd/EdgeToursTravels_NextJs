"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import {
  HiSearch,
  HiPlus,
  HiOutlineEye,
  HiX,
  HiClipboardCopy,
  HiCheck,
  HiTrash,
  HiPencil,
  HiOutlineCloudUpload,
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import UserDetailsModal from "@/app/admin-dashboard/employees/UserDetailsModal";
import CustomTable from "@/components/CustomTable";

interface Driver {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  profilePhoto?: string;
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
    yearsOfExperience?: number;
    kycDocuments?: Record<string, string>;
    rejectionReason?: string;
    availabilityStatus?: "available" | "unavailable";
    gender?: string;
    presentAddress?: string;
    permanentAddress?: string;
    alternateMobile?: string;
    aadhar?: string;
    pan?: string;
    highestQualification?: string;
    locationId?: any;
  };
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kycFilter, setKycFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [masterDocs, setMasterDocs] = useState<any[]>([]);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<any>({
    fullName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    drivingLicenseNumber: "",
    dlExpiryDate: "",
    vehicleRegNumber: "",
    vehicleType: "car",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    gender: "",
    presentAddress: "",
    permanentAddress: "",
    alternateMobile: "",
    aadhar: "",
    pan: "",
    yearsOfExperience: "",
    highestQualification: "",
    profilePhoto: "",
    aadharFront: "",
    aadharBack: "",
    panImage: "",
    licenseImage: "",
    locationId: "",
  });

  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // KYC Review Modal state
  const [kycModalDriver, setKycModalDriver] = useState<Driver | null>(null);
  const [kycActionLoading, setKycActionLoading] = useState(false);
  const [kycRejectionReason, setKycRejectionReason] = useState("");

  useEffect(() => {
    fetchDrivers();
    fetchMasterDocs();
  }, []);

  const fetchMasterDocs = async () => {
    try {
      const res = await fetch("/api/admin/master-documents?category=driver", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setMasterDocs(data.filter((d) => d.isActive));
    } catch (err) {
      console.error("Error fetching master docs:", err);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    const token = getAuthToken();
    const branchStr =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch")
        : null;
    const branch = branchStr ? JSON.parse(branchStr) : null;

    try {
      const res = await fetch("/api/admin/drivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        let driverArray = Array.isArray(data) ? data : data.drivers || [];

        if (branch) {
          driverArray = driverArray.filter((d: any) => {
            const drvBranchId =
              d.driverDetails?.locationId?._id || d.driverDetails?.locationId;
            // Drivers might not have branches yet, so show all unassigned or matching
            return !drvBranchId || drvBranchId === branch.id;
          });
        }

        setDrivers(driverArray);
      } else {
        setMessage(data.error || "Failed to fetch drivers");
      }
    } catch (error) {
      setMessage("Error fetching drivers");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const token = getAuthToken();
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleFileUpload = async (field: string, file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, "drivers");
      setFormData((prev: any) => ({
        ...prev,
        [field]: url,
        kycDocuments: {
          ...(prev.kycDocuments || {}),
          [field]: url,
        },
      }));
      setMessage(
        `${field.replace(/([A-Z])/g, " $1").toLowerCase()} uploaded successfully`,
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(`Failed to upload ${field}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setTempPassword(null);
    const token = getAuthToken();

    const payload = {
      driverId: editingDriver?._id,
      email: formData.email,
      mobileNumber: formData.mobile,
      name: formData.fullName,
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      drivingLicenseNumber: formData.drivingLicenseNumber,
      dlExpiryDate: formData.dlExpiryDate,
      vehicleRegNumber: formData.vehicleRegNumber,
      vehicleType: formData.vehicleType,
      vehicleMake: formData.vehicleMake,
      vehicleModel: formData.vehicleModel,
      vehicleYear: formData.vehicleYear
        ? parseInt(formData.vehicleYear)
        : undefined,
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      gender: formData.gender,
      presentAddress: formData.presentAddress,
      permanentAddress: formData.permanentAddress,
      alternateMobile: formData.alternateMobile,
      aadhar: formData.aadhar,
      pan: formData.pan,
      yearsOfExperience: formData.yearsOfExperience,
      highestQualification: formData.highestQualification,
      profilePhoto: formData.profilePhoto,
      locationId: formData.locationId,
      kycDocuments: {
        ...(editingDriver?.driverDetails?.kycDocuments || {}),
        ...(formData.kycDocuments || {}),
        profilePhoto: formData.profilePhoto,
        aadharFront: formData.aadharFront,
        aadharBack: formData.aadharBack,
        panImage: formData.panImage,
        licenseImage: formData.licenseImage,
      },
    };

    const apiUrl = editingDriver
      ? "/api/admin/update-driver"
      : "/api/admin/drivers";
    const method = editingDriver ? "PUT" : "POST";

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTempPassword(data.temporaryPassword);
        setMessage(
          `Driver ${editingDriver ? "updated" : "created"} successfully!`,
        );
        fetchDrivers();
        if (!data.temporaryPassword) {
          setTimeout(() => {
            setIsModalOpen(false);
            resetForm();
          }, 2000);
        }
      } else {
        setMessage(data.error || "Operation failed");
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    setDeletingUserId(id);
    const token = getAuthToken();
    try {
      const res = await fetch("/api/admin/delete-driver", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId: id }),
      });
      if (res.ok) {
        setMessage("Driver deleted successfully");
        fetchDrivers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Delete failed");
      }
    } catch (err) {
      setMessage("Delete failed");
    } finally {
      setDeletingUserId(null);
    }
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    const details = driver.driverDetails || {};
    setFormData({
      fullName: driver.name || "",
      email: driver.email || "",
      mobile: driver.mobileNumber || "",
      dateOfBirth: details.dateOfBirth
        ? new Date(details.dateOfBirth).toISOString().split("T")[0]
        : "",
      drivingLicenseNumber: details.drivingLicenseNumber || "",
      dlExpiryDate: details.dlExpiryDate
        ? new Date(details.dlExpiryDate).toISOString().split("T")[0]
        : "",
      vehicleRegNumber: details.vehicleRegNumber || "",
      vehicleType: details.vehicleType || "car",
      vehicleMake: details.vehicleMake || "",
      vehicleModel: details.vehicleModel || "",
      vehicleYear: details.vehicleYear?.toString() || "",
      accountHolderName: details.accountHolderName || "",
      bankName: details.bankName || "",
      accountNumber: details.accountNumber || "",
      ifscCode: details.ifscCode || "",
      yearsOfExperience: details.yearsOfExperience?.toString() || "",
      gender: details.gender || "",
      presentAddress: details.presentAddress || "",
      permanentAddress: details.permanentAddress || "",
      alternateMobile: details.alternateMobile || "",
      aadhar: details.aadhar || "",
      pan: details.pan || "",
      highestQualification: details.highestQualification || "",
      profilePhoto:
        driver.profilePhoto || details.kycDocuments?.profilePhoto || "",
      aadharFront: details.kycDocuments?.aadharFront || "",
      aadharBack: details.kycDocuments?.aadharBack || "",
      panImage: details.kycDocuments?.panImage || "",
      licenseImage: details.kycDocuments?.licenseImage || "",
      locationId: details.locationId?._id || details.locationId || "",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    const branchStr =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch")
        : null;
    const branch = branchStr ? JSON.parse(branchStr) : null;

    setEditingDriver(null);
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      dateOfBirth: "",
      drivingLicenseNumber: "",
      dlExpiryDate: "",
      vehicleRegNumber: "",
      vehicleType: "car",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      gender: "",
      presentAddress: "",
      permanentAddress: "",
      alternateMobile: "",
      aadhar: "",
      pan: "",
      yearsOfExperience: "",
      highestQualification: "",
      profilePhoto: "",
      aadharFront: "",
      aadharBack: "",
      panImage: "",
      licenseImage: "",
      locationId: branch?.id || "",
    });
    setTempPassword(null);
    setMessage("");
  };

  const copyPasswordToClipboard = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleKycAction = async (status: "approved" | "rejected") => {
    if (!kycModalDriver) return;
    setKycActionLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch("/api/admin/update-kyc", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: kycModalDriver._id,
          kycStatus: status,
          rejectionReason:
            status === "rejected" ? kycRejectionReason : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`KYC ${status} successfully`);
        setKycModalDriver(null);
        fetchDrivers();
      } else {
        setMessage(data.error || "Action failed");
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setKycActionLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const renderKycDocuments = (driver: Driver) => {
    const docs = driver.driverDetails?.kycDocuments || {};
    const entries = Object.entries(docs);
    if (entries.length === 0)
      return <p className="text-slate-500 italic">No documents uploaded.</p>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {entries.map(([key, url]) => (
          <div
            key={key}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            {url ? (
              <img
                src={url as string}
                className="max-h-48 rounded-lg mx-auto"
                alt={key}
              />
            ) : (
              <p className="text-slate-400">Not uploaded</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mobileNumber?.includes(searchTerm);
    const matchesKyc =
      kycFilter === "all" ||
      (d.driverDetails?.kycStatus || "pending") === kycFilter;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (d.driverDetails?.availabilityStatus || "unavailable") ===
        availabilityFilter;
    return matchesSearch && matchesKyc && matchesAvailability;
  });

  const driverTableColumns = [
    {
      field: "name",
      headerName: "DRIVER",
      width: 220,
      renderCell: (params: any) => (
        <div className="flex items-center gap-3 h-full">
          {params.row.profilePhoto ? (
            <img
              src={params.row.profilePhoto}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
              alt=""
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-black text-[11px]">
              {getInitials(params.row.name)}
            </div>
          )}
          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {params.row.name || "-"}
          </div>
        </div>
      ),
    },
    { field: "mobileNumber", headerName: "CONTACT NO", width: 120 },
    {
      field: "availabilityStatus",
      headerName: "AVAILABILITY",
      width: 130,
      renderCell: (params: any) => {
        const isAvailable =
          (params.row.driverDetails?.availabilityStatus || "unavailable") ===
          "available";
        return (
          <div
            className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 180,
      renderCell: (params: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKycModalDriver(params.row)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <HiDocumentText size={20} />
          </button>
          <button
            onClick={() => setSelectedUserId(params.row._id)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <HiOutlineEye size={20} />
          </button>
          <button
            onClick={() => openEditModal(params.row)}
            className="p-2 text-slate-400 hover:text-blue-600 transition-all"
          >
            <HiPencil size={20} />
          </button>
          <button
            onClick={() => handleDeleteDriver(params.row._id)}
            className="p-2 text-slate-400 hover:text-red-600 transition-all"
          >
            <HiTrash size={20} />
          </button>
        </div>
      ),
    },
  ];

  const DocumentUploadCard = ({
    title,
    description,
    field,
    existingUrl,
  }: any) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center group hover:border-indigo-500 transition-all">
      <HiOutlineCloudUpload className="mx-auto text-4xl text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
      <h3 className="font-bold text-slate-800 dark:text-white text-sm">
        {title}
      </h3>
      <p className="text-[10px] text-slate-500 mb-4">{description}</p>
      {existingUrl && (
        <img
          src={existingUrl}
          className="max-h-24 mx-auto rounded-lg mb-4 border border-slate-100"
          alt=""
        />
      )}
      <input
        type="file"
        className="hidden"
        id={`up-${field}`}
        onChange={(e) =>
          e.target.files?.[0] && handleFileUpload(field, e.target.files[0])
        }
      />
      <button
        type="button"
        onClick={() => document.getElementById(`up-${field}`)?.click()}
        className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
      >
        {uploading ? "Processing..." : "Upload"}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full md:w-96">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <HiPlus /> Add Driver
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CustomTable
          rows={filteredDrivers}
          columns={driverTableColumns}
          getRowId={(row) => row._id}
          loading={loading}
          height={600}
        />
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-10"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 subtle-scrollbar"
            style={{ borderRadius: "0.5rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <HiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
              {/* Section 1: Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.fullName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Gender <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      required
                      value={formData.gender || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Mobile Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.mobile || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Date of Birth <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Years of Experience{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={formData.yearsOfExperience || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Identity & Documents Metrics */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Identity Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Driving License Number{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="DL-0000000000000"
                      value={formData.drivingLicenseNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          drivingLicenseNumber: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      DL Expiry Date{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dlExpiryDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dlExpiryDate: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Aadhar Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12-digit Aadhar number"
                      value={formData.aadhar || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, aadhar: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      placeholder="10-digit PAN number"
                      value={formData.pan || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, pan: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Address Fields */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Present Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter present address"
                      value={formData.presentAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          presentAddress: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Permanent Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter permanent address"
                      value={formData.permanentAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permanentAddress: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Vehicle Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Vehicle Registration Number{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MH01AB1234"
                      value={formData.vehicleRegNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleRegNumber: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Vehicle Type <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      required
                      value={formData.vehicleType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleType: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      <option value="auto">Auto</option>
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Vehicle Make
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Toyota, Honda"
                      value={formData.vehicleMake || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleMake: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Camry, City"
                      value={formData.vehicleModel || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleModel: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Vehicle Year
                    </label>
                    <input
                      type="number"
                      placeholder="YYYY"
                      value={formData.vehicleYear || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleYear: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Bank Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Bank Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Account Holder Name{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="As per bank records"
                      value={formData.accountHolderName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountHolderName: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Bank Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter bank name"
                      value={formData.bankName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Account Number{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter account number"
                      value={formData.accountNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      IFSC Code <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter 11-digit IFSC"
                      value={formData.ifscCode || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ifscCode: e.target.value })
                      }
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Document Uploads cards */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Document Uploads
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DocumentUploadCard
                    title="Profile Photo"
                    description="Clear face photo"
                    field="profilePhoto"
                    existingUrl={formData.profilePhoto}
                  />
                  <DocumentUploadCard
                    title="Aadhar Card (Front)"
                    description="Front side with photo"
                    field="aadharFront"
                    existingUrl={formData.aadharFront}
                  />
                  <DocumentUploadCard
                    title="Aadhar Card (Back)"
                    description="Back side with address"
                    field="aadharBack"
                    existingUrl={formData.aadharBack}
                  />
                  <DocumentUploadCard
                    title="PAN Card"
                    description="Clear PAN card image"
                    field="panImage"
                    existingUrl={formData.panImage}
                  />
                  <DocumentUploadCard
                    title="Driving License"
                    description="Front side of license"
                    field="licenseImage"
                    existingUrl={formData.licenseImage}
                  />

                  {/* Render any additional master verification documents dynamically */}
                  {masterDocs &&
                    masterDocs
                      .filter(
                        (doc) =>
                          ![
                            "profilePhoto",
                            "aadharFront",
                            "aadharBack",
                            "panImage",
                            "licenseImage",
                          ].includes(doc.key),
                      )
                      .map((doc) => (
                        <DocumentUploadCard
                          key={doc.key}
                          title={doc.label}
                          description={doc.description}
                          field={doc.key}
                          existingUrl={
                            formData[doc.key] ||
                            formData.kycDocuments?.[doc.key]
                          }
                        />
                      ))}
                </div>
              </div>

              {/* Operational Server Messages Feedback Banner */}
              {message && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-center justify-between gap-4 ${message.includes("successfully") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800"}`}
                >
                  <span className="flex items-center gap-2">
                    {message.includes("successfully") ? "🎉" : "⚠️"} {message}
                  </span>
                  {tempPassword && (
                    <button
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow text-slate-700 dark:text-slate-200"
                    >
                      {copySuccess ? (
                        <HiCheck className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <HiClipboardCopy />
                      )}
                      <span>{copySuccess ? "Copied!" : "Copy Password"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Modal Action Footer Controls */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (typeof uploading !== "undefined" && uploading)
                  }
                  className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[160px]"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : editingDriver ? (
                    "Update Driver"
                  ) : (
                    "Create Driver"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={fetchDrivers}
        />
      )}

      {kycModalDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl p-8 overflow-y-auto max-h-[85vh] shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-xl font-black uppercase">
                KYC Review: {kycModalDriver.name}
              </h2>
              <button onClick={() => setKycModalDriver(null)}>
                <HiX size={24} />
              </button>
            </div>
            {renderKycDocuments(kycModalDriver)}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => handleKycAction("rejected")}
                className="bg-rose-100 text-rose-600 px-8 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-rose-600 hover:text-white transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => handleKycAction("approved")}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black uppercase text-xs shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
