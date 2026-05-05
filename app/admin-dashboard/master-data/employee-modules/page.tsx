'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import CustomTable from '@/components/CustomTable';
import { GridColDef } from '@mui/x-data-grid';
import { HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

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
   <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
  </label>
);

export default function EmployeeModulesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        showToast('error', 'Failed to load employees');
      }
    } catch (err) {
      showToast('error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const updateModules = async (employeeId: string, modules: string[], employeeName: string, moduleName: string, isAdding: boolean) => {
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
        const action = isAdding ? 'granted' : 'revoked';
        window.alert(`✅ ${action} "${moduleName}" access for ${employeeName}`);
        showToast('success', 'Access updated successfully');
      } else {
        showToast('error', 'Update failed');
      }
    } catch (err) {
      showToast('error', 'Error saving');
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

  // Filter employees by name, email, mobile, or employee ID
  const filteredEmployees = employees.filter(emp =>
    (emp.employeeDetails?.fullName || emp.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.mobileNumber.includes(searchTerm) ||
    emp._id.includes(searchTerm)
  );

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'EMPLOYEE ID',
      width: 240,
      renderCell: (params) => {
        const emp = params.row;
        return (
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
            {emp._id}
          </span>
        );
      },
    },
    {
      field: 'employee',
      headerName: 'EMPLOYEE',
      flex: 1,
      minWidth: 240,
      renderCell: (params) => {
        const emp = params.row;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {emp.employeeDetails?.fullName || emp.name}
            </span>
            <span className="text-xs text-slate-500">
              {emp.email} | {emp.mobileNumber}
            </span>
          </div>
        );
      },
    },
    {
      field: 'bookings',
      headerName: 'BOOKINGS',
      width: 85,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('bookings')}
            onChange={() => toggleModule(emp, 'bookings')}
            disabled={isSaving}
          />
        );
      },
    },
    {
      field: 'support',
      headerName: 'SUPPORT',
      width: 85,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('support')}
            onChange={() => toggleModule(emp, 'support')}
            disabled={isSaving}
          />
        );
      },
    },
    {
      field: 'drivers',
      headerName: 'DRIVERS',
      width: 85,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('drivers')}
            onChange={() => toggleModule(emp, 'drivers')}
            disabled={isSaving}
          />
        );
      },
    },
    {
      field: 'employeesModule',
      headerName: 'EMPLOYEES',
      width: 95,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('employees')}
            onChange={() => toggleModule(emp, 'employees')}
            disabled={isSaving}
          />
        );
      },
    },
    {
      field: 'customer',
      headerName: 'CUSTOMER',
      width: 85,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('customer')}
            onChange={() => toggleModule(emp, 'customer')}
            disabled={isSaving}
          />
        );
      },
    },
    {
      field: 'vehicles',
      headerName: 'VEHICLES',
      width: 85,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const emp = params.row;
        const modules = emp.employeeDetails?.modules || [];
        const isSaving = saving[emp._id];
        return (
          <ToggleSwitch
            checked={modules.includes('vehicles')}
            onChange={() => toggleModule(emp, 'vehicles')}
            disabled={isSaving}
          />
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 animate-pulse">
        <div className="sticky top-16 h-[56px] z-30 bg-[#f8f9fa] dark:bg-slate-800/50 px-6 flex items-center border-b">
          <div className="h-6 w-56 bg-slate-200 rounded-md"></div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-4 sm:-mt-8 -mx-4 sm:-mx-8">
      {/* Floating Toast Notification  */}
      {toast && (
        <div className={`fixed top-6 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-white text-sm font-medium animate-in slide-in-from-right-5 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
        }`}>
          {toast.type === 'success' ? <HiOutlineCheckCircle className="w-4 h-4" /> : <HiOutlineXCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 min-h-[calc(100vh-64px)] border-b border-slate-200 dark:border-slate-800">
        {/* Header  */}
        <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-16 z-30">
          <h1 className="text-sm md:text-xl font-extrabold text-emerald-600 uppercase tracking-tighter">
            Employee Module Access
          </h1>
          <div className="text-sm text-slate-500">
            <HiOutlineUserGroup className="inline mr-1" /> {filteredEmployees.length} employees
          </div>
        </div>

        <div className="p-4 md:p-6">
          <CustomTable
            rows={filteredEmployees}
            columns={columns}
            getRowId={(row) => row._id}
            height="calc(100vh - 180px)"
            rowCount={filteredEmployees.length}
            onSearch={setSearchTerm}
          />
        </div>
      </div>
    </div>
  );
}