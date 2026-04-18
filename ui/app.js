const elements = {
  chartBars: document.getElementById("chartBars"),
  errorsList: document.getElementById("errorsList"),
  eventsList: document.getElementById("eventsList"),
  lastUpdated: document.getElementById("lastUpdated"),
  metricsGrid: document.getElementById("metricsGrid"),
  refreshButton: document.getElementById("refreshButton"),
  statusBadge: document.getElementById("statusBadge"),
  statusText: document.getElementById("statusText"),
  tableBody: document.getElementById("tableBody"),
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US");

const statusDotClass = "h-2.5 w-2.5 rounded-full bg-current";
const statusBadgeClasses = {
  idle: "inline-flex items-center gap-2 rounded-full bg-muted/15 px-3 py-2 text-sm font-bold text-muted",
  loading:
    "inline-flex items-center gap-2 rounded-full bg-amber/15 px-3 py-2 text-sm font-bold text-amber",
  success:
    "inline-flex items-center gap-2 rounded-full bg-teal/12 px-3 py-2 text-sm font-bold text-teal",
  warning:
    "inline-flex items-center gap-2 rounded-full bg-amber/15 px-3 py-2 text-sm font-bold text-amber",
  error:
    "inline-flex items-center gap-2 rounded-full bg-danger/12 px-3 py-2 text-sm font-bold text-danger",
};
const metricCardClasses = [
  "rounded-[18px] border border-ink/8 bg-paper-strong p-[18px]",
  "rounded-[18px] border border-ink/8 bg-[linear-gradient(160deg,rgba(18,117,106,0.08),rgba(255,249,242,0.98))] p-[18px]",
  "rounded-[18px] border border-ink/8 bg-[linear-gradient(160deg,rgba(194,107,23,0.10),rgba(255,249,242,0.98))] p-[18px]",
];
const metricLabelClass = "mb-3 text-[0.92rem] text-muted";
const metricValueClass =
  "text-[clamp(1.65rem,3vw,2.35rem)] font-extrabold text-ink";
const emptyStateClass =
  "rounded-[18px] border border-ink/8 bg-paper-strong p-4 leading-6 text-muted";
const chartRowClass = "grid gap-2";
const chartMetaClass =
  "flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4";
const chartTrackClass = "relative h-4 overflow-hidden rounded-full bg-ink/8";
const chartFillClass =
  "absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#1f756c,#d98631)]";
const tableRowClass = "transition duration-150 hover:bg-white/60";
const tableCellClass = "border-b border-ink/8 px-3 py-4 align-top";
const emptyTableCellClass =
  "border-b border-ink/8 px-3 py-4 align-top leading-6 text-muted";
const sourcePillClass =
  "mb-2 mr-2 inline-flex rounded-full bg-[#2f63b2]/12 px-2.5 py-1.5 text-[0.82rem] font-bold text-[#2f63b2]";
const eventCardClass =
  "grid gap-2 rounded-[18px] border border-ink/8 bg-paper-strong p-4";
const eventHeadClass =
  "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between";
const eventTypeClass =
  "inline-flex w-fit rounded-full bg-teal/12 px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-teal";
const eventTimeClass = "text-sm text-muted";
const errorCardClass =
  "rounded-[18px] border border-danger/20 bg-[rgba(255,246,245,0.95)] p-4";
const errorMessageClass = "my-2 leading-6 text-ink";
const errorMetaClass = "text-sm text-muted";

function setStatus(kind, label, text) {
  elements.statusBadge.className =
    statusBadgeClasses[kind] ?? statusBadgeClasses.idle;

  elements.statusBadge.replaceChildren();

  const dot = document.createElement("span");
  dot.className = statusDotClass;

  const labelNode = document.createElement("span");
  labelNode.textContent = label;

  elements.statusBadge.append(dot, labelNode);
  elements.statusText.textContent = text;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderMetrics(summary) {
  const metrics = [
    ["Total sales", currencyFormatter.format(summary.totalSales)],
    ["Records processed", integerFormatter.format(summary.recordsProcessed)],
    ["Run time", `${summary.executionTimeMs} ms`],
    ["Sources succeeded", integerFormatter.format(summary.sourcesSucceeded)],
    ["Sources failed", integerFormatter.format(summary.sourcesFailed)],
    ["Categories returned", integerFormatter.format(summary.categoriesReturned)],
  ];

  elements.metricsGrid.innerHTML = metrics
    .map(
      ([label, value], index) => `
        <article class="${metricCardClasses[index % metricCardClasses.length]}">
          <p class="${metricLabelClass}">${label}</p>
          <p class="${metricValueClass}">${value}</p>
        </article>
      `,
    )
    .join("");
}

function renderChart(rows) {
  if (!rows.length) {
    elements.chartBars.innerHTML = `<div class="${emptyStateClass}">No category totals were produced by the current run.</div>`;
    return;
  }

  const highestValue = Math.max(...rows.map((row) => row.totalSales), 1);

  elements.chartBars.innerHTML = rows
    .map((row) => {
      const width = Math.max((row.totalSales / highestValue) * 100, 6);

      return `
        <div class="${chartRowClass}">
          <div class="${chartMetaClass}">
            <strong class="text-ink">${row.category}</strong>
            <span class="text-muted">${currencyFormatter.format(row.totalSales)}</span>
          </div>
          <div class="${chartTrackClass}">
            <div class="${chartFillClass}" style="width: ${width}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTable(rows) {
  if (!rows.length) {
    elements.tableBody.innerHTML = `<tr><td colspan="4" class="${emptyTableCellClass}">No rows to display.</td></tr>`;
    return;
  }

  elements.tableBody.innerHTML = rows
    .map(
      (row) => `
        <tr class="${tableRowClass}">
          <td class="${tableCellClass}">${row.category}</td>
          <td class="${tableCellClass}">${currencyFormatter.format(row.totalSales)}</td>
          <td class="${tableCellClass}">${integerFormatter.format(row.recordCount)}</td>
          <td class="${tableCellClass}">${row.sources
            .map((source) => `<span class="${sourcePillClass}">${source}</span>`)
            .join("")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderEvents(events) {
  if (!events.length) {
    elements.eventsList.innerHTML = `<div class="${emptyStateClass}">No pipeline events were captured for this run.</div>`;
    return;
  }

  elements.eventsList.innerHTML = events
    .slice()
    .reverse()
    .map(
      (event) => `
        <article class="${eventCardClass}">
          <div class="${eventHeadClass}">
            <span class="${eventTypeClass}">${event.type.replaceAll("_", " ")}</span>
            <span class="${eventTimeClass}">${formatTimestamp(event.timestamp)}</span>
          </div>
          <div class="leading-6 text-ink">${event.message}</div>
        </article>
      `,
    )
    .join("");
}

function renderErrors(errors) {
  if (!errors.length) {
    elements.errorsList.innerHTML = `<div class="${emptyStateClass}">No source failures were reported in this run.</div>`;
    return;
  }

  elements.errorsList.innerHTML = errors
    .map(
      (error) => `
        <article class="${errorCardClass}">
          <strong class="text-ink">${error.source}</strong>
          <p class="${errorMessageClass}">${error.message}</p>
          <small class="${errorMetaClass}">${error.type} - ${formatTimestamp(error.timestamp)}</small>
        </article>
      `,
    )
    .join("");
}

function renderDashboard(payload) {
  const rows = payload.result.data
    .slice()
    .sort((left, right) => right.totalSales - left.totalSales);

  renderMetrics({
    ...payload.result.summary,
    categoriesReturned: rows.length,
  });
  renderChart(rows);
  renderTable(rows);
  renderEvents(payload.events ?? []);
  renderErrors(payload.result.errors ?? []);

  const hasErrors = (payload.result.errors ?? []).length > 0;
  setStatus(
    hasErrors ? "warning" : "success",
    hasErrors ? "Partial success" : "Healthy",
    hasErrors
      ? "The pipeline completed, but at least one source reported an error."
      : "The pipeline completed successfully and the dashboard is up to date.",
  );

  elements.lastUpdated.textContent = `Last run: ${formatTimestamp(
    payload.generatedAt,
  )}`;
}

async function loadPipeline() {
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = "Running...";
  setStatus("loading", "Running", "Fetching sources and rebuilding the dashboard.");

  try {
    const response = await fetch("/api/pipeline", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Pipeline execution failed.");
    }

    renderDashboard(payload);
  } catch (error) {
    setStatus(
      "error",
      "Failed",
      "The dashboard could not load the latest pipeline run.",
    );
    elements.lastUpdated.textContent = "Last run: unavailable";
    elements.metricsGrid.innerHTML = `<div class="${emptyStateClass}">The pipeline response could not be loaded.</div>`;
    elements.chartBars.innerHTML = `<div class="${emptyStateClass}">No chart data is available right now.</div>`;
    elements.tableBody.innerHTML = `<tr><td colspan="4" class="${emptyTableCellClass}">No table data is available right now.</td></tr>`;
    elements.eventsList.innerHTML = `<div class="${emptyStateClass}">${
      error instanceof Error ? error.message : "Unknown error"
    }</div>`;
    elements.errorsList.innerHTML = `<div class="${emptyStateClass}">No error details were returned.</div>`;
  } finally {
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "Run pipeline";
  }
}

elements.refreshButton.addEventListener("click", () => {
  void loadPipeline();
});

void loadPipeline();
