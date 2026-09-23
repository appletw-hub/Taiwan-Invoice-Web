import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function FileUpload({ onFileSelect, isProcessing, apiKey, onOpenKeyModal }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0]);
    } else {
      alert('請上傳 PDF 格式的檔案！');
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!apiKey) {
      onOpenKeyModal();
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-3 py-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>AI 正在逐頁辨識 PDF 發票內容（含手機拍照/紙本掃描）...</span>
              </div>
              <p className="text-xs text-slate-500">
                正在進行多模態光學文字與表格解析，請稍候約 5~15 秒
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  點擊或拖曳「彙整發票 PDF」至此處上傳
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  支援單一多頁 PDF、包含多張發票、手機拍照圖片、電子發票與紙本掃描檔
                </p>
              </div>

              {!apiKey && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenKeyModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-100 transition"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>尚未設定 API Key，點此開啟設定</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
