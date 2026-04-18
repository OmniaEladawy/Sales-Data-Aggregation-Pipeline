# Sales Data Aggregation Pipeline

A TypeScript project that simulates collecting sales records from multiple sources, normalizing them into one shared shape, applying transformations, and producing aggregated results.

## What This Project Does

The pipeline currently:

- fetches mocked sales data from API, database, and file sources
- normalizes each source into a shared sales record structure
- applies configurable transformations
- aggregates totals by category
- emits pipeline lifecycle events through observers

This repository is set up as a small architecture exercise that demonstrates common backend design patterns in a practical way.

## Design Patterns Used

- `Factory Pattern`: creates fetchers and transformations from config objects
- `Strategy Pattern`: swaps source-specific fetch and transform behavior behind shared interfaces
- `Template Method Pattern`: the base fetcher defines the shared contract while concrete fetchers implement source logic
- `Observer Pattern`: logs pipeline events and failures through pluggable observers

## Project Structure

- `index.ts`: runnable entry point that builds the pipeline config and executes it
- `server.ts`: lightweight HTTP server that exposes the pipeline output to a browser UI
- `pipeline-config.ts`: shared default pipeline configuration used by both the CLI and dashboard
- `pipline.ts`: pipeline orchestration logic for fetch, normalize, transform, aggregate, and summary output
- `fetchers.ts`: source fetchers plus the fetcher factory
- `transformations.ts`: normalize, filter, and aggregate transformations
- `observers.ts`: console logging and error tracking observers
- `types.ts`: shared TypeScript interfaces and result types
- `helpers.ts`: utility helpers such as simulated async delay
- `ui/index.html`: dashboard markup
- `ui/app.js`: dashboard rendering logic
- `ui/tailwind.css`: Tailwind source file for the dashboard
- `ui/styles.css`: compiled Tailwind output served by the dashboard

## Data Flow

1. `index.ts` defines the pipeline configuration.
2. `SalesDataPipeline` creates fetchers for each configured source.
3. Each fetcher retrieves mocked raw data and normalizes it into `NormalizedSalesRecord`.
4. Transformations run in sequence.
5. The aggregate stage groups records by category and calculates total sales.
6. Observers receive status updates during execution.
7. The final result includes aggregated data, summary metrics, and any source errors.

## Normalized Record Shape

Each normalized record uses the following structure:

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

## Example Pipeline Configuration

The default config in `index.ts` includes:

- 3 sources: `api`, `database`, and `file`
- 3 transformations: `normalize`, `filter`, and `aggregate`
- 2 observers: `console-logger` and `error-tracker`

The configured filter keeps records from the last 24 hours, and the aggregation groups by category.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Run the Project

```bash
npm start
```

This runs `ts-node index.ts`, executes the pipeline, and prints the final aggregated result to the console.

### Run the Dashboard

```bash
npm run dashboard
```

Then open `http://localhost:3000` in your browser.

If you are using PowerShell with script execution restrictions, use:

```bash
npm.cmd run dashboard
```

### Rebuild Tailwind Styles

```bash
npm run build:css
```

For live Tailwind rebuilds while editing the dashboard:

```bash
npm run tailwind:watch
```

## Expected Output

When the pipeline succeeds, the final output includes:

- aggregated category data
- total sales across all aggregated groups
- number of successful and failed sources
- total normalized records processed
- total execution time
- collected source errors, if any
- a browser dashboard with summary cards, category totals, pipeline events, and errors

## Current Implementation Notes

- Source data is mocked; no live API, database, or file integrations are connected yet.
- Mocked timestamps are generated relative to the current time so the `last24hours` filter continues to return data.
- Fetchers simulate latency with `delay(...)`.
- Source fetches run concurrently with `Promise.allSettled`, so one failing source does not stop the whole pipeline.
- The main pipeline file is currently named `pipline.ts`.
- The dashboard styling is built with Tailwind CSS v4 via the local CLI.

## Future Improvements

- connect the file source to real CSV or JSON parsing
- add stronger typing for source-specific configs instead of broad index signatures
- separate demo code from reusable modules
- add unit tests for fetchers, transformations, and pipeline summaries
- add linting and build scripts
- support additional aggregation options beyond category totals
