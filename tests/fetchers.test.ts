import { createFetcher } from "../pipeline-components/fetchers";
import { assert, test } from "./test-utils";

test("createFetcher: creates an API fetcher and normalizes API records", async () => {
  const fetcher = createFetcher({ type: "api", name: "web-store" });
  const raw = await fetcher.fetch();
  const normalized = fetcher.normalize(raw);

  assert.equal(fetcher.sourceName, "web-store");
  assert.equal(fetcher.type, "api");
  assert.equal(normalized.length, 3);
  assert.deepEqual(normalized[0], {
    productName: "Wireless Headphones",
    category: "Electronics",
    amount: 89.99,
    timestamp: raw[0].timestamp,
    channel: "web",
    source: "web-store",
  });
});

test(
  "createFetcher: creates a database fetcher and normalizes database records",
  async () => {
    const fetcher = createFetcher({ type: "database", name: "mobile-app" });
    const raw = await fetcher.fetch();
    const normalized = fetcher.normalize(raw);

    assert.equal(normalized.length, 3);
    assert.deepEqual(normalized[0], {
      productName: "Laptop Stand",
      category: "Electronics",
      amount: 45,
      timestamp: raw[0].timestamp,
      channel: "mobile",
      source: "mobile-app",
    });
  },
);

test("createFetcher: creates a file fetcher and normalizes file records", async () => {
  const fetcher = createFetcher({ type: "file", name: "retail-stores" });
  const raw = await fetcher.fetch();
  const normalized = fetcher.normalize(raw);

  assert.equal(normalized.length, 3);
  assert.deepEqual(normalized[0], {
    productName: "Smart Watch",
    category: "Electronics",
    amount: 299.99,
    timestamp: raw[0].timestamp,
    channel: "retail",
    source: "retail-stores",
  });
});

test("createFetcher: throws for an unknown source type", () => {
  assert.throws(
    () => createFetcher({ type: "spreadsheet", name: "unknown-source" }),
    /Unknown source type: spreadsheet/,
  );
});
