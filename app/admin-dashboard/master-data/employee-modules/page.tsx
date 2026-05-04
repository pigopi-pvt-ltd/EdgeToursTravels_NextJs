'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

interface Employee {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  employeeDetails: {
    fullName: string;
    modules?: string[];
  };
}

export default function EmployeeModulesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const employeesArray = Array.isArray(data) ? data : data.employees || [];
        setEmployees(employeesArray.filter((e: any) => e.role === 'employee'));
      } else {
        setMessage({ type: 'error', text: 'Failed to load employees' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const updateModules = async (employeeId: string, modules: string[]) => {
    setSaving(prev => ({ ...prev, [employeeId]: true }));
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employee-modules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId, modules }),
      });
      if (res.ok) {
        setEmployees(prev =>
          prev.map(emp =>
            emp._id === employeeId
              ? { ...emp, employeeDetails: { ...emp.employeeDetails, modules } }
              : emp
          )
        );
        setMessage({ type: 'success', text: 'Access updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving' });
    } finally {
      setSaving(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const toggleModule = (employee: Employee, moduleName: string) => {
    const current = employee.employeeDetails?.modules || [];
    const newModules = current.includes(moduleName)
      ? current.filter(m => m !== moduleName)
      : [...current, moduleName];
    updateModules(employee._id, newModules);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center border-b">
          <div className="h-6 w-56 bg-slate-200 rounded-md"></div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)] border-b border-slate-200 dark:border-slate-800">
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-16 z-30">
          <h1 className="text-sm md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Employee Module Access
          </h1>
        </div>

        <div className="p-4 md:p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-[13px] font-black text-slate-700 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Bookings</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Support</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Drivers</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Employees</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-center text-[13px] font-black text-slate-700 uppercase tracking-widest">Vehicles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {employees.map((emp) => {
                  const modules = emp.employeeDetails?.modules || [];
                  const isSaving = saving[emp._id];
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{emp.employeeDetails?.fullName || emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email} | {emp.mobileNumber}</p>
                        </div>
                       </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('bookings')}
                          onChange={() => toggleModule(emp, 'bookings')}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('support')}
                          onChange={() => toggleModule(emp, 'support')}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('drivers')}
                          onChange={() => toggleModule(emp, 'drivers')}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('employees')}
                          onChange={() => toggleModule(emp, 'employees')}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('customer')}
                          onChange={() => toggleModule(emp, 'customer')}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ToggleSwitch
                          checked={modules.includes('vehicles')}
                          onChange={() => toggleModule(emp, 'vehicles')}
                          disabled={isSaving}
                        />
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable toggle component
const ToggleSwitch = ({ checked, onChange, disabled }: any) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
  </label>
);