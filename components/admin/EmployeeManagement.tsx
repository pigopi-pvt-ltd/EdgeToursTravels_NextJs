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
  HiChevronDown,
} from "react-icons/hi";
import UserDetailsModal from "@/app/admin-dashboard/employees/UserDetailsModal";
import CustomTable from "@/components/CustomTable";

interface User {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: "admin" | "employee" | "driver";
  driverDetails?: { kycStatus?: string };
  employeeDetails?: {
    fullName: string;
    mobile: string;
    gender: string;
    presentAddress: string;
    permanentAddress: string;
    alternateMobile?: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    yearsOfExperience: number;
    highestQualification: string;
    previousExperience?: string;
    locationId?: any;
    projectIds?: any[];
  };
  profileCompleted?: boolean;
}

export default function EmployeeManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    email: "",
    mobileNumber: "",
    name: "",
    fullName: "",
    gender: "",
    presentAddress: "",
    permanentAddress: "",
    alternateMobile: "",
    aadhar: "",
    dob: "",
    pan: "",
    yearsOfExperience: "",
    highestQualification: "",
    previousExperience: "",
    locationId: "",
    projectIds: [] as string[],
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchLocationsAndProjects();
  }, []);

  const fetchLocationsAndProjects = async () => {
    const token = getAuthToken();
    const branchStr =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch")
        : null;
    const branch = branchStr ? JSON.parse(branchStr) : null;
    setSelectedBranchId(branch?.id || null);

    try {
      const [locRes, projRes] = await Promise.all([
        fetch("/api/locations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (locRes.ok) setLocations(await locRes.json());
      if (projRes.ok) {
        let pData = await projRes.json();
        // Don't filter allProjects globally, but we might filter in the dropdown
        setAllProjects(pData);
      }
    } catch (err) {
      console.error("Failed to fetch locations or projects", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    const branchStr =
      typeof window !== "undefined"
        ? localStorage.getItem("selected_branch")
        : null;
    const branch = branchStr ? JSON.parse(branchStr) : null;

    try {
      const res = await fetch("/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        let usersArray = Array.isArray(data) ? data : data.employees || [];
        usersArray = usersArray.filter((u: any) => u.role === "employee");

        if (branch) {
          usersArray = usersArray.filter((u: any) => {
            const empBranchId =
              u.employeeDetails?.locationId?._id ||
              u.employeeDetails?.locationId;
            // Show if matches current branch OR if has no branch assigned yet
            return !empBranchId || empBranchId === branch.id;
          });
        }

        setUsers(usersArray);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    setTempPassword(null);
    const token = getAuthToken();

    const payload = {
      fullName: newEmployee.fullName || newEmployee.name,
      mobile: newEmployee.mobileNumber,
      email: newEmployee.email,
      gender: newEmployee.gender,
      presentAddress: newEmployee.presentAddress,
      permanentAddress: newEmployee.permanentAddress,
      alternateMobile: newEmployee.alternateMobile,
      aadhar: newEmployee.aadhar,
      dob: newEmployee.dob,
      pan: newEmployee.pan,
      yearsOfExperience: parseInt(newEmployee.yearsOfExperience) || 0,
      highestQualification: newEmployee.highestQualification,
      previousExperience: newEmployee.previousExperience,
      locationId: newEmployee.locationId,
      projectIds: newEmployee.projectIds,
    };

    const method = editingUser ? "PUT" : "POST";
    const url = editingUser
      ? `/api/admin/employees/${editingUser._id}`
      : "/api/admin/employees";

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
        setTempPassword(data.temporaryPassword);
        setMessage(
          `${editingUser ? "User updated" : "User created"} successfully!`,
        );
        fetchUsers();
        if (!data.temporaryPassword) {
          setTimeout(() => {
            setIsModalOpen(false);
            resetForm();
          }, 2000);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
    setNewEmployee({
      email: user.email,
      mobileNumber: user.mobileNumber,
      name: user.name,
      fullName: user.employeeDetails?.fullName || "",
      gender: user.employeeDetails?.gender || "",
      presentAddress: user.employeeDetails?.presentAddress || "",
      permanentAddress: user.employeeDetails?.permanentAddress || "",
      alternateMobile: user.employeeDetails?.alternateMobile || "",
      aadhar: user.employeeDetails?.aadhar || "",
      dob: user.employeeDetails?.dob
        ? new Date(user.employeeDetails.dob).toISOString().split("T")[0]
        : "",
      pan: user.employeeDetails?.pan || "",
      yearsOfExperience:
        user.employeeDetails?.yearsOfExperience?.toString() || "",
      highestQualification: user.employeeDetails?.highestQualification || "",
      previousExperience: user.employeeDetails?.previousExperience || "",
      locationId:
        user.employeeDetails?.locationId?._id ||
        user.employeeDetails?.locationId ||
        "",
      projectIds: (user.employeeDetails?.projectIds || []).map(
        (p: any) => p._id || p,
      ),
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingUserId(userId);
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/employees/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("User deleted successfully");
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
    } finally {
      setDeletingUserId(null);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      email: "",
      mobileNumber: "",
      name: "",
      fullName: "",
      gender: "",
      presentAddress: "",
      permanentAddress: "",
      alternateMobile: "",
      aadhar: "",
      dob: "",
      pan: "",
      yearsOfExperience: "",
      highestQualification: "",
      previousExperience: "",
      locationId: selectedBranchId || "",
      projectIds: [],
    });
    setEditingUser(null);
    setMessage("");
    setTempPassword(null);
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

  const columns = [
    {
      field: "name",
      headerName: "STAFF MEMBER",
      width: 250,
      renderCell: (params: any) => (
        <div className="flex items-center gap-3 h-full">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[11px]">
            {getInitials(params.row.name)}
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
            {params.row.name || "-"}
          </div>
        </div>
      ),
    },
    { field: "mobileNumber", headerName: "MOBILE", width: 150 },
    { field: "email", headerName: "EMAIL", width: 200 },
    {
      field: "location",
      headerName: "BRANCH",
      width: 150,
      renderCell: (params: any) => (
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {params.row.employeeDetails?.locationId?.name || "-"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedUserId(params.row._id)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
            title="View Details"
          >
            <HiOutlineEye size={18} />
          </button>
          <button
            onClick={() => handleEditUser(params.row)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
            title="Edit"
          >
            <HiPencil size={18} />
          </button>
          <button
            onClick={() => handleDeleteUser(params.row._id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
            title="Delete"
          >
            {deletingUserId === params.row._id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <HiTrash size={18} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full md:w-96">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
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
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
        >
          <HiPlus /> Add Staff Member
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <CustomTable
          rows={users.filter(
            (u) =>
              u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.mobileNumber?.includes(searchTerm),
          )}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          height={600}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-5 flex justify-between items-center z-100">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {editingUser ? "Update Staff Member" : "Register New Staff"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <HiX size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.mobileNumber}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        mobileNumber: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Branch / Location
                  </label>
                  <select
                    value={newEmployee.locationId}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        locationId: e.target.value,
                        projectIds: [],
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 outline-none appearance-none"
                  >
                    <option value="">Select Branch</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Assigned Projects (Multiple)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl max-h-32 overflow-y-auto">
                    {allProjects
                      .filter(
                        (p) =>
                          !newEmployee.locationId ||
                          (typeof p.locationId === "object"
                            ? p.locationId._id === newEmployee.locationId
                            : p.locationId === newEmployee.locationId),
                      )
                      .map((proj) => (
                        <label
                          key={proj._id}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={newEmployee.projectIds.includes(proj._id)}
                            onChange={(e) => {
                              const ids = e.target.checked
                                ? [...newEmployee.projectIds, proj._id]
                                : newEmployee.projectIds.filter(
                                    (id) => id !== proj._id,
                                  );
                              setNewEmployee({
                                ...newEmployee,
                                projectIds: ids,
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors truncate">
                            {proj.name}
                          </span>
                        </label>
                      ))}
                    {allProjects.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">
                        No projects found for branch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-center justify-between gap-4 ${message.includes("successfully") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-800"}`}
                >
                  <span className="flex items-center gap-2 font-bold">
                    {message.includes("successfully") ? "✅" : "⚠️"} {message}
                  </span>
                  {tempPassword && (
                    <button
                      type="button"
                      onClick={copyPasswordToClipboard}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      {copySuccess ? (
                        <HiCheck className="text-emerald-600" />
                      ) : (
                        <HiClipboardCopy className="text-indigo-600" />
                      )}
                      {copySuccess ? "Copied" : `Pass: ${tempPassword}`}
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
                >
                  {creating
                    ? "Processing..."
                    : editingUser
                      ? "Update Staff"
                      : "Create Account"}
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
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}
