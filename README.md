# Sales Data Aggregation Pipeline

A TypeScript demo pipeline that collects mocked sales records from multiple source types, normalizes them into one shared format, applies transformations, and returns aggregated sales totals for a dashboard or console run.

## What It Does

- Fetches sales data from mocked API, database, and file sources
- Normalizes source-specific records into a common `NormalizedSalesRecord` shape
- Filters records to the last 24 hours
- Aggregates sales totals by category
- Emits lifecycle events through observers
- Continues processing when one source fails
- Serves the latest pipeline result through a lightweight browser dashboard

## Design Patterns

- `Factory Pattern`: creates fetchers, transformations, and observers from config
- `Strategy Pattern`: swaps source-specific fetch and normalization behavior behind shared interfaces
- `Template Method Pattern`: defines the common fetcher contract while each fetcher implements its source logic
- `Observer Pattern`: sends pipeline events and failures to pluggable observers

## Project Structure

```text
.
├── index.ts                  # Console entry point
├── server.ts                 # HTTP server for the dashboard and API endpoint
├── pipeline-config.ts        # Shared default pipeline configuration
├── pipeline.ts               # Pipeline orchestration
├── fetchers.ts               # Source fetchers and fetcher factory
├── transformations.ts        # Filter and aggregate transformations
├── observers.ts              # Console logger and error tracker observers
├── types.ts                  # Shared TypeScript types
├── helpers.ts                # Small utility helpers
├── tests/                    # Lightweight TypeScript test suite
└── ui/                       # Dashboard HTML, JavaScript, and Tailwind CSS
```

## Data Flow

1. `createDefaultPipelineConfig()` defines sources, transformations, and observers.
2. `SalesDataPipeline` creates fetchers for each configured source.
3. Source fetches run concurrently.
4. Each successful source normalizes its raw records.
5. Failed sources are collected as pipeline errors.
6. Transformations run in order: filter, then aggregate.
7. Observers receive pipeline status events.
8. The final result includes aggregated data, summary metrics, and source errors.

## Normalized Record Shape

```ts
{
  productName: string;
  category: string;
  amount: number;
  timestamp: string;
  channel: string;
  source: string;
}
```

## Default Configuration

The default config in `pipeline-config.ts` uses:

- Sources: `api`, `database`, and `file`
- Transformations: `filter` with `last24hours`, then `aggregate` by `category`
- Observers: `console-logger` and `error-tracker`

The config reads optional values from environment variables so real connection details can be added later without changing the code.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

The current fetchers use mocked data, so the placeholder values are enough for local demo runs.

Available variables:

```text
SALES_API_URL
SALES_API_TOKEN
SALES_DB_CONNECTION
SALES_FILE_PATH
PORT
```

## Running the Project

Start the dashboard:

```bash
npm start
```

This builds `ui/styles.css`, starts `server.ts`, and serves the dashboard at:

```text
http://localhost:3000
```

Run the pipeline once in the console:

```bash
npm run pipeline
```

Run the dashboard alias:

```bash
npm run dashboard
```

Rebuild Tailwind styles:

```bash
npm run build:css
```

Watch Tailwind styles while editing:

```bash
npm run tailwind:watch
```

Run tests:

```bash
npm test
```

If PowerShell blocks npm scripts, use `npm.cmd`, for example:

```bash
npm.cmd start
```

## Dashboard API

The server exposes the latest pipeline run at:

```text
GET /api/pipeline
```

The response includes:

- `generatedAt`: time the dashboard request was handled
- `result.data`: aggregated category totals
- `result.summary`: total sales, source counts, records processed, and execution time
- `result.errors`: collected source errors
- `events`: observer events captured during the run

## Example Result Shape

```ts
{
  success: true,
  timestamp: "2026-04-27T10:00:00.000Z",
  data: [
    {
      category: "Electronics",
      totalSales: 434.98,
      recordCount: 3,
      sources: ["web-store", "mobile-app", "retail-stores"]
    }
  ],
  summary: {
    totalSales: 932.95,
    sourcesSucceeded: 3,
    sourcesFailed: 0,
    recordsProcessed: 9,
    executionTimeMs: 1200
  },
  errors: []
}
```

## Implementation Notes

- Source data is mocked; no live API, database, or file integrations are connected yet.
- Mocked timestamps are generated relative to the current time so the `last24hours` filter keeps returning data.
- Fetchers simulate latency with `delay(...)`.
- Source fetches use `Promise.allSettled`, so one failed source does not stop the full run.
- Dashboard styling is built with Tailwind CSS v4 through the local CLI.
- Tests use a lightweight custom runner in `tests/test-utils.ts`.
