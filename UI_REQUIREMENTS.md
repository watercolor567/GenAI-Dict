# UI_REQUIREMENTS.md 中文版

本文件定義 GenAI Dict 網站第一版 UI 與功能需求。

目前 UI 不需要一次定稿。這份文件是給 Codex 建立第一版可用網站的起點。

## 產品目標

建立一個中英雙語 GenAI 字典網站，協助使用者快速搜尋、瀏覽與理解 GenAI 相關名詞，並從 PM 與產品交付角度理解名詞的實務意義。

主要使用者：

- AI PM
- Data PM
- Software PM
- GenAI 專案新人
- 與 AI 團隊合作的跨職能夥伴

## 資料來源

網站必須使用：

```text
data.json
```

作為正式內容來源。

不要將字典內容 hardcode 在 HTML 裡。

## 必要頁面 / 視圖

### 1. 字典首頁

首頁應包含：

- 頁面標題。
- 字典簡短說明。
- 搜尋框。
- 語言切換。
- 分類篩選。
- 名詞列表或卡片列表。
- 顯示資料集最後更新日期。

建議中文標題：

```text
GenAI Dict
```

建議中文副標：

```text
給 AI PM、Data PM、Software PM 與 GenAI 新人的實用雙語字典。
```

英文副標可使用：

```text
A practical bilingual GenAI dictionary for AI PMs, Data PMs, Software PMs, and newcomers.
```

---

### 2. 名詞列表 / 卡片

每個 term 在列表中應顯示：

- `term`
- `name[locale]`
- `summary[locale]`
- category label
- alias（可選）

卡片點擊後可展開或進入詳情視圖。

### 3. 名詞詳情視圖

詳情應顯示：

- term
- aliases
- 中文或英文名稱
- 分類
- summary
- explanation
- PM notes
- primary sources
- updated_at / last_reviewed_at

中文 UI 中欄位建議：

| 欄位 | 中文顯示 |
|---|---|
| `explanation` | 詳細解釋 |
| `pm_notes` | PM 提醒 |
| `primary_sources` | 主要資料來源 |
| `updated_at` | 內容更新 |
| `last_reviewed_at` | 最後檢查 |

英文 UI 中欄位建議：

| Field | Display Label |
|---|---|
| `explanation` | Explanation |
| `pm_notes` | PM Notes |
| `primary_sources` | Primary Sources |
| `updated_at` | Last Updated |
| `last_reviewed_at` | Last Reviewed |

---

## 必要功能

### 1. 搜尋

搜尋至少涵蓋：

- `term`
- `aliases`
- `name.zh / name.en`
- `summary.zh / summary.en`
- `explanation.zh / explanation.en`
- `pm_notes.zh / pm_notes.en`

搜尋應即時更新結果。

搜尋邏輯第一版可用 client-side case-insensitive substring matching。

### 2. 分類篩選

使用 `categories` 生成分類 filter。

不得 hardcode 分類名稱。

使用者應可：

- 選擇單一分類。
- 清除分類篩選。
- 查看全部 terms。

### 3. 語言切換

支援：

- 繁體中文 `zh`
- English `en`

切換語言時，以下內容都應切換：

- category labels
- name
- summary
- explanation
- pm_notes
- source type labels
- relevance labels
- UI labels

`term`、`aliases`、`primary_sources.title` 通常保留原文，不需翻譯。

### 4. 排序

預設依 `sort_key` 排序。

可支援：

- A-Z 排序。
- 依 category 分組。
- 搜尋結果維持相關性或字母排序。

第一版可先使用字母排序。

### 5. 來源顯示

每筆來源顯示：

- title
- source_type label
- relevance label
- 外部連結 icon 或標記

來源連結應新分頁開啟。

```html
<a target="_blank" rel="noopener noreferrer">
```

### 6. Empty State

當搜尋沒有結果時，顯示：

中文：

```text
找不到符合條件的名詞。請嘗試其他關鍵字或清除篩選條件。
```

英文：

```text
No matching terms found. Try another keyword or clear filters.
```

---

## 建議版面

第一版可以採用以下 layout：

```text
Header
  - Logo / Title
  - Language toggle

Main
  - Intro / description
  - Search bar
  - Category filter chips
  - Term count
  - Term cards or list

Detail Panel / Modal / Route
  - Term details
  - PM notes
  - Sources
  - Metadata
```

### 桌機版

- 左側或上方分類篩選。
- 主區域顯示 term cards。
- 點擊 card 後右側 panel 或詳情頁顯示完整內容。

### 手機版

- 搜尋框置頂。
- 分類 filter 可橫向 scroll。
- Term cards 單欄顯示。
- 詳情以展開式或新頁顯示。

---

## 可及性要求

- 搜尋框應有 label。
- 語言切換應可鍵盤操作。
- 分類 filter 應有 active state。
- 外部連結應有明確文字。
- 顏色對比應符合基本可讀性。
- 不要只用顏色表示狀態。

---

## 視覺風格建議

第一版可採簡潔、專業、適合知識庫的風格。

建議：

- 白底或淺色背景。
- 清楚的卡片邊界。
- 適度留白。
- 分類 chip。
- 來源標籤使用小 badge。
- Explanation 與 PM Notes 分區顯示。

不建議：

- 過多動畫。
- 過度行銷式 landing page。
- 大量圖片或插圖干擾閱讀。
- 把所有長內容塞進列表卡片。

---

## 建議互動

### Term Card

列表卡片可顯示：

```text
[Term]
中文/英文名稱
一句話 summary
Category badge
```

### Detail View

詳情視圖可分段：

1. Overview
2. Explanation
3. PM Notes
4. Primary Sources
5. Metadata

### Source Badges

例如：

```text
官方文件 · 直接定義
```

英文：

```text
Official docs · Direct definition
```

---

## 非必要但可加分功能

如果時間允許，可加入：

- 收藏 terms。
- 複製 term link。
- URL hash deep link，例如 `#rag`。
- Recently updated section。
- 依 category 顯示 term 數量。
- 搜尋結果 highlight。
- Dark mode。
- 匯出目前篩選結果。

---

## 不要做的事

- 不要 hardcode 字典內容。
- 不要讓 UI 依賴 CSV。
- 不要把所有 explanation 預設展開在列表頁。
- 不要忽略英文版排版。
- 不要隱藏 primary sources。
- 不要把 `source_type` / `relevance` enum key 直接顯示給 user。

---

## 第一版成功標準

第一版網站應達到：

- 可成功讀取 `data.json`。
- 可顯示所有 terms。
- 可搜尋。
- 可依 category 篩選。
- 可中英切換。
- 可查看 explanation、pm_notes、primary_sources。
- 可顯示資料更新 / review 日期。
- 手機與桌機都可正常閱讀。
