// Generic config type for fetchers
export interface FetcherConfig {
  name: string;
  type: string;
}

export type ApiRaw = {
  product_name: string;
  category_name: string;
  sale_amount: number;
  timestamp: string;
  channel: string;
};

export type DatabaseRaw = {
  prod_name: string;
  cat: string;
  total: number;
  timestamp: string;
  channel: string;
};

export type FileRaw = {
  item: string;
  category: string;
  amount: number;
  timestamp: string;
  channel: string;
};

export interface NormalizedSalesRecord {
  productName: string;
  category: string;
  amount: number;
  timestamp: string;
  channel: string;
  source: string;
}

export interface AggregatedSalesRecord {
  category: string;
  totalSales: number;
  recordCount: number;
  sources: string[];
}

export interface PipelineError {
  source: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface PipelineResult {
  success: boolean;
  timestamp: string;
  data: AggregatedSalesRecord[];
  summary: {
    totalSales: number;
    sourcesSucceeded: number;
    sourcesFailed: number;
    recordsProcessed: number;
    executionTimeMs: number;
  };
  errors: PipelineError[];
}

export interface TransformationConfig {
  type: string;
  field?: string;
  condition?: string;
  groupBy?: string;
  calculate?: {
    field: string;
    operation: "sum";
  };
  mapping?: Record<string, string>;
}

export interface PipelineConfig {
  sources: FetcherConfig[];
  transformations: TransformationConfig[];
  observers: { type: string }[];
}

export interface PipelineEvent {
  type:
    | "pipeline_started"
    | "source_started"
    | "source_succeeded"
    | "source_failed"
    | "transformation_started"
    | "pipeline_completed";
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface Observer {
  update(event: PipelineEvent): void;
}
