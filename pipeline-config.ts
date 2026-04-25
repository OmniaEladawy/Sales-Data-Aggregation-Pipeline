import "dotenv/config";
import { PipelineConfig } from "./types";

export function createDefaultPipelineConfig(): PipelineConfig {
  return {
    sources: [
      {
        type: "api",
        name: "web-store",
        url: process.env.SALES_API_URL,
        auth: { type: "bearer", token: process.env.SALES_API_TOKEN },
      },
      {
        type: "database",
        name: "mobile-app",
        connection: process.env.SALES_DB_CONNECTION,
        query: "SELECT * FROM sales WHERE date = CURRENT_DATE",
      },
      {
        type: "file",
        name: "retail-stores",
        path: process.env.SALES_FILE_PATH,
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
