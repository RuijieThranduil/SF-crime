# SF Crime Project Showcase

Static web showcase for a PySpark notebook analysis of San Francisco crime data.

Open `index.html` directly to view the standalone project page. The page is built from the extracted notebook payload in `data/project-data.js`, with source files kept separately for reuse:

- `template.html`: standalone page template
- `styles.css`: page styling
- `app.js`: browser rendering logic
- `scripts/extract_sf_crime.py`: notebook-to-payload extractor
- `scripts/build_page.py`: single-file page builder

The generated `index.html` is self-contained so it can be opened locally or hosted on GitHub Pages.
