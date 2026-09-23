import * as XLSX from 'xlsx';
import { INVOICE_COLUMNS, VOUCHER_FORMATS } from '../utils/taxCalculator';

/**
 * 匯出發票資料為 Excel (.xlsx)
 * @param {Array} invoices 發票資料陣列
 * @param {Array} selectedColumnIds 使用者勾選欲匯出的欄位 ID 陣列
 * @param {string} fileName 匯出檔案名稱
 */
export function exportToExcel(invoices, selectedColumnIds, fileName = '發票明細核對表.xlsx') {
  if (!invoices || invoices.length === 0) {
    throw new Error('沒有可匯出的發票資料');
  }

  // 取得勾選的欄位定義
  const columnsToExport = INVOICE_COLUMNS.filter((col) =>
    selectedColumnIds.includes(col.id)
  );

  if (columnsToExport.length === 0) {
    throw new Error('請至少勾選一個匯出欄位');
  }

  // 格式代碼 map 方便轉文字
  const voucherMap = VOUCHER_FORMATS.reduce((acc, curr) => {
    acc[curr.code] = curr.label;
    return acc;
  }, {});

  // 建立工作表表頭與資料
  const rows = invoices.map((inv) => {
    const row = {};
    columnsToExport.forEach((col) => {
      let val = inv[col.id] ?? '';
      
      // 憑證格式代碼對應
      if (col.id === 'voucherFormat' && voucherMap[val]) {
        val = voucherMap[val];
      }
      
      // 數值型態處理
      if (col.isNumber) {
        val = typeof val === 'number' ? val : (parseInt(val, 10) || 0);
      }

      row[col.label] = val;
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 設定直覺欄寬
  const colWidths = columnsToExport.map((col) => {
    switch (col.id) {
      case 'vendorName':
        return { wch: 24 };
      case 'itemsDescription':
        return { wch: 30 };
      case 'remarks':
        return { wch: 20 };
      case 'voucherFormat':
        return { wch: 25 };
      case 'invoiceNumber':
      case 'invoiceDate':
      case 'settlementDate':
        return { wch: 15 };
      default:
        return { wch: 12 };
    }
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '發票明細表');

  // 下載檔案
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
