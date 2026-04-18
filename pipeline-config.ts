import { PipelineConfig } from "./types";

export function createDefaultPipelineConfig(): PipelineConfig {
  return {
    sources: [
      {
        type: "api",
        name: "web-store",
        url: "https://api.store.com/sales",
        auth: { type: "bearer", token: "abc123" },
      },
      {
        type: "database",
        name: "mobile-app",
        connection: "postgresql://localhost/mobile",
        query: "SELECT * FROM sales WHERE date = CURRENT_DATE",
      },
      {
        type: "file",
        name: "retail-stores",
        path: "./data/retail-sales.csv",
      },
    ],
    transformations: [
      {
        type: "normalize",
      },
      {
        type: "filter",
        field: "timestamp",
        condition: "last24hours",
      },
      {
        type: "aggregate",
        groupBy: "category",
        calculate: {
          field: "amount",
          operation: "sum",
        },
      },
    ],
    observers: [{ type: "console-logger" }, { type: "error-tracker" }],
  };
}
