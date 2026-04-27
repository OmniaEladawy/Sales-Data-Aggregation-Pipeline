import assert from "node:assert/strict";

type TestFn = () => void | Promise<void>;

type TestCase = {
  name: string;
  fn: TestFn;
};

const tests: TestCase[] = [];

export { assert };

export function test(name: string, fn: TestFn): void {
  tests.push({ name, fn });
}

export async function run(): Promise<void> {
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`[pass] ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`[fail] ${name}`);
      console.error(error);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} tests passed`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}
