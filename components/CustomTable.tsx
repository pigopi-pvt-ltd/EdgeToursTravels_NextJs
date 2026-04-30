'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MUI-based table with SSR disabled to prevent
// the ":first-child" pseudo-class warnings during server-side rendering.
const CustomTableClient = dynamic(() => import('./CustomTableClient'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full animate-pulse bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Table...</div>
    </div>
  )
});

interface CustomTableProps {
  rows: any[];
  columns: any[];
  getRowId: (row: any) => string;
  height?: string | number;
  pageSize?: number;
  title?: string;
  rowCount?: number;
  [key: string]: any;
}

const CustomTable: React.FC<CustomTableProps> = (props) => {
  return <CustomTableClient {...props} />;
};

export default CustomTable;
