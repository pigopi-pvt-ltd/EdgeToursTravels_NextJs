// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getStoredUser, clearAuthData } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ email: '', mobileNumber: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'admin') {
      router.push('/login');
    } else {
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    const token = getAuthToken();
    const res = await fetch('/api/admin/employees', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setEmployees(data.employees);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = getAuthToken();
    const res = await fetch('/api/admin/create-employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEmployee),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Employee created! Temporary password: ${data.temporaryPassword}`);
      setNewEmployee({ email: '', mobileNumber: '', name: '' });
      fetchEmployees();
    } else {
      setMessage(`Error: ${data.error}`);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">Create New Employee</h2>
        <form onSubmit={handleCreateEmployee} className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Mobile Number (10 digits)"
            required
            value={newEmployee.mobileNumber}
            onChange={(e) => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Employee List</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp: any) => (
              <tr key={emp._id} className="border-b">
                <td className="p-2">{emp.name || '-'}</td>
                <td className="p-2">{emp.email}</td>
                <td className="p-2">{emp.mobileNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}