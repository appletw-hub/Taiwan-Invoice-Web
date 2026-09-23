// 國稅局憑證代碼對應表
export const VOUCHER_FORMATS = [
  { code: '21', label: '21 - 三聯式、電子計算機統一發票' },
  { code: '22', label: '22 - 二聯式收銀機統一發票、載有稅額憑證' },
  { code: '25', label: '25 - 三聯式收銀機統一發票及電子發票' },
  { code: '28', label: '28 - 海關代徵營業稅繳納證扣抵聯' },
  { code: '99', label: '99 - 其他憑證 / 收據 / 免稅收據' },
];

// 稅制類別
export const TAX_TYPES = [
  { id: 'taxable', label: '應稅 (5%)', rate: 0.05 },
  { id: 'zero_rated', label: '零稅率 (0%)', rate: 0 },
  { id: 'exempt', label: '免稅', rate: 0 },
];

// 預設欄位清單 (符合使用者指定的12個欄位)
export const INVOICE_COLUMNS = [
  { id: 'vendorName', label: '廠商名稱', defaultExport: true },
  { id: 'taxId', label: '統一編號', defaultExport: true },
  { id: 'paymentMonth', label: '貨款月份', defaultExport: true },
  { id: 'voucherFormat', label: '憑證格式', defaultExport: true },
  { id: 'invoiceDate', label: '發票日期', defaultExport: true },
  { id: 'invoiceNumber', label: '發票號碼', defaultExport: true },
  { id: 'salesAmount', label: '銷售額', defaultExport: true, align: 'right', isNumber: true },
  { id: 'taxAmount', label: '稅額', defaultExport: true, align: 'right', isNumber: true },
  { id: 'totalAmount', label: '發票金額', defaultExport: true, align: 'right', isNumber: true },
  { id: 'itemsDescription', label: '品項內容', defaultExport: true },
  { id: 'settlementDate', label: '收付款日', defaultExport: true },
  { id: 'remarks', label: '備註', defaultExport: true },
];

/**
 * 依銷售額 (未稅) 推算稅額與總金額
 */
export function calculateFromSales(salesAmount, taxType = 'taxable') {
  const sales = Math.max(0, parseInt(salesAmount, 10) || 0);
  if (taxType === 'zero_rated' || taxType === 'exempt') {
    return {
      salesAmount: sales,
      taxAmount: 0,
      totalAmount: sales,
    };
  }
  // 台灣營業稅 5% 四捨五入
  const tax = Math.round(sales * 0.05);
  return {
    salesAmount: sales,
    taxAmount: tax,
    totalAmount: sales + tax,
  };
}

/**
 * 依發票金額 (含稅) 逆算銷售額與稅額
 */
export function calculateFromTotal(totalAmount, taxType = 'taxable') {
  const total = Math.max(0, parseInt(totalAmount, 10) || 0);
  if (taxType === 'zero_rated' || taxType === 'exempt') {
    return {
      salesAmount: total,
      taxAmount: 0,
      totalAmount: total,
    };
  }
  // 銷售額 = round(含稅 / 1.05)
  const sales = Math.round(total / 1.05);
  const tax = total - sales;
  return {
    salesAmount: sales,
    taxAmount: tax,
    totalAmount: total,
  };
}
