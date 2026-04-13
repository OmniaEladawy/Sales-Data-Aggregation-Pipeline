import { SalesDataPipeline } from "./pipline";

const config = {
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
        operation: "sum" as "sum",
      },
    },
  ],
  observers: [{ type: "console-logger" }, { type: "error-tracker" }],
};

async function main() {
  const pipeline = new SalesDataPipeline(config);
  const result = await pipeline.execute();

  console.log("\nFinal Result:");
  console.dir(result, { depth: null });
}

main();
