// 國稅局憑證代碼對應表 (憑證格式只顯示編號)
export const VOUCHER_FORMATS = [
  { code: '21', label: '21', desc: '三聯式、電子計算機統一發票' },
  { code: '22I', label: '22I', desc: '二聯式收銀機統一發票、載有稅額憑證' },
  { code: '22Q', label: '22Q', desc: '載有稅額之其他(交通票根)憑證' },
  { code: '25', label: '25', desc: '三聯式收銀機統一發票及電子發票證明聯' },
  { code: '25G', label: '25G', desc: '公用事業憑證' },
  { code: '50', label: '50', desc: '勞務報酬單' },
  { code: '99', label: '99', desc: '其他收據與憑證' },
  { code: '收據', label: '收據', desc: '其他憑證(免用統一發票)' },
  { code: '車資單', label: '車資單', desc: '其他憑證(計程車乘車證明)' },
];

export const ZERO_TAX_VOUCHERS = ['99', '收據', '車資單'];

export function normalizeInvoice(inv) {
  if (!inv) return inv;
  let vf = String(inv.voucherFormat || '').trim();
  const validCodes = ['21', '22I', '22Q', '25', '25G', '50', '99', '收據', '車資單'];
  let matchedVf = validCodes.find((c) => vf === c);
  if (!matchedVf) {
    if (vf.startsWith('22I')) matchedVf = '22I';
    else if (vf.startsWith('22Q')) matchedVf = '22Q';
    else if (vf.startsWith('22')) matchedVf = '22I';
    else if (vf.startsWith('25G')) matchedVf = '25G';
    else if (vf.startsWith('25')) matchedVf = '25';
    else if (vf.startsWith('21')) matchedVf = '21';
    else if (vf.startsWith('50')) matchedVf = '50';
    else if (vf.startsWith('99')) matchedVf = '99';
    else if (vf.includes('車資') || vf.includes('計程車')) matchedVf = '車資單';
    else if (vf.includes('收據')) matchedVf = '收據';
    else matchedVf = '25';
  }

  let pm = String(inv.paymentMonth || '').trim();
  const matchMonth = pm.match(/^(?:\d{4}[-/])?(\d{1,2})月?$/);
  if (matchMonth) {
    pm = matchMonth[1].padStart(2, '0');
  } else if (!pm && inv.invoiceDate) {
    const m = String(inv.invoiceDate).match(/^\d{4}[-/](\d{1,2})/);
    if (m) pm = m[1].padStart(2, '0');
  }

  let sales = parseInt(inv.salesAmount, 10);
  let tax = parseInt(inv.taxAmount, 10);
  let total = parseInt(inv.totalAmount, 10);

  // 若為 99、收據、車資單，稅額直接設定為 0
  if (ZERO_TAX_VOUCHERS.includes(matchedVf)) {
    tax = 0;
    const validTotal = !isNaN(total) && total > 0 ? total : (!isNaN(sales) && sales > 0 ? sales : 0);
    sales = validTotal;
    total = validTotal;
  }

  return {
    ...inv,
    voucherFormat: matchedVf,
    paymentMonth: pm,
    salesAmount: isNaN(sales) ? inv.salesAmount : sales,
    taxAmount: ZERO_TAX_VOUCHERS.includes(matchedVf) ? 0 : (isNaN(tax) ? inv.taxAmount : tax),
    totalAmount: isNaN(total) ? inv.totalAmount : total,
  };
}

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
