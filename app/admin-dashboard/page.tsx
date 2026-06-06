"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import {
  HiLocationMarker,
  HiArrowRight,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";

interface Location {
  _id: string;
  name: string;
  city?: string;
  isActive: boolean;
}

export default function BranchSelectionPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      const token = getAuthToken();
      try {
        const res = await fetch("/api/locations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLocations(data.filter((loc: Location) => loc.isActive));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSelectBranch = (location: Location) => {
    localStorage.setItem(
      "selected_branch",
      JSON.stringify({
        id: location._id,
        name: location.name,
      }),
    );
    window.dispatchEvent(new Event("local-storage-update"));
    router.push("/admin-dashboard/overview");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-bold animate-pulse">
          Loading branches...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Welcome back, <span className="text-indigo-600">Admin</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Please select a branch to manage its overview, projects, and
          employees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map((loc) => (
          <button
            key={loc._id}
            onClick={() => handleSelectBranch(loc)}
            className="group relative bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-transparent hover:border-indigo-500 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <HiOutlineOfficeBuilding size={120} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <HiLocationMarker size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                  {loc.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                  {loc.city || "Regional Branch"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                Enter Dashboard <HiArrowRight />
              </div>
            </div>
          </button>
        ))}

        {locations.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xl mb-4">
              No active branches found.
            </p>
            <button
              onClick={() => router.push("/admin-dashboard/locations")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition"
            >
              Configure Locations First
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
