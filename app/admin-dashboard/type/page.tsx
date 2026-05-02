"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import {
  HiSearch,
  HiPlus,
  HiOutlineEye,
  HiX,
  HiTrash,
  HiPencil,
  HiClock,
  HiStar,
} from "react-icons/hi";
import { HiArrowPath } from "react-icons/hi2";
import CustomTable from "@/components/CustomTable";
import { GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender?: string;
  presentAddress: string;
  dropOffAddress: string;
  isRegular: boolean;
  averageRating: number;
  pickupTime?: {
    hour: number;
    minute: number;
  };
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSameAsPresent, setIsSameAsPresent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    presentAddress: "",
    dropOffAddress: "",
    isRegular: false,
    pickupHour: "09",
    pickupMinute: "00",
    dateOfBirth: "",
  });

  // Column definitions for CustomTable
  const customerColumns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'CUSTOMER',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-3 h-full">
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-[11px] ring-1 ring-slate-100 dark:ring-slate-600 flex-shrink-0">
            {getInitials(params.value || 'C')}
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{params.value || '-'}</span>
        </div>
      ),
    },
    {
      field: 'mobileNumber',
      headerName: 'MOBILE NUMBER',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{params.value || '-'}</span>
      ),
    },
    {
      field: 'email',
      headerName: 'EMAIL ADDRESS',
      width: 220,
      renderCell: (params) => (
        <span className="text-sm font-bold text-slate-900 dark:text-white lowercase">{params.value || '-'}</span>
      ),
    },
    {
      field: 'isRegular',
      headerName: 'TYPE',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const isRegular = params.value;
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px] text-center
            ${isRegular ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' : 'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30'}`}>
            {isRegular ? 'REGULAR' : 'ONE-TIME'}
          </span>
        );
      },
    },
    {
      field: 'pickupTime',
      headerName: 'PICKUP TIME',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const time = params.value;
        return (
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
            {time ? `${time.hour.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")}` : "--:--"}
          </span>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 h-full">
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <HiPencil className="text-lg" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => confirmDelete(params.row)}
            disabled={deletingId === params.row._id}
            className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            {deletingId === params.row._id ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <HiTrash className="text-lg" />
            )}
          </IconButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (isSameAsPresent) {
      setFormData((prev) => ({
        ...prev,
        dropOffAddress: prev.presentAddress,
      }));
    }
  }, [formData.presentAddress, isSameAsPresent]);

  const fetchCustomers = async () => {
    setLoading(true);
    const token = getAuthToken();
    try {
      const res = await fetch("/api/admin/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok) {
        setCustomers(result.data || []);
      } else {
        setError(result.error || "Failed to fetch customers");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const token = getAuthToken();

    const payload = {
      ...formData,
      pickupTime: {
        hour: parseInt(formData.pickupHour),
        minute: parseInt(formData.pickupMinute),
      },
    };

    console.log(editingCustomer);

    const url = editingCustomer
      ? `/api/admin/customer/${editingCustomer._id}`
      : "/api/admin/customer";
    const method = editingCustomer ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Customer ${editingCustomer ? "updated" : "created"} successfully!`,
        );
        resetForm();
        fetchCustomers();
        // setTimeout(() => {
        //   setIsModalOpen(false);
        //   setMessage("");
        // }, 2000);
        setIsModalOpen(false);
        setMessage("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Operation failed. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };
  const executeDelete = async () => {
    if (!customerToDelete) return;

    setDeletingId(customerToDelete._id);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/customer/${customerToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCustomers();
        setMessage("Customer profile removed");
        setTimeout(() => setMessage(""), 3000);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      setMessage("Delete failed");
    } finally {
      setDeletingId(null);
      setCustomerToDelete(null);
    }
  };

  // const handleDelete = async (id: string) => {
  //   if (!confirm("Delete this customer profile?")) return;
  //   setDeletingId(id);
  //   const token = getAuthToken();
  //   try {
  //     const res = await fetch(`/api/admin/customer/${id}`, {
  //       method: "DELETE",
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (res.ok) {
  //       fetchCustomers();
  //       setMessage("Customer deleted");
  //       setTimeout(() => setMessage(""), 3000);
  //     }
  //   } catch (err) {
  //     setMessage("Delete failed");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      mobileNumber: customer.mobileNumber,
      gender: customer.gender || "",
      presentAddress: customer.presentAddress,
      dropOffAddress: customer.dropOffAddress,
      isRegular: customer.isRegular,
      pickupHour: customer.pickupTime?.hour.toString().padStart(2, "0") || "09",
      pickupMinute:
        customer.pickupTime?.minute.toString().padStart(2, "0") || "00",
      dateOfBirth: "", // Typically not returned in list for privacy
    });
    setIsModalOpen(true);
    setIsSameAsPresent(
      customer.presentAddress === customer.dropOffAddress &&
      !!customer.presentAddress,
    );
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      gender: "",
      presentAddress: "",
      dropOffAddress: "",
      isRegular: false,
      pickupHour: "09",
      pickupMinute: "00",
      dateOfBirth: "",
    });
    setEditingCustomer(null);
    setIsSameAsPresent(false);
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm),
  );

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
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="px-6 py-3 border-r border-slate-200 dark:border-slate-700">
                        <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/50 rounded"></div>
                      </td>
                    ))}
                    <td className="px-6 py-3">
                      <div className="flex justify-center gap-2">
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
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-screen transition-colors duration-300">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 ${message.includes('successfully') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
            }`}>
            <span className="flex items-center gap-2">
              {message.includes('successfully') ? '✅' : '⚠️'} {message}
            </span>
            <button onClick={() => setMessage('')} className="text-current hover:opacity-70">
              <HiX className="text-lg" />
            </button>
          </div>
        )}

        {/* Header toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Customer Directory <span className="text-black dark:text-white font-normal hidden sm:inline">({filtered.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchCustomers}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <HiPlus className="text-lg" /> Add Customer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <CustomTable
            rows={filtered}
            columns={customerColumns}
            getRowId={(row) => row._id}
            height="calc(100vh - 110px)"
            rowCount={filtered.length}
            onSearch={setSearchTerm}
            extraToolbarContent={
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <HiStar className="text-lg" />
                  REGULAR CLIENTS: {customers.filter((c) => c.isRegular).length}
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 overflow-y-auto subtle-scrollbar" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[0.5rem] shadow-2xl w-full max-w-4xl animate-in slide-in-from-top-10 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20 rounded-t-[0.5rem]">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {editingCustomer
                  ? "Edit Customer Profile"
                  : "New Customer Registration"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <HiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Customer Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Mobile Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileNumber: e.target.value })
                      }
                      placeholder="+91 0000000000"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Gender <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      required
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white cursor-pointer appearance-none"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Pickup Time */}
                  <div>
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Pickup Time (24h)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="HH"
                        className="w-1/2 bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                        value={formData.pickupHour}
                        onChange={(e) =>
                          setFormData({ ...formData, pickupHour: e.target.value })
                        }
                        min="0"
                        max="23"
                      />
                      <input
                        type="number"
                        placeholder="MM"
                        className="w-1/2 bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                        value={formData.pickupMinute}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupMinute: e.target.value,
                          })
                        }
                        min="0"
                        max="59"
                      />
                    </div>
                  </div>

                  {/* Regular Status */}
                  <div className="flex flex-col">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2 opacity-0 select-none">
                      Regular Status
                    </label>
                    <div className="flex items-center gap-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30 h-[46px] transition-all hover:bg-indigo-50">
                      <input
                        type="checkbox"
                        id="regular"
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={formData.isRegular}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isRegular: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor="regular"
                        className="text-[11px] font-black text-indigo-900 dark:text-indigo-300 cursor-pointer leading-tight uppercase tracking-widest"
                      >
                        Regular Client
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Present Address */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest mb-2">
                      Present Address
                    </label>
                    <textarea
                      required
                      className="w-full bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white h-24 resize-none"
                      value={formData.presentAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, presentAddress: e.target.value })
                      }
                      placeholder="Enter full present address..."
                    />
                  </div>

                  {/* Drop-off Address */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[11px] font-black text-[#1e293b] dark:text-slate-300 uppercase tracking-widest">
                        Drop-off Address
                      </label>
                      <div className="flex items-center gap-2 cursor-pointer group transition-all">
                        <input
                          type="checkbox"
                          id="sameAsPresent"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={isSameAsPresent}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsSameAsPresent(checked);
                            if (!checked) {
                              setFormData((prev) => ({
                                ...prev,
                                dropOffAddress: "",
                              }));
                            }
                          }}
                        />
                        <label
                          htmlFor="sameAsPresent"
                          className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 cursor-pointer leading-tight uppercase tracking-widest select-none"
                        >
                          Same as Present
                        </label>
                      </div>
                    </div>
                    <textarea
                      required
                      readOnly={isSameAsPresent}
                      className={`w-full px-4 py-3 rounded-xl border dark:text-white outline-none h-24 resize-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm ${isSameAsPresent ? "opacity-60 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed border-dashed border-slate-300" : "bg-[#f8fafc] dark:bg-slate-800/50 border-[#e2e8f0] dark:border-slate-700"}`}
                      value={formData.dropOffAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dropOffAddress: e.target.value,
                        })
                      }
                      placeholder="Enter full drop-off address..."
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-center text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                    {message}
                  </p>
                </div>
              )}

              {/* Submit Action */}
              <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-8 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200 min-w-[160px] active:scale-95 cursor-pointer"
                >
                  {creating
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Profile"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto subtle-scrollbar" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg shadow-2xl p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                <HiTrash size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Delete Customer?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {customerToDelete?.fullName}
                  </span>
                  ? This action cannot be undone and all associated data will be
                  lost.
                </p>
              </div>

              <div className="flex w-full gap-3 pt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={!!deletingId}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none disabled:opacity-50"
                >
                  {deletingId ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
