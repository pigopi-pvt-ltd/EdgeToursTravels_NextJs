"use client";

import { useState } from "react";
import {
  HiCog,
  HiShieldCheck,
  HiBell,
  HiColorSwatch,
  HiDatabase,
  HiSave,
  HiGlobeAlt,
  HiMoon,
  HiSun,
  HiFingerPrint,
  HiLockClosed,
  HiMail,
  HiCloudUpload,
} from "react-icons/hi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: <HiCog /> },
    { id: "security", label: "Security", icon: <HiShieldCheck /> },
    { id: "notifications", label: "Notifications", icon: <HiBell /> },
    { id: "appearance", label: "Appearance", icon: <HiColorSwatch /> },
    { id: "system", label: "System", icon: <HiDatabase /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 transition-colors duration-300">
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <HiCog className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">System Settings</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Configuration & Control</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95">
          <HiSave className="text-lg" /> Save Changes
        </button>
      </div>

      <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className={`text-xl ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "general" && (
            <div className="space-y-6">
              <Section title="Application Branding" description="Manage your company name and logo display settings.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Platform Name" placeholder="Edge Tours & Travels" />
                  <Input label="Support Email" placeholder="support@edgetours.com" />
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Logo Configuration</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors group cursor-pointer">
                      <HiCloudUpload className="text-4xl text-slate-300 group-hover:text-indigo-500 transition-colors mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500">Drag logo here or click to browse</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">PNG, SVG up to 2MB</p>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Localization" description="Set your global timezone and currency preferences.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select label="Timezone" options={["(GMT+05:30) India Standard Time", "(GMT+00:00) UTC", "(GMT-05:00) Eastern Time"]} />
                  <Select label="Currency" options={["INR (₹)", "USD ($)", "EUR (€)"]} />
                </div>
              </Section>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Section title="Authentication" description="Update your password and security credentials.">
                <div className="space-y-6">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm Password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </Section>

              <Section title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-500">
                      <HiFingerPrint className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Authenticator App</p>
                      <p className="text-xs text-slate-500">Use Google Authenticator or Authy</p>
                    </div>
                  </div>
                  <Toggle active={false} />
                </div>
              </Section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Section title="Theme Settings" description="Customize how the dashboard looks on your device.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ThemeCard icon={<HiSun className="text-amber-500" />} title="Light Mode" active={true} />
                  <ThemeCard icon={<HiMoon className="text-indigo-400" />} title="Dark Mode" active={false} />
                </div>
              </Section>

              <Section title="Accent Color" description="Choose a primary color for buttons and highlights.">
                <div className="flex gap-4">
                  {["bg-indigo-600", "bg-emerald-600", "bg-rose-600", "bg-amber-600", "bg-violet-600"].map((color, i) => (
                    <div key={i} className={`w-10 h-10 ${color} rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg ${i === 0 ? "ring-4 ring-indigo-200 dark:ring-indigo-900" : ""}`} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* More sections can be added for other tabs */}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="mb-8">
        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
        <p className="text-xs font-semibold text-slate-400 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Input({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{label}</label>
      <input
        type={type}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{label}</label>
      <select className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ active }: { active: boolean }) {
  return (
    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}>
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? "translate-x-6" : ""}`} />
    </div>
  );
}

function ThemeCard({ icon, title, active }: { icon: React.ReactNode; title: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${active ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/50" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200"}`}>
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
      {active && <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />}
    </div>
  );
}
