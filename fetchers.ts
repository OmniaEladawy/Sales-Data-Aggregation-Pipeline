import { delay, hoursAgoIso } from "./helpers";
import {
  ApiRaw,
  DatabaseRaw,
  FetcherConfig,
  FileRaw,
  NormalizedSalesRecord,
} from "./types";

// template pattern for main fetcher
// MainFetcher is now generic over config and fetch result
abstract class MainFetcher<C extends FetcherConfig, F> {
  config: C;
  sourceName: string;
  type: string;

  constructor(config: C) {
    this.config = config;
    this.sourceName = config.name;
    this.type = config.type;
  }

  abstract fetch(): Promise<F>;
  abstract normalize(data: F): NormalizedSalesRecord[];
}

// strategy pattern for providing different fetcher implementations

// Api fetcher implementation
class ApiFetcher extends MainFetcher<FetcherConfig, ApiRaw[]> {
  async fetch(): Promise<ApiRaw[]> {
    await delay(1000); // Simulate API call delay
    return [
      {
        product_name: "Wireless Headphones",
        category_name: "Electronics",
        sale_amount: 89.99,
        timestamp: hoursAgoIso(2),
        channel: "web",
      },
      {
        product_name: "Running Shoes",
        category_name: "Sports",
        sale_amount: 124.5,
        timestamp: hoursAgoIso(4),
        channel: "web",
      },
      {
        product_name: "Coffee Maker",
        category_name: "Home & Garden",
        sale_amount: 79.99,
        timestamp: hoursAgoIso(7),
        channel: "web",
      },
    ];
  }

  normalize(data: ApiRaw[]): NormalizedSalesRecord[] {
    return data.map((item) => ({
      productName: item.product_name,
      category: item.category_name,
      amount: item.sale_amount,
      timestamp: item.timestamp,
      channel: item.channel,
      source: this.sourceName,
    }));
  }
}

// Database fetcher implementation
class DatabaseFetcher extends MainFetcher<FetcherConfig, DatabaseRaw[]> {
  async fetch(): Promise<DatabaseRaw[]> {
    await delay(1200); // Simulate database query delay
    // throw new Error("Database connection timeout after 3 retries");

    return [
      {
        prod_name: "Laptop Stand",
        cat: "Electronics",
        total: 45.0,
        timestamp: hoursAgoIso(3),
        channel: "mobile",
      },
      {
        prod_name: "Yoga Mat",
        cat: "Sports",
        total: 32.99,
        timestamp: hoursAgoIso(6),
        channel: "mobile",
      },
      {
        prod_name: "Kitchen Knife Set",
        cat: "Home & Garden",
        total: 156.0,
        timestamp: hoursAgoIso(9),
        channel: "mobile",
      },
    ];
  }

  normalize(data: DatabaseRaw[]): NormalizedSalesRecord[] {
    return data.map((item) => ({
      productName: item.prod_name,
      category: item.cat,
      amount: item.total,
      timestamp: item.timestamp,
      channel: item.channel,
      source: this.sourceName,
    }));
  }
}

class FileFetcher extends MainFetcher<FetcherConfig, FileRaw[]> {
  async fetch(): Promise<FileRaw[]> {
    await delay(800);

    return [
      {
        item: "Smart Watch",
        category: "Electronics",
        amount: 299.99,
        timestamp: hoursAgoIso(1),
        channel: "retail",
      },
      {
        item: "Denim Jeans",
        category: "Clothing",
        amount: 69.99,
        timestamp: hoursAgoIso(5),
        channel: "retail",
      },
      {
        item: "Garden Hose",
        category: "Home & Garden",
        amount: 34.5,
        timestamp: hoursAgoIso(10),
        channel: "retail",
      },
    ];
  }

  normalize(data: FileRaw[]): NormalizedSalesRecord[] {
    return data.map((item) => ({
      productName: item.item,
      category: item.category,
      amount: item.amount,
      timestamp: item.timestamp,
      channel: item.channel,
      source: this.sourceName,
    }));
  }
}

// factory pattern
// factory function to create fetcher instances based on source type(factory pattern)
export function createFetcher(
  config: FetcherConfig,
): MainFetcher<FetcherConfig, any> {
  const fetcherMapping: Record<
    string,
    new (config: FetcherConfig) => MainFetcher<FetcherConfig, any>
  > = {
    api: ApiFetcher,
    database: DatabaseFetcher,
    file: FileFetcher,
  };

  const FetcherClass = fetcherMapping[config.type];

  if (!FetcherClass) {
    throw new Error(`Unknown source type: ${config.type}`);
  }

  return new FetcherClass(config);
}
