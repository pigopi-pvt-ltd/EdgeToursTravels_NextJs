'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from 'react-icons/hi';

interface Employee {
  _id: string;
  name: string;
  email: string;
}

interface LineItem {
  label: string;
  amount: number;
}

interface Salary {
  _id?: string;
  userId: string;
  month: string;
  year: number;
  earnings: LineItem[];
  deductions: LineItem[];
  netPayable: number;
}

const defaultEarnings = [
  { label: 'Basic salary', amount: 25000 },
  { label: 'House rent allowance', amount: 5000 },
  { label: 'Other allowances', amount: 3000 },
];
const defaultDeductions = [
  { label: 'Provident fund', amount: 1800 },
  { label: 'Professional tax', amount: 200 },
  { label: 'Income tax (TDS)', amount: 0 },
];

export default function AdminSalary() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [salary, setSalary] = useState<Salary>({
    userId: '',
    month: '',
    year: new Date().getFullYear(),
    earnings: defaultEarnings,
    deductions: defaultDeductions,
    netPayable: 33000,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = getAuthToken();
    const res = await fetch('/api/admin/employees?role=employee', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  };

  const loadSalary = async (empId: string, ym: string) => {
    const [year, monthNum] = ym.split('-');
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long' });
    const fullMonth = `${monthName} ${year}`;
    const token = getAuthToken();
    setLoadingEmployee(true);
    try {
      const res = await fetch(`/api/admin/salary?userId=${empId}&month=${fullMonth}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const existing = await res.json();
        if (existing.length > 0) {
          const sal = existing[0];
          setSalary({
            userId: sal.userId._id,
            month: sal.month,
            year: sal.year,
            earnings: sal.earnings,
            deductions: sal.deductions,
            netPayable: sal.netPayable,
          });
          return;
        }
      }
      // Default if no record
      const emp = employees.find(e => e._id === empId);
      setSalary({
        userId: empId,
        month: fullMonth,
        year: parseInt(year),
        earnings: defaultEarnings,
        deductions: defaultDeductions,
        netPayable: defaultEarnings.reduce((a,b)=>a+b.amount,0) - defaultDeductions.reduce((a,b)=>a+b.amount,0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleEmployeeChange = async (empId: string) => {
    setSelectedEmployee(empId);
    if (empId && monthYear) {
      await loadSalary(empId, monthYear);
    }
  };

  const handleMonthChange = async (newMonthYear: string) => {
    setMonthYear(newMonthYear);
    if (selectedEmployee) {
      await loadSalary(selectedEmployee, newMonthYear);
    }
  };

  const updateEarnings = (index: number, field: 'label' | 'amount', value: string | number) => {
    const newEarnings = [...salary.earnings];
    if (field === 'amount') newEarnings[index].amount = Number(value);
    else newEarnings[index].label = value as string;
    const totalEarnings = newEarnings.reduce((s, i) => s + i.amount, 0);
    const totalDeductions = salary.deductions.reduce((s, i) => s + i.amount, 0);
    setSalary({ ...salary, earnings: newEarnings, netPayable: totalEarnings - totalDeductions });
  };

  const updateDeductions = (index: number, field: 'label' | 'amount', value: string | number) => {
    const newDeductions = [...salary.deductions];
    if (field === 'amount') newDeductions[index].amount = Number(value);
    else newDeductions[index].label = value as string;
    const totalEarnings = salary.earnings.reduce((s, i) => s + i.amount, 0);
    const totalDeductions = newDeductions.reduce((s, i) => s + i.amount, 0);
    setSalary({ ...salary, deductions: newDeductions, netPayable: totalEarnings - totalDeductions });
  };

  const addEarning = () => {
    setSalary({ ...salary, earnings: [...salary.earnings, { label: 'New earning', amount: 0 }] });
  };
  const addDeduction = () => {
    setSalary({ ...salary, deductions: [...salary.deductions, { label: 'New deduction', amount: 0 }] });
  };
  const removeEarning = (idx: number) => {
    const newEarnings = salary.earnings.filter((_, i) => i !== idx);
    const totalEarnings = newEarnings.reduce((s, i) => s + i.amount, 0);
    setSalary({ ...salary, earnings: newEarnings, netPayable: totalEarnings - salary.deductions.reduce((s,i)=>s+i.amount,0) });
  };
  const removeDeduction = (idx: number) => {
    const newDeductions = salary.deductions.filter((_, i) => i !== idx);
    const totalDeductions = newDeductions.reduce((s, i) => s + i.amount, 0);
    setSalary({ ...salary, deductions: newDeductions, netPayable: salary.earnings.reduce((s,i)=>s+i.amount,0) - totalDeductions });
  };

  const saveSalary = async () => {
    setSaving(true);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(salary),
      });
      if (res.ok) {
        setMessage({ text: 'Salary saved successfully', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Error saving salary', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const totalEarnings = salary.earnings.reduce((s, i) => s + i.amount, 0);
  const totalDeductions = salary.deductions.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Salary Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define monthly earnings and deductions for employees
          </p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <HiOutlineUserGroup className="inline mr-1.5 w-3.5 h-3.5" /> Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={e => handleEmployeeChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} – {emp.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <HiOutlineCalendar className="inline mr-1.5 w-3.5 h-3.5" /> Month / Year
            </label>
            <input
              type="month"
              value={monthYear}
              onChange={e => handleMonthChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {selectedEmployee && (
          <div className="p-5 space-y-6">
            {loadingEmployee && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loadingEmployee && (
              <>
                {/* Earnings & Deductions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings Column */}
                  <div className="bg-slate-50/40 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Earnings
                        </h3>
                      </div>
                      <button
                        onClick={addEarning}
                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {salary.earnings.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700">
                          <input
                            type="text"
                            value={item.label}
                            onChange={e => updateEarnings(idx, 'label', e.target.value)}
                            className="flex-1 text-sm font-medium bg-transparent border-0 focus:ring-0 p-1.5 outline-none dark:text-white"
                            placeholder="Label"
                          />
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={e => updateEarnings(idx, 'amount', Number(e.target.value))}
                              className="w-28 pl-6 pr-2 py-1.5 text-sm text-right border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                            />
                          </div>
                          <button onClick={() => removeEarning(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Earnings</span>
                      <span className="text-lg font-black text-emerald-600">₹{totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div className="bg-slate-50/40 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Deductions
                        </h3>
                      </div>
                      <button
                        onClick={addDeduction}
                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition"
                      >
                        <HiOutlinePlus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {salary.deductions.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm border border-slate-100 dark:border-slate-700">
                          <input
                            type="text"
                            value={item.label}
                            onChange={e => updateDeductions(idx, 'label', e.target.value)}
                            className="flex-1 text-sm font-medium bg-transparent border-0 focus:ring-0 p-1.5 outline-none dark:text-white"
                            placeholder="Label"
                          />
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={e => updateDeductions(idx, 'amount', Number(e.target.value))}
                              className="w-28 pl-6 pr-2 py-1.5 text-sm text-right border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                            />
                          </div>
                          <button onClick={() => removeDeduction(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total Deductions</span>
                      <span className="text-lg font-black text-rose-500">₹{totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Payable Card - styled like stat card */}
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-800/50 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                        <HiOutlineCash className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Payable</p>
                        <p className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                          ₹{salary.netPayable.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Earnings – Deductions</p>
                        <p className="text-sm font-mono">₹{totalEarnings.toLocaleString()} – ₹{totalDeductions.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={saveSalary}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
                      >
                        <HiOutlineSave className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Salary'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!selectedEmployee && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-3">
              <HiOutlineUserGroup className="text-2xl text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Select an employee to manage salary</p>
          </div>
        )}
      </div>
    </div>
  );
}