# SF Crime Project Showcase

Static web showcase for a PySpark notebook analysis of San Francisco crime data.

The project analyzes 2,071,736 historical SFPD incident records across 15 source fields. Full-data scans and grouped aggregations stay in Spark; only compact result tables are handed to Pandas and the static browser payload.

## Live Demo

[Open the showcase page](https://ruijiethranduil.github.io/SF-crime/)

## Verify the Work

- [Open the Jupyter notebook](./SF_crime.ipynb)
- [View the official DataSF dataset](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry)
- [Browse the repository](https://github.com/RuijieThranduil/SF-crime)

The original CSV contains about 2.07 million rows and is linked from its authoritative DataSF source instead of being duplicated in the static site. The payload extractor checks district totals, 24-hour coverage, and 2015-2018 monthly coverage before writing frontend data.

Open `index.html` directly to view the static project page. No backend or build step is required.

## Project Structure

- `index.html`: deployable showcase page
- `cinematic.css`: responsive visual system and motion
- `cinematic.js`: payload rendering, charts, and interactions
- `data/project-data.js`: stable frontend payload generated from notebook outputs
- `scripts/extract_sf_crime.py`: notebook-to-payload extraction and validation
- `SF_crime.ipynb`: source Jupyter notebook
- `assets/`: video and photographic presentation assets

Run `scripts/extract_sf_crime.py` to regenerate the payload after notebook outputs change. The script verifies independent record totals, 24-hour coverage, and the 2015-2018 monthly range before writing frontend data.
