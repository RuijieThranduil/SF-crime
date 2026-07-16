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
REPOSITORY_URL = "https://github.com/RuijieThranduil/SF-crime"
NOTEBOOK_URL = f"{REPOSITORY_URL}/blob/main/SF_crime.ipynb"
DATASET_URL = "https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry"


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


def validate_payload(payload: dict) -> list[str]:
    findings = payload["findings"]
    required = ("categories", "districts", "monthly", "hourly")
    missing = [name for name in required if not findings[name]["data"]]
    if missing:
        raise ValueError(f"Missing extracted finding data: {', '.join(missing)}")

    raw_districts = payload["evidence"]["rawTables"]["district"]
    district_total = sum(int(row["Count"]) for row in raw_districts)
    hourly_total = sum(int(row["Count"]) for row in findings["hourly"]["data"])
    expected_total = int(payload["engineering"]["scale"]["recordCount"])
    if district_total != expected_total or hourly_total != expected_total:
        raise ValueError(
            "Independent district and hourly totals must both reconcile to "
            f"{expected_total:,}; got {district_total:,} and {hourly_total:,}."
        )

    hours = {int(row["Hour"]) for row in findings["hourly"]["data"]}
    if hours != set(range(24)):
        raise ValueError("Hourly extraction must contain one row for every hour from 0 through 23.")

    years = {int(row["Year"]) for row in findings["monthly"]["data"]}
    expected_years = {2015, 2016, 2017, 2018}
    if not expected_years.issubset(years):
        raise ValueError("Monthly extraction must cover 2015 through 2018.")

    return [
        f"Independent district and hourly totals reconcile to {expected_total:,} records.",
        "Hourly output contains all 24 unique hour buckets.",
        "Monthly output covers every year from 2015 through the May 2018 cutoff.",
    ]


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
    record_count = sum(int(row.get("Count", 0)) for row in district_rows)
    field_count = sum(1 for line in schema_text.splitlines() if "|--" in line)

    payload = {
        "meta": {
            "title": "San Francisco Crime Analysis",
            "subtitle": "An end-to-end Spark case study transforming city-scale public safety data into verifiable analytical evidence.",
            "sourcePath": str(NOTEBOOK_PATH),
            "notebook": NOTEBOOK_PATH.name,
            "projectFolder": str(NOTEBOOK_PATH.parent),
            "dateRange": "Historical incidents, 2003 to May 2018; trend focus on 2015-2018",
            "generatedAt": "Generated from notebook outputs",
            "tools": ["Python", "PySpark", "Spark SQL", "Pandas", "Matplotlib", "Notebook analysis"],
        },
        "story": {
            "problem": "Transform more than two million San Francisco incident records into a clear, defensible view of where and when urban risk concentrates.",
            "approach": "Designed an end-to-end analytical path: Spark ingestion, schema inspection, feature preparation, SQL aggregation, bounded Pandas handoff, and reusable browser delivery.",
            "outcome": "Delivered a traceable risk narrative spanning category concentration, district pressure, seasonal movement, and hourly peaks for travel and resource-planning decisions.",
        },
        "engineering": {
            "summary": "I engineered the complete path from a 2.07M-row public CSV to a browser-ready analytical product: Spark ingestion, schema inspection, feature preparation, distributed aggregation, bounded visualization handoff, validation, and static delivery.",
            "scale": {
                "recordCount": record_count,
                "fieldCount": field_count,
                "dateRange": "2003 to May 2018",
                "trendRange": "2015-2018",
            },
            "whySpark": "Spark is the right engine for this city-scale workload: full-data scans, coordinate filtering, date derivation, and grouped aggregations stay distributed, while only compact result tables cross into Pandas and the browser.",
            "built": [
                {
                    "title": "Schema-aware ingestion",
                    "detail": "Initialized a SparkSession, loaded the public CSV with headers and inferred types, then inspected the 15-field schema before analysis.",
                    "evidence": "Notebook cells 3-5",
                },
                {
                    "title": "Feature preparation",
                    "detail": "Selected analysis fields, parsed the source date into IncidentDate, derived month and year, and cast coordinates for geographic filtering.",
                    "evidence": "Notebook cells 15-16",
                },
                {
                    "title": "Distributed aggregation",
                    "detail": "Registered a Spark SQL view and computed category, district, monthly, hourly, and bounded-area summaries before collecting any results.",
                    "evidence": "Notebook cells 7, 11, 14, 19, 22",
                },
                {
                    "title": "Bounded visualization handoff",
                    "detail": "Converted only compact aggregate outputs to Pandas for plotting, rather than moving the 2.07M raw rows to the driver.",
                    "evidence": "Notebook cells 8, 12, 20",
                },
                {
                    "title": "Reusable static delivery",
                    "detail": "Built a Python extractor that parses saved Spark outputs into a stable JavaScript payload consumed by a backend-free showcase.",
                    "evidence": "scripts/extract_sf_crime.py",
                },
            ],
            "quality": [
                {
                    "label": "Performance boundary",
                    "detail": "Full scans and groupings remain in Spark; Pandas and browser rendering receive reduced summaries only.",
                },
                {
                    "label": "Traceable validation",
                    "detail": "Displayed metrics are parsed directly from saved Spark output and checked for total, hourly, and year coverage during payload generation.",
                },
                {
                    "label": "Failure handling",
                    "detail": "The frontend treats each finding as optional and renders a readable fallback when an extracted table is missing.",
                },
                {
                    "label": "Production next step",
                    "detail": "Replace inferSchema with an explicit schema, persist reused frames, benchmark partition choices, and move the existing payload checks upstream. These are documented next steps, not claimed results.",
                },
            ],
            "links": [
                {
                    "label": "GitHub repository",
                    "detail": "Source, extractor, and static showcase",
                    "url": REPOSITORY_URL,
                },
                {
                    "label": "Jupyter notebook",
                    "detail": "Spark queries, outputs, and visual analysis",
                    "url": NOTEBOOK_URL,
                },
                {
                    "label": "Official DataSF source",
                    "detail": "SFPD historical incidents, 2.07M rows",
                    "url": DATASET_URL,
                },
            ],
        },
        "workflow": [
            {
                "title": "Schema-aware Spark ingestion",
                "detail": "Initialize a SparkSession, read the 2.07M-row public CSV, infer its 15-field schema, and inspect representative records.",
            },
            {
                "title": "Feature preparation",
                "detail": "Select analysis fields, parse incident dates, derive month and year, and cast coordinates for bounded geographic filtering.",
            },
            {
                "title": "SQL-first aggregation",
                "detail": "Register the DataFrame as sf_crime and compute category, district, month, hour, and downtown Sunday summaries in Spark.",
            },
            {
                "title": "Bounded visualization handoff",
                "detail": "Collect only compact aggregate outputs into Pandas and chart-ready arrays, keeping raw rows out of the browser payload.",
            },
            {
                "title": "Payload extraction and validation",
                "detail": "Parse saved Spark outputs, validate record totals and time coverage, and emit a stable frontend data contract.",
            },
            {
                "title": "Static delivery",
                "detail": "Render the payload as a responsive, backend-free case study that can be deployed directly on GitHub Pages.",
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
            "The notebook uses inferred schema and does not include runtime benchmarks, caching experiments, or an automated analysis test suite.",
            "Notebook text includes a few encoding artifacts; the showcase cleans only visible labels needed for presentation.",
        ],
    }
    payload["engineering"]["validation"] = validate_payload(payload)
    return payload


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, indent=2, ensure_ascii=True)
    OUTPUT_PATH.write_text(f"window.PROJECT_DATA = {serialized};\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
