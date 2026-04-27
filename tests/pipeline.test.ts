import { SalesDataPipeline } from "../pipeline";
import { createDefaultPipelineConfig } from "../pipeline-config";
import { Observer, PipelineEvent } from "../types";
import { assert, test } from "./test-utils";

class RecordingObserver implements Observer {
  events: PipelineEvent[] = [];

  update(event: PipelineEvent): void {
    this.events.push(event);
  }
}

test("SalesDataPipeline: runs configured sources and transformations successfully", async () => {
  const observer = new RecordingObserver();
  const config = createDefaultPipelineConfig();
  config.observers = [];
  const pipeline = new SalesDataPipeline(config, [observer]);

  const result = await pipeline.execute();

  assert.equal(result.success, true);
  assert.equal(result.summary.sourcesSucceeded, 3);
  assert.equal(result.summary.sourcesFailed, 0);
  assert.equal(result.summary.recordsProcessed, 9);
  assert.equal(result.summary.totalSales, 932.95);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.data, [
    {
      category: "Electronics",
      totalSales: 434.98,
      recordCount: 3,
      sources: ["web-store", "mobile-app", "retail-stores"],
    },
    {
      category: "Sports",
      totalSales: 157.49,
      recordCount: 2,
      sources: ["web-store", "mobile-app"],
    },
    {
      category: "Home & Garden",
      totalSales: 270.49,
      recordCount: 3,
      sources: ["web-store", "mobile-app", "retail-stores"],
    },
    {
      category: "Clothing",
      totalSales: 69.99,
      recordCount: 1,
      sources: ["retail-stores"],
    },
  ]);
  assert.ok(result.summary.executionTimeMs >= 1000);
  assert.equal(observer.events[0]?.type, "pipeline_started");
  assert.equal(
    observer.events[observer.events.length - 1]?.type,
    "pipeline_completed",
  );
  assert.equal(
    observer.events.filter((event) => event.type === "source_succeeded")
      .length,
    3,
  );
});
