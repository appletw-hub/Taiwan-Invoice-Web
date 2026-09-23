import React from 'react';
import { Receipt, Coins, Calculator, Layers } from 'lucide-react';

export default function SummaryCards({ invoices = [] }) {
  const totalCount = invoices.length;
  const totalSales = invoices.reduce((sum, inv) => sum + (parseInt(inv.salesAmount, 10) || 0), 0);
  const totalTax = invoices.reduce((sum, inv) => sum + (parseInt(inv.taxAmount, 10) || 0), 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + (parseInt(inv.totalAmount, 10) || 0), 0);

  const taxableCount = invoices.filter((i) => !i.taxType || i.taxType === 'taxable').length;
  const zeroRatedCount = invoices.filter((i) => i.taxType === 'zero_rated').length;
  const exemptCount = invoices.filter((i) => i.taxType === 'exempt').length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(amount);
  };

  if (totalCount === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">發票總張數</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCount} <span className="text-xs font-normal text-slate-500">張</span></div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            應稅 {taxableCount} | 零稅率 {zeroRatedCount} | 免稅 {exemptCount}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">銷售額總計 (未稅)</div>
          <div className="text-2xl font-black text-indigo-950 mt-0.5">{formatCurrency(totalSales)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">不含營業稅之銷售淨額</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">稅額總計 (5% 營業稅)</div>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{formatCurrency(totalTax)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">可申報扣抵進項稅額</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-medium text-blue-800">發票總金額 (含稅)</div>
          <div className="text-2xl font-black text-blue-950 mt-0.5">{formatCurrency(totalAmount)}</div>
          <div className="text-[11px] text-blue-700/80 mt-0.5">應收/應付之帳單總額</div>
        </div>
      </div>
    </div>
  );
}
