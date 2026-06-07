# GenAI Dict 專案說明

本專案是一份中英雙語 GenAI 字典，目標使用者包含 AI PM、Data PM、Software PM，以及第一次接觸 GenAI 專案管理的新人與跨職能夥伴。

網站正式內容來源應使用 `data.json`。搭配的 CSV 檔 `source_terms.csv` 主要用於人工檢查、內容維護與試算表作業。

## 專案目標

建立一個可搜尋、可分類瀏覽、可中英切換的 GenAI 字典網站，協助使用者：

- 透過關鍵字查找 GenAI 名詞。
- 依分類瀏覽名詞。
- 在繁體中文與英文之間切換。
- 同時理解名詞的技術意義與 PM 實務關聯。
- 透過高品質主要資料來源進一步閱讀。

這份字典不是純技術百科，而是面向 PM 與專案交付情境的實用字典。內容應協助 PM 進行需求釐清、PoC 驗證、品質驗收、成本控管、風險治理與上線維運。

## 主要資料檔

| 檔案 | 用途 |
|---|---|
| `data.json` | 網站正式內容來源。Codex 與前端應讀取此檔。 |
| `source_terms.csv` | 人工檢查與內容維護用的扁平化資料。 |
| `DATA_SPEC.md` | 資料欄位與 schema 規格。 |
| `CONTENT_PROMPT.md` | 產生與更新字典內容的可重用 prompt。 |
| `AGENTS.md` | 給 Codex 或其他 coding agent 的建置與維護 SOP。 |
| `UI_REQUIREMENTS.md` | 字典網站第一版 UI 與功能需求。 |

## 內容原則

1. **PM 友善，不過度學術化**  
   說明每個名詞是什麼、如何運作、為什麼重要，以及 PM 應注意什麼。

2. **雙語但不機器直譯**  
   中文與英文要表達相同概念，但英文應是自然、專業的英文內容，而不是中文逐字翻譯。

3. **來源支持**  
   每個名詞最多提供兩個主要資料來源，優先使用官方文件、術語表、標準文件或高品質技術指南。

4. **通用企業語境**  
   避免過度綁定金融或銀行場景。可保留「合規、資安、敏感資料、高風險流程」等通用企業風險語境。

5. **網站友善結構**  
   `data.json` 採用 i18n object 結構，方便網站中英切換與前端渲染。`source_terms.csv` 採展開欄位，方便人工 review。

## 最終資料形態

`data.json` 的最外層結構應為：

```json
{
  "metadata": {},
  "categories": [],
  "source_labels": {},
  "entries": []
}
```

`entries` 裡每一筆名詞至少包含：

- `id`
- `term`
- `aliases`
- `category_id`
- `name.zh / name.en`
- `summary.zh / summary.en`
- `explanation.zh / explanation.en`
- `pm_notes.zh / pm_notes.en`
- `primary_sources`
- `entry_metadata`
- `sort_key`

## 建議網站功能

網站第一版應至少支援：

- 搜尋名詞、中文名稱、alias、summary、explanation、pm_notes。
- 依 category 篩選。
- 中英文切換。
- A-Z 或字母排序。
- 名詞詳情頁或展開式詳情卡。
- 顯示主要資料來源與來源類型標籤。
- 顯示 entry 的最後檢查日期。

## 維護建議

未來新增名詞或定期檢查時，請同步維護：

- 中英文名稱與摘要。
- 中英文 explanation 與 pm_notes。
- 主要資料來源連結有效性。
- 來源是否與名詞解釋直接相關。
- `entry_metadata.updated_at` 與 `entry_metadata.last_reviewed_at`。

`last_reviewed_at` 代表該 entry 最後一次完成完整品質檢查的日期，檢查範圍包含內容正確性、來源 URL 可用性，以及來源與名詞解釋的相關性。
