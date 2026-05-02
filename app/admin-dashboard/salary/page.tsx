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
  HiSearch,
  HiX,
  HiOutlineEye,
  HiPencil,
} from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2';
import CustomTable from '@/components/CustomTable';
import { GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';

// --- Types -------------------------------------------------
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
  userId: any; // Can be object or string depending on context
  month: string;
  year: number;
  earnings: LineItem[];
  deductions: LineItem[];
  netPayable: number;
  employeeName?: string;
  createdAt?: string;
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
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form/Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchEmployees(), fetchSalaries()]);
    setLoading(false);
  };

  const fetchEmployees = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees?role=employee', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const fetchSalaries = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/salary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSalaries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch salaries');
    }
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
        netPayable: defaultEarnings.reduce((a, b) => a + b.amount, 0) - defaultDeductions.reduce((a, b) => a + b.amount, 0),
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
    setSalary({ ...salary, earnings: newEarnings, netPayable: totalEarnings - salary.deductions.reduce((s, i) => s + i.amount, 0) });
  };
  const removeDeduction = (idx: number) => {
    const newDeductions = salary.deductions.filter((_, i) => i !== idx);
    const totalDeductions = newDeductions.reduce((s, i) => s + i.amount, 0);
    setSalary({ ...salary, deductions: newDeductions, netPayable: salary.earnings.reduce((s, i) => s + i.amount, 0) - totalDeductions });
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
        fetchSalaries();
        setTimeout(() => {
          setMessage(null);
          setIsModalOpen(false);
        }, 1500);
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

  const resetForm = () => {
    setSelectedEmployee('');
    setMonthYear(() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    setSalary({
      userId: '',
      month: '',
      year: new Date().getFullYear(),
      earnings: defaultEarnings,
      deductions: defaultDeductions,
      netPayable: 33000,
    });
    setIsReadOnly(false);
  };

  const totalEarnings = salary.earnings.reduce((s, i) => s + i.amount, 0);
  const totalDeductions = salary.deductions.reduce((s, i) => s + i.amount, 0);

  const filteredSalaries = salaries.filter(s => {
    const name = s.employeeName || s.userId?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.month.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const salaryColumns: GridColDef[] = [
    {
      field: 'employeeName',
      headerName: 'NAME',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <div className="flex items-center gap-3 h-full">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-[10px] ring-1 ring-emerald-200 dark:ring-emerald-800 flex-shrink-0">
            {params.row.employeeName?.[0] || params.row.userId?.name?.[0] || 'E'}
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {params.row.employeeName || params.row.userId?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'EMAIL ADDRESS',
      width: 220,
      renderCell: (params) => (
        <span className="text-sm font-bold text-slate-900 dark:text-white lowercase">
          {params.row.userId?.email || '-'}
        </span>
      ),
    },
    {
      field: 'month',
      headerName: 'PERIOD',
      width: 150,
      renderCell: (params) => (
        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
          {params.value}
        </span>
      ),
    },
    {
      field: 'netPayable',
      headerName: 'NET PAYABLE',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
          ₹{params.value?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'RELEASED ON',
      width: 150,
      renderCell: (params) => (
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
          {params.value ? new Date(params.value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 h-full">
          <IconButton
            size="small"
            onClick={() => {
              const sal = params.row;
              setSalary({
                userId: sal.userId._id,
                month: sal.month,
                year: sal.year,
                earnings: sal.earnings,
                deductions: sal.deductions,
                netPayable: sal.netPayable,
              });
              setSelectedEmployee(sal.userId._id);
              const parts = sal.month.split(' ');
              if (parts.length === 2) {
                const mIdx = new Date(`${parts[0]} 1, 2000`).getMonth() + 1;
                setMonthYear(`${parts[1]}-${String(mIdx).padStart(2, '0')}`);
              }
              setIsReadOnly(true);
              setIsModalOpen(true);
            }}
            className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            <HiOutlineEye className="text-lg" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              const sal = params.row;
              setSalary({
                userId: sal.userId._id,
                month: sal.month,
                year: sal.year,
                earnings: sal.earnings,
                deductions: sal.deductions,
                netPayable: sal.netPayable,
              });
              setSelectedEmployee(sal.userId._id);
              const parts = sal.month.split(' ');
              if (parts.length === 2) {
                const mIdx = new Date(`${parts[0]} 1, 2000`).getMonth() + 1;
                setMonthYear(`${parts[1]}-${String(mIdx).padStart(2, '0')}`);
              }
              setIsReadOnly(false);
              setIsModalOpen(true);
            }}
            className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <HiPencil className="text-lg" />
          </IconButton>
        </div>
      ),
    },
  ];

  if (loading && salaries.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        {/* Sticky Header Toolbar Skeleton */}
        <div className="sticky top-16 h-14 bg-[#f8f9fa] dark:bg-[#0A1128]/80 px-4 md:px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 z-30 backdrop-blur-md">
          <div className="h-6 w-48 md:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="flex items-center gap-2">
             <div className="hidden md:block h-9 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"></div>
             <div className="h-9 w-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"></div>
          </div>
        </div>

        {/* Table Content Skeleton */}
        <div className="p-0">
           {/* Table Header Area */}
           <div className="h-14 bg-white dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-4">
              <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded ml-auto"></div>
           </div>
           
           {/* Table Rows */}
           <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-white dark:bg-[#0A1128]/40 flex items-center px-6 gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                   <div className="space-y-2 flex-1 max-w-[200px]">
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                      <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-900 rounded"></div>
                   </div>
                   <div className="h-4 w-32 bg-slate-100 dark:bg-slate-900 rounded hidden md:block"></div>
                   <div className="h-4 w-24 bg-slate-100 dark:bg-slate-900 rounded"></div>
                   <div className="h-4 w-24 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full ml-auto"></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      <div className="bg-slate-50 dark:bg-[#0A1128] min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Sticky Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-[#0A1128]/80 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md transition-colors">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Salary Management <span className="text-black dark:text-white font-normal hidden sm:inline">({salaries.length} Slips)</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchSalaries}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold text-[10px] md:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <HiOutlinePlus className="text-lg md:hidden" />
              <span className="hidden md:inline">Release New Salary</span>
              <span className="md:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-0">
          <CustomTable
            rows={filteredSalaries}
            columns={salaryColumns}
            getRowId={(row) => row._id || Math.random().toString()}
            height="calc(100vh - 110px)"
            onSearch={setSearchTerm}
            extraToolbarContent={
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Total Released: ₹{salaries.reduce((acc, s) => acc + s.netPayable, 0).toLocaleString()}
                </div>
              </div>
            }
          />
        </div>

        {/* Modal for Salary Processing */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 overflow-y-auto subtle-scrollbar" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-[0.5rem] shadow-2xl w-full max-w-5xl animate-in slide-in-from-top-10 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-20">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  {isReadOnly ? 'View Salary Slip' : (salary._id ? 'Edit Salary Slip' : 'Process New Salary')}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <HiX size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                 {/* Selection Section */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        <HiOutlineUserGroup className="inline mr-1.5 w-3.5 h-3.5" /> Select Employee
                      </label>
                      <select
                        value={selectedEmployee}
                        disabled={isReadOnly}
                        onChange={e => handleEmployeeChange(e.target.value)}
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none dark:text-white ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <option value="">Choose employee...</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.name} – {emp.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                        <HiOutlineCalendar className="inline mr-1.5 w-3.5 h-3.5" /> Payment Period
                      </label>
                      <input
                        type="month"
                        value={monthYear}
                        disabled={isReadOnly}
                        onChange={e => handleMonthChange(e.target.value)}
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none dark:text-white ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                 </div>

                 {selectedEmployee ? (
                   <div className="space-y-8 animate-in fade-in duration-300">
                      {loadingEmployee ? (
                        <div className="space-y-8 animate-pulse">
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {[1, 2].map(col => (
                                <div key={col} className="bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50">
                                   <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                                   <div className="space-y-4">
                                      {[1, 2, 3].map(row => (
                                        <div key={row} className="h-12 w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"></div>
                                      ))}
                                   </div>
                                   <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-6"></div>
                                </div>
                              ))}
                           </div>
                           <div className="h-32 w-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800"></div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Earnings */}
                            <div className="bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Earnings</h3>
                                </div>
                                {!isReadOnly && (
                                  <button onClick={addEarning} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all active:scale-95">
                                    Add Line
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {salary.earnings.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700 transition-all hover:border-emerald-200">
                                    <input
                                      type="text"
                                      value={item.label}
                                      disabled={isReadOnly}
                                      onChange={e => updateEarnings(idx, 'label', e.target.value)}
                                      className={`flex-1 text-sm font-bold bg-transparent border-0 focus:ring-0 p-1.5 outline-none dark:text-white ${isReadOnly ? 'cursor-default' : ''}`}
                                    />
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">₹</span>
                                      <input
                                        type="number"
                                        value={item.amount}
                                        disabled={isReadOnly}
                                        onChange={e => updateEarnings(idx, 'amount', Number(e.target.value))}
                                        className={`w-32 pl-7 pr-3 py-2 text-sm text-right font-black border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 outline-none ${isReadOnly ? 'cursor-default' : 'focus:bg-white focus:ring-2 focus:ring-emerald-500/20'}`}
                                      />
                                    </div>
                                    {!isReadOnly && (
                                      <button onClick={() => removeEarning(idx)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                                        <HiOutlineTrash className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Amount</span>
                                <span className="text-2xl font-black text-emerald-600">₹{totalEarnings.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Deductions */}
                            <div className="bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm">
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Deductions</h3>
                                </div>
                                {!isReadOnly && (
                                  <button onClick={addDeduction} className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-all active:scale-95">
                                    Add Line
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {salary.deductions.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700 transition-all hover:border-rose-200">
                                    <input
                                      type="text"
                                      value={item.label}
                                      disabled={isReadOnly}
                                      onChange={e => updateDeductions(idx, 'label', e.target.value)}
                                      className={`flex-1 text-sm font-bold bg-transparent border-0 focus:ring-0 p-1.5 outline-none dark:text-white ${isReadOnly ? 'cursor-default' : ''}`}
                                    />
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">₹</span>
                                      <input
                                        type="number"
                                        value={item.amount}
                                        disabled={isReadOnly}
                                        onChange={e => updateDeductions(idx, 'amount', Number(e.target.value))}
                                        className={`w-32 pl-7 pr-3 py-2 text-sm text-right font-black border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900 outline-none ${isReadOnly ? 'cursor-default' : 'focus:bg-white focus:ring-2 focus:ring-rose-500/20'}`}
                                      />
                                    </div>
                                    {!isReadOnly && (
                                      <button onClick={() => removeDeduction(idx)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                                        <HiOutlineTrash className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Deduct</span>
                                <span className="text-2xl font-black text-rose-500">₹{totalDeductions.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative group p-8 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-8 shadow-sm overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-indigo-600 opacity-[0.03]"></div>
                             <div className="flex items-center gap-6 relative">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center">
                                   <HiOutlineCurrencyRupee className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Final Net Payable</p>
                                   <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">₹{salary.netPayable.toLocaleString()}</h3>
                                </div>
                             </div>
                             <div className="flex items-center gap-6 relative">
                                <button
                                  onClick={() => setIsModalOpen(false)}
                                  className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                >
                                  {isReadOnly ? 'Close' : 'Discard'}
                                </button>
                                {!isReadOnly && (
                                  <button
                                    onClick={saveSalary}
                                    disabled={saving}
                                    className="px-10 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                  >
                                    {saving ? 'Processing...' : (salary._id ? 'Update Salary Slip' : 'Release Salary Slip')}
                                  </button>
                                )}
                             </div>
                          </div>
                        </>
                      )}
                   </div>
                 ) : (
                   <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                         <HiOutlineTrendingUp className="text-4xl rotate-45" />
                      </div>
                      <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Select an employee to continue</h3>
                   </div>
                 )}

                 {message && (
                    <div className={`p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest border animate-in slide-in-from-bottom-2 ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {message.text}
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
