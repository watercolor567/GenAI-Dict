# CONTENT_PROMPT.md

This file contains reusable prompts and content standards for generating, reviewing, and maintaining the GenAI Dictionary content.

The dictionary is intended for AI PMs, Data PMs, Software PMs, newcomers to GenAI project management, and cross-functional partners. It should explain concepts clearly, with enough technical depth to support project decisions, but without becoming an academic encyclopedia.

---

# Shared Content Standards

These standards apply to all content generation, review, source quality checks, and term update tasks in this file, including Prompt 1 and Prompt 2A-2D.

## Audience

Write for:

- AI PMs
- Data PMs
- Software PMs
- Newcomers to GenAI project management
- Cross-functional partners who need to understand GenAI concepts without being deep ML engineers

## Chinese Writing Standards

- Use Traditional Chinese.
- Explain each term clearly enough for onboarding.
- Include technical principles when relevant.
- Include PM implications.
- Avoid over-customizing to one industry such as finance.
- Prefer general enterprise language such as:
  - 企業級 GenAI 專案
  - 涉及敏感資料的 GenAI 專案
  - 正式營運流程
  - 高風險決策或對外服務
  - 專業術語、產品名稱與內部縮寫
- Keep explanations detailed but readable.
- Keep `pm_notes_zh` focused on what PMs should notice, decide, validate, or monitor.
- Add action notes only when the term materially affects cost, quality, risk, governance, launch readiness, or system stability.
- Keep `summary_zh` as a short, scannable one-sentence definition. Prefer 40-70 Chinese characters when practical; review any summary over 80 characters and move examples, workflow details, or edge cases into `explanation_zh`.
- Avoid repeating the entry's own Chinese name in parentheses at the start of Chinese fields when the page already displays `term`, `name_zh`, and aliases. For example, prefer `Streaming 是...` over `Streaming（串流輸出）是...` unless the parenthetical adds necessary clarity.
- Avoid generic repeated template phrases in Chinese fields, such as broad "technical and practical importance" openings that do not explain the specific term. Make each explanation term-specific.

## English Writing Standards

- Do not translate Chinese word-for-word.
- Write natural professional English.
- `summary_en` should be concise.
- `explanation_en` should usually be medium-length and easy to read.
- `pm_notes_en` should be practical and specific to PM work.
- Avoid generic repeated openings such as "a foundational AI concept" unless truly appropriate.
- For core terms, include definition, mechanism, value, and limitations.
- For PM notes, include practical guidance tied to scoping, PoC, UAT, launch, monitoring, cost, quality, or risk.

## PM Notes Standards

PM notes should help PMs understand why the term matters in real project work.

Good PM notes may cover:

- What PMs should clarify during requirements.
- What should be validated during PoC or UAT.
- What should be monitored after launch.
- What affects cost, quality, safety, governance, adoption, or operational readiness.

Avoid turning every term into a long checklist. Most terms should remain reminder-style; high-impact terms may include a short action note.

Avoid generic PM reminders that could apply to any AI term. `pm_notes_zh` and `pm_notes_en` should point to concrete decisions, validation points, monitoring needs, or risks that are specific to the term.

## Source Quality Standards

Each term should have at most two primary sources.

Use this source structure in JSON or as a JSON string inside CSV:

```json
{
  "title": "...",
  "url": "...",
  "source_type": "official_docs | official_blog | technical_guide | glossary | framework | reference",
  "relevance": "direct_definition | related_explanation | implementation_guide | background_reference"
}
```

Rules:

1. Prefer official docs, official glossaries, standards, reputable technical guides, or high-quality educational resources.
2. Use `direct_definition` only if the page itself directly defines or clearly explains the term.
3. If a page is useful but does not directly define the term, use `related_explanation`, `implementation_guide`, or `background_reference`.
4. Do not use broken URLs, login-only pages, vague landing pages, unrelated product pages, or overly promotional pages with no useful explanation.
5. Verify that URLs are reachable when the task requires source review.
6. Keep source titles close to the page title so users know what they are opening.

## Token-Efficient Review Standards

Use only the fields needed for the selected task whenever possible.

General rules:

- Do not load or rewrite full entry content unless the selected prompt requires it.
- Do not rewrite unchanged content.
- Preserve CSV column structure, row order, and JSON-string fields.
- For report-only tasks, do not edit `source_terms.csv`.
- For approved update tasks, process only approved rows or approved changes.

---

# Prompt 1: Generate the Full Dictionary Dataset

Use this prompt when creating a complete GenAI Dictionary dataset from scratch.

## Role

You are a GenAI terminology, AI product management, and technical education specialist.

## Task

Create a bilingual GenAI Dictionary for AI PMs, Data PMs, Software PMs, and GenAI project newcomers.

The dictionary should include:

- Core GenAI and AI model concepts
- Prompt, tool, and agent interaction concepts
- RAG, retrieval, knowledge base, and data foundation concepts
- Safety, governance, privacy, and compliance risk concepts
- Usage, limits, and cost concepts
- AI service performance and quality metrics
- Model training, tuning, and inference parameters
- Deployment and infrastructure concepts

## Output Requirements

Generate content compatible with the schema in `DATA_SPEC.md`.

For each term, provide:

- stable `id`
- `term`
- `aliases`
- `category_id`
- `name_zh`
- `name_en`
- `summary_zh`
- `summary_en`
- `explanation_zh`
- `explanation_en`
- `pm_notes_zh`
- `pm_notes_en`
- `primary_sources`
- `sort_key`
- entry metadata fields required by `DATA_SPEC.md`

Follow `# Shared Content Standards` in this file.

---

# Prompt 2A: Monthly Source Quality Check

Use this prompt for the monthly source quality and URL health check.

## Goal

Check whether existing `primary_sources` in `source_terms.csv` are still usable, reachable, and relevant to each term.

## Input Files

Read:

- `AGENTS.md`
- `CONTENT_PROMPT.md`
- `DATA_SPEC.md`
- `source_terms.csv`

## Minimum Fields to Inspect

For token efficiency, inspect only these fields unless more context is needed:

- `id`
- `term`
- `aliases`
- `name_zh`
- `name_en`
- `primary_sources`
- `last_reviewed_at`
- `change_type`
- `change_note`

If source relevance cannot be judged from term/name alone, inspect `summary_zh`, `summary_en`, or explanation fields for that specific entry only.

## Required Checks

For each source:

1. Check whether the URL is reachable and publicly accessible.
2. Check whether the page is still relevant to the term.
3. Check whether `relevance` is accurate.
4. Check whether `source_type` is accurate.
5. Replace broken, weak, misleading, or irrelevant sources when better sources are available.

## Allowed Edits

You may update `source_terms.csv` only.

Allowed updates:

- `primary_sources`
- `last_reviewed_at`
- `updated_at` only if sources actually changed
- `change_type`
- `change_note`

Avoid editing `explanation_zh`, `explanation_en`, `pm_notes_zh`, or `pm_notes_en` unless the source issue reveals a clear factual problem.

## Prohibited Actions

- Do not edit `data.json`.
- Do not modify website code.
- Do not add new terms.
- Do not rewrite unchanged explanations or PM notes.
- Do not add new CSV columns.

## Output

Open a pull request or reviewable change set updating `source_terms.csv` only.

Include a short summary of:

- number of URLs checked
- sources replaced
- relevance labels changed
- entries needing human attention, if any

---

# Prompt 2B: Quarterly Hot Term Candidate Review

Use this prompt for quarterly review of potential new AI terms.

## Goal

Identify recent or increasingly important AI, GenAI, AI PM, Data PM, Software PM, AI engineering, AI evaluation, agentic AI, multimodal AI, and AI infrastructure terms that may be useful additions to the dictionary.

## Input Files

Read:

- `AGENTS.md`
- `CONTENT_PROMPT.md`
- `DATA_SPEC.md`
- `source_terms.csv`

## Minimum Fields to Inspect

For token efficiency, inspect only these fields unless more context is needed:

- `id`
- `term`
- `aliases`
- `name_zh`
- `name_en`
- `category_id`
- `summary_zh`
- `summary_en`

Use these fields to avoid duplicates or near-duplicates.

## Candidate Selection Criteria

A candidate term should be considered only if it is:

- Useful for AI PMs, Data PMs, Software PMs, or GenAI project newcomers.
- More than a short-lived buzzword.
- Helpful for project scoping, architecture discussion, governance, evaluation, cost, quality, deployment, or operations.
- Supported by credible and reasonably direct sources.
- Not already covered by an existing term or alias.

## Output Format

Produce a candidate list only.

For each candidate, provide:

- `candidate_term`
- `suggested_name_zh`
- `suggested_name_en`
- `suggested_category_id`
- `why_it_matters_for_pm`
- `suggested_sources`, at most two
- `recommendation`: `add` / `monitor` / `skip`
- `confidence`: `high` / `medium` / `low`
- `notes_on_overlap_with_existing_terms`

## Prohibited Actions

- Do not update `source_terms.csv` during this task.
- Do not edit `data.json`.
- Do not modify website code.
- Do not add new terms.
- Do not generate full CSV rows unless the project owner explicitly approves candidates and asks you to use Prompt 2D.

## Follow-up

If the project owner explicitly approves selected candidates, use Prompt 2D to add only those approved terms to `source_terms.csv`.

---

# Prompt 2C: Quarterly Full Content Quality Review

Use this prompt for quarterly full content quality review.

## Goal

Review existing dictionary entries for quality, correctness, relevance, and maintainability.

## Input Files

Read:

- `AGENTS.md`
- `CONTENT_PROMPT.md`
- `DATA_SPEC.md`
- `source_terms.csv`

## Fields to Inspect

This task may inspect full content fields because it is a full quality review.

Review in batches if needed to reduce context size.

Relevant fields include:

- term and aliases
- category
- name fields
- summary fields
- explanation fields
- PM notes fields
- primary sources
- metadata fields

## Review Criteria

Check for:

- factual accuracy
- technical currency
- clarity for onboarding
- usefulness for AI PM / Data PM / Software PM work
- bilingual content quality
- category fit
- duplicate terms or excessive overlap
- source quality and relevance
- overly industry-specific wording that should be generalized
- English content that is too stiff, too short, too long, or too close to literal Chinese translation
- Chinese content that is too vague, too verbose, or not useful for PM decision-making

## Output Format

Produce a proposed-change review report only.

For each proposed change, include:

- `entry_id`
- `term`
- `issue_type`
- `affected_columns`
- `proposed_change_summary`
- `proposed_replacement_text`, if applicable
- `reason_for_change`
- `source_evidence`, if applicable
- `priority`: `high` / `medium` / `low`
- `confidence`: `high` / `medium` / `low`

## Prohibited Actions

- Do not update `source_terms.csv` during this task.
- Do not edit `data.json`.
- Do not modify website code.
- Do not add new terms.
- Do not rewrite rows directly.

## Follow-up

If the project owner explicitly approves selected proposed changes, use Prompt 2D to apply only those approved changes to `source_terms.csv`.

Prompt 2D must not run automatically as part of the quarterly full content quality review.

---

# Prompt 2D: Add or Update Approved Terms

Use this prompt only after the project owner explicitly approves new terms or proposed changes.

## Goal

Apply approved additions or approved content/source updates to `source_terms.csv`.

This prompt can be used for:

- approved hot-term candidates from Prompt 2B
- approved content changes from Prompt 2C
- user-requested edits to specific terms
- approved source updates that require CSV changes

## Input Files

Read:

- `AGENTS.md`
- `CONTENT_PROMPT.md`
- `DATA_SPEC.md`
- `source_terms.csv`
- the approved candidate list or approved proposed-change list

## Scope

Process only the explicitly approved terms or approved changes.

Do not scan or rewrite unrelated rows.

## Required Fields for New Terms

For each approved new term, generate all required CSV fields according to `DATA_SPEC.md`, including:

- `id`
- `term`
- `aliases`
- `category_id`
- `name_zh`
- `name_en`
- `summary_zh`
- `summary_en`
- `explanation_zh`
- `explanation_en`
- `pm_notes_zh`
- `pm_notes_en`
- `primary_sources`
- `sort_key`
- metadata fields

## Required Handling for Existing Terms

For approved updates to existing terms:

- Update only approved columns.
- Preserve existing wording in columns not included in the approval.
- Preserve `created_at`.
- Update `updated_at` only if content or sources changed.
- Update `last_reviewed_at` when the row has been reviewed.
- Use `change_type` only when needed by the approved change.
- Keep `change_note` in Chinese only when used.

## Source Requirements

For every new or changed source:

- Use at most two sources.
- Prefer direct definitions or highly relevant technical explanations.
- Ensure URL availability when possible.
- Use the `primary_sources` JSON string format defined in `DATA_SPEC.md`.

## Prohibited Actions

- Do not edit `data.json`.
- Do not modify website code.
- Do not add unapproved terms.
- Do not apply unapproved Prompt 2C proposed changes.
- Do not add new CSV columns.

## Output

Update `source_terms.csv` only.

Provide a concise change summary listing:

- rows added
- rows updated
- columns changed
- sources changed
- any validation concerns
