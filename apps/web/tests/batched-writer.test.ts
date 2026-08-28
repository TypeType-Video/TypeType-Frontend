import { expect, test } from "bun:test";
import { createBatchedWriter } from "../src/lib/batched-writer";

test("coalesces repeated log persistence", async () => {
  let writes = 0;
  const writer = createBatchedWriter(() => writes++, 5);

  writer.schedule();
  writer.schedule();
  writer.schedule();
  expect(writes).toBe(0);

  await Bun.sleep(15);
  expect(writes).toBe(1);
});

test("flushes immediately and cancels a pending persistence", async () => {
  let writes = 0;
  const writer = createBatchedWriter(() => writes++, 5);

  writer.schedule();
  writer.flush();
  expect(writes).toBe(1);

  await Bun.sleep(15);
  expect(writes).toBe(1);
});
