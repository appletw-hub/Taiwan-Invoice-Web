/**
 * Gemini 多模態 PDF 發票解析服務
 * 支援任何持有 Google AI Studio API Key 的使用者直接在瀏覽器端發送請求
 */
import { normalizeInvoice } from '../utils/taxCalculator';

export async function parseInvoicesFromPdf(fileBase64, apiKey, selectedModel = 'gemini-3.8-flash') {
  if (!apiKey) {
    throw new Error('請先設定您的 Google Gemini API Key');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const prompt = `
你是一位精通台灣會計與稅務發票的專家。
這份 PDF 檔案內彙整了一張或多張發票或憑證（可能包含數位電子發票、掃描檔、紙本發票、收銀機發票、手機拍照圖片等）。

請逐頁、逐張辨識 PDF 內所有的發票資訊，並整理成 JSON 格式。
請特別注意：
1. 一張發票請整理為一個物件（一行一張發票）。
2. 發票上的多個品項，請合併於 itemsDescription 欄位中（例如："文具組 x2, A4影印紙 x5" 或各品項以分號換行區隔）。
3. 國稅局扣抵憑證格式代碼 (voucherFormat) 請嚴格依據發票類型判別，只填寫代碼編號（請勿附加額外中文文字）：
   - "21": 三聯式、電子計算機統一發票
   - "22I": 二聯式收銀機統一發票、載有稅額憑證
   - "22Q": 載有稅額之其他(交通票根，例如高鐵票、台鐵火車票、客運票等)憑證
   - "25": 三聯式收銀機統一發票及電子發票證明聯(有買方統編或電子發票證明聯)
   - "25G": 公用事業憑證(水費、電費、瓦斯費、公用事業電信繳費通知單)
   - "50": 勞務報酬單(個人勞務報酬扣繳憑單)
   - "99": 其他收據與憑證
   - "收據": 其他憑證(免用統一發票收據、小規模營業人收據)
   - "車資單": 其他憑證(計程車乘車證明、計程車收據車資單)
4. 稅別 (taxType)：
   - "taxable" (應稅 5%)
   - "zero_rated" (零稅率)
   - "exempt" (免稅)
5. 銷售額 (salesAmount, 未稅)、稅額 (taxAmount)、發票金額 (totalAmount, 含稅)。請給予純整數數字（如 1000）。若金額未載明稅額但有載明含稅總額，且為應稅，請以 5% 營業稅精確推算：
   - salesAmount = Math.round(totalAmount / 1.05)
   - taxAmount = totalAmount - salesAmount
6. 發票日期 (invoiceDate) 請統一轉換為西元格式 "YYYY-MM-DD"（例如 115年3月15日 -> 2026-03-15）。
7. 貨款月份 (paymentMonth) 依發票日期產生月份，只填寫兩碼月份數字 "MM"（例如 "03"、"10"），請勿包含年份。
8. 廠商名稱 (vendorName) 與統一編號 (taxId)：若為買受人，請注意提取「賣方 / 銷方」廠商名稱與賣方統一編號；若統編辨識不出或無，可留空字串。
9. 發票號碼 (invoiceNumber)：例如 "AB-12345678" 或連續 10 碼（2 碼英文 + 8 碼數字）。
10. 收付款日 (settlementDate) 與備註 (remarks)：若 PDF 上有明顯註記請填入，否則為空字串 ""。

請嚴格輸出符合以下 JSON Schema 的格式：
{
  "invoices": [
    {
      "vendorName": "廠商名稱",
      "taxId": "統一編號(8碼)",
      "paymentMonth": "03",
      "voucherFormat": "25",
      "invoiceDate": "YYYY-MM-DD",
      "invoiceNumber": "AB-12345678",
      "taxType": "taxable",
      "salesAmount": 1000,
      "taxAmount": 50,
      "totalAmount": 1050,
      "itemsDescription": "品項名稱與規格",
      "settlementDate": "",
      "remarks": ""
    }
  ]
}
`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('辨識逾時（超過 300 秒 / 5 分鐘），請改用較快模型或拆分 PDF 後重試');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `API 請求失敗 (狀態碼 ${response.status})`;
    throw new Error(message);
  }

  const result = await response.json();
  const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('模型未能產生成果，請確認 PDF 檔案是否包含有效內容。');
  }

  try {
    const parsed = JSON.parse(textOutput);
    const rawList = Array.isArray(parsed) ? parsed : (parsed.invoices || []);
    return rawList.map(normalizeInvoice);
  } catch (err) {
    console.error('JSON parse error:', err, textOutput);
    throw new Error('解析模型回應資料失敗，非標準 JSON 格式');
  }
}
