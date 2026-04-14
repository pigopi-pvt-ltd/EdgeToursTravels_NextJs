'use client';

import { useEffect, useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { getAuthToken } from '@/lib/auth';

interface Employee {
  _id: string;
  employeeDetails: {
    fullName: string;
    mobile: string;
    gender: string;
    presentAddress: string;
    permanentAddress: string;
    alternateMobile?: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    yearsOfExperience: number;
    highestQualification: string;
    previousExperience?: string;
    profilePhoto?: string;
    aadharFront?: string;
    aadharBack?: string;
    panImage?: string;
  };
}

interface EmployeeFormData {
  fullName: string;
  mobile: string;
  gender: string;
  presentAddress: string;
  permanentAddress: string;
  alternateMobile: string;
  aadhar: string;
  dob: string;
  pan: string;
  email: string;
  yearsOfExperience: string;
  highestQualification: string;
  previousExperience: string;
  profilePhoto: string;
  aadharFront: string;
  aadharBack: string;
  panImage: string;
}

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '', mobile: '', gender: '', presentAddress: '', permanentAddress: '',
    alternateMobile: '', aadhar: '', dob: '', pan: '', email: '',
    yearsOfExperience: '', highestQualification: '', previousExperience: '',
    profilePhoto: '', aadharFront: '', aadharBack: '', panImage: ''
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Handle both direct array or { employees: [...] } or { data: [...] }
        let employeesArray: Employee[] = [];
        if (Array.isArray(data)) {
          employeesArray = data;
        } else if (data.employees && Array.isArray(data.employees)) {
          employeesArray = data.employees;
        } else if (data.data && Array.isArray(data.data)) {
          employeesArray = data.data;
        } else {
          employeesArray = [];
        }
        setEmployees(employeesArray);
      } else {
        setError(data.error || 'Failed to fetch employees');
        setEmployees([]);
      }
    } catch (err) {
      setError('Network error');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const url = editingId ? `/api/admin/employees/${editingId}` : '/api/admin/employees';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchEmployees();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          fullName: '', mobile: '', gender: '', presentAddress: '', permanentAddress: '',
          alternateMobile: '', aadhar: '', dob: '', pan: '', email: '',
          yearsOfExperience: '', highestQualification: '', previousExperience: '',
          profilePhoto: '', aadharFront: '', aadharBack: '', panImage: ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Save failed');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete employee?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const editEmployee = (emp: Employee) => {
    setEditingId(emp._id);
    setFormData({
      fullName: emp.employeeDetails.fullName,
      mobile: emp.employeeDetails.mobile,
      gender: emp.employeeDetails.gender,
      presentAddress: emp.employeeDetails.presentAddress,
      permanentAddress: emp.employeeDetails.permanentAddress,
      alternateMobile: emp.employeeDetails.alternateMobile || '',
      aadhar: emp.employeeDetails.aadhar,
      dob: emp.employeeDetails.dob ? new Date(emp.employeeDetails.dob).toISOString().split('T')[0] : '',
      pan: emp.employeeDetails.pan,
      email: emp.employeeDetails.email,
      yearsOfExperience: emp.employeeDetails.yearsOfExperience?.toString() || '',
      highestQualification: emp.employeeDetails.highestQualification || '',
      previousExperience: emp.employeeDetails.previousExperience || '',
      profilePhoto: emp.employeeDetails.profilePhoto || '',
      aadharFront: emp.employeeDetails.aadharFront || '',
      aadharBack: emp.employeeDetails.aadharBack || '',
      panImage: emp.employeeDetails.panImage || '',
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white px-4 py-2 rounded mb-4 hover:bg-orange-600 transition">
        Add Employee
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4 max-h-96 overflow-auto">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="border p-2 rounded" required />
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="border p-2 rounded" required>
              <option value="">Gender</option><option>male</option><option>female</option><option>other</option>
            </select>
            <input placeholder="Present Address" value={formData.presentAddress} onChange={e => setFormData({...formData, presentAddress: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Permanent Address" value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Alternate Mobile" value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} className="border p-2 rounded" />
            <input placeholder="Aadhar" value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} className="border p-2 rounded" required />
            <input type="date" placeholder="DOB" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="PAN" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Years of Experience" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Highest Qualification" value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Previous Experience (optional)" value={formData.previousExperience} onChange={e => setFormData({...formData, previousExperience: e.target.value})} className="border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUpload folder="employees" label="Profile Photo" onUpload={url => setFormData({...formData, profilePhoto: url})} existingUrl={formData.profilePhoto} />
            <FileUpload folder="employees" label="Aadhar Front" onUpload={url => setFormData({...formData, aadharFront: url})} existingUrl={formData.aadharFront} />
            <FileUpload folder="employees" label="Aadhar Back" onUpload={url => setFormData({...formData, aadharBack: url})} existingUrl={formData.aadharBack} />
            <FileUpload folder="employees" label="PAN Image" onUpload={url => setFormData({...formData, panImage: url})} existingUrl={formData.panImage} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      {employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No employees found</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Experience</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp._id}>
                <td className="border p-2">{emp.employeeDetails?.fullName}</td>
                <td className="border p-2">{emp.employeeDetails?.mobile}</td>
                <td className="border p-2">{emp.employeeDetails?.email}</td>
                <td className="border p-2">{emp.employeeDetails?.yearsOfExperience} yrs</td>
                <td className="border p-2">
                  <button onClick={() => editEmployee(emp)} className="text-blue-500 mr-2">Edit</button>
                  <button onClick={() => handleDelete(emp._id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}