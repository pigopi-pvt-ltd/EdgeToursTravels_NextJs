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
  permanentAddress: string;
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
    permanentAddress: "",
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
      permanentAddress: customer.permanentAddress,
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
      permanentAddress: "",
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

  if (loading)
    return (
      <div className="p-10 animate-pulse text-center">Loading Customers...</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 -mt-8 -mx-8 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Customer Directory
            </h1>
            <p className="text-slate-500">
              Manage client profiles and service preferences
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all "
          >
            <HiPlus /> Add Customer
          </button>
        </div>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Stat Card */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 h-[72px]">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <HiStar size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Regular Clients
              </p>
              <p className="text-xl font-bold text-slate-800 dark:text-white leading-none mt-1">
                {customers.filter((c) => c.isRegular).length}
              </p>
            </div>
          </div>

          {/* Search Bar - md:col-span-2 ensures it takes the remaining space */}
          <div className="md:col-span-2 relative flex items-center h-[72px]">
            <HiSearch className="absolute left-4 text-slate-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full h-full pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 outline-none text-slate-800 dark:text-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Pickup Time</th>
                <th className="px-6 py-4 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {c.fullName}
                    </div>
                    <div className="text-xs text-slate-400 uppercase">
                      {c.gender || "Not Specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {c.mobileNumber}
                    </div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.isRegular ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-amber-200">
                        REGULAR
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
                        ONE-TIME
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <HiClock />
                      <span className="text-sm font-mono">
                        {c.pickupTime
                          ? `${c.pickupTime.hour.toString().padStart(2, "0")}:${c.pickupTime.minute.toString().padStart(2, "0")}`
                          : "--:--"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
                        disabled={deletingId === c._id}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30"
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingCustomer
                  ? "Edit Customer Profile"
                  : "New Customer Registration"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <HiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Mobile Number
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* Gender Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Gender
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Pickup Time (24h)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="HH"
                      className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.pickupHour}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupHour: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="MM"
                      className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
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

                {/* Regular Status - Perfectly Aligned */}
                <div className="flex flex-col">
                  {/* This ghost label ensures the box below starts at the exact same height as the inputs */}
                  <span className="text-sm font-bold opacity-0 invisible select-none">
                    Alignment
                  </span>

                  <div className="mt-2 flex items-center gap-3 p-[11px] bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 h-[50px]">
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
                      className="text-xs font-bold text-indigo-900 dark:text-indigo-300 cursor-pointer leading-tight"
                    >
                      Regular Client <br />
                      <span className="text-[10px] font-medium opacity-70">
                        Recurring Service
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              {/* Present Address */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Present Address
                </label>
                <textarea
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none h-20 resize-none"
                  value={formData.presentAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, presentAddress: e.target.value })
                  }
                />
              </div>

              {/* Permanent Address */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Permanent Address
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        permanentAddress: formData.presentAddress,
                      })
                    }
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    Same as Present Address
                  </button>
                </div>
                <textarea
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none h-20 resize-none"
                  value={formData.permanentAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permanentAddress: e.target.value,
                    })
                  }
                />
              </div>

              {message && (
                <p className="text-center text-sm font-bold text-indigo-600 animate-pulse">
                  {message}
                </p>
              )}

              {/* Submit Action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 cursor-pointer px-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none"
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
        <div className="fixed inset-0 z- flex items-center justify-center p-4 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsDeleteModalOpen(false)}
          />

          {/* Dialog Card */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
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
