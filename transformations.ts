//pipeline pattern

import {
  AggregatedSalesRecord,
  NormalizedSalesRecord,
  TransformationConfig,
} from "./types";

// base transformation class
abstract class Transformation<TInput = any, TOutput = any> {
  config: TransformationConfig;

  constructor(config: TransformationConfig) {
    this.config = config;
  }

  abstract transform(data: TInput): Promise<TOutput>;
}

// 1-normalization transformation
export class NormalizeTransformation extends Transformation<
  NormalizedSalesRecord[],
  NormalizedSalesRecord[]
> {
  async transform(
    data: NormalizedSalesRecord[],
  ): Promise<NormalizedSalesRecord[]> {
    return data;
  }
}

// 2-filter transformation
export class FilterTransformation extends Transformation<
  NormalizedSalesRecord[],
  NormalizedSalesRecord[]
> {
  async transform(
    data: NormalizedSalesRecord[],
  ): Promise<NormalizedSalesRecord[]> {
    const { field, condition } = this.config;

    if (condition === "last24hours") {
      const cutOff = new Date();
      cutOff.setHours(cutOff.getHours() - 24);
      return data.filter((record) => {
        if (!field) {
          throw new Error("Field is undefined in FilterTransformation config.");
        }
        const value = record[field as keyof NormalizedSalesRecord];
        const recordTime = new Date(String(value));
        return recordTime >= cutOff;
      });
    }
    return data;
  }
}

// 3-aggregation transformation
export class AggregateTransformation extends Transformation<
  NormalizedSalesRecord[],
  AggregatedSalesRecord[]
> {
  async transform(
    data: NormalizedSalesRecord[],
  ): Promise<AggregatedSalesRecord[]> {
    const grouped = new Map<string, AggregatedSalesRecord>();

    for (const record of data) {
      const categoryKey = record.category;

      if (!grouped.has(categoryKey)) {
        grouped.set(categoryKey, {
          category: categoryKey,
          totalSales: 0,
          recordCount: 0,
          sources: [],
        });
      }

      const currentGroup = grouped.get(categoryKey)!;
      currentGroup.totalSales += record.amount;
      currentGroup.recordCount += 1;

      if (!currentGroup.sources.includes(record.source)) {
        currentGroup.sources.push(record.source);
      }
    }

    return Array.from(grouped.values());
  }
}

// Transformation factory function to create transformation instances based on type
export function createTransformation(
  config: TransformationConfig,
): Transformation<any, any> {
  switch (config.type) {
    case "normalize":
      return new NormalizeTransformation(config);
    case "filter":
      return new FilterTransformation(config);
    case "aggregate":
      return new AggregateTransformation(config);
    default:
      throw new Error(`Unknown transformation type: ${config.type}`);
  }
}
