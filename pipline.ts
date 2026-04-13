import { createFetcher } from "./fetchers";
import { createObserver } from "./observers";
import { createTransformation } from "./transformations";
import {
  NormalizedSalesRecord,
  Observer,
  PipelineConfig,
  PipelineError,
  PipelineEvent,
  PipelineResult,
} from "./types";

export class SalesDataPipeline {
  private config: PipelineConfig;
  private observers: Observer[];

  constructor(config: PipelineConfig) {
    this.config = config;
    this.observers = config.observers.map((observerConfig) =>
      createObserver(observerConfig.type),
    );
  }

  private notify(event: PipelineEvent): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }

  async execute(): Promise<PipelineResult> {
    const startTime = Date.now();
    const errors: PipelineError[] = [];

    this.notify({
      type: "pipeline_started",
      message: "Pipeline started",
      timestamp: new Date().toISOString(),
    });

    const fetchers = this.config.sources.map(createFetcher);

    const fetchPromises = fetchers.map(async (fetcher) => {
      this.notify({
        type: "source_started",
        message: `Fetching from source: ${fetcher.sourceName} (${fetcher.type})`,
        timestamp: new Date().toISOString(),
      });

      const rawData = await fetcher.fetch();
      const normalizedData = fetcher.normalize(rawData);

      this.notify({
        type: "source_succeeded",
        message: `✓ Source completed: ${fetcher.sourceName} (${normalizedData.length} records)`,
        timestamp: new Date().toISOString(),
        meta: {
          source: fetcher.sourceName,
          count: normalizedData.length,
        },
      });

      return normalizedData;
    });

    const settledResults = await Promise.allSettled(fetchPromises);

    const successfulRecords: NormalizedSalesRecord[] = [];

    settledResults.forEach((result, index) => {
      const sourceName = fetchers[index].sourceName;

      if (result.status === "fulfilled") {
        successfulRecords.push(...result.value);
      } else {
        const pipelineError: PipelineError = {
          source: sourceName,
          type: result.reason?.name || "SourceError",
          message: result.reason?.message || "Unknown source error",
          timestamp: new Date().toISOString(),
        };

        errors.push(pipelineError);

        this.notify({
          type: "source_failed",
          message: `✗ Source failed: ${sourceName} (${pipelineError.message})`,
          timestamp: pipelineError.timestamp,
          meta: pipelineError,
        });
      }
    });

    let transformedData: any = successfulRecords;
    const transformations =
      this.config.transformations.map(createTransformation);

    for (const transformation of transformations) {
      this.notify({
        type: "transformation_started",
        message: `Applying transformation: ${transformation.config.type}`,
        timestamp: new Date().toISOString(),
      });

      transformedData = await transformation.transform(transformedData);
    }

    const executionTimeMs = Date.now() - startTime;

    const totalSales = transformedData.reduce(
      (sum: number, item: any) => sum + item.totalSales,
      0,
    );

    const result: PipelineResult = {
      success: true,
      timestamp: new Date().toISOString(),
      data: transformedData,
      summary: {
        totalSales,
        sourcesSucceeded: settledResults.filter(
          (result) => result.status === "fulfilled",
        ).length,
        sourcesFailed: settledResults.filter(
          (result) => result.status === "rejected",
        ).length,
        recordsProcessed: successfulRecords.length,
        executionTimeMs,
      },
      errors,
    };

    this.notify({
      type: "pipeline_completed",
      message: `Pipeline completed successfully. Processed ${successfulRecords.length} records`,
      timestamp: new Date().toISOString(),
      meta: result.summary,
    });

    return result;
  }
}
