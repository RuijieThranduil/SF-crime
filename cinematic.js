(function () {
  "use strict";

  const data = window.PROJECT_DATA;
  const numberFormat = new Intl.NumberFormat("en-US");
  const compactFormat = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const findingOrder = ["categories", "districts", "monthly", "hourly"];
  const findingPresentation = {
    categories: {
      number: "01",
      tab: "Crime categories",
      label: "Category distribution",
      headline: "Theft dominates the incident mix.",
      statValue: "477,975",
      statName: "Larceny / Theft",
      statNote: "23.1% of all extracted incidents",
      chartTitle: "Top 10 categories",
      chartNote: "Counts shown exactly as extracted from the notebook output.",
    },
    districts: {
      number: "02",
      tab: "Police districts",
      label: "District concentration",
      headline: "Incident volume is not evenly distributed.",
      statValue: "378,453",
      statName: "Southern district",
      statNote: "18.3% of the district total",
      chartTitle: "Incidents by police district",
      chartNote: "One notebook row with an unavailable district is omitted from the chart.",
    },
    monthly: {
      number: "03",
      tab: "Monthly trend",
      label: "2015-2018 comparison",
      headline: "Recent complete years follow a steady rhythm.",
      statValue: "13,037",
      statName: "Highest monthly point",
      statNote: "March 2015; 2018 ends in May",
      chartTitle: "Monthly incidents by year",
      chartNote: "2018 is a partial year in the source data and should not be compared as a full-year total.",
    },
    hourly: {
      number: "04",
      tab: "Hour of day",
      label: "Hourly distribution",
      headline: "Incident volume crests in early evening.",
      statValue: "18:00",
      statName: "Daily peak",
      statNote: "132,503 incidents at 6 PM",
      chartTitle: "Incidents by hour",
      chartNote: "Descriptive citywide distribution across the notebook dataset.",
    },
  };

  const cleanedQuestions = {
    Q1: "Count incidents by crime category, including robbery and vehicle theft.",
    Q2: "Count and visualize incidents across police districts.",
    Q3: "Analyze Sunday incidents in downtown San Francisco using geographic boundaries.",
    Q4: "Compare monthly incidents across 2015-2018 and explain the business impact.",
    Q5: "Analyze incidents by hour for selected dates and develop practical travel guidance.",
    Q6: "Define danger, identify the three highest-risk districts, and connect category and time patterns to police allocation.",
  };

  let activeFinding = "categories";

  function text(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value || "";
  }

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function setProjectStory() {
    if (!data) return;
    text("project-problem", data.story?.problem);
    text("project-approach", data.story?.approach);
    text("project-outcome", data.story?.outcome);

    const capabilityStrip = document.getElementById("capability-strip");
    const capabilities = [
      ["01", "Ingest", "Load and infer the large public incident schema with Spark."],
      ["02", "Query", "Aggregate categories, districts, months and hours in Spark SQL."],
      ["03", "Translate", "Move compact results into chart-ready browser payloads."],
      ["04", "Communicate", "Frame evidence for travel context and resource decisions."],
    ];

    capabilities.forEach(([index, title, detail]) => {
      const item = element("article", "capability");
      item.append(element("span", "", index));
      item.append(element("strong", "", title));
      item.append(element("p", "", detail));
      capabilityStrip.append(item);
    });
  }

  function renderEngineering() {
    const engineering = data?.engineering;
    if (!engineering) return;

    text("engineering-summary", engineering.summary);
    text("why-spark", engineering.whySpark);

    const scale = engineering.scale || {};
    const scaleStrip = document.getElementById("scale-strip");
    const scaleFacts = [
      [numberFormat.format(Number(scale.recordCount) || 0), "records processed"],
      [String(scale.fieldCount || "N/A"), "source fields"],
      [scale.dateRange || "N/A", "historical coverage"],
      [scale.trendRange || "N/A", "recent trend focus"],
    ];
    scaleFacts.forEach(([value, label]) => {
      const fact = element("div", "scale-fact");
      fact.append(element("dt", "", value), element("dd", "", label));
      scaleStrip?.append(fact);
    });

    const buildList = document.getElementById("build-list");
    const buildItems = Array.isArray(engineering.built) ? engineering.built : [];
    buildItems.forEach((entry, index) => {
      const item = element("li", "build-item");
      const copy = element("div", "build-item-copy");
      copy.append(
        element("h3", "", entry.title),
        element("p", "", entry.detail),
        element("span", "build-evidence", entry.evidence),
      );
      item.append(element("span", "build-number", String(index + 1).padStart(2, "0")), copy);
      buildList?.append(item);
    });

    const qualityList = document.getElementById("quality-list");
    const qualityItems = Array.isArray(engineering.quality) ? engineering.quality : [];
    qualityItems.forEach((entry) => {
      const item = element("div", "quality-item");
      item.append(element("strong", "", entry.label), element("p", "", entry.detail));
      qualityList?.append(item);
    });

    const validationList = document.getElementById("validation-list");
    const validationItems = Array.isArray(engineering.validation) ? engineering.validation : [];
    validationItems.forEach((message) => validationList?.append(element("li", "", message)));

    const links = Array.isArray(engineering.links) ? engineering.links : [];
    const proofLinks = document.getElementById("proof-links");
    links.forEach((entry) => {
      const link = element("a", "proof-link");
      const isLocalNotebook = entry.label === "Jupyter notebook" && window.location.protocol === "file:";
      link.href = isLocalNotebook ? "SF_crime.ipynb" : entry.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.append(
        element("strong", "", entry.label),
        element("span", "", entry.detail),
        element("i", "", "↗"),
      );
      proofLinks?.append(link);
    });

    const repositoryUrl = links.find((entry) => entry.label === "GitHub repository")?.url;
    const notebookUrl = links.find((entry) => entry.label === "Jupyter notebook")?.url;
    const resolvedNotebookUrl = window.location.protocol === "file:" ? "SF_crime.ipynb" : notebookUrl;
    ["nav-github-link", "mobile-github-link", "hero-github-link"].forEach((id) => {
      const link = document.getElementById(id);
      if (link && repositoryUrl) link.href = repositoryUrl;
    });
    const footerNotebookLink = document.getElementById("footer-notebook-link");
    if (footerNotebookLink && resolvedNotebookUrl) footerNotebookLink.href = resolvedNotebookUrl;
  }
  function renderTabs() {
    const tabList = document.getElementById("finding-tabs");
    if (!tabList) return;
    tabList.replaceChildren();

    findingOrder.forEach((key) => {
      const presentation = findingPresentation[key];
      const button = element("button", "finding-tab", `${presentation.number}  ${presentation.tab}`);
      button.type = "button";
      button.id = `tab-${key}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "finding-panel");
      button.setAttribute("aria-selected", String(key === activeFinding));
      button.tabIndex = key === activeFinding ? 0 : -1;
      button.addEventListener("click", () => selectFinding(key));
      button.addEventListener("keydown", handleTabKeydown);
      tabList.append(button);
    });
  }

  function handleTabKeydown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = findingOrder.indexOf(activeFinding);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + findingOrder.length) % findingOrder.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % findingOrder.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = findingOrder.length - 1;
    selectFinding(findingOrder[nextIndex]);
    document.getElementById(`tab-${findingOrder[nextIndex]}`)?.focus();
  }

  function selectFinding(key) {
    if (!findingOrder.includes(key)) return;
    activeFinding = key;
    renderTabs();
    renderFinding();

    const panel = document.getElementById("finding-panel");
    panel.classList.remove("is-switching");
    void panel.offsetWidth;
    panel.classList.add("is-switching");
  }

  function renderFinding() {
    const finding = data?.findings?.[activeFinding];
    const presentation = findingPresentation[activeFinding];
    const rows = Array.isArray(finding?.data) ? finding.data : [];

    text("finding-number", presentation.number);
    text("finding-label", presentation.label);
    text("finding-title", presentation.headline);
    text("finding-summary", finding?.summary || "This view is not available in the extracted payload.");
    text("chart-title", presentation.chartTitle);
    text("chart-note", presentation.chartNote);

    const stat = document.getElementById("finding-stat");
    stat.replaceChildren(
      element("dt", "", rows.length ? presentation.statValue : "N/A"),
      element("dd", "", presentation.statName),
      element("dd", "", rows.length ? presentation.statNote : "No extracted rows available"),
    );

    const chart = document.getElementById("chart");
    chart.replaceChildren();
    chart.setAttribute("aria-label", rows.length ? `${finding.title}. ${finding.summary}` : "No extracted chart data available.");

    if (!rows.length) {
      chart.append(element("p", "chart-empty", "No extracted data is available for this view."));
    } else if (activeFinding === "monthly") {
      chart.append(drawLineChart(finding));
    } else {
      chart.append(drawBarChart(finding));
    }

    renderTable(rows);
  }

  function drawBarChart(finding) {
    const rows = finding.data.filter((row) => String(row[finding.xKey]).toUpperCase() !== "NA");
    const maxValue = Math.max(...rows.map((row) => Number(row[finding.yKey]) || 0), 1);
    const wrap = element("div", "bar-chart");
    wrap.style.setProperty("--columns", rows.length);

    rows.forEach((row, index) => {
      const value = Number(row[finding.yKey]) || 0;
      const column = element("div", "bar-column");
      const barSpace = element("div", "bar-space");
      const fill = element("div", "bar-fill");
      fill.style.setProperty("--height", `${Math.max((value / maxValue) * 100, 1)}%`);
      fill.style.setProperty("--delay", `${index * 45}ms`);
      fill.title = `${row[finding.xKey]}: ${numberFormat.format(value)}`;
      fill.append(element("span", "bar-value", compactFormat.format(value)));
      barSpace.append(fill);
      column.append(barSpace, element("span", "bar-label", formatAxisLabel(row[finding.xKey])));
      wrap.append(column);
    });

    return wrap;
  }

  function formatAxisLabel(value) {
    if (activeFinding === "hourly") return `${String(value).padStart(2, "0")}:00`;
    return String(value).replace("LARCENY/THEFT", "LARCENY / THEFT");
  }

  function svgElement(name, attributes = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function drawLineChart(finding) {
    const rows = finding.data;
    const width = 760;
    const height = 360;
    const padding = { top: 34, right: 28, bottom: 46, left: 56 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...rows.map((row) => Number(row[finding.yKey]) || 0), 1);
    const minValue = Math.min(...rows.map((row) => Number(row[finding.yKey]) || 0));
    const baseline = Math.max(0, Math.floor(minValue / 2000) * 2000 - 2000);
    const range = maxValue - baseline || 1;
    const years = [...new Set(rows.map((row) => String(row[finding.seriesKey])))].sort();
    const colors = ["#37c9b6", "#ffc857", "#ed5b55", "#eef4f3"];
    const svg = svgElement("svg", {
      class: "line-chart",
      viewBox: `0 0 ${width} ${height}`,
      role: "presentation",
      "aria-hidden": "true",
    });

    [0, 0.5, 1].forEach((ratio) => {
      const y = padding.top + plotHeight - ratio * plotHeight;
      svg.append(svgElement("line", {
        class: "grid-line",
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
      }));
      const label = svgElement("text", {
        class: "axis-text",
        x: padding.left - 10,
        y: y + 4,
        "text-anchor": "end",
      });
      label.textContent = compactFormat.format(Math.round(baseline + range * ratio));
      svg.append(label);
    });

    [1, 3, 5, 7, 9, 11].forEach((month) => {
      const x = padding.left + ((month - 1) / 11) * plotWidth;
      const label = svgElement("text", {
        class: "axis-text",
        x,
        y: height - 12,
        "text-anchor": "middle",
      });
      label.textContent = ["JAN", "MAR", "MAY", "JUL", "SEP", "NOV"][(month - 1) / 2];
      svg.append(label);
    });

    years.forEach((year, index) => {
      const yearRows = rows
        .filter((row) => String(row[finding.seriesKey]) === year)
        .sort((a, b) => Number(a[finding.xKey]) - Number(b[finding.xKey]));
      const color = colors[index % colors.length];
      const points = yearRows.map((row) => {
        const month = Number(row[finding.xKey]);
        const value = Number(row[finding.yKey]) || 0;
        return {
          x: padding.left + ((month - 1) / 11) * plotWidth,
          y: padding.top + plotHeight - ((value - baseline) / range) * plotHeight,
          value,
          month,
        };
      });

      const path = svgElement("path", {
        class: "series-line",
        d: points.map((point, pointIndex) => `${pointIndex ? "L" : "M"} ${point.x} ${point.y}`).join(" "),
        stroke: color,
      });
      svg.append(path);

      points.forEach((point) => {
        const dot = svgElement("circle", {
          class: "series-dot",
          cx: point.x,
          cy: point.y,
          r: 4,
          fill: color,
        });
        const title = svgElement("title");
        title.textContent = `${year}-${String(point.month).padStart(2, "0")}: ${numberFormat.format(point.value)}`;
        dot.append(title);
        svg.append(dot);
      });

      const legendX = padding.left + index * 116;
      const legendLine = svgElement("line", {
        x1: legendX,
        y1: 14,
        x2: legendX + 22,
        y2: 14,
        stroke: color,
        "stroke-width": 3,
      });
      const legendLabel = svgElement("text", {
        class: "axis-text",
        x: legendX + 30,
        y: 18,
      });
      legendLabel.textContent = year;
      svg.append(legendLine, legendLabel);
    });

    return svg;
  }

  function renderTable(rows) {
    const container = document.getElementById("finding-table");
    container.replaceChildren();
    if (!rows.length) {
      container.append(element("p", "chart-empty", "No extracted rows are available."));
      return;
    }

    const columns = Object.keys(rows[0]);
    const table = element("table", "data-table");
    const head = element("thead");
    const headRow = element("tr");
    columns.forEach((column) => headRow.append(element("th", "", column)));
    head.append(headRow);
    table.append(head);

    const body = element("tbody");
    rows.slice(0, 12).forEach((row) => {
      const tableRow = element("tr");
      columns.forEach((column) => {
        const value = row[column];
        tableRow.append(element("td", "", typeof value === "number" ? numberFormat.format(value) : value));
      });
      body.append(tableRow);
    });
    table.append(body);
    container.append(table);
  }

  function renderWorkflow() {
    const list = document.getElementById("workflow-list");
    const steps = Array.isArray(data?.workflow) ? data.workflow : [];
    steps.forEach((step) => {
      const item = element("li", "workflow-item section-reveal");
      const body = element("div", "workflow-body");
      body.append(element("h3", "", step.title), element("p", "", step.detail));
      item.append(body);
      list.append(item);
    });
  }

  function renderSkills() {
    const track = document.getElementById("skills-track");
    const skills = Array.isArray(data?.skills) && data.skills.length
      ? data.skills
      : ["PySpark", "Spark SQL", "Schema inspection", "Data storytelling"];
    [...skills, ...skills].forEach((skill) => track.append(element("span", "", skill)));
  }

  function renderEvidence() {
    const questionList = document.getElementById("question-list");
    const questions = Array.isArray(data?.evidence?.questions) ? data.evidence.questions : [];
    questions.forEach((question) => {
      const item = element("div", "question-item");
      item.append(
        element("strong", "", question.id),
        element("p", "", cleanedQuestions[question.id] || question.prompt || "Notebook analysis question"),
      );
      questionList.append(item);
    });

    const schemaRows = Array.isArray(data?.evidence?.schema) ? data.evidence.schema : [];
    const schemaEnd = schemaRows.findIndex((row, rowIndex) => rowIndex > 0 && !String(row).trim());
    const schemaFields = schemaEnd > 0 ? schemaRows.slice(0, schemaEnd) : schemaRows.slice(0, 16);
    text("schema-output", schemaFields.length ? schemaFields.join("\n") : "Schema output unavailable.");

    const limitList = document.getElementById("limit-list");
    const limits = Array.isArray(data?.limits) ? data.limits : ["No limitations were included in the payload."];
    limits.forEach((limit) => limitList.append(element("li", "", limit)));
  }

  function renderCategoryRankPreview() {
    const container = document.getElementById("category-rank-bars");
    const categoryRows = Array.isArray(data?.findings?.categories?.data)
      ? data.findings.categories.data
      : [];
    const rows = categoryRows.slice(0, 5);
    if (!container || !rows.length) return;

    const maxValue = Math.max(...rows.map((row) => Number(row.Count) || 0), 1);
    rows.forEach((row) => {
      const value = Number(row.Count) || 0;
      const item = element("div", "category-rank-row");
      const track = element("span", "category-rank-track");
      const fill = element("span", "category-rank-fill");
      fill.style.setProperty("--rank-width", String((value / maxValue) * 100) + "%");
      track.append(fill);
      item.append(
        element("span", "category-rank-name", String(row.category || "Unknown")),
        track,
        element("span", "category-rank-value", compactFormat.format(value)),
      );
      container.append(item);
    });

    const districtRows = Array.isArray(data?.evidence?.rawTables?.district)
      ? data.evidence.rawTables.district
      : data?.findings?.districts?.data || [];
    const total = districtRows.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
    const top = categoryRows[0];
    const second = categoryRows[1];
    const topValue = Number(top?.Count) || 0;
    const secondValue = Number(second?.Count) || 0;
    const share = total ? (topValue / total) * 100 : 0;
    const lead = Math.max(topValue - secondValue, 0);
    const ratio = secondValue ? topValue / secondValue : 0;
    const topName = String(top?.category || "Top category").replace("LARCENY/THEFT", "Larceny/Theft");
    const secondName = String(second?.category || "the next category")
      .toLowerCase()
      .replace(/w/g, (letter) => letter.toUpperCase());

    text("category-detail-title", topName + " is " + ratio.toFixed(2) + "x the next category.");
    text(
      "category-detail-copy",
      "It leads " + secondName + " by " + numberFormat.format(lead) +
        " incidents. The result identifies concentration for prioritization, but does not explain causation.",
    );

    const stats = document.getElementById("category-detail-stats");
    if (stats) {
      [
        [numberFormat.format(topValue), "incidents"],
        [share.toFixed(1) + "%", "of all records"],
        ["+" + numberFormat.format(lead), "vs. #2 category"],
      ].forEach(([value, label]) => {
        const item = element("div", "category-detail-stat");
        item.append(element("dt", "", value), element("dd", "", label));
        stats.append(item);
      });
    }
  }

  function setupInsightReveals() {
    const configurations = [
      {
        id: "category-insight",
        radiusProperty: "--reveal-radius",
        visibleClass: "is-color-visible",
      },
      {
        id: "district-insight",
        radiusProperty: "--detail-radius",
        visibleClass: "is-detail-visible",
      },
      {
        id: "hour-insight",
        radiusProperty: "--detail-radius",
        visibleClass: "is-detail-visible",
      },
    ];

    configurations.forEach(({ id, radiusProperty, visibleClass }) => {
      const card = document.getElementById(id);
      if (!card) return;

      let isVisible = false;
      let resetTimer;

      function pointIsInsideCard(event) {
        const rect = card.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom;
      }

      function setVisible(visible) {
        if (visible === isVisible) return;
        isVisible = visible;
        window.clearTimeout(resetTimer);
        card.style.setProperty(radiusProperty, visible ? "180%" : "0%");
        card.classList.toggle(visibleClass, visible);

        if (visible) {
          card.classList.add("is-chart-animated");
          return;
        }

        resetTimer = window.setTimeout(() => {
          if (!isVisible) card.classList.remove("is-chart-animated");
        }, 780);
      }

      card.addEventListener("pointerenter", () => setVisible(true));
      card.addEventListener("pointerleave", (event) => {
        const nextTarget = event.relatedTarget;
        if ((nextTarget instanceof Node && card.contains(nextTarget)) || pointIsInsideCard(event)) return;
        setVisible(false);
      });
      card.addEventListener("pointercancel", () => setVisible(false));
      card.addEventListener("focusin", () => setVisible(true));
      card.addEventListener("focusout", (event) => {
        if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;
        setVisible(false);
      });
    });
  }
  function renderInsightHoverCharts() {
    const districtChart = document.getElementById("district-mini-chart");
    const districtRows = Array.isArray(data?.findings?.districts?.data)
      ? data.findings.districts.data.slice(0, 5)
      : [];

    if (districtChart && districtRows.length) {
      const districtMax = Math.max(...districtRows.map((row) => Number(row.Count) || 0), 1);
      districtRows.forEach((row, index) => {
        const value = Number(row.Count) || 0;
        const item = element("div", "district-mini-row");
        const track = element("span", "district-mini-track");
        const fill = element("span", "district-mini-fill");
        fill.style.setProperty("--mini-width", `${(value / districtMax) * 100}%`);
        fill.style.transitionDelay = `${index * 55}ms`;
        track.append(fill);
        item.append(
          element("span", "district-mini-name", String(row.PdDistrict || "Unknown")),
          track,
          element("span", "district-mini-value", compactFormat.format(value)),
        );
        districtChart.append(item);
      });
    }

    const hourChart = document.getElementById("hour-mini-chart");
    const hourRows = Array.isArray(data?.findings?.hourly?.data)
      ? data.findings.hourly.data
      : [];

    if (hourChart && hourRows.length) {
      const hourMax = Math.max(...hourRows.map((row) => Number(row.Count) || 0), 1);
      const peak = hourRows.find((row) => Number(row.Count) === hourMax);
      const width = 320;
      const height = 164;
      const centerX = 160;
      const centerY = 82;
      const innerRadius = 43;
      const svg = svgElement("svg", {
        class: "hour-clock-svg",
        viewBox: `0 0 ${width} ${height}`,
        role: "presentation",
        "aria-hidden": "true",
      });

      svg.append(svgElement("circle", {
        class: "hour-clock-guide",
        cx: centerX,
        cy: centerY,
        r: innerRadius,
      }));

      const rowsByHour = new Map(hourRows.map((row) => [Number(row.Hour), row]));
      for (let clockHour = 0; clockHour < 12; clockHour += 1) {
        [clockHour, clockHour + 12].forEach((hour, periodIndex) => {
          const row = rowsByHour.get(hour);
          if (!row) return;
          const value = Number(row.Count) || 0;
          const angleOffset = periodIndex === 0 ? -2.8 : 2.8;
          const angle = ((clockHour / 12) * 360 - 90 + angleOffset) * (Math.PI / 180);
          const outerRadius = innerRadius + 8 + (value / hourMax) * 25;
          const line = svgElement("line", {
            class: `hour-clock-bar ${periodIndex === 0 ? "is-am" : "is-pm"}${value === hourMax ? " is-peak" : ""}`,
            x1: centerX + Math.cos(angle) * innerRadius,
            y1: centerY + Math.sin(angle) * innerRadius,
            x2: centerX + Math.cos(angle) * outerRadius,
            y2: centerY + Math.sin(angle) * outerRadius,
            pathLength: 1,
          });
          line.style.transitionDelay = `${(clockHour * 2 + periodIndex) * 16}ms`;
          const title = svgElement("title");
          title.textContent = `${String(hour).padStart(2, "0")}:00: ${numberFormat.format(value)} incidents`;
          line.append(title);
          svg.append(line);
        });
      }

      const labels = [
        ["12", 160, 7, "hour-clock-numeral"],
        ["3", 245, 85, "hour-clock-numeral"],
        ["6", 160, 159, "hour-clock-numeral"],
        ["9", 75, 85, "hour-clock-numeral"],
        ["PEAK", centerX, 66, "hour-clock-center-label"],
        [`${String(Number(peak?.Hour) || 0).padStart(2, "0")}:00`, centerX, 86, "hour-clock-center-time"],
        [compactFormat.format(Number(peak?.Count) || 0), centerX, 102, "hour-clock-center-count"],
        ["AM", 146, 117, "hour-clock-half is-am"],
        ["PM", 174, 117, "hour-clock-half is-pm"],
      ];
      labels.forEach(([value, x, y, className]) => {
        const label = svgElement("text", { class: className, x, y });
        label.textContent = value;
        svg.append(label);
      });

      hourChart.replaceChildren(svg);
    }
  }

  function setupEvidenceCascade() {
    const cascade = document.getElementById("evidence-cascade");
    if (!cascade) return;

    const panels = [...cascade.querySelectorAll(".evidence-panel")];

    function activatePanel(panel) {
      panels.forEach((item) => {
        const isActive = item === panel;
        item.classList.toggle("is-active", isActive);
        item.querySelector(".evidence-trigger")?.setAttribute("aria-expanded", String(isActive));
      });
    }

    panels.forEach((panel, index) => {
      const trigger = panel.querySelector(".evidence-trigger");
      panel.addEventListener("mouseenter", () => activatePanel(panel));
      trigger.addEventListener("focus", () => activatePanel(panel));
      trigger.addEventListener("click", () => activatePanel(panel));
      trigger.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + panels.length) % panels.length;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % panels.length;
        }
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = panels.length - 1;

        const nextPanel = panels[nextIndex];
        activatePanel(nextPanel);
        nextPanel.querySelector(".evidence-trigger")?.focus();
      });
    });
  }

  function setupNavigation() {
    const nav = document.getElementById("site-nav");
    const button = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");

    function closeMenu() {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation");
      menu.hidden = true;
      nav.classList.remove("menu-active");
      document.body.classList.remove("menu-open");
    }

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
        return;
      }
      button.setAttribute("aria-expanded", "true");
      button.setAttribute("aria-label", "Close navigation");
      menu.hidden = false;
      nav.classList.add("menu-active");
      document.body.classList.add("menu-open");
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function setupScrollMotion() {
    const nav = document.getElementById("site-nav");
    const hero = document.querySelector(".hero");
    const video = document.getElementById("hero-video");
    const content = document.getElementById("hero-content");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      nav.classList.toggle("is-scrolled", scrollY > 36);

      if (!reduceMotion && hero && video && content) {
        const progress = Math.min(scrollY / Math.max(hero.offsetHeight * 0.82, 1), 1);
        video.style.transform = `translateY(${progress * 92}px) scale(${1.04 + progress * 0.03})`;
        video.style.opacity = String(1 - progress * 0.42);
        content.style.transform = `translateY(${progress * 66}px)`;
        content.style.opacity = String(Math.max(1 - progress * 1.22, 0));
      }
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function setupRevealObserver() {
    const items = document.querySelectorAll(".section-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8%" });

    items.forEach((item) => observer.observe(item));
  }

  function animateHeroCounts() {
    const counters = document.querySelectorAll("[data-count]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      if (!Number.isFinite(target)) return;
      const duration = reduceMotion ? 1 : 1300;
      const startTime = performance.now() + 520;

      function update(now) {
        const progress = Math.max(0, Math.min((now - startTime) / duration, 1));
        const eased = 1 - Math.pow(1 - progress, 4);
        const value = Math.round(target * eased);
        counter.textContent = counter.dataset.format === "compact"
          ? compactFormat.format(value)
          : numberFormat.format(value);
        if (progress < 1) window.requestAnimationFrame(update);
      }

      window.requestAnimationFrame(update);
    });
  }

  function setupVideo() {
    const video = document.getElementById("hero-video");
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      document.querySelector(".hero-media")?.classList.add("video-paused");
    });
  }

  setProjectStory();
  renderEngineering();
  renderTabs();
  renderFinding();
  renderWorkflow();
  renderSkills();
  renderEvidence();
  renderCategoryRankPreview();
  renderInsightHoverCharts();
  setupEvidenceCascade();
  setupNavigation();
  setupScrollMotion();
  setupInsightReveals();
  setupRevealObserver();
  animateHeroCounts();
  setupVideo();
})();
