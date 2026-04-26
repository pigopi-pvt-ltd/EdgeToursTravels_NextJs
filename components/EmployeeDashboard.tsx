'use client';

import { getStoredUser } from '@/lib/auth';
import {
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineChat,
  HiOutlineStar,
  HiOutlineClock,
} from 'react-icons/hi';
import { HiCheckCircle } from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Static data
const weeklyData = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 19 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 22 },
  { day: 'Fri', tasks: 28 },
  { day: 'Sat', tasks: 18 },
  { day: 'Sun', tasks: 9 },
];

const activities = [
  { id: 1, text: 'Booking #EDG-1234 confirmed', time: '2 min ago', icon: HiCheckCircle, color: 'text-emerald-500' },
  { id: 2, text: 'New driver assigned to trip', time: '1 hour ago', icon: HiOutlineUserGroup, color: 'text-blue-500' },
  { id: 3, text: 'Customer support ticket closed', time: '3 hours ago', icon: HiOutlineChat, color: 'text-purple-500' },
  { id: 4, text: 'Monthly performance report generated', time: 'Yesterday', icon: HiOutlineChartBar, color: 'text-amber-500' },
];

export default function EmployeeDashboard() {
  const user = getStoredUser();

  const stats = [
    { label: 'Tasks Completed', value: 86, icon: HiCheckCircle, color: 'emerald', trend: '+12%' },
    { label: 'Customer Rating', value: 4.8, icon: HiOutlineStar, color: 'amber', trend: '⭐ 5.0 avg' },
    { label: 'Avg Response', value: '2.4', unit: 'min', icon: HiOutlineClock, color: 'blue', trend: '-18%' },
    { label: 'Active Sessions', value: 3, icon: HiOutlineUserGroup, color: 'indigo', trend: 'Today' },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-700';
      case 'amber':   return 'from-amber-500 to-amber-600 bg-amber-50 text-amber-700';
      case 'blue':    return 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700';
      case 'indigo':  return 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-700';
      default:        return 'from-slate-500 to-slate-600 bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Stats Cards – no greeting line above */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</span>
                  {stat.unit && <span className="text-xs text-slate-500">{stat.unit}</span>}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{stat.trend}</p>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${getColorClass(stat.color)} shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two‑column layout: Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Weekly Task Completion</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                {/* Fixed Tooltip – no borderColor, only border shorthand */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="tasks" radius={[6, 6, 0, 0]} fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2">
                <div className={`p-1 rounded-full bg-slate-100 dark:bg-slate-700 ${activity.color}`}>
                  <activity.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">💡 <span className="font-semibold">Pro tip:</span> Fast responses boost ratings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center gap-3">
            <HiOutlineUserGroup className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Team Collaboration</p>
              <p className="text-xs text-slate-500">Chat with teammates</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center gap-3">
            <HiOutlineChartBar className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Performance Reports</p>
              <p className="text-xs text-slate-500">Weekly insights</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-3">
            <HiOutlineStar className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">Customer Feedback</p>
              <p className="text-xs text-slate-500">4.8 ★ from 152 reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}