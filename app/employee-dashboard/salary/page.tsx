'use client';

import { useRef, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  label: string;
  amount: number;
}

interface SalaryData {
  month: string;
  employeeName: string;
  employeeId: string;
  department?: string;
  earnings: LineItem[];
  deductions: LineItem[];
  netPayable: number;
}

// ─── Static data (replace with API fetch as needed) ───────────────────────────

const salaryData: SalaryData = {
  month: 'April 2026',
  employeeName: 'Sachin Bodare',
  employeeId: 'EMP-001',
  department: 'Full-time employee',
  earnings: [
    { label: 'Basic salary', amount: 25000 },
    { label: 'House rent allowance', amount: 5000 },
    { label: 'Other allowances', amount: 3000 },
  ],
  deductions: [
    { label: 'Provident fund', amount: 1800 },
    { label: 'Professional tax', amount: 200 },
    { label: 'Income tax (TDS)', amount: 0 },
  ],
  netPayable: 33000,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inr(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');
}

function sum(items: LineItem[]) {
  return items.reduce((acc, i) => acc + i.amount, 0);
}

// ─── Counter ──────────────────────────────────────────────────────────────────

function Counter({ target, duration = 900 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <span className="tabular-nums font-bold">{inr(value)}</span>;
}

// ─── Horizontal bar ───────────────────────────────────────────────────────────

function BarRow({
  label,
  amount,
  max,
  color,
}: {
  label: string;
  amount: number;
  max: number;
  color: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.round((amount / max) * 100)), 80);
    return () => clearTimeout(t);
  }, [amount, max]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-[112px] flex-shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-16 text-right flex-shrink-0">
        {inr(amount)}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SalaryPage() {
  const totalEarnings = sum(salaryData.earnings);
  const totalDeductions = sum(salaryData.deductions);
  const barMax = Math.max(...salaryData.earnings.map((e) => e.amount));

  const downloadPDF = () => window.print();

  const barItems = [
    ...salaryData.earnings.map((e) => ({ label: e.label, amount: e.amount, color: '#1D9E75' })),
    ...salaryData.deductions
      .filter((d) => d.amount > 0)
      .map((d) => ({ label: d.label, amount: d.amount, color: '#E24B4A' })),
  ];

  return (
    <div className="space-y-6">
      {/* Header Toolbar - Admin Dashboard Style (Single Line) */}
      <div className="bg-[#f8f9fa] dark:bg-slate-800/50 py-2.5 md:py-2 px-4 md:px-6 flex flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 min-h-[56px] sticky top-16 z-30 backdrop-blur-md -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 mb-8 transition-all">
        <div className="min-w-0 flex items-center gap-2">
          <h2 className="text-[14px] md:text-xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight truncate">
            Salary
          </h2>
          <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest border-l border-slate-300 dark:border-slate-600 pl-2">
            Payslip
          </span>
        </div>

        <button
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-sm transition-all shadow-sm active:scale-95 flex items-center gap-1.5 print:hidden"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>

      {/* Slip card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">

        {/* Slip header – bolder, larger text */}
        <div className="grid grid-cols-[1fr_auto] gap-4 items-start px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-base font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
              {initials(salaryData.employeeName)}
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-white">
                {salaryData.employeeName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {salaryData.employeeId}
                {salaryData.department ? ` · ${salaryData.department}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net payable
            </p>
            <p className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-1">
              <Counter target={salaryData.netPayable} />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{salaryData.month}</p>
          </div>
        </div>

        {/* Earnings & Deductions – bolder rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700 border-b border-slate-100 dark:border-slate-700">
          {/* Earnings column */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Earnings
              </span>
            </div>

            <div className="space-y-0">
              {salaryData.earnings.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {inr(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {inr(totalEarnings)}
              </span>
            </div>
          </div>

          {/* Deductions column */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Deductions
              </span>
            </div>

            <div className="space-y-0">
              {salaryData.deductions.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {inr(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Total</span>
              <span className="text-base font-bold text-rose-500 dark:text-rose-400">
                {inr(totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown bars – bolder labels */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Salary breakdown
            </span>
          </div>

          {barItems.map((b, i) => (
            <BarRow key={i} label={b.label} amount={b.amount} max={barMax} color={b.color} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Computer-generated payslip — no signature required
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          button { display: none !important; }
          .dark\\:bg-slate-800 { background: white !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}