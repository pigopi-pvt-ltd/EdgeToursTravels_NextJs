'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MUI-based table with SSR disabled and use NoSsr 
// to prevent the ":first-child" pseudo-class warnings during server-side rendering.
const CustomTableClient = dynamic(() => import('./CustomTableClient'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full animate-pulse bg-white dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-[400px]">
      <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Initializing Table Architecture...</div>
      </div>
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
