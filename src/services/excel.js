import * as XLSX from 'xlsx';
import { INVOICE_COLUMNS } from '../utils/taxCalculator';

/**
 * 準備欲匯出的資料陣列 (憑證格式只保留編號代碼)
 */
function buildExportRows(invoices, selectedColumnIds) {
  if (!invoices || invoices.length === 0) {
    throw new Error('沒有可匯出的發票資料');
  }

  const columnsToExport = INVOICE_COLUMNS.filter((col) =>
    selectedColumnIds.includes(col.id)
  );

  if (columnsToExport.length === 0) {
    throw new Error('請至少勾選一個匯出欄位');
  }

  const rows = invoices.map((inv) => {
    const row = {};
    columnsToExport.forEach((col) => {
      let val = inv[col.id] ?? '';

      // 數值型態處理
      if (col.isNumber) {
        val = typeof val === 'number' ? val : (parseInt(val, 10) || 0);
      }

      row[col.label] = val;
    });
    return row;
  });

  return { rows, columnsToExport };
}

/**
 * 匯出發票資料為 Excel (.xlsx)
 */
export function exportToExcel(invoices, selectedColumnIds, fileName = '發票明細核對表.xlsx') {
  const { rows, columnsToExport } = buildExportRows(invoices, selectedColumnIds);

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
        return { wch: 15 };
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

  const baseName = fileName.replace(/\.(xlsx|csv)$/i, '');
  XLSX.writeFile(workbook, `${baseName}.xlsx`);
}

/**
 * 匯出發票資料為 CSV (.csv)，內嵌 UTF-8 BOM 避免 Excel 開啟亂碼
 */
export function exportToCsv(invoices, selectedColumnIds, fileName = '發票明細核對表.csv') {
  const { rows } = buildExportRows(invoices, selectedColumnIds);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  // UTF-8 BOM 確保 Windows / Excel 開啟繁體中文不亂碼
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const baseName = fileName.replace(/\.(xlsx|csv)$/i, '');
  link.href = url;
  link.download = `${baseName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 通用匯出入口
 */
export function exportInvoices(invoices, selectedColumnIds, fileName, format = 'xlsx') {
  if (format === 'csv') {
    exportToCsv(invoices, selectedColumnIds, fileName);
  } else {
    exportToExcel(invoices, selectedColumnIds, fileName);
  }
}
