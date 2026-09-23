/**
 * Gemini 多模態 PDF 發票解析服務
 * 支援任何持有 Google AI Studio API Key 的使用者直接在瀏覽器端發送請求
 */

export async function parseInvoicesFromPdf(fileBase64, apiKey, selectedModel = 'gemini-3.1-flash-lite') {
  if (!apiKey) {
    throw new Error('請先設定您的 Google Gemini API Key');
  }

  // 支援 gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const prompt = `
你是一位精通台灣會計與稅務發票的專家。
這份 PDF 檔案內彙整了一張或多張發票或憑證（可能包含數位電子發票、掃描檔、紙本發票、收銀機發票、手機拍照圖片等）。

請逐頁、逐張辨識 PDF 內所有的發票資訊，並整理成 JSON 格式。
請特別注意：
1. 一張發票請整理為一個物件（一行一張發票）。
2. 發票上的多個品項，請合併於 itemsDescription 欄位中（例如："文具組 x2, A4影印紙 x5" 或各品項以分號換行區隔）。
3. 國稅局憑證代碼 (voucherFormat) 請依據發票類型判斷：
   - "21": 三聯式統一發票、電子計算機發票
   - "22": 二聯式收銀機發票、載有稅額之其他憑證
   - "25": 三聯式收銀機發票、電子發票證明聯(有買方統編)
   - "28": 海關代徵營業稅繳納證
   - "99": 其他收據或無稅額憑證
4. 稅別 (taxType)：
   - "taxable" (應稅 5%)
   - "zero_rated" (零稅率)
   - "exempt" (免稅)
5. 銷售額 (salesAmount, 未稅)、稅額 (taxAmount)、發票金額 (totalAmount, 含稅)。請給予純整數數字（如 1000）。若金額未載明稅額但有載明含稅總額，且為應稅，請以 5% 營業稅精確推算：
   - salesAmount = Math.round(totalAmount / 1.05)
   - taxAmount = totalAmount - salesAmount
6. 發票日期 (invoiceDate) 請統一轉換為西元格式 "YYYY-MM-DD"（例如 115年3月15日 -> 2026-03-15）。
7. 貨款月份 (paymentMonth) 依發票日期產生 "YYYY-MM"（例如 "2026-03"）。
8. 廠商名稱 (vendorName) 與統一編號 (taxId)：若為買受人，請注意提取「賣方 / 銷方」廠商名稱與賣方統一編號；若統編辨識不出或無，可留空字串。
9. 發票號碼 (invoiceNumber)：例如 "AB-12345678" 或連續 10 碼（2 碼英文 + 8 碼數字）。
10. 收付款日 (settlementDate) 與備註 (remarks)：若 PDF 上有明顯註記請填入，否則為空字串 ""。

請嚴格輸出符合以下 JSON Schema 的格式：
{
  "invoices": [
    {
      "vendorName": "廠商名稱",
      "taxId": "統一編號(8碼)",
      "paymentMonth": "YYYY-MM",
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

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

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
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.invoices && Array.isArray(parsed.invoices)) {
      return parsed.invoices;
    }
    return [];
  } catch (err) {
    console.error('JSON parse error:', err, textOutput);
    throw new Error('解析模型回應資料失敗，非標準 JSON 格式');
  }
}
