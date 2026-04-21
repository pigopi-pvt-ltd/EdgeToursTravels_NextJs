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

  useEffect(() => {
    fetchCustomers();
  }, []);

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
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
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
      <div className="bg-white dark:bg-slate-800 min-h-screen transition-colors duration-300">
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
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-50 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <HiPlus className="text-lg" /> Add Customer
          </button>
        </div>

        {/* Main Content */}
        <div>
          {/* Search Area */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="relative max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-700 outline-none text-sm dark:text-white"
              />
            </div>
          </div>

          {/* Stats Bar (Optional, but kept for context if needed, though removed for closer driver page match) */}
          <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <HiStar className="text-lg" />
              REGULAR CLIENTS: {customers.filter((c) => c.isRegular).length}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Mobile Number</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Email Address</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 uppercase tracking-widest">Pickup Time</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtered.map((c, idx) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700">
                    <td className="px-6 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs ring-1 ring-slate-100 dark:ring-slate-600">
                          {getInitials(c.fullName)}
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{c.fullName || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center uppercase tracking-tighter">
                      {c.mobileNumber || '-'}
                    </td>
                    <td className="px-6 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-center">
                      {c.email || '-'}
                    </td>
                    <td className="px-6 py-1.5 border-r border-slate-200 dark:border-slate-700 text-center">
                      <span className={`
                        px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border inline-block min-w-[90px]
                        ${c.isRegular ? 'bg-[#F0FDF4] dark:bg-green-900/20 text-[#22C55E] border-[#DCFCE7] dark:border-green-900/30' : 'bg-[#FFFCF0] dark:bg-yellow-900/20 text-[#EAB308] border-[#FEF08A] dark:border-yellow-900/30'}
                      `}>
                        {c.isRegular ? 'REGULAR' : 'ONE-TIME'}
                      </span>
                    </td>
                    <td className="px-6 py-1.5 text-sm text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 text-center font-bold uppercase tracking-tighter">
                      {c.pickupTime
                        ? `${c.pickupTime.hour.toString().padStart(2, "0")}:${c.pickupTime.minute.toString().padStart(2, "0")}`
                        : "--:--"}
                    </td>
                    <td className="px-6 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200" title="Edit Customer">
                          <HiPencil className="text-xl" />
                        </button>
                        <button
                          onClick={() => confirmDelete(c)}
                          disabled={deletingId === c._id}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 disabled:opacity-50"
                          title="Delete Customer"
                        >
                          {deletingId === c._id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <HiTrash className="text-xl" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-slate-300 dark:text-slate-700 text-5xl mb-3">👥</div>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">No customers found</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Total customers: {customers.length}</span>
            <span>Showing {filtered.length} of {customers.length}</span>
          </div>
        </div>
      </div>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto subtle-scrollbar" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-4xl animate-in slide-in-from-top-10 duration-200" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
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
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Mobile Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, mobileNumber: e.target.value })
                      }
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 dark:text-white outline-none"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Gender <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      required
                      className="mt-1 w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none text-sm dark:text-white"
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
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Pickup Time (24h)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="HH"
                        className="mt-1 w-1/2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none dark:text-white"
                        value={formData.pickupHour}
                        onChange={(e) =>
                          setFormData({ ...formData, pickupHour: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="MM"
                        className="mt-1 w-1/2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-4 py-2.5 outline-none dark:text-white"
                        value={formData.pickupMinute}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pickupMinute: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Regular Status */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 opacity-0 select-none">
                      Regular Status
                    </label>
                    <div className="mt-1 flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 h-[46px]">
                      <input
                        type="checkbox"
                        id="regular"
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
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
                        className="text-xs font-bold text-indigo-900 dark:text-indigo-300 cursor-pointer leading-tight uppercase"
                      >
                        Regular Client
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Present Address */}
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Present Address
                    </label>
                    <textarea
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-200"
                      value={formData.presentAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, presentAddress: e.target.value })
                      }
                    />
                  </div>

                  {/* Drop-off Address */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                        Drop-off Address
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            dropOffAddress: formData.presentAddress,
                          })
                        }
                        className="text-[10px] text-indigo-600 font-black hover:underline uppercase tracking-tighter"
                      >
                        Same as Present
                      </button>
                    </div>
                    <textarea
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-200"
                      value={formData.dropOffAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dropOffAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {message && (
                <p className="text-center text-sm font-bold text-indigo-600 animate-pulse uppercase tracking-widest">
                  {message}
                </p>
              )}

              {/* Submit Action */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-50 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[140px]"
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
          <div className="bg-white dark:bg-slate-900 w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200" style={{ borderRadius: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
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
