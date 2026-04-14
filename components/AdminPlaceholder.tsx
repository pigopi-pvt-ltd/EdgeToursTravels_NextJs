'use client';

import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function AdminPlaceholder({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6 transition-colors">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse">
          ?
        </div>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto transition-colors">
        {description || `The ${title} management system is currently under development. Check back soon for updates on our professional tools.`}
      </p>
      <div className="mt-8 flex gap-4">
        <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
          <div className="h-full bg-orange-500 w-1/3 animate-[loading_2s_infinite]"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
