import { delay } from "./helpers.js";
import {
  ApiRaw,
  ApiResponse,
  DatabaseRaw,
  DatabaseResponse,
  FetcherConfig,
  FetcherResponse,
  FileRaw,
  FileResponse,
} from "./types.js";

// template pattern for main fetcher
// MainFetcher is now generic over config and fetch result
abstract class MainFetcher<C extends FetcherConfig = FetcherConfig, F = any> {
  config: C;
  sourceName: string;
  type: string;
  constructor(config: C) {
    this.config = config;
    this.sourceName = config.name;
    this.type = config.type;
  }
  abstract fetch(): Promise<F>;
  normalize(data: F): Array<FetcherResponse> {
    return [];
  }
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
        timestamp: "2026-01-04T07:32:15Z",
        channel: "web",
      },
      {
        product_name: "Running Shoes",
        category_name: "Sports",
        sale_amount: 124.5,
        timestamp: "2026-01-04T06:45:22Z",
        channel: "web",
      },
      {
        product_name: "Coffee Maker",
        category_name: "Home & Garden",
        sale_amount: 79.99,
        timestamp: "2026-01-04T05:18:45Z",
        channel: "web",
      },
    ];
  }

  override normalize(data: ApiRaw[]): ApiResponse[] {
    return data.map((item) => ({
      productName: item.product_name,
      categoryName: item.category_name,
      saleAmount: item.sale_amount,
      timestamp: item.timestamp,
      type: "api",
      ref: item.ref || "N/A",
    }));
  }
}

// Database fetcher implementation
class DatabaseFetcher extends MainFetcher<FetcherConfig, DatabaseRaw[]> {
  async fetch(): Promise<DatabaseRaw[]> {
    await delay(1200); // Simulate database query delay
    return [
      {
        prod_name: "Laptop Stand",
        cat: "Electronics",
        total: 45.0,
        timestamp: "2026-01-04T07:12:30Z",
        channel: "mobile",
      },
      {
        prod_name: "Yoga Mat",
        cat: "Sports",
        total: 32.99,
        timestamp: "2026-01-04T06:55:10Z",
        channel: "mobile",
      },
      {
        prod_name: "Kitchen Knife Set",
        cat: "Home & Garden",
        total: 156.0,
        timestamp: "2026-01-04T04:22:18Z",
        channel: "mobile",
      },
    ];
  }

  override normalize(data: DatabaseRaw[]): DatabaseResponse[] {
    return data.map((item) => ({
      productName: item.prod_name,
      categoryName: item.cat,
      saleAmount: item.total,
      timestamp: item.timestamp,
      type: "database",
      uniqueKey: item.uniqueKey || "N/A",
    }));
  }
}

// File fetcher implementation
class FileFetcher extends MainFetcher<FetcherConfig, FileRaw[]> {
  async fetch(): Promise<FileRaw[]> {
    await delay(800); // Simulate file read delay
    return [
      {
        item: "Smart Watch",
        category: "Electronics",
        amount: 299.99,
        timestamp: "2026-01-04T08:05:42Z",
        channel: "retail",
      },
      {
        item: "Denim Jeans",
        category: "Clothing",
        amount: 69.99,
        timestamp: "2026-01-04T07:48:15Z",
        channel: "retail",
      },
      {
        item: "Garden Hose",
        category: "Home & Garden",
        amount: 34.5,
        timestamp: "2026-01-04T06:30:55Z",
        channel: "retail",
      },
    ];
  }

  override normalize(data: FileRaw[]): FileResponse[] {
    return data.map((item) => ({
      productName: item.item,
      categoryName: item.category,
      saleAmount: item.amount,
      timestamp: item.timestamp,
      type: "file",
      size: "N/A",
    }));
  }
}

// factory function to create fetcher instances based on source type(factory pattern)
function createFetcher(config: FetcherConfig): MainFetcher<any, any> {
  const fetcherMapping: Record<
    string,
    new (config: FetcherConfig) => MainFetcher<any, any>
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

// Example usage
async function test() {
  const sources = [
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
  ];
  const fetchers = sources.map(createFetcher);
  for (const fetcher of fetchers) {
    try {
      const data = await fetcher.fetch();
      console.log(`Data from ${fetcher.sourceName}:`, data);
    } catch (error) {
      console.error(`Error fetching data from ${fetcher.sourceName}:`, error);
    }
  }
}

test();
