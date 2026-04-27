import { delay, hoursAgoIso } from "../helpers";
import { assert, test } from "./test-utils";

test("helpers: delay resolves after approximately the requested time", async () => {
  const start = Date.now();

  await delay(20);

  assert.ok(Date.now() - start >= 15);
});

test("helpers: hoursAgoIso returns an ISO timestamp in the past", () => {
  const before = Date.now() - 2 * 60 * 60 * 1000;
  const timestamp = hoursAgoIso(2);
  const after = Date.now() - 2 * 60 * 60 * 1000;
  const parsed = Date.parse(timestamp);

  assert.match(timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(parsed >= before - 50);
  assert.ok(parsed <= after + 50);
});
