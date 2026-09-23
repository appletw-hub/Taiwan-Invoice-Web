import React, { useState } from 'react';
import { FileSpreadsheet, CheckSquare, Square, Download, X } from 'lucide-react';
import { INVOICE_COLUMNS } from '../utils/taxCalculator';
import { exportToExcel } from '../services/excel';

export default function ExportModal({ isOpen, onClose, invoices }) {
  const [selectedCols, setSelectedCols] = useState(
    INVOICE_COLUMNS.map((c) => c.id)
  );

  const defaultFileName = `發票明細核對表_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  const [fileName, setFileName] = useState(defaultFileName);

  if (!isOpen) return null;

  const toggleColumn = (id) => {
    if (selectedCols.includes(id)) {
      setSelectedCols(selectedCols.filter((c) => c !== id));
    } else {
      setSelectedCols([...selectedCols, id]);
    }
  };

  const selectAll = () => {
    setSelectedCols(INVOICE_COLUMNS.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedCols([]);
  };

  const handleExport = () => {
    try {
      exportToExcel(invoices, selectedCols, fileName || defaultFileName);
      onClose();
    } catch (err) {
      alert(err.message || '匯出失敗');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">自選核對項目匯出 EXCEL</h2>
              <p className="text-emerald-100 text-xs">勾選需要出現在報表中的欄位</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Excel 檔案名稱
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="自訂檔名"
              />
              <span className="ml-2 text-xs text-slate-400 font-mono">.xlsx</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                核對欄位勾選 ({selectedCols.length}/{INVOICE_COLUMNS.length})
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  全選
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:underline font-medium"
                >
                  全部取消
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-h-56 overflow-y-auto">
              {INVOICE_COLUMNS.map((col) => {
                const isChecked = selectedCols.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleColumn(col.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3.5 flex justify-end gap-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl font-medium transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={selectedCols.length === 0}
            className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>下載 EXCEL 報表</span>
          </button>
        </div>
      </div>
    </div>
  );
}
