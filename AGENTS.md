# AGENTS.md

This document is the operating SOP for Codex or any coding agent working on the GenAI Dictionary website and related content files.

## Instruction Priority

When instructions conflict, use this priority order:

1. `AGENTS.md`
2. `DATA_SPEC.md`
3. `UI_REQUIREMENTS.md`
4. `CONTENT_PROMPT.md`

`README.md` is human-facing project documentation. Use it only for general project context; it must not override `AGENTS.md`, `DATA_SPEC.md`, `UI_REQUIREMENTS.md`, or `CONTENT_PROMPT.md`.

## Critical Rules

1. Use `data.json` as the canonical runtime content source for the website.
2. Do not hardcode dictionary terms, explanations, PM notes, categories, source labels, or source URLs in HTML, JavaScript, or CSS.
3. Use `source_terms.csv` only for human review and dictionary content maintenance workflows.
4. For scheduled or periodic dictionary maintenance, follow the selected prompt in `CONTENT_PROMPT.md`.
5. Scheduled or periodic dictionary maintenance must not directly edit `data.json`.
6. `data.json` is generated from approved `source_terms.csv` changes by GitHub Actions after human review.
7. Do not modify website code during content maintenance unless explicitly requested.
8. Preserve CSV column structure and JSON-string fields such as `aliases` and `primary_sources`.

## Project Files

| File | Agent Usage |
|---|---|
| `data.json` | Website runtime data source. Use this to render the dictionary website. |
| `source_terms.csv` | Human review and content maintenance source. Scheduled content tasks may update this file only when the selected prompt explicitly allows it. |
| `DATA_SPEC.md` | Schema reference for `data.json`, `source_terms.csv`, metadata, source labels, and validation rules. |
| `CONTENT_PROMPT.md` | Content writing standards and prompt templates for generating, reviewing, or updating dictionary content. |
| `UI_REQUIREMENTS.md` | UI/UX and feature requirements for the website. |
| `README.md` | Human-facing project overview and setup notes; reference only. |

## Website Build SOP

Use this SOP when building or modifying the website UI, layout, search, filtering, language switching, or frontend behavior.

### Runtime Content Rule

Read website content from `data.json` only.

Expected top-level structure:

```json
{
  "metadata": {},
  "categories": [],
  "source_labels": {},
  "entries": []
}
```

If this structure is missing, stop and report the schema issue instead of guessing.

### i18n Rendering Rules

The website must support at least Traditional Chinese and English.

For locale-aware fields, use the selected locale:

```js
entry.name[locale]
entry.summary[locale]
entry.explanation[locale]
entry.pm_notes[locale]
```

Fallback behavior:

1. Use the selected locale.
2. If missing, fall back to `metadata.default_locale`.
3. If still missing, show a graceful empty state instead of breaking the UI.

### Category and Source Label Rules

Render categories from `data.json.categories`. Do not hardcode category labels.

Entries use:

```json
"category_id": "rag_data"
```

Resolve category labels from:

```js
data.categories.find(c => c.category_id === entry.category_id).label[locale]
```

Render `source_type` and `relevance` labels from `data.json.source_labels`. Do not show raw enum values to users unless a label is missing.

```js
data.source_labels.source_type[source.source_type][locale]
data.source_labels.relevance[source.relevance][locale]
```

### Search and Sorting Rules

Search should include:

- `term`
- `aliases`
- localized `name`
- localized `summary`
- localized `explanation`
- localized `pm_notes`
- category labels

Recommended behavior:

- Case-insensitive search.
- Match both English and Chinese text regardless of selected locale.
- Show exact term and alias matches first when practical.
- Use `sort_key` for default sorting; if missing, fallback to normalized `term`.

### Entry Detail Display

A term detail view or expanded card should show:

- Term
- Aliases
- Localized name
- Localized category
- Localized summary
- Localized explanation
- Localized PM notes
- Primary sources
- Entry metadata in a subtle footer area

Suggested metadata labels:

- Chinese: `內容更新` for `updated_at`; `最後檢查` for `last_reviewed_at`
- English: `Updated` for `updated_at`; `Last reviewed` for `last_reviewed_at`

For detailed UI behavior, follow `UI_REQUIREMENTS.md`.

## Data Validation SOP

Before completing any build or data-related website change, validate the relevant data according to `DATA_SPEC.md`.

Minimum checks:

- `entries` is a non-empty array.
- Every entry has a stable `id`.
- Every entry has required localized fields.
- Every `category_id` exists in `categories`.
- Every `source_type` exists in `source_labels.source_type`.
- Every `relevance` exists in `source_labels.relevance`.
- `primary_sources` has at most two items per entry.
- CSV JSON-string columns such as `aliases` and `primary_sources` parse correctly if importing from CSV.

## Dictionary Content Maintenance SOP

Use this SOP when adding new terms, updating existing terms, or performing periodic dictionary content review.

### Canonical Maintenance Rule

For content maintenance tasks, `source_terms.csv` is the review and editing surface.

Do not directly edit `data.json` during scheduled or periodic content maintenance. The expected workflow is:

1. Codex produces either a review report or approved changes according to the selected prompt.
2. If the selected prompt allows editing, Codex updates `source_terms.csv` only.
3. A human reviewer checks and approves the CSV changes.
4. GitHub Actions converts approved `source_terms.csv` changes into `data.json`.
5. The website continues to use `data.json` as the runtime content source.

If the task asks for website rendering or UI work, read from `data.json`. If the task asks for dictionary content maintenance, work from `source_terms.csv` and the relevant prompt in `CONTENT_PROMPT.md`.

### Scheduled Maintenance Guardrails

For scheduled content review or dictionary maintenance:

- Follow the correct maintenance prompt in `CONTENT_PROMPT.md`.
- Follow `CONTENT_PROMPT.md` `# Shared Content Standards` for content quality and source quality rules.
- Update `source_terms.csv` only when the selected prompt explicitly allows edits.
- Do not directly edit `data.json`.
- `data.json` is generated from `source_terms.csv` by GitHub Actions after human review.
- Preserve CSV column structure and JSON-string fields.
- If a term requires source updates, update `primary_sources` in `source_terms.csv` only when edits are allowed.
- Do not modify website code unless explicitly requested.
- Open a pull request, issue, comment, or reviewable change set for human review.

### Maintenance Modes and Prompt Mapping

Use the correct prompt from `CONTENT_PROMPT.md` for each maintenance mode.

| Maintenance Mode | Cadence | Prompt to Use | Expected Output |
|---|---:|---|---|
| Monthly Source Quality Check | Monthly | `Prompt 2A: Monthly Source Quality Check` | Update `source_terms.csv` only, mainly `primary_sources` and review metadata. |
| Quarterly Hot Term Candidate Review | Quarterly | `Prompt 2B: Quarterly Hot Term Candidate Review` | Produce a candidate list only. Do not update CSV or add terms. |
| Quarterly Full Content Quality Review | Quarterly | `Prompt 2C: Quarterly Full Content Quality Review` | Produce a proposed-change review report only. Do not update CSV. |
| Approved Add or Update Terms | As requested after human approval | `Prompt 2D: Add or Update Approved Terms` | Update `source_terms.csv` only for explicitly approved terms or approved proposed changes. |

### Monthly Source Quality Check

Use `CONTENT_PROMPT.md` Prompt 2A.

Rules:

- Check URL availability, public accessibility, and source relevance.
- Check whether `source_type` and `relevance` are accurate.
- Replace broken, weak, misleading, or inaccessible sources when better sources are available.
- Do not rewrite explanations or PM notes unless a source issue reveals a clear factual problem.
- Do not edit `data.json`.
- Do not modify website code.

### Quarterly Hot Term Candidate Review

Use `CONTENT_PROMPT.md` Prompt 2B.

Rules:

- Research recent GenAI, AI PM, Data PM, Software PM, AI engineering, AI evaluation, agentic AI, multimodal AI, and AI infrastructure terms.
- Produce a candidate list only.
- Do not add new terms to `source_terms.csv` during Prompt 2B.
- Do not edit `data.json`.
- Do not modify website code.
- If the project owner explicitly approves selected candidates, use `CONTENT_PROMPT.md` Prompt 2D to add or update only those approved terms in `source_terms.csv`.
- Prompt 2D must not run automatically as part of the quarterly candidate review.

### Quarterly Full Content Quality Review

Use `CONTENT_PROMPT.md` Prompt 2C.

Rules:

- Review factual accuracy, technical currency, bilingual quality, PM usefulness, category fit, source quality, duplicate terms, and term overlap.
- Produce a proposed-change review report only.
- Do not update `source_terms.csv` during Prompt 2C.
- Do not add new terms.
- Do not edit `data.json`.
- Do not modify website code.
- If the project owner explicitly approves selected proposed changes, use `CONTENT_PROMPT.md` Prompt 2D to apply only those approved changes to `source_terms.csv`.
- Prompt 2D must not run automatically as part of the quarterly full content quality review.

### Approved Add or Update Terms

Use `CONTENT_PROMPT.md` Prompt 2D.

Rules:

- Only add or update terms or content changes explicitly approved by the project owner.
- Update `source_terms.csv` only.
- Preserve CSV column structure and JSON-string fields.
- Do not edit `data.json`.
- Do not modify website code.

### Token-Efficient Maintenance Rules

For scheduled maintenance tasks, read only the fields required by the selected prompt whenever possible.

Do not load full entry content unless the task explicitly requires it. Do not rewrite unchanged content. Preserve existing wording, CSV structure, JSON-string fields, and row order unless the selected prompt requires a change.

Detailed field scopes for Prompt 2A, 2B, 2C, and 2D are defined in `CONTENT_PROMPT.md` and should be treated as the source of truth for maintenance task execution.

### Metadata Rules During Maintenance

Follow `DATA_SPEC.md` for exact schema rules.

General rules:

- Do not change `created_at` for existing entries.
- Set `updated_at` only when content or sources actually change.
- Set `last_reviewed_at` when an entry is reviewed for content accuracy, source URL availability, and source relevance.
- Use `change_type` only when explicit change tracking is needed.
- Keep `change_note` in Chinese only when used.
- Do not add `source_checked_at` or `content_owner`.

## What Not to Do

- Do not hardcode dictionary content into website files.
- Do not use `source_terms.csv` as the website runtime source.
- Do not directly edit `data.json` during scheduled content maintenance.
- Do not modify frontend code during content maintenance unless explicitly requested.
- Do not add new CSV columns without updating `DATA_SPEC.md` and the CSV-to-JSON workflow.
- Do not add unapproved hot terms directly to the dictionary.
- Do not apply Prompt 2C proposed changes to CSV unless the project owner explicitly approves them and asks to use Prompt 2D.
- Do not mark sources as `direct_definition` unless they truly define or clearly explain the term.
