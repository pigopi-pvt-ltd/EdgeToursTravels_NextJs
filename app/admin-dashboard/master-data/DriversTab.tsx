'use client';

import { useEffect, useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { getAuthToken } from '@/lib/auth';

interface Driver {
  _id: string;
  driverDetails: any;
}

export default function DriversTab() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '', mobile: '', gender: '', presentAddress: '', permanentAddress: '',
    alternateMobile: '', aadhar: '', dob: '', pan: '', email: '', drivingLicense: '',
    yearsOfExperience: '', highestQualification: '',
    profilePhoto: '', aadharFront: '', aadharBack: '', panImage: '', licenseImage: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/drivers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Handle both direct array or { drivers: [...] } or { employees: [...] }
        let driversArray: Driver[] = [];
        if (Array.isArray(data)) {
          driversArray = data;
        } else if (data.drivers && Array.isArray(data.drivers)) {
          driversArray = data.drivers;
        } else if (data.employees && Array.isArray(data.employees)) {
          // Some APIs return employees for drivers
          driversArray = data.employees.filter((u: any) => u.role === 'driver');
        } else {
          driversArray = [];
        }
        setDrivers(driversArray);
      } else {
        setError(data.error || 'Failed to fetch drivers');
        setDrivers([]);
      }
    } catch (err) {
      setError('Network error');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const url = editingId ? `/api/admin/drivers/${editingId}` : '/api/admin/drivers';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchDrivers();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          fullName: '', mobile: '', gender: '', presentAddress: '', permanentAddress: '',
          alternateMobile: '', aadhar: '', dob: '', pan: '', email: '', drivingLicense: '',
          yearsOfExperience: '', highestQualification: '',
          profilePhoto: '', aadharFront: '', aadharBack: '', panImage: '', licenseImage: ''
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
    if (!confirm('Delete this driver?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDrivers();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const editDriver = (driver: Driver) => {
    setEditingId(driver._id);
    setFormData(driver.driverDetails);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="bg-orange-500 text-white px-4 py-2 rounded mb-4 hover:bg-orange-600 transition"
      >
        Add Driver
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
            <input type="date" placeholder="DOB" value={formData.dob?.split('T')[0]} onChange={e => setFormData({...formData, dob: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="PAN" value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Driving License" value={formData.drivingLicense} onChange={e => setFormData({...formData, drivingLicense: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Years of Experience" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Highest Qualification" value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} className="border p-2 rounded" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FileUpload folder="drivers" label="Profile Photo" onUpload={url => setFormData({...formData, profilePhoto: url})} existingUrl={formData.profilePhoto} />
            <FileUpload folder="drivers" label="Aadhar Front" onUpload={url => setFormData({...formData, aadharFront: url})} existingUrl={formData.aadharFront} />
            <FileUpload folder="drivers" label="Aadhar Back" onUpload={url => setFormData({...formData, aadharBack: url})} existingUrl={formData.aadharBack} />
            <FileUpload folder="drivers" label="PAN Image" onUpload={url => setFormData({...formData, panImage: url})} existingUrl={formData.panImage} />
            <FileUpload folder="drivers" label="License Image" onUpload={url => setFormData({...formData, licenseImage: url})} existingUrl={formData.licenseImage} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      {drivers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No drivers found</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">License</th>
              <th className="border p-2">KYC Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver._id}>
                <td className="border p-2">{driver.driverDetails?.fullName}</td>
                <td className="border p-2">{driver.driverDetails?.mobile}</td>
                <td className="border p-2">{driver.driverDetails?.drivingLicense}</td>
                <td className="border p-2">{driver.driverDetails?.kycStatus}</td>
                <td className="border p-2">
                  <button onClick={() => editDriver(driver)} className="text-blue-500 mr-2">Edit</button>
                  <button onClick={() => handleDelete(driver._id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}