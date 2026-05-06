'use client';

import React, { useEffect, useState } from 'react';
import { 
  HiOutlineUserGroup, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle, 
  HiArrowPath 
} from 'react-icons/hi2';
import apiClient from '@/lib/apiClient';
import CustomTable from '@/components/CustomTable';
import { GridColDef } from '@mui/x-data-grid';

interface Employee {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  employeeDetails: {
    fullName: string;
    modules?: string[];
  };
}

//  toggle switch 
const ToggleSwitch = ({ checked, onChange, disabled }: any) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
  </label>
);

export default function EmployeeModulesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/api/admin/employees', { method: 'GET' });
      const employeesArray = Array.isArray(data) ? data : data.employees || [];
      setEmployees(employeesArray.filter((e: any) => e.role === 'employee'));
    } catch (err) {
      showToast('Failed to load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateModules = async (employeeId: string, modules: string[], employeeName: string, moduleName: string, isAdding: boolean) => {
    setSaving(prev => ({ ...prev, [employeeId]: true }));
    try {
      await apiClient('/api/admin/employee-modules', {
        method: 'PUT',
        body: JSON.stringify({ employeeId, modules }),
      });
      
      setEmployees(prev =>
        prev.map(emp =>
          emp._id === employeeId
            ? { ...emp, employeeDetails: { ...emp.employeeDetails, modules } }
            : emp
        )
      );
      
      const action = isAdding ? 'granted' : 'revoked';
      showToast(`Access ${action} for ${moduleName}`, 'success');
    } catch (err) {
      showToast('Update failed', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  const toggleModule = (employee: Employee, moduleName: string) => {
    const current = employee.employeeDetails?.modules || [];
    const isAdding = !current.includes(moduleName);
    const newModules = isAdding
      ? [...current, moduleName]
      : current.filter(m => m !== moduleName);
    updateModules(employee._id, newModules, employee.employeeDetails?.fullName || employee.name, moduleName, isAdding);
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.employeeDetails?.fullName || emp.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.mobileNumber.includes(searchTerm) ||
    emp._id.includes(searchTerm)
  );

  const columns: GridColDef[] = [
    {
      field: '_id',
      headerName: 'EMPLOYEE ID',
      width: 220,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: 'employee',
      headerName: 'EMPLOYEE',
      width: 300,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        return (
          <div className="flex items-center justify-center h-full">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {emp.employeeDetails?.fullName || emp.name}
            </span>
          </div>
        );
      },
    },
    {
      field: 'email',
      headerName: 'EMAIL ID',
      width: 220,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: 'bookings',
      headerName: 'BOOKINGS',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('bookings')}
            onChange={() => toggleModule(params.row, 'bookings')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
    {
      field: 'support',
      headerName: 'SUPPORT',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('support')}
            onChange={() => toggleModule(params.row, 'support')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
    {
      field: 'drivers',
      headerName: 'DRIVERS',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('drivers')}
            onChange={() => toggleModule(params.row, 'drivers')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
    {
      field: 'employeesModule',
      headerName: 'EMPLOYEES',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('employees')}
            onChange={() => toggleModule(params.row, 'employees')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
    {
      field: 'customer',
      headerName: 'CUSTOMER',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('customer')}
            onChange={() => toggleModule(params.row, 'customer')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
    {
      field: 'vehicles',
      headerName: 'VEHICLES',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <ToggleSwitch
            checked={(params.row.employeeDetails?.modules || []).includes('vehicles')}
            onChange={() => toggleModule(params.row, 'vehicles')}
            disabled={saving[params.row._id]}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse transition-colors duration-300">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="h-6 w-56 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <div className="bg-white dark:bg-[#0A1128] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
            <div className="h-[56px] border-b border-slate-100 dark:border-slate-800 flex items-center px-6">
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
            </div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/30 flex items-center gap-6">
                <div className="h-4 w-12 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                <div className="h-4 flex-1 bg-slate-100/50 dark:bg-slate-800/20 rounded"></div>
                <div className="h-4 w-24 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
                <div className="h-4 w-40 bg-slate-50 dark:bg-slate-800/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-in fade-in slide-in-from-top-8 duration-300`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#0A1128] border-b border-slate-200 dark:border-slate-700 min-h-[calc(100vh-64px)] transition-colors duration-300">
        {/* Header Toolbar */}
        <div className="bg-[#f8f9fa] dark:bg-[#0A1128]/80 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md transition-colors">
          <div className="min-w-0">
            <h2 className="text-[13px] md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter md:tracking-tight truncate">
              Module Access<span className="text-black dark:text-white font-normal font-bold pl-1 pr-1 hidden sm:inline">({filteredEmployees.length})</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <button
              onClick={fetchEmployees}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <HiArrowPath className="text-sm" />
              Refresh
            </button>
          </div>
        </div>

        <CustomTable
          rows={filteredEmployees}
          columns={columns}
          getRowId={(row) => row._id}
          height="calc(100vh - 110px)"
          rowCount={filteredEmployees.length}
          onSearch={setSearchTerm}
        />
      </div>
    </div>
  );
}