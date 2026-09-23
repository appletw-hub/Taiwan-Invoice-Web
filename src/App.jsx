import React, { useState, useEffect } from 'react';
import { Key, Receipt, FileText, Sparkles, HelpCircle, AlertCircle, CheckCircle, Database } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import InvoiceTable from './components/InvoiceTable';
import ApiKeyModal from './components/ApiKeyModal';
import ExportModal from './components/ExportModal';
import { parseInvoicesFromPdf } from './services/gemini';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState(() => {
    const m = localStorage.getItem('gemini_model');
    return (!m || m === 'gemini-2.5-flash' || m === 'gemini-2.0-flash') ? 'gemini-3.1-flash-lite' : m;
  });
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('invoices_draft');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // 自動保存草稿到本機
  useEffect(() => {
    localStorage.setItem('invoices_draft', JSON.stringify(invoices));
  }, [invoices]);

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('gemini_api_key', newKey);
    showNotify('API Key 已儲存至瀏覽器本機！');
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('gemini_model', model);
  };

  // 處理上傳 PDF 解析
  const handleFileSelect = async (file) => {
    if (!apiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result;
          const base64 = res.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const parsedList = await parseInvoicesFromPdf(base64Data, apiKey, selectedModel);
      if (parsedList.length === 0) {
        showNotify('未在檔案中辨識出有效發票，請檢查 PDF 內容', 'error');
      } else {
        setInvoices((prev) => [...prev, ...parsedList]);
        showNotify(`成功辨識並匯入 ${parsedList.length} 張發票資訊！`);
      }
    } catch (err) {
      console.error(err);
      showNotify(err.message || '辨識失敗，請檢查 API Key 或檔案', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateInvoice = (index, updated) => {
    const list = [...invoices];
    list[index] = updated;
    setInvoices(list);
  };

  const handleDeleteInvoice = (index) => {
    setInvoices(invoices.filter((_, i) => i !== index));
    showNotify('已刪除該筆資料');
  };

  const handleAddInvoice = () => {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const newInvoice = {
      vendorName: '',
      taxId: '',
      paymentMonth: month,
      voucherFormat: '25',
      invoiceDate: today,
      invoiceNumber: '',
      taxType: 'taxable',
      salesAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      itemsDescription: '',
      settlementDate: '',
      remarks: '',
    };
    setInvoices([newInvoice, ...invoices]);
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空目前列表中的所有發票資料嗎？')) {
      setInvoices([]);
      showNotify('已清空所有發票資料');
    }
  };

  // 載入測試範例資料
  const loadDemoData = () => {
    const demo = [
      {
        vendorName: '聯發資訊工程有限公司',
        taxId: '28475931',
        paymentMonth: '2026-09',
        voucherFormat: '25',
        invoiceDate: '2026-09-12',
        invoiceNumber: 'QD-78921453',
        taxType: 'taxable',
        salesAmount: 18500,
        taxAmount: 925,
        totalAmount: 19425,
        itemsDescription: '伺服器維護與網路佈線工程 x1',
        settlementDate: '2026-09-30',
        remarks: '9月份定期合約款',
      },
      {
        vendorName: '宏達文具辦公用品商行',
        taxId: '54821639',
        paymentMonth: '2026-09',
        voucherFormat: '21',
        invoiceDate: '2026-09-15',
        invoiceNumber: 'QD-88124930',
        taxType: 'taxable',
        salesAmount: 3200,
        taxAmount: 160,
        totalAmount: 3360,
        itemsDescription: 'Double A 影印紙 10包; 碳粉匣 1組',
        settlementDate: '2026-09-25',
        remarks: '行政消耗品',
      },
      {
        vendorName: '台灣農產運銷合作社',
        taxId: '10482934',
        paymentMonth: '2026-09',
        voucherFormat: '22',
        invoiceDate: '2026-09-18',
        invoiceNumber: 'QD-93821045',
        taxType: 'exempt',
        salesAmount: 5000,
        taxAmount: 0,
        totalAmount: 5000,
        itemsDescription: '生鮮有機蔬果禮盒 x5',
        settlementDate: '2026-09-20',
        remarks: '中秋節客戶拜訪禮品 (免稅)',
      },
    ];
    setInvoices(demo);
    showNotify('已載入 3 筆範例發票！');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 頂部導航列 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                台灣發票 PDF 智慧解析與核對系統
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                支援多頁掃描/拍照彙整 PDF・營業稅 5% 自動推算・自選欄位匯出 Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {invoices.length === 0 && (
              <button
                onClick={loadDemoData}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-semibold transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>載入測試範例</span>
              </button>
            )}

            {/* API Key 按鈕 */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border shadow-sm ${
                apiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{apiKey ? 'API Key 已配置' : '設定 API Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 浮動通知訊息 */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 text-white ${
              notification.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* 主工作區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 上傳區塊 */}
        <section>
          <FileUpload
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            apiKey={apiKey}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        </section>

        {/* 財務摘要卡片 */}
        <section>
          <SummaryCards invoices={invoices} />
        </section>

        {/* 發票資料表格 */}
        <section>
          <InvoiceTable
            invoices={invoices}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onAddInvoice={handleAddInvoice}
            onClearAll={handleClearAll}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </section>
      </main>

      {/* 底部說明 */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        所有發票分析均在瀏覽器前端與 Google 官方端點安全連線完成，不保留個人資料。
      </footer>

      {/* 彈出視窗 */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        invoices={invoices}
      />
    </div>
  );
}
