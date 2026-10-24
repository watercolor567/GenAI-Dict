import csv
import json
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "source_terms.csv"
JSON_PATH = ROOT / "data.json"

REQUIRED_COLUMNS = [
    "id", "term", "aliases", "category_id", "category_zh", "category_en",
    "name_zh", "name_en", "summary_zh", "summary_en",
    "explanation_zh", "explanation_en", "pm_notes_zh", "pm_notes_en",
    "primary_sources", "created_at", "updated_at", "last_reviewed_at",
    "change_type", "change_note_zh", "sort_key",
]

def fail(message):
    raise SystemExit(f"CSV to JSON validation failed: {message}")

with CSV_PATH.open(encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)
    missing = set(REQUIRED_COLUMNS) - set(reader.fieldnames or [])
    if missing:
        fail(f"missing CSV columns: {sorted(missing)}")
    rows = list(reader)

if not rows:
    fail("source_terms.csv contains no entries")

with JSON_PATH.open(encoding="utf-8") as file:
    data = json.load(file)

categories = {item["category_id"]: item for item in data["categories"]}
source_labels = data["source_labels"]
entries = []
ids = set()
terms = set()
category_counts = Counter()

for line_number, row in enumerate(rows, start=2):
    for key in REQUIRED_COLUMNS:
        if row.get(key) is None or row[key] == "":
            if key not in ("change_type", "change_note_zh"):
                fail(f"row {line_number}: empty required field {key}")

    entry_id = row["id"]
    term_key = row["term"].casefold()
    if entry_id in ids:
        fail(f"row {line_number}: duplicate id {entry_id}")
    if term_key in terms:
        fail(f"row {line_number}: duplicate term {row['term']}")
    ids.add(entry_id)
    terms.add(term_key)

    category_id = row["category_id"]
    if category_id not in categories:
        fail(f"row {line_number}: unknown category_id {category_id}")
    category = categories[category_id]
    category["label"] = {
        "zh": row["category_zh"],
        "en": row["category_en"],
    }
    category_counts[category_id] += 1

    try:
        aliases = json.loads(row["aliases"])
        sources = json.loads(row["primary_sources"])
    except json.JSONDecodeError as error:
        fail(f"row {line_number}: invalid JSON column: {error}")

    if not isinstance(aliases, list) or not all(isinstance(x, str) for x in aliases):
        fail(f"row {line_number}: aliases must be a JSON string array")
    if not isinstance(sources, list) or len(sources) > 2:
        fail(f"row {line_number}: primary_sources must be an array of at most two items")

    for source in sources:
        if not isinstance(source, dict):
            fail(f"row {line_number}: each source must be an object")
        if source.get("source_type") not in source_labels["source_type"]:
            fail(f"row {line_number}: unknown source_type")
        if source.get("relevance") not in source_labels["relevance"]:
            fail(f"row {line_number}: unknown source relevance")

    entries.append({
        "id": entry_id,
        "term": row["term"],
        "aliases": aliases,
        "category_id": category_id,
        "name": {"zh": row["name_zh"], "en": row["name_en"]},
        "summary": {"zh": row["summary_zh"], "en": row["summary_en"]},
        "explanation": {"zh": row["explanation_zh"], "en": row["explanation_en"]},
        "pm_notes": {"zh": row["pm_notes_zh"], "en": row["pm_notes_en"]},
        "primary_sources": sources,
        "entry_metadata": {
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "last_reviewed_at": row["last_reviewed_at"],
            "change_type": row["change_type"],
            "change_note": row["change_note_zh"],
        },
        "sort_key": row["sort_key"],
    })

for category in data["categories"]:
    category["count"] = category_counts[category["category_id"]]

data["metadata"]["dataset_updated_at"] = date.today().isoformat()
data["metadata"]["entry_count"] = len(entries)
data["metadata"]["category_count"] = len(categories)
data["entries"] = entries

with JSON_PATH.open("w", encoding="utf-8", newline="\n") as file:
    json.dump(data, file, ensure_ascii=False, indent=2)
    file.write("\n")

print(f"Generated data.json with {len(entries)} entries.")
