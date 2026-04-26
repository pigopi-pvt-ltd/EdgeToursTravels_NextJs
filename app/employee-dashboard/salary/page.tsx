export default function SalaryPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Salary Details</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-6">
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Basic Salary</span>
            <span>₹25,000</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">HRA</span>
            <span>₹5,000</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Other Allowances</span>
            <span>₹3,000</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-bold">Total (Monthly)</span>
            <span className="font-bold text-emerald-600">₹33,000</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">Last updated: April 2026</p>
      </div>
    </div>
  );
}