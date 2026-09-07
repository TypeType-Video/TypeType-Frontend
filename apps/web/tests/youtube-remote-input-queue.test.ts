import { describe, expect, test } from "bun:test";
import type { YoutubeRemoteInput } from "../src/hooks/use-youtube-remote-browser";
import {
  createYoutubeRemoteInputQueue,
  POINTER_MOVE_BATCH_MS,
} from "../src/lib/youtube-remote-input-queue";

const move = (x: number): YoutubeRemoteInput => ({
  type: "pointer",
  event: "move",
  x,
  y: 12,
  button: "left",
});

describe("YouTube remote input queue", () => {
  test("coalesces pointer moves and sends the latest sample", () => {
    const sent: YoutubeRemoteInput[] = [];
    let scheduled: (() => void) | null = null;
    const queue = createYoutubeRemoteInputQueue({
      canSend: () => true,
      sendImmediate: (message) => {
        sent.push(message);
        return true;
      },
      schedule: (callback, delayMs) => {
        expect(delayMs).toBe(POINTER_MOVE_BATCH_MS);
        scheduled = callback;
        return 1;
      },
      cancel: () => undefined,
    });

    queue.send(move(10));
    queue.send(move(20));
    expect(sent).toEqual([]);
    scheduled?.();
    expect(sent).toEqual([move(20)]);
  });

  test("flushes a move before a terminal input", () => {
    const sent: YoutubeRemoteInput[] = [];
    const queue = createYoutubeRemoteInputQueue({
      canSend: () => true,
      sendImmediate: (message) => {
        sent.push(message);
        return true;
      },
      schedule: () => 1,
      cancel: () => undefined,
    });

    queue.send(move(42));
    queue.send({ type: "key", event: "down", key: "Enter", code: "Enter", modifiers: [] });
    expect(sent.map((message) => (message.type === "pointer" ? message.x : message.type))).toEqual([
      42,
      "key",
    ]);
  });

  test("sends moves immediately while disconnected", () => {
    const sent: YoutubeRemoteInput[] = [];
    let scheduled = false;
    const queue = createYoutubeRemoteInputQueue({
      canSend: () => false,
      sendImmediate: (message) => {
        sent.push(message);
        return true;
      },
      schedule: () => {
        scheduled = true;
        return 1;
      },
      cancel: () => undefined,
    });

    queue.send(move(7));
    expect(sent).toEqual([move(7)]);
    expect(scheduled).toBe(false);
  });

  test("reset drops a pending move and cancels its timer", () => {
    const sent: YoutubeRemoteInput[] = [];
    let cancelled = false;
    const queue = createYoutubeRemoteInputQueue({
      canSend: () => true,
      sendImmediate: (message) => {
        sent.push(message);
        return true;
      },
      schedule: () => 1,
      cancel: () => {
        cancelled = true;
      },
    });

    queue.send(move(99));
    queue.reset();
    queue.flush();
    expect(sent).toEqual([]);
    expect(cancelled).toBe(true);
  });
});
