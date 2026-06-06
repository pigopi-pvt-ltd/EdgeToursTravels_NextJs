"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuthToken } from "@/lib/auth";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiBriefcase,
  HiCheckCircle,
  HiClock,
  HiStop,
  HiXCircle,
} from "react-icons/hi";

interface Location {
  _id: string;
  name: string;
}

interface Project {
  _id: string;
  name: string;
  locationId: Location | string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  startDate?: string;
  endDate?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize state directly from localStorage to prevent layout lag
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        const branchStr = localStorage.getItem("selected_branch");
        if (branchStr) {
          try {
            return JSON.parse(branchStr)?.id || null;
          } catch (e) {
            return null;
          }
        }
      }
      return null;
    },
  );

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Memoize fetchData so it handles reactivity correctly via dependency injection
  const fetchData = useCallback(async (currentBranchId: string | null) => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const [projRes, locRes] = await Promise.all([
        fetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/locations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!projRes.ok || !locRes.ok) throw new Error("Failed to fetch data");

      let projData = await projRes.json();
      const locData = await locRes.json();

      // Filter data cleanly using the parameterized branch context
      if (currentBranchId) {
        projData = projData.filter((p: any) =>
          typeof p.locationId === "object"
            ? p.locationId._id === currentBranchId
            : p.locationId === currentBranchId,
        );
      }

      setProjects(projData);
      setLocations(locData);
    } catch (error) {
      console.error(error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data whenever the branch state updates
  useEffect(() => {
    fetchData(selectedBranchId);
  }, [selectedBranchId, fetchData]);

  // Global system synchronization hook for branch switching
  useEffect(() => {
    const handleBranchSync = () => {
      const branchStr = localStorage.getItem("selected_branch");
      if (branchStr) {
        try {
          const parsed = JSON.parse(branchStr);
          setSelectedBranchId(parsed?.id || null);
        } catch (e) {
          setSelectedBranchId(null);
        }
      } else {
        setSelectedBranchId(null);
      }
    };

    window.addEventListener("storage", handleBranchSync);
    window.addEventListener("local-storage-update", handleBranchSync);

    return () => {
      window.removeEventListener("storage", handleBranchSync);
      window.removeEventListener("local-storage-update", handleBranchSync);
    };
  }, []);

  const handleOpenModal = (project: Project | null = null) => {
    setCurrentProject(
      project || {
        name: "",
        locationId: selectedBranchId || "",
        status: "active",
        description: "",
      },
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject?.name || !currentProject?.locationId) {
      return showToast("Name and Location are required", "error");
    }

    setIsSubmitting(true);
    const token = getAuthToken();
    const method = currentProject._id ? "PUT" : "POST";
    const url = currentProject._id
      ? `/api/projects/${currentProject._id}`
      : "/api/projects";

    const payload = {
      ...currentProject,
      locationId:
        typeof currentProject.locationId === "object"
          ? currentProject.locationId._id
          : currentProject.locationId,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save project");
      }

      showToast(
        `Project ${currentProject._id ? "updated" : "created"} successfully`,
        "success",
      );
      fetchData(selectedBranchId);
      handleCloseModal();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const token = getAuthToken();
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete project");

      showToast("Project deleted successfully", "success");
      fetchData(selectedBranchId);
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <HiCheckCircle className="text-emerald-500" />;
      case "completed":
        return <HiStop className="text-blue-500" />;
      case "on-hold":
        return <HiClock className="text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Manage Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Assign projects to your locations
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-indigo-500/20"
        >
          <HiPlus /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <HiBriefcase size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenModal(proj)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  >
                    <HiPencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(proj._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <HiTrash size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {proj.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {getStatusIcon(proj.status)}
                    <span className="capitalize">
                      {proj.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {typeof proj.locationId === "object"
                    ? proj.locationId.name
                    : "Unknown Location"}
                </p>
                {proj.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {proj.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>
                  Created:{" "}
                  {new Date(
                    parseInt(proj._id.substring(0, 8), 16) * 1000,
                  ).toLocaleDateString()}
                </span>
                <span>ID: {proj._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No projects found for this branch. Click "Add Project" to create
              one.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {currentProject?._id ? "Update Project" : "Add New Project"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <HiXCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={currentProject?.name || ""}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject!,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Location *
                </label>
                <select
                  required
                  value={
                    typeof currentProject?.locationId === "object"
                      ? currentProject.locationId._id
                      : currentProject?.locationId || ""
                  }
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject!,
                      locationId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={currentProject?.status || "active"}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject!,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  value={currentProject?.description || ""}
                  onChange={(e) =>
                    setCurrentProject({
                      ...currentProject!,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : currentProject?._id
                      ? "Update"
                      : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z- flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"} animate-in fade-in slide-in-from-top-8 duration-300`}
        >
          {toast.type === "success" ? (
            <HiCheckCircle className="w-5 h-5" />
          ) : (
            <HiXCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
