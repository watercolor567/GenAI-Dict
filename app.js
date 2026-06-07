const state = {
  data: null,
  locale: "zh",
  query: "",
  categoryId: "all",
  selectedId: "",
};

const ui = {
  zh: {
    subtitle: "專為產品經理打造的 GenAI 雙語術語字典",
    searchLabel: "搜尋名詞",
    searchPlaceholder: "輸入 term、alias、摘要、解釋或 PM 提醒",
    allCategories: "全部分類",
    terms: "筆名詞",
    datasetUpdated: "資料集更新",
    selectPrompt: "選擇一個名詞查看詳細解釋、PM 提醒與主要來源。",
    noResults: "找不到符合條件的名詞。請嘗試其他關鍵字或清除篩選條件。",
    aliases: "Aliases",
    explanation: "詳細解釋",
    pmNotes: "PM 提醒",
    sources: "主要資料來源",
    updated: "內容更新",
    reviewed: "最後檢查",
    schemaError: "data.json 結構不符合網站需求，請先修正資料檔。",
    loadError: "無法載入 data.json。請透過本機靜態伺服器開啟網站。",
    openSource: "開啟來源",
  },
  en: {
    subtitle: "A practical bilingual GenAI dictionary for AI PMs, Data PMs, Software PMs.",
    searchLabel: "Search terms",
    searchPlaceholder: "Search term, alias, summary, explanation, or PM notes",
    allCategories: "All categories",
    terms: "terms",
    datasetUpdated: "Dataset updated",
    selectPrompt: "Select a term to read the explanation, PM notes, and primary sources.",
    noResults: "No matching terms found. Try another keyword or clear filters.",
    aliases: "Aliases",
    explanation: "Explanation",
    pmNotes: "PM Notes",
    sources: "Primary Sources",
    updated: "Last Updated",
    reviewed: "Last Reviewed",
    schemaError: "data.json does not match the required website schema. Please fix the data file first.",
    loadError: "Unable to load data.json. Please open the site through a local static server.",
    openSource: "Open source",
  },
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  loadData();
});

function cacheElements() {
  for (const id of [
    "datasetVersion",
    "appTitle",
    "appSubtitle",
    "searchLabel",
    "searchInput",
    "resultCount",
    "datasetUpdated",
    "categoryFilters",
    "entryList",
    "detailPanel",
  ]) {
    els[id] = document.getElementById(id);
  }
}

function bindEvents() {
  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.addEventListener("click", () => {
      state.locale = button.dataset.locale;
      document.documentElement.lang = state.locale === "zh" ? "zh-Hant" : "en";
      render();
    });
  });

  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    renderEntries();
  });

  window.addEventListener("hashchange", () => {
    state.selectedId = decodeURIComponent(location.hash.replace(/^#/, ""));
    renderEntries();
  });
}

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const validation = validateData(data);
    if (validation.length) {
      showError(t("schemaError"), validation);
      return;
    }
    state.data = data;
    state.locale = getInitialLocale(data);
    state.selectedId = decodeURIComponent(location.hash.replace(/^#/, ""));
    document.documentElement.lang = state.locale === "zh" ? "zh-Hant" : "en";
    render();
  } catch (error) {
    showError(t("loadError"), [error.message]);
  }
}

function validateData(data) {
  const errors = [];
  if (!data || typeof data !== "object") errors.push("Root must be an object.");
  if (!data?.metadata || typeof data.metadata !== "object") errors.push("Missing metadata.");
  if (!Array.isArray(data?.categories)) errors.push("Missing categories array.");
  if (!data?.source_labels || typeof data.source_labels !== "object") errors.push("Missing source_labels.");
  if (!Array.isArray(data?.entries) || data.entries.length === 0) errors.push("Missing non-empty entries array.");
  if (errors.length) return errors;

  const categoryIds = new Set(data.categories.map((category) => category.category_id));
  const sourceTypes = data.source_labels.source_type || {};
  const relevanceTypes = data.source_labels.relevance || {};

  data.entries.forEach((entry) => {
    if (!entry.id) errors.push("Entry is missing id.");
    if (!categoryIds.has(entry.category_id)) errors.push(`${entry.id}: category_id is not defined.`);
    ["name", "summary", "explanation", "pm_notes"].forEach((field) => {
      if (!entry[field]?.zh || !entry[field]?.en) errors.push(`${entry.id}: missing localized ${field}.`);
    });
    if (!Array.isArray(entry.primary_sources)) errors.push(`${entry.id}: primary_sources must be an array.`);
    if ((entry.primary_sources || []).length > 2) errors.push(`${entry.id}: primary_sources has more than two items.`);
    (entry.primary_sources || []).forEach((source) => {
      if (!sourceTypes[source.source_type]) errors.push(`${entry.id}: source_type ${source.source_type} is not defined.`);
      if (!relevanceTypes[source.relevance]) errors.push(`${entry.id}: relevance ${source.relevance} is not defined.`);
    });
  });

  return errors;
}

function getInitialLocale(data) {
  const saved = localStorage.getItem("gendict-locale");
  const supported = data.metadata.supported_locales || ["zh", "en"];
  if (supported.includes(saved)) return saved;
  const browser = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  return supported.includes(browser) ? browser : data.metadata.default_locale || "zh";
}

function render() {
  localStorage.setItem("gendict-locale", state.locale);
  document.querySelectorAll("[data-locale]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.locale === state.locale);
  });

  els.appTitle.textContent = "GenAI Dict for PM";
  els.appSubtitle.textContent = t("subtitle");
  els.searchLabel.textContent = t("searchLabel");
  els.searchInput.placeholder = t("searchPlaceholder");
  els.searchInput.value = state.query;
  els.datasetVersion.textContent = "Generative AI Glossary";
  els.datasetUpdated.textContent = `${t("datasetUpdated")}: ${state.data.metadata.dataset_updated_at || ""}`;
  renderCategories();
  renderEntries();
}

function renderCategories() {
  const counts = countByCategory();
  const buttons = [
    categoryButton("all", t("allCategories"), state.data.entries.length),
    ...state.data.categories.map((category) => categoryButton(
      category.category_id,
      localized(category.label),
      counts.get(category.category_id) || 0,
    )),
  ];
  els.categoryFilters.replaceChildren(...buttons);
}

function categoryButton(id, label, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "category-button";
  button.classList.toggle("is-active", state.categoryId === id);
  button.textContent = `${label} (${count})`;
  button.addEventListener("click", () => {
    state.categoryId = id;
    renderEntries();
  });
  return button;
}

function renderEntries() {
  const entries = getFilteredEntries();
  els.resultCount.textContent = `${entries.length} / ${state.data.entries.length} ${t("terms")}`;

  if (!entries.length) {
    els.entryList.innerHTML = `<div class="empty-state">${escapeHtml(t("noResults"))}</div>`;
    renderDetail(null);
    return;
  }

  const selectedExists = entries.some((entry) => entry.id === state.selectedId);
  const selected = selectedExists
    ? entries.find((entry) => entry.id === state.selectedId)
    : entries[0];
  state.selectedId = selected.id;

  els.entryList.replaceChildren(...entries.map((entry) => entryCard(entry)));
  renderDetail(selected);
}

function entryCard(entry) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "entry-card";
  button.classList.toggle("is-selected", entry.id === state.selectedId);
  button.addEventListener("click", () => {
    state.selectedId = entry.id;
    history.replaceState(null, "", `#${encodeURIComponent(entry.id)}`);
    renderEntries();
    scrollDetailIntoView();
  });

  const aliases = aliasList(entry, 2);
  button.innerHTML = `
    <div class="entry-topline">
      <div class="term-line">
        <p class="term">${escapeHtml(entry.term)}</p>
        ${aliases ? `<div class="aliases inline-aliases" aria-label="${escapeHtml(t("aliases"))}">${aliases}</div>` : ""}
      </div>
    </div>
    <p class="entry-name">${escapeHtml(localized(entry.name))}</p>
    <p class="entry-summary">${escapeHtml(localized(entry.summary))}</p>
    <div class="entry-category-row">
      <span class="category-badge" title="${escapeAttribute(categoryLabel(entry.category_id))}">${escapeHtml(categoryLabel(entry.category_id))}</span>
    </div>
  `;

  return button;
}

function renderDetail(entry) {
  if (!entry) {
    els.detailPanel.innerHTML = `<div class="detail-empty">${escapeHtml(t("selectPrompt"))}</div>`;
    return;
  }

  const aliases = aliasList(entry);
  const sources = (entry.primary_sources || []).map((source) => sourceTemplate(source)).join("");
  const metadata = entry.entry_metadata || {};

  els.detailPanel.innerHTML = `
    <div class="detail-topline">
      <div class="term-line detail-term-line">
        <h2>${escapeHtml(entry.term)}</h2>
        ${aliases ? `<div class="aliases inline-aliases" aria-label="${escapeHtml(t("aliases"))}">${aliases}</div>` : ""}
      </div>
      <span class="category-badge" title="${escapeAttribute(categoryLabel(entry.category_id))}">${escapeHtml(categoryLabel(entry.category_id))}</span>
    </div>
    <p class="detail-name">${escapeHtml(localized(entry.name))}</p>
    <p class="detail-summary">${escapeHtml(localized(entry.summary))}</p>

    <h3>${escapeHtml(t("explanation"))}</h3>
    <p class="section-text">${escapeHtml(localized(entry.explanation))}</p>

    <h3>${escapeHtml(t("pmNotes"))}</h3>
    <p class="section-text">${escapeHtml(localized(entry.pm_notes))}</p>

    <h3>${escapeHtml(t("sources"))}</h3>
    <div class="sources">${sources}</div>

    <div class="metadata">
      <span>${escapeHtml(t("updated"))}: ${escapeHtml(metadata.updated_at || "")}</span>
      <span>${escapeHtml(t("reviewed"))}: ${escapeHtml(metadata.last_reviewed_at || "")}</span>
    </div>
  `;
}

function scrollDetailIntoView() {
  if (!window.matchMedia("(max-width: 860px)").matches) return;
  requestAnimationFrame(() => {
    els.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function aliasList(entry, limit = Infinity) {
  return (entry.aliases || [])
    .slice(0, limit)
    .map((alias) => `<span class="alias" title="${escapeAttribute(alias)}">${escapeHtml(alias)}</span>`)
    .join("");
}

function sourceTemplate(source) {
  const sourceType = labelFromSource("source_type", source.source_type);
  const relevance = labelFromSource("relevance", source.relevance);
  return `
    <a class="source-link" href="${escapeAttribute(source.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttribute(`${t("openSource")}: ${source.title}`)}">
      <strong>${escapeHtml(source.title)} ↗</strong>
      <span class="source-badges">
        <span class="source-badge">${escapeHtml(sourceType)}</span>
        <span class="source-badge">${escapeHtml(relevance)}</span>
      </span>
    </a>
  `;
}

function getFilteredEntries() {
  const query = normalize(state.query);
  return [...state.data.entries]
    .filter((entry) => state.categoryId === "all" || entry.category_id === state.categoryId)
    .map((entry) => ({ entry, score: searchScore(entry, query) }))
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => {
      if (query && a.score !== b.score) return b.score - a.score;
      return sortValue(a.entry).localeCompare(sortValue(b.entry), undefined, { sensitivity: "base" });
    })
    .map((item) => item.entry);
}

function searchScore(entry, query) {
  if (!query) return 1;
  const term = normalize(entry.term);
  const aliases = (entry.aliases || []).map(normalize);
  if (term === query || aliases.includes(query)) return 100;
  if (term.includes(query) || aliases.some((alias) => alias.includes(query))) return 80;
  const fields = [
    entry.name?.zh,
    entry.name?.en,
    entry.summary?.zh,
    entry.summary?.en,
    entry.explanation?.zh,
    entry.explanation?.en,
    entry.pm_notes?.zh,
    entry.pm_notes?.en,
    categoryLabel(entry.category_id, "zh"),
    categoryLabel(entry.category_id, "en"),
  ];
  return normalize(fields.join(" ")).includes(query) ? 40 : 0;
}

function sortValue(entry) {
  return normalize(entry.sort_key || entry.term);
}

function countByCategory() {
  return state.data.entries.reduce((map, entry) => {
    map.set(entry.category_id, (map.get(entry.category_id) || 0) + 1);
    return map;
  }, new Map());
}

function categoryLabel(categoryId, locale = state.locale) {
  const category = state.data.categories.find((item) => item.category_id === categoryId);
  return localized(category?.label, locale) || "";
}

function labelFromSource(group, key) {
  return localized(state.data.source_labels?.[group]?.[key]) || key || "";
}

function localized(value, locale = state.locale) {
  if (!value || typeof value !== "object") return value || "";
  const fallback = state.data?.metadata?.default_locale || "zh";
  return value[locale] || value[fallback] || "";
}

function t(key) {
  return ui[state.locale]?.[key] || ui.zh[key] || key;
}

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function showError(message, details = []) {
  els.entryList.innerHTML = `
    <div class="error-state">
      <strong>${escapeHtml(message)}</strong>
      ${details.length ? `<ul>${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>` : ""}
    </div>
  `;
  els.detailPanel.innerHTML = "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
