'use client';

import { useEffect, useState } from 'react';
import FileUpload from '@/components/FileUpload';
import { getAuthToken } from '@/lib/auth';

// ✅ Fixed interface to include all backend fields
interface Vehicle {
  _id: string;
  cabNumber: string;
  tacNo: string;
  licenseNo: string;
  pollutionNo: string;
  gstNo: string;
  insuranceNo: string;
  modelName: string;
  expiryDate: string;
  yearOfMaking: number;
  status: string;
  vendor: {
    vendorName: string;
    mobile: string;
    gender: string;
    address: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    vendorProfilePhoto?: string;
    vendorAadharFront?: string;
    vendorAadharBack?: string;
    vendorPanImage?: string;
  };
}

interface VehicleFormData {
  cabNumber: string;
  tacNo: string;
  licenseNo: string;
  pollutionNo: string;
  gstNo: string;
  insuranceNo: string;
  modelName: string;
  expiryDate: string;
  yearOfMaking: string;
  status: string;
  vendor: {
    vendorName: string;
    mobile: string;
    gender: string;
    address: string;
    aadhar: string;
    dob: string;
    pan: string;
    email: string;
    vendorProfilePhoto: string;
    vendorAadharFront: string;
    vendorAadharBack: string;
    vendorPanImage: string;
  };
}

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    cabNumber: '', tacNo: '', licenseNo: '', pollutionNo: '', gstNo: '', insuranceNo: '',
    modelName: '', expiryDate: '', yearOfMaking: '', status: 'active',
    vendor: {
      vendorName: '', mobile: '', gender: '', address: '', aadhar: '', dob: '', pan: '', email: '',
      vendorProfilePhoto: '', vendorAadharFront: '', vendorAadharBack: '', vendorPanImage: ''
    }
  });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    try {
      const res = await fetch('/api/admin/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Handle both direct array or { vehicles: [...] }
        let vehiclesArray: Vehicle[] = [];
        if (Array.isArray(data)) {
          vehiclesArray = data;
        } else if (data.vehicles && Array.isArray(data.vehicles)) {
          vehiclesArray = data.vehicles;
        } else {
          vehiclesArray = [];
        }
        setVehicles(vehiclesArray);
      } else {
        setError(data.error || 'Failed to fetch vehicles');
        setVehicles([]);
      }
    } catch (err) {
      setError('Network error');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setFormData({
    cabNumber: '', tacNo: '', licenseNo: '', pollutionNo: '', gstNo: '', insuranceNo: '',
    modelName: '', expiryDate: '', yearOfMaking: '', status: 'active',
    vendor: {
      vendorName: '', mobile: '', gender: '', address: '', aadhar: '', dob: '', pan: '', email: '',
      vendorProfilePhoto: '', vendorAadharFront: '', vendorAadharBack: '', vendorPanImage: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    const url = editingId ? `/api/admin/vehicles/${editingId}` : '/api/admin/vehicles';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchVehicles();
        setShowForm(false);
        setEditingId(null);
        resetForm();
      } else {
        const err = await res.json();
        alert(err.error || 'Save failed');
      }
    } catch (err) {
      alert('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete vehicle?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const editVehicle = (vehicle: Vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      cabNumber: vehicle.cabNumber,
      tacNo: vehicle.tacNo,
      licenseNo: vehicle.licenseNo,
      pollutionNo: vehicle.pollutionNo,
      gstNo: vehicle.gstNo,
      insuranceNo: vehicle.insuranceNo,
      modelName: vehicle.modelName,
      expiryDate: vehicle.expiryDate ? new Date(vehicle.expiryDate).toISOString().split('T')[0] : '',
      yearOfMaking: vehicle.yearOfMaking?.toString() || '',
      status: vehicle.status,
      vendor: {
        vendorName: vehicle.vendor.vendorName,
        mobile: vehicle.vendor.mobile,
        gender: vehicle.vendor.gender,
        address: vehicle.vendor.address,
        aadhar: vehicle.vendor.aadhar,
        dob: vehicle.vendor.dob ? new Date(vehicle.vendor.dob).toISOString().split('T')[0] : '',
        pan: vehicle.vendor.pan,
        email: vehicle.vendor.email,
        vendorProfilePhoto: vehicle.vendor.vendorProfilePhoto || '',
        vendorAadharFront: vehicle.vendor.vendorAadharFront || '',
        vendorAadharBack: vehicle.vendor.vendorAadharBack || '',
        vendorPanImage: vehicle.vendor.vendorPanImage || '',
      }
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
        Add Vehicle
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 space-y-4 max-h-96 overflow-auto">
          <h3 className="font-bold">Cab Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Cab Number" value={formData.cabNumber} onChange={e => setFormData({...formData, cabNumber: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="RAC No" value={formData.tacNo} onChange={e => setFormData({...formData, tacNo: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="License No" value={formData.licenseNo} onChange={e => setFormData({...formData, licenseNo: e.target.value})} className="border p-2 rounded" required />
            <input placeholder=" PUC No" value={formData.pollutionNo} onChange={e => setFormData({...formData, pollutionNo: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="GST No" value={formData.gstNo} onChange={e => setFormData({...formData, gstNo: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Insurance No" value={formData.insuranceNo} onChange={e => setFormData({...formData, insuranceNo: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Model Name" value={formData.modelName} onChange={e => setFormData({...formData, modelName: e.target.value})} className="border p-2 rounded" required />
            <input type="date" placeholder="Expiry Date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="border p-2 rounded" required />
            <input placeholder="Year of Making" value={formData.yearOfMaking} onChange={e => setFormData({...formData, yearOfMaking: e.target.value})} className="border p-2 rounded" required />
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border p-2 rounded">
              <option>active</option><option>inactive</option><option>maintenance</option>
            </select>
          </div>

          <h3 className="font-bold mt-4">Vendor Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Vendor Name" value={formData.vendor.vendorName} onChange={e => setFormData({...formData, vendor: {...formData.vendor, vendorName: e.target.value}})} className="border p-2 rounded" required />
            <input placeholder="Mobile" value={formData.vendor.mobile} onChange={e => setFormData({...formData, vendor: {...formData.vendor, mobile: e.target.value}})} className="border p-2 rounded" required />
            <select value={formData.vendor.gender} onChange={e => setFormData({...formData, vendor: {...formData.vendor, gender: e.target.value}})} className="border p-2 rounded" required>
              <option value="">Gender</option><option>male</option><option>female</option><option>other</option>
            </select>
            <input placeholder="Address" value={formData.vendor.address} onChange={e => setFormData({...formData, vendor: {...formData.vendor, address: e.target.value}})} className="border p-2 rounded" required />
            <input placeholder="Aadhar" value={formData.vendor.aadhar} onChange={e => setFormData({...formData, vendor: {...formData.vendor, aadhar: e.target.value}})} className="border p-2 rounded" required />
            <input type="date" placeholder="DOB" value={formData.vendor.dob} onChange={e => setFormData({...formData, vendor: {...formData.vendor, dob: e.target.value}})} className="border p-2 rounded" required />
            <input placeholder="PAN" value={formData.vendor.pan} onChange={e => setFormData({...formData, vendor: {...formData.vendor, pan: e.target.value}})} className="border p-2 rounded" required />
            <input placeholder="Email" type="email" value={formData.vendor.email} onChange={e => setFormData({...formData, vendor: {...formData.vendor, email: e.target.value}})} className="border p-2 rounded" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FileUpload folder="vendors" label="Vendor Profile" onUpload={url => setFormData({...formData, vendor: {...formData.vendor, vendorProfilePhoto: url}})} existingUrl={formData.vendor.vendorProfilePhoto} />
            <FileUpload folder="vendors" label="Aadhar Front" onUpload={url => setFormData({...formData, vendor: {...formData.vendor, vendorAadharFront: url}})} existingUrl={formData.vendor.vendorAadharFront} />
            <FileUpload folder="vendors" label="Aadhar Back" onUpload={url => setFormData({...formData, vendor: {...formData.vendor, vendorAadharBack: url}})} existingUrl={formData.vendor.vendorAadharBack} />
            <FileUpload folder="vendors" label="PAN Image" onUpload={url => setFormData({...formData, vendor: {...formData.vendor, vendorPanImage: url}})} existingUrl={formData.vendor.vendorPanImage} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No vehicles found</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Cab Number</th>
              <th className="border p-2">Model</th>
              <th className="border p-2">Vendor</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle._id}>
                <td className="border p-2">{vehicle.cabNumber}</td>
                <td className="border p-2">{vehicle.modelName}</td>
                <td className="border p-2">{vehicle.vendor?.vendorName}</td>
                <td className="border p-2">{vehicle.status}</td>
                <td className="border p-2">
                  <button onClick={() => editVehicle(vehicle)} className="text-blue-500 mr-2">Edit</button>
                  <button onClick={() => handleDelete(vehicle._id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}