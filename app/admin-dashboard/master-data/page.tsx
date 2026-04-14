'use client';

import { useState } from 'react';
import DriversTab from './DriversTab';
import VehiclesTab from './VehiclesTab';
import EmployeesTab from './EmployeesTab';

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('drivers');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Master Data</h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {['drivers', 'vehicles', 'employees'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'drivers' && <DriversTab />}
      {activeTab === 'vehicles' && <VehiclesTab />}
      {activeTab === 'employees' && <EmployeesTab />}
    </div>
  );
}