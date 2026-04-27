import {
  AggregateTransformation,
  FilterTransformation,
  createTransformation,
} from "../transformations";
import { NormalizedSalesRecord } from "../types";
import { assert, test } from "./test-utils";

const makeRecord = (
  overrides: Partial<NormalizedSalesRecord>,
): NormalizedSalesRecord => ({
  productName: "Default Product",
  category: "Electronics",
  amount: 10,
  timestamp: new Date().toISOString(),
  channel: "web",
  source: "web-store",
  ...overrides,
});

test("FilterTransformation: keeps only records from the last 24 hours", async () => {
  const transformation = new FilterTransformation({
    type: "filter",
    field: "timestamp",
    condition: "last24hours",
  });
  const recent = makeRecord({
    productName: "Recent",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  });
  const old = makeRecord({
    productName: "Old",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  });

  const result = await transformation.transform([recent, old]);

  assert.deepEqual(result, [recent]);
});

test(
  "FilterTransformation: throws when a last24hours filter has no field configured",
  async () => {
    const transformation = new FilterTransformation({
      type: "filter",
      condition: "last24hours",
    });

    await assert.rejects(
      () => transformation.transform([makeRecord({})]),
      /Field is undefined/,
    );
  },
);

test(
  "AggregateTransformation: groups records and sums sales by the configured field",
  async () => {
    const transformation = new AggregateTransformation({
      type: "aggregate",
      groupBy: "category",
    });

    const result = await transformation.transform([
      makeRecord({ category: "Electronics", amount: 25, source: "web-store" }),
      makeRecord({ category: "Electronics", amount: 30, source: "mobile-app" }),
      makeRecord({ category: "Clothing", amount: 15, source: "retail-stores" }),
      makeRecord({ category: "Electronics", amount: 5, source: "web-store" }),
    ]);

    assert.deepEqual(result, [
      {
        category: "Electronics",
        totalSales: 60,
        recordCount: 3,
        sources: ["web-store", "mobile-app"],
      },
      {
        category: "Clothing",
        totalSales: 15,
        recordCount: 1,
        sources: ["retail-stores"],
      },
    ]);
  },
);

test("createTransformation: creates supported transformations", () => {
  assert.ok(
    createTransformation({ type: "filter" }) instanceof FilterTransformation,
  );
  assert.ok(
    createTransformation({ type: "aggregate" }) instanceof
      AggregateTransformation,
  );
});

test("createTransformation: throws for an unknown transformation type", () => {
  assert.throws(
    () => createTransformation({ type: "sort" }),
    /Unknown transformation type: sort/,
  );
});
