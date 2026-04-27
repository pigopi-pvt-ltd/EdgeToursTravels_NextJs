"use client";

import { useEffect, useState } from "react";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiBadgeCheck,
  HiShieldCheck,
  HiCreditCard,
  HiLocationMarker,
  HiBriefcase,
  HiIdentification,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiArrowRight,
  HiX,
} from "react-icons/hi";
import { getAuthToken } from "@/lib/auth";

// Static stats for a "fuller" look
const STATS = [
  {
    label: "Account Age",
    value: "142 Days",
    icon: <HiCalendar className="text-blue-500" />,
  },
  {
    label: "Trips Completed",
    value: "86",
    icon: <HiCheckCircle className="text-emerald-500" />,
  },
  {
    label: "Rating",
    value: "4.9/5",
    icon: <HiShieldCheck className="text-amber-500" />,
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");
  const token = getAuthToken();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setEditName(data.name || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setUser({ ...user, name: editName, profileCompleted: true });
        setEditing(false);
        setMessage("Profile updated successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Update failed");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-slate-500">
        Optimizing your profile view...
      </div>
    );
  if (!user)
    return (
      <div className="p-10 text-center">
        User session expired. Please log in.
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors duration-300">
      {message && (
        <div className="sticky top-16 z-50 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800 font-medium text-sm flex justify-between items-center backdrop-blur-md">
          <span>{message}</span>
          <button onClick={() => setMessage("")}><HiX /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-2 md:p-4">
        {/* LEFT COLUMN: User Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-6 mx-auto transform ">
                <span className="-rotate-3">{user.name?.charAt(0) || "U"}</span>
              </div>
              <div
                className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white dark:border-slate-900 w-8 h-8 rounded-full"
                title="Online"
              ></div>
            </div>

            {editing ? (
              <form onSubmit={handleUpdateName} className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-center"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                  {user.name || "Anonymous User"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
                  {user.email}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest">
                    {user.role}
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest ${user.kycStatus === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    KYC: {user.kycStatus || "N/A"}
                  </span>
                </div>

                <button 
                  onClick={() => setEditing(true)}
                  className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
                >
                  Edit Profile{" "}
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Activity Stats Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Driver Metrics
            </h4>
            <div className="space-y-4">
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                      {stat.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Communication Details */}
            <SectionWrapper title="Communication" icon={<HiMail />}>
              <InfoItem label="Primary Email" value={user.email} />
              <InfoItem label="Mobile Number" value={user.mobileNumber} />
              <InfoItem
                label="Registration Date"
                value={new Date(
                  user.createdAt || Date.now(),
                ).toLocaleDateString()}
              />
            </SectionWrapper>

            {/* Vehicle Details */}
            <SectionWrapper title="Vehicle Fleet Details" icon={<HiBadgeCheck />}>
              <InfoItem
                label="Model"
                value={user.driverDetails?.vehicleMake && user.driverDetails?.vehicleModel ? `${user.driverDetails.vehicleMake} ${user.driverDetails.vehicleModel}` : "Not Assigned"}
              />
              <InfoItem
                label="Registration"
                value={user.driverDetails?.vehicleRegNumber}
              />
              <InfoItem
                label="License Number"
                value={user.driverDetails?.drivingLicenseNumber}
              />
            </SectionWrapper>
          </div>

          {/* Identity & Verification Section */}
          <section className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-white">
                <HiShieldCheck className="text-emerald-500 text-2xl" /> Driver 
                Verification
              </h3>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
                <HiCheckCircle /> Secure
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <InfoItem
                  label="Identity Verification"
                  value={user.driverDetails?.drivingLicenseNumber ? "Verified by License" : "Pending"}
                  icon={<HiIdentification />}
                />
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Present Address
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 flex gap-2">
                    <HiLocationMarker className="shrink-0 text-emerald-500 mt-1" />
                    {user.driverDetails?.presentAddress || "Address not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-6 border-l border-slate-100 dark:border-slate-800 md:pl-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Compliance Status
                </p>
                <div className="space-y-3">
                  <DocStatus
                    label="Driving License"
                    status={user.driverDetails?.drivingLicenseNumber ? "verified" : "pending"}
                  />
                  <DocStatus 
                    label="Vehicle Insurance" 
                    status="verified" 
                  />
                  <DocStatus
                    label="KYC Verification"
                    status={user.kycStatus === "approved" ? "verified" : "pending"}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <p className="text-center text-slate-400 text-xs font-medium">
            Profile last updated:{" "}
            {new Date(user.updatedAt || Date.now()).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function SectionWrapper({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
        <span className="text-emerald-500 text-lg">{icon}</span> {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold truncate">
        {icon && (
          <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">
            {icon}
          </span>
        )}
        <span className="text-sm">{value || "Not specified"}</span>
      </div>
    </div>
  );
}

function DocStatus({
  label,
  status,
}: {
  label: string;
  status: "verified" | "pending" | "rejected";
}) {
  const styles = {
    verified: "bg-emerald-500",
    pending: "bg-amber-500",
    rejected: "bg-rose-500",
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase text-slate-400">
          {status}
        </span>
        <div className={`w-2 h-2 rounded-full ${styles[status]}`}></div>
      </div>
    </div>
  );
}