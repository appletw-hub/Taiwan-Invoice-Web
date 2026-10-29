import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, ShieldCheck, Check } from 'lucide-react';

const VALID_MODELS = [
  'gemini-4-argon',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-pro-preview',
];

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey, selectedModel, onSelectModel }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(
    VALID_MODELS.includes(selectedModel) ? selectedModel : 'gemini-3.8-flash'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTempKey(apiKey || '');
    setModel(VALID_MODELS.includes(selectedModel) ? selectedModel : 'gemini-3.8-flash');
  }, [apiKey, selectedModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(tempKey.trim());
    onSelectModel(model);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">API Key 設定</h2>
              <p className="text-blue-100 text-xs mt-0.5">每位使用者使用自己專屬的金鑰，本機加密儲存</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>隱私承諾：</strong>
              您的 API Key 僅會保存在您當前瀏覽器的 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">localStorage</code>，
              辨識請求是由瀏覽器直連 Google 官方端點，系統伺服器不會保存您的 Key 與任何發票檔案。
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>前往 Google AI Studio 免費申請 API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              辨識模型選擇
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-mono"
            >
              <option value="gemini-4-argon">gemini-4-argon</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-3.6-flash">gemini-3.6-flash</option>
              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200/60 rounded-xl font-medium transition"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>儲存設定</span>
          </button>
        </div>
      </div>
    </div>
  );
}
