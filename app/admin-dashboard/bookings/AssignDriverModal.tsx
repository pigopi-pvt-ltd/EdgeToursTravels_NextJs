
'use client';

import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';

interface Driver {
  _id: string;
  name: string;
  mobileNumber: string;
  driverDetails?: {
    availabilityStatus?: 'available' | 'unavailable';
  };
  isAvailable?: boolean;
}

interface Vehicle {
  _id: string;
  cabNumber: string;
  modelName: string;
  isAvailable: boolean;
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverId: string, vehicleId: string) => void;
  drivers: Driver[];
  vehicles: Vehicle[];
  isLoading: boolean;
}

export default function AssignDriverModal({ isOpen, onClose, onAssign, drivers, vehicles, isLoading }: AssignDriverModalProps) {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);

  // Filter only available drivers (not on active trip)
  const availableDrivers = drivers.filter(driver => 
    driver.isAvailable === true || 
    driver.driverDetails?.availabilityStatus === 'available' || 
    (driver.isAvailable === undefined && !driver.driverDetails?.availabilityStatus)
  );

  // Filter only available vehicles
  const availableVehicles = vehicles.filter(vehicle => vehicle.isAvailable === true);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDriver('');
      setSelectedVehicle('');
      setDriverSearch('');
      setVehicleSearch('');
      setDriverDropdownOpen(false);
      setVehicleDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDrivers = availableDrivers.filter(d => 
    d.name?.toLowerCase().includes(driverSearch.toLowerCase()) || 
    d.mobileNumber?.includes(driverSearch)
  );

  const filteredVehicles = availableVehicles.filter(v => 
    v.cabNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) || 
    v.modelName.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedDriver) {
      onAssign(selectedDriver, selectedVehicle);
      setSelectedDriver('');
      setSelectedVehicle('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-[6px] p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800/80" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Driver & Vehicle</h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              OTP will be auto-generated | Available: {availableDrivers.length} drivers, {availableVehicles.length} vehicles
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-visible flex-1">
          {/* Driver Selection */}
          <div className="space-y-2 relative">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Driver <span className="text-rose-500">*</span>
              <span className="text-slate-400 text-[10px] ml-2">({availableDrivers.length} available)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={selectedDriver ? availableDrivers.find(d => d._id === selectedDriver)?.name : "Search & select driver..."}
                value={driverSearch}
                onFocus={() => setDriverDropdownOpen(true)}
                onChange={(e) => { setDriverSearch(e.target.value); setDriverDropdownOpen(true); }}
                className="w-full border rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className={`w-4 h-4 transition-transform duration-300 ${driverDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {driverDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => { setDriverDropdownOpen(false); setDriverSearch(""); }} />
                <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-slate-800 border rounded-xl shadow-lg overflow-hidden max-h-56">
                  <div className="overflow-y-auto">
                    {filteredDrivers.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-center text-slate-400">
                        {availableDrivers.length === 0 ? "No drivers available. All drivers are on trips." : "No drivers found matching search"}
                      </div>
                    ) : (
                      filteredDrivers.map(d => (
                        <button
                          key={d._id}
                          onClick={() => { setSelectedDriver(d._id); setDriverDropdownOpen(false); setDriverSearch(''); }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex justify-between items-center ${selectedDriver === d._id ? 'bg-indigo-50 text-indigo-600' : ''}`}
                        >
                          <div>
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-slate-400">{d.mobileNumber}</div>
                          </div>
                          {selectedDriver === d._id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2 relative">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Vehicle <span className="text-slate-400 font-normal">(Optional)</span>
              <span className="text-slate-400 text-[10px] ml-2">({availableVehicles.length} available)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={selectedVehicle ? availableVehicles.find(v => v._id === selectedVehicle)?.cabNumber : "Search & select vehicle..."}
                value={vehicleSearch}
                onFocus={() => setVehicleDropdownOpen(true)}
                onChange={(e) => { setVehicleSearch(e.target.value); setVehicleDropdownOpen(true); }}
                className="w-full border rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className={`w-4 h-4 transition-transform duration-300 ${vehicleDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {vehicleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => { setVehicleDropdownOpen(false); setVehicleSearch(""); }} />
                <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-slate-800 border rounded-xl shadow-lg overflow-hidden max-h-56">
                  <div className="overflow-y-auto">
                    {filteredVehicles.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-center text-slate-400">
                        {availableVehicles.length === 0 ? "No vehicles available. All vehicles are on trips." : "No vehicles found matching search"}
                      </div>
                    ) : (
                      filteredVehicles.map(v => (
                        <button
                          key={v._id}
                          onClick={() => { setSelectedVehicle(v._id); setVehicleDropdownOpen(false); setVehicleSearch(''); }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex justify-between items-center ${selectedVehicle === v._id ? 'bg-indigo-50 text-indigo-600' : ''}`}
                        >
                          <div>
                            <div className="font-mono text-sm font-bold">{v.cabNumber}</div>
                            <div className="text-xs text-slate-400">{v.modelName}</div>
                          </div>
                          {selectedVehicle === v._id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Warning when no resources available */}
          {(availableDrivers.length === 0 || availableVehicles.length === 0) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {availableDrivers.length === 0 && availableVehicles.length === 0 
                  ? "⚠️ No drivers or vehicles available at the moment. Please try again later."
                  : availableDrivers.length === 0 
                    ? "⚠️ No drivers available. All drivers are currently on trips."
                    : "⚠️ No vehicles available. All vehicles are currently on trips."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50/50">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold border rounded-xl">Cancel</button>
          <button 
            onClick={handleAssign} 
            disabled={!selectedDriver || isLoading || availableDrivers.length === 0} 
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}