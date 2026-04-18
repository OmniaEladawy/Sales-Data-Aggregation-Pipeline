import { SalesDataPipeline } from "./pipline";
import { createDefaultPipelineConfig } from "./pipeline-config";

async function main() {
  const pipeline = new SalesDataPipeline(createDefaultPipelineConfig());
  const result = await pipeline.execute();

  console.log("\nFinal Result:");
  console.dir(result, { depth: null });
}

main();
