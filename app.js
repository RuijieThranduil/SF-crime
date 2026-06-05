(function () {
  const data = window.PROJECT_DATA;
  if (!data) {
    document.body.innerHTML = '<main class="section"><h1>Project data is missing.</h1><p>Run scripts/extract_sf_crime.py to generate data/project-data.js.</p></main>';
    return;
  }

  const formatNumber = new Intl.NumberFormat("en-US");
  const findingOrder = ["categories", "districts", "monthly", "hourly"];
  let activeFinding = findingOrder[0];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value || "";
  }

  function renderHeader() {
    setText("project-title", data.meta.title);
    setText("project-subtitle", data.meta.subtitle);
    setText("source-pill", data.meta.notebook);
    setText("footer-source", data.meta.sourcePath);

    const tools = document.getElementById("tool-list");
    tools.innerHTML = "";
    data.meta.tools.forEach((tool) => tools.appendChild(el("span", "chip", tool)));

    const snapshot = document.getElementById("snapshot");
    snapshot.innerHTML = "";
    [
      ["Notebook", data.meta.notebook],
      ["Coverage", data.meta.dateRange],
      ["Output", "Static HTML/CSS/JS"],
      ["Source", data.meta.projectFolder],
    ].forEach(([label, value]) => {
      snapshot.appendChild(el("dt", "", label));
      snapshot.appendChild(el("dd", "", value));
    });
  }

  function renderStory() {
    const cards = document.getElementById("story-cards");
    cards.innerHTML = "";
    [
      ["Problem", data.story.problem],
      ["Approach", data.story.approach],
      ["Outcome", data.story.outcome],
    ].forEach(([title, body]) => {
      const card = el("article", "story-card");
      card.appendChild(el("h3", "", title));
      card.appendChild(el("p", "", body));
      cards.appendChild(card);
    });
  }

  function renderWorkflow() {
    const workflow = document.getElementById("workflow");
    workflow.innerHTML = "";
    data.workflow.forEach((step, index) => {
      const item = el("article", "timeline-item");
      item.appendChild(el("span", "timeline-step", String(index + 1)));
      item.appendChild(el("h3", "", step.title));
      item.appendChild(el("p", "", step.detail));
      workflow.appendChild(item);
    });
  }

  function scale(value, max, size) {
    if (!max) return 0;
    return (value / max) * size;
  }

  function svgNode(name, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function drawBars(finding) {
    const rows = finding.data || [];
    if (!rows.length) return el("p", "empty-state", "No extracted data available for this view.");

    const width = Math.max(620, rows.length * 74);
    const height = 340;
    const pad = { top: 22, right: 24, bottom: 86, left: 74 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const max = Math.max(...rows.map((row) => Number(row[finding.yKey]) || 0));
    const gap = 12;
    const barW = (plotW - gap * (rows.length - 1)) / rows.length;
    const svg = svgNode("svg", { class: "chart-svg", viewBox: `0 0 ${width} ${height}`, role: "img" });

    svg.appendChild(svgNode("line", { x1: pad.left, y1: pad.top, x2: pad.left, y2: pad.top + plotH, stroke: "#cbd5e1" }));
    svg.appendChild(svgNode("line", { x1: pad.left, y1: pad.top + plotH, x2: pad.left + plotW, y2: pad.top + plotH, stroke: "#cbd5e1" }));

    rows.forEach((row, index) => {
      const value = Number(row[finding.yKey]) || 0;
      const x = pad.left + index * (barW + gap);
      const h = scale(value, max, plotH);
      const y = pad.top + plotH - h;
      const rect = svgNode("rect", { class: "bar", x, y, width: Math.max(10, barW), height: h, rx: 4 });
      rect.appendChild(svgNode("title"));
      rect.querySelector("title").textContent = `${row[finding.xKey]}: ${formatNumber.format(value)}`;
      svg.appendChild(rect);

      const label = svgNode("text", { class: "axis-label", x: x + barW / 2, y: pad.top + plotH + 18, "text-anchor": "middle", transform: `rotate(35 ${x + barW / 2} ${pad.top + plotH + 18})` });
      label.textContent = row[finding.xKey];
      svg.appendChild(label);
    });

    [0, 0.5, 1].forEach((tick) => {
      const y = pad.top + plotH - tick * plotH;
      const label = svgNode("text", { class: "axis-label", x: pad.left - 10, y: y + 4, "text-anchor": "end" });
      label.textContent = formatNumber.format(Math.round(max * tick));
      svg.appendChild(label);
    });

    return svg;
  }

  function drawLines(finding) {
    const rows = finding.data || [];
    if (!rows.length) return el("p", "empty-state", "No extracted data available for this view.");

    const width = 720;
    const height = 340;
    const pad = { top: 26, right: 28, bottom: 46, left: 74 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const years = [...new Set(rows.map((row) => String(row[finding.seriesKey])))].sort();
    const max = Math.max(...rows.map((row) => Number(row[finding.yKey]) || 0));
    const months = [...new Set(rows.map((row) => Number(row[finding.xKey])))].sort((a, b) => a - b);
    const svg = svgNode("svg", { class: "chart-svg", viewBox: `0 0 ${width} ${height}`, role: "img" });

    svg.appendChild(svgNode("line", { x1: pad.left, y1: pad.top, x2: pad.left, y2: pad.top + plotH, stroke: "#cbd5e1" }));
    svg.appendChild(svgNode("line", { x1: pad.left, y1: pad.top + plotH, x2: pad.left + plotW, y2: pad.top + plotH, stroke: "#cbd5e1" }));

    months.forEach((month) => {
      const x = pad.left + ((month - 1) / 11) * plotW;
      const label = svgNode("text", { class: "axis-label", x, y: pad.top + plotH + 24, "text-anchor": "middle" });
      label.textContent = String(month).padStart(2, "0");
      svg.appendChild(label);
    });

    years.forEach((year) => {
      const points = rows
        .filter((row) => String(row[finding.seriesKey]) === year)
        .map((row) => {
          const month = Number(row[finding.xKey]);
          const value = Number(row[finding.yKey]) || 0;
          const x = pad.left + ((month - 1) / 11) * plotW;
          const y = pad.top + plotH - scale(value, max, plotH);
          return [x, y, value];
        });

      const path = svgNode("path", {
        class: `line-${year}`,
        d: points.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" "),
        fill: "none",
        stroke: "#0f766e",
        "stroke-width": 3,
      });
      svg.appendChild(path);

      points.forEach(([x, y, value]) => {
        const dot = svgNode("circle", { cx: x, cy: y, r: 4, fill: "currentColor" });
        dot.appendChild(svgNode("title"));
        dot.querySelector("title").textContent = `${year}: ${formatNumber.format(value)}`;
        svg.appendChild(dot);
      });
    });

    const legend = svgNode("g", { transform: `translate(${pad.left}, 12)` });
    years.forEach((year, index) => {
      const x = index * 86;
      legend.appendChild(svgNode("line", { class: `line-${year}`, x1: x, y1: 0, x2: x + 24, y2: 0, "stroke-width": 3 }));
      const label = svgNode("text", { class: "axis-label", x: x + 31, y: 4 });
      label.textContent = year;
      legend.appendChild(label);
    });
    svg.appendChild(legend);

    return svg;
  }

  function renderTable(rows, columns) {
    const table = el("table", "data-table");
    const thead = el("thead");
    const headRow = el("tr");
    columns.forEach((column) => headRow.appendChild(el("th", "", column)));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = el("tbody");
    rows.slice(0, 12).forEach((row) => {
      const tr = el("tr");
      columns.forEach((column) => {
        const value = row[column];
        tr.appendChild(el("td", "", typeof value === "number" ? formatNumber.format(value) : value));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  function renderFinding() {
    const finding = data.findings[activeFinding];
    const panel = document.getElementById("finding-panel");
    panel.innerHTML = "";

    const header = el("div", "finding-header");
    const text = el("div");
    text.appendChild(el("h3", "", finding.title));
    text.appendChild(el("p", "", finding.summary));
    header.appendChild(text);
    header.appendChild(el("p", "chart-note", `${(finding.data || []).length} extracted rows`));
    panel.appendChild(header);

    const chartWrap = el("div", "chart-wrap");
    chartWrap.appendChild(activeFinding === "monthly" ? drawLines(finding) : drawBars(finding));
    panel.appendChild(chartWrap);

    const columns = Object.keys((finding.data || [])[0] || {});
    if (columns.length) panel.appendChild(renderTable(finding.data, columns));
  }

  function renderTabs() {
    const tabs = document.getElementById("finding-tabs");
    tabs.innerHTML = "";
    findingOrder.forEach((key) => {
      const finding = data.findings[key];
      const tab = el("button", "tab", finding.title);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(key === activeFinding));
      tab.addEventListener("click", () => {
        activeFinding = key;
        renderTabs();
        renderFinding();
      });
      tabs.appendChild(tab);
    });
  }

  function renderSkillsAndEvidence() {
    const skills = document.getElementById("skills-list");
    skills.innerHTML = "";
    data.skills.forEach((skill) => skills.appendChild(el("li", "", skill)));

    const questions = document.getElementById("questions");
    questions.innerHTML = "";
    data.evidence.questions.forEach((question) => {
      const card = el("article", "question-card");
      card.appendChild(el("strong", "", question.id));
      card.appendChild(el("p", "", question.prompt || "Notebook analysis question"));
      questions.appendChild(card);
    });

    document.getElementById("schema").textContent = (data.evidence.schema || []).join("\n");
    const limits = document.getElementById("limits");
    limits.innerHTML = "";
    data.limits.forEach((limit) => limits.appendChild(el("li", "", limit)));
  }

  renderHeader();
  renderStory();
  renderWorkflow();
  renderTabs();
  renderFinding();
  renderSkillsAndEvidence();
})();
