# DATA_SPEC.md

This document defines the data schema for the GenAI Dict project.

## Canonical Data Source

The website should read from:

```text
data.json
```

The CSV review file is:

```text
source_terms.csv
```

`data.json` is the source of truth for the website. `source_terms.csv` is a flattened review format.

---

## Top-level JSON Structure

```json
{
  "metadata": {},
  "categories": [],
  "source_labels": {},
  "entries": []
}
```

---

## `metadata`

Example:

```json
{
  "version": "1.0.0",
  "dataset_updated_at": "2026-05-29",
  "default_locale": "zh",
  "supported_locales": ["zh", "en"],
  "review_policy": {
    "last_reviewed_at": {
      "zh": "代表這筆 entry 最後一次完成完整品質檢查的日期，檢查範圍包含內容正確性、來源 URL 是否有效，以及來源是否與名詞解釋相關。",
      "en": "The date when the entry was last reviewed for content accuracy, source URL availability, and source relevance."
    }
  }
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| `version` | string | Yes | Dataset version. |
| `dataset_updated_at` | string | Yes | Date when the full dataset file was last generated or updated. Use `YYYY-MM-DD`. |
| `default_locale` | string | Yes | Default locale, currently `zh`. |
| `supported_locales` | string[] | Yes | Supported locales, currently `zh` and `en`. |
| `review_policy` | object | Recommended | Explains how review fields should be interpreted. |

---

## `categories`

Categories are centrally managed. Entries reference categories using `category_id`.

Example:

```json
{
  "category_id": "rag_data",
  "label": {
    "zh": "RAG、知識檢索與資料基礎",
    "en": "RAG, Knowledge Retrieval & Data Foundations"
  }
}
```

Required category IDs:

| category_id | Chinese Label | English Label |
|---|---|---|
| `genai_basics` | GenAI 基礎與模型概念 | GenAI Basics & Model Concepts |
| `prompt_tools` | Prompt、工具與應用互動 | Prompts, Tools & Application Interaction |
| `rag_data` | RAG、知識檢索與資料基礎 | RAG, Knowledge Retrieval & Data Foundations |
| `ai_governance` | 安全、治理與合規風險 | Safety, Governance & Compliance Risk |
| `usage_cost` | 用量、限制與費用 | Usage, Limits & Cost |
| `service_quality` | AI 服務效能與品質指標 | AI Service Performance & Quality Metrics |
| `model_tuning` | 模型訓練、調校與推論參數 | Model Training, Tuning & Inference Parameters |
| `deployment_infra` | 部署與基礎設施 | Deployment & Infrastructure |

---

## `source_labels`

`source_type` and `relevance` are stored as enum keys in entries. Display labels should be resolved from this config.

Example:

```json
{
  "source_type": {
    "official_docs": {
      "zh": "官方文件",
      "en": "Official docs"
    },
    "technical_guide": {
      "zh": "技術指南",
      "en": "Technical guide"
    }
  },
  "relevance": {
    "direct_definition": {
      "zh": "直接定義",
      "en": "Direct definition"
    },
    "related_explanation": {
      "zh": "相關說明",
      "en": "Related explanation"
    }
  }
}
```

Recommended source type enum values:

| Value | Meaning |
|---|---|
| `official_docs` | Official documentation |
| `official_blog` | Official blog or announcement |
| `technical_guide` | Trusted technical guide |
| `glossary` | Glossary or definition page |
| `framework` | Framework, standard, or methodology reference |
| `reference` | General reference page |

Recommended relevance enum values:

| Value | Meaning |
|---|---|
| `direct_definition` | The page directly defines or clearly explains the term. |
| `related_explanation` | The page explains a related concept but may not be a direct definition page. |
| `implementation_guide` | The page explains how to implement, configure, or use the concept. |
| `background_reference` | The page provides useful background context. |

---

## `entries`

Each dictionary term is one entry.

Example:

```json
{
  "id": "rag",
  "term": "RAG",
  "aliases": ["Retrieval-Augmented Generation"],
  "category_id": "rag_data",
  "name": {
    "zh": "檢索增強生成",
    "en": "Retrieval-Augmented Generation"
  },
  "summary": {
    "zh": "讓模型先查找相關資料，再根據資料生成回答的架構。",
    "en": "An architecture where the model retrieves relevant information before generating an answer."
  },
  "explanation": {
    "zh": "...",
    "en": "..."
  },
  "pm_notes": {
    "zh": "...",
    "en": "..."
  },
  "primary_sources": [
    {
      "title": "IBM: What is retrieval-augmented generation?",
      "url": "https://www.ibm.com/think/topics/retrieval-augmented-generation",
      "source_type": "technical_guide",
      "relevance": "direct_definition"
    }
  ],
  "entry_metadata": {
    "created_at": "2026-05-29",
    "updated_at": "2026-05-29",
    "last_reviewed_at": "2026-05-29",
    "change_type": "",
    "change_note": ""
  },
  "sort_key": "rag"
}
```

### Entry Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | string | Yes | Stable unique ID. Use lowercase snake_case or slug-like key. |
| `term` | string | Yes | Main term shown in the dictionary. Usually English or an abbreviation. |
| `aliases` | string[] | Yes | Alternative names, abbreviations, or full forms. Use empty array if none. |
| `category_id` | string | Yes | Must match an item in `categories`. |
| `name.zh` | string | Yes | Chinese name. |
| `name.en` | string | Yes | English display name. |
| `summary.zh` | string | Yes | Short Chinese summary. Should be a scannable one-sentence definition, not a detailed explanation. Prefer 40-70 Chinese characters when practical; review summaries over 80 characters. |
| `summary.en` | string | Yes | Short English summary. Should be concise and should not replace the detailed explanation. |
| `explanation.zh` | string | Yes | Chinese explanation. |
| `explanation.en` | string | Yes | Natural English explanation. Not a literal translation. |
| `pm_notes.zh` | string | Yes | Chinese PM guidance. |
| `pm_notes.en` | string | Yes | Natural English PM guidance. |
| `primary_sources` | object[] | Yes | Up to two sources. Prefer direct, credible references. |
| `entry_metadata` | object | Yes | Entry-level maintenance metadata. |
| `sort_key` | string | Yes | Sorting key. Usually lowercase term. |

---

## `primary_sources`

Each entry should have at most two primary sources.

```json
{
  "title": "OpenAI: What are tokens and how to count them?",
  "url": "https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them",
  "source_type": "official_docs",
  "relevance": "direct_definition"
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| `title` | string | Yes | Source title. Usually keep the original English title. |
| `url` | string | Yes | Public URL. Must be reachable. |
| `source_type` | string | Yes | Enum key resolved through `source_labels.source_type`. |
| `relevance` | string | Yes | Enum key resolved through `source_labels.relevance`. |

Source quality requirements:

1. Prefer official docs, glossary pages, or high-quality technical guides.
2. Avoid broken links, login-required pages, vague landing pages, and overly promotional pages.
3. Use `direct_definition` only when the page directly defines or clearly explains the term.
4. Use `related_explanation` or `implementation_guide` when the page is useful but not a direct definition.

---

## `entry_metadata`

```json
{
  "created_at": "2026-05-29",
  "updated_at": "2026-05-29",
  "last_reviewed_at": "2026-05-29",
  "change_type": "",
  "change_note": ""
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| `created_at` | string | Yes | Date the entry was first added. Use `YYYY-MM-DD`. |
| `updated_at` | string | Yes | Date the entry content was last updated. Use `YYYY-MM-DD`. |
| `last_reviewed_at` | string | Yes | Date the entry was last reviewed for content accuracy, URL availability, and source relevance. A release-wide review may update this field across all entries without changing `created_at`; update `updated_at` only when content or sources actually change. |
| `change_type` | string | Yes | Empty string for first release. Later may use enum such as `new_entry`, `minor_edit`, `major_update`, `source_update`, `review_only`, `structure_update`. |
| `change_note` | string | Yes | Chinese-only change note. Empty string for first release. |

Do not add `source_checked_at` or `content_owner` unless the project explicitly changes the data model.

---

## CSV Review Format

`source_terms.csv` should flatten i18n fields into separate columns.

Recommended columns:

```text
id,term,aliases,category_id,category_zh,category_en,name_zh,name_en,summary_zh,summary_en,explanation_zh,explanation_en,pm_notes_zh,pm_notes_en,primary_sources,created_at,updated_at,last_reviewed_at,change_type,change_note,sort_key
```

CSV rules:

- `aliases` should be a JSON string array.
- `primary_sources` should be a JSON string array of source objects.
- Use UTF-8 encoding.
- Keep line breaks inside long text fields if the CSV library supports proper quoting.
