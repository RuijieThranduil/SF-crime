"""Extract a stable frontend payload from the SF Crime notebook.

The script intentionally keeps the extraction conservative: it reads notebook
markdown and selected Spark text outputs, then writes a JavaScript data file
that the static page can consume directly from the filesystem.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = Path(r"C:\Users\94903\Desktop\L\SF-Crime\SF_crime.ipynb")
OUTPUT_PATH = ROOT / "data" / "project-data.js"


def cell_source(cell: dict) -> str:
    source = cell.get("source", "")
    if isinstance(source, list):
        return "".join(source)
    return str(source)


def output_text(cell: dict) -> str:
    chunks: list[str] = []
    for output in cell.get("outputs", []):
        if "text" in output:
            text = output["text"]
            chunks.append("".join(text) if isinstance(text, list) else str(text))
        data = output.get("data") or {}
        plain = data.get("text/plain")
        if plain:
            chunks.append("".join(plain) if isinstance(plain, list) else str(plain))
    return "\n".join(chunks)


def parse_spark_table(text: str) -> list[dict[str, str | int]]:
    lines = [line.rstrip() for line in text.splitlines() if line.strip()]
    table_lines = [line for line in lines if line.startswith("|") and line.endswith("|")]
    if len(table_lines) < 2:
        return []

    headers = [part.strip() for part in table_lines[0].strip("|").split("|")]
    rows: list[dict[str, str | int]] = []
    for line in table_lines[1:]:
        values = [part.strip() for part in line.strip("|").split("|")]
        if len(values) != len(headers):
            continue
        row: dict[str, str | int] = {}
        for header, value in zip(headers, values):
            row[header] = int(value) if re.fullmatch(r"-?\d+", value) else value
        rows.append(row)
    return rows


def find_first(cells: list[dict], needle: str) -> dict | None:
    for cell in cells:
        text = cell_source(cell) + "\n" + output_text(cell)
        if needle in text:
            return cell
    return None


def find_output_after_source(cells: list[dict], source_needle: str) -> str:
    cell = find_first(cells, source_needle)
    return output_text(cell) if cell else ""


def extract_questions(cells: list[dict]) -> list[dict[str, str]]:
    questions: list[dict[str, str]] = []
    for cell in cells:
        if cell.get("cell_type") != "markdown":
            continue
        source = cell_source(cell).strip()
        if not source.startswith("# Q"):
            continue
        cleaned = source.replace("\u951b", ":").replace("\u6b55n", "\n").replace("\u5861n", "\n")
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        match = re.match(r"#\s*(Q\d+)\s*:?\s*(.*)", cleaned, flags=re.I)
        if match:
            questions.append({"id": match.group(1).upper(), "prompt": match.group(2)})
    return questions


def build_payload() -> dict:
    if not NOTEBOOK_PATH.exists():
        raise FileNotFoundError(f"Notebook not found: {NOTEBOOK_PATH}")

    notebook = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))
    cells = notebook.get("cells", [])

    category_rows = parse_spark_table(find_output_after_source(cells, "GROUP BY category"))
    district_rows = parse_spark_table(find_output_after_source(cells, "PdDistrict , COUNT"))
    monthly_rows = parse_spark_table(find_output_after_source(cells, "HAVING Year IN"))
    hourly_rows = parse_spark_table(find_output_after_source(cells, "substring(Time,1,2) as Hour"))
    schema_text = find_output_after_source(cells, "df.printSchema()")

    payload = {
        "meta": {
            "title": "San Francisco Crime Analysis",
            "subtitle": "A Spark SQL case study turning large public safety records into recruiter-readable analytical evidence.",
            "sourcePath": str(NOTEBOOK_PATH),
            "notebook": NOTEBOOK_PATH.name,
            "projectFolder": str(NOTEBOOK_PATH.parent),
            "dateRange": "Historical incidents, 2003 to May 2018; trend focus on 2015-2018",
            "generatedAt": "Generated from notebook outputs",
            "tools": ["Python", "PySpark", "Spark SQL", "Pandas", "Matplotlib", "Notebook analysis"],
        },
        "story": {
            "problem": "Explore San Francisco incident records at city scale and identify patterns that can support travel guidance and police resource allocation.",
            "approach": "Load the raw CSV with Spark, register a SQL view, aggregate by category, district, month, and hour, then convert selected results to Pandas for visualization.",
            "outcome": "The analysis surfaces concentrated district risk, dominant theft-related categories, seasonal trend comparisons, and hourly peaks useful for operational recommendations.",
        },
        "workflow": [
            {
                "title": "Spark ingestion",
                "detail": "Initialize a SparkSession and infer schema from the incident CSV without copying the source data into the web artifact.",
            },
            {
                "title": "SQL-first aggregation",
                "detail": "Register the DataFrame as sf_crime and use Spark SQL to compute category, district, month, and hour summaries.",
            },
            {
                "title": "Visualization handoff",
                "detail": "Convert compact aggregate outputs to chart-ready arrays for browser rendering.",
            },
            {
                "title": "Decision framing",
                "detail": "Translate raw counts into recruiter-friendly findings about risk concentration, timing, and operational action.",
            },
        ],
        "findings": {
            "categories": {
                "title": "Top Crime Categories",
                "summary": "Larceny/theft is the largest category in the extracted top-ten output, followed by other offenses and non-criminal records.",
                "xKey": "category",
                "yKey": "Count",
                "data": category_rows[:10],
            },
            "districts": {
                "title": "District Concentration",
                "summary": "Southern, Mission, and Northern districts have the highest incident counts in the notebook output.",
                "xKey": "PdDistrict",
                "yKey": "Count",
                "data": [row for row in district_rows if row.get("PdDistrict") != "NA"],
            },
            "monthly": {
                "title": "Monthly Trend, 2015-2018",
                "summary": "The month-by-year table enables comparison across recent complete years before the dataset cutoff.",
                "xKey": "Month",
                "seriesKey": "Year",
                "yKey": "Count",
                "data": monthly_rows,
            },
            "hourly": {
                "title": "Hourly Distribution",
                "summary": "Incident volume rises through the day and peaks around early evening, supporting practical travel-safety discussion.",
                "xKey": "Hour",
                "yKey": "Count",
                "data": hourly_rows,
            },
        },
        "skills": [
            "Large-file ingestion with Spark",
            "Spark SQL aggregation and grouping",
            "Schema inspection and feature selection",
            "Notebook-to-web data extraction",
            "Data storytelling for non-technical review",
        ],
        "evidence": {
            "questions": extract_questions(cells),
            "schema": schema_text.splitlines()[:22],
            "rawTables": {
                "category": category_rows,
                "district": district_rows,
                "monthly": monthly_rows,
                "hourly": hourly_rows,
            },
        },
        "limits": [
            "This page uses aggregate notebook outputs, not the full source CSV.",
            "Counts are descriptive and should not be read as causal claims.",
            "Notebook text includes a few encoding artifacts; the showcase cleans only visible labels needed for presentation.",
        ],
    }
    return payload


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, indent=2, ensure_ascii=True)
    OUTPUT_PATH.write_text(f"window.PROJECT_DATA = {serialized};\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
