import React, { useState } from 'react';
import { Plus, Trash2, Calendar, FileSpreadsheet, RefreshCw, CheckCircle2 } from 'lucide-react';
import { VOUCHER_FORMATS, TAX_TYPES, calculateFromSales, calculateFromTotal } from '../utils/taxCalculator';

export default function InvoiceTable({
  invoices,
  onUpdateInvoice,
  onDeleteInvoice,
  onAddInvoice,
  onClearAll,
  onOpenExportModal,
}) {
  const [batchMonth, setBatchMonth] = useState('');
  const [batchSettlementDate, setBatchSettlementDate] = useState('');

  const handleFieldChange = (index, field, value) => {
    const invoice = { ...invoices[index] };
    const currentTaxType = invoice.taxType || 'taxable';

    if (field === 'taxType') {
      invoice.taxType = value;
      const reCalc = calculateFromSales(invoice.salesAmount, value);
      invoice.taxAmount = reCalc.taxAmount;
      invoice.totalAmount = reCalc.totalAmount;
    } else if (field === 'salesAmount') {
      const reCalc = calculateFromSales(value, currentTaxType);
      invoice.salesAmount = reCalc.salesAmount;
      invoice.taxAmount = reCalc.taxAmount;
      invoice.totalAmount = reCalc.totalAmount;
    } else if (field === 'totalAmount') {
      const reCalc = calculateFromTotal(value, currentTaxType);
      invoice.salesAmount = reCalc.salesAmount;
      invoice.taxAmount = reCalc.taxAmount;
      invoice.totalAmount = reCalc.totalAmount;
    } else {
      invoice[field] = value;
    }

    onUpdateInvoice(index, invoice);
  };

  const applyBatchMonth = () => {
    if (!batchMonth) return;
    invoices.forEach((_, idx) => {
      handleFieldChange(idx, 'paymentMonth', batchMonth);
    });
  };

  const applyBatchSettlementDate = () => {
    if (!batchSettlementDate) return;
    invoices.forEach((_, idx) => {
      handleFieldChange(idx, 'settlementDate', batchSettlementDate);
    });
  };

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-0">
      {/* 頂部操作工具列 */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">
            發票核對清單 ({invoices.length} 筆)
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            （可直接點擊表格欄位即時編輯修訂）
          </span>
        </div>

        {/* 批次填寫與動作按鈕 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-medium">批次月份:</span>
            <input
              type="text"
              placeholder="YYYY-MM"
              value={batchMonth}
              onChange={(e) => setBatchMonth(e.target.value)}
              className="w-20 px-1 py-0.5 border-b border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={applyBatchMonth}
              className="text-blue-600 hover:text-blue-700 font-semibold px-1"
            >
              套用
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-medium">批次付款日:</span>
            <input
              type="date"
              value={batchSettlementDate}
              onChange={(e) => setBatchSettlementDate(e.target.value)}
              className="px-1 py-0.5 border-b border-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={applyBatchSettlementDate}
              className="text-blue-600 hover:text-blue-700 font-semibold px-1"
            >
              套用
            </button>
          </div>

          <button
            onClick={onAddInvoice}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增一筆</span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空全部</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm shadow-emerald-500/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>自選核對欄位匯出 EXCEL</span>
          </button>
        </div>
      </div>

      {/* 資料表格 */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="p-2.5 text-center w-10">#</th>
              <th className="p-2.5 min-w-[130px]">廠商名稱</th>
              <th className="p-2.5 min-w-[95px]">統一編號</th>
              <th className="p-2.5 min-w-[85px]">貨款月份</th>
              <th className="p-2.5 min-w-[140px]">憑證格式</th>
              <th className="p-2.5 min-w-[110px]">發票日期</th>
              <th className="p-2.5 min-w-[120px]">發票號碼</th>
              <th className="p-2.5 min-w-[100px]">稅別標籤</th>
              <th className="p-2.5 min-w-[95px] text-right">銷售額(未稅)</th>
              <th className="p-2.5 min-w-[85px] text-right">稅額(5%)</th>
              <th className="p-2.5 min-w-[100px] text-right">發票金額(含稅)</th>
              <th className="p-2.5 min-w-[180px]">品項內容</th>
              <th className="p-2.5 min-w-[110px]">收付款日</th>
              <th className="p-2.5 min-w-[120px]">備註</th>
              <th className="p-2.5 text-center w-12 sticky right-0 bg-slate-100">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv, idx) => (
              <tr key={idx} className="hover:bg-blue-50/40 transition group">
                <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>

                {/* 廠商名稱 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    value={inv.vendorName || ''}
                    onChange={(e) => handleFieldChange(idx, 'vendorName', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs"
                    placeholder="廠商名稱"
                  />
                </td>

                {/* 統一編號 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    maxLength={8}
                    value={inv.taxId || ''}
                    onChange={(e) => handleFieldChange(idx, 'taxId', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono"
                    placeholder="8碼統編"
                  />
                </td>

                {/* 貨款月份 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    value={inv.paymentMonth || ''}
                    onChange={(e) => handleFieldChange(idx, 'paymentMonth', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono"
                    placeholder="YYYY-MM"
                  />
                </td>

                {/* 憑證格式代碼選單 */}
                <td className="p-1.5">
                  <select
                    value={inv.voucherFormat || '25'}
                    onChange={(e) => handleFieldChange(idx, 'voucherFormat', e.target.value)}
                    className="w-full px-1.5 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs"
                  >
                    {VOUCHER_FORMATS.map((vf) => (
                      <option key={vf.code} value={vf.code}>
                        {vf.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* 發票日期 */}
                <td className="p-1.5">
                  <input
                    type="date"
                    value={inv.invoiceDate || ''}
                    onChange={(e) => handleFieldChange(idx, 'invoiceDate', e.target.value)}
                    className="w-full px-1.5 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono"
                  />
                </td>

                {/* 發票號碼 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    value={inv.invoiceNumber || ''}
                    onChange={(e) => handleFieldChange(idx, 'invoiceNumber', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono font-medium text-blue-900"
                    placeholder="AB-12345678"
                  />
                </td>

                {/* 稅別標籤切換 */}
                <td className="p-1.5">
                  <select
                    value={inv.taxType || 'taxable'}
                    onChange={(e) => handleFieldChange(idx, 'taxType', e.target.value)}
                    className={`w-full px-1.5 py-1 rounded text-[11px] font-semibold border ${
                      (inv.taxType || 'taxable') === 'taxable'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : inv.taxType === 'zero_rated'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {TAX_TYPES.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* 銷售額 (未稅) */}
                <td className="p-1.5">
                  <input
                    type="number"
                    value={inv.salesAmount ?? ''}
                    onChange={(e) => handleFieldChange(idx, 'salesAmount', e.target.value)}
                    className="w-full px-2 py-1 text-right border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono font-semibold text-slate-800"
                  />
                </td>

                {/* 稅額 (5%) */}
                <td className="p-1.5">
                  <input
                    type="number"
                    value={inv.taxAmount ?? ''}
                    onChange={(e) => handleFieldChange(idx, 'taxAmount', e.target.value)}
                    className="w-full px-2 py-1 text-right border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono text-emerald-700 font-semibold"
                  />
                </td>

                {/* 發票金額 (含稅總額) */}
                <td className="p-1.5">
                  <input
                    type="number"
                    value={inv.totalAmount ?? ''}
                    onChange={(e) => handleFieldChange(idx, 'totalAmount', e.target.value)}
                    className="w-full px-2 py-1 text-right border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono font-black text-indigo-900"
                  />
                </td>

                {/* 品項內容 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    value={inv.itemsDescription || ''}
                    onChange={(e) => handleFieldChange(idx, 'itemsDescription', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs"
                    placeholder="品項與規格明細"
                  />
                </td>

                {/* 收付款日 */}
                <td className="p-1.5">
                  <input
                    type="date"
                    value={inv.settlementDate || ''}
                    onChange={(e) => handleFieldChange(idx, 'settlementDate', e.target.value)}
                    className="w-full px-1.5 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs font-mono"
                  />
                </td>

                {/* 備註 */}
                <td className="p-1.5">
                  <input
                    type="text"
                    value={inv.remarks || ''}
                    onChange={(e) => handleFieldChange(idx, 'remarks', e.target.value)}
                    className="w-full px-2 py-1 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white text-xs"
                    placeholder="備註資訊"
                  />
                </td>

                {/* 刪除按鈕 */}
                <td className="p-1.5 text-center sticky right-0 bg-white group-hover:bg-blue-50/40">
                  <button
                    onClick={() => onDeleteInvoice(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    title="刪除此筆"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
