import { expect, test } from "bun:test";
import { ProgressWriteQueue } from "../src/lib/progress-write-queue";

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test("orders writes for the same video and makes readers wait", async () => {
  const queue = new ProgressWriteQueue();
  const first = deferred();
  const started = deferred();
  const order: string[] = [];

  const firstWrite = queue.enqueue("video-a", async () => {
    order.push("first-start");
    started.resolve();
    await first.promise;
    order.push("first-end");
  });
  const secondWrite = queue.enqueue("video-a", async () => {
    order.push("second");
  });
  const settled = queue.settle("video-a").then(() => order.push("reader"));

  await started.promise;
  expect(order).toEqual(["first-start"]);
  first.resolve();
  await Promise.all([firstWrite, secondWrite, settled]);
  expect(order).toEqual(["first-start", "first-end", "second", "reader"]);
});

test("a failed write does not block the next save", async () => {
  const queue = new ProgressWriteQueue();
  const failed = queue.enqueue("video-a", () => Promise.reject(new Error("failed")));
  const next = queue.enqueue("video-a", () => Promise.resolve());

  await expect(failed).rejects.toThrow("failed");
  await expect(next).resolves.toBeUndefined();
  await expect(queue.settle("video-a")).resolves.toBeUndefined();
});

test("different videos do not wait for each other", async () => {
  const queue = new ProgressWriteQueue();
  const first = deferred();
  const blocked = queue.enqueue("video-a", () => first.promise);
  const independent = queue.enqueue("video-b", () => Promise.resolve());

  await expect(independent).resolves.toBeUndefined();
  first.resolve();
  await blocked;
});
